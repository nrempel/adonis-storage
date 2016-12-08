/*

Driver for local file system

*/

const CE = require('../Exceptions')
const fs = require('mz/fs')
const path = require('path')
const isStream = require('is-stream')
const mkdirp = require('mkdirp-promise')
const promiseStream = require('stream-to-promise')

class FileSystem {

  static get inject () {
    return ['Helpers']
  }

  constructor (Helpers) {
    this.Helpers = Helpers
  }

  /**
   * Takes a relative path and returns a fully qualified path
   */
  _fullPath (relativePath) {
    return path.join(this.Helpers.storagePath(), relativePath)
  }

  /**
   * Checks if the file exists. Returns a boolean.
   */
  * exists (path, config) {
    try {
      yield fs.access(this._fullPath(path))
      return true
    } catch (e) {
      if (e.code === 'ENOENT') return false
      throw e
    }
  }

  /**
   * Get the contents of the file at the specified path. Returns a Buffer.
   */
  * get (path, config) {
    try {
      return yield fs.readFile(this._fullPath(path))
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw CE.RuntimeException.fileNotFound(path, 404)
      }
      throw e
    }
  }

  /**
   * Get the contents of the file at the specified path. Returns a Stream.
   */
  * getStream (path, config) {
    return fs.createReadStream(this._fullPath(path))
  }

  /**
   * Write contents to a file at `path`.
   */
  * put (path, contents, config) {
    const fullPath = this._fullPath(path)
    // Create directory if needed
    const pathWithoutFilename = fullPath.slice(0, fullPath.lastIndexOf('/'))
    yield mkdirp(pathWithoutFilename)

    return new Promise((resolve, reject) => {
      // Open a read stream
      const wstream = fs.createWriteStream(fullPath)
      // Catch errors and return
      wstream.on('error', (e) => {
        wstream.end()
        reject(e)
      })
      // Return path if successful
      wstream.on('finish', () => {
        resolve(fullPath)
      })

      // If contents is a stream, we can pipe to the file
      if (isStream.readable(contents)) {
        // If the readable stream throws an error, the writeable stream
        // must be closed manually.
        // https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
        contents.on('error', (e) => {
          wstream.end()
          reject(e)
        })
        contents.pipe(wstream)
      } else {
        // If it's not a stream, we write the contents (buffer or string)
        wstream.end(contents)
      }
    })
  }

  /**
   * Returns the absolute path
   */
  * url (path) {
    return this._fullPath(path)
  }

}

module.exports = FileSystem
