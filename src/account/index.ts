import CKB from '@nervosnetwork/ckb-sdk-core'
import { bytesToHex, scriptToAddress } from '@nervosnetwork/ckb-sdk-utils'
import blake160 from '@nervosnetwork/ckb-sdk-utils/lib/crypto/blake160'
import { FlashSignerLockScript } from '../constants/script'
import { CKB_NODE_RPC, SECP256K1_PRIVATE_KEY } from '../utils/config'
import { append0x } from '../utils/hex'
import { exportPubKey, pemToKey } from '../utils/util'

const ckb = new CKB(CKB_NODE_RPC)

export const secp256k1LockScript = async (): Promise<CKBComponents.Script> => {
  const secp256k1Dep = (await ckb.loadDeps()).secp256k1Dep
  return {
    codeHash: secp256k1Dep.codeHash,
    hashType: secp256k1Dep.hashType,
    args: generateLockArgs(SECP256K1_PRIVATE_KEY),
  }
}

export const generateLockArgs = (privateKey: Hex) => {
  const pubKey = ckb.utils.privateKeyToPublicKey(privateKey)
  return '0x' + ckb.utils.blake160(pubKey, 'hex')
}

export const secp256k1Dep = async (): Promise<CKBComponents.CellDep> => {
  const secp256k1Dep = (await ckb.loadDeps()).secp256k1Dep
  return { outPoint: secp256k1Dep.outPoint, depType: 'depGroup' }
}

export const RSA_TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6HH82NIk1cm+OGE1mvNewjM4wJjwmI4lfctbY+6+5LGw9qfJ6jQX0/na8eSBQPnhooiTIqxNHKTarP5q9Ca4wih9ns4qOT6o9U00fsx4fgTLNArdVAETuhpbxgnfCnMZ/H7ktoacKVQQYArU1GGiWCSAgB47QOBW6dJlXlfPFSe29nIEPc+mm+UXW2xq/iZfxY9f92ALvMw84hoQv7CmpkAi1qw/8n+DD03ruxBZz0FI7fxgqY/vrKXqFu/0n7H2jAokTGKZHGUHwPNvLrDJ0P7Y1+h2/C1Y8n40EiEf+TutSWfhTUwnU5Rz82m4IMThSqxrj6QN2QXJ49wB56XObAgMBAAECggEAQaED8RL0oZ7RnNuQC98i9lSo7wzEoDRe4IRIJCsY6+Uw5EvWQIYTaDIFn+/cx79HyaoH66V8PldXumrK/8d2oBJNAc4r2YRZRZfm9fs9b6GpTucazEQ0iqJ2fwLhhYSwcKq4q9E57OhO8cKesPMDCol8RR81KtLkQqSUYHD2DgcpINaL1SFZNn9RcrOs53Ma1b27WOt+TivUDOLsAt9AvtVuzr5S2jUjnLVvNngGbmamotfuhDYAV9SzeYiwFOpfPnsw+4Lq7egWVXGfUZcR962xxzjvDaGuNUsif8rcTMxKl9aywYWfPNMUByeCmspbf+eWqp11VHWevrDVfyxQEQKBgQD5Ba6uzKb25dS3lkU3acigKHFKk5JXtSdraO0cEEcYHCqVJFBUBW3zZ0eMFQkFY4WJFJDGIy11A9w3LVvd3PbT2Hm/H5zXgzIAhCGS4YLmcBVn3Zrg8HHdlYxknUaJ57JjQceAtQ/RcidMdcGdx6IX+4sOTv99qEpyXT8Yn0OZ6wKBgQC/U4jEfXD8qMGGpcZFqoFl7Wsgfb37RkBGv7WTxSbvwTmAQqTRTjZSQSWH0oiPqnxu9LYtVr9JIh8P6T3TbeoO31O1DqbPYclmWQx4v9HkOygDdtIpHGt91kmktnGfbi0DSUdaAwzLhmPWAiRokOy5wFdVsdEagvS+cz5/UBLxEQKBgQDelXCtN6op2AcJzhyySjCUz3FsWnmdQgQpItGFmxsg9tQtGRdf8rZzsSYnlQnKMknC3IoHQJw6Eqg8/aM2rXJGqyEvb39OtyrzgSdNVZsehKLtgwwT8Xeluy2RJW9OhrZRuBMt/SlVafashjj44d8GFsYVlRETbWCV1rk2Ne1D3wKBgEsscTJy7y/2xoM3I15ADjOUQ2EyxrCx+5NQw/FZp2DQlN02UjgC+Qj8m9hv+kQogle+Qs4xpVsA0x+XTzmBmFNboDIlnZkiHNXf6yyOgdOhAqnJx+1rQzjgN3NGVAKGcZ0275gIVsCo/xUZJmEHgFvDnQ0IntZB2hPyh/3R4n9hAoGBAIZZHGa9X8PzspJUjyuvn2k/HQIj8hsymtCJPbzTc4NSqlIj2EfrN07WhoaT81bfZ4NGMgIE/2UCbk4iUJNJUJrg8UHQscIXJajd4pBESbVcPgPH2nbNpW5qKDrL5fWA4AGjoWqeGnnb1aUPMllS1rbjVdnb3RzVblre6V4lGNaD
-----END PRIVATE KEY-----`

export const rsaKey = () => pemToKey(RSA_TEST_PRIVATE_KEY)

export const rsaPubKey = async () => {
  const senderKey = rsaKey()
  return await exportPubKey(senderKey)
}

export const rsaLockScript = async (): Promise<CKBComponents.Script> => {
  const pubKey = await rsaPubKey()
  const pubKeyHash = append0x(bytesToHex(blake160(pubKey)))
  return {
    ...FlashSignerLockScript,
    args: pubKeyHash,
  }
}

export const rsaAddress = async () => {
  const lock = await rsaLockScript()
  return scriptToAddress(lock)
}