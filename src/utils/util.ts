import camelcaseKeys from 'camelcase-keys'
import NodeRSA from 'node-rsa'

export const toCamelcase = (object: any) => {
  try {
    return JSON.parse(
      JSON.stringify(
        camelcaseKeys(object, {
          deep: true,
        }),
      ),
    )
  } catch (error) {
    console.error(error)
  }
  return null
}

export const pemToKey = (privateKeyPem: string): NodeRSA => {
  const key = new NodeRSA(privateKeyPem)
  key.setOptions({ signingScheme: 'pkcs1-sha256' })
  return key
}

export const exportPubKey = async (privateKey: NodeRSA) => {
  const data: NodeRSA.KeyComponentsPublic = await privateKey.exportKey('components-private')

  const e = (data.e as number).toString(16).padStart(8, '0')
  const n = data.n.slice(1)

  const eBuffer = Buffer.from(e, 'hex').reverse()
  const nBuffer = n.reverse()

  const pubKey = Buffer.concat([eBuffer, nBuffer])
  return `0x${pubKey.toString('hex')}`
}


export default toCamelcase
