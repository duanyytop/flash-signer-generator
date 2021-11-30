import {
  hexToBytes,
  PERSONAL,
  rawTransactionToHash,
  serializeWitnessArgs,
  toUint64Le,
} from '@nervosnetwork/ckb-sdk-utils'
import blake2b from '@nervosnetwork/ckb-sdk-utils/lib/crypto/blake2b'
import NodeRSA from 'node-rsa'
import { rsaPubKey } from '../account'
import { remove0x } from './hex'

export const signTransaction = async (key: NodeRSA, transaction: CKBComponents.RawTransactionToSign) => {
  if (!key) throw new Error('Private key or address object')

  const witnessGroup = transaction.witnesses

  if (!witnessGroup.length) {
    throw new Error('WitnessGroup cannot be empty')
  }
  if (typeof witnessGroup[0] !== 'object') {
    throw new Error('The first witness in the group should be type of WitnessArgs')
  }

  const transactionHash = rawTransactionToHash(transaction)

  // len(smt_type + pub_key_e + pub_key_n + signature)
  const lock_length = 2 + 8 + (key.getKeySize() / 4) * 2

  console.log('lock length', lock_length)

  const emptyWitness = {
    ...witnessGroup[0],
    lock: `0x${'0'.repeat(lock_length)}`,
  }

  const serializedEmptyWitnessBytes = hexToBytes(serializeWitnessArgs(emptyWitness))
  const serializedEmptyWitnessSize = serializedEmptyWitnessBytes.length

  const hash = blake2b(32, null, null, PERSONAL)
  hash.update(hexToBytes(transactionHash))
  hash.update(hexToBytes(toUint64Le(`0x${serializedEmptyWitnessSize.toString(16)}`)))
  hash.update(serializedEmptyWitnessBytes)

  witnessGroup.slice(1).forEach(w => {
    const bytes = hexToBytes(typeof w === 'string' ? w : serializeWitnessArgs(w))
    hash.update(hexToBytes(toUint64Le(`0x${bytes.length.toString(16)}`)))
    hash.update(bytes)
  })

  const message = `0x${hash.digest('hex')}`
  if (key.getKeySize() !== 2048 && key.getKeySize() !== 4096) {
    throw new Error('RSA key size error')
  }
  const rsaType = key.getKeySize() === 2048 ? '01' : '02'
  const pubKey = remove0x(await rsaPubKey())
  emptyWitness.lock = `0x${rsaType}${pubKey}${signMessage(key, message)}`

  console.log(emptyWitness.lock)

  const signedWitnesses = [serializeWitnessArgs(emptyWitness), ...witnessGroup.slice(1)]

  return {
    ...transaction,
    witnesses: signedWitnesses.map(witness => (typeof witness === 'string' ? witness : serializeWitnessArgs(witness))),
  }
}

export const signMessage = (key: NodeRSA, message: Hex) => {
  if (!message.startsWith('0x')) {
    throw new Error('Message format error')
  }
  const signature = key.sign(Buffer.from(message.replace('0x', ''), 'hex'), 'hex')

  return signature
}
