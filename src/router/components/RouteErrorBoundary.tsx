import { Button, Result } from "antd";
import type { ResultStatusType } from "antd/es/result";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

function RouteErrorBoundary() {
  const navigate = useNavigate();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const status: ResultStatusType =
      error.status === 404
        ? "404"
        : error.status === 403
          ? "403"
          : error.status === 500
            ? "500"
            : "error";

    return (
      <Result
        status={status}
        title={error.status}
        subTitle={error.statusText || "Se produjo un error inesperado."}
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            Volver
          </Button>
        }
      />
    );
  }

  const message =
    error instanceof Error ? error.message : "Se produjo un error inesperado.";

  return (
    <Result
      status="error"
      title="Algo salió mal"
      subTitle={message}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      }
    />
  );
}

export default RouteErrorBoundary;
