import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <>
          <a href="#main-content" className="skipLink">
            Skip to main.
          </a>
          <Navbar />
          <main id="main-content">
            <Outlet />
          </main>
          <Footer />
        </>
    );
};

export default Layout;