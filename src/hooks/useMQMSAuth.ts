import { useEffect, useState } from "react";
import { MQMSUser } from "../types/MQMS";
import { getTask } from "../utils/clickUpApi";
const JORGE_TASK_ID = "85zrxj6q8";

export function useMQMSAuth() {
  const [MQMSUser, setMQMSUser] = useState<MQMSUser | null>(null);
  const { accessToken } = MQMSUser || {};

  useEffect(() => {
    async function fetchCredentialsAndLogin() {
      try {
        const taskResult = await getTask(JORGE_TASK_ID);
        if (!taskResult.success) {
          throw new Error("No se pudo obtener los credenciales de Jorge");
        }
        const mqms_username = taskResult.data.custom_fields?.find(
          (field) => field.name?.toLowerCase() === "pid"
        )?.value as string;
        const mqms_password = taskResult.data.custom_fields?.find(
          (field) => field.name?.toLowerCase() === "charter password"
        )?.value as string;

        const body = JSON.stringify({
          username: mqms_username,
          password: mqms_password,
        });

        const url = "https://mqms.corp.chartercom.com/api/login";

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
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    }

    fetchCredentialsAndLogin();
  }, []);

  return { MQMSUser, accessToken };
}
