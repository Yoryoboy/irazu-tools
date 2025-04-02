
import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { CLICKUP_LIST_IDS } from "../../utils/config";
import { SearchParams } from "../../types/SearchParams";
import { CustomField, User } from "../../types/Task";

const bauSearchParams: SearchParams = {
  "statuses[]": ["approved"],
};

function IncomeReports() {

  const { clickUpTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciBau,
    bauSearchParams
  );

  const approvedBauTasks = clickUpTasks.map((task) => {
      const receivedDate = task?.custom_fields?.find(
        (field) => field.name === "RECEIVED DATE"
      )?.value as string;
      const completionDate = task?.custom_fields?.find(
        (field) => field.name === "ACTUAL COMPLETION DATE"
      )?.value as string;
      const codes = task?.custom_fields?.filter(
        (field) =>
          field.type === "number" &&
          field.value &&
          (field.name?.includes("(EA)") ||
            field.name?.includes("(FT)") ||
            field.name?.includes("(HR)"))
      ) as CustomField[];
  
      return {
        id: task.id as string,
        name: task.name,
        receivedDate: new Date(Number(receivedDate)).toLocaleDateString(),
        completionDate: new Date(Number(completionDate)).toLocaleDateString(),
        codes,
      };
    });

  const prices = {
    "COAX ASBUILD / 27240 (EA)": 20.00,
    "COAX ASBUILT FOOTAGE > 1,500’ / 27529 (FT)": 0.0025,
    "FIBER ASBUILD / 27242 (EA)": 25.00,
    "FIBER ASBUILT FOOTAGE > 1,500’ / 27530 (FT)": 0.0025,
    "COAX NEW BUILD < 1,500’ / 27281 (EA)": 75.00,
    "NEW COAX FOOTAGE OVER 1500 / 27280 (FT)": 0.0200,
    "FIBER NEW BUILD < 1,500’ / 27282 (EA)": 150.00,
    "NEW FIBER FOOTAGE OVER 1500 / 27280 (FT)": 0.0200,
    "RDOF Architecture / 40555 (MILE)": 125.00,
    "NODE SPLIT PRELIM / 35539 (EA)": 55.00,
    "SUBCO ONLY Node Seg/Split Asbuild / 35473 (EA)": 125.00,
  };

  const bauIncome = approvedBauTasks.reduce<Array<{
    id: string;
    name: string;
    receivedDate: string;
    completionDate: string;
    code: string;
    quantity: string | number | User[] | null | undefined;
    price: number;
    total: number;
  }>>((acc, task) => {
    task.codes?.forEach(code => {
      acc.push({
        id: task.id,
        name: task.name,
        receivedDate: task.receivedDate,
        completionDate: task.completionDate,
        code: code.name || '',
        quantity: code.value,
        price: prices[code.name as keyof typeof prices] || 0,
        total: Number(code.value) * (prices[code.name as keyof typeof prices] || 0)
      });
    });
    return acc;
  }, []);

  console.log(bauIncome);

  return (
    <main>

    </main>
  );
}

export default IncomeReports;