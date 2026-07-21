import crypto from "crypto";

const INSTAGRAM_GRAPH_API = "https://graph.instagram.com/v25.0";

export async function instagramApiCall(
  endpoint: string,
  token: string,
  method: "GET" | "POST" = "GET",
  data?: Record<string, any>
) {
  const url = `${INSTAGRAM_GRAPH_API}${endpoint}${
    method === "GET" && data ? "?" + new URLSearchParams(data).toString() : ""
  }`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: method === "POST" ? JSON.stringify(data || {}) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Instagram API: ${error.error?.message || response.statusText}`);
  }

  return response.json();
}

export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `sha256=${hash}` === signature;
}