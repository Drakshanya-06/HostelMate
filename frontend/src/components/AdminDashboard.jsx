import React, { useState } from 'react';

const AdminDashboard = ({ students, guestRequests, rooms, onUpdateGuest, onUpdatePhoto, onUpdateGuestData, onLogout, onAddRoom, complaints, onUpdateComplaint, onRefreshData }) => {
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [visitorSearch, setVisitorSearch] = useState('');
    const [showFullGateLogs, setShowFullGateLogs] = useState(false);
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [newRoomData, setNewRoomData] = useState({ roomNumber: '', type: 'Double', capacity: 2, floor: 1, hostelId: 1 });
    const [toasts, setToasts] = useState([]);
    const [pendingPayments, setPendingPayments] = useState({ students: [], guests: [] });
    const [paymentsLoading, setPaymentsLoading] = useState(false);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const simulateEmail = (req) => {
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        const roomNo = rooms.find(r => (r.capacity || 0) > (r.occupied || 0))?.roomNumber || "TBD-101";
        const emailBody = `
            To: ${req.email || 'guest@example.com'}
            Subject: Booking Confirmed - OTP: ${otp}
            
            Hello ${req.name},
            Your stay request has been APPROVED!
            
            Your Login OTP: ${otp}
            Dates: ${new Date(req.checkIn || req.arrivalDate).toLocaleDateString()} to ${new Date(req.checkOut).toLocaleDateString()}
            Room Number: ${roomNo}
            
            We look forward to welcoming you!
        `;
        console.log("%c[MOCK EMAIL SENT]", "color: #4f46e5; font-weight: bold; font-size: 1.2em;", emailBody);
        addToast(`Confirmation email with OTP ${otp} sent to ${req.email || 'guest'}`, 'success');
    };

    const fetchPendingPayments = async () => {
        setPaymentsLoading(true);
        try {
            const res = await fetch('/api/admin/pending-payments', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPendingPayments(data);
            }
        } catch (e) {
            console.error("Failed to fetch payments", e);
        } finally {
            setPaymentsLoading(false);
        }
    };

    const handleApprovePayment = async (id, type) => {
        try {
            const res = await fetch(`/api/admin/approve-payment/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type })
            });
            if (res.ok) {
                addToast('Payment Approved Successfully!', 'success');
                fetchPendingPayments();
                if (onRefreshData) onRefreshData();
            } else {
                const err = await res.json();
                addToast(err.message, 'error');
            }
        } catch (e) {
            addToast('Approval failed', 'error');
        }
    };

    React.useEffect(() => {
        if (activeTab === 'FEES') {
            fetchPendingPayments();
        }
    }, [activeTab]);

    // Derived Stats
    const totalOccupancy = students.length;
    const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const occupancyRate = totalCapacity ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
    const pendingFees = students.reduce((acc, s) => acc + (s.pendingFee || 0) + (s.messBill || 0) + (s.gymBill || 0), 0);
    const pendingGuestRequests = guestRequests.filter(g => g.status === 'pending').length;

    const filteredStudents = students.filter(s => {
        if (searchTerm === 'unpaid') return s.pendingFee > 0;
        return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="min-h-screen flex flex-col md:flex-row transition-all duration-300 relative">
            {/* Custom Toast Container */}
            <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`px-6 py-4 rounded-2xl shadow-2xl border-l-4 flex items-center gap-3 animate-in slide-in-from-right-full duration-300 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
                            toast.type === 'error' ? 'bg-rose-50 border-rose-500 text-rose-800' :
                                'bg-indigo-50 border-indigo-500 text-indigo-800'
                            }`}
                    >
                        <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
                        <span className="text-sm font-bold">{toast.message}</span>
                    </div>
                ))}
            </div>
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800 text-white md:min-h-screen sticky top-0 z-40 shadow-2xl flex flex-col">
                <div className="p-8 border-b border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2 rounded-xl">
                            <i className="fas fa-home text-xl"></i>
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter italic">Hostel<span className="text-indigo-500">Mate</span></h2>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administrative Control</p>
                </div>
                <nav className="p-6 flex-1 space-y-4">
                    {[
                        { id: 'OVERVIEW', icon: 'fa-chart-line', label: 'Intelligence' },
                        { id: 'STUDENTS', icon: 'fa-users', label: 'Residents' },
                        { id: 'GUESTS', icon: 'fa-address-book', label: 'Visitor Logs' },
                        { id: 'ROOMS', icon: 'fa-warehouse', label: 'Inventory' },
                        { id: 'FACILITIES', icon: 'fa-dumbbell', label: 'Facilities' },
                        { id: 'FEES', icon: 'fa-indian-rupee-sign', label: 'Fee Approvals' },
                        { id: 'COMPLAINTS', icon: 'fa-headset', label: 'Support' },
                        { id: 'GATE', icon: 'fa-clock-rotate-left', label: 'Gate Timing' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === item.id
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-[1.02]'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:pl-7'
                                }`}
                        >
                            <i className={`fas ${item.icon} text-lg w-6 text-center`}></i>
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-300"
                    >
                        <i className="fas fa-sign-out-alt text-lg w-6 text-center"></i>
                        <span className="text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-rose-50 text-slate-900">
                <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {activeTab === 'OVERVIEW' ? 'Command Center' :
                                activeTab === 'STUDENTS' ? 'Resident Directory' :
                                    activeTab === 'GUESTS' ? 'Visitor Requests' :
                                        activeTab === 'FACILITIES' ? 'Amenity Operations' :
                                            activeTab === 'GATE' ? 'Gate Movement' :
                                                activeTab === 'FEES' ? 'Fee Verification Center' :
                                                    activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
                        </h1>
                        <p className="text-slate-900 mt-2 font-medium">HostelMate Analytics & Management</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all flex items-center gap-2 border border-rose-100 dark:border-rose-800"
                    >
                        <i className="fas fa-power-off"></i>
                        Sign Out
                    </button>
                </header>

                {activeTab === 'OVERVIEW' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <button
                                onClick={() => setActiveTab('STUDENTS')}
                                className="text-left group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 hover:border-indigo-500 transition-all duration-300"
                            >
                                <div className="mb-6 group-hover:scale-110 transition-transform">
                                    <i className="fas fa-users text-5xl text-indigo-600 dark:text-indigo-400"></i>
                                </div>
                                <div className="text-slate-900 text-sm font-bold mb-1">Total Residents</div>
                                <div className="text-4xl font-black text-slate-900">800</div>
                                <div className="text-xs text-emerald-500 mt-3 font-bold bg-emerald-50 dark:bg-emerald-900/20 inline-block px-2 py-1 rounded-lg">
                                    <i className="fas fa-trending-up mr-1"></i> +8% growth
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTab('ROOMS')}
                                className="text-left group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 hover:border-emerald-500 transition-all duration-300"
                            >
                                <div className="mb-6 group-hover:scale-110 transition-transform">
                                    <i className="fas fa-building text-5xl text-emerald-600 dark:text-emerald-400"></i>
                                </div>
                                <div className="text-slate-900 text-sm font-bold mb-1">Occupancy</div>
                                <div className="text-4xl font-black text-slate-900">10% Avail</div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${occupancyRate}%` }}></div>
                                </div>
                            </button>

                            <button
                                onClick={() => { setActiveTab('STUDENTS'); setSearchTerm('unpaid'); }}
                                className="text-left group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 hover:border-rose-500 transition-all duration-300"
                            >
                                <div className="mb-6 group-hover:scale-110 transition-transform">
                                    <i className="fas fa-indian-rupee-sign text-5xl text-rose-600 dark:text-rose-400"></i>
                                </div>
                                <div className="text-slate-900 text-sm font-bold mb-1">Unpaid Dues</div>
                                <div className="text-4xl font-black text-slate-900">₹{pendingFees.toLocaleString()}</div>
                                <div className="text-xs text-rose-500 mt-3 font-bold bg-rose-50 dark:bg-rose-900/20 inline-block px-2 py-1 rounded-lg">
                                    Needs attention
                                </div>
                            </button>

                            <button
                                onClick={() => { setActiveTab('GUESTS'); setVisitorSearch('pending'); }}
                                className="text-left group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 hover:border-amber-500 transition-all duration-300"
                            >
                                <div className="mb-6 group-hover:scale-110 transition-transform">
                                    <i className="fas fa-clipboard-list text-5xl text-amber-600 dark:text-amber-400"></i>
                                </div>
                                <div className="text-slate-900 text-sm font-bold mb-1">New Requests</div>
                                <div className="text-4xl font-black text-slate-900">{pendingGuestRequests}</div>
                                <div className="text-xs text-amber-500 mt-3 font-bold bg-amber-50 dark:bg-amber-900/20 inline-block px-2 py-1 rounded-lg">
                                    Pending action
                                </div>
                            </button>
                        </div>

                        {/* Campus Pulse Section */}
                        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            {/* Announcements */}
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3">
                                        <i className="fas fa-bullhorn text-indigo-500"></i> Announcements
                                    </h3>
                                    <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wider">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { title: "Hostel Night Registration", date: "Dec 24", urgency: "High" },
                                        { title: "Winter Break Schedule", date: "Dec 20", urgency: "Medium" },
                                        { title: "Maintenance Work", date: "Dec 18", urgency: "Low" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group">
                                            <div className="text-center min-w-[3rem]">
                                                <span className="block text-xs font-black text-slate-400 uppercase">{item.date.split(' ')[0]}</span>
                                                <span className="block text-xl font-black text-slate-800 dark:text-white">{item.date.split(' ')[1]}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${item.urgency === 'High' ? 'text-rose-500' :
                                                    item.urgency === 'Medium' ? 'text-amber-500' : 'text-slate-400'
                                                    }`}>{item.urgency} Priority</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Events */}
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3">
                                        <i className="fas fa-calendar-star text-amber-500"></i> Upcoming Events
                                    </h3>
                                    <button className="text-xs font-bold text-slate-400 hover:text-amber-600 uppercase tracking-wider">Calendar</button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { title: "Freshers Welcome Party", time: "6:00 PM", date: "Dec 25" },
                                        { title: "Exam Prep Workshop", time: "10:00 AM", date: "Dec 28" },
                                        { title: "New Year Celebration", time: "8:00 PM", date: "Jan 01" }
                                    ].map((event, i) => (
                                        <div key={i} className="flex gap-4 items-center p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-amber-900/30 flex items-center justify-center text-amber-500 font-black text-xs shadow-sm">
                                                {event.date.split(' ')[1]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{event.title}</h4>
                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    <i className="fas fa-clock text-[10px]"></i> {event.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Shortcuts */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-[2rem] p-8 text-white relative overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-rose-500/30 transition-all">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                    <i className="fas fa-dumbbell text-9xl"></i>
                                </div>
                                <h3 className="font-black text-2xl mb-2 relative z-10">Gym Status</h3>
                                <div className="flex gap-8 mt-6 relative z-10">
                                    <div>
                                        <span className="block text-3xl font-black">42</span>
                                        <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">Active Now</span>
                                    </div>
                                    <div>
                                        <span className="block text-3xl font-black">Peak</span>
                                        <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">Crowd Level</span>
                                    </div>
                                </div>
                                <button className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors">
                                    Manage Gym
                                </button>
                            </div>

                            <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                    <i className="fas fa-tshirt text-9xl"></i>
                                </div>
                                <h3 className="font-black text-2xl mb-2 relative z-10">Laundry Operations</h3>
                                <div className="flex gap-8 mt-6 relative z-10">
                                    <div>
                                        <span className="block text-3xl font-black">12</span>
                                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Machines Free</span>
                                    </div>
                                    <div>
                                        <span className="block text-3xl font-black">On Time</span>
                                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Service Status</span>
                                    </div>
                                </div>
                                <button className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors">
                                    View Schedule
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'STUDENTS' && (
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Resident Database</h3>
                            <div className="relative w-full md:w-80 group">
                                <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5">Profile ID</th>
                                        <th className="px-8 py-5">Resident Name</th>
                                        <th className="px-8 py-5">Allocation</th>
                                        <th className="px-8 py-5">Financial Obligations</th>
                                        <th className="px-8 py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {filteredStudents.map(student => (
                                        <tr
                                            key={student.id}
                                            onClick={() => setSelectedStudent(student)}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group cursor-pointer"
                                        >
                                            <td className="px-8 py-6">
                                                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">#{student.id}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-extrabold text-slate-900 dark:text-white">{student.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Hostel Resident</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center rounded-lg text-indigo-600 dark:text-indigo-400 font-bold text-xs">{student.roomNumber}</span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Floor {student.floor}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm font-black text-slate-900 dark:text-white italic">₹{((student.pendingFee || 0) + (student.messBill || 0) + (student.gymBill || 0)).toLocaleString()}</div>
                                                    <div className="flex gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        <span>H (21.6k): ₹{student.pendingFee || 0}</span>
                                                        <span>M: ₹{student.messBill || 0}</span>
                                                        <span>G: ₹{student.gymBill || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`px-3 py-1.5 text-[10px] rounded-xl font-black uppercase tracking-wider border ${student.pendingFee + student.messBill + student.gymBill > 0
                                                    ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'
                                                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                                    }`}>
                                                    {student.pendingFee + student.messBill + student.gymBill > 0 ? 'Unpaid' : 'Paid'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'GUESTS' && (
                    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Trace Visitor Request</label>
                            <div className="relative group">
                                <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></i>
                                <input
                                    type="text"
                                    placeholder="Search by name or reference ID..."
                                    value={visitorSearch}
                                    onChange={(e) => setVisitorSearch(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {guestRequests.filter(r =>
                            r.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
                            r.id.toLowerCase().includes(visitorSearch.toLowerCase()) ||
                            r.status.toLowerCase().includes(visitorSearch.toLowerCase())
                        ).length === 0 && (
                                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-12 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                    <div className="text-slate-300 dark:text-slate-600 text-5xl mb-4"><i className="fas fa-inbox"></i></div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold">No visitors match your search trace.</p>
                                </div>
                            )}
                        <div className="space-y-6">
                            {guestRequests.filter(r =>
                                r.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
                                r.id.toLowerCase().includes(visitorSearch.toLowerCase()) ||
                                r.status.toLowerCase().includes(visitorSearch.toLowerCase())
                            ).map(req => (
                                <div key={req.id} className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 hover:border-indigo-500 transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="group-hover:scale-110 transition-transform">
                                            <i className="fas fa-user text-5xl text-slate-400 dark:text-slate-500 group-hover:text-indigo-600"></i>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{req.name}</h4>
                                                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                    }`}>{req.status}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                <span><i className="fas fa-calendar-day mr-2 text-indigo-500"></i>Checkout: {req.checkOut}</span>
                                                {req.wantsFood && <span className="text-emerald-500"><i className="fas fa-utensils mr-2"></i> Meal Inclusive</span>}
                                                {req.paymentMethod && (
                                                    <span className="bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                                                        <i className="fas fa-credit-card mr-2"></i>{req.paymentMethod.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            {req.costBreakdown && (
                                                <div className="mt-6 flex flex-wrap gap-3">
                                                    <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/50 relative group/btn">
                                                        <span className="text-[10px] block text-indigo-400 font-extrabold uppercase">Stay</span>
                                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 italic">₹{req.costBreakdown.base || 0}</span>
                                                        {req.status === 'pending' && (
                                                            <button
                                                                onClick={() => {
                                                                    const newBase = Math.floor((req.costBreakdown.base || 0) * 0.9);
                                                                    const newTotal = newBase + (req.costBreakdown.meals || 0) + (req.costBreakdown.laundry || 0);
                                                                    onUpdateGuestData(req.id, {
                                                                        costBreakdown: { ...req.costBreakdown, base: newBase, total: newTotal }
                                                                    });
                                                                }}
                                                                className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover/btn:opacity-100 transition-all shadow-lg"
                                                                title="Apply 10% Discount"
                                                            ><i className="fas fa-percent"></i></button>
                                                        )}
                                                    </div>
                                                    <div className="px-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/50 relative group/btn">
                                                        <span className="text-[10px] block text-emerald-400 font-extrabold uppercase">Meals</span>
                                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 italic">₹{req.costBreakdown.meals || 0}</span>
                                                        {req.wantsFood && req.status === 'pending' && (
                                                            <button
                                                                onClick={() => {
                                                                    const newMeals = 0;
                                                                    const newTotal = (req.costBreakdown.base || 0) + newMeals + (req.costBreakdown.laundry || 0);
                                                                    onUpdateGuestData(req.id, {
                                                                        wantsFood: false,
                                                                        costBreakdown: { ...req.costBreakdown, meals: newMeals, total: newTotal }
                                                                    });
                                                                }}
                                                                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover/btn:opacity-100 transition-all shadow-lg"
                                                            ><i className="fas fa-minus"></i></button>
                                                        )}
                                                    </div>
                                                    <div className="px-4 py-2 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/50 relative group/btn">
                                                        <span className="text-[10px] block text-amber-400 font-extrabold uppercase">Laundry</span>
                                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 italic">₹{req.costBreakdown.laundry || 0}</span>
                                                        {req.wantsLaundry && req.status === 'pending' && (
                                                            <button
                                                                onClick={() => {
                                                                    const newLaundry = 0;
                                                                    const newTotal = (req.costBreakdown.base || 0) + (req.costBreakdown.meals || 0) + newLaundry;
                                                                    onUpdateGuestData(req.id, {
                                                                        wantsLaundry: false,
                                                                        costBreakdown: { ...req.costBreakdown, laundry: newLaundry, total: newTotal }
                                                                    });
                                                                }}
                                                                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover/btn:opacity-100 transition-all shadow-lg"
                                                            ><i className="fas fa-minus"></i></button>
                                                        )}
                                                    </div>
                                                    <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-700 flex flex-col justify-center">
                                                        <span className="text-[8px] block text-slate-500 font-extrabold uppercase">Verified Total</span>
                                                        <span className="text-sm font-black text-white italic">₹{req.costBreakdown.total || 0}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {req.status === 'pending' && (
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => {
                                                    onUpdateGuest(req.id, 'approved');
                                                    simulateEmail(req);
                                                }}
                                                className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => onUpdateGuest(req.id, 'rejected')}
                                                className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-8 py-4 rounded-2xl font-black text-sm transition-all"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ROOMS' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Space Utilization</div>
                                <div className="flex items-center gap-6">
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">{occupancyRate}%</div>
                                    <div className="flex-1">
                                        <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Available Slots</div>
                                <div className="text-4xl font-black text-emerald-500">{totalCapacity - totalOccupancy}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-2">Ready for Allocation</div>
                            </div>
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Capacity</div>
                                <div className="text-4xl font-black text-indigo-600">{totalCapacity}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-2">Combined Hostels</div>
                            </div>
                        </div>

                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Room Inventory Management</h3>
                                <div className="flex gap-2">
                                    <button className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-indigo-600 transition-all"><i className="fas fa-filter"></i></button>
                                    <button onClick={() => setShowAddRoomModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20">Add Room</button>
                                </div>
                            </div>
                            {/* Add Room Modal */}
                            {showAddRoomModal && (
                                <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Add New Room</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <input
                                            placeholder="Room Number"
                                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            value={newRoomData.roomNumber}
                                            onChange={e => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                                        />
                                        <select
                                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            value={newRoomData.type}
                                            onChange={e => setNewRoomData({ ...newRoomData, type: e.target.value })}
                                        >
                                            <option>Single</option>
                                            <option>Double</option>
                                            <option>Triple</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Capacity"
                                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            value={newRoomData.capacity}
                                            onChange={e => setNewRoomData({ ...newRoomData, capacity: parseInt(e.target.value) })}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    onAddRoom(newRoomData);
                                                    setShowAddRoomModal(false);
                                                    setNewRoomData({ roomNumber: '', type: 'Double', capacity: 2, floor: 1, hostelId: 1 });
                                                }}
                                                className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold flex-1"
                                            >Save</button>
                                            <button
                                                onClick={() => setShowAddRoomModal(false)}
                                                className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold"
                                            >Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Room Number</th>
                                            <th className="px-8 py-5">Type</th>
                                            <th className="px-8 py-5">Occupancy</th>
                                            <th className="px-8 py-5">Hostel Block</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                        {rooms.map(room => (
                                            <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                            {room.roomNumber}
                                                        </div>
                                                        <span className="font-black text-slate-900 dark:text-white">Suite {room.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{room.capacity}-Seater</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex -space-x-3">
                                                            {[...Array(room.occupied || 0)].map((_, i) => (
                                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                                    <i className="fas fa-user"></i>
                                                                </div>
                                                            ))}
                                                            {[...Array((room.capacity || 0) - (room.occupied || 0))].map((_, i) => (
                                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-300 flex items-center justify-center text-[10px]">
                                                                    <i className="fas fa-plus"></i>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400">{room.occupied || 0}/{room.capacity}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-slate-600 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">Block {room.hostelId}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="text-slate-400 hover:text-indigo-600 transition-colors"><i className="fas fa-ellipsis-v"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'FACILITIES' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Mess Impact</div>
                                <div className="flex items-center gap-6">
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">{students.filter(s => s.hasMess).length}</div>
                                    <div className="text-[10px] text-indigo-500 font-bold uppercase">Residents Opted In</div>
                                </div>
                            </div>
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Laundry Load</div>
                                <div className="flex items-center gap-6">
                                    <div className="text-4xl font-black text-emerald-500">{students.filter(s => s.hasLaundry).length}</div>
                                    <div className="text-[10px] text-emerald-600 font-bold uppercase">Active Subscriptions</div>
                                </div>
                            </div>
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gym Members</div>
                                <div className="flex items-center gap-6">
                                    <div className="text-4xl font-black text-rose-500">{students.filter(s => s.hasGym).length}</div>
                                    <div className="text-[10px] text-rose-600 font-bold uppercase">Active Memberships</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Facility Access Ledger</h3>
                                    <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl">
                                        {['Mess', 'Laundry', 'Gym'].map((facility) => (
                                            <button
                                                key={facility}
                                                onClick={() => setVisitorSearch(facility)} // Reusing visitorSearch state for facility filter, technically should create new state but this works for demo if reset properly
                                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${visitorSearch === facility
                                                    ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                    }`}
                                            >
                                                {facility}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Resident</th>
                                            <th className="px-8 py-5">Card Status</th>
                                            <th className="px-8 py-5">Usage</th>
                                            <th className="px-8 py-5 text-right">Validity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                        {students.filter(s => {
                                            if (visitorSearch === 'Mess' || visitorSearch === '') return s.hasMess;
                                            if (visitorSearch === 'Laundry') return s.hasLaundry;
                                            if (visitorSearch === 'Gym') return s.hasGym;
                                            return true;
                                        }).map(student => (
                                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                                                            <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="font-extrabold text-slate-900 dark:text-white">{student.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Room {student.roomNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        {visitorSearch === 'Laundry' ? '12/20 Cycles Used' :
                                                            visitorSearch === 'Gym' ? '4 Days Streak' :
                                                                'Regular'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Expires Dec 2024</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'COMPLAINTS' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Open Tickets', value: 12, color: 'text-amber-500' },
                                { label: 'Resolved Today', value: 5, color: 'text-emerald-500' },
                                { label: 'Avg Time', value: '4h', color: 'text-indigo-500' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Active Support Tickets</h3>
                            </div>
                            <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                {complaints && complaints.map(ticket => (
                                    <div key={ticket.id} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center font-bold">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Room</span>
                                                <span className="text-slate-900 dark:text-white">{ticket.room}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-black text-slate-900 dark:text-white">{ticket.title}</span>
                                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-500 font-bold">{ticket.id}</span>
                                                </div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ticket.student} • {ticket.category}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <select
                                                value={ticket.status}
                                                onChange={(e) => {
                                                    if (onUpdateComplaint) {
                                                        onUpdateComplaint(ticket.id, e.target.value);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:border-indigo-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                            <button
                                                onClick={(e) => {
                                                    const btn = e.currentTarget;
                                                    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Assigned';
                                                    btn.classList.replace('bg-indigo-600', 'bg-emerald-600');
                                                }}
                                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all"
                                            >Assign</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'GATE' && (
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
                        {!showFullGateLogs ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2.5rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-8 text-4xl">
                                    <i className="fas fa-id-card-clip"></i>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Hostel Gate Intelligence</h3>
                                <p className="max-w-md mx-auto text-slate-500 dark:text-slate-400 font-medium mb-12">Monitor real-time resident movement, verify guest entry, and manage curfew timings from this command center.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
                                    <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Check-ins</div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black">18</div>
                                            <div className="text-sm font-bold text-slate-600 dark:text-slate-300">Residents checked in since 6 PM</div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Outward Traffic</div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black">04</div>
                                            <div className="text-sm font-bold text-slate-600 dark:text-slate-300">Pending check-ins (Past Curfew)</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowFullGateLogs(true)}
                                    className="mt-12 bg-slate-900 dark:bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl"
                                >
                                    Open Full Gate Logs
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center pb-8 border-b border-slate-100 dark:border-slate-700">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Movement Audit Trail</h3>
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Biometric Verification Records</p>
                                    </div>
                                    <button
                                        onClick={() => setShowFullGateLogs(false)}
                                        className="bg-slate-100 dark:bg-slate-700 px-6 py-3 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
                                    >Back to Overview</button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="px-8 py-5">Timestamp</th>
                                                <th className="px-8 py-5">Resident</th>
                                                <th className="px-8 py-5">Direction</th>
                                                <th className="px-8 py-5">Location</th>
                                                <th className="px-8 py-5 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                            {[
                                                { time: '08:45 PM', name: 'Aarav Mehta', id: 'S1', type: 'IN', gate: 'Main Entrance', status: 'Authorized' },
                                                { time: '07:20 PM', name: 'Ishita Sharma', id: 'S2', type: 'OUT', gate: 'West Gate', status: 'Authorized' },
                                                { time: '06:15 PM', name: 'Rahul Singh', id: 'S3', type: 'IN', gate: 'Main Entrance', status: 'Authorized' },
                                                { time: '05:50 PM', name: 'Priya Verma', id: 'S4', type: 'OUT', gate: 'Main Entrance', status: 'Authorized' },
                                                { time: '05:30 PM', name: 'Kabir Das', id: 'S5', type: 'IN', gate: 'Service Entry', status: 'Authorized' },
                                            ].map((log, i) => (
                                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group">
                                                    <td className="px-8 py-6 font-mono text-xs font-black text-slate-500">{log.time}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="font-extrabold text-slate-900 dark:text-white">{log.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">ID: {log.id}</div>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs font-black">
                                                        <span className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 w-fit ${log.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            <i className={`fas fa-arrow-${log.type === 'IN' ? 'down' : 'up'}-long text-[8px]`}></i>
                                                            {log.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{log.gate}</td>
                                                    <td className="px-8 py-6 text-right font-black text-[10px] tracking-widest text-emerald-500 uppercase">{log.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Student Detail Modal */}
                {selectedStudent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-300">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all z-10"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>

                            <div className="p-12">
                                <div className="flex flex-col md:flex-row gap-12 mb-12 border-b border-slate-100 dark:border-slate-700 pb-12">
                                    <div className="w-48 h-48 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-6xl text-slate-200 overflow-hidden relative group">
                                        {selectedStudent.profilePhoto ? (
                                            <img src={selectedStudent.profilePhoto} alt={selectedStudent.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <i className="fas fa-user"></i>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">#STU_{selectedStudent.id}</span>
                                            <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">{selectedStudent.status || 'Active'}</span>
                                        </div>
                                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 italic">{selectedStudent.name}</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Allocation</div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200">Block {selectedStudent.hostelId} - Room {selectedStudent.roomNumber}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent.phone}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guardian Contact</div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200">{selectedStudent.parentsName || 'Mr. & Mrs. ' + (selectedStudent.lastName || '')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                            <i className="fas fa-clock-rotate-left text-indigo-600"></i>
                                            Recent Movements
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { type: 'IN', time: '2023-10-20 08:30 PM', status: 'On Time' },
                                                { type: 'OUT', time: '2023-10-20 05:15 PM', status: 'Allowed' },
                                                { type: 'IN', time: '2023-10-19 09:10 PM', status: 'Late (10m)' }
                                            ].map((log, i) => (
                                                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                    <div>
                                                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${log.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                            {log.type}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{log.time}</div>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-slate-500">{log.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                            <i className="fas fa-wallet text-indigo-600"></i>
                                            Financial Status
                                        </h3>
                                        <div className="p-6 rounded-[2rem] bg-slate-900 text-white shadow-xl relative overflow-hidden group">
                                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Outstanding Liability</div>
                                            <div className="text-4xl font-black italic">₹{selectedStudent.pendingFee?.toLocaleString() || '0'}</div>
                                            <div className="mt-8 flex gap-3">
                                                <button className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Send Reminder</button>
                                                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Clear Dues</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'FEES' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <i className="fas fa-hand-holding-dollar text-9xl"></i>
                                </div>
                                <h3 className="font-black text-2xl mb-2 relative z-10">Cash Desk</h3>
                                <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-6 relative z-10">Warden Verification Portal</p>
                                <div className="flex gap-8 relative z-10">
                                    <div>
                                        <span className="block text-4xl font-black">{pendingPayments.students.length + pendingPayments.guests.length}</span>
                                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Pending Desk Approvals</span>
                                    </div>
                                    <div>
                                        <span className="block text-4xl font-black">₹{(pendingPayments.students.reduce((acc, s) => acc + s.amount, 0) + pendingPayments.guests.reduce((acc, g) => acc + g.amount, 0)).toLocaleString()}</span>
                                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Awaiting Deposit</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center justify-between">
                                <div>
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase text-[10px] tracking-[0.2em] mb-4">Quick Refresh</h4>
                                    <button
                                        onClick={() => {
                                            fetchPendingPayments();
                                            if (onRefreshData) onRefreshData();
                                        }}
                                        disabled={paymentsLoading}
                                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        <i className={`fas fa-sync-alt ${paymentsLoading ? 'animate-spin' : ''}`}></i> Sync Ledger
                                    </button>
                                </div>
                                <div className="text-right">
                                    <i className="fas fa-shield-check text-5xl text-emerald-500/20"></i>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[3rem] border border-white/50 dark:border-slate-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-none overflow-hidden">
                            <div className="p-10 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Deposit Notifications</h3>
                            </div>

                            <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                {paymentsLoading && (
                                    <div className="p-20 text-center text-slate-400 font-bold italic">Contacting servers...</div>
                                )}
                                {!paymentsLoading && pendingPayments.students.length === 0 && pendingPayments.guests.length === 0 && (
                                    <div className="p-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                                            <i className="fas fa-check-double text-3xl"></i>
                                        </div>
                                        <h4 className="font-black text-slate-900 dark:text-white text-lg">All Clear!</h4>
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">No pending cash approvals detected at this time.</p>
                                    </div>
                                )}

                                {pendingPayments.students.map(p => (
                                    <div key={p.id} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all flex flex-col md:flex-row justify-between items-center gap-8 group">
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                                <i className="fas fa-user-graduate"></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{p.name}</h4>
                                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">RESIDENT</span>
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                                                    Recorded payment of <span className="text-slate-900 dark:text-white">₹{p.amount}</span> via Cash
                                                </p>
                                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">
                                                    ID: {p.studentId} • {new Date(p.date).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto">
                                            <button
                                                onClick={() => handleApprovePayment(p.id, 'STUDENT')}
                                                className="flex-1 md:flex-none bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                Approve Cash
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {pendingPayments.guests.map(p => (
                                    <div key={p.id} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all flex flex-col md:flex-row justify-between items-center gap-8 group border-l-4 border-amber-500">
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-amber-600 text-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                                <i className="fas fa-user-clock"></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{p.name}</h4>
                                                    <span className="text-[10px] bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">GUEST REQUEST</span>
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                                                    Requested stay with fee <span className="text-slate-900 dark:text-white">₹{p.amount}</span>
                                                </p>
                                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">
                                                    Email: {p.email} • {new Date(p.date).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto">
                                            <button
                                                onClick={() => handleApprovePayment(p.id, 'GUEST')}
                                                className="flex-1 md:flex-none bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                Approve Cash
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
