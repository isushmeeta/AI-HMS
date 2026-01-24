import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, FileText, Search, User, Stethoscope, Trash, Sparkles, Pencil, Printer } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import InlineConfirm from '../components/InlineConfirm';
import { useAuth } from '../context/AuthContext';

const Records = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [autoFillProcessed, setAutoFillProcessed] = useState(false);
    const [printingId, setPrintingId] = useState(null);

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
        if (user?.role !== 'Patient') {
            fetchPatients();
        }
    }, [user]);

    useEffect(() => {
        // Handle auto-fill from AI Insights
        if (location.state?.autoFill && !autoFillProcessed) {
            const { autoFill } = location.state;

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
            if (err.response?.status === 429) {
                toast.error('AI Quota exceeded. Please try again later or upgrade your plan.');
            } else {
                toast.error('AI Diagnosis failed');
            }
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
            if (err.response?.status === 429) {
                toast.error('AI Quota exceeded. Using local suggestions instead.');
            } else {
                toast.error('Failed to get AI suggestions');
            }
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
            if (err.response?.status === 429) {
                toast.error('AI Quota exceeded. Please write notes manually.');
            } else {
                toast.error('Failed to generate notes');
            }
        } finally {
            toast.dismiss(toastId);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/medical_records/${editingId}`, {
                    ...formData,
                    prescription: medicines
                });
                toast.success('Medical Record updated');
            } else {
                await api.post('/medical_records', {
                    ...formData,
                    prescription: medicines
                });
                toast.success('Medical Record saved');
            }
            setShowModal(false);
            setMedicines([]);
            setIsEditing(false);
            setEditingId(null);
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
            toast.error(`Failed to ${isEditing ? 'update' : 'save'} record`);
        }
    };


    const getRecordCount = (patientId) => {
        return records.filter(r => r.patient_id === patientId).length;
    };

    const handleDeleteRecord = async (id, type) => {
        try {
            if (type === 'appointment') {
                await api.delete(`/appointments/${id}`);
            } else {
                await api.delete(`/medical_records/${id}`);
            }
            toast.success('Record deleted');
            fetchRecords();
        } catch (err) {
            toast.error('Failed to delete record');
        }
    };

    const handleEditRecord = (record) => {
        if (record.type === 'appointment') return;

        setFormData({
            patient_id: record.patient_id,
            doctor_id: record.doctor_id,
            diagnosis: record.diagnosis,
            tests: record.tests || '',
            notes: record.notes || '',
            symptoms: record.symptoms || '',
            visit_date: record.visit_date ? record.visit_date.split('T')[0] : new Date().toISOString().split('T')[0],
            patient_age: record.patient_age,
            patient_gender: record.patient_gender
        });
        setMedicines(Array.isArray(record.prescription) ? record.prescription : []);
        setIsEditing(true);
        setEditingId(record.id);
        setShowModal(true);
    };

    const handlePrint = (recordId) => {
        setPrintingId(recordId);
        // We need a small delay to ensure the class is applied before print dialog opens
        setTimeout(() => {
            window.print();
            setPrintingId(null);
        }, 100);
    };

    const filteredRecords = records.filter(r => {
        const matchesSearch = r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPatient = selectedPatientId ? r.patient_id === selectedPatientId : true;
        return matchesSearch && matchesPatient;
    });

    const searchedPatients = patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        p.id.toString().includes(patientSearchTerm)
    );

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    return (
        <>
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {user?.role === 'Patient' ? 'My Medical History' : 'Medical Records'}
                        </h1>
                        <p className="text-slate-500">
                            {user?.role === 'Patient' ? 'Past diagnoses, prescriptions, and visit history' : 'Manage patient records and history'}
                        </p>
                    </div>
                    {user?.role !== 'Patient' && (
                        <button onClick={() => {
                            setIsEditing(false);
                            setEditingId(null);
                            setMedicines([]);
                            setFormData({
                                patient_id: selectedPatientId || '',
                                doctor_id: user?.doctor_id || '',
                                diagnosis: '',
                                tests: '',
                                notes: '',
                                symptoms: '',
                                visit_date: new Date().toISOString().split('T')[0],
                                patient_age: selectedPatient ? calculateAge(selectedPatient.dob) : '',
                                patient_gender: selectedPatient ? selectedPatient.gender : ''
                            });
                            setShowModal(true);
                        }} className="btn-primary flex items-center gap-2">
                            <Plus size={20} /> Add Record
                        </button>
                    )}
                </div>

                {/* Patient Selection Search (Flat style) */}
                {user?.role !== 'Patient' && !selectedPatientId && (
                    <div className="glass-panel p-6">
                        <div className="flex flex-col gap-4">
                            <label className="text-sm font-bold text-slate-400 uppercase">Find a patient to view history</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Start typing patient name or ID..."
                                    className="input-field pl-12 py-3"
                                    value={patientSearchTerm}
                                    onChange={e => setPatientSearchTerm(e.target.value)}
                                />
                            </div>

                            {patientSearchTerm && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-80 overflow-y-auto custom-scrollbar p-1">
                                    {searchedPatients.length > 0 ? (
                                        searchedPatients.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedPatientId(p.id);
                                                    setPatientSearchTerm('');
                                                }}
                                                className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white hover:border-primary hover:shadow-sm transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {p.first_name[0]}{p.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700">{p.first_name} {p.last_name}</div>
                                                        <div className="text-[10px] text-slate-400">UID: {p.id} • {p.gender}</div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md group-hover:bg-primary group-hover:text-white transition-colors">
                                                    {getRecordCount(p.id)} Records
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="col-span-full p-4 text-center text-slate-400 italic">No patients found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Selected Patient Info & Records List */}
                {(selectedPatientId || user?.role === 'Patient') && (
                    <div className="space-y-4">
                        {user?.role !== 'Patient' && (
                            <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{selectedPatient?.first_name} {selectedPatient?.last_name}</h3>
                                        <p className="text-xs text-slate-500">{selectedPatient?.gender} • {calculateAge(selectedPatient?.dob)} Years</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPatientId(null)}
                                    className="text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all flex items-center gap-1"
                                >
                                    <Search size={14} /> Change Patient
                                </button>
                            </div>
                        )}

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Filter diagnostic history..."
                                className="input-field pl-12"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            {filteredRecords.length === 0 ? (
                                <div className="glass-panel p-12 text-center">
                                    <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-400">No records found</h3>
                                </div>
                            ) : (
                                filteredRecords.map((record, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={record.id + (record.type || 'record')}
                                        className={`bg-white border border-slate-100 rounded-xl p-8 hover:shadow-lg transition-all group relative overflow-hidden ${printingId === record.id ? 'printable-record' : ''}`}
                                    >
                                        {/* Action buttons at top right matching photo style */}
                                        <div className="absolute top-8 right-8 flex gap-2 z-20 no-print">
                                            <InlineConfirm
                                                onConfirm={() => handleDeleteRecord(record.id, record.type)}
                                                message="Delete this record?"
                                                confirmText="Delete"
                                            >
                                                <button
                                                    className="p-2.5 bg-[#FFF1F2] text-[#E11D48] hover:bg-red-100 rounded-xl transition-all shadow-sm border border-red-50"
                                                    title="Delete Record"
                                                >
                                                    <Trash size={18} strokeWidth={2.5} />
                                                </button>
                                            </InlineConfirm>
                                            <button
                                                onClick={() => handlePrint(record.id)}
                                                className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-slate-100"
                                                title="Download PDF / Print"
                                            >
                                                <Printer size={18} strokeWidth={2.5} />
                                            </button>
                                            {user?.role !== 'Patient' && record.type !== 'appointment' && (
                                                <button
                                                    onClick={() => handleEditRecord(record)}
                                                    className="p-2.5 bg-[#EFF6FF] text-[#2563EB] hover:bg-blue-100 rounded-xl transition-all shadow-sm border border-blue-50"
                                                    title="Edit Record"
                                                >
                                                    <Pencil size={18} strokeWidth={2.5} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Header area matching photo */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User size={22} className="text-[#0D9488]" />
                                                    <h3 className="text-xl font-bold text-[#1E293B] tracking-tight">{record.patient_name}</h3>
                                                    <span className="ml-2 bg-[#E0E7FF] text-[#4F46E5] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                        {record.type === 'appointment' ? 'Appointment Visit' : 'Medical Record'}
                                                    </span>
                                                </div>
                                                <p className="text-[13.5px] text-slate-400 font-medium ml-[30px]">
                                                    Dr. {record.doctor_name} • {new Date(record.visit_date || record.date).toLocaleDateString()}
                                                </p>

                                                <div className="flex gap-2 mt-2 ml-[30px]">
                                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold border border-slate-100">{record.patient_gender}</span>
                                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold border border-slate-100">{record.patient_age} Years</span>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Body layout matching photo (Prescription Left, Symptoms Right) */}
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 ml-[30px]">
                                            {/* LEFT SIDE: Diagnosis & Prescription */}
                                            <div className="md:col-span-7 space-y-8">
                                                {/* Diagnosis Section */}
                                                <div className="space-y-1.5">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Diagnosis</span>
                                                    <p className="text-[#1E293B] font-bold text-[17px] leading-tight">{record.diagnosis}</p>
                                                </div>

                                                {/* Prescription Section */}
                                                {record.type === 'record' && (
                                                    <div className="space-y-4">
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Prescription</span>
                                                        {Array.isArray(record.prescription) && record.prescription.length > 0 ? (
                                                            <ul className="space-y-0.5">
                                                                {record.prescription.map((med, i) => (
                                                                    <li key={i} className="pb-2">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-slate-800 font-bold mt-2 inline-block w-1.5 h-1.5 bg-slate-800 rounded-full flex-shrink-0"></span>
                                                                            <div>
                                                                                <p className="text-[14.5px] text-[#1E293B] leading-snug">
                                                                                    <span className="font-bold">{med.name}</span> - {med.dosage} ({med.frequency})
                                                                                </p>
                                                                                {med.notes && (
                                                                                    <p className="text-[13.5px] text-slate-400 italic mt-0.5 leading-snug">
                                                                                        Note: {med.notes}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-slate-700 text-sm">{typeof record.prescription === 'string' ? record.prescription : 'No prescription provided'}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Advices/Tests */}
                                                {record.tests && (
                                                    <div className="space-y-2 pt-4 border-t border-slate-50">
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Advices / Tests</span>
                                                        <p className="text-slate-600 text-[14px] italic font-medium">
                                                            "{record.tests.split('\n').filter(t => t.trim()).join(', ')}"
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {record.notes && (
                                                    <div className="space-y-2">
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Additional Notes</span>
                                                        <p className="text-slate-600 text-[14px] leading-relaxed">{record.notes}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* RIGHT SIDE: Symptoms */}
                                            <div className="md:col-span-5 space-y-4">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Symptoms</span>
                                                <div className="space-y-1.5 mt-0.5">
                                                    {record.symptoms ? record.symptoms.split('\n').filter(s => s.trim()).map((sym, si) => (
                                                        <p key={si} className="text-[#64748B] text-[15px] leading-snug tracking-tight">
                                                            {sym.replace(/^[•\-\*]\s*/, '')}
                                                        </p>
                                                    )) : <p className="text-slate-400 italic text-sm">No symptoms noted</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Stethoscope className="text-primary" /> {isEditing ? 'Edit Medical Record' : 'New Medical Record'}
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
                                <button type="submit" className="btn-primary">{isEditing ? 'Update Record' : 'Save Record'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Records;
