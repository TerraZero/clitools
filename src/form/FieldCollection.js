const Inquirer = require('inquirer');

const FieldLike = require('./FieldLike');
const Field = require('./Field');

module.exports = class FieldCollection extends FieldLike {

  /**
   * @param {import('./Form')} form
   * @param {string} name
   */
  constructor(form, name) {
    super(form, name, 'fieldcollection');
    this._fields = {};
    this._title = null;
  }

  /**
   * @returns {Object<string, import('./FieldLike')>}
   */
  get fields() {
    return this._fields;
  }

  /**
   * @param {string} title
   * @returns {this}
   */
  title(title) {
    this._title = title;
    return this;
  }

  /**
   * @param {string} name
   * @param {string} type
   * @returns {import('./Field')}
   */
  field(name, type = null) {
    this._fields[name] = new Field(this.form, name, type);
    return this._fields[name];
  }

  /**
   * @param {string} name
   * @param {string} title
   * @returns {FieldCollection}
   */
  collection(name, title = null) {
    this._fields[name] = new FieldCollection(this.form, name);
    return this._fields[name].title(title);
  }

  async execute(values) {
    const array = [];

    if (this.options.repeat) {
      let result = null;
      const array = [];

      do {
        result = await Inquirer.prompt({
          name: 'confirm',
          message: 'Create new ' + (this.define.message || this._title || this.define.name),
          type: 'confirm',
        });

        if (!result.confirm) {
          break;
        }

        array.push(await this.doExecute(values));
      } while (result.confirm);

      values[this.define.name] = array;
    } else {
      const collection = await this.doExecute(values);

      if (this.form.options.flatten) {
        for (const key in collection) {
          values[this.define.name + '.' + key] = collection[key];
        }
      } else {
        values[this.define.name] = collection;
      }
    }
    return values;
  }

  async doExecute(values) {
    if (this._title !== null) {
      this.form.logger.underline(this._title);
    }
    const collection = {};
    for (const field in this.fields) {
      await this.fields[field].execute(collection);
    }
    return collection;
  }

}
