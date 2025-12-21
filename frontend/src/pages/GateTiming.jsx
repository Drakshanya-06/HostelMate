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
        alert(`Successfully logged ${type} at ${newLog.time}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-300 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Link to="/student" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4 group">
                            <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gate Intelligence</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium italic">HostelMate Secure Entry & Exit System</p>
                    </div>
                    <div className="bg-indigo-600 px-6 py-3 rounded-2xl text-white font-black text-sm shadow-xl shadow-indigo-500/20">
                        Current Status: <span className="uppercase tracking-widest">{status === 'IN' ? '🏡 Resident In' : '🏃 Resident Out'}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Activity Controls */}
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Log Movement</h2>
                        <div className="space-y-6">
                            <button
                                onClick={() => handleMovement('OUT')}
                                disabled={status === 'OUT'}
                                className={`w-full group p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between ${status === 'IN'
                                    ? 'border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-500 cursor-pointer'
                                    : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'}`}
                            >
                                <div className="text-left">
                                    <div className="text-rose-600 font-black uppercase text-xs tracking-widest mb-1">Outward</div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform">Check Out</div>
                                </div>
                                <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
                                    <i className="fas fa-sign-out-alt"></i>
                                </div>
                            </button>

                            <button
                                onClick={() => handleMovement('IN')}
                                disabled={status === 'IN'}
                                className={`w-full group p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between ${status === 'OUT'
                                    ? 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-500 cursor-pointer'
                                    : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'}`}
                            >
                                <div className="text-left">
                                    <div className="text-emerald-600 font-black uppercase text-xs tracking-widest mb-1">Inward</div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform">Check In</div>
                                </div>
                                <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
                                    <i className="fas fa-sign-in-alt"></i>
                                </div>
                            </button>
                        </div>
                        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex items-start gap-3">
                            <i className="fas fa-circle-info text-amber-500 mt-0.5"></i>
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-wide">Movement is tracked via hostel campus WiFi geolocation. Please ensure you are logged into the network.</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight px-4">Recent Movement Logs</h2>
                        <div className="space-y-4">
                            {logs.map(log => (
                                <div key={log.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center gap-6 group hover:border-indigo-500 transition-all">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${log.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        <i className={`fas fa-arrow-${log.type === 'IN' ? 'right-to-bracket' : 'right-from-bracket'}`}></i>
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-slate-900 dark:text-white mb-1 uppercase text-xs tracking-widest">{log.type}WARD PASS</div>
                                        <div className="text-sm font-bold text-slate-500 tracking-tight">{log.time}</div>
                                        <div className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{log.location}</div>
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
