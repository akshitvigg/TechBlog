import {Link} from "react-router-dom";
import {FaBookOpen, FaComments, FaUserShield} from "react-icons/fa";
import PublicNavbar from "./Components/PublicNavbar";
import Footer from "./Footer";

const About = () => (
    <>
        <PublicNavbar/>
        <main className="tb-about-page">
            <section className="tb-about-hero">
                <div className="tb-about-hero-inner">
                    <span className="tb-about-eyebrow">ABOUT TECHBLOG</span>
                    <h1>Technology makes more sense <span>when we learn together.</span></h1>
                    <p>TechBlog brings technical articles and community Q&amp;A into one welcoming place to explore, ask, and share.</p>
                    <div className="tb-about-actions">
                        <Link to="/blogs" className="tb-about-primary">Explore articles <span aria-hidden="true">→</span></Link>
                        <Link to="/user-LoginRegister" className="tb-about-secondary">Join the community</Link>
                    </div>
                </div>
                <div className="tb-about-hero-mark" aria-hidden="true">TB<span>.</span></div>
            </section>

            <section className="tb-about-content">
                <div className="tb-about-section-heading">
                    <span className="tb-about-eyebrow">WHAT YOU CAN DO HERE</span>
                    <h2>A small platform with a clear purpose.</h2>
                    <p>Read, ask, and contribute—with moderation helping keep shared answers useful.</p>
                </div>
                <div className="tb-about-feature-grid">
                    <article className="tb-about-feature">
                        <span className="tb-about-icon"><FaBookOpen/></span>
                        <h3>Discover tech articles</h3>
                        <p>Browse blog posts by category and join the conversation through comments.</p>
                    </article>
                    <article className="tb-about-feature">
                        <span className="tb-about-icon"><FaComments/></span>
                        <h3>Ask the community</h3>
                        <p>Post technical questions, search what others have asked, and contribute answers.</p>
                    </article>
                    <article className="tb-about-feature">
                        <span className="tb-about-icon"><FaUserShield/></span>
                        <h3>Thoughtful moderation</h3>
                        <p>Answers are reviewed by admins before they are shown publicly.</p>
                    </article>
                </div>
            </section>

            <section className="tb-about-bottom">
                <div>
                    <span className="tb-about-eyebrow">READY TO TAKE PART?</span>
                    <h2>Bring your question. Leave with a new idea.</h2>
                </div>
                <Link to="/user-LoginRegister" className="tb-about-primary">Get started <span aria-hidden="true">→</span></Link>
            </section>
        </main>
        <Footer/>
    </>
);

export default About;
