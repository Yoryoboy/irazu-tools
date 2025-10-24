import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { Link, useLocation } from "react-router-dom";
import { appPaths, deriveNavigationKey } from "../router/paths";
import { DESIGNER_VIEW } from "../utils/config";

const { Header } = Layout;

function HeaderComponent() {
  const items: MenuProps["items"] = [
    { key: appPaths.root, label: <Link to={appPaths.root}>Home</Link> },
    {
      key: appPaths.taskSync,
      label: <Link to={appPaths.taskSync}>Tasks Sync</Link>,
    },
    {
      key: appPaths.mqmsVerification.root,
      label: <Link to={appPaths.mqmsVerification.root}>MQMS</Link>,
    },
  ];

  if (!DESIGNER_VIEW) {
    items.splice(2, 0, {
      key: appPaths.vendorProduction,
      label: (
        <Link to={appPaths.vendorProduction}>
          Producción de Contratistas
        </Link>
      ),
    });

    items.splice(3, 0, {
      key: appPaths.incomeReports,
      label: <Link to={appPaths.incomeReports}>Income Reports</Link>,
    });
  }

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
        items={items}
        style={{ flex: 1, minWidth: 0, height: "100%" }}
      ></Menu>
    </Header>
  );
}

export default HeaderComponent;
