import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

const DoctorDashboard = ({ user }) => {
    const [stats, setStats] = useState({ appointments_today: 0, total_patients: 0 });
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, notifRes] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get(`/notifications?doctor_id=${user.id}`)
                ]);
                setStats(statsRes.data);
                setNotifications(notifRes.data);
            } catch (err) {
                console.error("Doctor data fetch failed", err);
            }
        };
        fetchData();
    }, [user.id]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
                <p className="text-slate-500">Welcome back, {user.username || 'Doctor'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div whileHover={{ y: -5 }} className="glass-card p-6 bg-purple-50 border-purple-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-purple-600 font-medium">Appointments Today</p>
                            <h3 className="text-3xl font-bold text-purple-900 mt-1">{stats.appointments_today}</h3>
                        </div>
                        <Clock className="text-purple-500" size={32} />
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="glass-card p-6 bg-blue-50 border-blue-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-blue-600 font-medium">My Patients</p>
                            <h3 className="text-3xl font-bold text-blue-900 mt-1">{stats.total_patients}</h3>
                        </div>
                        <AlertCircle className="text-blue-500" size={32} />
                    </div>
                </motion.div>
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-blue-500" /> Recent Notifications
                </h3>
                {notifications.length === 0 ? (
                    <p className="text-slate-500 italic">No new notifications.</p>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`p-4 rounded-lg flex justify-between items-center ${notif.is_read ? 'bg-slate-50' : 'bg-blue-50 border border-blue-100'}`}>
                                <span>{notif.message}</span>
                                <span className="text-xs text-slate-400">{new Date(notif.created_at).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
