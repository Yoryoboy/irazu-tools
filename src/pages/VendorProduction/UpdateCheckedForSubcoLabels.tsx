import { Button, notification } from "antd";
import { CustomField, ExtractedTaskFieldValues } from "../../types/Task";
import { useState } from "react";
import { CLICKUP_HS_CUSTOM_FIELDS } from "../../constants/clickUpCustomFields";
import {
  getTaskLabelPayload,
  updateCustomFieldLabel,
} from "../../utils/clickUpApi";
import { mergeTaskLabelPayload } from "../../utils/helperFunctions";

interface Props {
  tasks: ExtractedTaskFieldValues[];
}

function UpdateCheckedForSubcoLabels({ tasks }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkedForSubcoCustomField: CustomField =
    CLICKUP_HS_CUSTOM_FIELDS.fields.find(
      (field) => field.name === "CHECKED FOR SUBCO"
    )!;

  const handleUpdateLabels = async () => {
    setLoading(true);
    setError(null);

    const unmergedTaskLabelsPayload = tasks.map((task) =>
      getTaskLabelPayload(task, checkedForSubcoCustomField)
    );

    const mergedTaskLabelsPayload = mergeTaskLabelPayload(
      unmergedTaskLabelsPayload
    );

    const results = await Promise.allSettled(
      mergedTaskLabelsPayload.map((task) => {
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
