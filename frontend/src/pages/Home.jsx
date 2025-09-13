import React from 'react';
import { Navbar, Footer, Banner, Product, Category } from '../components';

const App = () => {
  return (
    <div className="relative bg-gray-100 min-h-screen w-full">
      <Navbar />

      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Banner />
      </div>

      <div className="px-10 py-3 space-y-2 w-full">
        <Category />
      </div>

      <div className="px-10 py-3 space-y-6 min-h-[400px]">
        <Product />
      </div>

      <Footer />
    </div>
  );
};

export default App;
