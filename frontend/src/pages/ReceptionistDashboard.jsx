import { useState, useEffect } from 'react';
import { UserPlus, Calendar, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const countryCodes = [
    { code: '+1', label: 'US (+1)', minLength: 10 },
    { code: '+44', label: 'UK (+44)', minLength: 10 },
    { code: '+91', label: 'IN (+91)', minLength: 10 },
    { code: '+880', label: 'BD (+880)', minLength: 10 },
    { code: '+61', label: 'AU (+61)', minLength: 9 },
    { code: '+81', label: 'JP (+81)', minLength: 10 },
];

const ReceptionistDashboard = ({ user }) => {
    const [stats, setStats] = useState({ total_patients: 0, appointments_today: 0 });
    const [pendingRequests, setPendingRequests] = useState([]);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [patientFormData, setPatientFormData] = useState({
        first_name: '',
        last_name: '',
        dob: '',
        gender: 'Male',
        mobileNumber: '',
        countryCode: '+1',
        email: ''
    });

    const fetchStats = async () => {
        try {
            const statsRes = await api.get('/analytics/stats');
            setStats(statsRes.data);
        } catch (err) {
            console.error("Stats fetch failed", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, pendingRes] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/appointments') // We'll filter for Requested status in the UI or fetch specific
                ]);
                setStats(statsRes.data);
                setPendingRequests(pendingRes.data.filter(a => a.status === 'Requested'));
            } catch (err) {
                console.error("Receptionist data fetch failed", err);
            }
        };
        fetchData();
    }, []);

    const handlePatientSubmit = async (e) => {
        e.preventDefault();

        // Optional Email Validation
        if (patientFormData.email) {
            const allowedDomains = ['gmail.com', 'ymail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
            const domain = patientFormData.email.split('@')[1];
            if (!allowedDomains.includes(domain)) {
                toast.error(`Email must be one of: ${allowedDomains.join(', ')}`);
                return;
            }
        }

        // Phone Validation (matching PatientRegister.jsx)
        const selectedCountry = countryCodes.find(c => c.code === patientFormData.countryCode);
        if (patientFormData.mobileNumber.length < selectedCountry.minLength) {
            toast.error(`Mobile number must be at least ${selectedCountry.minLength} digits for ${selectedCountry.label}`);
            return;
        }

        const fullMobile = `${patientFormData.countryCode}${patientFormData.mobileNumber}`;

        try {
            const payload = {
                first_name: patientFormData.first_name,
                last_name: patientFormData.last_name,
                dob: patientFormData.dob,
                gender: patientFormData.gender,
                contact_number: fullMobile,
                email: patientFormData.email
            };

            await api.post('/patients', payload);
            toast.success('Patient added successfully');
            setShowPatientModal(false);
            setPatientFormData({
                first_name: '',
                last_name: '',
                dob: '',
                gender: 'Male',
                mobileNumber: '',
                countryCode: '+1',
                email: ''
            });
            fetchStats();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to add patient';
            toast.error(errorMsg);
        }
    };

    const handleConfirm = async (id) => {
        const confirmPromise = (async () => {
            const res = await api.put(`/appointments/${id}/confirm`);
            setPendingRequests(prev => prev.filter(a => a.id !== id));
            await fetchStats(); // Use the existing fetchStats function
            return res.data;
        })();

        toast.promise(confirmPromise, {
            loading: 'Confirming appointment...',
            success: 'Appointment confirmed successfully!',
            error: (err) => err.response?.data?.error || 'Failed to confirm appointment'
        });
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this request?')) return;

        const cancelPromise = (async () => {
            const res = await api.put(`/appointments/${id}/cancel`);
            setPendingRequests(prev => prev.filter(a => a.id !== id));
            await fetchStats();
            return res.data;
        })();

        toast.promise(cancelPromise, {
            loading: 'Cancelling appointment...',
            success: 'Appointment cancelled.',
            error: (err) => err.response?.data?.error || 'Failed to cancel appointment'
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Receptionist Dashboard</h1>
                <p className="text-slate-500">Front Desk & Queue Management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 flex flex-col items-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Book Appointment</h3>
                    <p className="text-slate-500 mb-4">Schedule for walk-ins or calls</p>
                    <Link to="/receptionist/book" className="btn-primary w-full text-center py-2">Book Now</Link>
                </div>

                <div
                    onClick={() => setShowPatientModal(true)}
                    className="glass-panel p-6 flex flex-col items-center text-center hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                        <UserPlus size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Add Patient</h3>
                    <p className="text-slate-500 mb-4">Register a new patient</p>
                    <button className="btn-primary w-full text-center py-2">Add New</button>
                </div>
            </div>

            <AnimatePresence>
                {showPatientModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800">Add New Patient</h3>
                                <button onClick={() => setShowPatientModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                            </div>
                            <form onSubmit={handlePatientSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field"
                                            value={patientFormData.first_name}
                                            onChange={e => setPatientFormData({ ...patientFormData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field"
                                            value={patientFormData.last_name}
                                            onChange={e => setPatientFormData({ ...patientFormData, last_name: e.target.value })}
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
                                            value={patientFormData.dob}
                                            onChange={e => setPatientFormData({ ...patientFormData, dob: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                        <select
                                            className="input-field"
                                            value={patientFormData.gender}
                                            onChange={e => setPatientFormData({ ...patientFormData, gender: e.target.value })}
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
                                                value={patientFormData.countryCode}
                                                onChange={e => setPatientFormData({ ...patientFormData, countryCode: e.target.value })}
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
                                                placeholder={`Min ${countryCodes.find(c => c.code === patientFormData.countryCode)?.minLength} digits`}
                                                value={patientFormData.mobileNumber}
                                                onChange={e => setPatientFormData({ ...patientFormData, mobileNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            value={patientFormData.email}
                                            onChange={e => setPatientFormData({ ...patientFormData, email: e.target.value })}
                                            placeholder="e.g. name@gmail.com"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3 justify-end">
                                    <button type="button" onClick={() => setShowPatientModal(false)} className="btn-ghost">Cancel</button>
                                    <button type="submit" className="btn-primary">Save Patient</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Total Patients</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{stats.total_patients}</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Appointments Today</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{stats.appointments_today}</p>
                </div>
            </div>

            {/* Appointment Requests Section */}
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="text-blue-500" />
                        Pending Appointment Requests
                    </h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {pendingRequests.length} New
                    </span>
                </div>

                <div className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <p className="text-center text-slate-400 py-4 italic">No pending requests</p>
                    ) : (
                        pendingRequests.map((req) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                            >
                                <div>
                                    <h4 className="font-bold text-slate-800">{req.patient_name}</h4>
                                    <p className="text-sm text-slate-500">
                                        Requested for: {req.date} at {req.time}
                                    </p>
                                    {req.reason && <p className="text-xs text-slate-400 italic mt-1">"{req.reason}"</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleConfirm(req.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => handleCancel(req.id)}
                                        className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
};

export default ReceptionistDashboard;
