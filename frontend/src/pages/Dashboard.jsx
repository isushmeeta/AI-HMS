import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import api from '../services/api';
import { Calendar, Clock, Stethoscope, RefreshCcw, CheckCircle, Clock3, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

    useEffect(() => {
        if (user?.role === 'Patient' && user?.patient_id) {
            fetchPatientData();
        }
    }, [user]);

    const fetchPatientData = async () => {
        setFetching(true);
        try {
            const res = await api.get(`/appointments?patient_id=${user.patient_id}`);
            setAppointments(res.data);
        } catch (err) {
            console.error("Failed to fetch patient data", err);
        } finally {
            setFetching(false);
        }
    };

    const handleReschedule = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/appointments/${selectedAppointment.id}/reschedule`, rescheduleData);
            toast.success('Reschedule request sent');
            setShowRescheduleModal(false);
            fetchPatientData();
        } catch (error) {
            toast.error('Failed to reschedule');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center text-red-500">Please log in to view dashboard.</div>;
    }

    switch (user.role) {
        case 'Admin':
            return <AdminDashboard user={user} />;
        case 'Doctor':
            return <DoctorDashboard user={user} />;
        case 'Receptionist':
            return <ReceptionistDashboard user={user} />;
        case 'Patient':
            const pendingApts = appointments.filter(a => a.status === 'Requested');
            const activeApts = appointments.filter(a => a.status === 'Scheduled');

            return (
                <div className="space-y-8 max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user.first_name || user.username}</h1>
                            <p className="text-slate-500">Your health overview and upcoming appointments</p>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate('/symptom-checker')}
                            className="bg-gradient-to-br from-primary to-secondary p-5 rounded-2xl text-white shadow-lg cursor-pointer flex items-center gap-4 group relative overflow-hidden flex-shrink-0 md:w-80"
                        >
                            <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                                <Brain size={120} />
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Brain size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold">AI Symptom Checker</h3>
                                <p className="text-xs text-white/80 mt-0.5">Check health concerns instantly</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Confirmed Appointments */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <CheckCircle className="text-green-500" size={24} />
                                Confirmed Appointments
                            </h2>
                            <div className="space-y-4">
                                {activeApts.length === 0 ? (
                                    <div className="glass-panel p-8 text-center text-slate-400 italic">
                                        No upcoming confirmed appointments
                                    </div>
                                ) : (
                                    activeApts.map((apt) => (
                                        <motion.div
                                            key={apt.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="glass-panel p-5 flex items-center justify-between border-l-4 border-l-green-500"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex flex-col items-center justify-center">
                                                    <span className="text-[10px] font-bold uppercase">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                    <span className="text-lg font-bold">{new Date(apt.date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">Dr. {apt.doctor_name}</h4>
                                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1"><Clock size={14} /> {apt.time}</span>
                                                        <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px]">SERIAL #{apt.serial_number}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Pending Requests */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Clock3 className="text-amber-500" size={24} />
                                Pending Requests
                            </h2>
                            <div className="space-y-4">
                                {pendingApts.length === 0 ? (
                                    <div className="glass-panel p-8 text-center text-slate-400 italic">
                                        No pending appointment requests
                                    </div>
                                ) : (
                                    pendingApts.map((apt) => (
                                        <motion.div
                                            key={apt.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="glass-panel p-5 flex items-center justify-between border-l-4 border-l-amber-500 bg-amber-50/30"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex flex-col items-center justify-center">
                                                    <span className="text-[10px] font-bold uppercase">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                    <span className="text-lg font-bold">{new Date(apt.date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">Dr. {apt.doctor_name}</h4>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> {apt.time}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedAppointment(apt);
                                                    setRescheduleData({ date: apt.date, time: apt.time });
                                                    setShowRescheduleModal(true);
                                                }}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Reschedule"
                                            >
                                                <RefreshCcw size={18} />
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {showRescheduleModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">Reschedule Request</h3>
                                    <button onClick={() => setShowRescheduleModal(false)} className="text-slate-400">×</button>
                                </div>
                                <form onSubmit={handleReschedule} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">New Date</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={rescheduleData.date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">New Time</label>
                                        <input
                                            type="time"
                                            className="input-field"
                                            value={rescheduleData.time}
                                            onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <button type="button" onClick={() => setShowRescheduleModal(false)} className="btn-ghost">Cancel</button>
                                        <button type="submit" className="btn-primary">Send Request</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            );
        default:
            return (
                <div className="p-8 text-center">
                    <h1 className="text-xl font-bold">Unknown Role</h1>
                    <p>Please contact support.</p>
                </div>
            );
    }
};

export default Dashboard;

