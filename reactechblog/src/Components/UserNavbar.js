import {Link, Outlet, useNavigate} from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import {FaBars, FaSearch, FaTimes} from "react-icons/fa";
import Footer from "../Footer";
import {useState} from "react";
import ThemeToggle from "./ThemeToggle";

const UserNavbar = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const closeMenu = () => setMenuOpen(false);

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
            await axios.post("/user-logout");
            navigate("/user-LoginRegister");
        } catch {
            Swal.fire({icon: "error", title: "Could not log out", text: "Please try again."});
        }
    }

    function searchForm(event) {
        event.preventDefault();
        const query = search.trim();
        if (query) {
            closeMenu();
            navigate(`/user/search/${encodeURIComponent(query)}`);
        }
    }

    return (
        <>
            <header className="tb-header">
                <div className="tb-header-inner">
                    <Link className="tb-brand" to="/user/home" onClick={closeMenu} aria-label="TechBlog home">
                        <span className="tb-brand-mark">T</span>
                        <span>Tech<span>Blog</span></span>
                    </Link>
                    <button
                        className="tb-menu-toggle"
                        type="button"
                        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={menuOpen}
                        aria-controls="user-navigation"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FaTimes/> : <FaBars/>}
                    </button>
                    <nav id="user-navigation" className={`tb-nav ${menuOpen ? "is-open" : ""}`}>
                        <Link to="/user/home" onClick={closeMenu}>Questions</Link>
                        <Link to="/user/post-question" onClick={closeMenu}>Ask a question</Link>
                        <Link to="/user/my-questions" onClick={closeMenu}>My questions</Link>
                        <Link to="/user/manage-blogs" onClick={closeMenu}>My blogs</Link>
                        <Link to="/user/all-blogs" onClick={closeMenu}>Explore blogs</Link>
                        <form className="tb-search" onSubmit={searchForm}>
                            <input
                                aria-label="Search questions"
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Search questions"
                            />
                            <button type="submit" aria-label="Submit search"><FaSearch/></button>
                        </form>
                        <Link to="/user/change-password" onClick={closeMenu}>Change password</Link>
                        <button className="tb-nav-logout" type="button" onClick={() => { closeMenu(); logout(); }}>Log out</button>
                        <ThemeToggle/>
                    </nav>
                </div>
            </header>
            <Outlet/>
            <Footer/>
        </>
    );
};

export default UserNavbar;
