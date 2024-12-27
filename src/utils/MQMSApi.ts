export async function fetchMQMSTasks(
  headers: HeadersInit,
  url: string,
  body: string
) {
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
