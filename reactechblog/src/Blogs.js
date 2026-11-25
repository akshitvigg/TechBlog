import PublicNavbar from "./Components/PublicNavbar";
import BlogList from "./Components/BlogList";
import Footer from "./Footer";

const Blogs = () => (
  <>
    <PublicNavbar />
    <BlogList detailsPath="/blog-details/" />
    <Footer />
  </>
);

export default Blogs;
