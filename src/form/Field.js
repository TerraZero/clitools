/**
 * @typedef T_Choice
 * @param {string} name
 * @param {string} value
 */

module.exports = class Field {

  /**
   * @param {import('./Form')} form
   * @param {string} name
   */
  constructor(form, name) {
    this._form = form;
    this._define = { name };
    this._validates = [];
    this._filters = [];
    this._fallback = null;
  }

  get define() {
    if (typeof this._define.type !== 'string') {
      throw new Error('The field ' + this._define.name + ' has no type.');
    }
    return this._define;
  }

  /**
   * @returns {import('./Form')}
   */
  get form() {
    return this._form;
  }

  /**
   * @param {string} type
   * @returns {this}
   */
  type(type) {
    this._define.type = type;
    return this;
  }

  /**
   * @param {(string|function)} message
   * @param {object<string, string>} placeholders only for type message
   * @returns {this}
   */
  message(message, placeholders = {}) {
    this._define.message = message;
    this._define.placeholders = placeholders;
    return this;
  }

  /**
   * @param {any} fallback
   * @returns {this}
   */
  fallback(fallback) {
    if (typeof fallback === 'function') {
      this._define.default = this.doFallback.bind(this);
      this._fallback = fallback;
    } else {
      this._define.default = fallback;
    }
    return this;
  }

  /**
   * @param {(number[]|string[]|T_Choice[]|function)} choices
   * @returns {this}
   */
  choices(choices) {
    this._define.choices = choices;
    return this;
  }

  /**
   * @param {Function} validate
   * @returns {this}
   */
  validate(validate) {
    this._define.validate = this.doValidate.bind(this);
    this._validates.push(validate);
    return this;
  }

  /**
   * @param {Function} filter
   * @returns {this}
   */
  filter(filter) {
    this._define.filter = this.doFilter.bind(this);
    this._filters.push(filter);
    return this;
  }

  /**
   * @param {string} type
   * @returns {this}
   */
  convert(type) {
    return this.validate((value) => {
      try {
        this._form.converter.transform(type + ':' + value);
        return true;
      } catch (e) {
        return 'Please insert a valid ' + type + ' value';
      }
    }).filter((value) => {
      try {
        return this._form.converter.transform(type + ':' + value);
      } catch (e) {
        return value;
      }
    });
  }

  /**
   * @returns {this}
   */
  required() {
    return this.validate((value, field) => {
      if (value === '') {
        return 'The field ' + field.define.name + ' is required.';
      }
      return true;
    });
  }

  /**
   * @param {string} value
   */
  doValidate(value) {
    for (const validate of this._validates) {
      const result = validate(value, this);

      if (typeof result === 'string') {
        return result;
      }
    }
    return true;
  }

  /**
   * @param {string} value
   */
  doFilter(value) {
    for (const filter of this._filters) {
      value = filter(value, this);
    }
    return value;
  }

  /**
   * @returns {any}
   */
  doFallback() {
    return this._fallback(this);
  }

}
