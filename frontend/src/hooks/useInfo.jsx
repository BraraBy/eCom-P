import { useState, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../api/auth';

const API = import.meta.env.VITE_API_URL || "http://localhost:4200";

export function useInfo () {
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const profileImageInputRef = useRef(null);
  const [avatar, setAvatar] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
  const [profileImage, setProfileImage] = useState(null);
  const [searchParams] = useSearchParams();

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ---------- ฟอร์มสมัคร (เพิ่มฟิลด์ที่อยู่ใหม่) ----------
  let [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    role: "",
    // เดิมมี address แบบสตริงเดียว ถ้าจะยังเก็บไว้ก็ได้
    address: "",
    // ที่เพิ่มใหม่
    street: "",
    city: "",
    state: "",
    country: "",
    zip_code: ""
  });

  const handleAvatarChange = (e) => handleImageChange(e, setAvatar);
  const handleCoverChange = (e) => handleImageChange(e, setCover);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setFormData(prev => ({ ...prev, role: type }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  const handleFormDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      role: "",
      address: "",
      street: "",
      city: "",
      state: "",
      country: "",
      zip_code: ""
    });
  };

  const resetImage = () => {
    setProfileImage(null);
    if (profileImageInputRef.current) profileImageInputRef.current.value = "";
  };

  // ---------- สมัครสมาชิก ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Phone number must be exactly 10 digits',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // ตรวจสอบ email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please enter a valid email address like example@mail.com',
        confirmButtonColor: '#f27474'
      });
      return;
    }

    if (!profileImageInputRef.current?.files[0]) {
      await Swal.fire({ icon: 'warning', title: 'Missing image', text: 'กรุณาเลือกรูปภาพก่อนสร้างบัญชี', confirmButtonColor: '#3085d6' });
      return;
    }
    if (!formData.first_name || !formData.last_name) {
      await Swal.fire({ icon: 'warning', title: 'Missing name', text: 'กรุณากรอกชื่อและนามสกุล', confirmButtonColor: '#3085d6' });
      return;
    }
    if (!formData.street || !formData.city || !formData.country || !formData.zip_code) {
      await Swal.fire({ icon: 'warning', title: 'Incomplete address', text: 'กรอกที่อยู่ให้ครบ (Street, City, Country, ZIP)', confirmButtonColor: '#3085d6' });
      return;
    }

    // ส่งแบบ FormData ไป backend
    const form = new FormData();
    form.append('first_name', formData.first_name);
    form.append('last_name',  formData.last_name);
    form.append('phone',      formData.phone);
    form.append('email',      formData.email);
    form.append('password',   formData.password);
    form.append('role',       formData.role);
    form.append('address',    formData.address || '');
    form.append('street',     formData.street);
    form.append('city',       formData.city);
    form.append('state',      formData.state);
    form.append('country',    formData.country);
    form.append('zip_code',   formData.zip_code);

    let newCustomerId = null;

    try {
      const res = await fetch(`${API}/api/customers`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const resJson = await res.json();
      newCustomerId = resJson.result?.customers_id;
      await Swal.fire({ icon: 'success', title: 'Sign up successful!', showConfirmButton: false, timer: 1500, confirmButtonColor: '#3085d6' });
      resetForm();
      navigate('/login');
    } catch (err) {
      console.error(err);
      await Swal.fire({ icon: 'error', title: 'การสร้างบัญชีล้มเหลว', text: err.message || 'Server error', confirmButtonColor: '#d33' });
      return;
    }

    // อัปโหลดรูปหลังสมัคร
    const file = profileImageInputRef.current?.files[0];
    if (!file || !file.type.startsWith('image/')) {
      await Swal.fire({ icon: 'warning', title: 'Invalid image', text: 'กรุณาเลือกรูปภาพก่อนสร้างบัญชี', confirmButtonColor: '#3085d6' });
      return;
    }

    const firebaseForm = new FormData();
    firebaseForm.append('customer_id', newCustomerId);
    firebaseForm.append('image', file);

    try {
      const res = await fetch(`${API}/api/customers/upload-firebase`, { method: 'POST', body: firebaseForm });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const url = data.downloadURL;
      if (!url) throw new Error('ไม่พบ downloadURL ใน response');

      const u = JSON.parse(localStorage.getItem('user') || '{}');
      u.image_profile = url;
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('auth:changed'));
      resetImage();
    } catch (err) {
      console.error(err);
      await Swal.fire({ icon: 'error', title: 'Upload failed', text: err.message || 'upload image ล้มเหลว', confirmButtonColor: '#d33' });
    }
  };

  const [isLoginPage, setIsLoginPage] = useState(true);
  const [accountType, setAccountType] = useState('client');
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const handleClose = () => { navigate('/'); };

  // ---------- Login ----------
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        const user = data.result?.user || data.user || null;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('auth:changed'));
        }
        await Swal.fire({ icon: 'success', title: 'Login successful!', showConfirmButton: false, timer: 1200, confirmButtonColor: '#3085d6' });
        navigate('/');
        await login(loginEmail, loginPassword);
        const redirect = searchParams.get('redirect') || '/';
        navigate(redirect, { replace: true });
      } else {
        await Swal.fire({ icon: 'error', title: data.message || 'Login failed', confirmButtonColor: '#d33' });
      }
    } catch {
      await Swal.fire({ icon: 'error', title: 'Server error', text: 'Please try again later', confirmButtonColor: '#d33' });
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ดึงโปรไฟล์มาเติมฟอร์ม (รวมฟิลด์ที่อยู่ใหม่ ถ้า backend มีให้)
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userLocal?.customers_id) throw new Error("No local user");

      const res = await fetch(`${API}/api/customers/${userLocal.customers_id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const u = data?.result?.[0] || {};

      setFormData(prev => ({
        ...prev,
        ...u,
        street:   u.street   ?? "",
        city:     u.city     ?? "",
        state:    u.state    ?? "",
        country:  u.country  ?? "",
        zip_code: u.zip_code ?? ""
      }));

      if (u.image_profile) {
        setAvatar(u.image_profile);
        setProfileImage(u.image_profile);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [API, setFormData]);

  // อัปเดตโปรไฟล์ (ส่งฟิลด์ที่อยู่ไปด้วย)
  const updateProfile = async () => {
    try {
      const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
      const customers_id = userLocal?.customers_id || formData.customers_id;
      if (!customers_id) throw new Error("Missing customers_id");

      let uploadedUrl = null;
      const file = profileImageInputRef.current?.files?.[0];
      if (file) {
        const fm = new FormData();
        fm.append('customer_id', customers_id);
        fm.append('image', file);

        const upRes = await fetch(`${API}/api/customers/upload-firebase`, { method: 'POST', body: fm });
        if (!upRes.ok) throw new Error(`Upload failed ${upRes.status}`);
        const upJson = await upRes.json();
        uploadedUrl = upJson.downloadURL || upJson.imageUrl || upJson.url || null;
      }

      const payload = { ...formData, customers_id };
      if (uploadedUrl) payload.image_profile = uploadedUrl;

      const res = await fetch(`${API}/api/customers/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const newUser = data.result || data.user || payload;
      localStorage.setItem('user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('auth:changed'));
      if (newUser.image_profile) {
        setAvatar(newUser.image_profile);
        setProfileImage(newUser.image_profile);
      }
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };

  return {
    avatar, setAvatar,
    avatarInputRef, coverInputRef,
    handleImageChange,
    formData, setFormData,
    handleChange, handleSubmit,
    isLoginPage, setIsLoginPage,
    accountType, setAccountType,
    navigate, handleClose,
    handleAvatarChange, handleCoverChange,
    profileImage, setProfileImage,
    handleProfileImageChange, profileImageInputRef,
    handleFormDataChange, resetForm,
    handleAccountTypeChange, resetImage,
    handleLogin, loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    fileInputRef, fetchProfile, updateProfile,
    loading, error,
  };
}
