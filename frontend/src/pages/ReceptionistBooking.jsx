import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, ArrowLeft, Search } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ReceptionistBooking = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        date: '',
        time: '',
        reason: ''
    });

    useEffect(() => {
        fetchPatients();
        fetchDoctors();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients');
            setPatients(res.data);
        } catch (err) {
            toast.error('Failed to load patients');
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data);
        } catch (err) {
            toast.error('Failed to load doctors');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patient_id || !formData.doctor_id || !formData.date || !formData.time) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            await api.post('/appointments', formData);
            toast.success('Appointment booked successfully!');
            navigate('/');
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error('Time slot already booked for this doctor');
            } else {
                toast.error('Failed to book appointment');
            }
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Receptionist Booking</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-panel p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Patient Selection */}
                    <div className="space-y-4 md:col-span-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <User size={16} /> Select Patient
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search patient by name or email..."
                                className="input-field pl-10 mb-4"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                            {filteredPatients.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setFormData({ ...formData, patient_id: p.id })}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.patient_id === p.id
                                            ? 'bg-primary/10 border-primary text-primary font-bold'
                                            : 'bg-white border-slate-200 hover:border-primary text-slate-600'
                                        }`}
                                >
                                    {p.first_name} {p.last_name}
                                    <div className="text-[10px] font-normal opacity-60">{p.email}</div>
                                </div>
                            ))}
                            {filteredPatients.length === 0 && (
                                <div className="col-span-2 text-center py-4 text-slate-400 text-sm">No patients found</div>
                            )}
                        </div>
                    </div>

                    {/* Doctor Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Stethoscope size={16} /> Select Doctor
                        </label>
                        <select
                            className="input-field"
                            value={formData.doctor_id}
                            onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                            required
                        >
                            <option value="">Choose a Doctor</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                            ))}
                        </select>
                    </div>

                    {/* DateTime Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Calendar size={16} /> Appointment Date
                        </label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="input-field"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Clock size={16} /> Preferred Time
                        </label>
                        <input
                            type="time"
                            className="input-field"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-600">Reason for Visit (Optional)</label>
                        <textarea
                            className="input-field h-24 pt-3"
                            placeholder="Briefly describe the symptom or reason..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary w-full md:w-auto px-12 py-3 text-lg"
                    >
                        Schedule Appointment
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default ReceptionistBooking;
