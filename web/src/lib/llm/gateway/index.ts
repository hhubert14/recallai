import { LangChainGateway } from "./langchain-gateway";
import { GoogleAdapter } from "../adapters/google.adapter";
import { GroqAdapter } from "../adapters/groq.adapter";
import { OpenAIAdapter } from "../adapters/openai.adapter";

/**
 * Creates a LangChain gateway with all registered adapters.
 *
 * The gateway automatically handles fallback between providers.
 * Available providers are determined by which API keys are configured.
 */
export function createLangChainGateway(): LangChainGateway {
  return new LangChainGateway([
    new GoogleAdapter(),
    new GroqAdapter(),
    new OpenAIAdapter(),
    // Add more adapters here as they are implemented
  ]);
}

export { LangChainGateway } from "./langchain-gateway";
