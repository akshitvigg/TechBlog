import { Link, useParams } from "react-router-dom";
import PublicNavbar from "./Components/PublicNavbar";
import BlogArticle from "./Components/BlogArticle";
import Footer from "./Footer";

const BlogDetails = () => {
  const { blog_id } = useParams();
  return (
    <>
      <PublicNavbar />
      <BlogArticle blogId={blog_id} backTo="/blogs" backLabel="All articles">
        <aside className="tb-signin-note">
          <div>
            <strong>Want to join the discussion?</strong>
            <p>Sign in to comment on articles and ask your own questions.</p>
          </div>
          <Link to="/user-LoginRegister" className="tb-primary-button">
            Sign in / Join
          </Link>
        </aside>
      </BlogArticle>
      <Footer />
    </>
  );
};

export default BlogDetails;
