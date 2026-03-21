import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import Boards from "../pages/Boards";
import Board from "../pages/Board";
import Login from "../pages/Login";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/boards" element={<Boards />} />
            <Route path="/board/:id" element={<Board />} />
            <Route path="/login" element={<Login />} />            
          </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;