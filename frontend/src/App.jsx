import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import StudentPortal from './pages/StudentPortal';
import AdminDashboard from './components/AdminDashboard';
import GuestDashboard from './components/GuestDashboard';
import ThemeToggle from './components/ThemeToggle';

import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import GuestLogin from './pages/GuestLogin';
import ForgotPassword from './pages/ForgotPassword';
import GateTiming from './pages/GateTiming';

const App = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [guestRequests, setGuestRequests] = useState([]);
    const [announcements, setAnnouncements] = useState([
        { id: 1, title: 'WiFi Maintenance', content: 'WiFi will be down for 2 hours tonight starting from 11 PM for server upgrades.', date: '2023-10-20', priority: 'High' },
        { id: 2, title: 'Annual Fest Meeting', content: 'All residents are invited to the common room for the annual fest planning at 6 PM tomorrow.', date: '2023-10-18', priority: 'Medium' },
    ]);

    const sampleStudents = [
        {
            id: 'STU1001',
            studentId: 'STU1001',
            firstName: 'Aarav',
            lastName: 'Mehta',
            name: 'Aarav Mehta',
            roomNumber: 101,
            phone: '+91 9876543210',
            status: 'active',
            floor: 1,
            pendingFee: 32000,
            messBill: 5000,
            gymBill: 2000,
            profilePhoto: 'https://ui-avatars.com/api/?name=Aarav+Mehta&background=random&color=fff&size=200',
            feeStatus: 'unpaid'
        },
        {
            id: 'STU1002',
            studentId: 'STU1002',
            firstName: 'Naina',
            lastName: 'Patel',
            name: 'Naina Patel',
            roomNumber: 102,
            phone: '+91 9123456780',
            status: 'active',
            floor: 1,
            pendingFee: 0,
            messBill: 0,
            gymBill: 0,
            profilePhoto: 'https://ui-avatars.com/api/?name=Naina+Patel&background=random&color=fff&size=200',
            feeStatus: 'paid'
        }
    ];

    const sampleRooms = [
        { id: 'R101', roomNumber: 101, capacity: 2, currentOccupancy: 1, hostelId: 1 },
        { id: 'R102', roomNumber: 102, capacity: 2, currentOccupancy: 2, hostelId: 1 },
        { id: 'R201', roomNumber: 201, capacity: 3, currentOccupancy: 1, hostelId: 2 }
    ];

    const sampleGuestRequests = [
        { id: 'G001', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 9988776655', checkIn: '2024-07-15', checkOut: '2024-07-18', status: 'pending', wantsFood: true, wantsLaundry: false, feeStatus: 'pending', totalFee: 4500, paymentMethod: 'CASH', actionDate: '', actionBy: '', roomNumber: '', otp: '', createdAt: new Date(), updatedAt: new Date() },
        { id: 'G002', name: 'Sanya Gupta', email: 'sanya.gupta@example.com', phone: '+91 9876501234', checkIn: '2024-07-20', checkOut: '2024-07-22', status: 'approved', wantsFood: true, wantsLaundry: true, feeStatus: 'paid', totalFee: 6200, paymentMethod: 'CASH', actionDate: '2024-07-19', actionBy: 'WARDEN', roomNumber: '201', otp: '438902', createdAt: new Date(), updatedAt: new Date() }
    ];

    const [complaints, setComplaints] = useState([
        { id: 'T-101', student: 'Aarav Mehta', room: '201', title: 'WiFi Connectivity Issues', category: 'Internet', status: 'Pending', description: 'Signal strength is very low in the room.', date: '2023-10-24' },
        { id: 'T-102', student: 'Ishita Sharma', room: '104', title: 'Leaking Tap in Washroom', category: 'Plumbing', status: 'In Progress', description: 'Tap is continuously dripping.', date: '2023-10-23' },
        { id: 'T-103', student: 'Rahul Singh', room: '305', title: 'Fan Making Noise', category: 'Electrical', status: 'Pending', description: 'Ceiling fan making loud noise at high speed.', date: '2023-10-22' },
    ]);

    const handleAddRoom = (newRoom) => {
        setRooms(prev => [...prev, { ...newRoom, id: prev.length + 1 }]);
    };

    const handleUpdateComplaint = (id, status) => {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    };

    const handleAddComplaint = (complaint) => {
        setComplaints(prev => [complaint, ...prev]);
    };

    const fetchDashboardData = async (token) => {
        try {
            const res = await fetch('/api/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStudents((data.students && data.students.length) ? data.students : sampleStudents);
                setRooms((data.rooms && data.rooms.length) ? data.rooms : sampleRooms);
                setGuestRequests((data.guestRequests && data.guestRequests.length) ? data.guestRequests : sampleGuestRequests);
            } else {
                setStudents(sampleStudents);
                setRooms(sampleRooms);
                setGuestRequests(sampleGuestRequests);
            }
        } catch (e) {
            console.error("Failed to fetch dashboard data", e);
        }
    };

    const handleLogin = (role, id, token) => {
        const userInfo = { role, id, token };
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('token', token);

        if (role === 'STUDENT') navigate('/student');
        else if (role === 'ADMIN' || role === 'WARDEN') {
            fetchDashboardData(token);
            navigate('/admin');
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            const token = localStorage.getItem('token');
            if (token && (parsedUser.role === 'ADMIN' || parsedUser.role === 'WARDEN')) {
                fetchDashboardData(token);
            }
        }
    }, []);

    const updateStudentPhoto = (id, photoBase64) => {
        setStudents(prev => prev.map(s => s.studentId === id ? { ...s, profilePhoto: photoBase64 } : s));
    };

    const updateGuestData = (id, newData) => {
        setGuestRequests(prev => prev.map(g => g.id === id ? { ...g, ...newData } : g));
    };

    const updateGuestStatus = async (id, status) => {
        // Optimistic update
        setGuestRequests(prev => prev.map(g => g.id === id ? { ...g, status } : g));

        try {
            if (!user?.token) return;
            const res = await fetch(`/api/guest/${id}`, {
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
        } catch (e) {
            console.error('Guest update error:', e);
            // Optionally revert on error if needed, but for prototypes, staying with optimistic is usually better
        }
    };


    const updateStudentProfile = (id, updatedData) => {
        setStudents(prev => prev.map(s => s.studentId === id ? { ...s, ...updatedData } : s));
    };

    const location = useLocation();
    const isLoginRoute = ['/login', '/student-login', '/admin-login', '/guest-login', '/register', '/forgot-password', '/guest'].includes(location.pathname);
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isStudentRoute = location.pathname.startsWith('/student');

    return (
        <div
            className={`min-h-screen relative flex flex-col overflow-x-hidden transition-all duration-700 bg-background text-textPrimary`}
        >
            {isLoginRoute && (
                <div
                    className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-5 pointer-events-none"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555854817-5b2260d1bd63?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
                />
            )}


            {!isAdminRoute && !isStudentRoute && (
                <nav className={`backdrop-blur-3xl border-b px-8 py-5 flex justify-between items-center sticky top-0 z-50 transition-all duration-500 glass`}>
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 animate-float">
                            <i className="fas fa-home text-white text-lg"></i>
                        </div>
                        <h1 className={`text-2xl font-black tracking-tighter text-white font-heading italic`}>
                            Hostel<span className="text-primary">Mate</span>
                        </h1>
                    </Link>
                    <div className="flex items-center gap-6">
                        {user && (
                            <>
                                <span className="text-[10px] font-black bg-white/5 border border-white/10 text-primary px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                                    {user.role}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-textSecondary hover:text-error transition-all hover:scale-110 active:scale-95"
                                >
                                    <i className="fas fa-power-off text-xl"></i>
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            )}


            <main className="flex-1 flex flex-col relative z-10">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />

                    <Route
                        path="/login"
                        element={user ? <Navigate to={user.role === 'STUDENT' ? '/student' : '/admin'} /> : <LoginPage />}
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
                        element={<RegistrationPage onRegister={() => navigate('/login')} />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/gate-timing"
                        element={<GateTiming />}
                    />

                    <Route
                        path="/admin/*"
                        element={(user?.role === 'ADMIN' || user?.role === 'WARDEN') ?
                            <AdminDashboard
                                students={students}
                                guestRequests={guestRequests}
                                rooms={rooms}
                                onUpdateGuestData={updateGuestData}
                                onUpdateGuest={updateGuestStatus}
                                onUpdatePhoto={updateStudentPhoto}
                                onLogout={handleLogout}
                                onAddRoom={handleAddRoom}
                                complaints={complaints}
                                onUpdateComplaint={handleUpdateComplaint}
                                onRefreshData={() => fetchDashboardData(localStorage.getItem('token'))}
                            /> : <Navigate to="/admin-login" />
                        }
                    />

                    <Route
                        path="/student/*"
                        element={user?.role === 'STUDENT' ?
                            <StudentPortal
                                student={students.find(s => s.studentId === user.id) || students[0]}
                                announcements={announcements}
                                onLogout={handleLogout}
                                complaints={complaints}
                                onAddComplaint={handleAddComplaint}
                                onUpdateProfile={updateStudentProfile}
                            /> : <Navigate to="/student-login" />
                        }
                    />

                    <Route
                        path="/guest"
                        element={<GuestDashboard
                            allRequests={guestRequests}
                            onRequestSubmit={async (req) => {
                                try {
                                    const res = await fetch('/api/guest/request', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            ...req,
                                            totalFee: req.totalFee || req.costBreakdown?.total || 0,
                                            feeStatus: 'pending' // As per cash flow
                                        })
                                    });
                                    setGuestRequests(prev => [...prev, req]);
                                    alert('Request submitted!');
                                } catch (e) {
                                    console.log('API failed, falling back to local state');
                                    setGuestRequests(prev => [...prev, req]);
                                }
                            }}
                        />}
                    />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;
