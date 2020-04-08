/**
 * @typedef T_FormOptions
 * @property {boolean} flatten
 */

const Field = require('./Field');
const FieldCollection = require('./FieldCollection');
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
    this._logger = parent.create('form');
    this._options = {
      flatten: false,
    };
    this._bag = {};
  }

  /**
   * @returns {import('../logging/Logger')}
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
   * @returns {Object<string, import('./FieldLike')>}
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
   * @returns {T_FormOptions}
   */
  get options() {
    return this._options;
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
   * @param {string} type
   * @returns {import('./Field')}
   */
  field(name, type = null) {
    this._fields[name] = new Field(this, name, type);
    return this._fields[name];
  }

  /**
   * @param {string} name
   * @param {string} title
   * @returns {import('./FieldCollection')}
   */
  collection(name, title = null) {
    this._fields[name] = new FieldCollection(this, name);
    return this._fields[name].title(title);
  }

  /**
   * @returns {Promise<Object<string, (string|object)>>}
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
      await this.fields[field].execute(this._values);
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
