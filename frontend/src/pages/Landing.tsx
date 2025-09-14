import React, { useState, useEffect } from "react";
import { FaRocket, FaMoon, FaSun, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const LandingPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      setDarkMode(savedTheme === "true");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      localStorage.setItem("darkMode", prefersDark.toString());
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      localStorage.setItem("darkMode", (!prev).toString());
      return !prev;
    });
  };

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen transition-colors duration-500
      bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text`}>

      {/* Navbar */}
      <nav className="fixed top-0 w-full shadow-md z-50 bg-light-header dark:bg-dark-header backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="font-extrabold text-xl flex items-center gap-2 text-black dark:text-white">
            FAS Job Flow <FaRocket className="animate-bounce" />
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full transition hover:opacity-80"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun className="text-white" /> : <FaMoon className="text-black" />}
            </button>
            <button className="bg-light-header dark:bg-dark-header text-white px-4 py-2 rounded-lg transition font-semibold">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`h-screen flex flex-col justify-center items-center text-center px-6
        ${darkMode ? "bg-dark-background text-white" : "bg-light-background text-black"}`}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 flex items-center justify-center gap-3">
            FAS Job Flow <FaRocket className="animate-bounce" />
          </h1>
          <p className="text-xl md:text-2xl mb-8 leading-relaxed">
            An internal platform for managing and routing job requests in real-time. Track, assign, and resolve tasks efficiently.
          </p>
          <motion.a
            href="#get-started"
            className={`inline-block mt-4 px-8 py-4 rounded-lg shadow-lg font-bold transition
              ${darkMode ? "bg-dark-header text-dark-text hover:opacity-80" : "bg-light-header text-white hover:opacity-80"}`}
            whileHover={{ scale: 1.05 }}
          >
            Get Started
          </motion.a>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 text-light-header dark:text-dark-text">🚀 Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { title: "Task Management", desc: "Organize and assign tasks clearly and track progress efficiently." },
            { title: "Real-Time Updates", desc: "Stay informed on task statuses and team progress in real-time." },
            { title: "Cross-Department Collaboration", desc: "Enable seamless collaboration across IT, logistics, and finance." },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`p-6 border rounded-lg hover:shadow-2xl transition
                ${darkMode ? "bg-dark-surface border-dark-surface" : "bg-light-surface border-light-surface"}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2 text-black dark:text-white">
                <FaCheckCircle className="text-dark-header" /> {feature.title}
              </h3>
              <p className="text-black dark:text-white">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="py-24 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6 text-light-header dark:text-dark-text">Ready to get started?</h2>
        <motion.button
          className={`px-8 py-4 rounded-lg font-semibold transition shadow-lg
            ${darkMode ? "bg-dark-header text-dark-text hover:opacity-80" : "bg-light-header text-white hover:opacity-80"}`}
          whileHover={{ scale: 1.05 }}
        >
          Create Account
        </motion.button>
      </section>

      {/* Footer */}
      <footer className={`py-6 text-center
        ${darkMode ? "bg-dark-surface text-dark-text" : "bg-light-surface text-black"}`}>
        &copy; {new Date().getFullYear()} FAS Job Flow. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
