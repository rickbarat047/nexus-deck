import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useConnectionStore } from "./stores/connectionStore";
import { connect } from "./websocket/client";
import Dashboard from "./pages/Dashboard";
import Pairing from "./pages/Pairing";
import Settings from "./pages/Settings";
import "./styles/index.css";

export default function App() {
  const agentAddress = useConnectionStore((s) => s.agentAddress);
  const accessToken = useConnectionStore((s) => s.accessToken);
  useEffect(() => {
    if (agentAddress && accessToken) connect();
  }, [agentAddress, accessToken]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pair" element={<Pairing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={accessToken ? <Dashboard /> : <Navigate to="/pair" replace />} />
      </Routes>
    </BrowserRouter>
  );
}