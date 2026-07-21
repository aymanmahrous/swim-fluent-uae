const SIGNATURE_WINDOW_BYTES = 16;

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.byteLength < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

export function assertMediaSignature(
  bytes: Uint8Array,
  contentType: string,
  assetType: "image" | "video",
): void {
  const sample = bytes.slice(0, SIGNATURE_WINDOW_BYTES);
  const valid =
    contentType === "image/png"
      ? startsWith(sample, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      : contentType === "image/jpeg"
        ? startsWith(sample, [0xff, 0xd8, 0xff])
        : contentType === "image/webp"
          ? ascii(sample, 0, 4) === "RIFF" && ascii(sample, 8, 4) === "WEBP"
          : contentType === "video/mp4"
            ? sample.byteLength >= 12 && ascii(sample, 4, 4) === "ftyp"
            : false;

  if (!valid) {
    throw new Error(assetType === "video" ? "VIDEO_SIGNATURE_INVALID" : "IMAGE_SIGNATURE_INVALID");
  }
}

export async function readResponseBytesBounded(response: Response, maxBytes: number): Promise<Uint8Array> {
  if (!response.body) throw new Error("PROVIDER_ASSET_EMPTY");

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel("asset exceeds configured limit").catch(() => undefined);
        throw new Error("PROVIDER_ASSET_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (total < 1) throw new Error("PROVIDER_ASSET_EMPTY");
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}
