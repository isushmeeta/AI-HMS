import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Activity } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            toast.error('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-b-[100px]" />

            <div className="glass-panel p-8 w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-500/30">
                        <Activity />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
                    <p className="text-slate-500">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-600">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 shadow-lg shadow-teal-500/20 text-white font-bold">
                        Login
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-500">
                    Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register (Staff)</Link>
                </p>
                <div className="text-center mt-2 text-sm text-slate-500">
                    Are you a Patient? <Link to="/patient-register" className="text-primary font-bold hover:underline">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
