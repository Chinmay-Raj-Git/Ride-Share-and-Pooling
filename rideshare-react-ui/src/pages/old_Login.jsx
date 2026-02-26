import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Login() {

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to continue carpooling smarter."
    >
      <form className="flex flex-col gap-4">

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

        <div className="flex justify-between text-sm text-neutral-400">
          <label className="flex gap-2 items-center">
            <input type="checkbox" />
            Remember me
          </label>

          <a href="#" className="hover:text-yellow-400">
            Forgot?
          </a>
        </div>

        <button
          className="bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 transition"
        >
          Login
        </button>

        <p className="text-sm text-center text-neutral-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-yellow-400">
            Register
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}