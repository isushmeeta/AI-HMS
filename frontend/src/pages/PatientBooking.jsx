import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Calendar, Clock, User, MessageSquare, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PatientBooking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctor_id: '',
        date: '',
        time: '',
        reason: '',
        patient_id: user?.patient_id // Assuming user context has patient_id
    });
    const [bookingResult, setBookingResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await api.get('/doctors');
                setDoctors(res.data);
            } catch (err) {
                console.error('Error fetching doctors:', err);
                setError('Failed to load doctors list');
            }
        };
        fetchDoctors();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBookingResult(null);

        if (!formData.patient_id) {
            setError("Patient information not found. Please log in again.");
            return;
        }

        try {
            const response = await api.post('/appointments', formData);
            setBookingResult(response.data);
            toast.success("Appointment request submitted successfully!");
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Slot not available. Please choose another time.');
            } else {
                setError(err.response?.data?.error || 'Booking failed');
            }
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Book Appointment</h1>
                    <p className="text-slate-500">Select a doctor and request your preferred time slot</p>
                </div>
            </div>

            <div className="glass-panel p-8">
                {bookingResult ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-8"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-2">Request Submitted!</h3>
                        <p className="text-lg text-slate-600 mb-8">
                            Your appointment request has been sent to the receptionist.
                            You will receive a serial number once confirmed.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/appointments')}
                                className="px-6 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                View My Appointments
                            </button>
                            <button
                                onClick={() => { setBookingResult(null); setFormData({ ...formData, date: '', time: '', reason: '' }); }}
                                className="bg-primary text-white px-8 py-2 rounded-xl hover:bg-primary-dark shadow-lg shadow-blue-500/20 transition-all"
                            >
                                Book Another
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Select Specialist</label>
                                <select
                                    name="doctor_id"
                                    value={formData.doctor_id}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">-- Choose Doctor --</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.name} • {doc.specialization}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Date</label>
                                    <input
                                        type="date" name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Time</label>
                                    <input
                                        type="time" name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Reason for Visit</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Describe your symptoms or reason for the appointment..."
                                className="input-field min-h-[120px] py-3"
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-tr from-primary to-secondary text-white py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/20 transition-all font-bold text-lg flex items-center justify-center gap-2"
                            >
                                Request Appointment
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-4 italic">
                                * Appointment requires receptionist confirmation
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PatientBooking;
