module.exports = class DeepData {

  static getDeep(data, name, fallback = null) {
    const splits = name.split('.');

    for (const split of splits) {
      if (data === undefined) return fallback;
      data = data[split];
    }
    return (data === undefined ? fallback : data);
  }

  static setDeep(data, name, value) {
    const splits = name.split('.');
    const last = splits.pop();

    for (const split of splits) {
      if (data[split] === undefined) data[split] = {};
      data = data[split];
    }
    data[last] = value;
  }

  static removeDeep(data, name) {
    const splits = name.split('.');
    const last = splits.pop();

    for (const split of splits) {
      if (data[split] === undefined) data[split] = {};
      data = data[split];
    }
    delete data[last];
  }

  static removeDeepRecursive(data, name) {
    const original = data;
    const splits = name.split('.');
    const last = splits.pop();

    for (const split of splits) {
      if (data[split] === undefined) data[split] = {};
      data = data[split];
    }
    delete data[last];

    if (Object.keys(data).length === 0 && splits.length) {
      this.removeDeepRecursive(original, splits.join('.'));
    }
  }

  /**
   * @param {object} data
   * @param {object} values
   * @returns {object}
   */
  static mergeDeep(data, values) {
    for (const key in values) {
      if (typeof values[key] === 'object') {
        data[key] = data[key] || {};
        data[key] = DeepData.mergeDeep(data[key], values[key]);
      } else {
        data[key] = values[key];
      }
    }
    return data;
  }

}
