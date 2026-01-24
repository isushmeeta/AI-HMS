import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Records from './pages/Records';
import AIInsights from './pages/AIInsights';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientRegister from './pages/PatientRegister';
import PatientBooking from './pages/PatientBooking';
import ReceptionistBooking from './pages/ReceptionistBooking';
import Profile from './pages/Profile';
import PatientAI from './pages/PatientAI';
import AdminSettings from './pages/AdminSettings';
import SystemInsights from './pages/SystemInsights';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/patient-register" element={<PatientRegister />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="records" element={<Records />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="symptom-checker" element={<PatientAI />} />
            <Route path="book-appointment" element={<PatientBooking />} />
            <Route path="receptionist/book" element={
              <ProtectedRoute roles={['Receptionist', 'Admin']}>
                <ReceptionistBooking />
              </ProtectedRoute>
            } />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="system-insights" element={<SystemInsights />} />
            <Route path="*" element={<div className="p-8 text-center text-slate-500">Page not found</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
