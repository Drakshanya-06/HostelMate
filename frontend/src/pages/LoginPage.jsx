import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden transition-all duration-300">
            {/* Dark Sidebar Section */}
            <div className="w-full md:w-1/3 bg-slate-900 relative overflow-hidden flex flex-col justify-center p-12 text-white">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555854817-5b2260d1bd63?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-indigo-600/20 to-slate-900/90" />

                <div className="relative z-10 animate-in fade-in slide-in-from-left-4 duration-1000">
                    <h1 className="text-6xl font-black mb-6 tracking-tighter italic">
                        Hostel<span className="text-rose-500">Mate</span>
                    </h1>
                    <div className="w-20 h-1.5 bg-rose-500 rounded-full mb-8"></div>
                    <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-sm">
                        Smart <span className="text-white font-bold">Living</span> Solutions for the Modern Resident.
                    </p>

                    <div className="mt-16 space-y-6">
                        <div className="flex items-center gap-4 text-slate-400">
                            <i className="fas fa-check-circle text-rose-500"></i>
                            <span className="text-sm font-bold uppercase tracking-widest">Digital Allocation</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <i className="fas fa-check-circle text-rose-500"></i>
                            <span className="text-sm font-bold uppercase tracking-widest">Real-time Tracking</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <i className="fas fa-check-circle text-rose-500"></i>
                            <span className="text-sm font-bold uppercase tracking-widest">Secure Payments</span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-12 left-12 z-10 opacity-50">
                    <p className="text-xs font-bold uppercase tracking-[0.3em]">© 2024 HOSTELMATE v4.0</p>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full relative z-10">
                    {/* Student Card */}
                    <Link to="/student-login" className="group relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 text-center overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                            <img src="/images/student-new.png" alt="Student" className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Student</h2>
                        <p className="text-slate-200 leading-relaxed text-xs">Access your room, fees, and digital IDs.</p>
                    </Link>

                    {/* Admin Card */}
                    <Link to="/admin-login" className="group relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 text-center overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                            <img src="/images/admin-new.png" alt="Admin" className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Administrator</h2>
                        <p className="text-slate-200 leading-relaxed text-xs">Manage inventory and resident logs.</p>
                    </Link>

                    {/* Guest Card */}
                    <Link to="/guest-login" className="group relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 text-center overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                            <img src="/images/guest-new.png" alt="Guest" className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Visitor Portal</h2>
                        <p className="text-slate-200 leading-relaxed text-xs">Request stays and trace your status.</p>
                    </Link>
                </div>

                <div className="mt-12 text-center relative z-10">
                    <p className="text-slate-300">
                        New to the community? <Link to="/register" className="text-white font-bold hover:text-rose-400 transition-colors border-b-2 border-rose-500/50 hover:border-rose-400 pb-0.5">Start Registration <i className="fas fa-arrow-right ml-1"></i></Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
