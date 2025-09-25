import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Categorie  from './pages/Categorie';
import Profile from './pages/Profile';
import CheckOut from './pages/CheckOut';
import OrderHistory from './pages/OrderHistory';
import Management from './pages/managementShop';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/order_history" element={<OrderHistory />} />
        <Route path="/categories" element={<Categorie />} />
        <Route path="/categories/:slug" element={<Categorie />} />
        <Route path="/management" element={<Management/>} />
      </Routes>
  )
}

export default App
