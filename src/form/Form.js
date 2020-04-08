const Inquirer = require('inquirer');

const Field = require('./Field');
const DeepData = require('../data/DeepData');
const Converter = require('../data/Converter');

module.exports = class Form {

  /**
   * @param {import('../logging/Logger')} parent
   */
  constructor(parent) {
    this._fields = {};
    this._values = null;
    this._converter = null;
    this._logger = parent.logger.create('form');
    this._options = {
      flatten: false,
    };
    this._bag = {};
  }

  /**
   * @returns {import('../io/Logger')}
   */
  get logger() {
    return this._logger;
  }

  /**
   * @returns {import('./Converter')}
   */
  get converter() {
    if (this._converter === null) {
      this._converter = new Converter(this.logger);
      this._converter.logger.setLevel(0);
    }
    return this._converter;
  }

  /**
   * @returns {Object<string, import('./Field')>}
   */
  get fields() {
    return this._fields;
  }

  /**
   * @returns {object<string, (string|number)>}
   */
  get values() {
    return this._values;
  }

  /**
   * @param {string} field
   * @param {any} fallback
   * @returns {any}
   */
  get(field, fallback) {
    return DeepData.getDeep(this._bag, field, fallback);
  }

  /**
   * @param {string} field
   * @param {any} value
   * @returns {this}
   */
  set(field, value) {
    DeepData.setDeep(this._bag, field, value);
    return this;
  }

  /**
   * @param {boolean} value
   * @returns {this}
   */
  flatten(value = true) {
    this._options.flatten = value;
    return this;
  }

  /**
   * @param {string} name
   * @returns {import('./Field')}
   */
  field(name) {
    this._fields[name] = new Field(this, name);
    return this._fields[name];
  }

  /**
   * @returns {Promise<Object<string, string>>}
   */
  async execute() {
    if (this._values === null) {
      await this.doExecute();
    }
    return this._values;
  }

  /**
   * @returns {Promise}
   */
  async doExecute() {
    this._values = {};
    for (const field in this.fields) {
      const define = this.fields[field].define;

      if (define.type === 'message') {
        this.logger.log(define.message, define.placeholders);
      } else {
        const result = await Inquirer.prompt(define);

        if (this._options.flatten) {
          this._values[define.name] = Reflection.getDeep(result, define.name);
        } else {
          DeepData.setDeep(this._values, define.name, Reflection.getDeep(result, define.name));
        }
      }
    }
  }

  /**
   * @returns {this}
   */
  reset() {
    this._values = null;
    return this;
  }

}
