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
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 transition-all">
                <div className="max-w-md w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/20 dark:shadow-none border border-white/50 dark:border-slate-700/50 p-10 animate-in fade-in zoom-in duration-500">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                            <i className="fas fa-envelope-open-text text-3xl text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Verify Email</h2>
                        <p className="text-slate-500 dark:text-slate-400">Enter the OTP sent to <span className="text-indigo-600 font-bold">{formData.email}</span></p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="0 0 0 0 0 0"
                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                            maxLength={6}
                        />
                        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Verify & Complete <i className="fas fa-check-circle ml-2"></i>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12 px-4 transition-all flex-1 min-h-[calc(100vh-80px)]">
            <div className="max-w-5xl w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20 dark:border-slate-700/50 animate-in fade-in zoom-in duration-500 relative">

                {/* Dark Sidebar in Card */}
                <div className="w-full md:w-80 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-600/10 z-0" />
                    <div className="relative z-10">
                        <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-12 group">
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go back</span>
                        </Link>
                        <h2 className="text-3xl font-black italic mb-2">Hostel<span className="text-indigo-500">Mate</span></h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Account Setup</p>
                        <p className="text-slate-300 text-sm leading-relaxed mb-12">Join our premium resident community. Complete the steps to secure your smart living space.</p>

                        <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Current Progress</div>
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-black italic">Step {step}</span>
                                <span className="text-slate-400 font-bold mb-1">/ 2</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-10 md:p-16">
                    <div className="mb-10">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Join Community</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                            {step === 1 ? 'Personal Information' : 'Institutional Details'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="Jane"
                                        />
                                        {errors.firstName && <p className="text-red-500 text-xs mt-2 font-medium">{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <p className="text-red-500 text-xs mt-2 font-medium">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="jane@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-2 font-medium">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                                        <input
                                            type="password"
                                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                        {errors.password && <p className="text-red-500 text-xs mt-2 font-medium">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                                        <input
                                            type="password"
                                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-2 font-medium">{errors.confirmPassword}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Profile Photo (Optional)</label>
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-2xl border-4 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-lg">
                                                {formData.profilePhoto ? (
                                                    <img src={formData.profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <i className="fas fa-user text-4xl text-slate-300"></i>
                                                )}
                                            </div>
                                            {formData.profilePhoto && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, profilePhoto: '' })}
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
                                                    {formData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-slate-400 mt-2 italic">Max 5MB • JPG, PNG, GIF</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Continue <i className="fas fa-arrow-right ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Parent / Guardian Name</label>
                                    <input
                                        type="text"
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.parentsName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                        value={formData.parentsName}
                                        onChange={(e) => setFormData({ ...formData, parentsName: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                    {errors.parentsName && <p className="text-red-500 text-xs mt-2 font-medium">{errors.parentsName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Emergency Contact Number</label>
                                    <input
                                        type="tel"
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-2 font-medium">{errors.phone}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hostel Block</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none"
                                            value={formData.hostelId}
                                            onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                                        >
                                            {[...Array(10)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>Block {i + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Floor</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none"
                                            value={formData.floor}
                                            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                        >
                                            {[...Array(10)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>Floor {i + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Preferred Room Number</label>
                                    <input
                                        type="number"
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.roomNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                        value={formData.roomNumber}
                                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                        placeholder="e.g. 101"
                                    />
                                    {errors.roomNumber && <p className="text-red-500 text-xs mt-2 font-medium">{errors.roomNumber}</p>}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 px-4 py-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Complete Registration
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
