import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CheckInOut from './pages/CheckInOut';
import Inventory from './pages/Inventory';
import ItemDetail from './pages/ItemDetail';
import AddItem from './pages/AddItem';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkin-checkout" element={<CheckInOut />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/:itemId" element={<ItemDetail />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App; 