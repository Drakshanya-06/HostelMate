import React, { useState, useEffect } from 'react';
import StudentDashboard from '../components/StudentDashboard';

const StudentPortal = ({ student: initialStudent, announcements, onLogout, complaints, onAddComplaint, onUpdateProfile }) => {
    const [student, setStudent] = useState(initialStudent);
    const [loading, setLoading] = useState(!initialStudent);

    useEffect(() => {
        if (!initialStudent) {
            fetchProfile();
        }
    }, [initialStudent]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/student/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStudent(data);
            }
        } catch (e) {
            console.error("Failed to fetch profile", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!student) return <div className="min-h-screen flex items-center justify-center">Student profile not found. Please login again.</div>;

    return <StudentDashboard student={student} announcements={announcements} onLogout={onLogout} complaints={complaints} onAddComplaint={onAddComplaint} onUpdateProfile={onUpdateProfile} onRefreshProfile={fetchProfile} />;
};

export default StudentPortal;
