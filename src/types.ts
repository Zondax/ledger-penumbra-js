import { INSGeneric } from '@zondax/ledger-js'

export interface PenumbraIns extends INSGeneric {
  GET_VERSION: 0x00
  GET_ADDR: 0x01
  SIGN: 0x02
  FVK: 0x03
  TX_METADATA: 0x04
}

export interface AddressIndex {
  account: number
  randomizer?: Buffer
}

export interface ResponseAddress {
  address?: Buffer
}

// The full viewing key consists of two components:
//
//     - ak
//     - nk
//
export interface ResponseFvk {
  ak: Buffer
  nk: Buffer
}

export interface ResponseSign {
  signature: Buffer
}
