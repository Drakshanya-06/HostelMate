import React, { useState } from 'react';
import { 
    BarChart3, Users, BookOpen, Warehouse, Dumbbell, 
    IndianRupee, Headphones, Clock, LogOut, Home, 
    Power, CheckCircle, AlertCircle, Info, ChevronRight,
    TrendingUp, Building2, ClipboardList, Megaphone,
    CalendarDays, Shirt, User, Calendar, Utensils,
    CreditCard, Check, X, Plus, Search
} from 'lucide-react';

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
        <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans relative text-textPrimary">
            {/* Custom Toast Container */}
            <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 animate-in slide-in-from-right-full duration-500 glass-light ${
                            toast.type === 'success' ? 'text-success' :
                            toast.type === 'error' ? 'text-error' :
                            'text-primary'
                        }`}
                    >
                        <div className={`p-2 rounded-lg ${
                             toast.type === 'success' ? 'bg-success/20' :
                             toast.type === 'error' ? 'bg-error/20' :
                             'bg-primary/20'
                        }`}>
                            {toast.type === 'success' ? <CheckCircle size={18} /> : toast.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
                        </div>
                        <span className="text-sm font-bold tracking-tight">{toast.message}</span>
                    </div>
                ))}
            </div>
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-surface/50 backdrop-blur-3xl border-r border-white/5 md:min-h-screen sticky top-0 z-40 flex flex-col shadow-2xl shadow-black/50">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/30 animate-float">
                            <Home size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter text-textPrimary font-heading">Hostel<span className="text-primary italic">Mate</span></h2>
                            <p className="text-[10px] font-black text-textSecondary/50 uppercase tracking-[0.3em]">Command Center</p>
                        </div>
                    </div>
                </div>
                <nav className="p-6 flex-1 space-y-2">
                    {[
                        { id: 'OVERVIEW', icon: BarChart3, label: 'Analytics' },
                        { id: 'STUDENTS', icon: Users, label: 'Residents' },
                        { id: 'GUESTS', icon: BookOpen, label: 'Visitor Logs' },
                        { id: 'ROOMS', icon: Warehouse, label: 'Inventory' },
                        { id: 'FACILITIES', icon: Dumbbell, label: 'Amenities' },
                        { id: 'FEES', icon: IndianRupee, label: 'Finance' },
                        { id: 'COMPLAINTS', icon: Headphones, label: 'Support' },
                        { id: 'GATE', icon: Clock, label: 'Gate Access' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab === item.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1'
                                : 'text-textSecondary hover:bg-white/5 hover:text-textPrimary'
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-textSecondary group-hover:text-primary'} />
                            <span className="tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm text-textSecondary hover:bg-error/10 hover:text-error transition-all duration-300"
                    >
                        <LogOut size={20} />
                        <span className="tracking-tight uppercase tracking-widest text-xs">Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 md:p-16 overflow-y-auto bg-background text-textPrimary relative">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                <header className="flex justify-between items-end mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 relative z-10">
                    <div>
                        <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">Operational Overview</p>
                        <h1 className="text-5xl font-black tracking-tighter font-heading italic">
                            {activeTab === 'OVERVIEW' ? 'Command' :
                                activeTab === 'STUDENTS' ? 'Registry' :
                                    activeTab === 'GUESTS' ? 'Visitors' :
                                        activeTab === 'FACILITIES' ? 'Amenity Ops' :
                                            activeTab === 'GATE' ? 'Movement' :
                                                activeTab === 'FEES' ? 'Ledger' :
                                                    activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
                        </h1>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-textSecondary text-sm font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">System Health: Optimal</p>
                    </div>
                </header>

                <div className="space-y-10">
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Residents', value: '800', icon: Users, color: 'text-primary', tab: 'STUDENTS', trend: '+8%' },
                                    { label: 'Room Occupancy', value: `${occupancyRate}%`, icon: Building2, color: 'text-success', tab: 'ROOMS', progress: occupancyRate },
                                    { label: 'Pending Dues', value: `₹${pendingFees.toLocaleString()}`, icon: IndianRupee, color: 'text-error', tab: 'STUDENTS', sub: 'Action required' },
                                    { label: 'New Requests', value: pendingGuestRequests, icon: ClipboardList, color: 'text-warning', tab: 'GUESTS', sub: 'Pending approval' },
                                ].map((stat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveTab(stat.tab)}
                                        className="text-left p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all duration-300 group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-2.5 rounded-xl bg-zinc-800/50 ${stat.color} group-hover:bg-primary/10 transition-colors`}>
                                                <stat.icon size={24} />
                                            </div>
                                            {stat.trend && (
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-lg">
                                                    <TrendingUp size={12} /> {stat.trend}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-textSecondary uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-2xl font-bold text-textPrimary">{stat.value}</p>
                                        </div>
                                        {stat.progress !== undefined ? (
                                            <div className="mt-4">
                                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-success rounded-full" style={{ width: `${stat.progress}%` }}></div>
                                                </div>
                                            </div>
                                        ) : (
                                            stat.sub && (
                                                <p className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${stat.color}`}>
                                                    {stat.sub}
                                                </p>
                                            )
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Campus Pulse Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Announcements */}
                                <div className="bg-surface p-8 rounded-2xl border border-border">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg flex items-center gap-3">
                                            <Megaphone size={20} className="text-primary" /> Announcements
                                        </h3>
                                        <button className="text-xs font-semibold text-textSecondary hover:text-primary uppercase tracking-wider transition-colors">View All</button>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { title: "Hostel Night Registration", date: "Dec 24", urgency: "High" },
                                            { title: "Winter Break Schedule", date: "Dec 20", urgency: "Medium" },
                                            { title: "Maintenance Work", date: "Dec 18", urgency: "Low" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-zinc-800/50 transition-all cursor-pointer group border border-transparent hover:border-border">
                                                <div className="text-center min-w-[3rem]">
                                                    <span className="block text-xs font-bold text-textSecondary uppercase">{item.date.split(' ')[0]}</span>
                                                    <span className="block text-xl font-bold text-textPrimary font-heading">{item.date.split(' ')[1]}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-textPrimary text-sm group-hover:text-primary transition-colors">{item.title}</h4>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                        item.urgency === 'High' ? 'text-error' :
                                                        item.urgency === 'Medium' ? 'text-warning' : 'text-textSecondary'
                                                    }`}>{item.urgency} Priority</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Events */}
                                <div className="bg-surface p-8 rounded-2xl border border-border">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg flex items-center gap-3">
                                            <CalendarDays size={20} className="text-warning" /> Upcoming Events
                                        </h3>
                                        <button className="text-xs font-semibold text-textSecondary hover:text-warning uppercase tracking-wider transition-colors">Calendar</button>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { title: "Freshers Welcome Party", time: "6:00 PM", date: "Dec 25" },
                                            { title: "Exam Prep Workshop", time: "10:00 AM", date: "Dec 28" },
                                            { title: "New Year Celebration", time: "8:00 PM", date: "Jan 01" }
                                        ].map((event, i) => (
                                            <div key={i} className="flex gap-4 items-center p-4 rounded-xl bg-zinc-900/50 border border-border group hover:border-warning/50 transition-all">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-warning font-bold text-xs">
                                                    {event.date.split(' ')[1]}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-textPrimary text-sm">{event.title}</h4>
                                                    <span className="text-xs font-medium text-textSecondary flex items-center gap-2">
                                                        <Clock size={12} /> {event.time}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Shortcuts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                                <div className="p-8 rounded-2xl bg-zinc-900 border border-border relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all">
                                    <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                        <Dumbbell size={120} className="text-primary" />
                                    </div>
                                    <h3 className="font-bold text-2xl mb-1 relative z-10 font-heading">Gym Status</h3>
                                    <p className="text-textSecondary text-sm mb-6 relative z-10">Real-time facility tracking</p>
                                    <div className="flex gap-10 relative z-10">
                                        <div>
                                            <span className="block text-3xl font-bold">42</span>
                                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Active Now</span>
                                        </div>
                                        <div>
                                            <span className="block text-3xl font-bold">Peak</span>
                                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Crowd Level</span>
                                        </div>
                                    </div>
                                    <button className="mt-8 px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold uppercase tracking-widest transition-colors relative z-10">
                                        Manage Gym
                                    </button>
                                </div>

                                <div className="p-8 rounded-2xl bg-zinc-900 border border-border relative overflow-hidden group cursor-pointer hover:border-secondary/50 transition-all">
                                    <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                        <Shirt size={120} className="text-secondary" />
                                    </div>
                                    <h3 className="font-bold text-2xl mb-1 relative z-10 font-heading">Laundry Ops</h3>
                                    <p className="text-textSecondary text-sm mb-6 relative z-10">Service efficiency metrics</p>
                                    <div className="flex gap-10 relative z-10">
                                        <div>
                                            <span className="block text-3xl font-bold">12</span>
                                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Machines</span>
                                        </div>
                                        <div>
                                            <span className="block text-3xl font-bold whitespace-nowrap">On Time</span>
                                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Status</span>
                                        </div>
                                    </div>
                                    <button className="mt-8 px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold uppercase tracking-widest transition-colors relative z-10">
                                        View Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'STUDENTS' && (
                        <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-center gap-6">
                                <h3 className="font-bold text-xl tracking-tight">Resident Database</h3>
                                <div className="relative w-full md:w-80">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                                    <input
                                        type="text"
                                        placeholder="Search name or ID..."
                                        className="w-full pl-12 pr-6 py-2.5 bg-background border border-border rounded-xl outline-none focus:border-primary transition-all text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-background/50 text-[10px] font-bold text-textSecondary uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Profile</th>
                                            <th className="px-6 py-4">Resident</th>
                                            <th className="px-6 py-4">Allocation</th>
                                            <th className="px-6 py-4">Obligations</th>
                                            <th className="px-6 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredStudents.map(student => (
                                            <tr
                                                key={student.id}
                                                onClick={() => setSelectedStudent(student)}
                                                className="hover:bg-zinc-800/30 transition-all cursor-pointer group"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs text-textSecondary bg-background px-2 py-1 rounded-md border border-border">#{student.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-textPrimary">{student.name}</div>
                                                    <div className="text-[10px] text-textSecondary font-medium uppercase mt-0.5">Hostel Resident</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 bg-primary/10 flex items-center justify-center rounded-lg text-primary font-bold text-xs">{student.roomNumber}</span>
                                                        <span className="text-textSecondary text-[11px] font-medium uppercase">Floor {student.floor}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold">₹{((student.pendingFee || 0) + (student.messBill || 0) + (student.gymBill || 0)).toLocaleString()}</div>
                                                    <div className="flex gap-2 text-[9px] font-bold text-textSecondary uppercase">
                                                        <span>H: ₹{student.pendingFee || 0}</span>
                                                        <span>M: ₹{student.messBill || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2.5 py-1 text-[10px] rounded-lg font-bold uppercase tracking-wider border ${student.pendingFee + student.messBill + student.gymBill > 0
                                                        ? 'bg-error/10 text-error border-error/20'
                                                        : 'bg-success/10 text-success border-success/20'
                                                        }`}>
                                                        {student.pendingFee + student.messBill + student.gymBill > 0 ? 'Unpaid' : 'Clear'}
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
                        <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col md:flex-row gap-6 items-end">
                                <div className="flex-1 space-y-3">
                                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest pl-1">Trace Request</label>
                                    <div className="relative">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                                        <input
                                            type="text"
                                            placeholder="Search visitor name or Reference ID..."
                                            value={visitorSearch}
                                            onChange={(e) => setVisitorSearch(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-xl pl-12 pr-6 py-3.5 outline-none focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {guestRequests.filter(r =>
                                    r.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
                                    r.id.toLowerCase().includes(visitorSearch.toLowerCase()) ||
                                    r.status.toLowerCase().includes(visitorSearch.toLowerCase())
                                ).map(req => (
                                    <div key={req.id} className="group bg-surface p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 flex flex-col md:flex-row justify-between items-start gap-8">
                                        <div className="flex items-start gap-6">
                                            <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center text-textSecondary group-hover:text-primary transition-colors">
                                                <User size={32} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-bold text-xl text-textPrimary tracking-tight">{req.name}</h4>
                                                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                                        req.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
                                                        req.status === 'approved' ? 'bg-success/10 text-success border-success/20' : 
                                                        'bg-error/10 text-error border-error/20'
                                                    }`}>{req.status}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-textSecondary uppercase tracking-widest mt-1">
                                                    <span className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> Out: {req.checkOut}</span>
                                                    {req.wantsFood && <span className="text-success flex items-center gap-2"><Utensils size={14} /> Meal Inclusive</span>}
                                                    {req.paymentMethod && (
                                                        <span className="bg-zinc-800/50 px-2.5 py-1 rounded-md border border-border text-primary flex items-center gap-2">
                                                            <CreditCard size={14} /> {req.paymentMethod.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>

                                                {req.costBreakdown && (
                                                    <div className="mt-6 flex flex-wrap gap-3">
                                                        {[
                                                            { label: 'Stay', val: req.costBreakdown.base, icon: Building2, color: 'text-primary' },
                                                            { label: 'Meals', val: req.costBreakdown.meals, icon: Utensils, color: 'text-success' },
                                                            { label: 'Laundry', val: req.costBreakdown.laundry, icon: Shirt, color: 'text-secondary' }
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="px-4 py-2 bg-zinc-800/50 rounded-xl border border-border relative group/btn">
                                                                <span className={`text-[10px] block font-bold uppercase ${item.color}`}>{item.label}</span>
                                                                <span className="text-sm font-bold text-textPrimary">₹{item.val || 0}</span>
                                                            </div>
                                                        ))}
                                                        <div className="px-4 py-2 bg-zinc-900 rounded-xl border border-primary/20">
                                                            <span className="text-[10px] block text-primary font-bold uppercase">Total Payable</span>
                                                            <span className="text-lg font-bold text-white">₹{req.costBreakdown.total || 0}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col gap-3 w-full md:w-auto">
                                            {req.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            onUpdateGuest(req.id, 'approved');
                                                            simulateEmail(req);
                                                        }}
                                                        className="flex-1 md:w-32 py-2.5 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                                    >
                                                        <Check size={16} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateGuest(req.id, 'rejected')}
                                                        className="flex-1 md:w-32 py-2.5 rounded-xl bg-error/10 text-error border border-error/20 hover:bg-error hover:text-white transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                                    >
                                                        <X size={16} /> Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'ROOMS' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-textPrimary tracking-tight">Room Matrix</h3>
                                <button onClick={() => setShowAddRoomModal(!showAddRoomModal)} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center gap-2">
                                    <Plus size={16} /> Allocate Node
                                </button>
                            </div>

                            {showAddRoomModal && (
                                <div className="bg-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 mb-8">
                                    <h4 className="font-normal text-textPrimary mb-4">Add New Room</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <input
                                            placeholder="Room Number"
                                            className="px-4 py-2 rounded-xl border border-sidebar  bg-surface "
                                            value={newRoomData.roomNumber}
                                            onChange={e => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                                        />
                                        <select
                                            className="px-4 py-2 rounded-xl border border-sidebar  bg-surface "
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
                                            className="px-4 py-2 rounded-xl border border-sidebar  bg-surface "
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
                                                className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-normal flex-1"
                                            >Save</button>
                                            <button
                                                onClick={() => setShowAddRoomModal(false)}
                                                className="bg-background text-textSecondary px-4 py-2 rounded-xl font-normal"
                                            >Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-background /50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Room Number</th>
                                            <th className="px-8 py-5">Type</th>
                                            <th className="px-8 py-5">Occupancy</th>
                                            <th className="px-8 py-5">Hostel Block</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 ">
                                        {rooms.map(room => (
                                            <tr key={room.id} className="hover:bg-background :bg-surface/30 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-50 /30 rounded-xl flex items-center justify-center text-primary font-normal text-sm">
                                                            {room.roomNumber}
                                                        </div>
                                                        <span className="font-black text-textPrimary ">Suite {room.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs font-normal text-textSecondary  uppercase tracking-widest">{room.capacity}-Seater</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex -space-x-3">
                                                            {[...Array(room.occupied || 0)].map((_, i) => (
                                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white  bg-background  flex items-center justify-center text-[10px] font-black text-textSecondary">
                                                                    <i className="fas fa-user"></i>
                                                                </div>
                                                            ))}
                                                            {[...Array((room.capacity || 0) - (room.occupied || 0))].map((_, i) => (
                                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white  bg-background  text-slate-300 flex items-center justify-center text-[10px]">
                                                                    <i className="fas fa-plus"></i>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs font-normal text-slate-400">{room.occupied || 0}/{room.capacity}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-textSecondary  font-normal text-sm uppercase tracking-widest">Block {room.hostelId}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="text-slate-400 hover:text-primary transition-colors"><i className="fas fa-ellipsis-v"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                {activeTab === 'FACILITIES' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-surface/60 /60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 /50 shadow-xl shadow-slate-200/20 ">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Mess Impact</div>
                                <div className="flex items-center gap-6">
                                    <div className="text-4xl font-black text-textPrimary ">{students.filter(s => s.hasMess).length}</div>
                                    <div className="text-[10px] text-indigo-500 font-normal uppercase">Residents Opted In</div>
                                </div>
                            </div>
                            <div className="bg-surface/60 /60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 /50 shadow-xl shadow-slate-200/20 ">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Laundry Load</div>
                                <div className="flex items-center gap-6">
                                    <div className="text-4xl font-black text-emerald-500">{students.filter(s => s.hasLaundry).length}</div>
                                    <div className="text-[10px] text-emerald-600 font-normal uppercase">Active Subscriptions</div>
                                </div>
                            </div>
                            <div className="bg-surface/60 /60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 /50 shadow-xl shadow-slate-200/20 ">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gym Members</div>
                                <div className="flex items-center gap-6">
                                    <div className="text-4xl font-black text-rose-500">{students.filter(s => s.hasGym).length}</div>
                                    <div className="text-[10px] text-rose-600 font-normal uppercase">Active Memberships</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface/60 /60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 /50 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 ">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <h3 className="font-black text-xl text-textPrimary  tracking-tight">Facility Access Ledger</h3>
                                    <div className="flex bg-background /50 p-1.5 rounded-xl">
                                        {['Mess', 'Laundry', 'Gym'].map((facility) => (
                                            <button
                                                key={facility}
                                                onClick={() => setVisitorSearch(facility)} // Reusing visitorSearch state for facility filter, technically should create new state but this works for demo if reset properly
                                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${visitorSearch === facility
                                                    ? 'bg-surface  shadow-md text-primary'
                                                    : 'text-slate-400 hover:text-textSecondary :text-slate-300'
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
                                    <thead className="bg-background /50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Resident</th>
                                            <th className="px-8 py-5">Card Status</th>
                                            <th className="px-8 py-5">Usage</th>
                                            <th className="px-8 py-5 text-right">Validity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 ">
                                        {students.filter(s => {
                                            if (visitorSearch === 'Mess' || visitorSearch === '') return s.hasMess;
                                            if (visitorSearch === 'Laundry') return s.hasLaundry;
                                            if (visitorSearch === 'Gym') return s.hasGym;
                                            return true;
                                        }).map(student => (
                                            <tr key={student.id} className="hover:bg-background :bg-surface/30 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-background ">
                                                            <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="font-normal text-textPrimary ">{student.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-normal uppercase mt-1">Room {student.roomNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 /30 text-emerald-600  text-[10px] font-black uppercase tracking-widest border border-emerald-100 ">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs font-normal text-textSecondary ">
                                                        {visitorSearch === 'Laundry' ? '12/20 Cycles Used' :
                                                            visitorSearch === 'Gym' ? '4 Days Streak' :
                                                                'Regular'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-slate-400 font-normal text-xs uppercase tracking-widest">Expires Dec 2024</span>
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
                                <div key={i} className="bg-surface/60 /60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 /50 shadow-xl shadow-slate-200/20 ">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-surface/60 /60 backdrop-blur-xl rounded-[2.5rem] border border-white/50 /50 overflow-hidden shadow-2xl shadow-slate-200/20 ">
                            <div className="p-8 border-b border-slate-100 ">
                                <h3 className="font-black text-xl text-textPrimary  tracking-tight">Active Support Tickets</h3>
                            </div>
                            <div className="divide-y divide-slate-50 ">
                                {complaints && complaints.map(ticket => (
                                    <div key={ticket.id} className="p-8 hover:bg-background :bg-surface/30 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-background  rounded-2xl flex flex-col items-center justify-center font-normal">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Room</span>
                                                <span className="text-textPrimary ">{ticket.room}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-black text-textPrimary ">{ticket.title}</span>
                                                    <span className="text-[10px] bg-background  px-2 py-0.5 rounded text-textSecondary font-normal">{ticket.id}</span>
                                                </div>
                                                <div className="text-xs font-normal text-slate-400 uppercase tracking-widest">{ticket.student} • {ticket.category}</div>
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
                                                className="px-4 py-2 bg-background  border-2 border-sidebar  text-textPrimary  rounded-xl font-normal text-xs uppercase tracking-widest cursor-pointer hover:border-indigo-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                            <button
                                                onClick={(e) => {
                                                    const btn = e.currentTarget;
                                                    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Assigned';
                                                    btn.classList.replace('bg-primary', 'bg-emerald-600');
                                                }}
                                                className="bg-primary text-white px-6 py-3 rounded-xl font-normal text-xs hover:bg-indigo-700 transition-all"
                                            >Assign</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'GATE' && (
                    <div className="bg-surface/60 /60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 /50 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
                        {!showFullGateLogs ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-indigo-50 /30 rounded-[2.5rem] flex items-center justify-center text-primary  mx-auto mb-8 text-4xl">
                                    <i className="fas fa-id-card-clip"></i>
                                </div>
                                <h3 className="text-3xl font-black text-textPrimary  mb-4 tracking-tight">Hostel Gate Intelligence</h3>
                                <p className="max-w-md mx-auto text-textSecondary  font-normal mb-12">Monitor real-time resident movement, verify guest entry, and manage curfew timings from this command center.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
                                    <div className="p-8 bg-background  rounded-[2rem] border border-slate-100 ">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Check-ins</div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black">18</div>
                                            <div className="text-sm font-normal text-textSecondary ">Residents checked in since 6 PM</div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-background  rounded-[2rem] border border-slate-100 ">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Outward Traffic</div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black">04</div>
                                            <div className="text-sm font-normal text-textSecondary ">Pending check-ins (Past Curfew)</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowFullGateLogs(true)}
                                    className="mt-12 bg-background  text-white px-10 py-5 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl"
                                >
                                    Open Full Gate Logs
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center pb-8 border-b border-slate-100 ">
                                    <div>
                                        <h3 className="text-2xl font-black text-textPrimary  tracking-tight">Movement Audit Trail</h3>
                                        <p className="text-slate-400 text-sm font-normal uppercase tracking-widest mt-1">Biometric Verification Records</p>
                                    </div>
                                    <button
                                        onClick={() => setShowFullGateLogs(false)}
                                        className="bg-background  px-6 py-3 rounded-xl text-xs font-black text-textSecondary  hover:bg-background transition-all"
                                    >Back to Overview</button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-background /50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="px-8 py-5">Timestamp</th>
                                                <th className="px-8 py-5">Resident</th>
                                                <th className="px-8 py-5">Direction</th>
                                                <th className="px-8 py-5">Location</th>
                                                <th className="px-8 py-5 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 ">
                                            {[
                                                { time: '08:45 PM', name: 'Aarav Mehta', id: 'S1', type: 'IN', gate: 'Main Entrance', status: 'Authorized' },
                                                { time: '07:20 PM', name: 'Ishita Sharma', id: 'S2', type: 'OUT', gate: 'West Gate', status: 'Authorized' },
                                                { time: '06:15 PM', name: 'Rahul Singh', id: 'S3', type: 'IN', gate: 'Main Entrance', status: 'Authorized' },
                                                { time: '05:50 PM', name: 'Priya Verma', id: 'S4', type: 'OUT', gate: 'Main Entrance', status: 'Authorized' },
                                                { time: '05:30 PM', name: 'Kabir Das', id: 'S5', type: 'IN', gate: 'Service Entry', status: 'Authorized' },
                                            ].map((log, i) => (
                                                <tr key={i} className="hover:bg-background :bg-surface/30 transition-all group">
                                                    <td className="px-8 py-6 font-mono text-xs font-black text-textSecondary">{log.time}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="font-normal text-textPrimary ">{log.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">ID: {log.id}</div>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs font-black">
                                                        <span className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 w-fit ${log.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            <i className={`fas fa-arrow-${log.type === 'IN' ? 'down' : 'up'}-long text-[8px]`}></i>
                                                            {log.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-normal text-textSecondary  uppercase tracking-widest">{log.gate}</td>
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-surface  w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-300">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-background  rounded-2xl text-textSecondary hover:text-primary transition-all z-10"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>

                            <div className="p-12">
                                <div className="flex flex-col md:flex-row gap-12 mb-12 border-b border-slate-100  pb-12">
                                    <div className="w-48 h-48 bg-background  rounded-[2.5rem] flex items-center justify-center text-6xl text-slate-200 overflow-hidden relative group">
                                        {selectedStudent.profilePhoto ? (
                                            <img src={selectedStudent.profilePhoto} alt={selectedStudent.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <i className="fas fa-user"></i>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="bg-indigo-100 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">#STU_{selectedStudent.id}</span>
                                            <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">{selectedStudent.status || 'Active'}</span>
                                        </div>
                                        <h2 className="text-5xl font-black text-textPrimary  tracking-tight mb-4 italic">{selectedStudent.name}</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Allocation</div>
                                                <div className="font-normal text-textSecondary ">Block {selectedStudent.hostelId} - Room {selectedStudent.roomNumber}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</div>
                                                <div className="font-normal text-textSecondary ">{selectedStudent.phone}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guardian Contact</div>
                                                <div className="font-normal text-textSecondary ">{selectedStudent.parentsName || 'Mr. & Mrs. ' + (selectedStudent.lastName || '')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div>
                                        <h3 className="text-xl font-black text-textPrimary  mb-6 flex items-center gap-3">
                                            <i className="fas fa-clock-rotate-left text-primary"></i>
                                            Recent Movements
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { type: 'IN', time: '2023-10-20 08:30 PM', status: 'On Time' },
                                                { type: 'OUT', time: '2023-10-20 05:15 PM', status: 'Allowed' },
                                                { type: 'IN', time: '2023-10-19 09:10 PM', status: 'Late (10m)' }
                                            ].map((log, i) => (
                                                <div key={i} className="p-4 rounded-2xl bg-background /50 border border-slate-100  flex justify-between items-center">
                                                    <div>
                                                        <div className="text-xs font-black text-textPrimary  flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${log.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                            {log.type}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-normal uppercase mt-1">{log.time}</div>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-surface  rounded-lg text-textSecondary">{log.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-textPrimary  mb-6 flex items-center gap-3">
                                            <i className="fas fa-wallet text-primary"></i>
                                            Financial Status
                                        </h3>
                                        <div className="p-6 rounded-[2rem] bg-background text-white shadow-xl relative overflow-hidden group">
                                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Outstanding Liability</div>
                                            <div className="text-4xl font-black italic">₹{selectedStudent.pendingFee?.toLocaleString() || '0'}</div>
                                            <div className="mt-8 flex gap-3">
                                                <button className="flex-1 bg-surface/10 hover:bg-surface/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Send Reminder</button>
                                                <button className="flex-1 bg-primary hover:bg-indigo-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Clear Dues</button>
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
                            <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <i className="fas fa-hand-holding-dollar text-9xl"></i>
                                </div>
                                <h3 className="font-black text-2xl mb-2 relative z-10">Cash Desk</h3>
                                <p className="text-indigo-100 text-sm font-normal uppercase tracking-widest mb-6 relative z-10">Warden Verification Portal</p>
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

                            <div className="bg-surface/60 /60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 /50 shadow-xl shadow-slate-200/20  flex items-center justify-between">
                                <div>
                                    <h4 className="font-black text-slate-800  uppercase text-[10px] tracking-[0.2em] mb-4">Quick Refresh</h4>
                                    <button
                                        onClick={() => {
                                            fetchPendingPayments();
                                            if (onRefreshData) onRefreshData();
                                        }}
                                        disabled={paymentsLoading}
                                        className="bg-background text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        <i className={`fas fa-sync-alt ${paymentsLoading ? 'animate-spin' : ''}`}></i> Sync Ledger
                                    </button>
                                </div>
                                <div className="text-right">
                                    <i className="fas fa-shield-check text-5xl text-emerald-500/20"></i>
                                </div>
                            </div>
                        </div>

                    <div className="bg-surface/60 /60 backdrop-blur-xl rounded-[3rem] border border-white/50 /50 shadow-2xl shadow-slate-200/20  overflow-hidden">
                        <div className="p-10 border-b border-slate-100 ">
                                <h3 className="font-black text-xl text-textPrimary  tracking-tight">Deposit Notifications</h3>
                            </div>

                            <div className="divide-y divide-slate-50 ">
                                {paymentsLoading && (
                                    <div className="p-20 text-center text-slate-400 font-normal italic">Contacting servers...</div>
                                )}
                                {!paymentsLoading && pendingPayments.students.length === 0 && pendingPayments.guests.length === 0 && (
                                    <div className="p-20 text-center">
                                        <div className="w-20 h-20 bg-background  rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                                            <i className="fas fa-check-double text-3xl"></i>
                                        </div>
                                        <h4 className="font-black text-textPrimary  text-lg">All Clear!</h4>
                                        <p className="text-slate-400 text-sm font-normal uppercase tracking-widest mt-2">No pending cash approvals detected at this time.</p>
                                    </div>
                                )}

                                {pendingPayments.students.map(p => (
                                    <div key={p.id} className="p-8 hover:bg-background :bg-surface/30 transition-all flex flex-col md:flex-row justify-between items-center gap-8 group">
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 bg-surface  rounded-2xl flex items-center justify-center text-primary text-2xl shadow-sm border border-slate-100  group-hover:scale-110 transition-transform">
                                                <i className="fas fa-user-graduate"></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-black text-xl text-textPrimary  tracking-tight">{p.name}</h4>
                                                    <span className="text-[10px] bg-indigo-50 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest">RESIDENT</span>
                                                </div>
                                                <p className="text-textSecondary  text-sm font-normal">
                                                    Recorded payment of <span className="text-textPrimary ">₹{p.amount}</span> via Cash
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
                                    <div key={p.id} className="p-8 hover:bg-background :bg-surface/30 transition-all flex flex-col md:flex-row justify-between items-center gap-8 group border-l-4 border-amber-500">
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 bg-surface  rounded-2xl flex items-center justify-center text-amber-600 text-2xl shadow-sm border border-slate-100  group-hover:scale-110 transition-transform">
                                                <i className="fas fa-user-clock"></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-black text-xl text-textPrimary  tracking-tight">{p.name}</h4>
                                                    <span className="text-[10px] bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">GUEST REQUEST</span>
                                                </div>
                                                <p className="text-textSecondary  text-sm font-normal">
                                                    Requested stay with fee <span className="text-textPrimary ">₹{p.amount}</span>
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
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
