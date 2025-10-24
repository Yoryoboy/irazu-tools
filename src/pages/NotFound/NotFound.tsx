import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="La página que buscas no existe."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Ir al inicio
        </Button>
      }
    />
  );
}

export default NotFound;

