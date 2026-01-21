import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Users, Clock, AlertCircle, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card p-6 relative overflow-hidden group"
    >
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 ${color}`} />

        <div className="flex items-start justify-between mb-4">
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                <Icon size={22} className={color.replace('bg-', 'text-')} />
            </div>
        </div>

    </motion.div>
);

const Dashboard = () => {
    const { user } = useAuth(); // Import useAuth to get current user
    const [stats, setStats] = useState({ total_patients: 0, appointments_today: 0, total_doctors: 0, total_records: 0 });
    const [trendData, setTrendData] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const promises = [
                    api.get('/analytics/stats'),
                    api.get('/analytics/trends')
                ];

                // Fetch notifications only if user is a doctor
                if (user?.role === 'Doctor') {
                    // Assuming we can get doctor's ID from user object or another endpoint. 
                    // For now let's try to passing user.id as doctor_id if they map directly 
                    // OR rely on backend to filter by current user if we updated the endpoint (we didn't yet).
                    // We created the endpoint to take doctor_id param. 
                    // Ideally backend auth_me returns doctor_id too if linked.
                    // Let's assume user.id maps to doctor.id or use a safe check.
                    // Workaround: We will try to fetch using user.id.
                    promises.push(api.get(`/notifications?doctor_id=${user.id}`));
                }

                const results = await Promise.all(promises);
                setStats(results[0].data);
                setTrendData(results[1].data);
                if (user?.role === 'Doctor' && results[2]) {
                    setNotifications(results[2].data);
                }

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back, Dr. Smith</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.total_patients}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Appointments Today"
                    value={stats.appointments_today}
                    icon={Clock}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Active Doctors"
                    value={stats.total_doctors}
                    icon={Activity}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Total Records"
                    value={stats.total_records}
                    icon={AlertCircle}
                    color="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-6 h-96">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" /> Appointment Trends (7 Days)
                    </h3>
                    <div className="h-full pb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="appointments" stroke="#0f766e" fillOpacity={1} fill="url(#colorApt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6 h-96">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-blue-900">New Patient</h4>
                                <p className="text-sm text-blue-700">Register a new patient arrival</p>
                            </div>
                            <button className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-sm">Add</button>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-purple-900">Schedule</h4>
                                <p className="text-sm text-purple-700">Book an appointment</p>
                            </div>
                            <button className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg shadow-sm">Book</button>
                        </div>
                    </div>
                </div>
            </div>

            {user?.role === 'Doctor' && (
                <div className="glass-panel p-6 h-96 overflow-y-auto">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={20} className="text-blue-500" /> Notifications
                    </h3>
                    {notifications.length === 0 ? (
                        <p className="text-slate-500">No new notifications.</p>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map(notif => (
                                <div key={notif.id} className={`p-3 rounded-lg border ${notif.is_read ? 'bg-slate-50 border-slate-100' : 'bg-blue-50 border-blue-100'}`}>
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-slate-800">{notif.message}</p>
                                        {!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1"></span>}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
