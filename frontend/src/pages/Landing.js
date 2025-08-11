import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CpuChipIcon, GlobeAltIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useCity, CITIES } from '../contexts/CityContext';

function IndianGradientBG() {
  return (
    <div className="absolute inset-0 -z-10">
      {/* Indian Flag Inspired Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-white to-green-500 opacity-90"></div>

      {/* Mandala Pattern Overlay */}
      <div className="absolute inset-0 mandala-pattern opacity-20"></div>

      {/* Cultural Accent Stripes */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-white to-orange-500"></div>

      {/* Floating Cultural Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-300 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-blue-300 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { city, cityKey, setCity, cities } = useCity();

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <IndianGradientBG />

      {/* Indian Cultural Header */}
      <div className="absolute top-0 left-0 right-0 backdrop-blur-md bg-white/10 border-b border-orange-200/30 paisley-accent">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <CpuChipIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg">Smart City OS</span>
              <span className="text-xs opacity-80 font-medium">भारत डिजिटल शहर</span>
            </div>
          </div>

          {/* City selector */}
          <div className="flex items-center space-x-3">
            <label className="text-sm opacity-80">City</label>
            <select
              value={cityKey}
              onChange={(e) => setCity(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              {cities.map((key) => (
                <option key={key} value={key} className="text-gray-900">{key}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-sm"
              >
                <span className="block text-2xl md:text-3xl font-medium mb-2 text-orange-200">
                  डिजिटल भारत • Digital India
                </span>
                Building Tomorrow's
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-200 via-white to-green-200">
                  Smart Cities
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mt-6 text-white/80 text-lg max-w-xl"
              >
                Empowering Indian cities with cutting-edge IoT, AI, and blockchain technology.
                Transform urban infrastructure into intelligent, sustainable, and citizen-centric ecosystems
                that honor our heritage while embracing innovation.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="mt-4 flex items-center space-x-4 text-sm text-orange-200"
              >
                <span>🇮🇳 Made in India</span>
                <span>•</span>
                <span>स्वच्छ भारत • Clean India</span>
                <span>•</span>
                <span>आत्मनिर्भर भारत • Self-Reliant India</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cultural-shadow"
                >
                  🚀 Launch Dashboard
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 rounded-xl border-2 border-white/40 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm font-semibold"
                >
                  ✨ Explore Features
                </a>
              </motion.div>

              {/* Indian Tech Stack badges */}
              <div className="mt-8 flex flex-wrap items-center gap-3 opacity-90 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-300/30 text-orange-100">React 18</span>
                <span className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-300/30 text-green-100">Supabase</span>
                <span className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-300/30 text-blue-100">Socket.io</span>
                <span className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-300/30 text-purple-100">AI/ML</span>
                <span className="px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-300/30 text-yellow-100">Blockchain</span>
                <span className="px-3 py-1.5 rounded-full bg-pink-500/20 border border-pink-300/30 text-pink-100">IoT</span>
              </div>
            </div>

            {/* Animated city card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
                <div className="aspect-[16/10]">
                  <img
                    src={`https://source.unsplash.com/1200x800/?city,${city.key}`}
                    alt="City"
                    className="w-full h-full object-cover opacity-90"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10" />

                {/* Floating stats */}
                <div className="absolute top-4 left-4 space-y-3">
                  <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 backdrop-blur text-sm">
                    Live Sensors: 122
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 backdrop-blur text-sm">
                    Active Alerts: 8
                  </div>
                </div>

                {/* Glow accents */}
                <div className="absolute -inset-1 rounded-3xl ring-1 ring-white/10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section id="features" className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[{
              icon: GlobeAltIcon,
              title: 'Digital Twin Map',
              desc: 'A living map layering traffic, environment, utilities, and safety.'
            }, {
              icon: BoltIcon,
              title: 'Real-time Engine',
              desc: 'Stream, analyze, and act on sensor data instantly via Socket.io.'
            }, {
              icon: ShieldCheckIcon,
              title: 'Trusted & Secure',
              desc: 'Privacy-aware, role-based access; optional blockchain audit.'
            }].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
                className="rounded-2xl p-6 bg-white/10 border border-white/20 backdrop-blur group hover:bg-white/15 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-1">{f.title}</h3>
                <p className="text-white/80 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-3xl p-10 bg-white/10 border border-white/20 backdrop-blur"
          >
            <h3 className="text-2xl font-bold mb-2">Experience the City as a System</h3>
            <p className="text-white/80 mb-6">
              Log in to explore live maps, streaming charts, and intelligent alerts.
            </p>
            <Link to="/login" className="px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:opacity-90 transition">
              Enter the Dashboard
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

