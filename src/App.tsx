import { Flex, Layout } from 'antd';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './AppRouter';
import HeaderComponent from './components/HeaderComponent';

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
          <div className="min-h-screen bg-[#121212] p-4">
            <AppRouter />
          </div>
        </Layout>
      </Flex>
    </Router>
  );
}

export default App;
