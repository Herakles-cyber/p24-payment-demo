import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Status from "./pages/Status";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/status/:id" element={<Status />} />
    </Routes>
  );
}