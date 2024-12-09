import { useEffect, useState } from "react";
import { SearchParams, Task } from "../../types";

function VendorProduction() {
  const [asbuilts, setAsbuilts] = useState<Task[]>([]);

  useEffect(() => {
    function fetchAsbuiltsByAssignee(
      teamId: string,
      serachParams: SearchParams,
      apiKey: string
    ) {
      const query = new URLSearchParams(serachParams).toString();

      fetch(`https://api.clickup.com/api/v2/team/${teamId}/task?${query}`, {
        method: "GET",
        headers: {
          Authorization: apiKey,
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(
                `Error fetching data: ${JSON.stringify(errorData)}`
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          const { tasks } = data;
          console.log(tasks.length);
          setAsbuilts(tasks);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    }

    const teamId = "3051792";
    const searchParams: SearchParams = {
      page: "0",
      "assignees[]": "43076422",
      "list_ids[]": "900200859937",
      include_closed: "true",
      custom_fields: JSON.stringify([
        {
          field_id: "d723d3df-b63f-46a2-9f48-02709670787b",
          operator: "NOT ANY",
          value: ["6f05f0da-8a0e-417e-980e-55530898e0b9"],
        },
      ]),
    };

    fetchAsbuiltsByAssignee(
      teamId,
      searchParams,
      import.meta.env.VITE_CLICKUP_API_AKEY
    );
  }, []);

  return (
    <pre style={{ textAlign: "left", lineHeight: "1" }}>
      {JSON.stringify(asbuilts, null, 2)}
    </pre>
  );
}

export default VendorProduction;
