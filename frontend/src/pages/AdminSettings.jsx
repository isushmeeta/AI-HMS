import { useState, useEffect } from 'react';
import { Users, Shield, Trash2, Plus, Settings as SettingsIcon, Building, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import InlineConfirm from '../components/InlineConfirm';

const AdminSettings = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffForm, setStaffForm] = useState({ username: '', email: '', mobile: '', role: 'Receptionist', password: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            // Filter only staff for this view (Admin/Receptionist)
            setUsers(res.data.filter(u => u.role === 'Admin' || u.role === 'Receptionist'));
        } catch (err) {
            toast.error('Failed to load staff list');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', staffForm);
            toast.success(`${staffForm.role} added successfully`);
            setShowStaffModal(false);
            fetchUsers();
            setStaffForm({ username: '', email: '', mobile: '', role: 'Receptionist', password: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add staff');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            toast.success('Staff member removed');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to remove staff member');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <SettingsIcon className="text-primary" /> System Control Panel
                    </h1>
                    <p className="text-slate-500">Manage hospital staff and system configuration</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hospital Config */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Building size={18} className="text-primary" /> Hospital Info
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Hospital Name</label>
                                <input className="input-field bg-slate-50/50" defaultValue="AI-HMS General Hospital" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Location</label>
                                <input className="input-field bg-slate-50/50" defaultValue="123 Health Ave, Metro City" />
                            </div>
                            <button className="btn-primary w-full py-2.5 text-sm" onClick={() => toast.success('Settings saved')}>
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                        <div className="flex gap-3">
                            <Shield className="text-blue-600 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold text-blue-800 text-sm">Security Policy</h4>
                                <p className="text-blue-700 text-xs leading-relaxed mt-1">
                                    Admins can create and remove other staff accounts. Password resets must be handled through administrative requests.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Users size={18} className="text-primary" /> Staff Management
                            </h3>
                            <button
                                onClick={() => setShowStaffModal(true)}
                                className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors border border-primary/20"
                            >
                                <Plus size={14} /> Add Staff
                            </button>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-slate-300" /></div>
                            ) : users.length === 0 ? (
                                <p className="text-center text-slate-400 py-8 italic">No staff members found.</p>
                            ) : (
                                users.map(u => (
                                    <div key={u.id} className="group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 transition-all shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${u.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {u.username.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{u.username}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">{u.role}</span>
                                                    <span className="text-[10px] text-slate-400">{u.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <InlineConfirm
                                                onConfirm={() => handleDeleteUser(u.id)}
                                                message="Remove staff member?"
                                                confirmText="Delete"
                                            >
                                                <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </InlineConfirm>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Staff Modal */}
            <AnimatePresence>
                {showStaffModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40"
                            onClick={() => setShowStaffModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Plus className="text-primary" /> Add New Staff
                                </h3>
                                <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <Trash2 size={20} className="rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleAddStaff} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Full Name</label>
                                        <input className="input-field" placeholder="John Doe" value={staffForm.username} onChange={e => setStaffForm({ ...staffForm, username: e.target.value })} required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Email</label>
                                        <input className="input-field" type="email" placeholder="john@hospital.com" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Mobile</label>
                                        <input className="input-field" placeholder="+123..." value={staffForm.mobile} onChange={e => setStaffForm({ ...staffForm, mobile: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Role</label>
                                        <select className="input-field" value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}>
                                            <option value="Receptionist">Receptionist</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Initial Password</label>
                                        <input className="input-field" type="password" placeholder="Min. 8 chars, uppercase, digit..." value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowStaffModal(false)} className="btn-ghost flex-1">Cancel</button>
                                    <button type="submit" className="btn-primary flex-1">Register Member</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminSettings;
