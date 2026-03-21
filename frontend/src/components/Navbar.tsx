import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, LogIn } from "lucide-react";
import logo from "../assets/Focus_Desk_Logo_Black_Narrow.webp";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
      <nav className={styles.navbar} aria-label="Main navigation">
        <NavLink to="/" className={styles.logo}>
          <img src={logo} alt="FocusDesk17" />
        </NavLink>

        <ul className={styles.navLinks}>
          <li><NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}><Home size={18} aria-hidden="true" />Home</NavLink></li>
          <li><NavLink to="/boards" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}><LayoutDashboard size={18} aria-hidden="true" />Boards</NavLink></li>
          <li><NavLink to="/login" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}><LogIn size={18} aria-hidden="true" />Login</NavLink></li>
        </ul>
      </nav>
        );
};

export default Navbar;