import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const AdminLogin = ({ onLogin }) => {
    return (
        <div className="flex items-center justify-center transition-all p-6 flex-1 min-h-[calc(100vh-80px)] bg-background">
            <div className="max-w-4xl w-full bg-surface/40 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl shadow-black/50 flex flex-col md:flex-row overflow-hidden border border-white/5 animate-in fade-in zoom-in duration-700 relative">

                {/* Dark Sidebar in Card */}
                <div className="w-full md:w-96 bg-surface p-16 text-white flex flex-col justify-between relative overflow-hidden border-r border-white/5">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.1),transparent)] pointer-events-none"></div>
                    <div className="relative z-10">
                        <Link to="/login" className="flex items-center gap-3 text-textSecondary hover:text-primary transition-all mb-16 group">
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Root Access</span>
                        </Link>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/30 animate-float">
                                <i className="fas fa-shield-alt text-2xl text-white"></i>
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter">Hostel<span className="text-primary">Mate</span></h2>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-10">Administrative Core</p>
                        <p className="text-textSecondary text-base leading-relaxed mb-16 font-medium">Elevated privileges required. Access system-wide infrastructure and resident management modules.</p>
                    </div>
                </div>

                <div className="flex-1 p-12 md:p-20 relative bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03),transparent)]">
                    <div className="text-center mb-12">
                        <h3 className="text-4xl font-black text-textPrimary tracking-tighter italic font-heading">Secure Node</h3>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center justify-center gap-2">
                            <i className="fas fa-lock-alt animate-pulse"></i>
                            Level 4 Authentication Required
                        </p>
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
