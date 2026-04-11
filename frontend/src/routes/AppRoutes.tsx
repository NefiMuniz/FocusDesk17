import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import PrivateRoute from "../components/PrivateRoute";
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
            <Route path="/boards" element={<PrivateRoute><Boards /></PrivateRoute>} />
            <Route path="/board/:id" element={<PrivateRoute><Board /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />            
          </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;