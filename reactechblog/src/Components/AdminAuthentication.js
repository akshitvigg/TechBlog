import {useEffect, useState} from "react";
import axios from "axios";
import {Link, Outlet, useNavigate} from "react-router-dom";
import Swal from "sweetalert2";
import {FaBars, FaTimes} from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const AdminAuthentication = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);
    useEffect(() => {
        axios.get("/admin-check-authentication").then(response => {
            if (response.data === "fails") {
                navigate("/admin-login")
            }
        })
    }, [navigate])
    async function logout() {
        const result = await Swal.fire({
            title: "Log out?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Log out",
            cancelButtonText: "Stay here"
        });
        if (!result.isConfirmed) return;
        try {
            await axios.post("/admin-logout");
            navigate("/admin-login");
        } catch {
            Swal.fire({icon: "error", title: "Could not log out", text: "Please try again."});
        }
    }

    return (
        <>
            <header className="tb-header">
                <div className="tb-header-inner">
                    <Link className="tb-brand" to="/admin/home" onClick={closeMenu} aria-label="TechBlog admin home">
                        <span className="tb-brand-mark">T</span>
                        <span>Tech<span>Blog</span></span>
                        <small className="tb-admin-label">Admin</small>
                    </Link>
                    <button
                        className="tb-menu-toggle"
                        type="button"
                        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={menuOpen}
                        aria-controls="admin-navigation"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FaTimes/> : <FaBars/>}
                    </button>
                    <nav id="admin-navigation" className={`tb-nav ${menuOpen ? "is-open" : ""}`}>
                        <Link to="/admin/home" onClick={closeMenu}>Dashboard</Link>
                        <Link to="/admin/admins" onClick={closeMenu}>Manage admins</Link>
                        <Link to="/admin/categories" onClick={closeMenu}>Categories</Link>
                        <Link to="/admin/change-password" onClick={closeMenu}>Change password</Link>
                        <button className="tb-nav-logout" type="button" onClick={() => { closeMenu(); logout(); }}>Log out</button>
                        <ThemeToggle/>
                    </nav>
                </div>
            </header>
            <Outlet/>
        </>
    )
}
export default AdminAuthentication;