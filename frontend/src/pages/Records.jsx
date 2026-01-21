import { useState, useEffect } from 'react';
import { Plus, FileText, Search, User, Stethoscope, Trash } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Records = () => {
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form States
    const [formData, setFormData] = useState({
        patient_id: '', doctor_id: '', diagnosis: '', tests: ''
    });
    const [medicines, setMedicines] = useState([]);
    const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '1-0-1', duration: '5 days' });

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

    const handleAddMedicine = () => {
        if (!newMed.name || !newMed.dosage) {
            toast.error('Please enter medicine name and dosage');
            return;
        }
        setMedicines([...medicines, newMed]);
        setNewMed({ name: '', dosage: '', frequency: '1-0-1', duration: '5 days' });
    };

    const removeMedicine = (index) => {
        const updated = [...medicines];
        updated.splice(index, 1);
        setMedicines(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medical_records', {
                ...formData,
                prescription: medicines
            });
            toast.success('Medical Record saved');
            setShowModal(false);
            setMedicines([]);
            setFormData({ patient_id: '', doctor_id: '', diagnosis: '', tests: '' });
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Diagnosis</span>
                                    <p className="text-slate-700 font-medium">{record.diagnosis}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Prescription</span>
                                    {Array.isArray(record.prescription) ? (
                                        <ul className="text-sm text-slate-700 space-y-1">
                                            {record.prescription.map((med, i) => (
                                                <li key={i}>• <b>{med.name}</b> - {med.dosage} ({med.frequency})</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-slate-700">{typeof record.prescription === 'string' ? record.prescription : 'No prescription'}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Stethoscope className="text-primary" /> New Medical Record
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
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

                            {/* Structured Prescription */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-700 mb-2 text-sm">Prescription</h4>
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    <input placeholder="Medicine Name" className="input-field text-sm" value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} />
                                    <input placeholder="Dosage (e.g. 500mg)" className="input-field text-sm" value={newMed.dosage} onChange={e => setNewMed({ ...newMed, dosage: e.target.value })} />
                                    <select className="input-field text-sm" value={newMed.frequency} onChange={e => setNewMed({ ...newMed, frequency: e.target.value })}>
                                        <option>1-0-1</option>
                                        <option>1-1-1</option>
                                        <option>1-0-0</option>
                                        <option>0-0-1</option>
                                        <option>SOS</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <input placeholder="Duration" className="input-field text-sm flex-1" value={newMed.duration} onChange={e => setNewMed({ ...newMed, duration: e.target.value })} />
                                        <button type="button" onClick={handleAddMedicine} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Plus size={18} /></button>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-3">
                                    {medicines.map((med, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-sm">
                                            <span className="font-medium text-slate-700">{med.name}</span>
                                            <div className="flex items-center gap-4 text-slate-500">
                                                <span>{med.dosage}</span>
                                                <span className="bg-slate-100 px-2 rounded text-xs">{med.frequency}</span>
                                                <span>{med.duration}</span>
                                                <button type="button" onClick={() => removeMedicine(idx)} className="text-red-400 hover:text-red-600"><Trash size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {medicines.length === 0 && <p className="text-xs text-slate-400 text-center italic">No medicines added.</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Test Recommendations</label>
                                <textarea rows="2" className="input-field" onChange={e => setFormData({ ...formData, tests: e.target.value })} />
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
