import { Result } from "antd";
import { useNavigate, useRouteError } from "react-router-dom";

function Error() {
  const navigate = useNavigate();

  const error = useRouteError();

  return (
    <div>
      <Result
        status={error.status}
        title={`${error.status}: ${error.statusText}`}
        subTitle={error.data}
      />
      <button onClick={() => navigate(-1)}>Volver</button>
    </div>
  );
}

export default Error;
