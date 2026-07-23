import { z } from "zod";
import type { TextGenerationProvider } from "./provider-registry.server";

const OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const MAX_RESPONSE_BYTES = 1_000_000;
const REQUEST_TIMEOUT_MS = 45_000;

const OpenAiResponseSchema = z.object({
  id: z.string().optional(),
  output: z
    .array(
      z
        .object({
          type: z.string(),
          content: z
            .array(
              z
                .object({
                  type: z.string(),
                  text: z.string().optional(),
                })
                .passthrough(),
            )
            .optional(),
        })
        .passthrough(),
    )
    .min(1),
});

const OpenAiErrorSchema = z.object({
  error: z.object({
    code: z.string().optional(),
    type: z.string().optional(),
    message: z.string().optional(),
  }),
});

type StructuredSchema = {
  name: string;
  schema: Record<string, unknown>;
};

type OpenAiTextInput = {
  system?: string;
  prompt: string;
  jsonSchema?: StructuredSchema;
  maxOutputTokens?: number;
};

function value(name: string): string | null {
  const candidate = process.env[name]?.trim();
  return candidate || null;
}

function config(): { apiKey: string; model: string } {
  const apiKey = value("OPENAI_API_KEY");
  const model = value("AI_TEXT_MODEL");
  if (!apiKey || !model) throw new Error("OPENAI_TEXT_NOT_CONFIGURED");
  return { apiKey, model };
}

function responseText(payload: z.infer<typeof OpenAiResponseSchema>): string {
  const text = payload.output
    .flatMap((item) => (item.type === "message" ? item.content ?? [] : []))
    .filter(
      (content): content is typeof content & { text: string } =>
        content.type === "output_text" && typeof content.text === "string",
    )
    .map((content) => content.text)
    .join("")
    .trim();

  if (!text) throw new Error("OPENAI_TEXT_OUTPUT_MISSING");
  return text;
}

export function isOpenAiTextConfigured(): boolean {
  return Boolean(value("OPENAI_API_KEY") && value("AI_TEXT_MODEL"));
}

async function requestOpenAiText(input: OpenAiTextInput) {
  const { apiKey, model } = config();
  const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      instructions: input.system,
      input: input.prompt,
      store: false,
      max_output_tokens: input.maxOutputTokens ?? 8_000,
      text: input.jsonSchema
        ? {
            format: {
              type: "json_schema",
              name: input.jsonSchema.name,
              strict: true,
              schema: input.jsonSchema.schema,
            },
            verbosity: "medium",
          }
        : {
            format: { type: "text" },
            verbosity: "medium",
          },
    }),
  });

  const raw = await response.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_RESPONSE_BYTES) {
    throw new Error("OPENAI_TEXT_RESPONSE_TOO_LARGE");
  }

  let payload: unknown = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const parsedError = OpenAiErrorSchema.safeParse(payload);
    const detail = parsedError.success
      ? parsedError.data.error.code ??
        parsedError.data.error.type ??
        parsedError.data.error.message ??
        `HTTP_${response.status}`
      : `HTTP_${response.status}`;
    throw new Error(`OPENAI_TEXT_${detail}`.slice(0, 1000));
  }

  const parsed = OpenAiResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error("OPENAI_TEXT_INVALID_RESPONSE");
  return {
    text: responseText(parsed.data),
    providerRequestId: parsed.data.id,
  };
}

export async function generateOpenAiStructuredText(input: {
  system?: string;
  prompt: string;
  jsonSchema: StructuredSchema;
  maxOutputTokens?: number;
}) {
  return requestOpenAiText(input);
}

export const openAiResponsesTextProvider: TextGenerationProvider = {
  id: "openai-responses-text",
  async generateText(input) {
    return requestOpenAiText({
      system: input.system,
      prompt: input.prompt,
    });
  },
};
