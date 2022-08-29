import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import RunNode from "./pages/RunNode";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<RunNode />} />
        <Route path="/runnode" exact element={<RunNode />} />
        <Route path="/coming" exact element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
