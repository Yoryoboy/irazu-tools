import { useEffect, useState } from "react";
import { MQMSUser } from "../types/MQMS";
import { MQMS_PASSWORD, MQMS_USERNAME } from "../utils/config";

export function useMQMSAuth() {
  const [MQMSUser, setMQMSUser] = useState<MQMSUser | null>(null);
  const { accessToken } = MQMSUser || {};

  useEffect(() => {
    const body = JSON.stringify({
      username: MQMS_USERNAME,
      password: MQMS_PASSWORD,
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

  return { MQMSUser, accessToken };
}
