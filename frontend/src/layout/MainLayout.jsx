import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWidget from '../components/ChatWidget';
import { Bell, Search, User } from 'lucide-react';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <Sidebar />

            <main className="pl-64 min-h-screen transition-all duration-300">
                <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-white/50 backdrop-blur-md border-b border-white/20">
                    <div className="flex items-center gap-4 w-96">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search patients, doctors..."
                                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-slate-700">Dr. Smith</p>
                                <p className="text-xs text-slate-500">Cardiologist</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-slate-600 border-2 border-white shadow-sm">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </div>
                <ChatWidget />
            </main>
        </div>
    );
};

export default MainLayout;
