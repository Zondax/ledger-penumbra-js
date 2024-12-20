import { ResponsePayload } from '@zondax/ledger-js/dist/payload'

import { ADDRLEN, AK_LEN, EFFECT_HASH_LEN, FVKLEN } from './consts'
import { ResponseAddress, ResponseFvk, ResponseSign } from './types'

export function processGetAddrResponse(response: ResponsePayload): ResponseAddress {
  const address = response.readBytes(ADDRLEN)

  return {
    address,
  }
}

export function processGetFvkResponse(response: ResponsePayload): ResponseFvk {
  const keys = response.readBytes(FVKLEN)

  // Extract ak and nullifier_key
  const ak = Buffer.from(keys.subarray(0, AK_LEN))
  const nk = Buffer.from(keys.subarray(32, FVKLEN))

  return {
    ak,
    nk,
  }
}

export function processSignResponse(response: ResponsePayload): ResponseSign {
  const signature = response.readBytes(EFFECT_HASH_LEN)
  const spendAuth_signature_qty = response.readBytes(2).readUInt16LE(0)
  const delegatorVote_signature_qty = response.readBytes(2).readUInt16LE(0)

  return {
    signature,
    spendAuth_signature_qty,
    delegatorVote_signature_qty,
  }
}
