import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, TrendingUp, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, path }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => navigate(path)}
            className="glass-card p-6 relative overflow-hidden group cursor-pointer"
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
};

const AdminDashboard = ({ user }) => {
    const [stats, setStats] = useState({ total_patients: 0, total_doctors: 0, total_records: 0 });
    const [trendData, setTrendData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/analytics/trends')
                ]);
                setStats(results[0].data);
                setTrendData(results[1].data);
            } catch (err) {
                console.error("Admin data fetch failed", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-500">System Overview & Analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Doctors" value={stats.total_doctors} icon={ShieldCheck} color="bg-emerald-500" path="/doctors" />
                <StatCard title="Total Patients" value={stats.total_patients} icon={Users} color="bg-blue-500" path="/patients" />
                <StatCard title="System Records" value={stats.total_records} icon={Activity} color="bg-amber-500" path="/records" />
            </div>

            <div className="glass-panel p-6 h-96">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" /> Hospital Activity Trends
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="appointments" stroke="#0f766e" fill="#0f766e" fillOpacity={0.1} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdminDashboard;
