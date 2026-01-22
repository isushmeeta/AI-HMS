import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, MapPin, Droplets, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        dob: '',
        gender: '',
        contact_number: '',
        email: '',
        address: '',
        blood_group: '',
        emergency_contact: ''
    });

    useEffect(() => {
        const fetchPatientData = async () => {
            if (!user?.patient_id) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get(`/patients/${user.patient_id}`);
                setFormData({
                    ...res.data,
                    dob: res.data.dob ? res.data.dob.split('T')[0] : ''
                });
            } catch (err) {
                console.error("Failed to fetch patient data", err);
                toast.error("Failed to load profile details");
            } finally {
                setLoading(false);
            }
        };
        fetchPatientData();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/patients/${user.patient_id}`, formData);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Update failed", err);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-panel p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <User size={16} /> First Name
                        </label>
                        <input
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <User size={16} /> Last Name
                        </label>
                        <input
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Calendar size={16} /> Date of Birth
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Droplets size={16} /> Blood Group
                        </label>
                        <select
                            name="blood_group"
                            value={formData.blood_group}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="">Select Blood Group</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Phone size={16} /> Contact Number
                        </label>
                        <input
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Mail size={16} /> Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <MapPin size={16} /> Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="input-field h-24 pt-3"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Phone size={16} /> Emergency Contact
                        </label>
                        <input
                            name="emergency_contact"
                            value={formData.emergency_contact}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex items-center gap-2"
                    >
                        {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
