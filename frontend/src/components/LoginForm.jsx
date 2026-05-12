import React, { useState } from 'react';
import authService from '../services/authService';
import { useLanguage } from '../context/LanguageContext';

const LoginForm = ({ role, onLogin, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('CREDENTIALS'); // CREDENTIALS, OTP
    const [message, setMessage] = useState('');
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            if (step === 'CREDENTIALS') {
                if (role === 'STUDENT') {
                    const data = await authService.login(role, email, password);
                    onLogin(data.role || 'STUDENT', data._id, data.token);
                } else if (role === 'ADMIN' || role === 'WARDEN') {
                    const data = await authService.login('ADMIN', email, password); // Use 'ADMIN' endpoint for both
                    onLogin(data.role || 'ADMIN', data._id, data.token);
                }
            }
        } catch (error) {
            setMessage(error.message || 'Login Failed');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Identity Correspondence</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <i className="fas fa-envelope text-textSecondary group-focus-within:text-primary transition-colors"></i>
                    </div>
                    <input
                        type="email"
                        required
                        className="w-full pl-14 pr-6 py-4 bg-surface border border-white/5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm shadow-inner"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                    />
                </div>
            </div>

            {step === 'CREDENTIALS' && (
                <div>
                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Access Phrase</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <i className="fas fa-lock text-textSecondary group-focus-within:text-primary transition-colors"></i>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full pl-14 pr-6 py-4 bg-surface border border-white/5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm shadow-inner"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex justify-end mt-3 px-1">
                        <button type="button" onClick={onForgotPassword} className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-hover transition-colors">
                            Recover Access?
                        </button>
                    </div>
                </div>
            )}

            {step === 'OTP' && (
                <div>
                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Security Sequence</label>
                    <input
                        type="text"
                        required
                        className="w-full px-6 py-6 bg-surface border border-white/5 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all tracking-[0.5em] text-center text-4xl font-black text-primary shadow-inner"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="••••"
                    />
                </div>
            )}

            {message && (
                <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                    <i className="fas fa-exclamation-triangle mr-2"></i> {message}
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
            >
                {step === 'CREDENTIALS' ? 'Initialize Access' : 'Validate Node'} <i className={`fas ${step === 'CREDENTIALS' ? 'fa-sign-in-alt' : 'fa-check-circle'} ml-2`}></i>
            </button>
        </form>
    );
};

export default LoginForm;
