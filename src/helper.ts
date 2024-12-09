import { ResponsePayload } from '@zondax/ledger-js/dist/payload'

import { ADDRLEN, AK_LEN, FVKLEN, NK_LEN } from './consts'
import { ResponseAddress, ResponseFvk } from './types'

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
