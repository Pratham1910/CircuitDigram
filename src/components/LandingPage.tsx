import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, BookOpen, Download, Play, ChevronRight, 
  Cpu, Layers, FileText, Share2, Sparkles, ArrowRight,
  Circle, Square, Triangle
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  // Animated circuit background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${1 - dist / 150})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const features = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Drag & Drop Editor',
      description: 'Intuitive canvas-based circuit designer with 16+ components',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Live Simulation',
      description: 'Real-time circuit simulation with voltage and current analysis',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Learning Mode',
      description: 'Step-by-step animated tutorials with visual current flow',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'PDF Reports',
      description: 'Auto-generate professional circuit documentation',
      color: 'from-emerald-500 to-green-500',
    },
  ];

  const components = [
    'Resistors', 'Capacitors', 'Diodes', 'LEDs', 'Transistors', 
    'Batteries', 'Switches', 'Inductors', 'Op-Amps', 'Transformers',
    'Fuses', 'Motors', 'Relays', 'Crystals', 'Connectors', 'Ground'
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-30"
      />

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-emerald-950 opacity-90 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="min-h-screen flex flex-col items-center justify-center px-6 relative"
        >
          {/* Floating Icons */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute top-20 left-20 text-emerald-500 opacity-20"
          >
            <Cpu className="w-24 h-24" />
          </motion.div>

          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-32 right-20 text-emerald-500 opacity-20"
          >
            <Zap className="w-32 h-32" />
          </motion.div>

          {/* Main Hero Content */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center max-w-5xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.4,
                type: "spring",
                stiffness: 200
              }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-50 animate-pulse" />
                <Sparkles className="w-16 h-16 text-emerald-400 relative" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-6"
            >
              <span className="block text-6xl md:text-8xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                CircuitForge
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-4"
            >
              Design, Simulate & Learn Electronics Like Never Before
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              A powerful web-based circuit designer with real-time simulation, 
              interactive learning mode, and professional report generation.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                onClick={onEnter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/75 transition-shadow"
              >
                <Play className="w-5 h-5" />
                Launch App
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-white flex items-center justify-center gap-2 border border-emerald-500/30"
              >
                <BookOpen className="w-5 h-5" />
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ 
              opacity: { delay: 2 },
              y: { duration: 2, repeat: Infinity }
            }}
            className="absolute bottom-10"
          >
            <ChevronRight className="w-8 h-8 text-emerald-400 rotate-90" />
          </motion.div>
        </motion.section>

        {/* Marquee Section */}
        <section className="py-12 bg-emerald-950/50 border-y border-emerald-500/20 overflow-hidden">
          <div className="marquee-container">
            <motion.div
              animate={{ x: [0, -1920] }}
              transition={{ 
                duration: 30, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="flex gap-8 text-emerald-400"
            >
              {[...components, ...components, ...components].map((comp, i) => (
                <div key={i} className="flex items-center gap-3 whitespace-nowrap">
                  <Circle className="w-3 h-3 fill-emerald-500" />
                  <span className="text-lg">{comp}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-gray-400 text-xl">
                Everything you need to design and understand circuits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  onHoverStart={() => setActiveFeature(index)}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-gray-900/80 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 h-full">
                    <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Interactive Demo Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-black to-emerald-950/30">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                See It In Action
              </h2>
              <p className="text-gray-400 text-xl">
                Watch circuits come to life with animated simulations
              </p>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl shadow-emerald-500/20"
            >
              {/* Simulated Circuit Animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-full p-12" viewBox="0 0 400 300">
                  {/* Battery */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <rect x="20" y="130" width="40" height="40" fill="none" stroke="#10b981" strokeWidth="2" />
                    <text x="40" y="155" fill="#10b981" textAnchor="middle" fontSize="12">+</text>
                  </motion.g>

                  {/* Resistor */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <rect x="180" y="130" width="60" height="40" fill="none" stroke="#10b981" strokeWidth="2" />
                    <text x="210" y="155" fill="#10b981" textAnchor="middle" fontSize="10">R1</text>
                  </motion.g>

                  {/* LED */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <circle cx="340" cy="150" r="20" fill="none" stroke="#10b981" strokeWidth="2" />
                    <motion.circle
                      cx="340"
                      cy="150"
                      r="15"
                      fill="#10b981"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.g>

                  {/* Wires */}
                  <motion.line
                    x1="60" y1="150" x2="180" y2="150"
                    stroke="#10b981" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                  />
                  <motion.line
                    x1="240" y1="150" x2="320" y2="150"
                    stroke="#10b981" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                  />
                  <motion.line
                    x1="340" y1="170" x2="340" y2="220"
                    stroke="#10b981" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.5, duration: 0.3 }}
                  />
                  <motion.line
                    x1="340" y1="220" x2="40" y2="220"
                    stroke="#10b981" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.7, duration: 0.5 }}
                  />
                  <motion.line
                    x1="40" y1="220" x2="40" y2="170"
                    stroke="#10b981" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.9, duration: 0.3 }}
                  />

                  {/* Animated Current Flow */}
                  <motion.circle
                    r="4"
                    fill="#fbbf24"
                    animate={{
                      x: [60, 180, 240, 320, 340, 340, 340, 40, 40, 60],
                      y: [150, 150, 150, 150, 150, 170, 220, 220, 170, 150],
                    }}
                    transition={{
                      delay: 2.2,
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </svg>
              </div>

              <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/30">
                <p className="text-emerald-400 text-sm">
                  <Zap className="w-4 h-4 inline mr-2" />
                  Live circuit simulation with animated current flow
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '16+', label: 'Components' },
              { number: '∞', label: 'Circuits' },
              { number: '100%', label: 'Free' },
              { number: '<1s', label: 'Simulation' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl md:text-7xl bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-t from-black to-emerald-950/30">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-6xl mb-6 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Ready to Start Building?
            </h2>
            <p className="text-gray-400 text-xl mb-12">
              Join thousands of students and engineers designing circuits with CircuitForge
            </p>

            <motion.button
              onClick={onEnter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-12 py-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white text-xl flex items-center justify-center gap-3 mx-auto shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/75 transition-shadow"
            >
              <Zap className="w-6 h-6" />
              Launch CircuitForge
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-emerald-500/20">
          <div className="max-w-6xl mx-auto text-center text-gray-500">
            <p className="mb-4">
              Built with React, TypeScript, and TailwindCSS
            </p>
            <p className="text-sm">
              © 2025 CircuitForge. Empowering electronics education worldwide.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
