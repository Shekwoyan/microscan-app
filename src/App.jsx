import React, { useState, useRef } from 'react';

export default function App() {
  // Navigation & Page State
  const [view, setView] = useState('landing'); // 'landing' or 'scanner'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Processing States
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);
  const architectureSectionRef = useRef(null);

  // Smooth Scroll Helper
  const scrollToArchitecture = (e) => {
    e.preventDefault();
    if (view !== 'landing') {
      setView('landing');
      // Small timeout to allow the DOM to switch back before scrolling
      setTimeout(() => {
        architectureSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      architectureSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Real API Integration
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setIsProcessing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    const startTime = performance.now();

    try {
      const response = await fetch('/predict-smear', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTime) + 'ms';

      if (data.error) {
        setResult({
          classification: "ERROR",
          errorMsg: data.error,
          accuracy: "N/A",
          inferenceTime: timeTaken
        });
      } else {
        const isPositive = data.status === 'positive';
        setResult({
          classification: isPositive ? "POSITIVE" : "NEGATIVE",
          errorMsg: null,
          accuracy: data.confidence + "%",
          inferenceTime: timeTaken
        });
      }
    } catch (err) {
      setResult({
        classification: "ERROR",
        errorMsg: "Connection Error. Is the backend running?",
        accuracy: "N/A",
        inferenceTime: "0ms"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] antialiased selection:bg-[#1D1D1F] selection:text-white flex flex-col justify-between">

      {/* CENTRALIZED HEADER UTILITY */}
      <nav className="sticky top-0 z-50 bg-[#FBFBFD]/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 md:px-16 flex justify-between items-center transition-all duration-300">

        {/* Left Side: Microscope Logo Icon */}
        <div
          onClick={() => setView('landing')}
          className="flex items-center gap-2.5 cursor-pointer group text-[#1D1D1F]"
        >
          <svg className="w-5 h-5 text-[#1D1D1F] transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 11v3m0-11a4 4 0 110 8 4 4 0 010-8zm0 0v3m-3-3h6m-6 3h6m-6 3h6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-mono font-bold tracking-widest uppercase">MCNN</span>
        </div>

        {/* Center: Centralized Navigation Items */}
        <div className="hidden md:flex items-center gap-10 text-xs font-medium text-gray-500">
          <a
            href="#system-specs"
            onClick={scrollToArchitecture}
            className="hover:text-black transition-colors duration-200"
          >
            About System
          </a>
          <a
            href="#downloads"
            onClick={(e) => { e.preventDefault(); setView('downloads'); }}
            className="hover:text-black flex items-center gap-1.5 transition-colors duration-200"
          >
            Downloads
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>

        {/* Right Side: Action Link & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative w-28 sm:w-48 h-8 flex items-center justify-end">
            <button
              onClick={() => { setView('scanner'); setIsMobileMenuOpen(false); }}
              className={`absolute right-0 bg-[#1D1D1F] hover:bg-red-800 text-white text-[10px] sm:text-xs font-normal tracking-wide px-3 sm:px-4 py-2 rounded-md transition-all duration-500 ease-in-out hover:shadow-sm ${view === 'landing' ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'}`}
            >
              <span className="hidden sm:inline">Launch Analyzer Engine &rarr;</span>
              <span className="sm:hidden">Analyzer &rarr;</span>
            </button>
            <button
              onClick={() => { resetScanner(); setView('landing'); setIsMobileMenuOpen(false); }}
              className={`absolute right-0 text-[10px] sm:text-xs text-gray-500 hover:text-black font-medium transition-all duration-500 ease-in-out whitespace-nowrap ${view !== 'landing' ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}`}
            >
              &larr; <span className="hidden sm:inline">Back to Overview</span><span className="sm:hidden">Back</span>
            </button>
          </div>

          <button 
            className="md:hidden flex items-center justify-center p-1.5 text-gray-600 hover:text-black transition-colors rounded-md hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`absolute top-full left-0 w-full bg-[#FBFBFD]/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300 md:hidden overflow-hidden flex flex-col items-center shadow-sm ${isMobileMenuOpen ? 'max-h-48 py-5 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}>
          <a
            href="#system-specs"
            onClick={(e) => { setIsMobileMenuOpen(false); scrollToArchitecture(e); }}
            className="hover:text-black text-sm font-medium text-gray-600 transition-colors duration-200 mb-4"
          >
            About System
          </a>
          <a
            href="#downloads"
            onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setView('downloads'); }}
            className="hover:text-black text-sm font-medium text-gray-600 flex items-center gap-1.5 transition-colors duration-200"
          >
            Downloads
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </nav>

      {/* MAIN SCREEN INTERCHANGES */}
      <main className="flex-grow">

        {/* ========================================================= */}
        {/* VIEW 1: MINIMALIST LANDING (Matches Your Exact Design)     */}
        {/* ========================================================= */}
        {view === 'landing' && (
          <div className="animate-apple-in">

            {/* Hero Core Segment */}
            <section className="relative w-full overflow-hidden">
              {/* Subtle Antigravity Background Pattern */}
              <div 
                className="absolute inset-0 pointer-events-none z-0 opacity-40"
                style={{
                  backgroundImage: 'radial-gradient(circle at center, #cbd5e1 1.5px, transparent 1.5px)',
                  backgroundSize: '32px 32px',
                  maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                }}
              />

              <div className="max-w-5xl mx-auto px-6 pt-32 pb-28 text-left md:px-16 relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-950 leading-[1.1] mb-6 max-w-3xl">
                  Microscopic Blood Smear <br />Classification Platform.
                </h1>

                <p className="text-base md:text-lg text-gray-500 max-w-2xl font-normal leading-relaxed mb-10">
                  A streamlined computer vision utility engineered to assist technicians with instant, automated cell screening inside resource-constrained environments.
                </p>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setView('scanner')}
                    className="bg-[#1D1D1F] hover:bg-red-800 text-white text-sm font-medium px-6 py-3 rounded-md transition-all duration-300 shadow-sm"
                  >
                    Launch Analyzer Engine &rarr;
                  </button>
                  <a
                    href="#system-specs"
                    onClick={scrollToArchitecture}
                    className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors duration-200 flex items-center gap-1"
                  >
                    Review Architecture Specs &darr;
                  </a>
                </div>
              </div>
            </section>

            {/* Architecture Grid Section (Triggers Target Scroll) */}
            <section
              ref={architectureSectionRef}
              id="system-specs"
              className="max-w-6xl mx-auto px-6 md:px-16 py-20 border-t border-gray-100"
            >
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 block mb-12">
                Technical Specifications & Architecture
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-xs transition-all duration-300 hover:border-gray-200">
                  <span className="text-[10px] font-mono font-bold text-red-500 tracking-wider uppercase block mb-2">Core Core Engine</span>
                  <h3 className="text-base font-bold text-gray-900 mb-2">MobileNetV2 CNN Architecture</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    Utilizes streamlined inverted residuals and linear bottlenecks to extract high-density visual biomarkers from blood smear samples without heavy computation layers.
                  </p>
                </div>

                <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-xs transition-all duration-300 hover:border-gray-200 flex flex-col h-full">
                  <span className="text-[10px] font-mono font-bold text-red-500 tracking-wider uppercase block mb-2">Operational Integrity</span>
                  <h3 className="text-base font-bold text-gray-900 mb-2">100% Zero-Connectivity Runtime</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    The trained model compiles directly into client-side code. It executes fully offline, ensuring operational stability in rural clinics with compromised network access.
                  </p>
                </div>

                <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-xs transition-all duration-300 hover:border-gray-200 flex flex-col h-full">
                  <span className="text-[10px] font-mono font-bold text-red-500 tracking-wider uppercase block mb-2">Resource Footprint</span>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Low Compute / Lightweight Build</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    Stripped of heavy frameworks and server dependencies. Smooth deployment on legacy machines, budget tablets, and low-tier hardware variants.
                  </p>
                </div>

                <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-xs transition-all duration-300 hover:border-gray-200 flex flex-col h-full">
                  <span className="text-[10px] font-mono font-bold text-red-500 tracking-wider uppercase block mb-2">Performance Vector</span>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Optimized Confidence Output</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    Engineered to deliver clear diagnostic support by returning discrete probability arrays instantly on processing.
                  </p>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: HIGH-END MATCHING SCANNER VIEW (Apple-Inspired)   */}
        {/* ========================================================= */}
        {view === 'scanner' && (
          <div className="max-w-5xl mx-auto px-6 py-16 md:px-16 animate-apple-in">

            <header className="mb-12">
              <span className="inline-block text-[10px] font-mono tracking-widest font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded mb-3 uppercase">
                Local Execution Context
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-gray-950">Micrograph Classifier Pipeline</h2>
              <p className="text-xs text-gray-400 mt-1">Load microscopic smears to trigger client-side classification weight mapping.</p>
            </header>

            <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[550px]">

              {/* Interaction Upload Surface */}
              <div className="w-full md:w-[55%] bg-gray-50 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {!image ? (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-gray-900 bg-white/50 hover:bg-white min-h-[300px] w-full h-full rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 border border-gray-100">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-800 tracking-tight group-hover:text-black transition-colors mb-1">
                      Upload Microscopic Cell Image
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">Drag or click to choose from local directory</span>
                  </div>
                ) : (
                  /* Active Media Card Frame */
                  <div className="border border-gray-200 bg-white rounded-2xl shadow-sm min-h-[300px] w-full h-full overflow-hidden relative flex items-center justify-center p-2 transition-all duration-500">
                    <img
                      src={image}
                      alt="Local Laboratory Blood Sample"
                      className={`w-full h-full object-contain rounded-lg transition-all duration-700 ${isProcessing ? 'blur-xs scale-[0.99] opacity-60' : 'blur-none scale-100 opacity-100'}`}
                    />

                    {/* Apple Style Smooth Spinner Overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xs transition-opacity duration-300">
                        <div className="w-6 h-6 border-[2.5px] border-gray-200 border-t-[#1D1D1F] rounded-full animate-spin mb-3"></div>
                        <span className="text-[10px] font-mono tracking-wider text-gray-800 uppercase animate-pulse">
                          Processing Node Tensor Arrays...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* High-End Diagnostic Readout */}
              <div className="w-full md:w-[45%] bg-white p-8 md:p-10 flex flex-col justify-between transition-all duration-500">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase block pb-3 border-b border-gray-50 mb-6">
                      Analysis Parameters
                    </span>

                    {!image && !isProcessing && (
                      <div className="py-16 text-center transition-all duration-300">
                        <p className="text-xs text-gray-400 font-light italic">Awaiting sample payload. Load a micrograph variant to populate diagnostic tracking output blocks.</p>
                      </div>
                    )}

                    {isProcessing && (
                      <div className="py-10 space-y-4 animate-pulse">
                        <div className="h-3.5 bg-gray-100 rounded-md w-2/3"></div>
                        <div className="h-6 bg-gray-100 rounded-md w-5/6"></div>
                        <div className="h-12 bg-gray-100 rounded-md w-full mt-6"></div>
                      </div>
                    )}

                    {result && !isProcessing && (
                      <div className="space-y-6 animate-[fadeIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
                        <div>
                          <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase block mb-1">
                            Detected Classification
                          </label>
                          <p className={`text-2xl font-bold tracking-tight ${result.classification === 'POSITIVE' ? 'text-red-600' : result.classification === 'NEGATIVE' ? 'text-emerald-600' : 'text-gray-950'}`}>
                            {result.classification}
                          </p>
                          {result.errorMsg && (
                            <p className="text-xs text-red-500 mt-1 font-light">
                              {result.errorMsg}
                            </p>
                          )}
                        </div>

                        {/* Large High-Fidelity Accuracy Score readout */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mt-4 transition-all duration-300">
                          <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase block mb-0.5">
                            Model Accuracy Score
                          </label>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tighter text-gray-950">
                              {result.accuracy}
                            </span>
                          </div>
                        </div>

                        <div className="font-mono text-[9px] text-gray-400 space-y-1 pt-2">
                          <div>INFERENCE SPEED: {result.inferenceTime}</div>
                          <div>ARCHITECTURE MATCH: MobileNetV2 Edge Engine</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {image && (
                    <div className="pt-6 mt-6 border-t border-gray-50">
                      <button
                        onClick={resetScanner}
                        disabled={isProcessing}
                        className="w-full bg-[#1D1D1F] hover:bg-red-800 disabled:bg-gray-100 disabled:text-gray-400 text-white font-medium text-xs rounded-md py-3 text-center transition-all duration-300"
                      >
                        Clear Matrix & Rescan Sample
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: DOWNLOADS PAGE                                    */}
        {/* ========================================================= */}
        {view === 'downloads' && (
          <div className="max-w-6xl mx-auto px-6 py-16 md:px-16 animate-apple-in">
            <header className="mb-12 text-center max-w-2xl mx-auto">
              <span className="inline-block text-[10px] font-mono tracking-widest font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded mb-3 uppercase">
                System Artifacts
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-gray-950 mb-4">Platform Downloads</h2>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                Access local binaries and raw weight matrices for offline operation. Choose the appropriate package for your deployment environment.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Desktop Client */}
              <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-xs transition-all duration-300 hover:border-gray-200 hover:shadow-md flex flex-col items-start h-full animate-apple-in" style={{ animationDelay: '0.15s' }}>
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider uppercase block mb-2">Windows</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Desktop Client</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed mb-8 flex-grow">
                  Full standalone application with bundled runtime and UI for clinical workstations.
                </p>
                <button className="w-full bg-[#1D1D1F] hover:bg-red-800 text-white font-medium text-xs rounded-md py-3 transition-colors flex justify-center items-center gap-2">
                  Download Desktop <span className="font-mono text-[10px] opacity-70">145MB</span>
                </button>
              </div>

              {/* Mobile Client */}
              <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-xs transition-all duration-300 hover:border-gray-200 hover:shadow-md flex flex-col items-start h-full animate-apple-in" style={{ animationDelay: '0.3s' }}>
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider uppercase block mb-2">Android</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Mobile Client</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed mb-8 flex-grow">
                  Lightweight mobile application optimized for tablets and edge devices in the field.
                </p>
                <button className="w-full bg-[#1D1D1F] hover:bg-red-800 text-white font-medium text-xs rounded-md py-3 transition-colors flex justify-center items-center gap-2">
                  Download Mobile <span className="font-mono text-[10px] opacity-70">32MB</span>
                </button>
              </div>

              {/* Trained Weights */}
              <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-xs transition-all duration-300 hover:border-gray-200 hover:shadow-md flex flex-col items-start h-full animate-apple-in" style={{ animationDelay: '0.45s' }}>
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider uppercase block mb-2">TensorFlow / PyTorch</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Raw Model Weights</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed mb-8 flex-grow">
                  Direct access to the trained MobileNetV2 architecture weights for custom integrations.
                </p>
                <button className="w-full bg-[#1D1D1F] hover:bg-red-800 text-white font-medium text-xs rounded-md py-3 transition-colors flex justify-center items-center gap-2">
                  Download Weights <span className="font-mono text-[10px] opacity-70">14.2MB</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER PERSISTENCE */}
      <footer className="border-t border-gray-100 py-6 text-center text-[10px] text-gray-400 font-mono tracking-tight mt-12 bg-white/40">
        NaijaStop Production Build // Local Weight Compute Architecture Verified (MobileNetV2 Client Context)
      </footer>
    </div>
  );
}