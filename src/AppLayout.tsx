import { Outlet, useNavigation } from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent";
import { Flex, Layout } from "antd";
import Loader from "./components/Loader";

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
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";

  return (
    <Flex>
      <Layout style={layoutStyle}>
        <HeaderComponent />
        <Content style={contentStyle}>
          {isLoading ? <Loader /> : <Outlet />}
        </Content>
      </Layout>
    </Flex>
  );
}

export default AppLayout;
