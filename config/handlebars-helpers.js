module.exports = {
  ifCond: function (a, b, options) {
    if (a == b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  toJson: function (obj) {
    return JSON.stringify(obj, null, 4)
  }
}