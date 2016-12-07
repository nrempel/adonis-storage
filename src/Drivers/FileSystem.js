/*

Driver for local file system

*/

const fs = require('mz/fs')

class FileSystem {

  static get inject () {
    return ['Helpers']
  }

  constructor (Helpers) {
    this.Helpers = Helpers
  }

  * exists (path, config) {
    try {
      yield fs.access(`${this.Helpers.storagePath()}/${path}`)
      return true
    } catch (e) {
      if (e.code === 'ENOENT') return false
      throw e
    }
  }

  * get (path, config) {
    console.log('get', path)
  }

  * put (path, contents, config) {
    console.log('put', path)
  }

}

module.exports = FileSystem
