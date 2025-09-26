import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Categorie  from './pages/Categorie';
import Profile from './pages/Profile';
import CheckOut from './pages/CheckOut';
import OrderHistory from './pages/OrderHistory';
import Management from './pages/managementShop';
import Promotions from './pages/Promotion';
import PromotionsManage from './pages/PromotionsManage';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/categories" element={<Categorie />} />
        <Route path="/categories/:slug" element={<Categorie />} />
        <Route path="/management" element={<Management/>} />
        <Route path="/promotions" element={<Promotions/>} />
        <Route path="/management/promotions" element={<PromotionsManage/>} />
      </Routes>
  )
}

export default App
