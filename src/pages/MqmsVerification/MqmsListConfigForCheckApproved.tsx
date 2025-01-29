import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { useMQMSAuth } from "../../hooks/useMQMSAuth";
import { SearchParams } from "../../types/SearchParams";
import { CLICKUP_LIST_IDS } from "../../utils/config";
import MqmsCheckApprovedTasks from "./MqmsCheckApprovedTasks";

const searchParams: SearchParams = {
  "statuses[]": ["sent"],
};

function MqmsListConfigForCheckApproved() {
  const { accessToken } = useMQMSAuth();
  const { clickUpTasks } = useFetchClickUpTasks(
    CLICKUP_LIST_IDS.cciBau,
    searchParams
  );

  return (
    <div>
      <MqmsCheckApprovedTasks
        accessToken={accessToken}
        clickUpTasks={clickUpTasks}
      />
    </div>
  );
}

export default MqmsListConfigForCheckApproved;
