import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setMessage('OTP sent to your email.');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await authService.verifyResetOtp(email, otp);
            setMessage('OTP verified. Please set your new password.');
            setStep(3);
        } catch (err) {
            setError(err.message || 'Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword({ email, otp, newPassword });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center transition-all p-6 flex-1 min-h-[calc(100vh-80px)] bg-background">
            <div className="max-w-4xl w-full bg-surface/40 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl shadow-black/50 flex flex-col md:flex-row overflow-hidden border border-white/5 animate-in fade-in zoom-in duration-700 relative">

                {/* Dark Sidebar in Card */}
                <div className="w-full md:w-96 bg-surface p-16 text-white flex flex-col justify-between relative overflow-hidden border-r border-white/5">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.1),transparent)] pointer-events-none"></div>
                    <div className="relative z-10">
                        <Link to="/login" className="flex items-center gap-3 text-textSecondary hover:text-primary transition-all mb-16 group">
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Portal Access</span>
                        </Link>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/30 animate-float">
                                <i className="fas fa-key-skeleton text-2xl text-white"></i>
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter">Hostel<span className="text-primary">Mate</span></h2>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-10">Account Recovery</p>
                        <p className="text-textSecondary text-base leading-relaxed mb-16 font-medium">Securely recover your access. Our encrypted protocol will assist you in restoring your digital identity.</p>
                    </div>
                </div>

                <div className="flex-1 p-12 md:p-20 relative bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03),transparent)]">
                    <div className="text-center mb-12">
                        <h3 className="text-4xl font-black text-textPrimary tracking-tighter italic font-heading">
                            {step === 1 ? 'Lost Key?' : step === 2 ? 'Security Pulse' : 'New Identity'}
                        </h3>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-3">
                            {step === 1 ? 'Initialize Recovery' : step === 2 ? 'Verify 4-digit sequence' : 'Reset Access Phrase'}
                        </p>
                    </div>

                    {message && (
                        <div className="bg-success/10 border border-success/20 text-success p-5 rounded-[1.5rem] mb-10 text-center text-[10px] font-black uppercase tracking-[0.2em] animate-in zoom-in-95 duration-300">
                            <i className="fas fa-check-circle mr-2"></i> {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-danger/10 border border-danger/20 text-danger p-5 rounded-[1.5rem] mb-10 text-center text-[10px] font-black uppercase tracking-[0.2em] animate-in zoom-in-95 duration-300">
                            <i className="fas fa-exclamation-circle mr-2"></i> {error}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Identity Correspondence</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="jane@example.com"
                                    className="w-full px-6 py-4 bg-surface border border-white/5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Initializing...' : 'Transmit Recovery Code'} <i className="fas fa-paper-plane ml-2"></i>
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Sequence Input</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="••••"
                                    maxLength={4}
                                    className="w-full px-6 py-6 bg-surface border border-white/5 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all tracking-[0.5em] text-center text-4xl font-black text-primary shadow-inner"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Authenticating...' : 'Validate Sequence'} <i className="fas fa-check-circle ml-2"></i>
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">New Access Phrase</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-6 py-4 bg-surface border border-white/5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Confirm Access Phrase</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-6 py-4 bg-surface border border-white/5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Committing...' : 'Finalize Identity'} <i className="fas fa-shield-alt ml-2"></i>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
