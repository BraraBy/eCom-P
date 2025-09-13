import React from 'react';
import img from '../image/e-comP_logo.png';

const Feeter = () => {
    return (
    <footer className="bg-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-2 items-center logo-color">
          <img className="h-12 md:h-12"
               src={img}
               alt="Brand Logo"
          />
          <p className="border-l-3 py-1 pl-3 border-gray-300 font-medium">e-ComP</p>
        </div>

        <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-gray-500">
          © 2025 e-ComP. All rights reserved.
        </p>
      </div>
    </footer>
    );
  }

export default Feeter;
