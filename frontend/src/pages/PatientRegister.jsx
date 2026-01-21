import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const PatientRegister = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        mobile: '',
        role: 'Patient' // Hidden/Fixed
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                alert('Registration successful! Please login.');
                navigate('/login');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Patient Registration</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text" name="username" placeholder="Full Name (First Last)"
                        onChange={handleChange} required
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="email" name="email" placeholder="Email"
                        onChange={handleChange} required
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text" name="mobile" placeholder="Mobile (+1234567890)"
                        onChange={handleChange} required
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="password" name="password" placeholder="Password (Min 8 chars, A-Z, 0-9, !@#)"
                        onChange={handleChange} required
                        className="w-full p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        Register
                    </button>
                    <p className="text-center text-sm">
                        Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default PatientRegister;
