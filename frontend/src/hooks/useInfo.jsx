import { useState, useRef, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth'; // ✅ เพิ่มมาใช้ฟังก์ชัน login() ที่เซฟ token ให้ครบ

const API = import.meta.env.VITE_API_URL || "http://localhost:4200";

export function useInfo () {
  const [avatar, setAvatar] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
  const [cover, setCover] = useState("https://imageslot.com/v1/600x140?bg=19375c&fg=19375c&shadow=19375c&fontsize=8&filetype=png");
  const [profileImage, setProfileImage] = useState(null); // สำหรับฟอร์มอัปโหลด

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const profileImageInputRef = useRef(null);
  const [avatar, setAvatar] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
  const [profileImage, setProfileImage] = useState(null); // สำหรับฟอร์มอัปโหลด

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
    const [isLoginPage, setIsLoginPage] = useState(true);
    const [accountType, setAccountType] = useState('client');
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

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
    //Login Form

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('http://localhost:4200/api/customers/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });
        const data = await res.json();
        if (res.ok) {
          const user = data.result?.user || data.user || null;
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event('auth:changed')); // ให้ Navbar รู้ว่ามี user ใหม่
          }
          alert('Login successful!');
          navigate('/');
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (err) {
        alert('Server error');
      }
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

        // สรุปข้อมูลลง form data และรูปโปรไฟล์
        setFormData(prev => ({ ...prev, ...u }));
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

    const updateProfile = async () => {
      try {
        const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
        const customers_id = userLocal?.customers_id || formData.customers_id;
        if (!customers_id) throw new Error("Missing customers_id");

        // ถ้ามีไฟล์ใหม่ให้อัปโหลดก่อน (profileImageInputRef)
        let uploadedUrl = null;
        const file = profileImageInputRef.current?.files?.[0];
        if (file) {
          const fm = new FormData();
          fm.append('customer_id', customers_id);
          fm.append('image', file);

          const upRes = await fetch(`${API}/api/customers/upload-firebase`, {
            method: 'POST',
            body: fm,
          });
          if (!upRes.ok) throw new Error(`Upload failed ${upRes.status}`);
          const upJson = await upRes.json();
          // backend อาจคืนชื่อฟิลด์ต่างกัน: downloadURL | imageUrl
          uploadedUrl = upJson.downloadURL || upJson.imageUrl || upJson.url || null;
        }

        // เตรียม payload (รวม customers_id + image_profile ถ้ามี)
        const payload = { ...formData, customers_id };
        if (uploadedUrl) payload.image_profile = uploadedUrl;

        const res = await fetch(`${API}/api/customers/update-profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // เก็บ user ใหม่ลง localStorage (backend คืน object เดียว)
        const newUser = data.result || data.user || payload;
        localStorage.setItem('user', JSON.stringify(newUser));
        window.dispatchEvent(new Event('auth:changed'));
        // ถ้ามี url ใหม่ อัปเดตรูปใน state
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
    avatar,
    setAvatar,
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
    fetchProfile,
    updateProfile,
    loading,
    error,
  };
}
