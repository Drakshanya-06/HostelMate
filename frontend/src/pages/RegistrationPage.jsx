import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const RegistrationPage = ({ onRegister }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        parentsName: '',
        phone: '',
        hostelId: '1',
        floor: '1',
        roomNumber: '',
        profilePhoto: '',
    });

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePhoto: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const [errors, setErrors] = useState({});

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First Name is required';
        if (!formData.lastName) newErrors.lastName = 'Last Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.parentsName) newErrors.parentsName = 'Parent Name is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.roomNumber) newErrors.roomNumber = 'Room number is required';
        if (!/^\d{1,3}$/.test(formData.roomNumber)) {
            newErrors.roomNumber = 'Room number must be numeric (1-999).';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateStep2()) {
            try {
                await authService.register({
                    ...formData,
                    name: `${formData.firstName} ${formData.lastName}`,
                    role: 'STUDENT'
                });
                setShowOtp(true);
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            const user = await authService.verifyOtp(formData.email, otp);
            alert('Registration Successful! Please login.');
            if (onRegister) onRegister(user);
            navigate('/login');
        } catch (error) {
            alert(error.message);
        }
    };

    if (showOtp) {
        return (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6 transition-all">
                <div className="max-w-md w-full bg-surface/60 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-black/50 border border-white/5 p-12 animate-in fade-in zoom-in duration-500 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="mb-10 relative z-10">
                        <div className="w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transform -rotate-6 hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-primary/20 animate-float">
                            <i className="fas fa-envelope-open-text text-4xl text-primary"></i>
                        </div>
                        <h2 className="text-3xl font-black text-textPrimary mb-3 tracking-tighter font-heading italic">Verify Identity</h2>
                        <p className="text-textSecondary font-medium leading-relaxed">A security protocol has been sent to <span className="text-primary font-bold">{formData.email}</span></p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-8 relative z-10">
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="0 0 0 0 0 0"
                            className="w-full px-4 py-5 bg-background border border-white/5 rounded-3xl text-center text-4xl font-black tracking-[0.5em] text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-white/5 shadow-inner"
                            maxLength={6}
                        />
                        <button type="submit" className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95">
                            Verify Protocol <i className="fas fa-shield-check ml-2"></i>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12 px-4 transition-all flex-1 min-h-[calc(100vh-80px)] bg-background">
            <div className="max-w-6xl w-full bg-surface/40 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl shadow-black/50 flex flex-col md:flex-row overflow-hidden border border-white/5 animate-in fade-in zoom-in duration-700 relative">

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
                                <i className="fas fa-user-plus text-2xl text-white"></i>
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter">Hostel<span className="text-primary">Mate</span></h2>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-10">Resident Onboarding</p>
                        <p className="text-textSecondary text-base leading-relaxed mb-16 font-medium">Join our premier resident network. Your digital keys and unified living space await.</p>

                        <div className="bg-white/5 backdrop-blur-md px-8 py-6 rounded-[2rem] border border-white/5 shadow-2xl shadow-black/20">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 mb-3">Onboarding Pulse</div>
                            <div className="flex justify-between items-end">
                                <span className="text-4xl font-black italic tracking-tighter">Phase {step}</span>
                                <span className="text-textSecondary font-bold mb-1 uppercase tracking-widest text-[10px]">/ 02</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-12 md:p-20 relative bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03),transparent)]">
                    <div className="mb-12">
                        <h3 className="text-4xl font-black text-textPrimary tracking-tighter italic font-heading">Secure Space</h3>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                            <i className="fas fa-fingerprint animate-pulse"></i>
                            {step === 1 ? 'Personal Identity Matrix' : 'Institutional Allocation'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {step === 1 ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Given Name</label>
                                        <input
                                            type="text"
                                            className={`w-full px-6 py-4 bg-surface border ${errors.firstName ? 'border-danger' : 'border-white/5'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm`}
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="Jane"
                                        />
                                        {errors.firstName && <p className="text-danger text-[10px] mt-2 font-black uppercase tracking-widest">{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Family Name</label>
                                        <input
                                            type="text"
                                            className={`w-full px-6 py-4 bg-surface border ${errors.lastName ? 'border-danger' : 'border-white/5'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm`}
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <p className="text-danger text-[10px] mt-2 font-black uppercase tracking-widest">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Secure Correspondence</label>
                                    <input
                                        type="email"
                                        className={`w-full px-6 py-4 bg-surface border ${errors.email ? 'border-danger' : 'border-white/5'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm`}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="jane@example.com"
                                    />
                                    {errors.email && <p className="text-danger text-[10px] mt-2 font-black uppercase tracking-widest">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Access Phrase</label>
                                        <input
                                            type="password"
                                            className={`w-full px-6 py-4 bg-surface border ${errors.password ? 'border-danger' : 'border-white/5'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm`}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                        {errors.password && <p className="text-danger text-[10px] mt-2 font-black uppercase tracking-widest">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Confirm Phrase</label>
                                        <input
                                            type="password"
                                            className={`w-full px-6 py-4 bg-surface border ${errors.confirmPassword ? 'border-danger' : 'border-white/5'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm`}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                        {errors.confirmPassword && <p className="text-danger text-[10px] mt-2 font-black uppercase tracking-widest">{errors.confirmPassword}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Visual Identity (Optional)</label>
                                    <div className="flex items-center gap-8">
                                        <div className="relative group">
                                            <div className="w-36 h-36 rounded-3xl border-4 border-white/5 overflow-hidden bg-surface flex items-center justify-center shadow-2xl shadow-black/50">
                                                {formData.profilePhoto ? (
                                                    <img src={formData.profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <i className="fas fa-user-robot text-5xl text-white/5"></i>
                                                )}
                                            </div>
                                            {formData.profilePhoto && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, profilePhoto: '' })}
                                                    className="absolute -top-3 -right-3 w-10 h-10 bg-danger text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className="cursor-pointer">
                                                <div className="px-8 py-5 bg-primary/10 text-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/20 transition-all border-2 border-dashed border-primary/30 text-center">
                                                    <i className="fas fa-shuttle-space mr-2"></i>
                                                    {formData.profilePhoto ? 'Overwrite Visual' : 'Initialize Capture'}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-[10px] text-textSecondary mt-3 font-bold uppercase tracking-widest">Quantum Size Limit: 5MB • Universal Formats</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Next Phase <i className="fas fa-arrow-right ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Guardian Identity</label>
                                    <input
                                        type="text"
                                        className={`w-full px-6 py-4 bg-surface border ${errors.parentsName ? 'border-danger' : 'border-white/5'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm`}
                                        value={formData.parentsName}
                                        onChange={(e) => setFormData({ ...formData, parentsName: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                    {errors.parentsName && <p className="text-danger text-[10px] mt-2 font-black uppercase tracking-widest">{errors.parentsName}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Emergency Protocol Link</label>
                                    <input
                                        type="tel"
                                        className={`w-full px-6 py-4 bg-surface border ${errors.phone ? 'border-danger' : 'border-white/5'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm`}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                    {errors.phone && <p className="text-danger text-[10px] mt-2 font-black uppercase tracking-widest">{errors.phone}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Structural Block</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-6 py-4 bg-surface border border-white/5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                                                value={formData.hostelId}
                                                onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                                            >
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>Sector {i + 1}</option>
                                                ))}
                                            </select>
                                            <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Vertical Level</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-6 py-4 bg-surface border border-white/5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                                                value={formData.floor}
                                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                            >
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                                                ))}
                                            </select>
                                            <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none"></i>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Target Allocation Unit</label>
                                    <input
                                        type="number"
                                        className={`w-full px-6 py-4 bg-surface border ${errors.roomNumber ? 'border-danger' : 'border-white/5'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm`}
                                        value={formData.roomNumber}
                                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                        placeholder="e.g. 101"
                                    />
                                    {errors.roomNumber && <p className="text-danger text-[10px] mt-2 font-black uppercase tracking-widest">{errors.roomNumber}</p>}
                                </div>

                                <div className="flex gap-6 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 px-4 py-5 border border-white/5 text-textSecondary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                                    >
                                        Revert Phase
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Finalize Matrix
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;
