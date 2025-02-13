import {
  FetchMQMSTaskByNameResponse,
  FetchMQMSTaskByUuidResponse,
} from "../types/MQMS";

export async function fetchMQMSTaskByName(
  headers: HeadersInit,
  url: string,
  body: string
): Promise<FetchMQMSTaskByNameResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch MQMS tasks");
  }

  const data = await response.json();
  return data;
}

export async function fetchMQMSTaskByUuid(
  headers: HeadersInit,
  url: string
): Promise<FetchMQMSTaskByUuidResponse> {
  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch MQMS tasks");
  }

  const data = await response.json();
  return data;
}
