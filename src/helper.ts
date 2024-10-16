import { ADDRLEN, FVKLEN } from "./consts";
import { ResponseAddress, ResponseFvk } from "./types";

export function processGetAddrResponse(response: Buffer): ResponseAddress {
  const errorCodeData = response.subarray(-2);
  const returnCode = errorCodeData[0] * 256 + errorCodeData[1];

  const address = Buffer.from(response.subarray(0, ADDRLEN));
  response = response.subarray(ADDRLEN);

  return {
    address,
  };
}

export function processGetFvkResponse(response: Buffer): ResponseFvk {
  const errorCodeData = response.subarray(-2);
  const returnCode = errorCodeData[0] * 256 + errorCodeData[1];

  const fvk = Buffer.from(response.subarray(0, FVKLEN));
  response = response.subarray(FVKLEN);

  return {
    fvk,
  };
}
