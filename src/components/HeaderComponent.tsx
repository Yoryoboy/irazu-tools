import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { Link } from "react-router-dom";

const { Header } = Layout;

function HeaderComponent() {
  const items1: MenuProps["items"] = [
    { key: "1", label: <Link to="/">Home</Link> },
    { key: "2", label: <Link to="/task-sync">Tasks Sync</Link> },
    {
      key: "3",
      label: (
        <Link to="/production-contratistas">Producción de Contratistas</Link>
      ),
    },
    {
      key: "4",
      label: <Link to="/mqms-verification">MQMS</Link>,
    },
  ];

  const headerStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#fff",
    height: 64,
    display: "flex",
    alignItems: "center",
    gap: 44,
  };

  return (
    <Header style={headerStyle}>
      <h1>Irazu Tools</h1>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={["1"]}
        items={items1}
        style={{ flex: 1, minWidth: 0, height: "100%" }}
      ></Menu>
    </Header>
  );
}

export default HeaderComponent;
