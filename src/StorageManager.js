'use strict'

/*
|--------------------------------------------------------------------------
|                                 SINGLETON
|--------------------------------------------------------------------------
*/
const Drivers = require('./Drivers')
const Ioc = require('adonis-fold').Ioc
const CE = require('./Exceptions')
const Storage = require('./Storage')

const extendedDrivers = {}

/**
 * @note make sure it is singleton
 * inside Ioc container
 * @class
 */
class StorageManager {

  /**
   * requried by ioc container to let outside
   * world extend the storage provider.
   *
   * @method extend
   *
   * @param  {String} key
   * @param  {Mixed} value
   *
   * @public
   */
  static extend (key, value) {
    extendedDrivers[key] = value
  }

  /**
   * creates a new driver instance, by finding in shipped
   * drivers or looking inside extended drivers.
   *
   * @method _makeDriverInstance
   *
   * @param  {String}            driver
   * @return {Object}
   *
   * @private
   */
  _makeDriverInstance (driver) {
    driver = driver === 'default' ? this.config.get('storage.driver') : driver
    const driverInstance = Drivers[driver] ? Ioc.make(Drivers[driver]) : extendedDrivers[driver]
    if (!driverInstance) {
      throw CE.RuntimeException.invalidStorageDriver(driver)
    }
    return driverInstance
  }

  /**
   * returns a new connection for a given driver, if connection
   * was created earlier, it will be returned instead of a
   * new connection.
   *
   * @param  {String} driver
   * @return {Object}
   *
   * @example
   * Storage.driver('local')
   * Storage.driver('s3')
   *
   * @public
   */
  driver (driver) {
    if (!this.driversPool[driver]) {
      const driverInstance = this._makeDriverInstance(driver)
      this.driversPool[driver] = driverInstance
    }
    return new Storage(this.driversPool[driver])
  }

  /**
   * class constructor
   */
  constructor (Config) {
    this.config = Config
    this.driversPool = {}

    /**
     * here we spoof methods on the storage class, which means if
     * any of these methods are called, we will initiate the
     * storage class and will execute method on the created
     * instance instead of this class.
     */
    const methodsToSpoof = [
      'exists',
      'get',
      'put',
      'url',
      'size',
      'lastModified'
    ]

    methodsToSpoof.forEach((method) => {
      this[method] = function () {
        const instance = this.driver('default')
        return instance[method].apply(instance, arguments)
      }.bind(this)
    })
  }
}

module.exports = StorageManager
