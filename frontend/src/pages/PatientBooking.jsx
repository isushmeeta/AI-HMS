import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientBooking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctor_id: '',
        date: '',
        time: '',
        reason: '',
        patient_id: user?.patient_id // Assuming user context has patient_id
    });
    const [bookingResult, setBookingResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch doctors
        fetch('http://localhost:5000/api/doctors')
            .then(res => res.json())
            .then(data => setDoctors(data))
            .catch(err => console.error('Error fetching doctors:', err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBookingResult(null);

        if (!formData.patient_id) {
            setError("Patient information not found. Please log in again.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.status === 409) {
                setError('Slot not available. Please choose another time.');
            } else if (response.ok) {
                setBookingResult(data);
                // Notification simulation or simple alert
                alert(`Appointment Booked! Your Serial Number is: ${data.serial_number}`);
            } else {
                setError(data.error || 'Booking failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Book Appointment</h1>

            <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
                {bookingResult ? (
                    <div className="text-center p-8">
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
                        <p className="text-lg text-slate-600">Your Serial Number:</p>
                        <div className="text-4xl font-bold text-blue-600 my-4">{bookingResult.serial_number}</div>
                        <button
                            onClick={() => { setBookingResult(null); setFormData({ ...formData, date: '', time: '', reason: '' }); }}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                            Book Another
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
                            <select
                                name="doctor_id"
                                value={formData.doctor_id}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Select Doctor --</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    type="date" name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                <input
                                    type="time" name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                        >
                            Book Appointment
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PatientBooking;
