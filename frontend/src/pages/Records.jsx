import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, FileText, Search, User, Stethoscope, Trash, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Records = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [autoFillProcessed, setAutoFillProcessed] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        diagnosis: '',
        tests: '',
        notes: '',
        symptoms: '',
        visit_date: new Date().toISOString().split('T')[0],
        patient_age: '',
        patient_gender: ''
    });
    const [medicines, setMedicines] = useState([]);
    const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '1-0-1', duration: '5 days', notes: '' });

    useEffect(() => {
        fetchRecords();
        if (showModal && user?.role !== 'Patient') {
            fetchPatients();
        }

        // Handle auto-fill from AI Insights
        if (location.state?.autoFill && !autoFillProcessed) {
            const { autoFill } = location.state;

            // Find patient to get age/gender if possible
            // Note: Patients might not be loaded yet, so we'll check in fetchPatients too

            setFormData(prev => ({
                ...prev,
                patient_id: autoFill.patient_id || '',
                diagnosis: autoFill.diagnosis || '',
                symptoms: autoFill.symptoms || '',
                doctor_id: user?.doctor_id || '',
                visit_date: new Date().toISOString().split('T')[0]
            }));
            if (autoFill.prescription) {
                setMedicines(autoFill.prescription);
            }
            setShowModal(true);
            setAutoFillProcessed(true); // Prevent re-triggering
            window.history.replaceState({}, document.title);
        } else if (showModal && user?.doctor_id && !formData.doctor_id) {
            setFormData(prev => ({ ...prev, doctor_id: user.doctor_id }));
        }
    }, [showModal, user, location.state, autoFillProcessed]);

    const calculateAge = (dob) => {
        if (!dob) return '';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handlePatientChange = (patientId) => {
        const patient = patients.find(p => p.id === parseInt(patientId));
        if (patient) {
            setFormData(prev => ({
                ...prev,
                patient_id: patientId,
                patient_age: calculateAge(patient.dob),
                patient_gender: patient.gender
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                patient_id: patientId,
                patient_age: '',
                patient_gender: ''
            }));
        }
    };

    useEffect(() => {
        if (showModal && patients.length > 0 && formData.patient_id && !formData.patient_age) {
            handlePatientChange(formData.patient_id);
        }
    }, [patients, formData.patient_id, showModal]);


    const fetchRecords = async () => {
        try {
            let recordsUrl = '/medical_records';
            let appointmentsUrl = '/appointments';

            if (user?.role === 'Patient' && user?.patient_id) {
                recordsUrl += `?patient_id=${user.patient_id}`;
                appointmentsUrl += `?patient_id=${user.patient_id}`;

                const [recordsRes, appointmentsRes] = await Promise.all([
                    api.get(recordsUrl),
                    api.get(appointmentsUrl)
                ]);

                // For patients, we might want to show "Completed" appointments as part of records
                // Or just show all appointments. Let's merge them for a chronological history
                const combined = [
                    ...recordsRes.data.map(r => ({ ...r, type: 'record' })),
                    ...appointmentsRes.data.filter(a => a.status === 'Completed' || a.status === 'Scheduled').map(a => ({
                        ...a,
                        type: 'appointment',
                        visit_date: a.date, // Use for sorting
                        diagnosis: a.reason || 'Routine Checkup'
                    }))
                ].sort((a, b) => new Date(b.visit_date || b.date) - new Date(a.visit_date || a.date));

                setRecords(combined);
            } else {
                const res = await api.get(recordsUrl);
                setRecords(res.data.map(r => ({ ...r, type: 'record' })));
            }
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
        setNewMed({ name: '', dosage: '', frequency: '1-0-1', duration: '5 days', notes: '' });
    };

    const handleAiDiagnose = async () => {
        if (!formData.symptoms) {
            toast.error('Please enter symptoms first');
            return;
        }
        const toastId = toast.loading('AI is analyzing symptoms...');
        try {
            const res = await api.post('/predict/disease', { symptoms: formData.symptoms });
            if (res.data && res.data.length > 0) {
                setFormData({ ...formData, diagnosis: res.data[0].condition });
                toast.success('Diagnosis suggested!');
            }
        } catch (err) {
            toast.error('AI Diagnosis failed');
        } finally {
            toast.dismiss(toastId);
        }
    };

    const removeMedicine = (index) => {
        const updated = [...medicines];
        updated.splice(index, 1);
        setMedicines(updated);
    };

    const handleAiSuggest = async () => {
        if (!formData.diagnosis) {
            toast.error('Please enter a diagnosis first');
            return;
        }
        const toastId = toast.loading('AI is generating a prescription...');
        try {
            const res = await api.post('/predict/prescription', {
                diagnosis: formData.diagnosis,
                patient_id: formData.patient_id
            });
            if (res.data && res.data.length > 0) {
                setMedicines([...medicines, ...res.data]);
                toast.success('Profile-aware prescription suggested!');
            } else {
                toast.error('No suggestions found');
            }
        } catch (err) {
            toast.error('Failed to get AI suggestions');
        } finally {
            toast.dismiss(toastId);
        }
    };

    const handleAiSuggestNotes = async () => {
        if (!formData.diagnosis) {
            toast.error('Please enter a diagnosis or use AI diagnose first');
            return;
        }
        const toastId = toast.loading('AI is generating treatment notes...');
        try {
            const context = `Diagnosis: ${formData.diagnosis}. Prescription: ${JSON.stringify(medicines)}. Symptoms: ${formData.symptoms}`;
            const res = await api.post('/generate/notes', { data: context });
            if (res.data && res.data.notes) {
                setFormData({ ...formData, notes: res.data.notes });
                toast.success('Notes generated!');
            }
        } catch (err) {
            toast.error('Failed to generate notes');
        } finally {
            toast.dismiss(toastId);
        }
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
            setFormData({
                patient_id: '',
                doctor_id: '',
                diagnosis: '',
                tests: '',
                notes: '',
                symptoms: '',
                visit_date: new Date().toISOString().split('T')[0],
                patient_age: '',
                patient_gender: ''
            });
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
                    <h1 className="text-2xl font-bold text-slate-800">
                        {user?.role === 'Patient' ? 'My Medical History' : 'Medical Records'}
                    </h1>
                    <p className="text-slate-500">
                        {user?.role === 'Patient' ? 'Past diagnoses, prescriptions, and visit history' : 'Patient diagnoses, prescriptions, and history'}
                    </p>
                </div>
                {user?.role !== 'Patient' && (
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Add Record
                    </button>
                )}
            </div>

            <div className="glass-panel p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder={user?.role === 'Patient' ? "Search my history..." : "Search by patient or diagnosis..."}
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {records.map((record, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={record.id + (record.type || 'record')}
                            className="bg-white/50 border border-slate-100 rounded-xl p-6 hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <User size={20} className="text-primary" /> {record.patient_name}
                                        </h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${record.type === 'appointment' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {record.type === 'appointment' ? 'Visit' : 'Medical Record'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Dr. {record.doctor_name} • {new Date(record.visit_date || record.date).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-3 mt-2">
                                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                            {record.patient_gender}
                                        </span>
                                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                            {record.patient_age} Years
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-lg ${record.type === 'appointment' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {record.type === 'appointment' ? <Stethoscope size={20} /> : <FileText size={20} />}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase">
                                        {record.type === 'appointment' ? 'Reason' : 'Diagnosis'}
                                    </span>
                                    <p className="text-slate-700 font-medium">{record.diagnosis}</p>
                                </div>
                                {record.symptoms && (
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Symptoms</span>
                                        <p className="text-slate-700 text-sm whitespace-pre-line">{record.symptoms}</p>
                                    </div>
                                )}
                                {record.type === 'record' && (
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Prescription</span>
                                        {Array.isArray(record.prescription) ? (
                                            <ul className="text-sm text-slate-700 space-y-1">
                                                {record.prescription.map((med, i) => (
                                                    <li key={i}>
                                                        • <b>{med.name}</b> - {med.dosage} ({med.frequency})
                                                        {med.notes && <span className="block text-xs text-slate-500 italic ml-2">Note: {med.notes}</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-slate-700">{typeof record.prescription === 'string' ? record.prescription : 'No prescription'}</p>
                                        )}
                                    </div>
                                )}
                                {record.notes && (
                                    <div className="md:col-span-2 mt-2 pt-2 border-t border-slate-50">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Treatment Notes & Advice</span>
                                        <p className="text-slate-700 mt-1 whitespace-pre-line">{record.notes}</p>
                                    </div>
                                )}
                                {record.type === 'appointment' && (
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                                        <p className="text-slate-700 font-medium capitalize">{record.status}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Stethoscope className="text-primary" /> New Medical Record
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Patient</label>
                                    <select
                                        className="input-field"
                                        value={formData.patient_id}
                                        onChange={e => handlePatientChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Patient</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Visit Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={formData.visit_date}
                                        onChange={e => setFormData({ ...formData, visit_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Attending Doctor</label>
                                    <div className="input-field bg-slate-50 text-slate-500 flex items-center gap-2">
                                        <User size={16} /> Dr. {user?.first_name} {user?.last_name || user?.username}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase ml-1">Patient Gender</label>
                                    <div className="input-field bg-slate-50 text-slate-500 font-medium">
                                        {formData.patient_gender || 'Select a patient...'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase ml-1">Patient Age</label>
                                    <div className="input-field bg-slate-50 text-slate-500 font-medium">
                                        {formData.patient_age ? `${formData.patient_age} Years` : 'Select a patient...'}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Symptoms</label>
                                <textarea
                                    rows="3"
                                    className="input-field text-sm resize-none py-2"
                                    placeholder="• Fever&#10;• Cough&#10;• Headache"
                                    value={formData.symptoms}
                                    onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Diagnosis</label>
                                <textarea rows="2" className="input-field" value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} required />
                            </div>

                            {/* Structured Prescription */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-slate-700 text-sm">Medications</h4>
                                    <button
                                        type="button"
                                        onClick={handleAiSuggest}
                                        className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200 transition-colors"
                                    >
                                        <Sparkles size={12} /> AI Suggest
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Medicine Name</label>
                                        <input placeholder="e.g. Paracetamol" className="input-field text-sm" value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Dosage</label>
                                        <input placeholder="e.g. 500mg" className="input-field text-sm" value={newMed.dosage} onChange={e => setNewMed({ ...newMed, dosage: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Freq.</label>
                                        <select className="input-field text-sm" value={newMed.frequency} onChange={e => setNewMed({ ...newMed, frequency: e.target.value })}>
                                            <option>1-0-1</option>
                                            <option>1-1-1</option>
                                            <option>1-0-0</option>
                                            <option>0-0-1</option>
                                            <option>SOS</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Duration</label>
                                        <input placeholder="5 days" className="input-field text-sm" value={newMed.duration} onChange={e => setNewMed({ ...newMed, duration: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-1 flex items-end pb-1">
                                        <button type="button" onClick={handleAddMedicine} className="bg-blue-600 text-white w-full h-10 rounded-lg hover:bg-blue-700 flex justify-center items-center"><Plus size={18} /></button>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <input placeholder="Special instructions for this medicine (optional)" className="input-field text-xs bg-white/50" value={newMed.notes} onChange={e => setNewMed({ ...newMed, notes: e.target.value })} />
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Test Recommendations</label>
                                    <textarea rows="2" className="input-field text-sm" value={formData.tests} onChange={e => setFormData({ ...formData, tests: e.target.value })} />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium">Doctor's Notes / Treatment Plan</label>
                                        <button
                                            type="button"
                                            onClick={handleAiSuggestNotes}
                                            className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-emerald-200 transition-colors"
                                        >
                                            <Sparkles size={10} /> Suggest Notes
                                        </button>
                                    </div>
                                    <textarea rows="2" className="input-field text-sm" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
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
