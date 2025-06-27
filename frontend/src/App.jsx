import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Categorie  from './pages/Categorie';
import Profile from './pages/Profile';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/categories/Snake" element={<Categorie />} />
      </Routes>
  )
}

export default App
