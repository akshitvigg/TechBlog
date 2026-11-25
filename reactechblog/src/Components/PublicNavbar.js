import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FaBars, FaTimes} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import ThemeToggle from "./ThemeToggle";

const PublicNavbar = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [signedIn, setSignedIn] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        axios.get("/user-check-authentication")
            .then(response => setSignedIn(response.data !== "fails"))
            .catch(() => setSignedIn(false));
    }, []);

    async function logout() {
        const confirmed = await Swal.fire({
            title: "Log out?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Log out",
            cancelButtonText: "Stay here"
        });
        if (!confirmed.isConfirmed) return;
        try {
            await axios.post("/user-logout");
            setSignedIn(false);
            closeMenu();
            navigate("/");
        } catch {
            Swal.fire({icon: "error", title: "Could not log out", text: "Please try again."});
        }
    }

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
                    <Link className="tb-nav-cta" to={signedIn ? "/user/home" : "/user-LoginRegister"} onClick={closeMenu}>
                        {signedIn ? "Dashboard" : "Sign in / Join"}
                    </Link>
                    {signedIn && <button className="tb-nav-logout" type="button" onClick={logout}>Log out</button>}
                    <ThemeToggle/>
                </nav>
            </div>
        </header>
    );
};

export default PublicNavbar;
