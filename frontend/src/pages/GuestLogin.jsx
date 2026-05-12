import { Link } from 'react-router-dom';

const GuestLogin = () => {
    return (
        <div className="flex items-center justify-center transition-all p-6 flex-1 min-h-[calc(100vh-80px)] bg-background">
            <div className="max-w-4xl w-full bg-surface/40 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl shadow-black/50 flex flex-col md:flex-row overflow-hidden border border-white/5 animate-in fade-in zoom-in duration-700 relative">

                {/* Dark Sidebar in Card */}
                <div className="w-full md:w-96 bg-surface p-16 text-white flex flex-col justify-between relative overflow-hidden border-r border-white/5">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.1),transparent)] pointer-events-none"></div>
                    <div className="relative z-10">
                        <Link to="/login" className="flex items-center gap-3 text-textSecondary hover:text-primary transition-all mb-16 group">
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Portal Selection</span>
                        </Link>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/30 animate-float">
                                <i className="fas fa-coffee text-2xl text-white"></i>
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter">Hostel<span className="text-primary">Mate</span></h2>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-10">Visitor Terminal</p>
                        <p className="text-textSecondary text-base leading-relaxed mb-16 font-medium">Temporary residency access. Initialize your visit or track your active stay application.</p>
                    </div>
                </div>

                <div className="flex-1 p-12 md:p-20 relative bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03),transparent)] flex flex-col justify-center text-center">
                    <h3 className="text-4xl font-black text-textPrimary tracking-tighter italic font-heading mb-4">Transient Node</h3>
                    <p className="text-textSecondary text-[10px] font-black uppercase tracking-[0.2em] mb-12 flex items-center justify-center gap-2">
                        <i className="fas fa-satellite-dish animate-pulse"></i>
                        Open Frequency Access
                    </p>

                    <Link to="/guest" className="group relative w-full bg-primary text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-primary-hover shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <span className="relative z-10">Enter Visitor Matrix <i className="fas fa-arrow-right ml-2 group-hover:translate-x-2 transition-transform"></i></span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GuestLogin;
