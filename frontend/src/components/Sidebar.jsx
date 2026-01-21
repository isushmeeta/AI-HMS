import { Home, Users, Calendar, Activity, Settings, LogOut, Stethoscope, Brain } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Patients', path: '/patients' },
        { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: Activity, label: 'Records', path: '/records' },
        { icon: Brain, label: 'AI Insights', path: '/ai-insights' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/20 z-50 flex flex-col"
        >
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    +
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    AI-HMS
                </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon size={20} className={clsx(isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
