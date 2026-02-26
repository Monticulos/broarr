import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatMistralAI } from "@langchain/mistralai";
import { fetchPage } from "./tools/fetchPage.js";
import { extractEvents } from "./tools/extractEvents.js";
import { writeEvents } from "./tools/writeEvents.js";

export function createAgent() {
  const model = new ChatMistralAI({ model: "mistral-small-latest" });
  return createReactAgent({
    llm: model,
    tools: [fetchPage, extractEvents, writeEvents],
  });
}
