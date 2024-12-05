import { Flex, Layout } from "antd";
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./AppRouter";

const { Header, Content, Footer } = Layout;

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  height: 64,
  paddingInline: 48,
  lineHeight: "64px",
  backgroundColor: "#4096ff",
};

const contentStyle: React.CSSProperties = {
  textAlign: "center",
  minHeight: 120,
  lineHeight: "120px",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  backgroundColor: "#4096ff",
};

const layoutStyle = {
  borderRadius: 8,
  overflow: "hidden",
  width: "100%",
  height: "100vh",
};

function App() {
  return (
    <Router>
      <Flex>
        <Layout style={layoutStyle}>
          <Header style={headerStyle}>Header</Header>
          <Content style={contentStyle}>
            <AppRouter />
          </Content>
          <Footer style={footerStyle}>Irazu Tools</Footer>
        </Layout>
      </Flex>
    </Router>
  );
}

export default App;
