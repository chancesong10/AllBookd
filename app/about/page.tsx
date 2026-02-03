export default function AboutPage() {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-blue-500/30 overflow-hidden relative">
        
        {/* 1. Ambient Background Glows */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
        </div>
  
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32 flex flex-col min-h-screen">
          
          {/* 2. Hero Section */}
          <div className="mb-20">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
              Finally, a book tracker <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-white animate-gradient-x">
                that looks as good as it feels.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-400 leading-relaxed max-w-2xl">
              AllBookd is your personal sanctuary to explore, wishlist, and log your reading adventures—without the clutter of the past.
            </p>
          </div>
  
          {/* 3. The "Why" Content */}
          <div className="grid gap-16 flex-grow">
            
            {/* Section: The Problem */}
            <section className="relative">
              <div className="absolute left-4 top-12 bottom-0 w-px bg-gradient-to-b from-neutral-800 to-transparent" />
              
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-sm font-mono text-neutral-500 z-10">
                  01
                </div>
                <div className="pt-1">
                  <h2 className="text-2xl font-bold text-white mb-4">The Old Way</h2>
                  <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
                    We love reading, but we hated the tools available to track it. 
                    Spreadsheets are boring. Legacy websites feel like they're stuck in 2005—cluttered with ads, slow to load, and designed like utility software.
                  </p>
                </div>
              </div>
            </section>
  
            {/* Section: The Solution */}
            <section className="relative">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-900/20 border border-blue-500/50 flex items-center justify-center text-sm font-mono text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10">
                  02
                </div>
                <div className="pt-1 w-full">
                  <h2 className="text-2xl font-bold text-white mb-6">The AllBookd Way</h2>
                  <p className="text-neutral-300 text-lg mb-8 max-w-xl">
                    We built the platform we always wanted to use. A modern space focused on the <em>art</em> of the book cover and the joy of collection.
                  </p>
  
                  {/* Feature Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { 
                        icon: "⚡", 
                        title: "Lightning Fast", 
                        desc: "No page reloads. No lag. Instant search." 
                      },
                      { 
                        icon: "🎨", 
                        title: "Visual First", 
                        desc: "Your library should look like a gallery, not a list." 
                      },
                      { 
                        icon: "🚫", 
                        title: "Zero Clutter", 
                        desc: "No noisy ads. No distractions. Just books." 
                      },
                      { 
                        icon: "🌑", 
                        title: "Dark Mode", 
                        desc: "Designed for late-night reading sessions." 
                      }
                    ].map((item) => (
                      <div key={item.title} className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:bg-neutral-900 hover:border-neutral-700 transition-colors group">
                        <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{item.icon}</div>
                        <h3 className="font-bold text-neutral-200 mb-1">{item.title}</h3>
                        <p className="text-sm text-neutral-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          {/* 4. Footer CTA */}
          <div className="mt-24 pt-12 border-t border-neutral-800 flex flex-col items-center text-center">
            <p className="text-neutral-400 mb-6 font-medium">Ready to build your modern library?</p>
            <a 
              href="/search" 
              className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-500"
            >
              Start Exploring
              <span className="absolute -right-8 opacity-0 group-hover:opacity-100 group-hover:right-[-2.5rem] transition-all duration-300">→</span>
            </a>
          </div>
  
          {/* 5. Founders / Credits Section */}
          <div className="mt-32 flex flex-col items-center pb-8">
            <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-6">
              Crafted By
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
              
              {/* Founder 1 */}
              <a 
                href="https://www.linkedin.com/in/temirlan-n-b516b9243/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 group-hover:border-blue-500 group-hover:bg-blue-900/20 flex items-center justify-center transition-all duration-300 text-neutral-400 group-hover:text-blue-400 font-bold text-sm">
                  TN
                </div>
                <div className="text-left">
                  <p className="text-neutral-200 font-semibold group-hover:text-white transition-colors">Temirlan Nurmambetov</p>
                  <p className="text-xs text-neutral-500 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                    Connect on LinkedIn 
                    <span className="inline-block transform -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">↗</span>
                  </p>
                </div>
              </a>
  
              {/* Founder 2 */}
              <a 
                href="https://www.linkedin.com/in/chancesong/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 group-hover:border-blue-500 group-hover:bg-blue-900/20 flex items-center justify-center transition-all duration-300 text-neutral-400 group-hover:text-blue-400 font-bold text-sm">
                  CS
                </div>
                <div className="text-left">
                  <p className="text-neutral-200 font-semibold group-hover:text-white transition-colors">Chance Song</p>
                  <p className="text-xs text-neutral-500 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                    Connect on LinkedIn
                    <span className="inline-block transform -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">↗</span>
                  </p>
                </div>
              </a>
  
            </div>
          </div>
  
        </div>
      </div>
    );
  }