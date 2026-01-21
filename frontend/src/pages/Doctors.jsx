import { useState, useEffect } from 'react';
import { Plus, Stethoscope } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', specialization: '', contact: '' });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/doctors', formData);
            toast.success('Doctor added');
            setShowModal(false);
            fetchDoctors();
        } catch (err) {
            toast.error('Failed to add doctor');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Doctors</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Doctor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
                    <div key={doctor.id} className="glass-card p-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                            <Stethoscope size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{doctor.name}</h3>
                        <p className="text-slate-500">{doctor.specialization}</p>
                        <div className="mt-4 w-full pt-4 border-t border-slate-100 text-sm text-slate-500">
                            {doctor.contact}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Add Doctor</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input placeholder="Name" className="input-field" onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <input placeholder="Specialization" className="input-field" onChange={e => setFormData({ ...formData, specialization: e.target.value })} required />
                            <input placeholder="Contact" className="input-field" onChange={e => setFormData({ ...formData, contact: e.target.value })} required />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Doctors;
