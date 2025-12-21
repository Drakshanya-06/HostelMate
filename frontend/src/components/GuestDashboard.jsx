import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GUEST_PRICING } from '../constants';

const GuestPortal = ({ onRequestSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        wantsFood: false,
        wantsLaundry: false,
        paymentMethod: ''
    });

    const [bookingStep, setBookingStep] = useState('DETAILS'); // DETAILS, PAYMENT
    const [estimatedCost, setEstimatedCost] = useState({ base: 0, meals: 0, laundry: 0, total: 0 });

    const calculateCost = (data) => {
        if (!data.checkIn || !data.checkOut) return { base: 0, meals: 0, laundry: 0, total: 0 };
        const start = new Date(data.checkIn);
        const end = new Date(data.checkOut);
        const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));

        if (days <= 0) return { base: 0, meals: 0, laundry: 0, total: 0 };

        const base = days * GUEST_PRICING.basePerDay;
        const meals = data.wantsFood ? days * GUEST_PRICING.foodPerDay : 0;
        const laundry = data.wantsLaundry ? GUEST_PRICING.laundryPerWash : 0;
        const total = base + meals + laundry;

        return { base, meals, laundry, total };
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };
        setFormData(newData);
        setEstimatedCost(calculateCost(newData));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setBookingStep('PAYMENT');
    };

    const handleFinalize = () => {
        if (!formData.paymentMethod) {
            alert("Please select a payment method");
            return;
        }

        const request = {
            ...formData,
            id: `GR${Date.now()}`,
            status: 'pending',
            feeStatus: 'pending', // Directly set to pending since it's cash at counter
            paymentMethod: 'CASH',
            totalFee: estimatedCost.total,
            costBreakdown: estimatedCost
        };
        onRequestSubmit(request);
        alert(`Request Submitted! Please pay ₹${estimatedCost.total} in cash at the warden office for approval.`);
        setFormData({
            ...formData,
            name: '', email: '', phone: '', checkIn: '', checkOut: '', wantsFood: false, wantsLaundry: false, paymentMethod: ''
        });
        setEstimatedCost({ base: 0, meals: 0, laundry: 0, total: 0 });
        setBookingStep('DETAILS');
    };

    return (
        <div className="min-h-screen flex flex-col items-center py-20 px-4 transition-all duration-300">
            <div className="max-w-5xl w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-slate-200/20 dark:shadow-none overflow-hidden flex flex-col md:flex-row border border-white/50 dark:border-slate-700/50 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Dark Sidebar (Consistent with Login Pages) */}
                <div className="w-full md:w-80 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-12 group">
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Portal</span>
                        </Link>
                        <h2 className="text-3xl font-black italic mb-2">Hostel<span className="text-indigo-500">Mate</span></h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Guest Services</p>
                        <p className="text-slate-300 text-sm leading-relaxed mb-12">Apply for a premium stay. Our team will review your request and send an OTP to your email upon approval.</p>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pricing Units</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Nightly Stay</span>
                                    <span className="font-bold">₹{GUEST_PRICING.basePerDay}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Meal Plan</span>
                                    <span className="font-bold">₹{GUEST_PRICING.foodPerDay}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Laundry</span>
                                    <span className="font-bold">₹{GUEST_PRICING.laundryPerWash}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="flex-1 p-10 md:p-16 text-slate-900 dark:text-white">
                    <div className="mb-12 border-b border-slate-100 dark:border-slate-700">
                        <div className="pb-4 text-sm font-black uppercase tracking-widest text-indigo-600 border-b-4 border-indigo-600 flex items-center gap-2">
                            <i className="fas fa-calendar-plus"></i> New Reservation
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Guest Representative</label>
                                <input required name="name" type="text" placeholder="Full Name" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium" value={formData.name} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Contact Number</label>
                                <input required name="phone" type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Electronic Mail</label>
                            <input required name="email" type="email" placeholder="email@address.com" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Arrival Date</label>
                                <input required name="checkIn" type="date" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium" value={formData.checkIn} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Departure Date</label>
                                <input required name="checkOut" type="date" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-medium" value={formData.checkOut} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="flex gap-8 py-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.wantsFood ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                                    <i className={`fas fa-check text-[10px] text-white ${formData.wantsFood ? 'opacity-100' : 'opacity-0'}`}></i>
                                </div>
                                <input type="checkbox" name="wantsFood" checked={formData.wantsFood} onChange={handleChange} className="hidden" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">Include Meals</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.wantsLaundry ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                                    <i className={`fas fa-check text-[10px] text-white ${formData.wantsLaundry ? 'opacity-100' : 'opacity-0'}`}></i>
                                </div>
                                <input type="checkbox" name="wantsLaundry" checked={formData.wantsLaundry} onChange={handleChange} className="hidden" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">Laundry Care</span>
                            </label>
                        </div>

                        {bookingStep === 'DETAILS' ? (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50 flex justify-between items-center mt-6">
                                <div>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] tracking-widest block mb-1">Projected Total</span>
                                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">₹{estimatedCost.total.toLocaleString()}</span>
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-2xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95">
                                    Select Payment <i className="fas fa-credit-card ml-2"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                <div className="grid grid-cols-1 gap-4">
                                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Select Payment Method</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { id: 'cash', label: 'Cash at Counter', icon: 'fa-money-bill-wave' }
                                        ].map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.paymentMethod === method.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/30 grow' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}
                                            >
                                                <i className={`fas ${method.icon} text-2xl`}></i>
                                                <span className="text-xs font-black uppercase tracking-widest">{method.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-xl"></div>
                                    <div className="flex flex-col gap-4 relative z-10">
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                                            <span>Accomodation</span>
                                            <span className="text-white">₹{estimatedCost.base.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                                            <span>Meal Plan</span>
                                            <span className="text-white">₹{estimatedCost.meals.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                                            <span>Service Fee (Laundry)</span>
                                            <span className="text-white">₹{estimatedCost.laundry.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/10 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black uppercase tracking-widest">Grand Total</span>
                                            <span className="text-3xl font-black italic">₹{estimatedCost.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setBookingStep('DETAILS')}
                                        className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 py-4 rounded-2xl font-black text-sm transition-all"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFinalize}
                                        className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all animate-pulse hover:animate-none"
                                    >
                                        Finalize Payment <i className="fas fa-check-circle ml-2"></i>
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

export default GuestPortal;
