import { useState, useEffect } from 'react';
import { UserPlus, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

const ReceptionistDashboard = ({ user }) => {
    const [stats, setStats] = useState({ total_patients: 0, appointments_today: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/analytics/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Receptionist data fetch failed", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Receptionist Dashboard</h1>
                <p className="text-slate-500">Front Desk & Queue Management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 flex flex-col items-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <UserPlus size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Register Patient</h3>
                    <p className="text-slate-500 mb-4">Add a new patient to the system</p>
                    <Link to="/patient-register" className="btn-primary w-full text-center py-2">Go to Registration</Link>
                </div>

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
        </div>
    );
};

export default ReceptionistDashboard;
