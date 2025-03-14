import { Button, notification } from "antd";
import { ExtractedTaskFieldValues, TaskRow } from "../../types/Task";
import { useState } from "react";
import { updateCustomFieldLabel } from "../../utils/clickUpApi";
import { getCheckedSubcoBillingStatusPayloads } from "../../utils/helperFunctions";

interface Props {
  tasks: ExtractedTaskFieldValues[] | TaskRow[];
}

function UpdateCheckedForSubcoLabels({ tasks }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateLabels = async () => {
    setLoading(true);
    setError(null);

    const checkedSubcoBillingStatusPayloads =
      getCheckedSubcoBillingStatusPayloads(tasks);

    console.log(checkedSubcoBillingStatusPayloads);

    const results = await Promise.allSettled(
      checkedSubcoBillingStatusPayloads.map((task) => {
        const { taskId, customFieldId, value } = task;
        if (!taskId || !customFieldId || !value) {
          return Promise.reject("Missing required parameters");
        }
        return updateCustomFieldLabel(taskId, customFieldId, value);
      })
    );

    const errors = results.filter((result) => result.status === "rejected");
    const successes = results.filter((result) => result.status === "fulfilled");

    setLoading(false);

    if (errors.length > 0) {
      setError(
        `${errors.length} tasks failed to update. Check console for details.`
      );
      notification.error({
        message: "Error",
        description: `${errors.length} tasks failed to update.`,
      });
      console.error(
        "Failed tasks:",
        errors.map((e) => (e.status === "rejected" ? e.reason : null))
      );
    }

    if (successes.length > 0) {
      notification.success({
        message: "Success",
        description: `${successes.length} tasks updated successfully!`,
      });
    }
  };

  return (
    <div>
      <Button
        type="primary"
        shape="round"
        size="large"
        onClick={handleUpdateLabels}
        loading={loading}
        disabled={tasks.length === 0}
      >
        Update Checked For Subco Labels
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default UpdateCheckedForSubcoLabels;
