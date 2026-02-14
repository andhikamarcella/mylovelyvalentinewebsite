import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AnniversaryController from "./components/AnniversaryController";
import Gallery from "./pages/Gallery";
import Game from "./pages/Game";
import Home from "./pages/Home";
import Secret from "./pages/Secret";

export default function App() {
  return (
    <Router>
      <AnniversaryController />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kenangan" element={<Gallery />} />
        <Route path="/gallery" element={<Navigate to="/kenangan" replace />} />
        <Route path="/game" element={<Game />} />
        <Route path="/secret" element={<Secret />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
