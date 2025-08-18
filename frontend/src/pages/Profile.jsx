import { useInfo } from "../hooks/useInfo";
import { Navbar, Footer } from "../components";

const ProfileForm = () => {
  const {
    avatar,
    setAvatar,
    cover,
    setCover,
    avatarInputRef,
    coverInputRef,
    handleImageChange,
    formData,
    setFormData,
    handleChange,
    handleSubmit
  } = useInfo();

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="border-b border-gray-300 py-5">
          <div className="flex items-center">
            <p className="text-lg font-bold text-gray-800">Profile</p>
          </div>
        </div>

        {/* Cover + Avatar Container */}
        <div className="relative mt-8">
        {/* Cover Photo */}
        <img
            src={cover}
            alt="Cover"
            className="w-full h-48 object-cover rounded"
        />

        {/* Upload button (hidden input + overlay) */}
        <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            className="hidden"
            onChange={(e) => handleImageChange(e, setCover)}
        />
        <button
            type="button"
            onClick={() => coverInputRef.current.click()}
            className="absolute right-4 top-4 bg-black bg-opacity-50 text-white px-3 py-1 text-xs rounded hover:bg-opacity-70"
        >
            Change Cover
        </button>

        {/* Avatar */}
        <div
            className="absolute left-6 -bottom-10 w-20 h-20 rounded-full border-4 border-white bg-white shadow-md overflow-hidden cursor-pointer"
            onClick={() => avatarInputRef.current.click()}
        >
            <img
            src={avatar}
            alt="Avatar"
            className="w-full h-full object-cover"
            />
        </div>
        <input
            type="file"
            accept="image/*"
            ref={avatarInputRef}
            className="hidden"
            onChange={(e) => handleImageChange(e, setAvatar)}
        />
        </div>

        {/* Main Form */}
        <div className="pt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-gray-800">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full mt-1 border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-bold text-gray-800">First Name</label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-bold text-gray-800">Last Name</label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-800">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
           <div>
            <label htmlFor="Address" className="block text-sm font-bold text-gray-800">Address</label>
            <input
              type="text"
              name="Address"
              id="Address"
              value={formData.Address}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
          <div>
            <label htmlFor="streetAddress" className="block text-sm font-bold text-gray-800">Street Address</label>
            <input
              type="text"
              name="streetAddress"
              id="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-bold text-gray-800">City</label>
            <input
              type="text"
              name="city"
              id="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-bold text-gray-800">State/Province</label>
            <input
              type="text"
              name="state"
              id="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-bold text-gray-800">Country</label>
            <input
              type="text"
              name="country"
              id="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
          <div>
            <label htmlFor="zip" className="block text-sm font-bold text-gray-800">ZIP/Postal Code</label>
            <input
              type="text"
              name="zip"
              id="zip"
              value={formData.zip}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm text-sm text-gray-600 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-900"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="max-w-4xl mx-auto py-6 flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-200 text-blue-900 px-6 py-2 text-sm rounded hover:bg-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-900 text-white px-8 py-2 text-sm rounded hover:bg-blue-800 focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
          >
            Save
          </button>
        </div>
      </div>
      <Footer />
    </form>
  );
};

export default ProfileForm;