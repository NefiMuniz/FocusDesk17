import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, LogIn, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/Focus_Desk_Logo_Black_Narrow.webp";
import logoLight from "../assets/Focus_Desk_Logo_White_Narrow.webp";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <NavLink to="/" className={styles.logo}>
        <img
          src={theme === "dark" ? logoDark : logoLight}
          alt="FocusDesk17"
        />
      </NavLink>

      <ul className={styles.navLinks}>
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <Home size={18} aria-hidden="true" />
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/boards" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <LayoutDashboard size={18} aria-hidden="true" />
            Boards
          </NavLink>
        </li>
        <li>
          <NavLink to="/login" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <LogIn size={18} aria-hidden="true" />
            Login
          </NavLink>
        </li>
      </ul>

      <button
        onClick={toggleTheme}
        className={styles.themeToggle}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </nav>
  );
};

export default Navbar;