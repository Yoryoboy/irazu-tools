import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation } from "react-router-dom";
import { appPaths, deriveNavigationKey } from "../router/paths";

const { Header } = Layout;

function HeaderComponent() {
  const items1: MenuProps["items"] = [
    { key: appPaths.root, label: <Link to={appPaths.root}>Home</Link> },
    {
      key: appPaths.taskSync,
      label: <Link to={appPaths.taskSync}>Tasks Sync</Link>,
    },
    {
      key: appPaths.vendorProduction,
      label: (
        <Link to={appPaths.vendorProduction}>
          Producción de Contratistas
        </Link>
      ),
    },
    {
      key: appPaths.incomeReports,
      label: <Link to={appPaths.incomeReports}>Income Reports</Link>,
    },
    {
      key: appPaths.mqmsVerification.root,
      label: <Link to={appPaths.mqmsVerification.root}>MQMS</Link>,
    },
  ];

  const currentPath = useLocation().pathname;
  const selectedKey = deriveNavigationKey(currentPath);

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
        selectedKeys={selectedKey ? [selectedKey] : []}
        items={items1}
        style={{ flex: 1, minWidth: 0, height: "100%" }}
      ></Menu>
    </Header>
  );
}

export default HeaderComponent;
