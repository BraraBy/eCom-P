// src/pages/Profile.jsx
import useProfile from "../hooks/useProfile";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Field = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
  </div>
);

export default function Profile() {
  const {
    formData, onChange, loading, saving, error,
    tab, setTab, updateProfile, reset, uploadAvatar,
  } = useProfile();

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <Navbar />
    <div className="container mx-auto px-4 py-6">
      <div className="rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="h-28 bg-[#153a63]" />
        <div className="flex items-end justify-between p-4">
          <div className="flex items-center gap-4 -mt-10">
            <div className="relative">
              <img
                src={formData.image_profile || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                className="w-20 h-20 rounded-full ring-4 ring-white object-cover"
              />
              <label className="absolute -bottom-1 right-0 bg-white rounded-full text-xs px-2 py-1 shadow cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await uploadAvatar(file);
                  }}
                />
                Change
              </label>
            </div>
            <div className="mt-5">
              <p className="text-lg font-semibold">{formData.name || "—"}</p>
              <p className="text-sm text-gray-500">{formData.email || "—"}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm ${tab === "overview" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
              onClick={() => setTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm ${tab === "edit" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
              onClick={() => setTab("edit")}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Error / Loading */}
      {error && <div className="mt-4 rounded-lg bg-red-50 text-red-600 px-3 py-2 text-sm">{error}</div>}
      {loading && <div className="mt-4 text-sm text-gray-500">Loading…</div>}

      {/* Body */}
      {tab === "overview" ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white shadow-sm p-5">
            <p className="font-semibold mb-4">Account</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={formData.name} />
              <Field label="Email" value={formData.email} />
              <Field label="Phone" value={formData.phone} />
              <Field label="Username" value={formData.username} />
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm p-5">
            <p className="font-semibold mb-4">Address</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Address" value={formData.address} />
              <Field label="Street" value={formData.street} />
              <Field label="City" value={formData.city} />
              <Field label="State" value={formData.state} />
              <Field label="Country" value={formData.country} />
              <Field label="ZIP" value={formData.zip} />
            </div>
          </div>
        </div>
      ) : (
        <form
          className="mt-6 grid gap-6 md:grid-cols-2"
          onSubmit={(e) => { e.preventDefault(); updateProfile(); }}
        >
          <div className="rounded-2xl bg-white shadow-sm p-5 space-y-4">
            <p className="font-semibold">Account</p>
            <div>
              <label className="text-xs text-gray-500">Name</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.name} onChange={onChange("name")} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.email} onChange={onChange("email")} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Phone</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.phone} onChange={onChange("phone")} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Username</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.username} onChange={onChange("username")} />
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm p-5 space-y-4">
            <p className="font-semibold">Address</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Address</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.address} onChange={onChange("address")} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Street</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.street} onChange={onChange("street")} />
              </div>
              <div>
                <label className="text-xs text-gray-500">City</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.city} onChange={onChange("city")} />
              </div>
              <div>
                <label className="text-xs text-gray-500">State</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.state} onChange={onChange("state")} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Country</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.country} onChange={onChange("country")} />
              </div>
              <div>
                <label className="text-xs text-gray-500">ZIP</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={formData.zip} onChange={onChange("zip")} />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={reset} className="px-4 py-2 rounded-lg bg-gray-100">
              Reset
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
      <Footer />
    </div>
  );
}
