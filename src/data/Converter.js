module.exports = class Converter {

  /**
   * @param {import('../logging/Logger')} parent
   */
  constructor(parent) {
    this._logger = parent.create('input');
  }

  /**
   * @returns {import('../logging/Logger')}
   */
  get logger() {
    return this._logger;
  }

  transform(value = '') {
    const lower = value.toLowerCase();

    // check defined types
    if (lower.split(':').length > 1) {
      let [type, ...prevalue] = lower.split(':');
      prevalue = prevalue.join(':');

      this.logger.info('Detect pre defined type [:type] with value [:prevalue]. Try to parse input...', { type, prevalue });

      switch (type) {
        case 'null':
          return null;
        case 'bool':
        case 'boolean':
          if (this.checkTrue(prevalue)) {
            return true;
          }
          if (this.checkFalse(prevalue)) {
            return false;
          }
          this.logger.info('Detect pre defined boolean type but can not convert.');
          throw new Error('Detect pre defined boolean type but can not convert.');
        case 'int':
          if (this.checkInt(prevalue)) {
            return Number.parseInt(prevalue);
          }
          this.logger.info('Detect pre defined int type but can not convert.');
          throw new Error('Detect pre defined int type but can not convert.');
        case 'float':
          if (this.checkFloat(prevalue)) {
            return Number.parseFloat(prevalue);
          }
          this.logger.info('Detect pre defined float type but can not convert.');
          throw new Error('Detect pre defined float type but can not convert.');
        case 'array':
          return prevalue.split(',').map((v) => v.trim());
        case 'json':
          if (this.checkJSON(prevalue)) {
            return JSON.parse(prevalue);
          }
          this.logger.info('Detect pre defined json type but can not convert.');
          throw new Error('Detect pre defined json type but can not convert.');
        case 'string':
          return prevalue;
        default:
          this.logger.info('Detect unknown pre defined type [:type]', { type });
          throw new Error('Detect unknown pre defined type.');
      }
    }

    // check null
    if (this.checkNull(lower, true)) {
      this.logger.info('Auto-detect type null for value [:value]', { value });
      return null;
    }

    // check boolean
    if (this.checkTrue(lower, true)) {
      this.logger.info('Auto-detect type boolean for value [:value]', { value });
      return true;
    }
    if (this.checkFalse(lower, true)) {
      this.logger.info('Auto-detect type boolean for value [:value]', { value });
      return false;
    }

    // check int
    if (this.checkInt(value)) {
      this.logger.info('Auto-detect type integer for value [:value]', { value });
      return Number.parseInt(value);
    }

    // check float
    if (this.checkFloat(value)) {
      this.logger.info('Auto-detect type integer for value [:value]', { value });
      return Number.parseFloat(value);
    }

    // check array
    if (this.checkArray(value)) {
      this.logger.info('Auto-detect type array for value [:value]', { value });

      const array = value.split(',').map((v) => v.trim());
      for (const index in array) {
        array[index] = this.transform(array[index]);
      }
      return array;
    }

    this.logger.info('Auto-detect nothing for value [:value]. So use it as string.', { value });
    return value;
  }

  checkNull(value, strict = false) {
    if (strict) {
      return ['null', '', 'undefined'].includes(value);
    } else {
      return ['null', '', '0', 'undefined'].includes(value);
    }
  }

  checkTrue(value, strict = false) {
    if (strict) {
      return ['y', 'j', 'true'].includes(value);
    } else {
      return ['y', 'j', 'true', '1'].includes(value);
    }
  }

  checkFalse(value, strict = false) {
    if (strict) {
      return ['n', 'false'].includes(value);
    } else {
      return ['n', 'false', '0'].includes(value);
    }
  }

  checkInt(value) {
    return value + '' === Number.parseInt(value) + '';
  }

  checkFloat(value) {
    return value + '' === Number.parseFloat(value) + '';
  }

  checkArray(value) {
    return value.indexOf(',') !== -1;
  }

  checkJSON(value, strict = false) {
    try {
      const json = JSON.parse(value);


      if (strict) {
        return typeof json === 'object';
      } else {
        return true;
      }
    } catch (e) {
      this.logger.debug(e.message);
    }
    return false;
  }

}
