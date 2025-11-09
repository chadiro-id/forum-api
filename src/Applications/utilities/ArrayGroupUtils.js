const ArrayGroupUtils = {
  /**
   * Mengubah array objek menjadi object yang dikelompokkan berdasarkan kunci.
   * @param {Array<Object>} array Array yang ingin dikelompokan
   * @param {string} key Properti yang digunakan untuk pengelompokan
   * @returns {Object} Objek yang sudah dikelompokan
   */
  groupToObjectBy(array, key) {
    return array.reduce((acc, item) => {
      const groupKey = item[key];
      (acc[groupKey] ||= []).push(item);
      return acc;
    }, {});
  }
};

module.exports = ArrayGroupUtils;