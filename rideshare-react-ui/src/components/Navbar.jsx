import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-neutral-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-yellow-400 rounded-md"></div>
        <h1 className="text-lg font-semibold tracking-wide">
          RideShare
        </h1>
      </div>

    </nav>
  );
}