/*

Driver for S3

*/

const AWS = require('aws-sdk')
// const CE = require('../Exceptions')

class S3 {

  init (disk) {
    this.disk = disk
    this.s3 = new AWS.S3({
      accessKeyId: this.disk.key,
      secretAccessKey: this.disk.secret,
      region: this.disk.region
    })
  }

  /**
   * Checks if the file exists. Returns a boolean.
   */
  * exists (path) {
    return new Promise((resolve, reject) => {
      this.s3.headObject({
        Bucket: this.disk.bucket,
        Key: path
      }, (err, data) => {
        if (err) {
          if (err.code === 'NotFound') {
            return resolve(false)
          }
          return reject(err)
        }
        return resolve(true)
      })
    })
  }

  /**
   * Get the contents of the file at the specified path. Returns a Buffer.
   */
  * get (path) {
    return new Promise((resolve, reject) => {
      this.s3.getObject({
        Bucket: this.disk.bucket,
        Key: path
      }, (err, data) => {
        if (err) return reject(err)
        return resolve(data.Body)
      })
    })
  }

  /**
   * Get the contents of the file at the specified path. Returns a Stream.
   */
  * getStream (path) {
    return this.s3.getObject({
      Bucket: this.disk.bucket,
      Key: path
    }).createReadStream()
  }

  /**
   * Write contents to a file at `path`.
   */
  * put (path, contents) {
    return new Promise((resolve, reject) => {
      console.log('here', this.disk)
      this.s3.upload({
        Bucket: this.disk.bucket,
        Key: path,
        Body: contents
      }, (err, data) => {
        if (err) return reject(err)
        return resolve(data.Location)
      })
    })
  }

  /**
   * Returns the absolute path
   */
  * url (path) {
    return `https://${this.disk.bucket}.s3.amazonaws.com/${path}`
  }

}

module.exports = S3
