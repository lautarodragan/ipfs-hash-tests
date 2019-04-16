// This is a test by https://github.com/alexanderattar
// originally shared in https://github.com/ipfs/js-ipfs/issues/1205#issuecomment-370943323
// and later modified by https://github.com/fazo96
// in https://github.com/ipfs/js-ipfs/issues/1205#issuecomment-371134571

'use strict'

const series = require('async/series')
const IPFS = require('ipfs')
const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')

const node = new IPFS()
let fileMultihash

series([
  (cb) => node.on('ready', cb),
  (cb) => node.version((err, version) => {
    if (err) { return cb(err) }
    console.log('IPFS Version:', version.version)
    cb()
  }),
  (cb) => DAGNode.create(Buffer.from('Hello'), (err, dagNode) => {
    if (err) {
      return cb(err)
    }
    const mh = dagNode.toJSON().multihash
    console.log('\nComputed hash (DAGNode.create):', mh)
    cb(null, mh)
  }),
  (cb) => node.object.put(Buffer.from('Hello'), (err, dagNode) => {
    if (err) {
      return cb(err)
    }
    const mh = dagNode.toJSON().multihash
    console.log('object.put - Computed hash', mh)
    console.log('object.put - Buffer.toString:', dagNode.toJSON().data.toString())
    cb(null, mh)
  }),
  (cb) => node.files.add(Buffer.from('Hello'), (err, filesAdded) => {
    if (err) { return cb(err) }
    console.log('node.files.add - Added file:', filesAdded[0].path, filesAdded[0].hash, Buffer.from('Hello'))
    fileMultihash = filesAdded[0].hash
    cb()
  }),
  (cb) => node.object.get(fileMultihash, (err, dagNode) => {
    if (err) { return cb(err) }
    console.log('node.files.add - object.get of added file:', dagNode.toJSON().data.toString(), dagNode.toJSON().data)
    cb(null, dagNode.toJSON().multihash)
  }),
  (cb) => node.files.cat(fileMultihash, (err, data) => {
    if (err) { return cb(err) }
    console.log('node.files.add - cat added file:', data.toString(), data)
    process.exit()
  })
])