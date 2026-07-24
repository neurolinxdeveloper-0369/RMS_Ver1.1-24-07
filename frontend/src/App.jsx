import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import DeviceManagement from './pages/DeviceManagement';
import UserManagement from './pages/UserManagement';
import InstantaneousReport from './pages/InstantaneousReport';
import HistoryReport from './pages/HistoryReport';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Docs from './pages/Docs';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="devices" element={<DeviceManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="reports/instantaneous" element={<InstantaneousReport />} />
          <Route path="reports/history" element={<HistoryReport />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
          <Route path="docs" element={<Docs />} />
        </Route>
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      </Router>
    </>
  );
}

export default App;
