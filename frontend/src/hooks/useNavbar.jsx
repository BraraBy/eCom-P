import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export function useNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // ✅ ใหม่: เก็บรูปและข้อมูลผู้ใช้ (อ่านจาก localStorage)
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const toggleSearch = () => setIsSearchOpen(prev => !prev);

  // ✅ ใหม่: ฟังก์ชันโหลด user จาก localStorage
  const loadUserFromStorage = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(u);
      setAvatarUrl(u?.image_profile || DEFAULT_AVATAR);
    } catch {
      setUser(null);
      setAvatarUrl(DEFAULT_AVATAR);
    }
  };

  useEffect(() => {
    // เดิม: ปิด dropdown เมื่อคลิกนอก/กด ESC
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    };

    // ✅ ใหม่: โหลด user ครั้งแรก + subscribe event เวลา login/logout หรืออัปเดตรูป
    loadUserFromStorage();
    const handleAuthChanged = () => loadUserFromStorage();
    const handleStorage = () => loadUserFromStorage();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('auth:changed', handleAuthChanged);
    window.addEventListener('storage', handleStorage);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('auth:changed', handleAuthChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {
    // เดิม
    isDropdownOpen,
    setIsDropdownOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCartOpen,
    setIsCartOpen,
    searchText,
    setSearchText,
    dropdownRef,
    toggleDropdown,
    toggleSearch,
    navigate,
    avatarUrl, 
    user,
  };
}
