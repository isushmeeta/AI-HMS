import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const countryCodes = [
    { code: '+1', label: 'US (+1)', minLength: 10 },
    { code: '+44', label: 'UK (+44)', minLength: 10 },
    { code: '+91', label: 'IN (+91)', minLength: 10 },
    { code: '+880', label: 'BD (+880)', minLength: 10 },
    { code: '+61', label: 'AU (+61)', minLength: 9 },
    { code: '+81', label: 'JP (+81)', minLength: 10 },
];

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', email: '', mobileNumber: '', countryCode: '+1', password: '', role: 'Doctor', gender: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const { register } = useAuth();
    const navigate = useNavigate();

    const checkPasswordStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        setPasswordStrength(score);
    };

    const validate = () => {
        // Email Validation
        const allowedDomains = ['gmail.com', 'ymail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
        const domain = formData.email.split('@')[1];
        if (!allowedDomains.includes(domain)) {
            toast.error(`Email domain must be: ${allowedDomains.join(', ')}`);
            return false;
        }

        // Mobile Validation
        const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);
        if (formData.mobileNumber.length < selectedCountry.minLength) {
            toast.error(`Mobile number must be at least ${selectedCountry.minLength} digits for ${selectedCountry.label}`);
            return false;
        }

        // Password Validation
        if (passwordStrength < 4) {
            toast.error("Password is too weak. Needs Uppercase, Lowercase, Number, Special Char.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const fullMobile = `${formData.countryCode}${formData.mobileNumber}`;

        try {
            await register({
                ...formData,
                mobile: fullMobile
            });
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') checkPasswordStrength(value);
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthLabel = () => {
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength <= 3) return 'Medium';
        return 'Strong';
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
                        <input className="input-field" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Email (Gmail, Yahoo, etc.)</label>
                        <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Mobile Number</label>
                        <div className="flex gap-2">
                            <select
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handleChange}
                                className="input-field w-32"
                            >
                                {countryCodes.map(c => (
                                    <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                            </select>
                            <input
                                type="tel" name="mobileNumber"
                                placeholder={`Min ${countryCodes.find(c => c.code === formData.countryCode)?.minLength} digits`}
                                value={formData.mobileNumber} onChange={handleChange} required
                                className="input-field flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password} onChange={handleChange} required
                                className="input-field pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500">Strength</span>
                                    <span className={`text-xs font-bold ${passwordStrength <= 1 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                                        {getStrengthLabel()}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                        style={{ width: `${(passwordStrength + 1) * 20}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Gender</label>
                        <select className="input-field" name="gender" value={formData.gender || ''} onChange={handleChange} required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Role</label>
                        <select className="input-field" name="role" value={formData.role} onChange={handleChange}>
                            <option value="Doctor">Doctor</option>
                            <option value="Receptionist">Receptionist</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {formData.role === 'Doctor' && (
                        <div>
                            <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Specialization</label>
                            <input
                                className="input-field"
                                name="specialization"
                                placeholder="e.g. Cardiology"
                                value={formData.specialization || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn-primary w-full py-3 shadow-lg shadow-blue-500/20 mt-2 text-white font-bold bg-blue-600 hover:bg-blue-700">
                        Register
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
                </p>
                <div className="text-center mt-2">
                    <Link to="/patient-register" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Patient Registration</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
