import React from 'react';
import { useInfo } from '../hooks/useInfo';

const SignInAndSignUp = () => {
  const {
    isLoginPage,
    setIsLoginPage,
    accountType,
    navigate,
    handleClose,
    profileImage,
    handleProfileImageChange,
    profileImageInputRef,
    handleSubmit,
    formData,
    handleFormDataChange,
    resetImage,
    handleAccountTypeChange,
    handleLogin,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
  } = useInfo();

  return (
    <main className="relative min-h-screen w-full bg-white grid place-items-center px-4">
      {/* กล่องคอนเทนต์ที่ยืดได้ตามหน้าจอ */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4">
          <svg
            onClick={handleClose}
            className="h-7 w-7 cursor-pointer text-gray-400 hover:text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            aria-label="Close"
            role="button"
          >
            <path
              strokeWidth="1"
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>

          <div>
            {isLoginPage ? (
              <button
                onClick={() => setIsLoginPage(false)}
                className="rounded-2xl border-b-2 border-b-gray-300 bg-white px-4 py-2 sm:py-3 font-bold text-blue-500 ring-2 ring-gray-300 hover:bg-gray-100 active:translate-y-[0.125rem] active:border-b-gray-200"
              >
                SIGN UP
              </button>
            ) : (
              <button
                onClick={() => setIsLoginPage(true)}
                className="rounded-2xl border-b-2 border-b-gray-300 bg-white px-4 py-2 sm:py-3 font-bold text-blue-500 ring-2 ring-gray-300 hover:bg-gray-100 active:translate-y-[0.125rem] active:border-b-gray-200"
              >
                LOGIN
              </button>
            )}
          </div>
        </header>


        {/* เนื้อหา (login/sign up) */}
        <section className="space-y-4 text-center pt-25">
          {/* Login */}
          {isLoginPage && (
            <div className="space-y-4">
              <header className="mb-3 text-xl sm:text-2xl font-bold">Log in</header>
              <form onSubmit={handleLogin} className="space-y-4">
                <InputBox
                  placeholder="Email"
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                />
                <InputBox
                  placeholder="Password"
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl border-b-4 border-b-blue-600 bg-blue-500 py-3 font-bold text-white hover:bg-blue-400 active:translate-y-[0.125rem] active:border-b-blue-400"
                >
                  LOG IN
                </button>
              </form>
            </div>
          )}

          {/* Sign Up */}
          {!isLoginPage && (
            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
              <header className="mb-3 text-xl sm:text-2xl font-bold">Create your profile</header>

              <ImageUploadInput
                onImageChange={handleProfileImageChange}
                ref={profileImageInputRef}
              />
              {profileImage && (
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={profileImage}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border shadow"
                  />
                  <button
                    type="button"
                    onClick={resetImage}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="w-full text-left">
                <label className="block mb-2 text-sm text-gray-500">Select type of account</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('customer')}
                    className={`flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium ${
                      accountType === 'customer'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-blue-500 border-blue-300'
                    }`}
                  >
                    <i className="bx bx-user" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('shop')}
                    className={`flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium ${
                      accountType === 'shop'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-blue-500 border-blue-300'
                    }`}
                  >
                    <i className="bx bx-store" />
                    <span>Shop</span>
                  </button>
                </div>
              </div>

              <InputBox
                placeholder="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleFormDataChange}
                required
              />
              <InputBox
                placeholder="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleFormDataChange}
                required
              />
              <InputBox
                placeholder="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormDataChange}
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                required
              />
              <InputBox
                placeholder="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  let onlyNums = e.target.value.replace(/[^0-9]/g, '');
                  if (onlyNums.length > 10) onlyNums = onlyNums.slice(0, 10);
                  handleFormDataChange({ target: { name: 'phone', value: onlyNums } });
                }}
                pattern="[0-9]{10}"
                maxLength={10}
                inputMode="numeric"
                required
              />
              <InputBox
                placeholder="Address"
                name="address"
                value={formData.address}
                onChange={handleFormDataChange}
              />
              <InputBox placeholder="Street" name="street" value={formData.street} onChange={handleFormDataChange} required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputBox placeholder="City" name="city" value={formData.city} onChange={handleFormDataChange} required />
                <InputBox placeholder="State" name="state" value={formData.state} onChange={handleFormDataChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputBox placeholder="Country" name="country" value={formData.country} onChange={handleFormDataChange} required />
                <InputBox placeholder="ZIP / Postal Code" name="zip_code" value={formData.zip_code} onChange={handleFormDataChange} required />
              </div>
              <InputBox
                placeholder="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleFormDataChange}
              />

              <button
                type="submit"
                className="w-full rounded-2xl border-b-4 border-b-blue-600 bg-blue-500 py-3 font-bold text-white hover:bg-blue-400 active:translate-y-[0.125rem] active:border-b-blue-400"
              >
                CREATE ACCOUNT
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

const InputBox = ({ placeholder, type = 'text', name, value, onChange, required = false }) => (
  <div className="w-full rounded-2xl bg-gray-50 px-4 ring-2 ring-gray-200 focus-within:ring-blue-400">
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="my-3 w-full border-none bg-transparent outline-none focus:outline-none"
      inputMode={type === 'email' ? 'email' : undefined}
      autoComplete={name === 'password' ? 'new-password' : 'on'}
    />
  </div>
);

const ImageUploadInput = React.forwardRef(({ onImageChange }, ref) => {
  return (
    <div className="w-full text-left">
      <label className="block mb-1 text-sm text-gray-500">Profile Image</label>
      <input
        ref={ref}
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
});

export default SignInAndSignUp;
