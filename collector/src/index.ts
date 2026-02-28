import { readFileSync } from "fs";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createAgent } from "./agent.js";
import { TARGET_SOURCES, type Source } from "./sources.js";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env") });

if (!process.env.MISTRAL_API_KEY) {
  console.error("Error: MISTRAL_API_KEY is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const args = process.argv.slice(2);
const sourceArgIndex = args.indexOf("--source");
const sources: Source[] =
  sourceArgIndex !== -1 && args[sourceArgIndex + 1]
    ? [{ url: args[sourceArgIndex + 1], name: args[sourceArgIndex + 1] }]
    : TARGET_SOURCES;

const PROMPTS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "prompts");
const agentTaskTemplate = readFileSync(resolve(PROMPTS_DIR, "agent-task.md"), "utf-8");

const sourcesList = sources
  .map((source, index) => {
    const selectorNote = source.selector ? ` (selector: "${source.selector}")` : "";
    return `${index + 1}. ${source.url}${selectorNote}`;
  })
  .join("\n");

const taskPrompt = `${agentTaskTemplate}\n${sourcesList}`;

async function main() {
  console.log(`Collecting from ${sources.length} source(s)...\n`);

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
