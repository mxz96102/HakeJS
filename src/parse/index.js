// /{{[^(?!.*{{)]*}}/g test{{}}

const singleTag = /area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr/;
const syntax = / |\+|-|\*|\/|%|=|\||&|\n|{|}|<|>|\^|!|\?|:|,|;|~|\[|]/;

// Lazy Easy DOM parser

function parseDOM(str) {
  let el = document.createElement('div');

  el.innerHTML = str;
  return el.childNodes[0];
}

function readTag(startIndex, str) {
  let res = '', i;

  for (i = startIndex; str[i] !== ' ' && str[i] !== '{' && str[i] !== '('; i += 1) {
    res += str[i];
  }

  return {tag: res, end: str[i]} || false;
}

function parseHake(str) {
  let res = '', nowTag = [], tmpTag, inString = '';

  for (let i = 0; str[i]; i++) {
    switch (str[i]) {
      case '(':
        nowTag.push(readTag(i + 1, str));
        if (nowTag[nowTag.length - 1].end === ' ') {
          res += '<' + nowTag[nowTag.length - 1].tag + '>';
          i += nowTag[nowTag.length - 1].tag.length + 1;
        } else if (nowTag[nowTag.length - 1].end === '(') {
          res += '<' + nowTag[nowTag.length - 1].tag + '>';
          i += nowTag[nowTag.length - 1].tag.length;
        } else res += '<';
        break;
      case ')':
        tmpTag = nowTag.pop();
        res += singleTag.test(tmpTag.tag) ? '/>' : ('<\/' + tmpTag.tag + '>');
        break;
      case '"':
        if (inString === '"') {
          inString = '';
        } else if (!inString) {
          inString = '"';
        }
        res += str[i];
        break;
      case '\'':
        if (inString === '\'') {
          inString = '';
        } else if (!inString) {
          inString = '\'';
        }
        res += str[i];
        break;
      case '{':
        if (!inString) {
          if (str[i + 1] === '{') {
            i++;
            res += '{{';
          } else {
            res += ' ';
          }
        } else res += str[i];
        break;
      case '}':
        if (!inString) {
          if (str[i + 1] === '}') {
            i++;
            res += '}}';
          } else {
            if (nowTag[nowTag.length - 1].end === '{') {
              res += '>';
              i++;
            } else {
              res += ' ';
            }
          }
        } else res += str[i];
        break;
      case '\\':
        str[i] === '(' || str === ')' || i++;
        res += str[i];
        break;
      default:
        res += str[i];
        break;
    }
  }

  return parseDOM(res);
}

function DataBlock(str) {
  this.origin = str;
  this.generate = Function('return ' + str);
  this.related = [];

  let tmp = '';

  for (let i = 0; str[i]; i += 1) {
    if (!syntax.test(str[i])) {
      tmp += str[i];
    } else if (str[i] === '/' && str[i + 1] === '/') {
      while (str[i] !== '\n') {
        i++;
      }
    } else {
      tmp || this.related.push(tmp);
      tmp = '';
    }
  }
}

function parseData(str) {
  let res = [], tmp = '';

  for (let i = 0; str[i]; i += 1) {
    if (str[i] === '{' && str[i + 1] === '{') {
      tmp || res.push(tmp);
      tmp = '';
      i++;
    } else if (str[i] === '}' && str[i + 1] === '}') {
      tmp || res.push(new DataBlock(tmp));
      tmp = '';
      i++;
    } else tmp += str[i];
  }

  return str;
}

let parse = {
  parseDOM, parseData, parseHake
};

export default parse;