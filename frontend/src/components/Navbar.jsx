import { useNavbar } from '../hooks/useNavbar';
import CartDrawer from "../components/ui/CartDrawer";
import { Link } from 'react-router-dom';
import { logout } from '../api/auth';
import img from '../image/e-comP_logo.png';
import { useState } from 'react';

const Navbar = () => {
  const {
    isDropdownOpen,
    toggleDropdown,
    dropdownRef,
    isSearchOpen,
    toggleSearch,
    searchText,
    setSearchText,
    isCartOpen,
    setIsCartOpen,
    navigate,
    avatarUrl,
    user,
  } = useNavbar();

  return (
    <header className="bg-white sticky top-0 shadow-md z-100">
      <div className="sm:px-5 md:px-8 xl:px-80 px-5 py-4 flex justify-between items-center">
        <div
          className="flex flex-row cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img
            className="h-15 md:h-15 cursor-pointer"
            src={img}
            alt="Brand Logo"
          />
          <div className="md:flex hidden items-center">
            <p className="border-l-3 py-1 pl-3 border-gray-300 font-medium logo-color">
              e-ComP
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="hidden md:flex w-full max-w-md bg-gray-100 rounded-md items-center px-4 py-2">
            <input
              className="flex-1 w-100 bg-transparent font-semibold text-sm outline-none placeholder-gray-400"
              type="text"
              placeholder="I'm searching for ..."
            />
            <button className="flex">
              <i className="bx bx-search text-2xl"></i>
            </button>
          </div>
        </div>

        <nav className="contents">
          <ul className="flex items-center gap-4 flex-row">
            <li>
              <div className="flex items-center md:hidden">
                {isSearchOpen ? (
                  <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-60 transition-all duration-300">
                    <input
                      type="text"
                      className="flex-1 bg-transparent outline-none text-sm"
                      placeholder="Search..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      autoFocus
                    />
                    <button onClick={toggleSearch} className="flex text-gray-400 hover:text-gray-600">
                      <i className="bx bx-x text-2xl"></i>
                    </button>
                  </div>
                ) : (
                  <button onClick={toggleSearch} className="flex p-2 rounded-md">
                    <i className="bx bx-search text-2xl"></i>
                  </button>
                )}
              </div>
            </li>

            {!isSearchOpen && (
              <li>
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
                  onClick={() => setIsCartOpen(true)}
                >
                  <i className="bx bx-cart text-2xl text-gray-600 hover:text-blue-500"></i>
                </button>
              </li>
            )}

            {!isSearchOpen && (
              <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            )}

            {!isSearchOpen && (
              <li ref={dropdownRef} className="relative">
                <button
                  className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-200"
                  onClick={toggleDropdown}
                >
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                    }}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg p-2 border border-gray-200">
                    {!user ? (
                      <button
                        onClick={() => navigate('/login')}
                        className="block w-full text-left px-3 py-2 text-sm text-blue-500 hover:bg-blue-100 font-bold"
                      >
                        Login
                      </button>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="block px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          My Account
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          Orders
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            navigate('/');
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-100 font-bold"
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
