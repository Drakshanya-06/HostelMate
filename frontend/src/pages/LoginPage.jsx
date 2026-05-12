import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, CreditCard, ArrowRight, Home } from 'lucide-react';

const LoginPage = () => {
    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden bg-background text-textPrimary">
            {/* Minimalist Visual Section */}
            <div className="w-full md:w-2/5 bg-surface relative overflow-hidden flex flex-col justify-center p-12 lg:p-20 border-r border-border">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10 grayscale"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555854817-5b2260d1bd63?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-background via-background/90 to-transparent" />

                <div className="relative z-10 space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary p-3 rounded-2xl shadow-2xl shadow-primary/40 animate-float">
                            <Home className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white font-heading">
                            Hostel<span className="text-primary italic">Mate</span>
                        </h1>
                    </div>
                    
                    <div className="space-y-6">
                        <h2 className="text-6xl font-black text-textPrimary leading-[1] font-heading tracking-tighter">
                            Evolve Your <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Living Space.</span>
                        </h2>
                        <p className="text-xl text-textSecondary font-medium max-w-sm leading-relaxed">
                            The intelligent hub for modern student housing and administration.
                        </p>
                    </div>

                    <div className="space-y-6 pt-6">
                        {[
                            { icon: ShieldCheck, label: 'Secure Allocation', color: 'text-primary' },
                            { icon: Activity, label: 'Live Insights', color: 'text-secondary' },
                            { icon: CreditCard, label: 'Smart Finance', color: 'text-success' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-5 text-textSecondary group hover:text-textPrimary transition-all duration-300">
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-12 left-12 lg:left-20 z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-textSecondary/50">PLATFORM v6.0.2 NEBULA</p>
                </div>
            </div>

            {/* Selection Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent)]">
                <div className="w-full max-w-4xl space-y-16 relative z-10">
                    <div className="text-center md:text-left space-y-4">
                        <h3 className="text-3xl font-black font-heading text-textPrimary tracking-tight">System Access</h3>
                        <p className="text-textSecondary text-lg font-medium">Select your portal to authenticate into the environment.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { to: '/student-login', icon: Activity, title: 'Resident', desc: 'Personal dashboard, bills & status.', color: 'group-hover:text-secondary', bg: 'hover:border-secondary/50' },
                            { to: '/admin-login', icon: ShieldCheck, title: 'Warden', desc: 'Central system & resident control.', color: 'group-hover:text-primary', bg: 'hover:border-primary/50' },
                            { to: '/guest-login', icon: CreditCard, title: 'Guest', desc: 'Stay requests & digital tracking.', color: 'group-hover:text-success', bg: 'hover:border-success/50' }
                        ].map((card, i) => (
                            <Link key={i} to={card.to} className={`group p-10 rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-white/5 ${card.bg} hover:bg-surface/60 transition-all duration-500 text-center hover:-translate-y-2 shadow-2xl shadow-black/20`}>
                                <div className="w-20 h-20 mx-auto mb-8 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <card.icon className={`w-10 h-10 text-textSecondary ${card.color} transition-colors`} />
                                </div>
                                <h4 className="text-xl font-black text-textPrimary mb-3 italic">{card.title}</h4>
                                <p className="text-textSecondary text-xs leading-relaxed font-medium">{card.desc}</p>
                            </Link>
                        ))}
                    </div>

                    <div className="pt-12 text-center border-t border-white/5">
                        <p className="text-textSecondary text-sm font-medium flex items-center justify-center gap-3">
                            Unauthorized access is prohibited. <Link to="/register" className="text-primary font-bold hover:text-secondary flex items-center gap-2 transition-colors uppercase tracking-widest text-xs">Register Profile <ArrowRight className="w-4 h-4" /></Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
