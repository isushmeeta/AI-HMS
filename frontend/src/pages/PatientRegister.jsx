import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Eye, EyeOff } from 'lucide-react';

const countryCodes = [
    { code: '+1', label: 'US (+1)', minLength: 10 },
    { code: '+44', label: 'UK (+44)', minLength: 10 },
    { code: '+91', label: 'IN (+91)', minLength: 10 },
    { code: '+880', label: 'BD (+880)', minLength: 10 },
    { code: '+61', label: 'AU (+61)', minLength: 9 },
    { code: '+81', label: 'JP (+81)', minLength: 10 },
];

import api from '../services/api';

const PatientRegister = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        mobileNumber: '',
        countryCode: '+1',
        role: 'Patient',
        gender: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);
        if (formData.mobileNumber.length < selectedCountry.minLength) {
            toast.error(`Mobile number must be at least ${selectedCountry.minLength} digits for ${selectedCountry.label}`);
            return;
        }

        if (passwordStrength < 3) {
            toast.error("Password is too weak.");
            return;
        }

        const fullMobile = `${formData.countryCode}${formData.mobileNumber}`;

        try {
            const response = await api.post('/auth/register', {
                ...formData,
                mobile: fullMobile
            });

            // api.post returns the response object directly (via axios interceptor or just axios response)
            // But usually axios throws on 4xx/5xx, so we just handle success here
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Registration failed';
            toast.error(errorMsg);
        }
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
                        <User />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Patient Registration</h2>
                    <p className="text-slate-500">Create your patient account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Full Name</label>
                        <input
                            type="text" name="username"
                            onChange={handleChange} required
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Email Address</label>
                        <input
                            type="email" name="email"
                            onChange={handleChange} required
                            className="input-field"
                        />
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
                                onChange={handleChange} required
                                className="input-field flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender || ''}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                onChange={handleChange} required
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
                    <button
                        type="submit"
                        className="btn-primary w-full py-3 shadow-lg shadow-blue-500/20 text-white font-bold bg-blue-600 hover:bg-blue-700"
                    >
                        Register
                    </button>

                    <p className="text-center mt-6 text-sm text-slate-500">
                        Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default PatientRegister;
