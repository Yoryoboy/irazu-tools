import { useFilteredClickUpTasks } from "../../hooks/useClickUp";

const teamId = "3051792";

function VendorDetails({ userId }: { userId: string }) {
  const queryParams = {
    assignees: userId,
    include_closed: "true",
    page: "0",
    order_by: "date_created",
    reverse: "true",
  };

  const { data, isLoading, error } = useFilteredClickUpTasks({
    teamId,
    queryParams,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Tasks Assigned to User {userId}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default VendorDetails;
