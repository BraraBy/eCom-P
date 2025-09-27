import { useCallback, useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4200";

const EMPTY = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  username: "",
  address: "",
  street: "",
  city: "",
  state: "",
  country: "",
  zip_code: "",
  image_profile: ""
};

export default function useProfile() {
  const [formData, setFormData] = useState(EMPTY);
  const [original, setOriginal] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  const uid = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.customers_id || u?.id || null;
    } catch {
      return null;
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/customers/${uid}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const u = Array.isArray(data?.result) ? data.result[0] : data?.result || {};
      const shaped = {
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        email: u.email || "",
        phone: u.phone || "",
        username: u.username || "",
        address: u.address || "",
        street: u.street || "",
        city: u.city || "",
        state: u.state || "",
        country: u.country || "",
        zip_code: u.zip_code || "",
        image_profile: u.image_profile || ""
      };
      setFormData(shaped);
      setOriginal(shaped);
    } catch (e) {
      setError(e.message || "Data loading failed");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (uid) fetchProfile();
  }, [uid, fetchProfile]);

  const onChange = (k) => (e) =>
    setFormData((prev) => ({ ...prev, [k]: e.target.value }));

  const reset = () => setFormData(original);

  const updateProfile = useCallback(async () => {
  if (!uid) return;
  setSaving(true);
  setError("");
  try {
    const body = { ...formData };
    const res = await fetch(`${API}/api/customers/${uid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    try {
      const local = JSON.parse(localStorage.getItem("user") || "{}");
      local.first_name = formData.first_name;
      local.last_name = formData.last_name;
      local.email = formData.email;
      local.phone = formData.phone;
      local.address = formData.address;
      local.street = formData.street;
      local.city = formData.city;
      local.state = formData.state;
      local.country = formData.country;
      local.zip_code = formData.zip_code;
      local.image_profile = formData.image_profile;
      localStorage.setItem("user", JSON.stringify(local));
      window.dispatchEvent(new Event("auth:changed"));
    } catch {}

    setOriginal(formData);
    setTab("overview");
  } catch (e) {
    setError(e.message || "Recording failed");
  } finally {
    setSaving(false);
  }
}, [uid, formData]);


const uploadAvatar = useCallback(async (file) => {
  if (!uid || !file) return;
  const fd = new FormData();
  fd.append("customer_id", uid);
  fd.append("image", file);

  const res = await fetch(`${API}/api/customers/upload-firebase`, {
    method: "POST",
    body: fd
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const url = data.downloadURL || data.url || "";

  if (url) {
    setFormData((p) => ({ ...p, image_profile: url }));

    try {
      const local = JSON.parse(localStorage.getItem("user") || "{}");
      local.image_profile = url;
      localStorage.setItem("user", JSON.stringify(local));
      window.dispatchEvent(new Event("auth:changed"));
    } catch {}
  }

  return url;
}, [uid]);


  return {
    uid,
    formData,
    setFormData,
    original,
    loading,
    saving,
    error,
    tab,
    setTab,
    onChange,
    reset,
    fetchProfile,
    updateProfile,
    uploadAvatar,
  };
}
