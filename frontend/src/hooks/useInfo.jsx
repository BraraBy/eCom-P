import { useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';

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
        reader.onloadend = () => {
        setImage(reader.result);
        };
        reader.readAsDataURL(file);
    }
    };
  
  // ข้อมูลหลักสำหรับ customers table

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
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
  };

  const handleAccountTypeChange = (type) => {
  setAccountType(type);
  setFormData(prev => ({
    ...prev,
    role: type,
  }));
};

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  // ฟังก์ชันจัดการข้อมูลฟอร์ม
  const handleFormDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบการเลือกไฟล์
    if (!profileImageInputRef.current?.files[0]) {
      alert('กรุณาเลือกรูปภาพก่อนสร้างบัญชี');
      return;
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!formData.first_name || !formData.last_name) {
      alert('กรุณากรอกชื่อและนามสกุล');
      return;
    }
    
    // ข้อมูลสำหรับ customers table
    const form = new FormData();
    form.append('first_name', formData.first_name);
    form.append('last_name', formData.last_name);
    form.append('phone', formData.phone);
    form.append('address', formData.address);
    form.append('role', formData.role); // fix shop duooooooooo 
    form.append('email', formData.email);
    form.append('password', formData.password ); 

    console.log('Form data to be sent:', formData);
    for (let [key, value] of form.entries()) {
      console.log(key, value);
    }
    
    let waitForID = null;
    
    try {
      const res = await fetch('http://localhost:4200/api/customers', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! statussss: ${res.status}`);
      }

      const resJson = await res.json();
      waitForID = resJson.result.customers_id;

      console.log('สร้างบัญชีสำเร็จ:', resJson);
      alert('สร้างบัญชีสำเร็จ และอัปโหลดรูปแล้ว');
      resetForm();
      navigate('/');
        
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      alert('การสร้างบัญชีล้มเหลว: ' + err.message);
    }

    const file = profileImageInputRef.current?.files[0];

    if (!file || !file.type.startsWith('image/')) {
      alert('กรุณาเลือกรูปภาพก่อนสร้างบัญชี');
      return;
    }

    const firebaseForm = new FormData();
      firebaseForm.append('customer_id', waitForID); 
      firebaseForm.append('image', profileImageInputRef.current?.files[0]);

    try {
      const res = await fetch('http://localhost:4200/api/customers/upload-firebase', {
        method: 'POST',
        body: firebaseForm,
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json(); // ควรเป็น { downloadURL: '...' }
      const url = data.downloadURL;
      if (!url) {
        throw new Error('ไม่พบ downloadURL ใน response');
      }

      const u = JSON.parse(localStorage.getItem('user') || '{}');
      u.image_profile = url;
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('auth:changed')); // ให้ useNavbar รีเฟรชรูป

      resetImage();
    } catch (err) {
      console.error('อัปโหลดรูปผิดพลาด:', err);
      alert('upload image ล้มเหลว: ' + err.message);
    }
  };

  

  

//Profile Form
    const [isLoginPage, setIsLoginPage] = useState(true);
    const [accountType, setAccountType] = useState('client');
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/');
    };

    const [image, setImage] = useState(null);

    const handleImageChangeLogin = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        address: "",
        email: "",
        password: "",
      });
      
    };

    const resetImage = () =>{
      setProfileImage(null);
      setImage(null);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
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
    image,
    setImage,
    handleImageChangeLogin,
    fileInputRef,
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
  };
}

