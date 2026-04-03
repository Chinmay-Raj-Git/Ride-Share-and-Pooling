// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Landing from "./pages/Landing";
// import Rides from "./pages/Rides";
// import Profile from "./pages/Profile";
// import MyBookings from "./pages/MyBookings";
// import PostRide from "./pages/PostRide";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/"           element={<Landing />} />
//         <Route path="/login"      element={<Login />} />
//         <Route path="/register"   element={<Register />} />
//         <Route path="/rides"      element={<Rides />} />
//         <Route path="/profile"    element={<Profile />} />
//         <Route path="/bookings"   element={<MyBookings />} />
//         <Route path="/post-ride"  element={<PostRide />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Rides from "./pages/Rides";
import Profile from "./pages/Profile";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] =
    useState(!!localStorage.getItem("token"));

  return (
    <BrowserRouter className="m-0 p-0 w-screen h-screen flex items-center justify-center">

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

    </BrowserRouter>

    // <div className="bg-gray-900 text-white w-screen h-screen">
    //     <Dashboard />
    //     <Auth />
    // </div>
  );
}

export default App;