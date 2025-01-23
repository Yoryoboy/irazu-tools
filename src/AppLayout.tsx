import { Outlet } from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent";
import { Flex, Layout } from "antd";

const { Content } = Layout;

const contentStyle: React.CSSProperties = {
  textAlign: "center",
  minHeight: 120,
  lineHeight: "120px",
  padding: 48,
  overflow: "auto",
};

const layoutStyle = {
  width: "100%",
  height: "100vh",
};

function AppLayout() {
  return (
    <Flex>
      <Layout style={layoutStyle}>
        <HeaderComponent />
        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Flex>
  );
}

export default AppLayout;
