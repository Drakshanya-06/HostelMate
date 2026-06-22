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
        <div className="min-h-screen flex flex-col items-center py-20 px-4 transition-all duration-300 bg-background text-textPrimary">
            <div className="max-w-6xl w-full bg-surface/40 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl shadow-black/50 overflow-hidden flex flex-col md:flex-row border border-white/5 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Dark Sidebar */}
                <div className="w-full md:w-96 bg-surface p-16 text-white flex flex-col justify-between relative overflow-hidden border-r border-white/5">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.1),transparent)] pointer-events-none"></div>
                    <div className="relative z-10">
                        <Link to="/login" className="flex items-center gap-3 text-textSecondary hover:text-primary transition-all mb-16 group">
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Portal Access</span>
                        </Link>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/30 animate-float">
                                <i className="fas fa-bed text-2xl text-white"></i>
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter">Hostel<span className="text-primary">Mate</span></h2>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-10">Guest Experience</p>
                        <p className="text-textSecondary text-base leading-relaxed mb-16 font-medium">Experience high-end resident living. Submit your request for a premium stay in our environment.</p>

                        <div className="space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Rate Portfolio</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center group">
                                    <span className="text-textSecondary text-sm font-bold group-hover:text-textPrimary transition-colors">Per Night</span>
                                    <span className="font-black italic text-lg text-textPrimary">₹{GUEST_PRICING.basePerDay}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-textSecondary text-sm font-bold group-hover:text-textPrimary transition-colors">Culinary Access</span>
                                    <span className="font-black italic text-lg text-textPrimary">₹{GUEST_PRICING.foodPerDay}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-textSecondary text-sm font-bold group-hover:text-textPrimary transition-colors">Valet Laundry</span>
                                    <span className="font-black italic text-lg text-textPrimary">₹{GUEST_PRICING.laundryPerWash}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="flex-1 p-12 md:p-20 text-textPrimary relative bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03),transparent)]">
                    <div className="mb-16">
                        <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                            <i className="fas fa-calendar-check text-secondary animate-pulse"></i> Intelligent Reservation
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Identity Name</label>
                                <input required name="name" type="text" placeholder="Full Legal Name" className="w-full bg-surface border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm" value={formData.name} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Contact Link</label>
                                <input required name="phone" type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-surface border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Digital Correspondence</label>
                            <input required name="email" type="email" placeholder="email@address.com" className="w-full bg-surface border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Arrival Cycle</label>
                                <input required name="checkIn" type="date" className="w-full bg-surface border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm [color-scheme:dark]" value={formData.checkIn} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-3 ml-1">Departure Cycle</label>
                                <input required name="checkOut" type="date" className="w-full bg-surface border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm [color-scheme:dark]" value={formData.checkOut} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="flex gap-10 py-2">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${formData.wantsFood ? 'bg-primary border-primary shadow-lg shadow-primary/30' : 'border-white/10 bg-white/5'}`}>
                                    <i className={`fas fa-check text-xs text-white ${formData.wantsFood ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></i>
                                </div>
                                <input type="checkbox" name="wantsFood" checked={formData.wantsFood} onChange={handleChange} className="hidden" />
                                <span className="text-xs font-bold uppercase tracking-widest text-textSecondary group-hover:text-textPrimary transition-colors">Culinary Access</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${formData.wantsLaundry ? 'bg-secondary border-secondary shadow-lg shadow-secondary/30' : 'border-white/10 bg-white/5'}`}>
                                    <i className={`fas fa-check text-xs text-white ${formData.wantsLaundry ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></i>
                                </div>
                                <input type="checkbox" name="wantsLaundry" checked={formData.wantsLaundry} onChange={handleChange} className="hidden" />
                                <span className="text-xs font-bold uppercase tracking-widest text-textSecondary group-hover:text-textPrimary transition-colors">Valet Laundry</span>
                            </label>
                        </div>

                        {bookingStep === 'DETAILS' ? (
                            <div className="bg-primary/10 p-10 rounded-[2.5rem] border border-primary/20 flex justify-between items-center mt-10">
                                <div>
                                    <span className="text-primary font-black uppercase text-[10px] tracking-[0.3em] block mb-2">Projected Value</span>
                                    <span className="text-4xl font-black text-textPrimary tracking-tighter italic">₹{estimatedCost.total.toLocaleString()}</span>
                                </div>
                                <button type="submit" className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-sm hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                                    Authenticate <i className="fas fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                                <div className="grid grid-cols-1 gap-4">
                                    <label className="block text-[10px] font-black text-textSecondary uppercase tracking-[0.3em] mb-2 ml-1">Payment Protocol</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {[
                                            { id: 'cash', label: 'Cash at Counter', icon: 'fa-money-bill-wave' }
                                        ].map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                                                className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${formData.paymentMethod === method.id ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/30' : 'bg-surface border-white/5 text-textSecondary hover:border-primary/30 hover:bg-primary/5'}`}
                                            >
                                                <i className={`fas ${method.icon} text-3xl`}></i>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
 
                                <div className="bg-surface text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                                    <div className="flex flex-col gap-5 relative z-10">
                                        <div className="flex justify-between text-[10px] font-black text-textSecondary uppercase tracking-widest">
                                            <span>Environment Access</span>
                                            <span className="text-textPrimary">₹{estimatedCost.base.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-textSecondary uppercase tracking-widest">
                                            <span>Culinary Plan</span>
                                            <span className="text-textPrimary">₹{estimatedCost.meals.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-textSecondary uppercase tracking-widest">
                                            <span>Valet Services</span>
                                            <span className="text-textPrimary">₹{estimatedCost.laundry.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/5 my-3"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Consolidated Total</span>
                                            <span className="text-4xl font-black italic tracking-tighter">₹{estimatedCost.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
 
                                <div className="flex gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setBookingStep('DETAILS')}
                                        className="flex-1 bg-white/5 text-textSecondary py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-white/10 hover:text-textPrimary"
                                    >
                                        Modify Details
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFinalize}
                                        className="flex-[2] bg-success text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-success/90 shadow-2xl shadow-success/20 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Finalize Reservation <i className="fas fa-check-circle ml-2"></i>
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
