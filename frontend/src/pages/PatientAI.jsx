import { useState } from 'react';
import { Brain, Stethoscope, ArrowRight, Activity, Info, RefreshCw, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PatientAI = () => {
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symptoms.trim()) return;

        setLoading(true);
        setResults(null);
        try {
            const res = await api.post('/ai/patient/diagnose', { symptoms });
            setResults(res.data);
            toast.success('AI analysis complete');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to analyze symptoms';
            toast.error(errorMsg);
            console.error('AI Analysis Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="text-primary" /> AI Symptom Checker
                    </h1>
                    <p className="text-slate-500">Analyze your symptoms and find the right department for care</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Side: Input */}
                <div className="md:col-span-5 space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Describe your symptoms
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                className="input-field min-h-[150px] resize-none"
                                placeholder="E.g. I have a sharp pain in my upper abdomen that started after dinner. I also feel nauseous..."
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />}
                                {loading ? 'Analyzing...' : 'Check Symptoms'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                        <div className="flex gap-3">
                            <Info className="text-amber-600 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold text-amber-800 text-sm">Important Note</h4>
                                <p className="text-amber-700 text-xs leading-relaxed mt-1">
                                    This AI tool is for informational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider.
                                    <span className="block mt-2 font-bold">In case of emergency, call your local emergency number immediately.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Results */}
                <div className="md:col-span-7">
                    <AnimatePresence mode="wait">
                        {!results && !loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
                            >
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                    <Stethoscope className="text-slate-300" size={32} />
                                </div>
                                <h3 className="font-bold text-slate-400">Ready to help</h3>
                                <p className="text-slate-400 text-sm max-w-[250px] mt-1">
                                    Enter your symptoms on the left to see potential conditions and department recommendations.
                                </p>
                            </motion.div>
                        )}

                        {results && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Activity className="text-primary" /> Potential Findings
                                    </h3>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Generated</span>
                                </div>

                                <div className="space-y-4">
                                    {results.map((res, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-800">{res.condition}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                                            {res.confidence}% Probability
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                                                    <Stethoscope size={20} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Recommended Department</p>
                                                    <p className="text-sm font-bold text-slate-700">{res.specialization}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Care Advice</p>
                                                    <p className="text-sm text-slate-600 line-clamp-2 italic">"{res.advice}"</p>
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end">
                                                <button
                                                    onClick={() => navigate('/book-appointment')}
                                                    className="flex items-center gap-2 text-xs font-bold text-primary hover:gap-3 transition-all"
                                                >
                                                    Book Appointment with {res.specialization} <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => { setResults(null); setSymptoms(''); }}
                                    className="w-full py-4 text-sm text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={16} /> Start New Assessment
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PatientAI;
