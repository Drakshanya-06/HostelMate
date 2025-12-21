import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const AdminLogin = ({ onLogin }) => {
    return (
        <div className="flex items-center justify-center transition-all p-6 flex-1 min-h-[calc(100vh-80px)]">
            <div className="max-w-4xl w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20 dark:border-slate-700/50 animate-in fade-in zoom-in duration-500 relative">

                {/* Dark Sidebar in Card */}
                <div className="w-full md:w-80 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-600/10 z-0" />
                    <div className="relative z-10">
                        <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-12 group">
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go back</span>
                        </Link>
                        <h2 className="text-3xl font-black italic mb-2">Hostel<span className="text-indigo-500">Mate</span></h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Admin Portal</p>
                        <p className="text-slate-300 text-sm leading-relaxed">System administration and infrastructure management dashboard.</p>
                    </div>
                </div>

                <div className="flex-1 p-10 md:p-16">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Admin Access</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                    </div>

                    <LoginForm
                        role="ADMIN"
                        onLogin={onLogin}
                        onForgotPassword={() => window.location.hash = '#/forgot-password'}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
