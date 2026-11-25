import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import BlogCard from "./BlogCard";
import { excerpt } from "./textUtils";

// detailsPath: "/blog-details/" (public) or "/user/blog-details-user/" (logged in)
const BlogList = ({ detailsPath }) => {
  const [blogs, setBlogs] = useState([]);
  const [state, setState] = useState("loading");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    axios
      .get("/fetch-blogs")
      .then((res) => {
        if (!alive) return;
        setBlogs(Array.isArray(res.data) ? res.data : []);
        setState("ok");
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(blogs.map((b) => b.cat_name).filter(Boolean))],
    [blogs],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogs.filter(
      (b) =>
        (category === "All" || b.cat_name === category) &&
        (!q ||
          (b.title || "").toLowerCase().includes(q) ||
          excerpt(b.message, 400).toLowerCase().includes(q)),
    );
  }, [blogs, category, query]);

  return (
    <>
      <div className="section page-banner-section user-login-banner">
        <div className="container">
          <div className="page-banner-wrap">
            <div className="page-banner text-center">
              <h2 className="title">Articles</h2>
              <p className="tb-banner-sub">
                Practical writing from the TechBlog community.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="tb-list-section">
        <div className="tb-home-container">
          {state === "loading" && <p className="tb-state">Loading articles…</p>}
          {state === "error" && (
            <div className="tb-empty-state">
              <h4>Could not load articles</h4>
              <p>Check that the server is running, then refresh the page.</p>
            </div>
          )}
          {state === "ok" && blogs.length === 0 && (
            <div className="tb-empty-state">
              <h4>No articles yet</h4>
              <p>Be the first to publish one from your account.</p>
            </div>
          )}
          {state === "ok" && blogs.length > 0 && (
            <>
              <div className="tb-filter-bar">
                <div className="tb-filter-search">
                  <input
                    type="search"
                    aria-label="Search articles"
                    placeholder="Search articles"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="tb-chip-row">
                  {categories.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`tb-chip ${category === name ? "is-active" : ""}`}
                      onClick={() => setCategory(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              {visible.length > 0 ? (
                <div className="tb-blog-grid">
                  {visible.map((blog) => (
                    <BlogCard
                      key={blog.blog_id}
                      blog={blog}
                      to={`${detailsPath}${blog.blog_id}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="tb-empty-state">
                  <h4>No matching articles</h4>
                  <p>Try a different word or category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogList;
