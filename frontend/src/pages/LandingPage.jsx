import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Building2,
  Clock,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Volume2,
  Sparkles,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Full-Page Background Queue Flow Curve (Zero Card Container)                */
/* -------------------------------------------------------------------------- */
const BackgroundQueueJourney = () => {
  return (
    <div className="absolute inset-0 w-full h-[720px] sm:h-[800px] overflow-hidden pointer-events-none z-0">
      <svg
        viewBox="0 0 1440 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full opacity-65 dark:opacity-35 transition-opacity"
      >
        <defs>
          {/* Main Wave Gradient */}
          <linearGradient id="queueFlowGrad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#184E38" stopOpacity="0.1" />
            <stop offset="20%" stopColor="#184E38" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#D95D39" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#10B981" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
          </linearGradient>

          {/* Soft Wave Glow */}
          <linearGradient id="queueFlowGlow" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#184E38" stopOpacity="0" />
            <stop offset="25%" stopColor="#184E38" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#D95D39" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="waveBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Blurred Shadow Curve */}
        <path
          d="M -60 400 C 260 500, 480 270, 720 370 C 960 470, 1180 250, 1500 350"
          stroke="url(#queueFlowGlow)"
          strokeWidth="16"
          fill="none"
          filter="url(#waveBlur)"
        />

        {/* Delicate Secondary Echo Dashed Line */}
        <path
          d="M -60 415 C 260 515, 480 285, 720 385 C 960 485, 1180 265, 1500 365"
          stroke="currentColor"
          className="text-[#184E38]/20 dark:text-emerald-500/15"
          strokeWidth="1"
          strokeDasharray="4 6"
          fill="none"
        />

        {/* Primary Flowing Journey Curve */}
        <path
          d="M -60 400 C 260 500, 480 270, 720 370 C 960 470, 1180 250, 1500 350"
          stroke="url(#queueFlowGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Traveling Energy Pulse Along Path */}
        <motion.circle
          r="5.5"
          className="fill-[#184E38] dark:fill-emerald-400"
          animate={{
            cx: [-60, 200, 480, 720, 960, 1200, 1500],
            cy: [400, 455, 290, 370, 450, 275, 350],
            scale: [0.8, 1.25, 0.9, 1.3, 0.9, 1.2, 0.8],
          }}
          transition={{
            duration: 8.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Waypoint 1: Joined */}
        <g transform="translate(240, 455)">
          <circle r="16" className="fill-[#184E38]/10 dark:fill-emerald-400/10" />
          <circle r="8" className="fill-[#FAF8F3] dark:fill-[#151D18] stroke-[#184E38] dark:stroke-emerald-400" strokeWidth="2.5" />
          <circle r="3" className="fill-[#184E38] dark:fill-emerald-400" />
          <text
            y="26"
            textAnchor="middle"
            className="fill-[#59665F] dark:fill-stone-400 font-mono text-[10px] font-semibold tracking-wider uppercase"
          >
            Joined Remotely
          </text>
        </g>

        {/* Waypoint 2: Roaming & Saved Time */}
        <g transform="translate(720, 370)">
          <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
            <circle r="18" className="fill-[#D95D39]/15" />
            <circle r="9" className="fill-[#FAF8F3] dark:fill-[#151D18] stroke-[#D95D39]" strokeWidth="2.5" />
            <circle r="3.5" className="fill-[#D95D39]" />
            <text
              y="-16"
              textAnchor="middle"
              className="fill-[#D95D39] font-mono text-[10px] font-bold tracking-wider uppercase"
            >
              12 min saved • Roaming
            </text>
          </motion.g>
        </g>

        {/* Waypoint 3: Now Serving & Chime */}
        <g transform="translate(1220, 275)">
          <motion.circle
            r="16"
            stroke="#10B981"
            strokeWidth="1.5"
            fill="none"
            animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <circle r="18" className="fill-emerald-500/15" />
          <circle r="9" className="fill-[#FAF8F3] dark:fill-[#151D18] stroke-emerald-500" strokeWidth="2.5" />
          <circle r="3.5" className="fill-emerald-500" />
          <text
            y="26"
            textAnchor="middle"
            className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[10px] font-bold tracking-wider uppercase"
          >
            Your Turn • Window 03
          </text>
        </g>
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Landing Page                                                          */
/* -------------------------------------------------------------------------- */
export const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chimePlayed, setChimePlayed] = useState(false);
  const navigate = useNavigate();

  const playPreviewChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
      setChimePlayed(true);
      setTimeout(() => setChimePlayed(false), 2000);
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/customer/organizations?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/customer');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F2EB] text-[#1C2520] dark:bg-[#131B17] dark:text-[#E8EFEA] selection:bg-[#184E38] selection:text-white overflow-hidden transition-colors duration-200">
      {/* Ambient Floating Glow Blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-[#EBE4D5]/70 dark:bg-[#184E38]/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, 40, -10, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-36 w-[450px] h-[450px] bg-[#E8E0CE]/60 dark:bg-[#184E38]/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, -30, 15, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Full-Page Background Queue Wave Curve (Spanning seamlessly in background) */}
      <BackgroundQueueJourney />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F3]/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-[#3F6451] dark:text-[#A7D7BC] text-[11px] font-bold tracking-[0.2em] uppercase mb-8 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
            <span>MORE TIME FOR WHAT MATTERS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#184E38] dark:bg-[#A7D7BC] animate-ping" />
          </motion.div>

          {/* Editorial Serif Heading */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-[76px] font-normal text-[#1A231E] dark:text-white leading-[1.06] tracking-tight">
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Your day shouldn’t
            </motion.span>{' '}
            <br className="hidden sm:inline" />
            <motion.span
              className="inline-block text-[#184E38] dark:text-[#A7D7BC] italic font-serif"
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              have to stand still.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 text-base sm:text-xl text-[#59665F] dark:text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Join queues remotely with zero app downloads or accounts. We keep your spot safe and chime when it’s your turn.
          </motion.p>

          {/* Search Bar for Customer Queues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <form
              onSubmit={handleSearch}
              className="p-2 bg-white dark:bg-stone-900 rounded-2xl shadow-soft-float border border-stone-200/80 dark:border-stone-800 flex items-center gap-2 transition-all hover:shadow-soft-lift"
            >
              <div className="pl-3 text-[#184E38] dark:text-[#A7D7BC]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clinics, salons, diagnostic centers..."
                className="flex-1 px-2 py-2 text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-400 bg-transparent focus:outline-none"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden px-5 py-2.5 bg-[#184E38] hover:bg-[#123E2C] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Find Queue
              </motion.button>
            </form>
          </motion.div>

          {/* Action Links */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-medium"
          >
            <Link
              to="/customer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[#37433C] dark:text-stone-200 hover:text-[#184E38] dark:hover:text-white bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 rounded-xl shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-[#184E38] dark:text-[#A7D7BC]" />
              <span>Browse All Queues</span>
            </Link>
            <Link
              to="/organization/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[#184E38] dark:text-[#E2EDE7] bg-[#E2EDE7]/70 dark:bg-[#184E38]/30 hover:bg-[#E2EDE7] dark:hover:bg-[#184E38]/50 border border-[#C5DCCF]/80 dark:border-[#2D5A43] rounded-xl transition-all active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Business Owner Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Audio Chime Preview Trigger */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6 flex justify-center"
          >
            <button
              type="button"
              onClick={playPreviewChime}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-800/80 border border-stone-200/80 dark:border-stone-800 text-xs text-[#3F6451] dark:text-[#A7D7BC] font-medium shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
              title="Click to test harmonic airport chime sound"
            >
              <Volume2 className={`w-3.5 h-3.5 ${chimePlayed ? 'text-emerald-600 animate-bounce' : ''}`} />
              <span>{chimePlayed ? 'Chime Broadcasted!' : 'Test Airport Chime'}</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white/70 dark:bg-stone-900/60 border-t border-stone-200/80 dark:border-stone-800 transition-colors duration-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
              SEAMLESS 3-STEP EXPERIENCE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-2 tracking-tight">
              How Kuefy works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#59665F] dark:text-stone-400">
              Designed for physical businesses and modern customers who value their time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#FAF8F3]/90 dark:bg-stone-900/90 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:shadow-soft-float transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] flex items-center justify-center mb-6 font-mono font-bold text-lg border border-[#C5DCCF]/70 dark:border-[#2D5A43]">
                01
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white mb-2">
                Scan or Find Online
              </h3>
              <p className="text-sm text-[#59665F] dark:text-stone-400 leading-relaxed">
                Scan the counter QR standee or search your favorite clinic, salon, or service center online. No app download needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF8F3]/90 dark:bg-stone-900/90 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:shadow-soft-float transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] flex items-center justify-center mb-6 font-mono font-bold text-lg border border-[#C5DCCF]/70 dark:border-[#2D5A43]">
                02
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white mb-2">
                Live Turn Tracker
              </h3>
              <p className="text-sm text-[#59665F] dark:text-stone-400 leading-relaxed">
                Get a digital boarding pass on your mobile. Your live queue position and estimated wait time update smoothly in real time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF8F3]/90 dark:bg-stone-900/90 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:shadow-soft-float transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] flex items-center justify-center mb-6 font-mono font-bold text-lg border border-[#C5DCCF]/70 dark:border-[#2D5A43]">
                03
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white mb-2">
                Audible Chime Alert
              </h3>
              <p className="text-sm text-[#59665F] dark:text-stone-400 leading-relaxed">
                When your ticket is called by the counter staff, a gentle chime plays and your screen notifies you to step right in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
            ENGINEERED FOR SPEED
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-2 tracking-tight">
            Built for peace of mind
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
            <Smartphone className="w-6 h-6 text-[#184E38] dark:text-[#A7D7BC] mb-4" />
            <h3 className="font-serif text-lg font-normal text-[#1A231E] dark:text-white mb-2">
              Zero Friction Guest Entry
            </h3>
            <p className="text-xs text-[#59665F] dark:text-stone-400 leading-relaxed">
              Customers just enter their name and phone number. No passwords, no accounts, no app downloads.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
            <Zap className="w-6 h-6 text-[#184E38] dark:text-[#A7D7BC] mb-4" />
            <h3 className="font-serif text-lg font-normal text-[#1A231E] dark:text-white mb-2">
              Live WebSocket Sync
            </h3>
            <p className="text-xs text-[#59665F] dark:text-stone-400 leading-relaxed">
              Instant position sync across counter staff consoles, customer mobile screens, and lounge TVs.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
            <Clock className="w-6 h-6 text-[#184E38] dark:text-[#A7D7BC] mb-4" />
            <h3 className="font-serif text-lg font-normal text-[#1A231E] dark:text-white mb-2">
              High-Velocity Operator Desk
            </h3>
            <p className="text-xs text-[#59665F] dark:text-stone-400 leading-relaxed">
              Counter staff can call next, serve, and complete tickets with keyboard shortcuts in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="bg-[#184E38] rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-soft-lift">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
              Ready to eliminate waiting lines forever?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#C5DCCF]">
              Set up your business queues in 3 minutes. Zero setup fees, instant virtual lines.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/organization/register"
                className="px-6 py-3 bg-[#FAF8F3] hover:bg-white text-[#184E38] text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95"
              >
                Register Your Business
              </Link>
              <Link
                to="/customer"
                className="px-6 py-3 bg-[#2D5A43] hover:bg-[#3F6451] text-white text-sm font-semibold rounded-xl transition-all border border-[#5E987B]/40 active:scale-95"
              >
                Explore Live Queues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
