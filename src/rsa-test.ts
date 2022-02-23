import NodeRSA from "node-rsa"

const run = () => {
  const state = {
    "message": "123222",
    "signature": "d2d23ae1e7ddc6e8e2fc0ff66ca588bd728dd21493a9ab2c4d5eb6750caba3a82d35aaa1170e71da6fccb758e71a831692e21df049121c2827657c114a30c646df05884d3b86af211d34f797d6301994d237b3bbf91a968e7d8e94d1301ca04b304c4f177456710096669d6cb8a202de730691d8a28878d5a2f3c96152bac5f26f683eec17c11ea3923f8cfa536bd70b5b1860c9c0ce5b6e5ce92c9b3178c706595ca6dad0392b244a03a7aa742da2001f1a710e6736a056a553c7de195de454fb96da124af32657e5e698d2d96e1a647c2ec448f73ef7c1d36ac9d9ebaceeb9a090553b2267aa056dfd7354274b8b8e71e1b1605cc523cc0239255e67952dae",
    "pubkey": "01000100a32bc4a56765117f5df06c9a40f0354b8368d2f55f6aba39f8bb872c0bfc5156c8b6ed48a75963b14da67be2f7c8716dfe5a77e99e9e578ae3ec06f9e133f91fdf0025a52080cb4c01a7994700e40790af2bf536aff38d2c03043548f718e81224fcdd3879bd9e766ccb0f1c3a74ecea3565b69d500505921180fe952fa02082faf9f9273fa22c247ad934bc1d7b9070cf64da8dc55bf808d76c1a75d88a0a4be72985da94d321c038c5e259952c715a91d4cf4c7a81faf4c0c1e7f21d00cb70c3ec19ce4af0235360823fcc7fe553ab4946d4d031dcf8f25ae06c3fe45580a4ef0cb2b75dec6d0e46bd06c17b499c6eaac298f64830e7be15f0448c83a984dd"
  }

  const key = new NodeRSA()
  const buf = Buffer.from(state.pubkey, 'hex')
  const e = buf.slice(0, 4).reverse()
  const n = buf.slice(4).reverse()
  key.importKey({ e, n }, 'components-public')
  key.setOptions({ signingScheme: 'pkcs1-sha256' })
  const result = key.verify(
      Buffer.from(state.message),
      Buffer.from(state.signature, 'hex')
  )

  console.log(result)
}

run()