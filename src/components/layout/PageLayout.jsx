import Navbar from "./Navbar";
 
export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-96 h-96 bg-leaf-300 dark:bg-leaf-800 -top-32 -right-32" />
        <div className="orb w-80 h-80 bg-soil-300 dark:bg-soil-800 bottom-0 -left-24" style={{ animationDelay: "-3s" }} />
        <div className="orb w-64 h-64 bg-sky-200 dark:bg-sky-900 top-1/2 left-1/2" style={{ animationDelay: "-6s" }} />
      </div>
 
      <Navbar />
 
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
}
 