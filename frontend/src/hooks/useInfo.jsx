// src/hooks/useInfo.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth'; // ✅ เพิ่มมาใช้ฟังก์ชัน login() ที่เซฟ token ให้ครบ

export function useInfo () {
  const [avatar, setAvatar] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
  const [cover, setCover] = useState("https://imageslot.com/v1/600x140?bg=19375c&fg=19375c&shadow=19375c&fontsize=8&filetype=png");
  const [profileImage, setProfileImage] = useState(null); // สำหรับฟอร์มอัปโหลด

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const profileImageInputRef = useRef(null);

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ข้อมูลหลัก customers
  let [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    role: "",
  });

  const handleAvatarChange = (e) => handleImageChange(e, setAvatar);
  const handleCoverChange = (e) => handleImageChange(e, setCover);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const [accountType, setAccountType] = useState('client');
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

  const navigate = useNavigate();

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      role: "",
    });
  };

  const resetImage = () => {
    setProfileImage(null);
    if (profileImageInputRef.current) profileImageInputRef.current.value = "";
  };

  // สมัครสมาชิก
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileImageInputRef.current?.files[0]) {
      alert('กรุณาเลือกรูปภาพก่อนสร้างบัญชี');
      return;
    }
    if (!formData.first_name || !formData.last_name) {
      alert('กรุณากรอกชื่อและนามสกุล');
      return;
    }

    const form = new FormData();
    form.append('first_name', formData.first_name);
    form.append('last_name', formData.last_name);
    form.append('phone', formData.phone);
    form.append('address', formData.address);
    form.append('role', formData.role);
    form.append('email', formData.email);
    form.append('password', formData.password);

    let waitForID = null;

    try {
      const res = await fetch('http://localhost:4200/api/customers', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const resJson = await res.json();
      waitForID = resJson.result.customers_id;

      alert('สร้างบัญชีสำเร็จ');
      resetForm();
      // ไม่ navigate ทันที รออัปโหลดภาพก่อนก็ได้ หรือจะพากลับหน้าแรกก็ได้
      navigate('/');
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      alert('การสร้างบัญชีล้มเหลว: ' + err.message);
      return;
    }

    // อัปโหลดรูปไป firebase
    const file = profileImageInputRef.current?.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('กรุณาเลือกรูปภาพก่อนสร้างบัญชี');
      return;
    }

    const firebaseForm = new FormData();
    firebaseForm.append('customer_id', waitForID);
    firebaseForm.append('image', file);

    try {
      const res = await fetch('http://localhost:4200/api/customers/upload-firebase', {
        method: 'POST',
        body: firebaseForm,
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json(); // { downloadURL: '...' }
      const url = data.downloadURL;
      if (!url) throw new Error('ไม่พบ downloadURL ใน response');

      const u = JSON.parse(localStorage.getItem('user') || '{}');
      u.image_profile = url;
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('auth:changed'));

      resetImage();
    } catch (err) {
      console.error('อัปโหลดรูปผิดพลาด:', err);
      alert('upload image ล้มเหลว: ' + err.message);
    }
  };

  // UI profile modal
  const [isLoginPage, setIsLoginPage] = useState(true);
  const fileInputRef = useRef(null);
  const handleClose = () => navigate('/');

  // ฟอร์มล็อกอิน
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // ✅ แก้: ใช้ login() จาก ../lib/auth เพื่อให้เซฟ token + user ให้ครบ
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword); // จะเซฟ accessToken/refreshToken/user ลง localStorage ให้เอง
      alert('Login successful!');
      // ถ้ามี redirect=? ใน URL ให้พากลับไปที่นั่น
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
      navigate(redirect, { replace: true });
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  };

  return {
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
    handleSubmit,
    isLoginPage,
    setIsLoginPage,
    accountType,
    setAccountType,
    navigate,
    handleClose,
    handleAvatarChange,
    handleCoverChange,
    profileImage,
    setProfileImage,
    handleProfileImageChange,
    profileImageInputRef,
    handleFormDataChange,
    resetForm,
    handleAccountTypeChange,
    resetImage,
    handleLogin,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    fileInputRef,
  };
}
