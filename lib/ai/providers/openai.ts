import { z } from 'zod';
import {
  ProviderOutputError,
  extractJson,
  type AIProvider,
  type GenerateObjectArgs,
  type GenerateResult,
} from '../provider';

/**
 * OpenAI.
 *
 * Present so that provider choice is demonstrably a configuration change
 * rather than a rewrite. Not the default: the founder has Gemini Pro.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';

  constructor(
    private readonly apiKey: string,
    private readonly model = process.env.OPENAI_MODEL ?? 'gpt-4.1',
  ) {}

  get configured(): boolean {
    return Boolean(this.apiKey);
  }

  async generateObject<T>(args: GenerateObjectArgs<T>): Promise<GenerateResult<T>> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        temperature: args.temperature ?? 0.2,
        max_tokens: args.maxOutputTokens ?? 8192,
        messages: [
          { role: 'system', content: args.system },
          { role: 'user', content: args.prompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: args.schemaName,
            strict: false,
            schema: z.toJSONSchema(args.schema, { io: 'output' }),
          },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`OpenAI request failed (${response.status}): ${detail.slice(0, 400)}`);
    }

    const body = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const raw = body.choices?.[0]?.message?.content ?? '';
    if (!raw) throw new ProviderOutputError('OpenAI returned no content.', JSON.stringify(body));

    const parsed = args.schema.safeParse(extractJson(raw));
    if (!parsed.success) {
      throw new ProviderOutputError(
        `OpenAI output did not match ${args.schemaName}: ${parsed.error.issues
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
        inputTokens: body.usage?.prompt_tokens ?? 0,
        outputTokens: body.usage?.completion_tokens ?? 0,
      },
      raw,
    };
  }
}
