import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  // Navigation & Page State
  const [view, setView] = useState('landing');
  const [activeCard, setActiveCard] = useState(null); // Tracks the tapped card on mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Processing States
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingText, setLoadingText] = useState("Scanning Image...");

  useEffect(() => {
    let interval;
    if (isProcessing) {
      const texts = ["Initializing...", "Scanning Image...", "Analyzing Smear..."];
      let i = 0;
      setLoadingText(texts[0]);
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const fileInputRef = useRef(null);
  const architectureSectionRef = useRef(null);
  const footerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // Footer Observer for button color inversion
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    // Timeout ensures DOM is mounted, especially if swapping views
    setTimeout(() => {
      if (footerRef.current) observer.observe(footerRef.current);
    }, 100);
    return () => observer.disconnect();
  }, [view]);

  // Scroll Event Listener for the Scroll-to-Top Button
  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down 300px
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Reveal Observer for staggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -150px 0px' }
    );

    setTimeout(() => {
      const elements = document.querySelectorAll('.scroll-reveal');
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [view]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            About
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

        {/* Right Side: Back Arrow, Developer Link & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/matthewtreasure17"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-black transition-colors duration-200 group"
          >
            <svg className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="opacity-80 group-hover:opacity-100">By Matthew</span>
          </a>

          {view !== 'landing' && (
            <button
              onClick={() => { resetScanner(); setView('landing'); setIsMobileMenuOpen(false); }}
              className="hidden md:flex items-center justify-center p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all animate-[fadeIn_0.3s_ease-out]"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}

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
            About
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

              <div className="max-w-5xl mx-auto px-6 pt-32 pb-28 text-left md:px-16 relative z-10 animate-apple-in" style={{ animationDelay: '100ms' }}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-950 leading-[1.1] mb-6 max-w-3xl">
                  Diagnostic-grade AI, <br />right in your pocket.
                </h1>

                <p className="text-base md:text-lg text-gray-500 max-w-2xl font-light leading-relaxed mb-10">
                  Upload high-magnification microscopy images and receive instant, clinically-aligned insights. Designed to bring state-of-the-art computer vision to any environment, completely offline.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <button
                    onClick={() => setView('scanner')}
                    className="bg-[#1D1D1F] hover:bg-black text-white text-sm font-medium px-8 py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Start Scanner &rarr;
                  </button>
                  <a
                    href="#system-specs"
                    onClick={(e) => { e.preventDefault(); scrollToArchitecture(); }}
                    className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors duration-200 flex items-center gap-1.5"
                  >
                    See how it works &darr;
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
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 block mb-12 scroll-reveal transition-all duration-700 ease-out">
                How It Works
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="scroll-reveal transition-all duration-500 ease-out" style={{ transitionDelay: '100ms' }}>
                  <div 
                    onClick={() => setActiveCard(activeCard === 1 ? null : 1)}
                    className={`group cursor-pointer bg-white border border-gray-100 p-8 rounded-xl shadow-xs relative select-none transition-all duration-300 ${activeCard === 1 ? 'shadow-xl border-gray-200 scale-[1.03] z-10' : 'md:hover:shadow-xl md:hover:border-gray-200 md:hover:scale-[1.03] md:hover:z-10'}`} 
                  >
                    <span className="text-[10px] font-mono font-bold text-red-500 tracking-wider uppercase block mb-2 transition-colors duration-300">The Brain</span>
                    <h3 className={`text-base font-bold mb-2 transition-colors duration-300 ${activeCard === 1 ? 'text-red-600' : 'text-gray-900 md:group-hover:text-red-600'}`}>Smart Image Recognition</h3>
                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                      MCNN uses a lightweight image recognition model to scan and identify cells in your blood smear images accurately and quickly.
                    </p>
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeCard === 1 ? 'max-h-40 opacity-100 mt-5' : 'max-h-0 opacity-0 md:group-hover:max-h-40 md:group-hover:opacity-100 md:group-hover:mt-5'}`}>
                      <p className="text-xs text-gray-400 font-normal leading-relaxed pt-4 border-t border-gray-100">
                        Behind the scenes, we use an optimized MobileNetV2 architecture that extracts complex visual patterns without requiring heavy computational resources.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="scroll-reveal transition-all duration-500 ease-out flex flex-col h-full" style={{ transitionDelay: '200ms' }}>
                  <div 
                    onClick={() => setActiveCard(activeCard === 2 ? null : 2)}
                    className={`group cursor-pointer bg-white border border-gray-100 p-8 rounded-xl shadow-xs relative flex flex-col h-full select-none transition-all duration-300 ${activeCard === 2 ? 'shadow-xl border-gray-200 scale-[1.03] z-10' : 'md:hover:shadow-xl md:hover:border-gray-200 md:hover:scale-[1.03] md:hover:z-10'}`} 
                  >
                    <span className="text-[10px] font-mono font-bold text-red-500 tracking-wider uppercase block mb-2 transition-colors duration-300">Privacy & Speed</span>
                    <h3 className={`text-base font-bold mb-2 transition-colors duration-300 ${activeCard === 2 ? 'text-red-600' : 'text-gray-900 md:group-hover:text-red-600'}`}>Works Completely Offline</h3>
                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                      Everything runs directly on your computer or phone. Your data never leaves your device, and you don't even need an internet connection.
                    </p>
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeCard === 2 ? 'max-h-40 opacity-100 mt-5' : 'max-h-0 opacity-0 md:group-hover:max-h-40 md:group-hover:opacity-100 md:group-hover:mt-5'}`}>
                      <p className="text-xs text-gray-400 font-normal leading-relaxed pt-4 border-t border-gray-100">
                        The trained model is compiled directly into local client-side code using modern browser APIs, ensuring total privacy and instant processing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="scroll-reveal transition-all duration-500 ease-out flex flex-col h-full" style={{ transitionDelay: '300ms' }}>
                  <div 
                    onClick={() => setActiveCard(activeCard === 3 ? null : 3)}
                    className={`group cursor-pointer bg-white border border-gray-100 p-8 rounded-xl shadow-xs relative flex flex-col h-full select-none transition-all duration-300 ${activeCard === 3 ? 'shadow-xl border-gray-200 scale-[1.03] z-10' : 'md:hover:shadow-xl md:hover:border-gray-200 md:hover:scale-[1.03] md:hover:z-10'}`} 
                  >
                    <span className="text-[10px] font-mono font-bold text-red-500 tracking-wider uppercase block mb-2 transition-colors duration-300">Accessibility</span>
                    <h3 className={`text-base font-bold mb-2 transition-colors duration-300 ${activeCard === 3 ? 'text-red-600' : 'text-gray-900 md:group-hover:text-red-600'}`}>Runs on Any Device</h3>
                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                      You don't need a supercomputer. MCNN is built to run smoothly on older laptops, tablets, and basic clinic computers.
                    </p>
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeCard === 3 ? 'max-h-40 opacity-100 mt-5' : 'max-h-0 opacity-0 md:group-hover:max-h-40 md:group-hover:opacity-100 md:group-hover:mt-5'}`}>
                      <p className="text-xs text-gray-400 font-normal leading-relaxed pt-4 border-t border-gray-100">
                        By completely stripping out heavy frameworks and server dependencies, the application footprint remains tiny for flawless execution on low-tier hardware.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="scroll-reveal transition-all duration-500 ease-out flex flex-col h-full" style={{ transitionDelay: '400ms' }}>
                  <div 
                    onClick={() => setActiveCard(activeCard === 4 ? null : 4)}
                    className={`group cursor-pointer bg-white border border-gray-100 p-8 rounded-xl shadow-xs relative flex flex-col h-full select-none transition-all duration-300 ${activeCard === 4 ? 'shadow-xl border-gray-200 scale-[1.03] z-10' : 'md:hover:shadow-xl md:hover:border-gray-200 md:hover:scale-[1.03] md:hover:z-10'}`} 
                  >
                    <span className="text-[10px] font-mono font-bold text-red-500 tracking-wider uppercase block mb-2 transition-colors duration-300">Results</span>
                    <h3 className={`text-base font-bold mb-2 transition-colors duration-300 ${activeCard === 4 ? 'text-red-600' : 'text-gray-900 md:group-hover:text-red-600'}`}>Clear, Simple Results</h3>
                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                      Instead of confusing numbers, the system gives you a simple positive or negative result along with how confident it is.
                    </p>
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeCard === 4 ? 'max-h-40 opacity-100 mt-5' : 'max-h-0 opacity-0 md:group-hover:max-h-40 md:group-hover:opacity-100 md:group-hover:mt-5'}`}>
                      <p className="text-xs text-gray-400 font-normal leading-relaxed pt-4 border-t border-gray-100">
                        The core engine abstracts complex discrete probability arrays into straightforward diagnostic support indicators designed for quick clinical decisions.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: HIGH-END MATCHING SCANNER VIEW (Apple-Inspired)   */}
        {/* ========================================================= */}
        {view === 'scanner' && (
          <div className="max-w-5xl mx-auto px-6 py-6 md:py-16 md:px-16 animate-apple-in">

            {/* Mobile Elegant Back Arrow */}
            <div className="md:hidden mb-6 -ml-2">
              <button
                onClick={() => { resetScanner(); setView('landing'); }}
                className="flex items-center gap-1 text-gray-500 font-medium text-sm hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>

            <header className="mb-12">
              <span className="inline-block text-[10px] font-mono tracking-widest font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded mb-3 uppercase">
                Secure Offline Scan
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-gray-950">Image Scanner</h2>
              <p className="text-xs text-gray-400 mt-1">Upload a blood smear image to scan it.</p>
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity duration-300">
                        <div className="w-6 h-6 border-[2.5px] border-gray-200 border-t-[#1D1D1F] rounded-full animate-spin mb-3"></div>
                        <span className="text-[10px] font-mono tracking-wider text-gray-800 uppercase animate-pulse">
                          {loadingText}
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
                      Scan Results
                    </span>

                    {!image && !isProcessing && (
                      <div className="py-16 text-center transition-all duration-300">
                        <p className="text-xs text-gray-400 font-light italic">Waiting for an image. Please upload a blood smear to see results.</p>
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
                            Result
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
                            Confidence Score
                          </label>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tighter text-gray-950">
                              {result.accuracy}
                            </span>
                          </div>
                        </div>

                        <div className="font-mono text-[9px] text-gray-400 space-y-1 pt-2">
                          <div>TIME TAKEN: {result.inferenceTime}</div>
                          <div>MODEL: MobileNetV2</div>
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
                        Clear and Scan Another Image
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
          <div className="max-w-6xl mx-auto px-6 py-6 md:py-16 md:px-16 animate-apple-in">
            
            {/* Mobile Elegant Back Arrow */}
            <div className="md:hidden mb-6 -ml-2">
              <button
                onClick={() => { setView('landing'); }}
                className="flex items-center gap-1 text-gray-500 font-medium text-sm hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>

            <header className="mb-12 text-center max-w-2xl mx-auto">
              <span className="inline-block text-[10px] font-mono tracking-widest font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded mb-3 uppercase">
                Downloads
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-gray-950 mb-4">Get the App</h2>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                Download the app to your computer or phone so you can use it entirely offline.
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
                  The full app for Windows laptops and desktop computers.
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
                  The mobile app designed specifically for Android phones and tablets.
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
                <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider uppercase block mb-2">For Developers</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Model Code</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed mb-8 flex-grow">
                  Download the actual AI model files if you want to use it in your own projects.
                </p>
                <button className="w-full bg-[#1D1D1F] hover:bg-red-800 text-white font-medium text-xs rounded-md py-3 transition-colors flex justify-center items-center gap-2">
                  Download Weights <span className="font-mono text-[10px] opacity-70">14.2MB</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING SCROLL TO TOP BUTTON */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-50 p-3 rounded-full shadow-lg transition-all duration-500 ease-in-out transform ${
          showScrollTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90 pointer-events-none'
        } ${isFooterVisible ? 'bg-white text-[#1D1D1F] hover:bg-gray-100' : 'bg-[#1D1D1F]/90 backdrop-blur-md hover:bg-black text-white'}`}
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* FOOTER PERSISTENCE */}
      <footer ref={footerRef} className="bg-[#1D1D1F] text-white py-16 px-6 md:px-16 mt-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="text-left">
            <h4 className="text-2xl font-bold tracking-tight mb-2">MCNN</h4>
            <p className="text-sm text-gray-400 font-light max-w-sm leading-relaxed">
              Final Year Project at the African University of Science and Tech, 2026.
              <br/>A simple tool to help clinics screen blood smears offline.
            </p>
          </div>
          
          <div className="text-left md:text-right">
            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest mb-2 block">Developed By</span>
            <p className="text-lg font-bold tracking-tight">Matthew Treasure</p>
            <p className="text-xs text-gray-400 font-light mt-1">matthewtreasure17@dmail.com</p>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-gray-500 tracking-wider">
          <span>&copy; 2026 Matthew Treasure. All Rights Reserved.</span>
          <span>Works Offline</span>
        </div>
      </footer>
    </div>
  );
}