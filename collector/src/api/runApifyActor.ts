import { APIFY_BASE_URL, getApifyApiKey } from "./apifyConfig.js";

const FACEBOOK_EVENTS_ACTOR_ID = "UZBnerCFBo5FgGouO";
const BRONNØYSUND_LOCATION_ID = "103758419663407";
const DISCOVERY_DATE_RANGE_MONTHS = 6;
const POLL_INTERVAL_MS = 10_000;
const ACTOR_TIMEOUT_SECONDS = 300;
const MAX_EVENTS = 40;
const MAX_WAIT_MS = ACTOR_TIMEOUT_SECONDS * 1000;

enum ActorRunStatus {
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  ABORTED = "ABORTED",
  TIMED_OUT = "TIMED-OUT",
}

interface ActorRunResponse {
  data: {
    id: string;
    defaultDatasetId: string;
    status: ActorRunStatus;
  };
}

function buildSearchFilters(startDate: Date, endDate: Date): string {
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const filters = {
    "rp_events_location:0": JSON.stringify({
      name: "filter_events_location",
      args: BRONNØYSUND_LOCATION_ID,
    }),
    "filter_events_date_range:0": JSON.stringify({
      name: "filter_events_date",
      args: `${formatDate(startDate)}~${formatDate(endDate)}`,
    }),
  };

  return btoa(JSON.stringify(filters));
}

export function buildFacebookSearchUrl(
  startDate: Date = new Date()
): string {
  const endDate = new Date(startDate);
  endDate.setUTCMonth(endDate.getUTCMonth() + DISCOVERY_DATE_RANGE_MONTHS);

  const filters = buildSearchFilters(startDate, endDate);

  return `https://www.facebook.com/events/search?q=Brønnøysund&filters=${filters}`;
}

export async function startApifyActorRun(): Promise<string> {
  const apiKey = getApifyApiKey();
  const discoveryUrl = buildFacebookSearchUrl();
  const url = `${APIFY_BASE_URL}/acts/${FACEBOOK_EVENTS_ACTOR_ID}/runs?token=${apiKey}&timeout=${ACTOR_TIMEOUT_SECONDS}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startUrls: [discoveryUrl],
      maxEvents: MAX_EVENTS,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to start Apify actor: ${response.status} ${response.statusText}`
    );
  }

  const result = (await response.json()) as ActorRunResponse;
  return result.data.id;
}

export async function waitForActorRun(runId: string): Promise<string> {
  const apiKey = getApifyApiKey();
  const url = `${APIFY_BASE_URL}/actor-runs/${runId}?token=${apiKey}`;
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_MS) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to check actor run status: ${response.status} ${response.statusText}`
      );
    }

    const result = (await response.json()) as ActorRunResponse;
    const { status, defaultDatasetId } = result.data;

    if (status === ActorRunStatus.SUCCEEDED || status === ActorRunStatus.TIMED_OUT) {
      return defaultDatasetId;
    }

    if (status === ActorRunStatus.FAILED || status === ActorRunStatus.ABORTED) {
      throw new Error(`Apify actor run failed with status: ${status}`);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    `Apify actor run timed out after ${ACTOR_TIMEOUT_SECONDS} seconds.`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
