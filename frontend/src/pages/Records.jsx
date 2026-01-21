import { useState, useEffect } from 'react';
import { Plus, FileText, Search, User, Stethoscope } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Records = () => {
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        patient_id: '', doctor_id: '', diagnosis: '', prescription: '', tests: ''
    });

    useEffect(() => {
        fetchRecords();
        if (showModal) {
            fetchPatients();
            fetchDoctors();
        }
    }, [showModal]);

    const fetchRecords = async () => {
        try {
            const res = await api.get('/medical_records');
            setRecords(res.data);
        } catch (err) {
            toast.error('Failed to load records');
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
            await api.post('/medical_records', formData);
            toast.success('Medical Record saved');
            setShowModal(false);
            fetchRecords();
        } catch (err) {
            toast.error('Failed to save record');
        }
    };

    const filteredRecords = records.filter(r =>
        r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Medical Records</h1>
                    <p className="text-slate-500">Patient diagnoses, prescriptions, and history</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Record
                </button>
            </div>

            <div className="glass-panel p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by patient or diagnosis..."
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredRecords.map((record, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={record.id}
                            className="bg-white/50 border border-slate-100 rounded-xl p-6 hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <User size={20} className="text-primary" /> {record.patient_name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Dr. {record.doctor_name} • {new Date(record.visit_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText size={20} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Diagnosis</span>
                                    <p className="text-slate-700 font-medium">{record.diagnosis}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Prescription</span>
                                    <p className="text-slate-700">{record.prescription || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Tests Recommended</span>
                                    <p className="text-slate-700">{record.tests || 'N/A'}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Stethoscope className="text-primary" /> New Medical Record
                            </h3>
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
                                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Diagnosis</label>
                                <textarea rows="2" className="input-field" onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prescription</label>
                                    <textarea rows="3" className="input-field" onChange={e => setFormData({ ...formData, prescription: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Test Recommendations</label>
                                    <textarea rows="3" className="input-field" onChange={e => setFormData({ ...formData, tests: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                                <button type="submit" className="btn-primary">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Records;
