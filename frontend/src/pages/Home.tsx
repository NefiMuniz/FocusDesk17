import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { LayoutDashboard } from "lucide-react";

const Home = () => {
  useEffect(() => {
    document.title = "Home | FocusDesk17";
  }, []);

  const navigate = useNavigate();

  return (
    <div className={styles.container}>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Stay focused with<br />
            <span className={styles.heroTitleAccent}>FocusDesk17</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Create tasks and boards. Manage work, personal and academic tasks and keep yourself productive.
          </p>
          <button className={styles.heroButton} onClick={() => navigate("/login")}>
            Start Here
          </button>
        </div>
      </section>

      <section className={styles.whySection}>
        <h2 className={styles.sectionTitle}>Why Use FocusDesk17</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><LayoutDashboard size={22} /></div>
            <h3 className={styles.featureTitle}>All in One Tool</h3>
            <p className={styles.featureText}>Create and manage multiple boards.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3 className={styles.featureTitle}>Customizable</h3>
            <p className={styles.featureText}>Create your own color labels to match your workflow.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎯</div>
            <h3 className={styles.featureTitle}>Stay on Track</h3>
            <p className={styles.featureText}>See your most urgent tasks the moment you log in.</p>
          </div>
        </div>
      </section>

      <section className={styles.howSection}>
        <h2 className={styles.sectionTitle}>How it Works?</h2>
        <div className={styles.stepsGrid}>
          {[
            { num: 1, label: "Create your account" },
            { num: 2, label: "Create your first board" },
            { num: 3, label: "Add lists and tasks" },
            { num: 4, label: "Keep on track" },
          ].map(step => (
            <div key={step.num} className={styles.step}>
              <div className={styles.stepCircle}>{step.num}</div>
              <p className={styles.stepLabel}>{step.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready for the Next Step in your Productivity?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of professionals and students who have found their perfect time management through FocusDesk17.
          </p>
          <button className={styles.ctaButton} onClick={() => navigate("/login")}>
            Get Started
          </button>
        </div>
      </section>

    </div>
  );
};

export default Home;