import { Flex, Radio } from "antd";
import { CheckboxGroupProps } from "antd/es/checkbox";
import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { appPaths, routeSegments } from "../../router/paths";

const options: CheckboxGroupProps<string>["options"] = [
  {
    label: "Check Approved Tasks",
    value: routeSegments.mqmsVerification.checkApproved,
  },
  {
    label: "Sync Timetracking",
    value: routeSegments.mqmsVerification.timetracking,
  },
];

function MqmsVerificationSelector() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedFeature = useMemo(() => {
    if (
      location.pathname.startsWith(appPaths.mqmsVerification.checkApproved)
    ) {
      return routeSegments.mqmsVerification.checkApproved;
    }

    if (
      location.pathname.startsWith(appPaths.mqmsVerification.timetracking)
    ) {
      return routeSegments.mqmsVerification.timetracking;
    }

    return null;
  }, [location.pathname]);

  return (
    <Flex vertical gap="small" align="center" justify="center">
      {!selectedFeature && (
        <p style={{ lineHeight: "14px" }}>Seleccione una opción</p>
      )}
      <Radio.Group
        block
        options={options}
        optionType="button"
        value={selectedFeature}
        buttonStyle="solid"
        onChange={(e) => navigate(e.target.value, { relative: "path" })}
        style={{ width: "50%" }}
      />
      <Outlet />
    </Flex>
  );
}

export default MqmsVerificationSelector;
