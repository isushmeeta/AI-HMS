import { useState, useEffect } from 'react';
import { Plus, Stethoscope, Trash2, Edit, X, ChevronRight, User, Mail, Phone, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import InlineConfirm from '../components/InlineConfirm';

const Doctors = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [viewDoctor, setViewDoctor] = useState(null);
    const [formData, setFormData] = useState({ name: '', specialization: '', contact: '', availability: '', gender: 'Male' });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data);
        } catch (err) {
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (doctor = null) => {
        if (doctor) {
            setSelectedDoctor(doctor);
            setFormData({
                name: doctor.name,
                specialization: doctor.specialization,
                contact: doctor.contact || '',
                availability: doctor.availability || '',
                gender: doctor.gender || 'Male'
            });
        } else {
            setSelectedDoctor(null);
            setFormData({ name: '', specialization: '', contact: '', availability: '', gender: 'Male' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedDoctor) {
                await api.put(`/doctors/${selectedDoctor.id}`, formData);
                toast.success('Doctor updated');
            } else {
                await api.post('/doctors', formData);
                toast.success('Doctor added');
            }
            setShowModal(false);
            fetchDoctors();
        } catch (err) {
            toast.error('Failed to save doctor');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/doctors/${id}`);
            toast.success('Doctor removed');
            fetchDoctors();
            if (viewDoctor?.id === id) setViewDoctor(null);
        } catch (err) {
            toast.error('Failed to remove doctor');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Medical Staff</h1>
                    <p className="text-slate-500 text-sm italic">Manage and view hospital's certified physicians</p>
                </div>
                {isAdmin && (
                    <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Add Provider
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {doctors.map(doctor => (
                        <motion.div
                            key={doctor.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-6 flex flex-col items-center text-center relative group overflow-hidden"
                            onClick={() => setViewDoctor(doctor)}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="text-slate-300" />
                            </div>

                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                <Stethoscope size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{doctor.name}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full mt-1 mb-2">
                                {doctor.specialization}
                            </p>

                            <div className="mt-4 w-full pt-4 border-t border-slate-50 text-xs text-slate-400 flex flex-col gap-1">
                                <span className="flex items-center justify-center gap-1.5"><CalendarIcon size={12} /> {doctor.availability || 'Schedule not set'}</span>
                            </div>

                            {isAdmin && (
                                <div className="mt-6 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleOpenModal(doctor)}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <InlineConfirm
                                        onConfirm={() => handleDelete(doctor.id)}
                                        message="Remove this provider?"
                                    >
                                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </InlineConfirm>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Doctor Detail View Modal */}
            <AnimatePresence>
                {viewDoctor && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60"
                            onClick={() => setViewDoctor(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10"
                        >
                            <div className="h-40 bg-gradient-to-br from-primary to-secondary relative flex items-end justify-center">
                                <button
                                    onClick={() => setViewDoctor(null)}
                                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="w-32 h-32 bg-white rounded-[32px] shadow-xl absolute -bottom-16 flex items-center justify-center text-primary border-4 border-white">
                                    <Stethoscope size={64} />
                                </div>
                            </div>

                            <div className="pt-20 pb-10 px-10 text-center">
                                <h2 className="text-3xl font-bold text-slate-800">{viewDoctor.name}</h2>
                                <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">{viewDoctor.specialization}</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 text-left">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={10} /> Gender</p>
                                        <p className="text-sm font-semibold text-slate-700">{viewDoctor.gender || 'Not specified'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Phone size={10} /> Contact</p>
                                        <p className="text-sm font-semibold text-slate-700">{viewDoctor.contact || 'No number'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2 md:col-span-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CalendarIcon size={10} /> Schedule</p>
                                        <p className="text-sm font-semibold text-slate-700">{viewDoctor.availability || 'Weekdays 9-5'}</p>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
                                        <button
                                            onClick={() => { setViewDoctor(null); handleOpenModal(viewDoctor); }}
                                            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                                        >
                                            <Edit size={18} /> Edit Profile
                                        </button>
                                        <InlineConfirm onConfirm={() => handleDelete(viewDoctor.id)}>
                                            <button className="flex-1 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors border border-red-100">
                                                Remove Doctor
                                            </button>
                                        </InlineConfirm>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative z-10"
                        >
                            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                {selectedDoctor ? <Edit className="text-primary" /> : <Plus className="text-primary" />}
                                {selectedDoctor ? 'Edit Physician' : 'Add New Physician'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block tracking-wider">Full Name</label>
                                        <input className="input-field" placeholder="Dr. Jane Smith" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block tracking-wider">Specialization</label>
                                        <input className="input-field" placeholder="Cardiology" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block tracking-wider">Gender</label>
                                        <select className="input-field" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block tracking-wider">Contact Number</label>
                                        <input className="input-field" placeholder="+1234..." value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block tracking-wider">Availability</label>
                                        <input className="input-field" placeholder="Mon-Fri 9AM-5PM" value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-ghost px-6">Cancel</button>
                                    <button type="submit" className="btn-primary px-10">
                                        {selectedDoctor ? 'Update Provider' : 'Save Physician'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Doctors;
