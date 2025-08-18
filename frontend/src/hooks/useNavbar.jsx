import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const toggleSearch = () => setIsSearchOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return {
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
  };
}
