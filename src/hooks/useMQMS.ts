import { useEffect, useState } from "react";
import { MQMSUser } from "../types/MQMS";

export function useMQMS(listOfSentTasks: string[] = []) {
  const [MQMSUser, setMQMSUser] = useState<MQMSUser | null>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!MQMSUser || listOfSentTasks.length === 0) {
      return;
    }

    const { accessToken } = MQMSUser;
    const body = JSON.stringify({
      archiveBucket: "live",
      externalID: listOfSentTasks,
    });
    const url =
      "https://mqms.corp.chartercom.com/api/work-requests/search?srcTimezone=America/Buenos_Aires";
    const headers = {
      "Content-Type": "application/json",
      Authorizations: `Bearer ${accessToken}`,
    };

    async function fetchMQMSTasks() {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch MQMS tasks");
      }

      const data = await response.json();
      console.log(data);
    }
    fetchMQMSTasks();
  }, [MQMSUser, listOfSentTasks]);

  return { MQMSUser };
}
