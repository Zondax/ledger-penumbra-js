/** ******************************************************************************
 *  (c) 2019-2020 Zondax GmbH
 *  (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */
import { P2_VALUES, PREHASH_LEN, RANDOMIZER_LEN, SIGRSLEN } from "./consts";
import { ResponseAddress, ResponseFvk, PenumbraIns, ResponseSign, AddressIndex } from "./types";

import BaseApp, {
  ConstructorParams,
  LedgerError,
  PAYLOAD_TYPE,
  processErrorResponse,
  Transport,
  BIP32Path,
} from "@zondax/ledger-js";
import { processGetAddrResponse, processGetFvkResponse } from "./helper";

// https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.custody.v1#penumbra.custody.v1.ConfirmAddressRequest

export * from "./types";

export class PenumbraApp extends BaseApp {
  readonly INS!: PenumbraIns;
  constructor(transport: Transport) {
    if (transport == null) throw new Error("Transport has not been defined");

    const params: ConstructorParams = {
      cla: 0x80,
      ins: {
        GET_VERSION: 0x00,
        GET_ADDR: 0x01,
        SIGN: 0x02,
        FVK: 0x03,
      },
      p1Values: {
        ONLY_RETRIEVE: 0x00,
        SHOW_ADDRESS_IN_DEVICE: 0x01,
      },
      acceptedPathLengths: [3],
      chunkSize: 250,
    };
    super(transport, params);
  }

  async getAddress(
    path: string,
    addressIndex: AddressIndex,
  ): Promise<ResponseAddress> {
    const data = this._prepareAddressData(path, addressIndex);
    try {
      const responseBuffer = await this.transport.send(
        this.CLA,
        this.INS.GET_ADDR,
        this.P1_VALUES.ONLY_RETRIEVE,
        P2_VALUES.DEFAULT,
        data,
      );

      const response = processGetAddrResponse(responseBuffer);

      return {
        address: response.address,
      } as ResponseAddress;
    } catch (e) {
      throw processErrorResponse(e);
    }
  }

  async showAddress(
    path: string,
    addressIndex: AddressIndex,
  ): Promise<ResponseAddress> {
    const data = this._prepareAddressData(path, addressIndex);

    try {
      const responseBuffer = await this.transport.send(
        this.CLA,
        this.INS.GET_ADDR,
        this.P1_VALUES.SHOW_ADDRESS_IN_DEVICE,
        P2_VALUES.DEFAULT,
        data,
      );

      const response = processGetAddrResponse(responseBuffer);

      return {
        address: response.address,
      } as ResponseAddress;
    } catch (e) {
      throw processErrorResponse(e);
    }
  }

  async getFVK(path: string, addressIndex: AddressIndex): Promise<ResponseFvk> {
    const data = this._prepareAddressData(path, addressIndex);

    // Fvk can be retrieved without user confirmation
    try {
      const responseBuffer = await this.transport.send(
        this.CLA,
        this.INS.FVK,
        this.P1_VALUES.ONLY_RETRIEVE,
        P2_VALUES.DEFAULT,
        data,
      );

      const response = processGetFvkResponse(responseBuffer);

      return {
        fvk: response.fvk,
      } as ResponseFvk;
    } catch (e) {
      throw processErrorResponse(e);
    }
  }

  async sign(path: BIP32Path, addressIndex: AddressIndex, blob: Buffer): Promise<ResponseSign> {
    const chunks = this.prepareChunks(path, blob);
    try {
      let signatureResponse = await this.signSendChunk(this.INS.SIGN, 1, chunks.length, chunks[0]);

      for (let i = 1; i < chunks.length; i += 1) {
        signatureResponse = await this.signSendChunk(this.INS.SIGN, 1 + i, chunks.length, chunks[i]);
      }
      return {
        signature: signatureResponse.readBytes(signatureResponse.length()),
      };
    } catch (e) {
      throw processErrorResponse(e);
    }
  }

  private _prepareAddressData(path: string, addressIndex: AddressIndex): Buffer {
    const serializedPath = this.serializePath(path);
    const accountBuffer = this.serializeAccountIndex(addressIndex);


    // concatenate data
    const concatenatedBuffer: Buffer = Buffer.concat([
      serializedPath,
      accountBuffer,
    ]);

    return concatenatedBuffer;
  }

  private serializeAccountIndex(accountIndex: AddressIndex): Buffer {
    const accountBuffer = Buffer.alloc(4);
    accountBuffer.writeUInt32LE(accountIndex.account);

    const hasRandomizerBuffer = Buffer.from([accountIndex.randomizer ? 1 : 0]);
    const randomizerBuffer = accountIndex.randomizer ?? Buffer.alloc(RANDOMIZER_LEN);
    // Ensure randomizerBuffer does not exceed 12 bytes
    if (randomizerBuffer && randomizerBuffer.length > RANDOMIZER_LEN) {
      throw new Error("randomizerBuffer exceeds the maximum allowed length of 12 bytes");
    }

    return Buffer.concat([accountBuffer, hasRandomizerBuffer, randomizerBuffer]);
  }
}
