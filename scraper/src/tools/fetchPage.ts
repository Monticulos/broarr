import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const JS_RENDER_THRESHOLD = 500;

function extractText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, nav, footer, header, aside").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

async function fetchWithPuppeteer(url: string): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
    // Give client-side routers extra time to render after network settles
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const html = await page.content();
    return extractText(html);
  } finally {
    await browser.close();
  }
}

export const fetchPage = tool(
  async ({ url }) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const text = extractText(html);

      if (text.length < JS_RENDER_THRESHOLD) {
        return (await fetchWithPuppeteer(url)).slice(0, 8000);
      }

      return text.slice(0, 8000);
    } catch {
      try {
        return (await fetchWithPuppeteer(url)).slice(0, 8000);
      } catch (error) {
        return `FETCH_ERROR: ${error instanceof Error ? error.message : String(error)}. Skip this source and move on to the next one.`;
      }
    }
  },
  {
    name: "fetchPage",
    description:
      "Fetch a webpage and return clean plain text suitable for event extraction. Automatically uses a headless browser for JavaScript-rendered pages.",
    schema: z.object({ url: z.string().url() }),
  }
);
