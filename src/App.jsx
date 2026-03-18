import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import PaymentStatus from './pages/PaymentStatus';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Products />} />
        <Route path="products" element={<Navigate to="/" replace />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="about" element={<About />} />
        <Route path="payment-status" element={<PaymentStatus />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdminRoute />}>
        <Route index element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;
