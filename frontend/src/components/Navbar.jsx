import { useNavbar } from '../hooks/useNavbar';
import CartDrawer from "./ui/CartDrawer";
import { Link } from 'react-router-dom';
import { logout } from '../api/auth';
import img from '../image/e-comP_logo.png';

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
    <header className="bg-white sticky top-0 shadow-md z-50">
      <div className="container mx-auto px-4 py-4 flex items-center">
        
        {/* logo */}
        <button className="mr-auto md:w-48 flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <img
            className="h-15 md:h-15 cursor-pointer"
            src={img}
            alt="Brand Logo"
          />
          <p className="border-l-3 py-1 pl-3 border-gray-300 font-medium logo-color">e-ComP</p>
        </button>

        <div className="flex items-center space-x-2 flex-1 justify-end">
        {/* search */}

        {/* Search Button for Mobile */}
        <div className="flex sm:hidden items-center m-2">
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
              <button onClick={toggleSearch} className="ml-2 text-gray-400 hover:text-gray-600">
              <i className='bx bx-x text-2xl '></i>
              </button>
            </div>
          ) : (
            <button onClick={toggleSearch} className="p-2 rounded-md">
              <i className='bx bx-search text-2xl '></i>
            </button>
          )}
        </div>

        <div className="flex flex-1 justify-center px-2 sm:px-4">
          <div className="hidden sm:flex w-full max-w-md bg-gray-100 rounded-md items-center px-4 py-2">
            <input
              className="flex-1 bg-transparent font-semibold text-sm outline-none placeholder-gray-400"
              type="text"
              placeholder="I'm searching for ..."
            />
            <button>
            <i className='bx bx-search text-2xl '></i>
            </button>
          </div>
        </div>

        {/* buttons */} 
        <nav className="contents">
          <ul className="flex ml-4 xl:w-48 items-center justify-end space-x-3">

            
            {/* Cart */}
            <li className="ml-2 relative inline-block">
                <button className=" w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
                onClick={() => setIsCartOpen(true)}>
                  <i className="bx bx-cart text-2xl text-gray-600 hover:text-blue-500"></i>
                </button>
            </li>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* User */}
            <li className="ml-2 lg:ml-4 relative inline-block" ref={dropdownRef}>
              <button
                className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-200"
                onClick={toggleDropdown}
              >
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; }}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg p-2">
                  {/* ถ้ายังไม่ login → มีแค่ Login */}
                  {!user ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="block w-full text-left px-3 py-2 text-sm text-blue-500 hover:bg-blue-100 font-bold "
                    >
                      Login
                    </button>
                  ) : (
                    /* login แล้ว → เมนูเดิม */
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
          </ul>
        </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
