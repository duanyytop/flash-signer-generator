import CKB from '@nervosnetwork/ckb-sdk-core'
import { rawTransactionToHash } from '@nervosnetwork/ckb-sdk-utils'
import { rsaKey, rsaLockScript, RSA_PRIVATE_KEY, secp256k1Dep, secp256k1LockScript } from '../account'
import { collectInputs, getCells } from '../collector'
import { FEE, FlashSignerLockDep } from '../constants/script'
import { CKB_NODE_RPC, SECP256K1_PRIVATE_KEY } from '../utils/config'
import { signTransaction } from '../utils/tx'

const RSA_CELL_CAPACITY = BigInt(500) * BigInt(100000000)
const SECP256K1_CELL_CAPACITY = BigInt(200) * BigInt(100000000)
const ckb = new CKB(CKB_NODE_RPC)

const generateRSAOutputs = async (
  inputCapacity: bigint,
) => {
  const secp256k1Lock = await secp256k1LockScript()
  const rsaLock = await rsaLockScript()
  let outputs: CKBComponents.CellOutput[] = [
    {
      capacity: `0x${RSA_CELL_CAPACITY.toString(16)}`,
      lock: rsaLock,
    },
  ]
  const changeCapacity = inputCapacity - FEE - RSA_CELL_CAPACITY
  outputs.push({
    capacity: `0x${changeCapacity.toString(16)}`,
    lock: secp256k1Lock,
  })
  return outputs
}

export const sendCapacityToRsaLock = async () => {
  const lock = await secp256k1LockScript()
  const liveCells = await getCells(lock)
  const { inputs, capacity } = collectInputs(liveCells, RSA_CELL_CAPACITY)
  const outputs = await generateRSAOutputs(capacity)
  const cellDeps = [await secp256k1Dep()]
  const rawTx = {
    version: '0x0',
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData: ['0x', '0x'],
    witnesses: [],
  }
  rawTx.witnesses = rawTx.inputs.map((_, i) => (i > 0 ? '0x' : { lock: '', inputType: '', outputType: '' }))
  const signedTx = ckb.signTransaction(SECP256K1_PRIVATE_KEY)(rawTx)
  console.info(JSON.stringify(signedTx))
  let txHash = await ckb.rpc.sendTransaction(signedTx, 'passthrough')
  console.info(`sendCapacityToRsaLock tx has been sent with tx hash ${txHash}`)
  return txHash
}

const generateSecp256k1Outputs = async (
  inputCapacity: bigint,
) => {
  const secp256k1Lock = await secp256k1LockScript()
  const rsaLock = await rsaLockScript()
  let outputs: CKBComponents.CellOutput[] = [
    {
      capacity: `0x${SECP256K1_CELL_CAPACITY.toString(16)}`,
      lock: secp256k1Lock,
    },
  ]
  const changeCapacity = inputCapacity - FEE - SECP256K1_CELL_CAPACITY
  outputs.push({
    capacity: `0x${changeCapacity.toString(16)}`,
    lock: rsaLock,
  })
  return outputs
}

export const rsaLockSendCapacity = async () => {
  const rsaLock = await rsaLockScript()
  const liveCells = await getCells(rsaLock)
  const { inputs, capacity } = collectInputs(liveCells, SECP256K1_CELL_CAPACITY)
  const outputs = await generateSecp256k1Outputs(capacity)
  const cellDeps = [FlashSignerLockDep]
  const rawTx = {
    version: '0x0',
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData: ['0x', '0x'],
    witnesses: [],
  }
  rawTx.witnesses = rawTx.inputs.map((_, i) => (i > 0 ? '0x' : { lock: '', inputType: '', outputType: '' }))

  const signedTx = await signTransaction(rsaKey(), rawTx)
  console.info(JSON.stringify(signedTx))
  let txHash = await ckb.rpc.sendTransaction(signedTx, 'passthrough')
  console.info(`rsaLockSendCapacity tx has been sent with tx hash ${txHash}`)
  return txHash
}