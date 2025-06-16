import { Flex, Radio } from "antd";
import { CheckboxGroupProps } from "antd/es/checkbox";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const options: CheckboxGroupProps<string>["options"] = [
  { label: "Check Approved Tasks", value: "check-approved-tasks" },
  // { label: "Sync Timetracking", value: "timetracking" },
];

function MqmsVerificationSelector() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedFeature) {
      navigate(`/mqms-verification/${selectedFeature}`);
    }
  }, [selectedFeature, navigate]);

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
        onChange={(e) => setSelectedFeature(e.target.value)}
        style={{ width: "50%" }}
      />
      {selectedFeature && <Outlet />}
    </Flex>
  );
}

export default MqmsVerificationSelector;
