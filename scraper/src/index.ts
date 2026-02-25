import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createAgent } from "./agent.js";
import { TARGET_SOURCES } from "./sources.js";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env") });

if (!process.env.MISTRAL_API_KEY) {
  console.error("Error: MISTRAL_API_KEY is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const args = process.argv.slice(2);
const sourceArgIndex = args.indexOf("--source");
const sources =
  sourceArgIndex !== -1 && args[sourceArgIndex + 1]
    ? [args[sourceArgIndex + 1]]
    : TARGET_SOURCES;

const taskPrompt = `You are a web scraping agent for a local Norwegian events aggregator covering Brønnøysund.

For each source URL below, perform these steps in order:
1. Call fetchPage with the URL to retrieve cleaned page text.
2. Call extractEvents with the page text and source URL to extract structured events.
3. Call writeEvents with the resulting JSON to save the events.

Rules:
- Use each URL exactly as written — do not alter, correct, or encode any characters.
- If fetchPage returns a FETCH_ERROR, skip that source and continue with the next one.
- Process each source completely before moving to the next.

Sources:
${sources.map((url, index) => `${index + 1}. ${url}`).join("\n")}`;

async function main() {
  console.log(`Scraping ${sources.length} source(s)...\n`);

  const agent = createAgent();
  const stream = await agent.stream(
    { messages: [{ role: "user", content: taskPrompt }] },
    { recursionLimit: sources.length * 10 }
  );

  for await (const chunk of stream) {
    if ("agent" in chunk) {
      for (const message of chunk.agent.messages) {
        if (typeof message.content === "string" && message.content) {
          console.log("[Agent]", message.content);
        }
        if ("tool_calls" in message && Array.isArray((message as any).tool_calls)) {
          for (const toolCall of (message as any).tool_calls) {
            const argsPreview = JSON.stringify(toolCall.args).slice(0, 120);
            console.log(`[Tool call] ${toolCall.name}(${argsPreview}...)`);
          }
        }
      }
    }
    if ("tools" in chunk) {
      for (const message of chunk.tools.messages) {
        const content =
          typeof message.content === "string"
            ? message.content
            : JSON.stringify(message.content);
        console.log(`[Tool result] ${(message as any).name}: ${content.slice(0, 200)}`);
      }
    }
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
