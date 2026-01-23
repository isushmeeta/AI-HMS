import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, MapPin, Droplets, Save, ArrowLeft, Stethoscope, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        name: '', // For doctor
        dob: '',
        gender: '',
        contact_number: '',
        contact: '', // For doctor
        email: '',
        address: '',
        blood_group: '',
        emergency_contact: '',
        specialization: '', // For doctor
        availability: '' // For doctor
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                let res;
                if (user?.role === 'Patient' && user?.patient_id) {
                    res = await api.get(`/patients/${user.patient_id}`);
                    setFormData({
                        ...res.data,
                        contact_number: res.data.contact_number || user.mobile || '',
                        gender: res.data.gender || user.gender || '',
                        dob: res.data.dob ? res.data.dob.split('T')[0] : ''
                    });
                } else if (user?.role === 'Doctor' && user?.doctor_id) {
                    res = await api.get(`/doctors/${user.doctor_id}`);
                    setFormData({
                        ...res.data,
                        contact: res.data.contact || user.mobile || '',
                        gender: res.data.gender || user.gender || ''
                    });
                } else if (user?.role === 'Receptionist') {
                    setFormData({
                        name: user.username,
                        contact: user.mobile,
                        email: user.email,
                        gender: user.gender || ''
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile data", err);
                toast.error("Failed to load profile details");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfileData();
        else setLoading(false);
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const email = formData.email || '';
        const allowedDomains = ['gmail.com', 'ymail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
        const domain = email.split('@').pop();
        if (!allowedDomains.includes(domain)) {
            toast.error(`Email domain must be: ${allowedDomains.join(', ')}`);
            return;
        }

        const contact = user?.role === 'Patient' ? formData.contact_number : formData.contact;
        const phoneRegex = /^\+\d{1,4}\d{7,15}$/;
        if (!phoneRegex.test(contact)) {
            toast.error("Contact number must include country code (e.g., +1234567890)");
            return;
        }

        setSaving(true);
        try {
            if (user?.role === 'Patient') {
                await api.put(`/patients/${user.patient_id}`, formData);
            } else if (user?.role === 'Doctor') {
                await api.put(`/doctors/${user.doctor_id}`, formData);
            } else if (user?.role === 'Receptionist') {
                await api.put('/auth/profile', {
                    username: formData.name, // Receptionists use 'name' in formData which maps to 'username' in backend
                    mobile: formData.contact // Receptionists use 'contact' in formData which maps to 'mobile' in backend
                });
            }

            // Refresh user data in context to update names in header/sidebar
            const token = localStorage.getItem('token');
            if (token) await checkAuth(token);

            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Update failed", err);
            toast.error(err.response?.data?.error || "Failed to update profile");
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
                    {user?.role === 'Patient' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <User size={16} /> First Name
                                </label>
                                <input
                                    name="first_name"
                                    value={formData.first_name || ''}
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
                                    value={formData.last_name || ''}
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
                                    value={formData.dob || ''}
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
                                    value={formData.blood_group || ''}
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
                                    value={formData.contact_number || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <User size={16} /> Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            {user?.role === 'Doctor' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                        <Stethoscope size={16} /> Specialization
                                    </label>
                                    <input
                                        name="specialization"
                                        value={formData.specialization || ''}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <Phone size={16} /> Contact
                                </label>
                                <input
                                    name="contact"
                                    value={formData.contact || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <User size={16} /> Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <Clock size={16} /> Availability
                                </label>
                                <input
                                    name="availability"
                                    value={formData.availability || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g. Mon-Fri 09:00-17:00"
                                />
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Mail size={16} /> Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="input-field text-slate-500 bg-slate-50"
                            disabled={user?.role === 'Doctor'} // Doctors email usually tied to User account
                        />
                    </div>
                    {user?.role === 'Patient' && (
                        <>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                    <MapPin size={16} /> Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address || ''}
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
                                    value={formData.emergency_contact || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </>
                    )}
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
