import { Flex } from 'antd';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './AppRouter';
import HeaderComponent from './components/HeaderComponent';



function App() {
  return (
    <Router>
      <Flex>
        <main className="w-full h-screen overflow-auto bg-[#121212]">
          <HeaderComponent />
          <div className="p-4">
            <AppRouter />
          </div>
        </main>
      </Flex>
    </Router>
  );
}

export default App;
