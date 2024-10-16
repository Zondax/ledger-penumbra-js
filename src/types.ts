import { INSGeneric } from "@zondax/ledger-js";

export interface PenumbraIns extends INSGeneric {
  GET_VERSION: 0x00;
  GET_ADDR: 0x01;
  SIGN: 0x02;
  FVK: 0x03;
}

export interface ResponseAddress {
  // publicKey?: Buffer;
  // principal?: Buffer;
  address?: Buffer;
  // principalText?: string;
}

export interface ResponseFvk {
  fvk?: Buffer;
}

export interface ResponseSign {
  signature: Buffer;
}
