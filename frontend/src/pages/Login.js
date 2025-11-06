import {useState} from "react";
import {useNavigate} from "react-router-dom";
import  "./pages/Login.css";
export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",password: "",
    });
    const [Loading,setLoading]=useState(false);
    const handleChange = (e) => {
        const {email,value}=e.target;
        setForm((f) => ({...f,[email]:value}));
    };
    const validate=()=>{ 
        if(!form.email) return "Email is required";
        if(!form.password || form.password.length<6) return "Password must be at least 6 characters";
    }
}