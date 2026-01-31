import type { z } from "zod";
import type { ILLMAdapter } from "../adapters/base.adapter";
import type { ModelPriorityList, LLMProvider } from "../types";
import { isRetryableError, LLMError } from "../errors";
import { logger } from "@/lib/logger";

type MessageContent = { role: "user" | "system" | "assistant"; content: string };

/**
 * LangChain Gateway for structured output with automatic provider fallback.
 *
 * The gateway tries providers in the order specified by the priority list.
 * If a provider fails with a retryable error (rate limit, unavailable),
 * it falls back to the next provider. Non-retryable errors (auth, model not found)
 * are thrown immediately.
 *
 * Usage:
 * ```ts
 * const gateway = createLangChainGateway();
 * const result = await gateway.invokeWithStructuredOutput(
 *   SUMMARIZER_PRIORITY,
 *   MySchema,
 *   [{ role: "user", content: "..." }]
 * );
 * ```
 */
export class LangChainGateway {
  private adapters: Map<LLMProvider, ILLMAdapter>;

  constructor(adapters: ILLMAdapter[]) {
    this.adapters = new Map(adapters.map((a) => [a.provider, a]));
  }

  /**
   * Invoke an LLM with structured output, using automatic fallback.
   *
   * @param priorityList - List of model configurations in priority order
   * @param schema - Zod schema for structured output
   * @param messages - Messages to send to the model
   * @returns Parsed result matching the schema
   * @throws LLMError if all providers fail or a non-retryable error occurs
   */
  async invokeWithStructuredOutput<T extends z.ZodType>(
    priorityList: ModelPriorityList,
    schema: T,
    messages: MessageContent[]
  ): Promise<z.infer<T>> {
    const errors: LLMError[] = [];

    for (const config of priorityList) {
      const adapter = this.adapters.get(config.provider);

      // Skip if adapter not registered
      if (!adapter) {
        logger.llm.warn(`No adapter registered for provider: ${config.provider}`);
        continue;
      }

      // Skip if provider is not available (no API key)
      if (!adapter.isAvailable()) {
        logger.llm.info(`Provider ${config.provider} not available, skipping`);
        continue;
      }

      try {
        logger.llm.info(`Trying provider: ${config.provider}`, {
          model: config.modelId,
        });

        const model = adapter.createLangChainModel(config);
        const structuredModel = model.withStructuredOutput(schema);
        const result = await structuredModel.invoke(messages);

        logger.llm.info(`Success with provider: ${config.provider}`);
        return result as z.infer<T>;
      } catch (error) {
        const llmError = adapter.classifyError(error);
        errors.push(llmError);

        logger.llm.warn(`Provider ${config.provider} failed`, {
          error: llmError.message,
          retryable: isRetryableError(llmError),
          originalError: error instanceof Error ? error.message : String(error),
        });

        // Non-retryable errors should fail immediately
        if (!isRetryableError(llmError)) {
          throw llmError;
        }

        // Retryable error - continue to next provider
        logger.llm.info(`Falling back from ${config.provider}`);
      }
    }

    // No providers were available
    if (errors.length === 0) {
      throw new LLMError(
        priorityList[0]?.provider ?? "openai",
        "No LLM providers available. Check that at least one API key is configured."
      );
    }

    // All providers failed with retryable errors
    const lastError = errors[errors.length - 1];
    throw new LLMError(
      lastError.provider,
      `All LLM providers failed. Last error: ${lastError.message}`,
      lastError
    );
  }

  /**
   * Invoke an LLM for plain text output, using automatic fallback.
   *
   * @param priorityList - List of model configurations in priority order
   * @param messages - Messages to send to the model
   * @returns Text response from the model
   * @throws LLMError if all providers fail or a non-retryable error occurs
   */
  async invoke(
    priorityList: ModelPriorityList,
    messages: MessageContent[]
  ): Promise<string> {
    const errors: LLMError[] = [];

    for (const config of priorityList) {
      const adapter = this.adapters.get(config.provider);

      if (!adapter) {
        logger.llm.warn(`No adapter registered for provider: ${config.provider}`);
        continue;
      }

      if (!adapter.isAvailable()) {
        logger.llm.info(`Provider ${config.provider} not available, skipping`);
        continue;
      }

      try {
        logger.llm.info(`Trying provider: ${config.provider}`, {
          model: config.modelId,
        });

        const model = adapter.createLangChainModel(config);
        const response = await model.invoke(messages);

        // Extract text content from response
        const content = response.content;
        const text =
          typeof content === "string"
            ? content
            : content
                .filter((part): part is { type: "text"; text: string } =>
                  typeof part === "object" && part.type === "text"
                )
                .map((part) => part.text)
                .join("");

        logger.llm.info(`Success with provider: ${config.provider}`);
        return text;
      } catch (error) {
        const llmError = adapter.classifyError(error);
        errors.push(llmError);

        logger.llm.warn(`Provider ${config.provider} failed`, {
          error: llmError.message,
          retryable: isRetryableError(llmError),
          originalError: error instanceof Error ? error.message : String(error),
        });

        if (!isRetryableError(llmError)) {
          throw llmError;
        }

        logger.llm.info(`Falling back from ${config.provider}`);
      }
    }

    if (errors.length === 0) {
      throw new LLMError(
        priorityList[0]?.provider ?? "openai",
        "No LLM providers available. Check that at least one API key is configured."
      );
    }

    const lastError = errors[errors.length - 1];
    throw new LLMError(
      lastError.provider,
      `All LLM providers failed. Last error: ${lastError.message}`,
      lastError
    );
  }
}
