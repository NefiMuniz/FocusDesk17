import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, LogIn, LogOut, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import logoDark from "../assets/Focus_Desk_Logo_Black_Narrow.webp";
import logoLight from "../assets/Focus_Desk_Logo_White_Narrow.webp";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
          {isAuthenticated ? (
            <button onClick={logout} className={styles.navLink}>
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              <LogIn size={18} />
              Login
            </NavLink>
          )}
        </li>
      </ul>

      <div className={styles.navRight}>
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.mobileLink} ${styles.active}` : styles.mobileLink} onClick={closeMenu}>
            <Home size={18} />
            Home
          </NavLink>
          <NavLink to="/boards" className={({ isActive }) => isActive ? `${styles.mobileLink} ${styles.active}` : styles.mobileLink} onClick={closeMenu}>
            <LayoutDashboard size={18} />
            Boards
          </NavLink>
          {isAuthenticated ? (
            <button className={styles.mobileLink} onClick={() => { logout(); closeMenu(); }}>
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <NavLink to="/login" className={({ isActive }) => isActive ? `${styles.mobileLink} ${styles.active}` : styles.mobileLink} onClick={closeMenu}>
              <LogIn size={18} />
              Login
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;