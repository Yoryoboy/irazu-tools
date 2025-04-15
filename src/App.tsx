import { Flex, Layout } from 'antd';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './AppRouter';
import HeaderComponent from './components/HeaderComponent';

const { Content } = Layout;

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  padding: 48,
  overflow: 'auto',
};

const layoutStyle = {
  overflow: 'hidden',
  width: '100%',
  height: '100vh',
};

function App() {
  return (
    <Router>
      <Flex>
        <Layout style={layoutStyle}>
          <HeaderComponent />
          <div className="min-h-screen bg-[#121212]">
            <Content style={contentStyle}>
              <AppRouter />
            </Content>
          </div>
        </Layout>
      </Flex>
    </Router>
  );
}

export default App;
