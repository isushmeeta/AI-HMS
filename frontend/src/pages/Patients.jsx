import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Trash2, Edit } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const countryCodes = [
    { code: '+1', label: 'US (+1)', minLength: 10 },
    { code: '+44', label: 'UK (+44)', minLength: 10 },
    { code: '+91', label: 'IN (+91)', minLength: 10 },
    { code: '+880', label: 'BD (+880)', minLength: 10 },
    { code: '+61', label: 'AU (+61)', minLength: 9 },
    { code: '+81', label: 'JP (+81)', minLength: 10 },
];

const Patients = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [filterMyPatients, setFilterMyPatients] = useState(user?.role === 'Doctor');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        dob: '',
        gender: 'Male',
        mobileNumber: '',
        countryCode: '+1',
        email: ''
    });

    useEffect(() => {
        fetchPatients();
    }, [filterMyPatients]); // Refetch when filter toggles

    const fetchPatients = async () => {
        setLoading(true);
        try {
            let url = '/patients';
            if (user?.role === 'Doctor' && filterMyPatients) {
                // Use doctor_id from the user object (populated in auth)
                url = `/patients?doctor_id=${user.doctor_id}`;
            }
            const res = await api.get(url);
            setPatients(res.data);
        } catch (err) {
            toast.error('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/patients/${id}`);
            toast.success('Patient deleted');
            fetchPatients();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleEdit = (patient) => {
        setSelectedPatientId(patient.id);
        setEditMode(true);

        // Parse "contact_number" into countryCode and mobileNumber
        // This is a bit tricky if formats vary, but auth logic uses +XXX...
        const country = countryCodes.find(c => patient.contact_number.startsWith(c.code));
        const code = country ? country.code : '+1';
        const phone = country ? patient.contact_number.slice(country.code.length) : patient.contact_number;

        setFormData({
            first_name: patient.first_name,
            last_name: patient.last_name,
            dob: patient.dob,
            gender: patient.gender,
            contact_number: patient.contact_number, // Fallback
            countryCode: code,
            mobileNumber: phone,
            email: patient.email || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Optional Email Validation
        if (formData.email) {
            const allowedDomains = ['gmail.com', 'ymail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
            const domain = formData.email.split('@')[1];
            if (!allowedDomains.includes(domain)) {
                toast.error(`Email must be one of: ${allowedDomains.join(', ')}`);
                return;
            }
        }

        // Phone Validation
        const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);
        if (formData.mobileNumber.length < selectedCountry.minLength) {
            toast.error(`Mobile number must be at least ${selectedCountry.minLength} digits for ${selectedCountry.label}`);
            return;
        }

        const fullMobile = `${formData.countryCode}${formData.mobileNumber}`;

        try {
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                dob: formData.dob,
                gender: formData.gender,
                contact_number: fullMobile,
                email: formData.email
            };

            if (editMode) {
                await api.put(`/patients/${selectedPatientId}`, payload);
                toast.success('Patient updated successfully');
            } else {
                await api.post('/patients', payload);
                toast.success('Patient added successfully');
            }

            setShowModal(false);
            setEditMode(false);
            setSelectedPatientId(null);
            setFormData({
                first_name: '', last_name: '', dob: '', gender: 'Male',
                mobileNumber: '', countryCode: '+1', email: ''
            });
            fetchPatients();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Operation failed';
            toast.error(errorMsg);
        }
    };

    const filteredPatients = patients.filter(p => {
        const search = searchTerm.toLowerCase();
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
        const idMatch = p.id.toString().includes(search);
        const contactMatch = p.contact_number?.toLowerCase().includes(search);
        const emailMatch = p.email?.toLowerCase().includes(search);
        return fullName.includes(search) || idMatch || contactMatch || emailMatch;
    });

    if (loading) return <div className="p-8 text-center text-slate-500">Loading patients...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
                    <p className="text-slate-500">Manage patient records and history</p>
                </div>
                <div className="flex gap-2">
                    {user?.role === 'Doctor' && (
                        <button
                            onClick={() => setFilterMyPatients(!filterMyPatients)}
                            className={`px-4 py-2 rounded-xl border font-medium transition-all ${filterMyPatients
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {filterMyPatients ? 'Showing My Patients' : 'Showing All Patients'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setEditMode(false);
                            setSelectedPatientId(null);
                            setFormData({
                                first_name: '', last_name: '', dob: '', gender: 'Male',
                                mobileNumber: '', countryCode: '+1', email: ''
                            });
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Patient
                    </button>
                </div>
            </div>

            <div className="glass-panel p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or phone..."
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {patients.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <p>No patients found.</p>
                            {filterMyPatients && <p className="text-sm mt-1">Try switching to "Showing All Patients"</p>}
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-500 text-sm">
                                    <th className="pb-4 pl-4 font-medium">Name</th>
                                    <th className="pb-4 font-medium">Date of Birth</th>
                                    <th className="pb-4 font-medium">Gender</th>
                                    <th className="pb-4 font-medium">Contact</th>
                                    <th className="pb-4 pr-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPatients.map((patient, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={patient.id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-primary font-bold">
                                                    {patient.first_name[0]}{patient.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-700">{patient.first_name} {patient.last_name}</p>
                                                    <p className="text-xs text-slate-400">ID: #{patient.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-600">{patient.dob}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                                }`}>
                                                {patient.gender}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-600">{patient.contact_number}</td>
                                        <td className="py-4 pr-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(patient)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    title="Edit Patient"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                {(user?.role === 'Admin' || user?.role === 'Receptionist') && (
                                                    <button
                                                        onClick={() => handleDelete(patient.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Patient"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800">{editMode ? 'Edit Patient' : 'Add New Patient'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                        <input
                                            required
                                            type="date"
                                            className="input-field"
                                            value={formData.dob}
                                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                        <select
                                            className="input-field"
                                            value={formData.gender}
                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={formData.countryCode}
                                                onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                                                className="input-field w-24 px-1 text-xs"
                                            >
                                                {countryCodes.map(c => (
                                                    <option key={c.code} value={c.code}>{c.label}</option>
                                                ))}
                                            </select>
                                            <input
                                                required
                                                type="tel"
                                                className="input-field flex-1"
                                                placeholder={`Min ${countryCodes.find(c => c.code === formData.countryCode)?.minLength} digits`}
                                                value={formData.mobileNumber}
                                                onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="e.g. name@gmail.com"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3 justify-end">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                                    <button type="submit" className="btn-primary">
                                        {editMode ? 'Update Patient' : 'Save Patient'}
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

export default Patients;
