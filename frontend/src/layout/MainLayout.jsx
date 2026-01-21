import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWidget from '../components/ChatWidget';
import { Bell, Search, User as UserIcon, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { AnimatePresence, motion } from 'framer-motion';

const MainLayout = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Polling for notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            // Need to know who we are fetching for. backend expects query param
            // Assuming we added a generic /notifications route or use specific ones
            // Based on earlier check, it seemed to be /notifications?doctor_id=...
            // Let's try a generic or role based approach if possible, or default to empty if not doc
            if (user?.role === 'Doctor') {
                const res = await api.get(`/notifications?doctor_id=${user.id}`);
                setNotifications(res.data);
            } else {
                // For now only doctors have the notification route implementation
                setNotifications([]);
            }
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Failed to mark read');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 relative">
            <Sidebar />

            <main className="pl-64 min-h-screen transition-all duration-300 flex flex-col">
                <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-white/50 backdrop-blur-md border-b border-white/20">
                    <div className="flex items-center gap-4 w-96">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setShowNotif(!showNotif)}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotif && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                                    >
                                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                            <h4 className="font-semibold text-slate-700 text-sm">Notifications</h4>
                                            <span className="text-xs text-slate-400">{unreadCount} unread</span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${n.is_read ? 'opacity-60' : ''}`}>
                                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-blue-500'}`} />
                                                        <div className="flex-1">
                                                            <p className="text-sm text-slate-700">{n.message}</p>
                                                            <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleTimeString()}</p>
                                                        </div>
                                                        {!n.is_read && (
                                                            <button onClick={() => handleMarkRead(n.id)} className="text-blue-500 hover:text-blue-700 self-center">
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Section */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-slate-700">
                                    {user ? ((user.role === 'Doctor' ? 'Dr. ' : '') + user.first_name + ' ' + user.last_name) : 'Guest'}
                                </p>
                                <p className="text-xs text-slate-500">{user?.role || 'Visitor'}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-slate-600 border-2 border-white shadow-sm">
                                <UserIcon size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* ChatWidget outside main to treat viewport as reference */}
            <ChatWidget />
        </div>
    );
};

export default MainLayout;
