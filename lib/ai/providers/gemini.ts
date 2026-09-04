import { z } from 'zod';
import {
  ProviderOutputError,
  extractJson,
  type AIProvider,
  type GenerateObjectArgs,
  type GenerateResult,
} from '../provider';

/**
 * Google Gemini.
 *
 * Uses the REST API directly rather than the SDK: one fetch, no extra
 * dependency, and the request shape stays visible.
 */
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';

  constructor(
    private readonly apiKey: string,
    private readonly model = process.env.GEMINI_MODEL ?? 'gemini-2.5-pro',
  ) {}

  get configured(): boolean {
    return Boolean(this.apiKey);
  }

  async generateObject<T>(args: GenerateObjectArgs<T>): Promise<GenerateResult<T>> {
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: args.system }] },
        contents: [{ role: 'user', parts: [{ text: args.prompt }] }],
        generationConfig: {
          temperature: args.temperature ?? 0.2,
          maxOutputTokens: args.maxOutputTokens ?? 8192,
          responseMimeType: 'application/json',
          responseJsonSchema: z.toJSONSchema(args.schema, { io: 'output' }),
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Gemini request failed (${response.status}): ${detail.slice(0, 400)}`);
    }

    const body = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    };

    const raw = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    if (!raw) throw new ProviderOutputError('Gemini returned no content.', JSON.stringify(body));

    const parsed = args.schema.safeParse(extractJson(raw));
    if (!parsed.success) {
      throw new ProviderOutputError(
        `Gemini output did not match ${args.schemaName}: ${parsed.error.issues
          .map((i) => `${i.path.join('.')} ${i.message}`)
          .slice(0, 5)
          .join('; ')}`,
        raw,
      );
    }

    return {
      value: parsed.data,
      model: this.model,
      usage: {
        inputTokens: body.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: body.usageMetadata?.candidatesTokenCount ?? 0,
      },
      raw,
    };
  }
}
