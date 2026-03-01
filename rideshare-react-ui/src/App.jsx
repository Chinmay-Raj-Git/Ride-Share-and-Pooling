import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing    from "./pages/Landing";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Rides      from "./pages/Rides";
import Profile    from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import PostRide   from "./pages/PostRide";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rides"    element={<Rides />} />
        <Route path="/profile"  element={<Profile />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/post-ride" element={<PostRide />} />
      </Routes>
    </BrowserRouter>
  );
}
