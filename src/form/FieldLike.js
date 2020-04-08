/**
 * @typedef T_FieldDefine
 * @property {string} type Type of the prompt. Defaults: input - Possible values: input, number, confirm, list, rawlist, expand, checkbox, password, editor
 * @property {string} name The name to use when storing the answer in the answers hash. If the name contains periods, it will define a path in the answers hash.
 * @property {(string|function)} message The question to print. If defined as a function, the first parameter will be the current inquirer session answers. Defaults to the value of name (followed by a colon).
 * @property {(string|number|boolean|array|function)} default Default value(s) to use if nothing is entered, or a function that returns the default value(s). If defined as a function, the first parameter will be the current inquirer session answers.
 * @property {(string[]|function)} choices Choices array or a function returning a choices array. If defined as a function, the first parameter will be the current inquirer session answers. Array values can be simple numbers, strings, or objects containing a name (to display in list), a value (to save in the answers hash) and a short (to display after selection) properties. The choices array can also contain a Separator.
 * @property {function} validate Receive the user input and answers hash. Should return true if the value is valid, and an error message (String) otherwise. If false is returned, a default error message is provided.
 * @property {function} filter Receive the user input and return the filtered value to be used inside the program. The value returned will be added to the Answers hash.
 * @property {function} transformer Receive the user input, answers hash and option flags, and return a transformed value to display to the user. The transformation only impacts what is shown while editing. It does not modify the answers hash.
 * @property {(function|boolean)} when Receive the current user answers hash and should return true or false depending on whether or not this question should be asked. The value can also be a simple boolean.
 * @property {number} pageSize Change the number of lines that will be rendered when using list, rawList, expand or checkbox.
 * @property {string} prefix Change the default prefix message.
 * @property {string} suffix Change the default suffix message.
 * @property {boolean} askAnswered Force to prompt the question if the answer already exists.
 */

/**
 * @typedef T_FieldOptions
 * @property {boolean} repeat
 */

const Inquirer = require('inquirer');

const DeepData = require('../data/DeepData');

module.exports = class FieldLike {

  /**
   * @param {import('./Form')} form
   * @param {string} name
   * @param {string} type
   */
  constructor(form, name, type = null) {
    this._form = form;
    this._define = { name, type };
    this._options = {
      repeat: false,
    };
  }

  /**
   * @returns {T_FieldDefine}
   */
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
   * @returns {T_FieldOptions}
   */
  get options() {
    return this._options;
  }

  async execute(values) {
    if (this.define.type === 'message') {
      this.form.logger.log(this.define.message, this.define.placeholders);
    } else {
      if (this.options.repeat) {
        const array = [];
        let result = null;

        do {
          result = await this.doExecute(values);
          if (result !== '') {
            array.push(result);
          }
        } while (result !== '');

        if (this.form.options.flatten) {
          values[this.define.name] = array;
        } else {
          DeepData.setDeep(values, this.define.name, array);
        }
      } else {
        const result = await this.doExecute(values);

        if (this.form.options.flatten) {
          values[this.define.name] = result;
        } else {
          DeepData.setDeep(values, this.define.name, result);
        }
      }
    }
  }

  async doExecute(values) {
    if (this.define.type === 'message') {
      this.form.logger.log(this.define.message, this.define.placeholders);
    } else {
      const result = await Inquirer.prompt(this.define);

      return DeepData.getDeep(result, this.define.name);
    }
  }

}
