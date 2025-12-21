import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import StudentPortal from './pages/StudentPortal';
import AdminDashboard from './components/AdminDashboard';
import GuestDashboard from './components/GuestDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';

import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import GuestLogin from './pages/GuestLogin';
import ForgotPassword from './pages/ForgotPassword';

const App = () => {
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [guestRequests, setGuestRequests] = useState([]);

    const handleLogin = (role, id, token) => {
        setUser({ role, id, token });
        localStorage.setItem('token', token);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        setStudents([]);
        setGuestRequests([]);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.token) return;
            try {
                const res = await fetch('/api/dashboard', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStudents(data.students || []);
                    setRooms(data.rooms || []);
                    setGuestRequests(data.guestRequests || []);
                }
            } catch (e) { console.error("Failed to fetch data", e); }
        };
        fetchData();
    }, [user?.token]);

    const handleRegister = (newStudent) => {
        console.log("Registration successful", newStudent);
    };

    const updateStudentPhoto = (id, photoBase64) => {
        setStudents(prev => prev.map(s => s.studentId === id ? { ...s, profilePhoto: photoBase64 } : s));
    };

    const updateGuestStatus = async (id, status) => {
        try {
            if (!user?.token) return;
            const res = await fetch(`/api/guest-request/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ status, actionBy: user.role })
            });
            if (res.ok) {
                const updated = await res.json();
                setGuestRequests(prev => prev.map(g => g.id === id ? updated : g));
            }
        } catch (e) { console.error(e); }
    };


    // ...

    return (
        <ThemeProvider>
            <LanguageProvider>
                <HashRouter>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
                        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="bg-indigo-600 text-white p-2 rounded-lg">
                                    <i className="fas fa-hotel"></i>
                                </div>
                                <h1 className="text-xl font-bold text-gray-800 dark:text-white">HostelWise</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <LanguageSelector />
                                <ThemeToggle />
                                {user && (
                                    <>
                                        <span className="text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1 rounded-full uppercase">
                                            {user.role}
                                        </span>
                                        <button
                                            onClick={handleLogout}
                                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 transition-colors"
                                        >
                                            <i className="fas fa-sign-out-alt"></i>
                                        </button>
                                    </>
                                )}
                            </div>
                        </nav>


                        <main className="flex-1 flex flex-col">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Navigate to="/login" />} />

                                <Route
                                    path="/login"
                                    element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <LoginPage />}
                                />

                                <Route
                                    path="/student-login"
                                    element={user ? <Navigate to="/student" /> : <StudentLogin onLogin={handleLogin} />}
                                />

                                <Route
                                    path="/admin-login"
                                    element={user ? <Navigate to="/admin" /> : <AdminLogin onLogin={handleLogin} />}
                                />

                                <Route
                                    path="/guest-login"
                                    element={<GuestLogin />}
                                />

                                <Route
                                    path="/register"
                                    element={<RegistrationPage onRegister={handleRegister} />}
                                />

                                <Route
                                    path="/forgot-password"
                                    element={<ForgotPassword />}
                                />

                                {/* Protected Routes */}
                                <Route
                                    path="/admin/*"
                                    element={user?.role === 'ADMIN' ?
                                        <AdminDashboard
                                            students={students}
                                            guestRequests={guestRequests}
                                            rooms={rooms}
                                            onUpdateGuest={updateGuestStatus}
                                            onUpdatePhoto={updateStudentPhoto}
                                        /> : <Navigate to="/admin-login" />
                                    }
                                />

                                <Route
                                    path="/student/*"
                                    element={user?.role === 'STUDENT' ?
                                        <StudentPortal student={students.find(s => s.studentId === user.id) || students[0]} /> : <Navigate to="/student-login" />
                                    }
                                />

                                <Route
                                    path="/guest"
                                    element={<GuestDashboard onRequestSubmit={async (req) => {
                                        try {
                                            await fetch('/api/guest/request', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(req)
                                            });
                                            alert('Request submitted!');
                                        } catch (e) { console.error(e); }
                                    }} />}
                                />

                                <Route path="*" element={<Navigate to="/login" />} />
                            </Routes>
                        </main>
                    </div>
                </HashRouter>
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
