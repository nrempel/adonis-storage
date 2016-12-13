/*

Driver for local file system

*/

const CE = require('../Exceptions')
const fs = require('mz/fs')
const path = require('path')
const isStream = require('is-stream')
const mkdirp = require('mkdirp')

class FileSystem {

  init (disk) {
    this.disk = disk
  }

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
    const basePath = this.disk.public ?
      `${this.Helpers.publicPath()}/storage` :
      this.Helpers.storagePath()
    return path.join(basePath, relativePath)
  }

  /**
   * Checks if the file exists. Returns a boolean.
   */
  * exists (path) {
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
  * get (path) {
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
  getStream (path) {
    return fs.createReadStream(this._fullPath(path))
  }

  /**
   * Write contents to a file at `path`.
   */
  put (path, contents) {
    const fullPath = this._fullPath(path)
    // Create directory if needed
    const pathWithoutFilename = fullPath.slice(0, fullPath.lastIndexOf('/'))

    return new Promise((resolve, reject) => {
      mkdirp(pathWithoutFilename, (err) => {
        if (err) return reject(err)
        // Open a read stream
        const wstream = fs.createWriteStream(fullPath)
        // Catch errors and return
        wstream.on('error', (e) => {
          wstream.end()
          return reject(e)
        })
        // Return path if successful
        wstream.on('finish', () => {
          return resolve(this.url(path))
        })

        // If contents is a stream, we can pipe to the file
        if (isStream.readable(contents)) {
          // If the readable stream throws an error, the writeable stream
          // must be closed manually.
          // https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
          contents.on('error', (e) => {
            wstream.end()
            return reject(e)
          })
          contents.pipe(wstream)
        } else {
          // If it's not a stream, we write the contents (buffer or string)
          wstream.end(contents)
        }
      })
    })
  }

  /**
   * Returns the absolute path
   */
  url (path) {
    const basePath = this.disk.public ? '/storage' : '/public/storage'
    return `${basePath}/${path}`
  }

}

module.exports = FileSystem
