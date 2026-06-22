import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GateTiming = () => {
    const [status, setStatus] = useState('IN'); // 'IN' or 'OUT'
    const [logs, setLogs] = useState([
        { id: 1, time: '2023-10-20 08:30 AM', type: 'OUT', location: 'University Campus' },
        { id: 2, time: '2023-10-20 06:15 PM', type: 'IN', location: 'Hostel Main Gate' },
    ]);

    const handleMovement = (type) => {
        const now = new Date();
        const newLog = {
            id: Date.now(),
            time: now.toLocaleString(),
            type: type,
            location: type === 'IN' ? 'Hostel Main Gate' : 'External'
        };
        setLogs([newLog, ...logs]);
        setStatus(type);
    };

    return (
        <div className="min-h-screen bg-background transition-all duration-300 py-16 px-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <Link to="/student" className="inline-flex items-center text-[10px] font-black text-textSecondary uppercase tracking-[0.3em] hover:text-primary transition-all mb-6 group">
                            <i className="fas fa-arrow-left mr-3 group-hover:-translate-x-2 transition-transform"></i>
                            Dashboard Access
                        </Link>
                        <h1 className="text-5xl font-black text-textPrimary tracking-tighter italic font-heading">Gate Intelligence</h1>
                        <p className="text-textSecondary mt-3 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            HostelMate Secure Entry/Exit Matrix
                        </p>
                    </div>
                    <div className="bg-surface/50 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-white/5 shadow-2xl shadow-black/20 flex items-center gap-6">
                        <div className="text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Live Pulse:</div>
                        <div className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg ${status === 'IN' ? 'bg-success/20 text-success border border-success/30 shadow-success/10' : 'bg-danger/20 text-danger border border-danger/30 shadow-danger/10'}`}>
                            {status === 'IN' ? 'Resident Inbound' : 'Resident Outbound'}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Activity Controls */}
                    <div className="lg:col-span-7 bg-surface/30 backdrop-blur-2xl p-12 rounded-[3rem] shadow-2xl shadow-black/50 border border-white/5 relative overflow-hidden animate-in fade-in zoom-in duration-700">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                                <i className="fas fa-fingerprint text-xl"></i>
                            </div>
                            <h2 className="text-2xl font-black text-textPrimary tracking-tight italic font-heading">Movement Control</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <button
                                onClick={() => handleMovement('OUT')}
                                disabled={status === 'OUT'}
                                className={`group relative p-10 rounded-[2.5rem] border transition-all flex flex-col justify-between overflow-hidden ${status === 'IN'
                                    ? 'border-danger/30 bg-danger/5 hover:bg-danger/10 hover:border-danger hover:scale-[1.02] active:scale-95 shadow-2xl shadow-danger/5 cursor-pointer'
                                    : 'border-white/5 bg-background/50 opacity-30 cursor-not-allowed grayscale'}`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-danger/20 transition-all duration-500"></div>
                                <div className="w-16 h-16 bg-danger/20 text-danger rounded-3xl flex items-center justify-center text-2xl shadow-2xl shadow-danger/10 mb-8 relative z-10">
                                    <i className="fas fa-portal-exit group-hover:-translate-x-2 transition-transform duration-500"></i>
                                </div>
                                <div className="text-left relative z-10">
                                    <div className="text-danger font-black uppercase text-[10px] tracking-[0.3em] mb-2 opacity-70">External Migration</div>
                                    <div className="text-2xl font-black text-textPrimary italic tracking-tighter">Check Out</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleMovement('IN')}
                                disabled={status === 'IN'}
                                className={`group relative p-10 rounded-[2.5rem] border transition-all flex flex-col justify-between overflow-hidden ${status === 'OUT'
                                    ? 'border-success/30 bg-success/5 hover:bg-success/10 hover:border-success hover:scale-[1.02] active:scale-95 shadow-2xl shadow-success/5 cursor-pointer'
                                    : 'border-white/5 bg-background/50 opacity-30 cursor-not-allowed grayscale'}`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-success/20 transition-all duration-500"></div>
                                <div className="w-16 h-16 bg-success/20 text-success rounded-3xl flex items-center justify-center text-2xl shadow-2xl shadow-success/10 mb-8 relative z-10">
                                    <i className="fas fa-portal-enter group-hover:translate-x-2 transition-transform duration-500"></i>
                                </div>
                                <div className="text-left relative z-10">
                                    <div className="text-success font-black uppercase text-[10px] tracking-[0.3em] mb-2 opacity-70">Internal Migration</div>
                                    <div className="text-2xl font-black text-textPrimary italic tracking-tighter">Check In</div>
                                </div>
                            </button>
                        </div>
                        
                        <div className="mt-12 p-8 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-start gap-5 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 relative z-10">
                                <i className="fas fa-satellite-dish animate-pulse"></i>
                            </div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Geofence Protocol</div>
                                <p className="text-xs font-bold text-textSecondary leading-relaxed uppercase tracking-wider">Movement is authenticated via campus mesh network triangulation. Secure WiFi connection required.</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-2xl font-black text-textPrimary tracking-tight italic font-heading">Historical Logs</h2>
                            <div className="w-10 h-10 bg-surface/50 rounded-xl flex items-center justify-center text-textSecondary border border-white/5">
                                <i className="fas fa-list-timeline text-sm"></i>
                            </div>
                        </div>
                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {logs.map(log => (
                                <div key={log.id} className="bg-surface/20 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl shadow-black/20 flex items-center gap-8 group hover:border-primary/50 transition-all relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 relative z-10 shadow-2xl ${log.type === 'IN' ? 'bg-success/20 text-success shadow-success/10' : 'bg-danger/20 text-danger shadow-danger/10'}`}>
                                        <i className={`fas fa-arrow-${log.type === 'IN' ? 'right-to-bracket' : 'right-from-bracket'} group-hover:rotate-12 transition-transform`}></i>
                                    </div>
                                    <div className="relative z-10 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-black text-textPrimary italic text-base tracking-tighter uppercase">{log.type}bound Phase</div>
                                            <div className="text-[10px] font-black text-textSecondary opacity-50 uppercase tracking-[0.2em]">{log.location}</div>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] font-black text-primary uppercase tracking-[0.1em]">
                                            <i className="far fa-clock-three"></i>
                                            {log.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GateTiming;
