import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Header } = Layout;

function HeaderComponent() {
  const items1: MenuProps["items"] = [
    { key: "/", label: <Link to="/">Home</Link> },
    { key: "/task-sync", label: <Link to="/task-sync">Tasks Sync</Link> },
    {
      key: "/production-contratistas",
      label: (
        <Link to="/production-contratistas">Producción de Contratistas</Link>
      ),
    },
    {
      key: "/income-reports",
      label: <Link to="/income-reports">Income Reports</Link>,
    },
    {
      key: "/mqms-verification",
      label: <Link to="/mqms-verification">MQMS</Link>,
    },
  ];

  const currentPath = useLocation().pathname;

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
        defaultSelectedKeys={[currentPath]}
        items={items1}
        style={{ flex: 1, minWidth: 0, height: "100%" }}
      ></Menu>
    </Header>
  );
}

export default HeaderComponent;
