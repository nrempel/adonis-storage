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
   * creates a new disk instance, by finding in shipped
   * drivers or looking inside extended drivers.
   *
   * @method _makeDriverInstance
   *
   * @param  {String} disk
   * @return {Object}
   *
   * @private
   */
  _makeDriverInstance (disk) {
    disk = disk === 'default' ? this.config.get('storage.disk') : disk
    const diskConfig = this.config.get(`storage.disks.${disk}`)
    const driver = diskConfig.driver
    const driverInstance = Drivers[driver] ? Ioc.make(Drivers[driver]) : extendedDrivers[driver]
    if (!driverInstance) {
      throw CE.RuntimeException.invalidStorageDriver(driver)
    }
    if (typeof driverInstance.init === 'function') driverInstance.init(diskConfig)
    return driverInstance
  }

  /**
   * returns a reference to a given disk, if connection
   * was created earlier, it will be returned instead of a
   * new reference.
   *
   * @param  {String} disk
   * @return {Object}
   *
   * @example
   * Storage.disk('local')
   * Storage.disk('s3')
   *
   * @public
   */
  disk (disk) {
    if (!this.diskPool[disk]) {
      const driverInstance = this._makeDriverInstance(disk)
      this.diskPool[disk] = driverInstance
    }
    return new Storage(this.diskPool[disk])
  }

  /**
   * class constructor
   */
  constructor (Config) {
    this.config = Config
    this.diskPool = {}

    /**
     * here we spoof methods on the storage class, which means if
     * any of these methods are called, we will initiate the
     * storage class and will execute method on the created
     * instance instead of this class.
     */
    const methodsToSpoof = [
      'exists',
      'get',
      'getStream',
      'put',
      'putFile',
      'putFileAs',
      'url'
    ]

    methodsToSpoof.forEach((method) => {
      this[method] = function () {
        const instance = this.disk('default')
        return instance[method].apply(instance, arguments)
      }.bind(this)
    })
  }
}

module.exports = StorageManager
