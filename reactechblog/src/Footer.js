import { useEffect } from "react";
import { Link } from "react-router-dom";
import ScrollToTopButton from "./ScrollToTopButton";

let Footer = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <ScrollToTopButton />
      <footer className="tb-footer">
        <div className="tb-footer-inner">
          <div className="tb-footer-brand">
            <Link className="tb-brand" to="/" aria-label="TechBlog home">
              <span className="tb-brand-mark">T</span>
              <span>
                Tech<span>Blog</span>
              </span>
            </Link>
            <p>A community for sharing technical knowledge.</p>
          </div>
          <nav aria-label="Footer">
            <Link to="/">Home</Link>
            <Link to="/about-us">About</Link>
            <Link to="/blogs">Articles</Link>
          </nav>
        </div>
        <div className="tb-footer-bottom">
          © {new Date().getFullYear()} TechBlog. All rights reserved.
        </div>
      </footer>
    </>
  );
};
export default Footer;
