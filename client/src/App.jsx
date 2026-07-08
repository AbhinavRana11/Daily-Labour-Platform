import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'

// Placeholder Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FindLabour from './pages/FindLabour'

import { AuthProvider } from './context/AuthContext';

const FindWork = () => <div className="p-20 text-center text-2xl">Find Work Page (Coming Soon)</div>

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/find-labour" element={<FindLabour />} />
              <Route path="/find-work" element={<FindWork />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <footer className="bg-secondary text-gray-400 py-8 text-center">
            <p>&copy; 2026 DailyLabour. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
