import { Flex, Layout, Spin } from "antd";
import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import HeaderComponent from "../../components/HeaderComponent";

const { Content } = Layout;

const contentStyle: React.CSSProperties = {
  textAlign: "center",
  minHeight: 120,
  lineHeight: "120px",
  padding: 48,
  overflow: "auto",
};

const layoutStyle = {
  overflow: "hidden",
  width: "100%",
  height: "100vh",
};

function RootLayout() {
  return (
    <Flex>
      <Layout style={layoutStyle}>
        <HeaderComponent />
        <Content style={contentStyle}>
          <Suspense fallback={<Spin />}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
      <ScrollRestoration />
    </Flex>
  );
}

export default RootLayout;

