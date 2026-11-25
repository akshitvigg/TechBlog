import {useState} from "react";
import {Link} from "react-router-dom";
import {FaBars, FaTimes} from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const PublicNavbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="tb-header">
            <div className="tb-header-inner">
                <Link className="tb-brand" to="/" onClick={closeMenu} aria-label="TechBlog home">
                    <span className="tb-brand-mark">T</span>
                    <span>Tech<span>Blog</span></span>
                </Link>
                <button
                    className="tb-menu-toggle"
                    type="button"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="public-navigation"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <FaTimes/> : <FaBars/>}
                </button>
                <nav id="public-navigation" className={`tb-nav ${menuOpen ? "is-open" : ""}`}>
                    <Link to="/" onClick={closeMenu}>Home</Link>
                    <Link to="/about-us" onClick={closeMenu}>About</Link>
                    <Link to="/blogs" onClick={closeMenu}>Explore blogs</Link>
                    <Link className="tb-nav-cta" to="/user-LoginRegister" onClick={closeMenu}>Sign in / Join</Link>
                    <ThemeToggle/>
                </nav>
            </div>
        </header>
    );
};

export default PublicNavbar;
