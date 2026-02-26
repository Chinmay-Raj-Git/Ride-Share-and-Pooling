import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter className="m-0 p-0 w-screen h-screen flex items-center justify-center">

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;