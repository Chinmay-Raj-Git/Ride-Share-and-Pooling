import Navbar from "./Navbar";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen w-screen bg-neutral-800 text-white">

      <Navbar />

      <div className="flex justify-center items-center px-4 py-12">

        <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-md p-8 rounded-xl shadow-lg">

          {/* App Welcome */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-yellow-400">
              {title}
            </h2>
            <p className="text-neutral-400 mt-2">
              {subtitle}
            </p>
          </div>

          {children}

        </div>

      </div>
    </div>
  );
}