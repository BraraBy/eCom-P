import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignInAndSignUp = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);

  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const [image, setImage] = useState(null);

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setImage(URL.createObjectURL(file));
  }
};

const clearImage = () => {
  setImage(null);
};




  return (
    <main className="relative min-h-screen w-full bg-white">
      <div className="p-6">
        {/* Header */}
        <header className="flex w-full justify-between mb-6">
        <svg
          onClick={handleClose}
          className="h-7 w-7 cursor-pointer text-gray-400 hover:text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
        >
          <path
            strokeWidth="1"
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>

          {/* Toggle Buttons */}
          <div>
            {isLoginPage ? (
              <button
                onClick={() => setIsLoginPage(false)}
                className="rounded-2xl border-b-2 border-b-gray-300 bg-white px-4 py-3 font-bold text-blue-500 ring-2 ring-gray-300 hover:bg-gray-200 active:translate-y-[0.125rem] active:border-b-gray-200"
              >
                LOGIN
              </button>
            ) : (
              <button
                onClick={() => setIsLoginPage(true)}
                className="rounded-2xl border-b-2 border-b-gray-300 bg-white px-4 py-3 font-bold text-blue-500 ring-2 ring-gray-300 hover:bg-gray-200 active:translate-y-[0.125rem] active:border-b-gray-200"
              >
                SIGN UP
              </button>
            )}
          </div>
        </header>

        <div className="absolute left-1/2 top-1/2 mx-auto w-[400px] -translate-x-1/2 -translate-y-1/2 transform space-y-4 text-center">
          {/* Sign Up */}
          {isLoginPage && (
            <div className="space-y-4">
              <header className="mb-3 text-2xl font-bold">Create your profile</header>

              {/* อัปโหลดรูป */}
              <ImageUploadInput onImageChange={handleImageChange} />
              {image && (
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border shadow"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}


              <InputBox placeholder="Username" />
              <InputBox placeholder="Name" />
              <InputBox placeholder="Surname" />
              <InputBox placeholder="Email" />
              <InputBox placeholder="Phone Number" />
              <InputBox placeholder="Password" type="password" />

              <button className="w-full rounded-2xl border-b-4 border-b-blue-600 bg-blue-500 py-3 font-bold text-white hover:bg-blue-400 active:translate-y-[0.125rem] active:border-b-blue-400">
                CREATE ACCOUNT
              </button>
            </div>
          )}


          {/* Login */}
          {!isLoginPage && (
            <div className="space-y-4">
              <header className="mb-3 text-2xl font-bold">Log in</header>
              <InputBox placeholder="Email or username" />
              <InputBox placeholder="Password" type='password'/>
              <button className="w-full rounded-2xl border-b-4 border-b-blue-600 bg-blue-500 py-3 font-bold text-white hover:bg-blue-400 active:translate-y-[0.125rem] active:border-b-blue-400">
                LOG IN
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const InputBox = ({ placeholder, type = 'text' }) => (
  
  <div className="w-full rounded-2xl bg-gray-50 px-4 ring-2 ring-gray-200 focus-within:ring-blue-400">
    <input
      type={type}
      placeholder={placeholder}
      className="my-3 w-full border-none bg-transparent outline-none focus:outline-none"
    />
  </div>
);

const ImageUploadInput = ({ onImageChange }) => {
  return (
    <div className="w-full text-left">
      <label className="block mb-1 text-sm text-gray-500">Profile Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />
    </div>
  );
};


export default SignInAndSignUp;
