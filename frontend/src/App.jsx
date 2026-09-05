import React, { useState } from 'react';
import FleetDashboard from './components/FleetDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      setUser({ email });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setEmail('');
    setPassword('');
  };

  // If authenticated, render FleetDashboard component
  if (user) {
    return <FleetDashboard user={user} onLogout={handleLogout} />;
  }

  // Login view directly inside App.jsx
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      
      {/* Fixed Fullscreen Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="video-background"
      >
        <source
          src="/mixkit-cargo-ships-sailing-in-open-sea-seen-from-the-air-34291-hd-ready.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Video Dark Tint Overlay */}
      <div className="video-overlay" />

      {/* Centered Glass Login Form */}
      <div className="login-page-wrapper">
        <div className="login-card">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
              Maritime Software
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Sign in to access your portal
            </p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="!mb-0">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Contact your administrator to reset password.'); }}
                  className="text-xs text-sky-300 hover:text-white transition font-medium no-underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="mt-4">
              Sign In
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}