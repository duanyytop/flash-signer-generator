/// <reference types="@nervosnetwork/ckb-types" />

type U8 = number
type U16 = number
type U32 = number

type Hex = string

interface IndexerCell {
  blockNumber: CKBComponents.BlockNumber
  outPoint: CKBComponents.OutPoint
  output: CKBComponents.CellOutput
  outputData: Hex[]
  txIndex: Hex
}
type IndexerCells = {
  objects: IndexerCell[]
  lastCursor: Hex
}



