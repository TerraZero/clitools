const Colors = require('colors/safe');

module.exports = class Logger {

  static get LEVEL_ERROR() { return 2; }
  static get LEVEL_WARNING() { return 4; }
  static get LEVEL_LOG() { return 8; }
  static get LEVEL_INFO() { return 128; }

  static get debug() { return process.argv.includes('--debug'); }
  static get plain() { return process.argv.includes('--plain') && !this.debug; }
  static get defaultLevel() { return this.__defaultLevel || (Logger.LEVEL_ERROR | Logger.LEVEL_WARNING | Logger.LEVEL_LOG); }
  static set defaultLevel(value) { this.__defaultLevel = value; }

  /**
   * @param {string} channel
   * @param {Logger} parent
   * @param {number} level
   */
  constructor(channel, parent = null, level = null) {
    this._channel = channel;
    this._parent = parent;

    if (level !== null) {
      this._level = level;
    } else if (this._parent !== null) {
      this._level = this._parent.level;
    } else {
      this._level = Logger.defaultLevel;
    }
  }

  /**
   * @returns {string}
   */
  get channel() {
    return this._channel;
  }

  /**
   * @returns {(Logger|null)}
   */
  get parent() {
    return this._parent;
  }

  /**
   * @returns {number}
   */
  get level() {
    return this._level;
  }

  create(channel, level = null) {
    return new Logger(channel, this, level);
  }

  /**
   * @param {number} level
   * @returns {number}
   */
  setLevel(level = Logger.LEVEL_ERROR | Logger.LEVEL_WARNING) {
    const before = this._level;
    this._level = level;
    return before;
  }

  /**
   * @param {number} level
   * @param {number} compare
   * @returns {Boolean}
   */
  isLevel(level, compare) {
    return Logger.debug || (level & compare) !== 0;
  }

  /**
   * @returns {string}
   */
  getDescriptor() {
    if (this.parent === null) {
      return this.channel;
    } else {
      return this.parent.getDescriptor() + '>' + this.channel;
    }
  }

  /**
   * @param {string} message
   * @param {Object<string, string>} placeholders
   * @param {*} color
   * @returns {string}
   */
  replacer(message = '', placeholders = {}, color = null) {
    color = color || Colors.cyan;
    for (const name in placeholders) {
      message = message.replace(new RegExp('\\[:' + name + '\\]', 'g'), color.call(Colors, '"' + placeholders[name] + '"'));
      message = message.replace(new RegExp('\\[' + name + '\\]', 'g'), color.call(Colors, placeholders[name]));
    }
    return message;
  }

  /**
   * @param {string} message
   * @param {Object<string, string>} placeholders
   * @param {number} level
   * @param {*} color
   * @param {Boolean} descriptor
   */
  print(message, placeholders = {}, level = Logger.LEVEL_INFO, color = null, descriptor = true) {
    if (!this.isLevel(level, this.level)) return;

    const logs = [];
    if (descriptor || Logger.debug) {
      if (color === null) {
        logs.push(this.getDescriptor() + ':');
      } else {
        logs.push(color.call(Colors, this.getDescriptor() + ':'));
      }
    }
    logs.push(this.replacer(message, placeholders));

    console.log.apply(console, logs);
  }

  /**
   * @param {Error} error
   * @param {string} message
   * @param {Object<string, string>} placeholders
   */
  err(error, message = null, placeholders = {}) {
    this.print(Colors.red(error.name + ': ') + error.message, {}, Logger.LEVEL_ERROR, Colors.red, false);
    if (message !== null) {
      this.error(message, placeholders);
    }
  }

  /**
   * @param {string} message
   * @param {Object<string, string>} placeholders
   */
  error(message, placeholders = {}) {
    this.print(message, placeholders, Logger.LEVEL_ERROR, Colors.red);
  }

  /**
   * @param {string} message
   * @param {Object<string, string>} placeholders
   */
  warning(message, placeholders = {}) {
    this.print(message, placeholders, Logger.LEVEL_WARNING, Colors.yellow);
  }

  /**
   * @param {string} message
   */
  underline(message) {
    if (!Logger.plain) {
      this.print(Colors.underline(message), {}, Logger.LEVEL_LOG, null, false);
    }
  }

  /**
   * @param {string[]} list
   */
  list(list) {
    for (const line of list) {
      if (Logger.plain) {
        this.log(line);
      } else {
        this.log('• ' + line);
      }
    }
  }

  /**
   * @param {string} message
   * @param {Object<string, string>} placeholders
   */
  failed(message, placeholders = {}) {
    if (Logger.plain) {
      this.log(message, placeholders);
    } else {
      this.log(Colors.red('✘ ') + message, placeholders);
    }
  }

  /**
   * @param {string} message
   * @param {Object<string, string>} placeholders
   */
  success(message, placeholders = {}) {
    if (Logger.plain) {
      this.log(message, placeholders);
    } else {
      this.log(Colors.green('✓ ') + message, placeholders);
    }
  }

  /**
   * @param {object} data
   */
  data(data) {
    this.log(JSON.stringify(data, null, 2));
  }

  /**
   * @param {string} message
   * @param {Object<string, string>} placeholders
   */
  log(message, placeholders = {}) {
    if (Logger.plain && !message) return;
    this.print(message, placeholders, Logger.LEVEL_LOG, null, false);
  }

  /**
   * @param {string} message
   * @param {Object<string, string>} placeholders
   */
  info(message, placeholders = {}) {
    this.print(message, placeholders, Logger.LEVEL_INFO, Colors.magenta);
  }

  /**
   * @param {string} message
   * @param {Object<string, string>} placeholders
   */
  debug(message, placeholders = {}) {
    this.print(message, placeholders, 0, Colors.blue);
  }

}
