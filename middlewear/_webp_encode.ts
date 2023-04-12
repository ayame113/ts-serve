// https://github.com/jamsinclair/jSquash/blob/1edfc086e22b6aa01910cff5fd20826cf9e3dfa2/packages/webp/encode.ts
// avoid top-level-await for deno deploy

/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Notice: I (Jamie Sinclair) have modified this file.
 * Updated to support a partial subset of WebP encoding options to be provided.
 * The WebP options are defaulted to defaults from the meta.ts file.
 * Also manually allow instantiation of the Wasm Module.
 */
import type { WebPModule } from "https://esm.sh/@jsquash/webp@1.1.3/codec/enc/webp_enc";
import type { EncodeOptions } from "https://esm.sh/@jsquash/webp@1.1.3/meta";

import { defaultOptions } from "https://esm.sh/@jsquash/webp@1.1.3/meta";
import { initEmscriptenModule } from "https://esm.sh/@jsquash/webp@1.1.3/utils";
import { simd } from "https://esm.sh/wasm-feature-detect@1.5.0";

import webpEncoder from "https://esm.sh/@jsquash/webp@1.1.3/codec/enc/webp_enc";
import webpEncoderSimd from "https://esm.sh/@jsquash/webp@1.1.3/codec/enc/webp_enc_simd";

let emscriptenModule: Promise<WebPModule>;

export async function init(module?: WebAssembly.Module): Promise<WebPModule> {
  if (await simd()) {
    emscriptenModule = initEmscriptenModule(webpEncoderSimd, module);
    return emscriptenModule;
  }
  emscriptenModule = initEmscriptenModule(webpEncoder, module);
  return emscriptenModule;
}

export default async function encode(
  data: ImageData,
  options: Partial<EncodeOptions> = {},
): Promise<ArrayBuffer> {
  if (!emscriptenModule) emscriptenModule = init();

  const _options: EncodeOptions = { ...defaultOptions, ...options };
  const module = await emscriptenModule;
  const result = module.encode(data.data, data.width, data.height, _options);

  if (!result) throw new Error("Encoding error.");

  return result.buffer;
}
