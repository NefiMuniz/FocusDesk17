import { NavLink } from "react-router-dom";
import logo from "../assets/Focus_Desk_Logo_Black_Narrow.webp";
import styles from "./Footer.module.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label="Footer">
      <div className={styles.logoSection}>
        <NavLink to="/">
          <img src={logo} alt="FocusDesk17" className={styles.logo} />
        </NavLink>
        <p className={styles.copyright}>© {year} FocusDesk17</p>
      </div>

      <div className={styles.contact}>
        <h3 className={styles.contactTitle}>Contact Us</h3>
        <p>email@email.com.br</p>
        <p>Phone</p>
      </div>
    </footer>
  );
};

export default Footer;