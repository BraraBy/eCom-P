import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Categorie  from './pages/Categorie';
import Profile from './pages/Profile';
import CheckOut from './pages/CheckOut';
import OrdersList from './pages/OrdersList';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/categories/Snack" element={<Categorie />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/orders" element={<OrdersList />} />
      </Routes>
  )
}

export default App
