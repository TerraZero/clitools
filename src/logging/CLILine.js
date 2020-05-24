const Logger = require('./Logger');

module.exports = class CLILine {

  constructor(markup) {
    this._markup = markup;
    this._parts = [];
    this._fill = ' ';
    this._ellipsis = '…';

    this.parse(markup);
  }

  parse(markup) {
    const parts = markup.split(/[\{\}]/);
    this._parts = [];
    
    for (let i = 0; i < parts.length; i++) {
      const item  = {
        value: parts[i],
        max: parts[i].length,
        min: parts[i].length,
        equal: null,
      };
      if (i % 2 !== 0) {
        const split = item.value.split(/[<>=]/);

        if (split.length === 1) {
          item.max = null;
          item.min = null;
        } else if (split.length === 2) {
          switch (item.value.substring(split[0].length, split[0].length + 1)) {
            case '<':
              item.max = Number.parseInt(split[1]);
              item.min = null;
              break;
            case '>':
              item.max = null;
              item.min = Number.parseInt(split[1]);
              break;
            case '=':
              item.equal = Number.parseInt(split[1]);
            default:
              item.max = null;
              item.min = null;
              break;
          }
          item.value = split[0];
        }
      }
      this._parts.push(item);
    }
  }

  format(placeholders) {
    const target = [];
    for (let i = 0; i < this._parts.length; i++) {
      if (i % 2 === 0) {
        target.push(this._parts[i].value);
      } else {
        if (placeholders[this._parts[i].value] !== undefined) {
          target.push(placeholders[this._parts[i].value]);
        } else {
          target.push('');
        }
        if (this._parts[i].min !== null && this._parts[i].min > target[target.length - 1].length) {
          target[target.length - 1] += this._fill.repeat(this._parts[i].min - target[target.length - 1].length);
        }
      } 
    }

    let spare = this.getLength(target) - Logger.CLI_WIDTH;

    for (let i = 0; i < target.length; i++) {
      if (spare <= 0) return target.join('');
      if (this._parts[i].max !== null && this._parts[i].max < target[i].length) {
        const diff = Math.min(spare, target[i].length - this._parts[i].max);
        target[i] = target[i].substring(0, target[i].length - diff - this._ellipsis.length) + this._ellipsis;
        spare -= diff;
      }
    }
    return target.join('');
  }

  getLength(target) {
    let length = 0;

    for (let i = 0; i < target.length; i++) {
      if (this._parts[i].equal) {
        length += this._parts[i].equal;
      } else {
        length += target[i].length;
      }
    }
    return length;
  }

}