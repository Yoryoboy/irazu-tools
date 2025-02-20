import { useFetchClickUpTasks } from "../../hooks/useClickUp";
import { useMQMSAuth } from "../../hooks/useMQMSAuth";
import { SearchParams } from "../../types/SearchParams";
import { CLICKUP_LIST_IDS } from "../../utils/config";
import MqmsCheckApprovedTasks from "./ApprovedTasks/MqmsCheckApprovedTasks";

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

  return (
    <>
      {accessToken && (
        <div>
          {bauClickUpTasks.length > 0 && (
            <MqmsCheckApprovedTasks
              accessToken={accessToken}
              clickUpTasks={bauClickUpTasks}
            />
          )}
          {hsClickUpTasks.length > 0 && (
            <MqmsCheckApprovedTasks
              accessToken={accessToken}
              clickUpTasks={hsClickUpTasks}
            />
          )}
        </div>
      )}
    </>
  );
}

export default MqmsListConfigForCheckApproved;
