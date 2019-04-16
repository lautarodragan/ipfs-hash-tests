const util = require('util');
const exec = util.promisify(require('child_process').exec);
const bs58 = require('bs58')
const crypto = require('crypto')
const multihash = require('multihashes')
const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')

const sourceText = "This is some data"
const sourceTextBuffer = Buffer.from(sourceText)
// const ipfsHash = "QmfQ5QAjvg4GtA3wg3adpnDJug8ktA1BxurVqBD8rtgVjM"

async function main() {
  const addedIpfsHash = await ipfsBlockPut(sourceText)
  const source256 = sha256(sourceTextBuffer)

  console.log('addedIpfsHash', addedIpfsHash)

  const multihashed = multihash.encode(source256, 'sha2-256')

  console.log('multihash.toB58String', multihash.toB58String(multihashed))
  
  console.log('multihash.decode addedIpfsHash', multihash.decode(multihash.fromB58String(addedIpfsHash)))
  console.log('multihash.decode multihashed', multihash.decode(multihashed))

  DAGNode.create(Buffer.from(sourceTextBuffer), (err, dagNode) => {
    if (err) {
      return console.error(err)
    }
    const mh = dagNode.toJSON().multihash
    console.log('\nComputed hash (dagnode):', dagNode.toJSON())
    console.log('Computed decoded multihash (dagnode)', multihash.decode(multihash.fromB58String(mh)))
  })

}

const ipfsAdd = async text => {
  const { stdout, stderr } = await exec(`echo "${text}" | ipfs add`)
  return stdout.split(" ")[1].trim()
}

const ipfsBlockPut = async text => {
  const { stdout, stderr } = await exec(`echo "${text}" | ipfs block put`)
  return stdout.trim()
}

async function testWithoutMultihash() {
	  // const Qm = Buffer.from([0x12, 0x20])
  // const source256 = sha256(sourceTextBuffer)

  // console.log('source256', source256)
  //console.log('source256 hex', source256.toString('hex'))
  //console.log('source256 base64', source256.toString('base64'))
  // console.log('source256 base58', bs58.encode(source256))
  // console.log('source256 base58', bs58.encode(Buffer.concat([Qm, source256])))
}

const sha256 = buffer => crypto
  .createHash('sha256')
  .update(buffer)
  .digest()

main().catch(console.error)