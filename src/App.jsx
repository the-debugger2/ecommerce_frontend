import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import FloatingCart from "./components/FloatingCart";
import UserMenu from "./components/UserMenu";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
    <UserMenu />
    <FloatingCart />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProtectedRoute><Product /></ProtectedRoute>} />
        {/* Protected — redirects to /auth if not logged in */}
  <Route path="/cart" element={
    <ProtectedRoute><Cart /></ProtectedRoute>
  } />
  <Route path="/checkout" element={
    <ProtectedRoute><Checkout /></ProtectedRoute>
  } />
  <Route path="/orders" element={
    <ProtectedRoute><Orders /></ProtectedRoute>
  } />
        <Route
  path="/admin"
  element={
    <ProtectedAdminRoute>
      <Admin />
    </ProtectedAdminRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;