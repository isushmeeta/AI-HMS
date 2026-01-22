import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [view, setView] = useState('all'); // all | queue
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: '', doctor_id: '', date: '', time: '', reason: ''
    });

    useEffect(() => {
        fetchAppointments();
        if (showModal) {
            fetchPatients();
            fetchDoctors();
        }
    }, [view, showModal]);

    const fetchAppointments = async () => {
        try {
            let url = '/appointments';
            if (view === 'queue') {
                const today = new Date().toISOString().split('T')[0];
                url += `?date=${today}`;
            }
            const res = await api.get(url);
            setAppointments(res.data);
        } catch (error) {
            toast.error('Failed to fetch appointments');
        }
    };

    const fetchPatients = async () => {
        const res = await api.get('/patients');
        setPatients(res.data);
    };

    const fetchDoctors = async () => {
        const res = await api.get('/doctors');
        setDoctors(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', formData);
            toast.success('Appointment scheduled');
            setShowModal(false);
            fetchAppointments();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                toast.error('Conflict: Time slot not available');
            } else {
                toast.error('Failed to schedule appointment');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
                    <p className="text-slate-500">Manage schedule and patient queues</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Schedule Appointment
                </button>
            </div>

            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setView('all')}
                    className={`pb-3 px-1 font-medium transition-colors ${view === 'all' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                >
                    All Appointments
                </button>
                <button
                    onClick={() => setView('queue')}
                    className={`pb-3 px-1 font-medium transition-colors ${view === 'queue' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                >
                    Queue (Today)
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {appointments.length === 0 && (
                    <div className="text-center py-12 text-slate-400">No appointments found.</div>
                )}
                {appointments.map((apt, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={apt.id}
                        className="glass-panel p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-xl">
                                <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                <span className="text-xl font-bold">{new Date(apt.date).getDate()}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                    <Clock size={16} /> {apt.time}
                                </div>
                                <h4 className="font-bold text-slate-800">{apt.patient_name}</h4>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Stethoscope size={16} /> Dr. {apt.doctor_name}
                                </div>
                            </div>
                        </div>
                        <div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                    apt.status === 'Requested' ? 'bg-amber-100 text-amber-700' :
                                        apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                }`}>
                                {apt.status}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Schedule Appointment</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Patient</label>
                                    <select className="input-field" onChange={e => setFormData({ ...formData, patient_id: e.target.value })} required>
                                        <option value="">Select Patient</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Doctor</label>
                                    <select className="input-field" onChange={e => setFormData({ ...formData, doctor_id: e.target.value })} required>
                                        <option value="">Select Doctor</option>
                                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input type="date" className="input-field" onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Time</label>
                                    <input type="time" className="input-field" onChange={e => setFormData({ ...formData, time: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Reason</label>
                                <input type="text" className="input-field" onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                                <button type="submit" className="btn-primary">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
