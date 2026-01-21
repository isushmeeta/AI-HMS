import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', email: '', mobile: '', password: '', role: 'Doctor'
    });
    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        // Email Validation
        const allowedDomains = ['gmail.com', 'ymail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
        const domain = formData.email.split('@')[1];
        if (!allowedDomains.includes(domain)) {
            toast.error(`Email domain must be: ${allowedDomains.join(', ')}`);
            return false;
        }

        // Password Validation
        const pwd = formData.password;
        if (pwd.length < 8) { toast.error("Password must be 8+ chars"); return false; }
        if (!/[A-Z]/.test(pwd)) { toast.error("Password needs Uppercase"); return false; }
        if (!/[a-z]/.test(pwd)) { toast.error("Password needs Lowercase"); return false; }
        if (!/\d/.test(pwd)) { toast.error("Password needs Number"); return false; }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) { toast.error("Password needs Special Char"); return false; }

        // Mobile Validation
        if (!/^\+\d{1,4}\d{7,15}$/.test(formData.mobile)) {
            toast.error("Mobile must include Country Code (e.g. +1... )");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await register(formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-b-[100px]" />

            <div className="glass-panel p-8 w-full max-w-md relative z-10 my-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-500/30">
                        <UserPlus />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Full Name</label>
                        <input className="input-field" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Email (Gmail, Yahoo, etc.)</label>
                        <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Mobile (+CountryCode...)</label>
                        <input className="input-field" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Password (Strict)</label>
                        <input type="password" className="input-field" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Role</label>
                        <select className="input-field" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                            <option value="Doctor">Doctor</option>
                            <option value="Receptionist">Receptionist</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 shadow-lg shadow-blue-500/20 mt-2">
                        Register
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
