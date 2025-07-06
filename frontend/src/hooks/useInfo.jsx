import { useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';

export function useInfo () {

const [avatar, setAvatar] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
const [cover, setCover] = useState("https://imageslot.com/v1/600x140?bg=19375c&fg=19375c&shadow=19375c&fontsize=8&filetype=png");


    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

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

  const [formData, setFormData] = useState({
    username: "",
    about: "",
    firstName: "",
    lastName: "",
    email: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    zip: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("payload", formData);
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

    const clearImage = () => {
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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
    clearImage,
    handleImageChangeLogin,
    fileInputRef
  };
}

