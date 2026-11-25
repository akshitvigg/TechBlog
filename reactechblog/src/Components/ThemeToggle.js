import { useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const KEY = "tb-theme";

const getTheme = () =>
  document.documentElement.getAttribute("data-theme") || "light";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getTheme);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // storage blocked: theme still works for this visit
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="tb-theme-toggle"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      title={theme === "dark" ? "Light theme" : "Dark theme"}
    >
      {theme === "dark" ? <FaSun /> : <FaMoon />}
    </button>
  );
};

export default ThemeToggle;
