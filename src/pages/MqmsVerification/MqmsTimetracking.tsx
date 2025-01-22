import { useMQMSAuth } from "../../hooks/useMQMSAuth";
import { useMQMSDesignTeam } from "../../hooks/useMQMSDesignTeam";

function MqmsTimetracking() {
  const { accessToken } = useMQMSAuth();
  const { userHierarchy } = useMQMSDesignTeam(accessToken);

  if (userHierarchy.length > 0) {
    console.log(userHierarchy);
  }

  return <div>time</div>;
}

export default MqmsTimetracking;
