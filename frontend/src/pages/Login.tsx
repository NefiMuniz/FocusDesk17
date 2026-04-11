import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login, registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import styles from "./Login.module.css";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const redirectMessage = location.state?.message as string | undefined;
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "FocusDesk17 | Login";
  }, []);

  useEffect(() => {
    if (location.state?.openRegister) {
      setIsLogin(false);
  
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) =>
    password.length >= 6 && /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const validateLoginForm = (): boolean => {
    const errors: FormErrors = {};

    if (!validateEmail(email))
      errors.email = "Please enter a valid email address.";
    if (!validatePassword(password))
      errors.password = "Password must be at least 6 characters and include 1 special character.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: FormErrors = {};

    if (name.trim().length < 3)
      errors.name = "Name must be at least 3 characters.";
    if (!validateEmail(email))
      errors.email = "Please enter a valid email address.";
    if (!validatePassword(password))
      errors.password = "Password must be at least 6 characters and include 1 special character.";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (!validateLoginForm()) return;
  
    try {
      const response = await login(email, password);
      await authLogin(response.data.access_token);
      navigate("/boards");
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateRegisterForm()) return;
    try {
      await registerUser(name, email, password);
      setIsLogin(true);
    } catch {
      setError("Registration failed. Please try again.");
    }
  };

  const switchForm = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setError("");
    setFieldErrors({});
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>
          {isLogin ? "Login to FocusDesk17" : "Register to FocusDesk17"}
        </h1>

        {redirectMessage && (
          <p role="alert" className={styles.redirectMessage}>{redirectMessage}</p>
        )}

        <div className={styles.cardBorder}>
          <div className={styles.card}>
            {error && <p role="alert" className={styles.error}>{error}</p>}

            {isLogin ? (
              <form className={styles.form} onSubmit={handleLoginSubmit} noValidate>
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="email@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {fieldErrors.email && <p role="alert" className={styles.fieldError}>{fieldErrors.email}</p>}

                <label htmlFor="login-password">Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <p role="alert" className={styles.fieldError}>{fieldErrors.password}</p>}

                <button type="submit" className={styles.button}>Login</button>

                <p className={styles.switch}>
                  Don't have an account?{" "}
                  <button type="button" onClick={() => switchForm(false)} className={styles.switchLink}>
                    Register here
                  </button>
                </p>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleRegisterSubmit} noValidate>
                <label htmlFor="register-name">Name</label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {fieldErrors.name && <p role="alert" className={styles.fieldError}>{fieldErrors.name}</p>}

                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="email@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {fieldErrors.email && <p role="alert" className={styles.fieldError}>{fieldErrors.email}</p>}

                <label htmlFor="register-password">Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <p role="alert" className={styles.fieldError}>{fieldErrors.password}</p>}

                <label htmlFor="register-confirm-password">Confirm Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowConfirmPassword(v => !v)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p role="alert" className={styles.fieldError}>{fieldErrors.confirmPassword}</p>}

                <button type="submit" className={styles.button}>Register</button>

                <p className={styles.switch}>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchForm(true)} className={styles.switchLink}>
                    Login here
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;