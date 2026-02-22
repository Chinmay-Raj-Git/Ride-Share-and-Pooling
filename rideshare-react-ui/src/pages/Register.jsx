import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Register() {

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start sharing rides and saving together."
    >
      <form className="flex flex-col gap-4">

        <input
          type="text"
          placeholder="Full Name"
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
        />

        <input
          type="email"
          placeholder="Email"
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
        />

        <input
          type="password"
          placeholder="Password"
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
        />

        <button
          className="bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 transition"
        >
          Register
        </button>

        <p className="text-sm text-center text-neutral-400">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-400">
            Login
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}