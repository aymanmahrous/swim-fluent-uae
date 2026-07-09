import { z } from "zod";
import type { TextGenerationProvider } from "./provider-registry.server";

const OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const DEFAULT_TEXT_MODEL = "gpt-5.6-luna";

const OpenAiResponseSchema = z.object({
  id: z.string().optional(),
  output_text: z.string().min(1),
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
  if (!apiKey) throw new Error("OPENAI_TEXT_NOT_CONFIGURED");
  return {
    apiKey,
    model: value("AI_TEXT_MODEL") ?? DEFAULT_TEXT_MODEL,
  };
}

export function isOpenAiTextConfigured(): boolean {
  return Boolean(value("OPENAI_API_KEY"));
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
    body: JSON.stringify({
      model,
      input: [
        ...(input.system ? [{ role: "system", content: input.system }] : []),
        { role: "user", content: input.prompt },
      ],
      max_output_tokens: input.maxOutputTokens ?? 20_000,
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

  const payload: unknown = await response.json().catch(() => null);
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
    text: parsed.data.output_text,
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
