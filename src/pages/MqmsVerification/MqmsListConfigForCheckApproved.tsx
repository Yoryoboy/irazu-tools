import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { useMQMSAuth } from "../../hooks/useMQMSAuth";
import { SearchParams } from "../../types/SearchParams";
import { CLICKUP_LIST_IDS } from "../../utils/config";
import MqmsCheckApprovedTasks from "./MqmsCheckApprovedTasks";

const bauSearchParams: SearchParams = {
  "statuses[]": ["sent"],
};

const hsSearchParams: SearchParams = {
  "statuses[]": ["sent", "redesign sent"],
};

function MqmsListConfigForCheckApproved() {
  const { accessToken } = useMQMSAuth();
  const { clickUpTasks: bauClickUpTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciBau,
    bauSearchParams
  );
  const { clickUpTasks: hsClickUpTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciHs,
    hsSearchParams
  );

  console.log(hsClickUpTasks.length);

  return (
    <div>
      <MqmsCheckApprovedTasks
        accessToken={accessToken}
        clickUpTasks={bauClickUpTasks}
      />
      <MqmsCheckApprovedTasks
        accessToken={accessToken}
        clickUpTasks={hsClickUpTasks}
      />
    </div>
  );
}

export default MqmsListConfigForCheckApproved;
