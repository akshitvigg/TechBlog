import { Link } from "react-router-dom";
import { excerpt, readingTime } from "./textUtils";

const BlogCard = ({ blog, to }) => {
  const { title, fullname, bdt, cat_name, message } = blog;
  const author = fullname || "Member";
  return (
    <article className="tb-blog-card">
      <div className="tb-blog-card-top">
        {cat_name ? (
          <span className="tb-category-chip">{cat_name}</span>
        ) : (
          <span />
        )}
        <span>{readingTime(message)} min read</span>
      </div>
      <h3>
        <Link to={to}>{title}</Link>
      </h3>
      <p>{excerpt(message)}</p>
      <div className="tb-blog-card-foot">
        <span className="tb-avatar" aria-hidden="true">
          {author.charAt(0).toUpperCase()}
        </span>
        <div>
          <strong>{author}</strong>
          <span>{bdt}</span>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
