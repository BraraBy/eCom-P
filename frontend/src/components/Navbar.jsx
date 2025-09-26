import { useEffect, useState } from 'react';
import { useNavbar } from '../hooks/useNavbar';
import CartDrawer from "../components/ui/CartDrawer";
import PromotionDrawer from "../components/ui/PromotionDrawer";
import { Link, } from 'react-router-dom';
import { logout } from '../api/auth';
import img from '../image/e-comP_logo.png';

const Navbar = () => {
  const [hasModal, setHasModal] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  useEffect(() => {
    const onModal = (e) => setHasModal(!!e.detail);
    window.addEventListener('app:modal', onModal);
    return () => window.removeEventListener('app:modal', onModal);
  }, []);

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

  const goSearch = (e, isMobile = false) => {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    navigate(`/categories?search=${encodeURIComponent(q)}`);
    if (isMobile) toggleSearch();
  };

  return (
    <header className="bg-white sticky top-0 shadow-md z-50">
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

        {/* Desktop Search */}
        <div className="flex items-center justify-center">
          <form
            onSubmit={goSearch}
            className="hidden md:flex w-full max-w-md bg-gray-100 rounded-md items-center px-4 py-2"
          >
            <input
              className="flex-1 w-100 bg-transparent font-semibold text-sm outline-none placeholder-gray-400"
              type="text"
              placeholder="I'm searching for ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button type="submit" className="flex">
              <i className="bx bx-search text-2xl"></i>
            </button>
          </form>
        </div>

        <nav className="contents">
          <ul className="flex items-center gap-4 flex-row">
            {/* Mobile Search */}
            <li>
              <div className="flex items-center md:hidden">
                {isSearchOpen ? (
                  <form
                    onSubmit={(e) => goSearch(e, true)}
                    className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-60 transition-all duration-300"
                  >
                    <input
                      type="text"
                      className="flex-1 bg-transparent outline-none text-sm"
                      placeholder="Search..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="flex text-gray-400 hover:text-gray-600">
                      <i className="bx bx-search text-2xl"></i>
                    </button>
                    <button type="button" onClick={toggleSearch} className="flex text-gray-400 hover:text-gray-600 ml-1">
                      <i className="bx bx-x text-2xl"></i>
                    </button>
                  </form>
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
              <li>
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
                  onClick={() => setIsPromoOpen(true)}
                >
                  <i className="bx bx-purchase-tag text-2xl text-gray-600 hover:text-blue-500"></i>
                </button>
              </li>
            )}

            {!isSearchOpen && (
              <PromotionDrawer isOpen={isPromoOpen} onClose={() => setIsPromoOpen(false)} />
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
                        {(user.role_id === 2 || user.role === 'shop') && (
                          <Link
                            to="/management"
                            className="block px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            Management
                          </Link>
                        )}
                        {(user.role === 'shop' || user.role_id === 2) && (
                          <Link
                            to="/management/promotions"
                            className="block px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            Promotions
                          </Link>
                        )}
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
