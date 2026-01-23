import { useState, useEffect } from 'react';
import { UserPlus, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

const ReceptionistDashboard = ({ user }) => {
    const [stats, setStats] = useState({ total_patients: 0, appointments_today: 0 });
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, pendingRes] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/appointments') // We'll filter for Requested status in the UI or fetch specific
                ]);
                setStats(statsRes.data);
                setPendingRequests(pendingRes.data.filter(a => a.status === 'Requested'));
            } catch (err) {
                console.error("Receptionist data fetch failed", err);
            }
        };
        fetchData();
    }, []);

    const handleConfirm = async (id) => {
        try {
            await api.put(`/appointments/${id}/confirm`);
            setPendingRequests(prev => prev.filter(a => a.id !== id));
            // Trigger stats refresh
            const statsRes = await api.get('/analytics/stats');
            setStats(statsRes.data);
        } catch (err) {
            console.error("Confirmation failed", err);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Receptionist Dashboard</h1>
                <p className="text-slate-500">Front Desk & Queue Management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 flex flex-col items-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Book Appointment</h3>
                    <p className="text-slate-500 mb-4">Schedule for walk-ins or calls</p>
                    <Link to="/book-appointment" className="btn-primary w-full text-center py-2">Book Now</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Total Patients</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{stats.total_patients}</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Appointments Today</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{stats.appointments_today}</p>
                </div>
            </div>

            {/* Appointment Requests Section */}
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="text-blue-500" />
                        Pending Appointment Requests
                    </h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {pendingRequests.length} New
                    </span>
                </div>

                <div className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <p className="text-center text-slate-400 py-4 italic">No pending requests</p>
                    ) : (
                        pendingRequests.map((req) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                            >
                                <div>
                                    <h4 className="font-bold text-slate-800">{req.patient_name}</h4>
                                    <p className="text-sm text-slate-500">
                                        Requested for: {req.date} at {req.time}
                                    </p>
                                    {req.reason && <p className="text-xs text-slate-400 italic mt-1">"{req.reason}"</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleConfirm(req.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
