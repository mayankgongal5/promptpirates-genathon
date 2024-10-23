
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import CallLogTable from './components/CallLogTable/CallLogTable.jsx';
import CallRecordings from './components/CallRecordings.jsx';
import SpeechToTextAndSentiment from './components/CallLogVisualization.jsx';
import AnalyzePage from './components/AnalyzePage.jsx';
import Employee from './components/employee.jsx';
import Login from './components/LoginPage.jsx';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isUserAuthenticated = () => {
    return !!localStorage.getItem('userEmail'); 
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Redirect to login if email does not exist in local storage */}
          <Route 
            path="/dashboard" 
            element={isUserAuthenticated() ? (
              <>
                <Sidebar isOpen={isSidebarOpen} />
                <div style={{ marginLeft: isSidebarOpen ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
                  <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                  <Dashboard />
                </div>
              </>
            ) : (
              <Navigate to="/" />
            )} 
          />
          <Route 
            path="/call-logs" 
            element={isUserAuthenticated() ? (
              <>
                <Sidebar isOpen={isSidebarOpen} />
                <div style={{ marginLeft: isSidebarOpen ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
                  <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                  <CallLogTable />
                </div>
              </>
            ) : (
              <Navigate to="/" />
            )} 
          />
          <Route 
            path="/call-recordings" 
            element={isUserAuthenticated() ? (
              <>
                <Sidebar isOpen={isSidebarOpen} />
                <div style={{ marginLeft: isSidebarOpen ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
                  <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                  <CallRecordings />
                </div>
              </>
            ) : (
              <Navigate to="/" />
            )} 
          />
          <Route 
            path="/call-ai" 
            element={isUserAuthenticated() ? (
              <>
                <Sidebar isOpen={isSidebarOpen} />
                <div style={{ marginLeft: isSidebarOpen ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
                  <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                  <SpeechToTextAndSentiment />
                </div>
              </>
            ) : (
              <Navigate to="/" />
            )} 
          />
          <Route 
            path="/analyze" 
            element={isUserAuthenticated() ? (
              <>
                <Sidebar isOpen={isSidebarOpen} />
                <div style={{ marginLeft: isSidebarOpen ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
                  <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                  <AnalyzePage />
                </div>
              </>
            ) : (
              <Navigate to="/" />
            )} 
          />
          <Route 
            path="/team" 
            element={isUserAuthenticated() ? (
              <>
                <Sidebar isOpen={isSidebarOpen} />
                <div style={{ marginLeft: isSidebarOpen ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
                  <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                  <Employee />
                </div>
              </>
            ) : (
              <Navigate to="/" />
            )} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
















