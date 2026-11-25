import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import TextEditorRender from "../TextEditorRender";
import { readingTime } from "./textUtils";

// Loads one blog and renders it. Anything passed as children (comments, sign-in note)
// is shown under the article once it has loaded.
const BlogArticle = ({ blogId, backTo, backLabel, children }) => {
  const [blog, setBlog] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let alive = true;
    setState("loading");
    axios
      .get("/blog-details/" + blogId)
      .then((res) => {
        if (!alive) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBlog(res.data[0]);
          setState("ok");
        } else {
          setState("missing");
        }
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [blogId]);

  if (state !== "ok") {
    return (
      <div className="tb-article-state">
        {state === "loading" && <p>Loading article…</p>}
        {state === "missing" && (
          <>
            <h2>Article not found</h2>
            <p>It may have been removed by its author.</p>
          </>
        )}
        {state === "error" && (
          <>
            <h2>Could not load this article</h2>
            <p>Check your connection and refresh the page.</p>
          </>
        )}
        {state !== "loading" && (
          <Link to={backTo} className="tb-back-link">
            ← {backLabel}
          </Link>
        )}
      </div>
    );
  }

  const { title, message, fullname, bdt, cat_name } = blog;
  const author = fullname || "Member";

  return (
    <>
      <header className="tb-article-hero">
        <div className="tb-article-inner">
          <Link to={backTo} className="tb-back-link">
            ← {backLabel}
          </Link>
          <div className="tb-article-meta">
            {cat_name && <span className="tb-category-chip">{cat_name}</span>}
            <span>{readingTime(message)} min read</span>
          </div>
          <h1>{title}</h1>
          <div className="tb-byline">
            <span className="tb-avatar" aria-hidden="true">
              {author.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{author}</strong>
              <span>Published {bdt}</span>
            </div>
          </div>
        </div>
      </header>
      <div className="tb-article-wrap">
        <article className="tb-article-body">
          <TextEditorRender htmlString={message} />
        </article>
        {children}
      </div>
    </>
  );
};

export default BlogArticle;
