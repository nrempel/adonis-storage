'use strict'

const ServiceProvider = require('adonis-fold').ServiceProvider

class StorageProvider extends ServiceProvider {

  * register () {
    const StorageManager = require('../src/StorageManager')
    this.app.singleton('Adonis/Addons/Storage', function (app) {
      const Config = app.use('Adonis/Src/Config')
      return new StorageManager(Config)
    })
    this.app.manager('Adonis/Addons/Storage', StorageManager)
  }

}

module.exports = StorageProvider
