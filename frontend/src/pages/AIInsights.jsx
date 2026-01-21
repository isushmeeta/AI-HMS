import { useState } from 'react';
import { Activity, Thermometer, Clock, Brain, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AIInsights = () => {
    const [riskData, setRiskData] = useState({ age: '', sys_bp: '', dia_bp: '', heart_rate: '' });
    const [readmissionData, setReadmissionData] = useState({ age: '', prev_visits: '', chronic: '0', days_since: '' });

    const [riskResult, setRiskResult] = useState(null);
    const [readmissionResult, setReadmissionResult] = useState(null);
    const [loadingRisk, setLoadingRisk] = useState(false);
    const [loadingReadmission, setLoadingReadmission] = useState(false);

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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Brain className="text-primary" /> AI Decision Support
                </h1>
                <p className="text-slate-500">Real-time clinical insights powered by Machine Learning</p>
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
                            <input placeholder="Heart Rate (BPM)" type="number" className="input-field" value={riskData.heart_rate} onChange={e => setRiskData({ ...riskData, heart_rate: e.target.value })} required />
                            <input placeholder="Sys BP (mmHg)" type="number" className="input-field" value={riskData.sys_bp} onChange={e => setRiskData({ ...riskData, sys_bp: e.target.value })} required />
                            <input placeholder="Dia BP (mmHg)" type="number" className="input-field" value={riskData.dia_bp} onChange={e => setRiskData({ ...riskData, dia_bp: e.target.value })} required />
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
                            <input placeholder="Prev Visits (Count)" type="number" className="input-field" value={readmissionData.prev_visits} onChange={e => setReadmissionData({ ...readmissionData, prev_visits: e.target.value })} required />
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
            </div>
        </div>
    );
};

export default AIInsights;
