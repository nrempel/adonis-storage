'use strict'

const NE = require('node-exceptions')

class RuntimeException extends NE.RuntimeException {
  /**
   * default error code to be used for raising
   * exceptions
   *
   * @return {Number}
   */
  static get defaultErrorCode () {
    return 500
  }

  /**
   * this exception is raised when an uknown
   * storage driver is used
   *
   * @param  {String} driver
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static invalidStorageDriver (driver, code) {
    return new this(`Unable to locate ${driver} storage driver`, code || this.defaultErrorCode, 'E_INVALID_STORAGE_DRIVER')
  }

}

module.exports = { RuntimeException }
