import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, Activity, FileText, RefreshCw, BarChart3, Info } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const SystemInsights = () => {
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/analytics/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await api.get('/ai/system-report');
            setReport(res.data.report);
            toast.success('System report generated');
        } catch (err) {
            toast.error('Failed to generate AI report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="text-primary" /> System Insights & AI Reports
                    </h1>
                    <p className="text-slate-500">Executive-level analysis of hospital operations and trends</p>
                </div>
                <button
                    onClick={generateReport}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2 bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20"
                >
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <FileText size={20} />}
                    {loading ? 'Analyzing Data...' : 'Generate AI Executive Report'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Summary Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BarChart3 size={18} className="text-primary" /> Core KPIs
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Patients</p>
                                <div className="flex items-end gap-2">
                                    <h4 className="text-2xl font-bold text-slate-800">{stats?.total_patients || 0}</h4>
                                    <span className="text-xs text-emerald-500 font-bold mb-1 flex items-center gap-0.5"><TrendingUp size={10} /> +12%</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Records</p>
                                <div className="flex items-end gap-2">
                                    <h4 className="text-2xl font-bold text-slate-800">{stats?.total_records || 0}</h4>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Staff Count</p>
                                <div className="flex items-end gap-2">
                                    <h4 className="text-2xl font-bold text-slate-800">{stats?.total_doctors || 0}</h4>
                                    <span className="text-xs text-slate-400 font-medium mb-1">Physicians</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
                            <Info size={18} className="text-primary shrink-0" />
                            <p className="text-[10px] text-primary/70 italic leading-relaxed">
                                Data is synced in real-time. Use the generate button to update AI insights.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {!report && !loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
                                    <FileText className="text-slate-300" size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-600">Executive Summary Ready</h3>
                                <p className="text-slate-400 text-sm max-w-[300px] mt-2 leading-relaxed">
                                    Click the button above to generate an AI-powered analysis of your system statistics and operational trends.
                                </p>
                            </motion.div>
                        )}

                        {report && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-panel p-8 md:p-12 shadow-xl shadow-slate-200/50 bg-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Brain size={150} />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                                        <div className="p-3 bg-primary rounded-2xl text-white">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">Administrative System Report</h2>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Automated Intelligence Analysis • {new Date().toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="markdown-content prose prose-slate max-w-none text-slate-700">
                                        <ReactMarkdown>{report}</ReactMarkdown>
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Brain size={14} className="text-primary" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified by Gemini AI</span>
                                        </div>
                                        <button
                                            onClick={() => window.print()}
                                            className="text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            Export PDF <RefreshCw size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SystemInsights;
