# Adonis Storage Provider

A storage provider for the Adonis framework.

This library provides an easy to use abstraction over multiple storage backends.

## Install

```
npm install --save adonis-storage
```

## Configure

Register it in `bootstrap/app.js`:

```javascript
const providers = [
  ...
  'adonis-storage/providers/StorageProvider'
]
```

Also consider adding an alias to validation provider.

```javascript
const aliases = {
  ...
  Storage: 'Adonis/Addons/Storage'
}
```

Add a configuration file in `config/storage.js` and copy over the [example configurations](examples/config/storage.js).

## Drivers

Currently, drivers exist for the local file system and Amazon S3.

- **fs**
  
  File paths are rooted at `./storage`. You can specify any path inside of the storage directory.

- **s3**

  Files are stored in Amazon S3.

## Usage

```javascript
const Storage = use('Storage')

// returns true or false
yield Storage.exists('path/to/file')

// returns a buffer containing file contents
yield Storage.get('path/to/file')

// returns a ReadableStream of the file at path
yield Storage.getStream('path/to/file') 

// Store contents at path. If contents is an AdonisJS `file` object,
// this is treated as `putFile`
yield Storage.put('path/to/file', contents)

// Accepts a path and an AdonisJS `file` object.
// When calling `putFile` the name the file is stored as
// is automatically calculated as an md5 hash of the 
// file contents.
yield Storage.putFile('path/to/file/directory', contents)

// Accepts a path and an AdonisJS `file` object.
// Same as `putFile` but does not calculate the filename automatically.
// File will be stored at `path/to/file/directory/filename`
yield Storage.putFileAs('path/to/file/directory', contents, filename)

// Return the url or absolute file path for accessing the file
yield Storage.url('path/to/file')

```

## License

Distributed under the [MIT](LICENSE) license.

## Thanks

Special thanks to the creator(s) of [AdonisJS](http://adonisjs.com/) for creating such a great framework.
