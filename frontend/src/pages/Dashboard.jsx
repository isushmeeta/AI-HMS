import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center text-red-500">Please log in to view dashboard.</div>;
    }

    switch (user.role) {
        case 'Admin':
            return <AdminDashboard user={user} />;
        case 'Doctor':
            return <DoctorDashboard user={user} />;
        case 'Receptionist':
            return <ReceptionistDashboard user={user} />;
        case 'Patient':
            // Patient might have a simpler view or redirect to Appointments
            // For now, let's give them a welcome and quick links
            return (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-slate-800">Patient Dashboard</h1>
                    <p className="text-slate-500">Welcome, {user.username}</p>
                    <div className="glass-panel p-6">
                        <p>Access your appointments and records from the sidebar.</p>
                    </div>
                </div>
            );
        default:
            return (
                <div className="p-8 text-center">
                    <h1 className="text-xl font-bold">Unknown Role</h1>
                    <p>Please contact support.</p>
                </div>
            );
    }
};

export default Dashboard;

