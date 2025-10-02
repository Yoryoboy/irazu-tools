import { Button, notification } from "antd";
import { ExtractedTaskFieldValues, TaskRow } from "../../types/Task";
import { useState } from "react";
import { updateCustomFieldLabel } from "../../utils/clickUpApi";
import { getCheckedSubcoBillingStatusPayloads, sendBatchedRequests } from "../../utils/helperFunctions";

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

    console.log(`Preparing to update ${checkedSubcoBillingStatusPayloads.length} tasks...`);

    try {
      // Usar sendBatchedRequests para respetar el rate limit de ClickUp (100 req/min)
      const results = await sendBatchedRequests(
        checkedSubcoBillingStatusPayloads,
        80, // Batch size: 80 requests por lote
        async (payload) => {
          const { taskId, customFieldId, value } = payload;
          if (!taskId || !customFieldId || value === undefined) {
            throw new Error("Missing required parameters");
          }
          return await updateCustomFieldLabel(taskId, customFieldId, value);
        }
      );

      setLoading(false);

      // Calcular éxitos y fallos
      const successes = results.filter((result) => result.success);
      const errors = results.filter((result) => !result.success);

      if (errors.length > 0) {
        setError(
          `${errors.length} tasks failed to update. Check console for details.`
        );
        notification.error({
          message: "Error",
          description: `${errors.length} tasks failed to update.`,
        });
        console.error("Failed tasks:", errors);
      }

      if (successes.length > 0) {
        notification.success({
          message: "Success",
          description: `${successes.length} tasks updated successfully!`,
        });
      }
    } catch (error) {
      setLoading(false);
      setError("An unexpected error occurred. Check console for details.");
      notification.error({
        message: "Error",
        description: "An unexpected error occurred while updating tasks.",
      });
      console.error("Error in handleUpdateLabels:", error);
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
