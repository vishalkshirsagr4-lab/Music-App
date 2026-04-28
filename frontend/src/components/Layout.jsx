import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import InstallBanner from "./InstallBanner";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* PWA Install Banner */}
      <InstallBanner />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content wrapper */}
      <div className="md:pl-64 transition-all duration-300">
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}

