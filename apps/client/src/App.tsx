import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useConnectionStore } from "./stores/connectionStore";
import { connect } from "./websocket/client";
import Dashboard from "./pages/Dashboard";
import Pairing from "./pages/Pairing";
import Settings from "./pages/Settings";
import Setup from "./pages/Setup";
import "./styles/index.css";

export default function App() {
  const agentAddress = useConnectionStore((s) => s.agentAddress);
  const accessToken = useConnectionStore((s) => s.accessToken);
  const status = useConnectionStore((s) => s.status);
  useEffect(() => {
    if (agentAddress && accessToken) connect();
  }, [agentAddress, accessToken]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/pair" element={<Pairing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={accessToken ? <Dashboard /> : <Navigate to="/setup" replace />} />
      </Routes>
    </BrowserRouter>
  );
}