import { useState, useEffect } from 'react';
import { Activity, Clock, Brain, RefreshCw, Stethoscope, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AIInsights = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [riskData, setRiskData] = useState({ age: '', sys_bp: '', dia_bp: '', heart_rate: '' });
    const [readmissionData, setReadmissionData] = useState({ age: '', prev_visits: '', chronic: '0', days_since: '' });

    const [riskResult, setRiskResult] = useState(null);
    const [readmissionResult, setReadmissionResult] = useState(null);
    const [loadingRisk, setLoadingRisk] = useState(false);
    const [loadingReadmission, setLoadingReadmission] = useState(false);

    // Diagnosis State
    const [diagnosisSymptoms, setDiagnosisSymptoms] = useState('');
    const [diagnosisResult, setDiagnosisResult] = useState(null);
    const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);

    // Treatment Suggestion State
    const [suggestedPrescription, setSuggestedPrescription] = useState(null);
    const [loadingPrescription, setLoadingPrescription] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/patients');
                setPatients(res.data);
            } catch (err) {
                console.error("Failed to fetch patients", err);
            }
        };
        fetchPatients();
    }, []);

    const handlePatientChange = (e) => {
        const id = e.target.value;
        setSelectedPatientId(id);
        const p = patients.find(pat => pat.id === parseInt(id));
        if (p) {
            // Auto fill age if available
            const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : '';
            setRiskData(prev => ({ ...prev, age }));
            setReadmissionData(prev => ({ ...prev, age }));
        }
    };

    const handleRiskPredict = async (e) => {
        e.preventDefault();
        setLoadingRisk(true);
        try {
            const res = await api.post('/predict/risk', {
                age: parseInt(riskData.age),
                sys_bp: parseInt(riskData.sys_bp),
                dia_bp: parseInt(riskData.dia_bp),
                heart_rate: parseInt(riskData.heart_rate)
            });
            setRiskResult(res.data.risk_level);
            toast.success('Risk analyis complete');
        } catch (err) {
            toast.error('Analysis failed');
        } finally {
            setLoadingRisk(false);
        }
    };

    const handleReadmissionPredict = async (e) => {
        e.preventDefault();
        setLoadingReadmission(true);
        try {
            const res = await api.post('/predict/readmission', {
                age: parseInt(readmissionData.age),
                prev_visits: parseInt(readmissionData.prev_visits),
                chronic: parseInt(readmissionData.chronic),
                days_since: parseInt(readmissionData.days_since)
            });
            setReadmissionResult(res.data.readmission_probability);
            toast.success('Readmission analyis complete');
        } catch (err) {
            toast.error('Analysis failed');
        } finally {
            setLoadingReadmission(false);
        }
    };

    const handleDiagnosisPredict = async (e) => {
        e.preventDefault();
        setLoadingDiagnosis(true);
        setSuggestedPrescription(null);
        try {
            const res = await api.post('/predict/disease', { symptoms: diagnosisSymptoms });
            setDiagnosisResult(res.data);
            toast.success('Diagnosis analysis complete');
        } catch (err) {
            toast.error('Analysis failed');
        } finally {
            setLoadingDiagnosis(false);
        }
    };

    const handleSuggestTreatment = async (condition) => {
        setLoadingPrescription(true);
        try {
            const res = await api.post('/predict/prescription', {
                diagnosis: condition,
                patient_id: selectedPatientId || null
            });
            setSuggestedPrescription({ condition, meds: res.data });
            toast.success(`Treatment suggested for ${condition}`);
        } catch (err) {
            toast.error('Failed to get treatment suggestions');
        } finally {
            setLoadingPrescription(false);
        }
    };

    const handleApplyToRecord = (condition, meds) => {
        navigate('/records', {
            state: {
                autoFill: {
                    patient_id: selectedPatientId,
                    diagnosis: condition,
                    prescription: meds,
                    symptoms: diagnosisSymptoms
                }
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="text-primary" /> AI Decision Support
                    </h1>
                    <p className="text-slate-500">Real-time clinical insights powered by Machine Learning</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                    <User size={18} className="text-slate-400 ml-2" />
                    <select
                        className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-slate-700"
                        value={selectedPatientId}
                        onChange={handlePatientChange}
                    >
                        <option value="">Select Patient (Optional)</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Health Risk Prediction */}
                <div className="glass-panel p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <Activity className="text-blue-500" /> Health Risk Assessment
                    </h2>
                    <form onSubmit={handleRiskPredict} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Age" type="number" className="input-field" value={riskData.age} onChange={e => setRiskData({ ...riskData, age: e.target.value })} required />
                            <input placeholder="Heart Rate" type="number" className="input-field" value={riskData.heart_rate} onChange={e => setRiskData({ ...riskData, heart_rate: e.target.value })} required />
                            <input placeholder="Sys BP" type="number" className="input-field" value={riskData.sys_bp} onChange={e => setRiskData({ ...riskData, sys_bp: e.target.value })} required />
                            <input placeholder="Dia BP" type="number" className="input-field" value={riskData.dia_bp} onChange={e => setRiskData({ ...riskData, dia_bp: e.target.value })} required />
                        </div>
                        <button disabled={loadingRisk} className="btn-primary w-full flex justify-center items-center gap-2">
                            {loadingRisk ? <RefreshCw className="animate-spin" /> : 'Analyze Risk'}
                        </button>
                    </form>

                    {riskResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`mt-6 p-4 rounded-xl text-center border-2 ${riskResult === 'High' ? 'bg-red-50 border-red-200 text-red-700' :
                                riskResult === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                    'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}>
                            <p className="text-sm font-bold uppercase tracking-wider opacity-70">Predicted Risk Level</p>
                            <h3 className="text-3xl font-bold mt-1">{riskResult}</h3>
                        </motion.div>
                    )}
                </div>

                {/* Readmission Risk */}
                <div className="glass-panel p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <Clock className="text-purple-500" /> Readmission Probability
                    </h2>
                    <form onSubmit={handleReadmissionPredict} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Age" type="number" className="input-field" value={readmissionData.age} onChange={e => setReadmissionData({ ...readmissionData, age: e.target.value })} required />
                            <input placeholder="Prev Visits" type="number" className="input-field" value={readmissionData.prev_visits} onChange={e => setReadmissionData({ ...readmissionData, prev_visits: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <select className="input-field" value={readmissionData.chronic} onChange={e => setReadmissionData({ ...readmissionData, chronic: e.target.value })}>
                                <option value="0">No Chronic Cond.</option>
                                <option value="1">Chronic Condition</option>
                            </select>
                            <input placeholder="Days Since Last Visit" type="number" className="input-field" value={readmissionData.days_since} onChange={e => setReadmissionData({ ...readmissionData, days_since: e.target.value })} required />
                        </div>
                        <button disabled={loadingReadmission} className="btn-primary w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600">
                            {loadingReadmission ? <RefreshCw className="animate-spin" /> : 'Calculate Probability'}
                        </button>
                    </form>

                    {readmissionResult !== null && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-6 text-center"
                        >
                            <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${readmissionResult}%` }}
                                    transition={{ duration: 1 }}
                                    className={`h-full ${readmissionResult > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                />
                            </div>
                            <p className="mt-2 text-2xl font-bold text-slate-700">{readmissionResult}% <span className="text-base font-normal text-slate-500">probability of readmission</span></p>
                        </motion.div>
                    )}
                </div>

                {/* AI Diagnosis Assistant */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <Stethoscope className="text-emerald-500" /> AI Diagnosis Assistant
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-slate-500 mb-4 text-sm">Enter patient symptoms to get AI-suggested conditions.</p>
                            <form onSubmit={handleDiagnosisPredict} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700">Symptoms</label>
                                    <textarea
                                        rows="4"
                                        placeholder="E.g. High fever, dry cough, loss of smell, headache..."
                                        className="input-field"
                                        value={diagnosisSymptoms}
                                        onChange={e => setDiagnosisSymptoms(e.target.value)}
                                        required
                                    />
                                </div>
                                <button disabled={loadingDiagnosis} className="btn-primary w-full flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600">
                                    {loadingDiagnosis ? <RefreshCw className="animate-spin" /> : 'Identify Potential Conditions'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <h3 className="font-bold text-slate-700 mb-4">Top Predictions</h3>
                            {diagnosisResult ? (
                                <div className="space-y-4">
                                    {diagnosisResult.map((pred, idx) => (
                                        <div key={idx} className="space-y-2 p-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-800">{pred.condition}</span>
                                                <span className="text-slate-500 font-medium">{pred.confidence}% confidence</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pred.confidence}%` }}
                                                    transition={{ duration: 0.8 }}
                                                    className={`h-full rounded-full ${pred.confidence > 70 ? 'bg-red-500' :
                                                        pred.confidence > 40 ? 'bg-amber-500' : 'bg-blue-500'
                                                        }`}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    disabled={loadingPrescription}
                                                    onClick={() => handleSuggestTreatment(pred.condition)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                                >
                                                    {loadingPrescription ? <RefreshCw className="animate-spin" size={10} /> : <Plus size={10} />} Suggest Treatment
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-slate-400 opacity-60">
                                    <Brain size={48} className="mb-2" />
                                    <p>Awaiting symptom input...</p>
                                </div>
                            )}

                            {suggestedPrescription && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 pt-6 border-t border-slate-200"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                                            <Plus size={18} /> Recommended Treatment for {suggestedPrescription.condition}
                                        </h3>
                                        <button
                                            onClick={() => handleApplyToRecord(suggestedPrescription.condition, suggestedPrescription.meds)}
                                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-2"
                                        >
                                            Apply to Medical Record <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {suggestedPrescription.meds.map((med, i) => (
                                            <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 text-sm">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-slate-800">{med.name}</span>
                                                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase font-bold">{med.frequency}</span>
                                                </div>
                                                <p className="text-slate-600 text-xs mt-1">{med.dosage} for {med.duration}</p>
                                                {med.notes && <p className="text-emerald-600 text-[10px] mt-1 italic">Advice: {med.notes}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
