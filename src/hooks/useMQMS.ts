import { useState } from "react";
import { MQMSUser } from "../types/MQMS";

export function useMQMS() {
  const [MQMSUser, setMQMSUser] = useState<MQMSUser | null>(null);

  const body = JSON.stringify({
    username: "P3192616",
    password: "tJKd%58LW$8D",
  });

  const url = "https://mqms.corp.chartercom.com/api/login";

  async function login() {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch MQMS user");
    }

    const data = await response.json();
    setMQMSUser(data);
  }

  login();

  return { MQMSUser };
}
