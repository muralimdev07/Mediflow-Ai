import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 scroll-smooth selection:bg-teal-200">
      
      {/* ========================================================================= */}
      {/* 1. NAVBAR (Exact Old Design Preserved)                                   */}
      {/* ========================================================================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <a href="#home" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition">
                +
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">MediFlow</span>
            </a>

            {/* Menu Links (Smooth Scroll to IDs) */}
            <div className="hidden md:flex items-center space-x-10 text-[15px] font-medium">
              <a href="#home" className="text-teal-700 font-semibold hover:text-teal-800 transition">
                Home
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-teal-700 transition">
                How It Works
              </a>
              <a href="#about-us" className="text-gray-600 hover:text-teal-700 transition">
                About Us
              </a>
            </div>

            {/* CTA Button -> Triggers Portal View */}
            <div>
              <button 
                onClick={onGetStarted}
                className="bg-teal-700 hover:bg-teal-800 text-white px-7 py-2.5 rounded-full font-medium transition shadow-md shadow-teal-700/20 active:scale-95"
              >
                Get Started
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. SECTION 1: HOME / HERO SECTION                                        */}
      {/* ========================================================================= */}
      <section id="home" className="pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            Smart Healthcare Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-8">
            Smart Hospital Queue & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600">
              Patient Flow Management
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Eliminate crowded waiting rooms with automated AI triage routing, real-time token tracking, and instant digital check-ins.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition shadow-xl shadow-teal-700/20 flex items-center justify-center gap-2 active:scale-95"
            >
              Launch System Demo 
              <span>→</span>
            </button>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition text-center shadow-sm"
            >
              Explore Workflow
            </a>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-gray-200/80">
            <div>
              <p className="text-3xl font-extrabold text-teal-700">70%</p>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">Reduced Wait Time</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-teal-700">Zero</p>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">Paper Queue Slips</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-teal-700">&lt; 2s</p>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">AI Triage Speed</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-teal-700">100%</p>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">Live ETA Accuracy</p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 2: HOW IT WORKS (Sticky Storyteller Flow)                      */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start relative">
            
            {/* Left Sticky Header */}
            <div className="lg:w-5/12 lg:sticky lg:top-36 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-[2px] w-8 bg-teal-600"></div>
                <span className="text-xs font-bold text-teal-700 tracking-widest uppercase">
                  The MediFlow Journey
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-gray-900 mb-6">
                The Patient <br /> Experience, <br />
                <span className="text-teal-700">Reimagined.</span>
              </h2>

              <p className="text-base sm:text-lg text-gray-500 max-w-md leading-relaxed mb-8">
                Scroll to see how our AI-powered flow management eliminates waiting room chaos and connects patients to care instantly.
              </p>

              <button 
                onClick={onGetStarted}
                className="bg-gray-900 hover:bg-gray-800 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition flex items-center gap-2 shadow-lg"
              >
                Launch System Demo →
              </button>
            </div>

            {/* Right Scrollable Cards */}
            <div className="lg:w-7/12 flex flex-col space-y-20 w-full">
              
              {/* STEP 1 */}
              <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300">
                <span className="bg-teal-100 text-teal-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  STEP 1
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-2">Smart Check-In</h3>
                <p className="text-gray-500 text-sm sm:text-base mb-6">
                  Patients scan a dynamic QR code at the entrance or book online. Zero reception line delay.
                </p>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col items-center justify-center h-56 shadow-sm">
                  <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-3 border border-teal-100">
                    📱
                  </div>
                  <span className="font-bold text-gray-800 text-sm">Scan QR Code to Check In</span>
                  <span className="text-xs text-gray-400 mt-1">Instant digital token generated</span>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300">
                <span className="bg-purple-100 text-purple-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  STEP 2
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-2">AI Triage & Prioritization</h3>
                <p className="text-gray-500 text-sm sm:text-base mb-6">
                  Our algorithm analyzes symptoms to route critical emergencies directly to available doctors.
                </p>

                <div className="bg-[#0f172a] rounded-2xl p-5 border border-gray-800 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center bg-gray-800/60 p-3 rounded-lg border border-gray-700">
                    <span className="text-gray-200 font-medium">PT-45: Chest Pain & Dizziness</span>
                    <span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded font-bold">🔴 EMERGENCY (CABIN 1)</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-800/60 p-3 rounded-lg border border-gray-700">
                    <span className="text-gray-200 font-medium">PT-46: Routine Consultation</span>
                    <span className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded font-bold">🟢 WAITING (CABIN 3)</span>
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300">
                <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  STEP 3
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-2">Live Real-Time Tracker</h3>
                <p className="text-gray-500 text-sm sm:text-base mb-6">
                  Patients monitor real-time queue position and estimated wait times on their phones from anywhere.
                </p>

                <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl p-6 text-white text-center shadow-lg flex flex-col items-center">
                  <p className="text-xs uppercase tracking-widest text-teal-200 font-bold">Your Live Queue Token</p>
                  <p className="text-5xl font-black my-2">#46</p>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-medium text-teal-100 mt-2">
                    Serving #45 • Estimated Wait: 12 Mins
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 3: ABOUT US (Why MediFlow & Architecture)                     */}
      {/* ========================================================================= */}
      <section id="about-us" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            About The Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Built for High-Velocity Modern Hospitals
          </h2>
          <p className="text-gray-500 mt-4 text-base sm:text-lg">
            MediFlow replaces outdated paper token dispensaries with an end-to-end cloud-native system connecting patients, doctors, and triage desks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl mb-6">
              ⚡
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">WebSocket Live Sync</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Instant sub-second queue status propagation across waiting room TV boards, doctor tablets, and patient phones.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl mb-6">
              💳
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Integrated Payments</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Razorpay integration for cashless consultation booking, automated refunds, and frictionless billing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl mb-6">
              🏥
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Multi-Department Triage</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Dynamic workload balancing between General Medicine, Cardiology, Ortho, and Emergency Trauma wards.
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold">
              +
            </div>
            <span className="font-bold text-gray-900">MediFlow Healthcare Systems</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} MediFlow Platform. Smart Queue & Patient Flow Management.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;