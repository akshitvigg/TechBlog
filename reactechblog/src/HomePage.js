import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaComments,
  FaLightbulb,
  FaShieldAlt,
} from "react-icons/fa";
import PublicNavbar from "./Components/PublicNavbar";
import BlogCard from "./Components/BlogCard";
import { excerpt } from "./Components/textUtils";
import Footer from "./Footer";

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Both lists are optional: if the server is down or empty, those sections simply hide.
  useEffect(() => {
    axios
      .get("/fetch-blogs")
      .then((res) => Array.isArray(res.data) && setBlogs(res.data.slice(0, 3)))
      .catch(() => {});
    axios
      .get("/get-questions")
      .then(
        (res) => Array.isArray(res.data) && setQuestions(res.data.slice(0, 4)),
      )
      .catch(() => {});
  }, []);

  const latest = questions[0];

  return (
    <div className="tb-home">
      <PublicNavbar />
      <main>
        <section className="tb-hero">
          <div className="tb-home-container tb-hero-content">
            <div className="tb-hero-copy">
              <span className="tb-eyebrow">
                <FaLightbulb /> A community for curious minds
              </span>
              <h1>
                Learn together.
                <br />
                <span>Build better.</span>
              </h1>
              <p>
                Share what you know, ask the questions you are working through,
                and learn from a community of technology enthusiasts.
              </p>
              <div className="tb-hero-actions">
                <Link className="tb-primary-button" to="/user-LoginRegister">
                  Join the community
                </Link>
                <Link className="tb-secondary-button" to="/blogs">
                  Explore articles
                </Link>
              </div>
              <div className="tb-hero-note">
                <FaShieldAlt /> Helpful knowledge, with answers reviewed by
                admins
              </div>
            </div>
            {latest && (
              <aside className="tb-hero-card" aria-label="Latest question">
                <div className="tb-hero-card-top">
                  <span>Latest question</span>
                  {latest.cat_name && (
                    <span className="tb-category-chip">{latest.cat_name}</span>
                  )}
                </div>
                <p className="tb-hero-card-text">
                  {excerpt(latest.question, 180)}
                </p>
                <div className="tb-hero-card-foot">
                  <span>{latest.quesDate}</span>
                  <span>
                    <FaShieldAlt /> Answers reviewed
                  </span>
                </div>
              </aside>
            )}
          </div>
        </section>

        {blogs.length > 0 && (
          <section className="tb-latest-section">
            <div className="tb-home-container">
              <div className="tb-section-row">
                <div>
                  <h2>Latest articles</h2>
                  <p>Fresh writing from people who build things.</p>
                </div>
                <Link to="/blogs" className="tb-link-arrow">
                  All articles <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="tb-blog-grid">
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog.blog_id}
                    blog={blog}
                    to={`/blog-details/${blog.blog_id}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="tb-home-section">
          <div className="tb-home-container">
            <div className="tb-section-heading">
              <span className="tb-eyebrow">One place to share and grow</span>
              <h2>Knowledge moves forward when we share it.</h2>
              <p>
                TechBlog brings technical articles and community Q&amp;A
                together in a simple, organized space.
              </p>
            </div>
            <div className="tb-feature-grid">
              <article className="tb-feature-card">
                <span className="tb-feature-icon tb-icon-blue">
                  <FaComments />
                </span>
                <h3>Ask and answer</h3>
                <p>
                  Ask technical questions, share practical answers, and find
                  help from other learners.
                </p>
                <Link to="/user-LoginRegister">
                  Explore the Q&amp;A community{" "}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
              <article className="tb-feature-card">
                <span className="tb-feature-icon tb-icon-violet">
                  <FaBookOpen />
                </span>
                <h3>Write and discover</h3>
                <p>
                  Publish technical blogs by category and learn from articles
                  written by the community.
                </p>
                <Link to="/blogs">
                  Browse technical blogs <span aria-hidden="true">→</span>
                </Link>
              </article>
              <article className="tb-feature-card">
                <span className="tb-feature-icon tb-icon-green">
                  <FaShieldAlt />
                </span>
                <h3>Keep it constructive</h3>
                <p>
                  Admin review helps keep answers organized and supports a more
                  useful learning space.
                </p>
                <Link to="/about-us">
                  Learn about TechBlog <span aria-hidden="true">→</span>
                </Link>
              </article>
            </div>
          </div>
        </section>

        {questions.length > 0 && (
          <section className="tb-questions-section">
            <div className="tb-home-container">
              <div className="tb-section-row">
                <div>
                  <h2>Recently asked</h2>
                  <p>Questions the community is working through right now.</p>
                </div>
                <Link to="/user-LoginRegister" className="tb-link-arrow">
                  Sign in to answer <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="tb-q-grid">
                {questions.map((q) => (
                  <article className="tb-q-item" key={q.ques_id}>
                    {q.cat_name && (
                      <span className="tb-category-chip">{q.cat_name}</span>
                    )}
                    <p>{excerpt(q.question, 160)}</p>
                    <div className="tb-q-item-foot">
                      <span>Asked {q.quesDate}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="tb-steps-section">
          <div className="tb-home-container tb-steps-layout">
            <div>
              <span className="tb-eyebrow">Getting started</span>
              <h2>Turn a question into shared knowledge.</h2>
              <p>
                Create an account, join a discussion, or publish a guide. Your
                next useful contribution can start small.
              </p>
            </div>
            <ol className="tb-steps-list">
              <li>
                <span>01</span>
                <div>
                  <strong>Join</strong>
                  <p>Create your learner account.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Contribute</strong>
                  <p>Ask, answer, write, and comment.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Learn together</strong>
                  <p>Discover helpful ideas from the community.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="tb-cta-section">
          <div className="tb-home-container">
            <div className="tb-cta-band">
              <div>
                <h2>Got a question stuck in your head?</h2>
                <p>
                  Ask it here. Someone has probably been through it already.
                </p>
              </div>
              <Link to="/user-LoginRegister" className="tb-cta-btn">
                Create a free account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
