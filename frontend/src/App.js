import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.js";
import Register from "./pages/Register.js";
//import Login from "./pages/Login.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        {/*<Route path="/login"element={<Login />} />*/}
      </Routes>
    </Router>
  );
}

export default App;
