import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import FeeReceipt from './FeeReceipt';
import { jsPDF } from 'jspdf';
import { GUEST_PRICING, MOCK_STUDENTS, MOCK_ROOMS, MOCK_COMPLAINTS, MOCK_LEAVES, MOCK_ATTENDANCE } from '../constants';

const StudentDashboard = ({ student, announcements, onLogout, complaints: allComplaints, onAddComplaint, onUpdateProfile, onRefreshProfile }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    // Filter complaints for this student
    const complaints = allComplaints ? allComplaints.filter(c => c.student === `${student?.firstName} ${student?.lastName}` || c.student === student?.name) : [];

    const [leaveRequests, setLeaveRequests] = useState(MOCK_LEAVES);
    const [attendanceRecord] = useState(MOCK_ATTENDANCE);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: student?.firstName || '',
        lastName: student?.lastName || '',
        phone: '7009879433',
        email: 'drakshanyachess@gmail.com',
        emergency: '9381415639',
        profilePhoto: student?.profilePhoto || ''
    });

    const handleEditPhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                addToast('File size must be less than 5MB', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFormData({ ...editFormData, profilePhoto: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        if (onUpdateProfile && student?.studentId) {
            onUpdateProfile(student.studentId, editFormData);
            addToast('Profile updated successfully!', 'success');
        } else {
            // Fallback for local update if prop missing (though it shouldn't be)
            Object.assign(student, editFormData);
            addToast('Profile updated locally (refresh might lose changes)', 'warning');
        }
        setShowEditModal(false);
    };

    // Custom Toast State
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Form states
    const [complaintForm, setComplaintForm] = useState({ category: 'Maintenance', description: '', priority: 'Low' });
    const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [paymentStep, setPaymentStep] = useState('SELECT'); // SELECT, PROCESSING, SUCCESS
    const [paymentAmount, setPaymentAmount] = useState((student?.pendingFee || 0) + (student?.messBill || 0) + (student?.gymBill || 0));

    useEffect(() => {
        if (student) {
            setPaymentAmount((student.pendingFee || 0) + (student.messBill || 0) + (student.gymBill || 0));
        }
    }, [student?.pendingFee, student?.messBill, student?.gymBill]);

    useEffect(() => {
        addToast("Welcome back! You have 1 pending fee reminder.", "info");
    }, []);

    const handleComplaintSubmit = async (e) => {
        e.preventDefault();
        const newComplaint = {
            id: `C${Date.now()}`,
            ...complaintForm,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            student: `${student.firstName} ${student.lastName}`,
            room: student.roomNumber
        };
        if (onAddComplaint) {
            onAddComplaint(newComplaint);
        } else {
            console.error("onAddComplaint function not provided");
        }
        setComplaintForm({ category: 'Maintenance', description: '', priority: 'Low' });
        addToast("Complaint filed successfully!", "success");
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        const newLeave = {
            id: `L${Date.now()}`,
            ...leaveForm,
            status: 'pending',
            appliedDate: new Date().toISOString().split('T')[0]
        };
        setLeaveRequests([newLeave, ...leaveRequests]);
        setLeaveForm({ startDate: '', endDate: '', reason: '' });
        addToast("Leave request submitted!", "success");
    };

    const handleDownloadReceipt = (fee) => {
        addToast("Generating your receipt...", "info");
        try {
            const doc = new jsPDF();
            doc.text("HostelMate - Fee Receipt", 20, 20);
            doc.text(`Student: ${student.firstName} ${student.lastName}`, 20, 30);
            doc.text(`Amount: INR ${fee.amount}`, 20, 50);
            doc.text(`Status: ${fee.status}`, 20, 60);
            doc.save(`receipt_${Date.now()}.pdf`);
            addToast("Receipt downloaded successfully!", "success");
        } catch (e) {
            addToast("Failed to generate receipt.", "error");
        }
    };

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

            {/* Sidebar Branding & Navigation */}
            {/* Sidebar Branding & Navigation */}
            <aside className="w-full md:w-80 bg-slate-900 border-r border-slate-800 text-white md:min-h-screen sticky top-0 z-40 shadow-2xl flex flex-col">
                <div className="p-8 border-b border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2 rounded-xl">
                            <i className="fas fa-home text-xl"></i>
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter italic">Hostel<span className="text-indigo-500">Mate</span></h2>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resident Experience Portal</p>
                </div>

                <nav className="p-6 flex-1 space-y-4">
                    {[
                        { id: 'DASHBOARD', icon: 'fa-table-cells-large', label: 'Dashboard' },
                        { id: 'ANNOUNCEMENTS', icon: 'fa-bullhorn', label: 'Broadcasts' },
                        { id: 'DIGITAL_IDS', icon: 'fa-id-badge', label: 'Digital IDs' },
                        { id: 'FEES', icon: 'fa-file-invoice-dollar', label: 'Finance & Bills' },
                        { id: 'COMPLAINTS', icon: 'fa-circle-exclamation', label: 'Support center' },
                        { id: 'LEAVE', icon: 'fa-door-open', label: 'Leave' },
                        { id: 'ATTENDANCE', icon: 'fa-calendar-check', label: 'Attendance' },
                        { id: 'EXAMS', icon: 'fa-clipboard-list', label: 'Exam Schedule' },
                        { id: 'PROFILE', icon: 'fa-user-circle', label: 'My Profile' },
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
                        <i className="fas fa-power-off text-lg w-6 text-center"></i>
                        <span className="text-sm uppercase tracking-widest">Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-rose-50 text-slate-900">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {activeTab === 'DASHBOARD' ? 'Resident Overview' :
                                    activeTab === 'ANNOUNCEMENTS' ? 'Hostel Broadcasts' :
                                        activeTab === 'DIGITAL_IDS' ? 'Resident Digital IDs' :
                                            activeTab === 'COMPLAINTS' ? 'Support Center' :
                                                activeTab === 'LEAVE' ? 'Leave Management' :
                                                    activeTab === 'FEES' ? 'Finance & Bills' :
                                                        activeTab === 'PROFILE' ? 'Personal Profile' :
                                                            'Attendance Records'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Welcome back, <span className="text-indigo-600 font-bold">{student?.firstName}</span></p>
                        </div>
                        <div className="relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white/50 dark:border-slate-700 flex items-center gap-4 group hover:border-indigo-500/50 transition-all duration-500">
                            <div className="group-hover:scale-110 transition-transform">
                                <i className="fas fa-calendar-alt text-3xl text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 block mb-0.5 uppercase tracking-widest">Active Shift</span>
                                <span className="text-sm font-black text-slate-800 dark:text-slate-200 truncate uppercase tracking-widest italic">
                                    {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {activeTab === 'DASHBOARD' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 col-span-1 group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
                            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3 relative z-10">
                                <div className="group-hover:scale-110 transition-transform">
                                    <i className="fas fa-id-card text-3xl text-indigo-600"></i>
                                </div>
                                Snapshot Profiles
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 group/item hover:border-indigo-500 transition-all">
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Assigned Registry</div>
                                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-2 italic">
                                        <i className="fas fa-building text-slate-300 group-hover/item:text-indigo-500 transition-colors"></i> Block {student?.hostelId}
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 group/item hover:border-indigo-500 transition-all">
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Room Intelligence</div>
                                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-2 italic">
                                        <i className="fas fa-door-closed text-slate-300 group-hover/item:text-emerald-500 transition-colors"></i> Room {student?.roomNumber}
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 group/item hover:border-indigo-500 transition-all">
                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Identity Ref</div>
                                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-2 italic">
                                        <i className="fas fa-fingerprint text-slate-300 group-hover/item:text-amber-500 transition-colors"></i> {student?.studentId}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('PROFILE')}
                                    className="w-full mt-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                >
                                    Access Full Profile <i className="fas fa-arrow-right ml-2 text-[8px]"></i>
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <button
                                onClick={() => setActiveTab('FEES')}
                                className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] transition-all text-left group"
                            >
                                <div className="relative z-10">
                                    <div className="mb-6 group-hover:scale-110 transition-transform">
                                        <i className="fas fa-wallet text-5xl text-white"></i>
                                    </div>
                                    <div className="text-white/70 text-sm font-bold mb-1 uppercase tracking-widest">
                                        {student?.feeStatus === 'pending' ? 'Verification In Progress' : 'Pending Dues'}
                                    </div>
                                    <div className="text-5xl font-black text-white italic tracking-tighter">
                                        {student?.feeStatus === 'pending' ? 'PENDING' : `₹${(student?.pendingFee || 0) + (student?.messBill || 0) + (student?.gymBill || 0)}`}
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-indigo-100 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                                        Auto-calculate Next Bill <i className="fas fa-chevron-right text-[8px]"></i>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            </button>

                            <button
                                onClick={() => setActiveTab('ATTENDANCE')}
                                className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.03] transition-all text-left group"
                            >
                                <div className="relative z-10">
                                    <div className="mb-6 group-hover:scale-110 transition-transform">
                                        <i className="fas fa-calendar-check text-5xl text-white"></i>
                                    </div>
                                    <div className="text-white/70 text-sm font-bold mb-1 uppercase tracking-widest">Current Presence</div>
                                    <div className="text-5xl font-black text-white italic tracking-tighter">94%</div>
                                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-emerald-100 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                                        View detailed log <i className="fas fa-chevron-right text-[8px]"></i>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 blur-2xl"></div>
                            </button>

                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 md:col-span-2">
                                <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest">Quick Actions</h4>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => setActiveTab('LEAVE')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">Apply for Leave</button>
                                    <button onClick={() => setActiveTab('COMPLAINTS')} className="bg-white border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Report Issue</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === 'FEES' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-8">
                                <div className="relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/50 dark:border-slate-700/50">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight relative z-10 italic">Finance Intelligence</h3>
                                        <button
                                            onClick={onRefreshProfile}
                                            className="relative z-10 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all hover:rotate-180"
                                            title="Sync Ledger"
                                        >
                                            <i className="fas fa-sync-alt text-xs"></i>
                                        </button>
                                    </div>
                                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-indigo-900 text-white mb-8 shadow-xl shadow-indigo-500/30 relative z-10 group overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Liability Portfolio</div>
                                            <div className="text-4xl font-black italic tracking-tighter">
                                                {student?.feeStatus === 'pending' ? 'PENDING' : `₹${(student?.pendingFee || 0) + (student?.messBill || 0) + (student?.gymBill || 0)}`}
                                            </div>

                                            <div className="mt-4 space-y-2 opacity-80">
                                                <div className="flex justify-between text-[9px] font-black uppercase">
                                                    <span>Hostel Fee (21.6k)</span>
                                                    <span>₹{student?.pendingFee || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-[9px] font-black uppercase">
                                                    <span>Mess Bill</span>
                                                    <span>₹{student?.messBill || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-[9px] font-black uppercase">
                                                    <span>Gym Bill</span>
                                                    <span>₹{student?.gymBill || 0}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (student?.feeStatus === 'pending') {
                                                        addToast('Payment is already pending approval', 'info');
                                                        return;
                                                    }
                                                    if (((student?.pendingFee || 0) + (student?.messBill || 0) + (student?.gymBill || 0) === 0)) {
                                                        addToast('No pending dues', 'success');
                                                        return;
                                                    }
                                                    setShowPaymentModal(true);
                                                    setPaymentStep('SELECT');
                                                    setPaymentMethod(null);
                                                }}
                                                className="mt-8 w-full py-4 rounded-xl bg-white text-indigo-900 font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <i className="fas fa-bolt"></i> {student?.feeStatus === 'pending' ? 'Awaiting Approval' : 'Pay Now'}
                                            </button>
                                        </div>
                                        <i className="fas fa-money-bill-transfer absolute -bottom-4 -right-4 text-white/5 text-8xl -rotate-12 group-hover:rotate-0 transition-transform duration-700"></i>
                                    </div>
                                    <FeeReceipt student={student} />
                                </div>
                            </div>

                            {/* Payment Modal */}
                            {showPaymentModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                                        <button
                                            onClick={() => setShowPaymentModal(false)}
                                            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-rose-500 transition-colors z-10"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>

                                        <div className="p-8">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                                {paymentStep === 'SUCCESS' ? 'Payment Successful' : 'Clear Dues'}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">
                                                {paymentStep === 'SUCCESS' ? 'Transaction Completed' : 'Select Payment Mode'}
                                            </p>

                                            {paymentStep === 'SELECT' && (
                                                <div className="space-y-6">
                                                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl">
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Amount to Pay (INR)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                                            <input
                                                                type="number"
                                                                value={paymentAmount}
                                                                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                                                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-10 pr-6 text-2xl font-black text-slate-900 dark:text-white focus:border-indigo-500 transition-all outline-none"
                                                                placeholder="Enter Amount"
                                                                max={(student?.pendingFee || 0) + (student?.messBill || 0) + (student?.gymBill || 0)}
                                                                min={1}
                                                            />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-3 italic">Maximum: ₹{(student?.pendingFee || 0) + (student?.messBill || 0) + (student?.gymBill || 0)}</p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <button
                                                            onClick={async () => {
                                                                if (paymentAmount <= 0) {
                                                                    addToast('Please enter a valid amount', 'error');
                                                                    return;
                                                                }
                                                                setPaymentMethod('CASH');
                                                                setPaymentStep('PROCESSING');

                                                                try {
                                                                    const res = await fetch('/api/student/pay-fee', {
                                                                        method: 'POST',
                                                                        headers: {
                                                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                                            'Content-Type': 'application/json'
                                                                        },
                                                                        body: JSON.stringify({ amount: paymentAmount })
                                                                    });
                                                                    if (res.ok) {
                                                                        setPaymentStep('SUCCESS');
                                                                        if (onRefreshProfile) onRefreshProfile();
                                                                    } else {
                                                                        const err = await res.json();
                                                                        addToast(err.message || 'Payment failed', 'error');
                                                                        setPaymentStep('SELECT');
                                                                    }
                                                                } catch (e) {
                                                                    addToast('Payment failed to record', 'error');
                                                                    setPaymentStep('SELECT');
                                                                }
                                                            }}
                                                            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                                        >
                                                            <i className="fas fa-check-circle"></i> Confirm Cash Payment
                                                        </button>
                                                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Visit the warden office after confirmation</p>
                                                    </div>
                                                </div>
                                            )}

                                            {paymentStep === 'PROCESSING' && (
                                                <div className="py-12 text-center">
                                                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                                                    <h4 className="font-black text-slate-900 dark:text-white text-lg">Processing Transaction</h4>
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Please do not close this window</p>
                                                </div>
                                            )}

                                            {paymentStep === 'SUCCESS' && (
                                                <div className="py-8 text-center">
                                                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-in zoom-in duration-300">
                                                        <i className="fas fa-check"></i>
                                                    </div>
                                                    <h4 className="font-black text-slate-900 dark:text-white text-xl mb-2">Payment Recorded!</h4>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Please visit the warden office to handover cash. Once approved, you'll receive your receipt via email.</p>
                                                    <button
                                                        onClick={() => {
                                                            setShowPaymentModal(false);
                                                            addToast('Payment Successful!', 'success');
                                                        }}
                                                        className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/50 dark:border-slate-700/50">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight italic flex items-center gap-3">
                                    <i className="fas fa-clock-rotate-left text-indigo-500"></i> Payment History
                                </h3>
                                <div className="space-y-4">
                                    {!student?.paymentHistory || student.paymentHistory.length === 0 ? (
                                        <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem]">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                                                <i className="fas fa-receipt text-2xl"></i>
                                            </div>
                                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No previous transactions found</p>
                                        </div>
                                    ) : (
                                        student.paymentHistory.slice().reverse().map((payment, index) => (
                                            <div key={index} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-indigo-500 transition-all hover:bg-white dark:hover:bg-slate-800">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 text-xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                                        <i className="fas fa-check-circle"></i>
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                                            Fee Paid <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-black uppercase font-bold italic">Approved</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                                            Ref: {payment.receiptId} • {new Date(payment.date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-slate-900 dark:text-white italic">₹{payment.amount}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{payment.method} Payment</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === 'COMPLAINTS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="lg:col-span-1">
                            <form onSubmit={handleComplaintSubmit} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 sticky top-32">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Post Complaint</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium appearance-none"
                                            value={complaintForm.category}
                                            onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                                        >
                                            <option>Maintenance</option>
                                            <option>Electrical</option>
                                            <option>Safety</option>
                                            <option>Housekeeping</option>
                                            <option>Furniture</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Narrative</label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium min-h-[150px]"
                                            placeholder="Explain the issue..."
                                            value={complaintForm.description}
                                            onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                                        />
                                    </div>
                                    <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all">
                                        Log Ticket
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white px-4 tracking-tight">Active Support Tickets</h3>
                            {complaints.map(complaint => (
                                <div key={complaint.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/50 dark:border-slate-700/50 group hover:border-indigo-500 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg uppercase tracking-widest">{complaint.category}</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{complaint.id}</span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-4">{complaint.description}</p>
                                        <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span><i className="fas fa-calendar-alt text-indigo-500 mr-2"></i>{complaint.date}</span>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${['resolved', 'Resolved'].includes(complaint.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {complaint.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {activeTab === 'LEAVE' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="lg:col-span-1">
                            <form onSubmit={handleLeaveSubmit} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Request Leave</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">From</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium text-xs"
                                                value={leaveForm.startDate}
                                                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Return</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium text-xs"
                                                value={leaveForm.endDate}
                                                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason</label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium min-h-[120px]"
                                            placeholder="e.g. Family Emergency..."
                                            value={leaveForm.reason}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                        />
                                    </div>
                                    <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all">
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white px-4 tracking-tight">Request History</h3>
                            {leaveRequests.map(leave => (
                                <div key={leave.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50 dark:border-slate-700/50 group hover:border-indigo-500 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="group-hover:scale-110 transition-transform">
                                            <i className="fas fa-plane-departure text-slate-300 text-5xl group-hover:text-indigo-500 transition-colors"></i>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{leave.reason}</h4>
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">#{leave.id}</span>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
                                                <span>Applied: {leave.appliedDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {leave.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {activeTab === 'ANNOUNCEMENTS' && (
                    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {announcements.map(ann => (
                            <div key={ann.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 relative overflow-hidden group hover:border-indigo-500 transition-all">
                                <div className={`absolute top-0 right-0 w-2 h-full ${ann.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${ann.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{ann.priority} Priority</span>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-3">{ann.title}</h3>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{ann.date}</div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-lg">{ann.content}</p>
                            </div>
                        ))}
                    </div>
                )}


                {activeTab === 'ATTENDANCE' && (
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 text-center animate-in fade-in zoom-in duration-700">
                        <div className="group-hover:scale-110 transition-transform mb-8">
                            <i className="fas fa-clock-rotate-left text-7xl text-indigo-600 dark:text-indigo-400 mx-auto"></i>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Movement Logs</h3>
                        <p className="max-w-md mx-auto text-slate-500 dark:text-slate-400 font-medium mb-12 italic">Your real-time biometric entry/exit audit trail.</p>

                        <div className="space-y-4 max-w-2xl mx-auto text-left">
                            {attendanceRecord.map(rec => (
                                <div key={rec.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${rec.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                        <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest text-xs">{rec.type}</span>
                                    </div>
                                    <div className="text-sm font-black text-slate-600 dark:text-slate-400">{rec.timestamp}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {activeTab === 'EXAMS' && (
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 animate-in fade-in zoom-in duration-700">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                                    <i className="fas fa-graduation-cap text-indigo-600"></i> My Exam Schedule
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Upcoming assessments and examinations</p>
                            </div>
                            <button
                                onClick={handleDownloadHallTicket}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                            >
                                <i className="fas fa-download mr-2"></i>Download Hall Ticket
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { subject: "Engineering Mathematics IV", code: "MAT101", date: "Jan 10, 2025", time: "09:00 AM - 12:00 PM", venue: "LH-101" },
                                { subject: "Data Structures & Algorithms", code: "CS201", date: "Jan 12, 2025", time: "02:00 PM - 05:00 PM", venue: "LH-204" },
                                { subject: "Digital Logic Design", code: "EC304", date: "Jan 15, 2025", time: "09:00 AM - 12:00 PM", venue: "LH-105" },
                                { subject: "Database Management Systems", code: "CS302", date: "Jan 18, 2025", time: "02:00 PM - 05:00 PM", venue: "LH-302" },
                                { subject: "Computer Networks", code: "CS305", date: "Jan 21, 2025", time: "09:00 AM - 12:00 PM", venue: "LH-201" }
                            ].map((exam, i) => (
                                <div key={i} className="group bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:shadow-xl transition-all relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500"></div>

                                    <span className="inline-block px-3 py-1 rounded-lg bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                                        {exam.code}
                                    </span>

                                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{exam.subject}</h4>

                                    <div className="space-y-3 mt-6 relative z-10">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm font-bold">
                                            <i className="fas fa-calendar-day w-5 text-indigo-500"></i>
                                            {exam.date}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm font-bold">
                                            <i className="fas fa-clock w-5 text-indigo-500"></i>
                                            {exam.time}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm font-bold">
                                            <i className="fas fa-map-marker-alt w-5 text-indigo-500"></i>
                                            Venue: {exam.venue}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {activeTab === 'DIGITAL_IDS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {/* Mess ID Card */}
                        {student?.hasMess && (
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[3rem] border border-white/50 dark:border-slate-700/50 overflow-hidden shadow-2xl">
                                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="group-hover:scale-110 transition-transform">
                                                <i className="fas fa-utensils text-4xl text-white"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black italic tracking-tighter">Mess<span className="text-indigo-300">Card</span></h3>
                                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Digital Hospitality Access</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-indigo-300 uppercase block leading-none mb-1">Validity</span>
                                            <span className="text-xs font-bold leading-none">AY 2024-25</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex items-center gap-8">
                                        <div className="w-32 h-32 rounded-2xl border-4 border-slate-100 dark:border-slate-700 overflow-hidden shadow-xl ring-4 ring-indigo-500/10">
                                            {student?.profilePhoto ? (
                                                <img src={student.profilePhoto} alt="Security" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 text-4xl">
                                                    <i className="fas fa-user-shield"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Card Holder</span>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none italic">{student?.firstName} {student?.lastName}</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">ID Ref</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{student?.studentId}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                                                    <span className="text-sm font-black text-emerald-500 italic">VERIFIED</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-8 pb-8 flex justify-between items-end">
                                        <div className="flex-1 mr-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                            <div className="flex gap-1">
                                                {[...Array(20)].map((_, i) => (
                                                    <div key={i} className={`w-[2px] h-8 bg-slate-900 dark:bg-slate-100 ${i % 3 === 0 ? 'h-10 opacity-100' : 'opacity-40'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-20 h-20 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
                                            <div className="w-full h-full border-2 border-slate-900 flex items-center justify-center relative">
                                                <div className="w-full h-full border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MESS_${student?.studentId}`}
                                                        alt="QR Code"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="absolute top-0 right-0 w-2 h-2 bg-slate-900"></div>
                                                <div className="absolute top-0 left-0 w-2 h-2 bg-slate-900"></div>
                                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-slate-900"></div>
                                                <div className="absolute bottom-0 left-0 w-2 h-2 bg-slate-900"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Laundry ID Card */}
                        {student?.hasLaundry && (
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[3rem] border border-white/50 dark:border-slate-700/50 overflow-hidden shadow-2xl">
                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="group-hover:scale-110 transition-transform">
                                                <i className="fas fa-shirt text-4xl text-white"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black italic tracking-tighter">Laundry<span className="text-emerald-300">Vault</span></h3>
                                                <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Asset Management Protocol</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-emerald-300 uppercase block leading-none mb-1">Limit</span>
                                            <span className="text-xs font-bold leading-none">20 Cycles/Sem</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex items-center gap-8">
                                        <div className="w-32 h-32 rounded-2xl border-4 border-slate-100 dark:border-slate-700 overflow-hidden shadow-xl ring-4 ring-emerald-500/10">
                                            {student?.profilePhoto ? (
                                                <img src={student.profilePhoto} alt="Security" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 text-4xl">
                                                    <i className="fas fa-user-shield"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assigned Resident</span>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none italic">{student?.firstName} {student?.lastName}</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Room</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{student?.roomNumber}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Access</span>
                                                    <span className="text-sm font-black text-emerald-500 italic">SECURE</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-8 pb-8 flex justify-between items-end">
                                        <div className="flex-1 mr-8 bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-center">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Usage Audit</span>
                                                <span className="text-[10px] font-black text-white italic">12 / 20</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="w-[60%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                            </div>
                                        </div>
                                        <div className="w-20 h-20 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
                                            <div className="w-full h-full border-2 border-slate-900 flex items-center justify-center relative p-0.5 overflow-hidden">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LAUNDRY_${student?.studentId}`}
                                                    alt="Barcode"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gym ID Card */}
                        {student?.hasGym && (
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[3rem] border border-white/50 dark:border-slate-700/50 overflow-hidden shadow-2xl">
                                    <div className="bg-gradient-to-r from-rose-600 to-pink-700 p-8 text-white flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="group-hover:scale-110 transition-transform">
                                                <i className="fas fa-dumbbell text-4xl text-white"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black italic tracking-tighter">Fit<span className="text-rose-300">Zone</span></h3>
                                                <p className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">Wellness Access Pass</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-rose-300 uppercase block leading-none mb-1">Membership</span>
                                            <span className="text-xs font-bold leading-none">Standard</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex items-center gap-8">
                                        <div className="w-32 h-32 rounded-2xl border-4 border-slate-100 dark:border-slate-700 overflow-hidden shadow-xl ring-4 ring-rose-500/10">
                                            {student?.profilePhoto ? (
                                                <img src={student.profilePhoto} alt="Security" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 text-4xl">
                                                    <i className="fas fa-user-shield"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Member Name</span>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none italic">{student?.firstName} {student?.lastName}</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Expires</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">DEC 2024</span>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                                                    <span className="text-sm font-black text-rose-500 italic">ACTIVE</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-8 pb-8 flex justify-between items-end">
                                        <div className="flex-1 mr-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                            <div className="flex gap-2">
                                                <i className="fas fa-heart-pulse text-rose-500 animate-pulse"></i>
                                                <span className="text-xs font-black text-slate-900 dark:text-white">Daily Streak: 4 Days</span>
                                            </div>
                                        </div>
                                        <div className="w-20 h-20 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
                                            <div className="w-full h-full border-2 border-slate-900 flex items-center justify-center relative">
                                                <div className="w-full h-full border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GYM_${student?.studentId}`}
                                                        alt="QR Code"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!student?.hasMess && !student?.hasLaundry && !student?.hasGym && (
                            <div className="col-span-full py-12 text-center text-slate-400">
                                <i className="fas fa-id-card-clip text-6xl mb-4 opacity-50"></i>
                                <h3 className="text-xl font-bold">No Active Digital IDs</h3>
                                <p className="text-sm opacity-70">Contact administration to activate facilities.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'PROFILE' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/50 dark:border-slate-700/50">
                            <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 relative">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]"></div>
                            </div>
                            <div className="px-12 pb-12 -mt-24 relative z-10">
                                <div className="flex flex-col md:flex-row items-end gap-10 mb-12">
                                    <div className="relative group">
                                        <div className="w-48 h-48 rounded-[2.5rem] border-[6px] border-white dark:border-slate-800 overflow-hidden shadow-2xl ring-4 ring-indigo-500/10">
                                            {student?.profilePhoto ? (
                                                <img src={student.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 text-6xl">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                            )}
                                        </div>
                                        <button className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-all border-4 border-white dark:border-slate-800 opacity-0 group-hover:opacity-100">
                                            <i className="fas fa-camera"></i>
                                        </button>
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">{student?.firstName} {student?.lastName}</h2>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                                                ID: {student?.studentId}
                                            </span>
                                            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50 italic">
                                                Resident <i className="fas fa-circle-check ml-1"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pb-4">
                                        <button
                                            onClick={() => {
                                                setEditFormData({
                                                    firstName: student?.firstName || '',
                                                    lastName: student?.lastName || '',
                                                    phone: '7009879433',
                                                    email: 'drakshanyachess@gmail.com',
                                                    emergency: '9381415639',
                                                    profilePhoto: student?.profilePhoto || ''
                                                });
                                                setShowEditModal(true);
                                            }}
                                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all"
                                        >
                                            <i className="fas fa-edit mr-2"></i>Edit Records
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <i className="fas fa-building text-indigo-500"></i> Accommodation Registry
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center group/item hover:bg-white dark:hover:bg-slate-800 p-2 rounded-xl transition-all">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hostel Block</span>
                                                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Block {student?.hostelId}</span>
                                                </div>
                                                <div className="flex justify-between items-center group/item hover:bg-white dark:hover:bg-slate-800 p-2 rounded-xl transition-all">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Room Allocation</span>
                                                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{student?.roomNumber}</span>
                                                </div>
                                                <div className="flex justify-between items-center group/item hover:bg-white dark:hover:bg-slate-800 p-2 rounded-xl transition-all">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Floor Level</span>
                                                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Level 0{student?.floor}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <i className="fas fa-contact-book text-indigo-500"></i> Contact Intelligence
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone</span>
                                                    <span className="font-black text-slate-900 dark:text-white tracking-tighter italic">7009879433</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</span>
                                                    <span className="font-black text-slate-900 dark:text-white truncate max-w-[200px] tracking-tighter italic">drakshanyachess@gmail.com</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Emergency</span>
                                                    <span className="font-black text-rose-500 tracking-tighter italic">9381415639</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-xl overflow-hidden relative">
                                            <i className="fas fa-quote-right absolute top-6 right-8 text-white/5 text-6xl"></i>
                                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Bio & Summary</h4>
                                            <p className="text-lg font-medium leading-relaxed italic opacity-80">
                                                "Engineering student passionate about robotics and complex automation systems. Currently residing in Block {student?.hostelId} with a focus on academic excellence."
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Financial Status</h4>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                                                    <i className="fas fa-file-invoice-dollar text-xl"></i>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">₹{student?.pendingFee}</div>
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unpaid Balance</div>
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveTab('FEES')} className="w-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all">Clear All Dues</button>
                                        </div>

                                        <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Access Records</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Joining Date</span>
                                                    <span className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-widest">15 Aug 2024</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contract Exp</span>
                                                    <span className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-widest">15 Jun 2025</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in slide-in-from-bottom-4 duration-500">
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-t-[3rem] z-10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-white">Edit Profile</h3>
                                    <p className="text-indigo-100 text-sm mt-1">Update your personal information</p>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center text-white transition-all"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Profile Photo</label>
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-2xl border-4 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-lg">
                                            {editFormData.profilePhoto ? (
                                                <img src={editFormData.profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <i className="fas fa-user text-4xl text-slate-300"></i>
                                            )}
                                        </div>
                                        {editFormData.profilePhoto && (
                                            <button
                                                type="button"
                                                onClick={() => setEditFormData({ ...editFormData, profilePhoto: '' })}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <i className="fas fa-times text-xs"></i>
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer">
                                            <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-center">
                                                <i className="fas fa-cloud-upload-alt mr-2"></i>
                                                {editFormData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleEditPhotoUpload}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-slate-400 mt-2 italic">Max 5MB • JPG, PNG, GIF</p>
                                    </div>
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.firstName}
                                        onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.lastName}
                                        onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Contact Fields */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Emergency Contact</label>
                                <input
                                    type="tel"
                                    value={editFormData.emergency}
                                    onChange={(e) => setEditFormData({ ...editFormData, emergency: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleSaveProfile}
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                                >
                                    <i className="fas fa-save mr-2"></i>Save Changes
                                </button>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
