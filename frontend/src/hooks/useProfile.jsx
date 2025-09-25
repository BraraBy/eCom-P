// src/hooks/useProfile.js
import { useCallback, useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4200";

const EMPTY = {
  name: "", email: "", phone: "", username: "",
  address: "", street: "", city: "", state: "",
  country: "", zip: "", image_profile: ""
};

export default function useProfile() {
  const [formData, setFormData]   = useState(EMPTY);
  const [original, setOriginal]   = useState(EMPTY);   // สำหรับ reset/cancel
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [tab, setTab]             = useState("overview"); // "overview" | "edit"

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
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/customers/${uid}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const u = Array.isArray(data?.result) ? data.result[0] : data?.result || {};
      const shaped = {
        name: u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : (u.name || ""),
        email: u.email || "",
        phone: u.phone || "",
        username: u.username || "",
        address: u.address || "",
        street: u.street || "",
        city: u.city || "",
        state: u.state || "",
        country: u.country || "",
        zip: u.zip || "",
        image_profile: u.image_profile || ""
      };
      setFormData(shaped);
      setOriginal(shaped);
    } catch (e) {
      setError(e.message || "โหลดข้อมูลไม่สำเร็จ");
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
    setSaving(true); setError("");
    try {
      const body = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        address: formData.address,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zip: formData.zip,
        image_profile: formData.image_profile
      };
      const res = await fetch(`${API}/api/customers/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOriginal(formData);
      // sync localStorage (ถ้าคุณเก็บรูป/ชื่อไว้ใช้ใน Navbar)
      try {
        const local = JSON.parse(localStorage.getItem("user") || "{}");
        local.image_profile = formData.image_profile;
        local.email = formData.email;
        local.username = formData.username || local.username;
        localStorage.setItem("user", JSON.stringify(local));
        window.dispatchEvent(new Event("auth:changed"));
      } catch {}
      setTab("overview");
    } catch (e) {
      setError(e.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }, [uid, formData]);

  // อัปโหลดรูป → ได้ URL → ใส่ formData.image_profile
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
    const data = await res.json();        // { downloadURL: '...' }
    const url = data.downloadURL || data.url || "";
    if (url) setFormData((p) => ({ ...p, image_profile: url }));
    return url;
  }, [uid]);

  return {
    uid, formData, setFormData, original,
    loading, saving, error, tab, setTab,
    onChange, reset, fetchProfile, updateProfile, uploadAvatar,
  };
}
