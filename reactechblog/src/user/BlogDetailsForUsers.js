import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import BlogArticle from "../Components/BlogArticle";
import TextEditorRender from "../TextEditorRender";

const BlogDetailsForUsers = () => {
  const { blog_id } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchComments = useCallback(() => {
    return axios
      .get("/fetch-comments/" + blog_id)
      .then((res) => setComments(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [blog_id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function postComment({ comment }) {
    setSubmitting(true);
    try {
      const res = await axios.post("/post-comment", {
        comment: `<pre>${comment}</pre>`,
        blog_id,
      });
      if (res.data === "inserted") {
        reset();
        await fetchComments();
      } else {
        Swal.fire({
          icon: "error",
          title: "Could not post comment",
          text: typeof res.data === "string" ? res.data : "",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Could not post comment",
        text:
          typeof error.response?.data === "string"
            ? error.response.data
            : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const newestFirst = [...comments].reverse();

  return (
    <BlogArticle
      blogId={blog_id}
      backTo="/user/all-blogs"
      backLabel="All articles"
    >
      <section className="tb-comments" aria-labelledby="comments-title">
        <h2 id="comments-title">Comments ({comments.length})</h2>
        <p>Keep it helpful and respectful.</p>

        <form
          className="tb-comment-form"
          onSubmit={handleSubmit(postComment)}
          noValidate
        >
          <textarea
            aria-label="Write a comment"
            placeholder="Add to the discussion"
            {...register("comment", {
              required: "Write something before posting",
            })}
          />
          {errors.comment && (
            <p className="tb-field-error">{errors.comment.message}</p>
          )}
          <button
            className="tb-auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
        </form>

        {loading && <p className="tb-state">Loading comments…</p>}
        {!loading && newestFirst.length === 0 && (
          <div className="tb-empty-state">
            <h4>No comments yet</h4>
            <p>Start the conversation.</p>
          </div>
        )}
        {newestFirst.map((item, index) => {
          const name = (item.user || "Member").split("@")[0];
          return (
            <div className="tb-comment" key={item.comment_id || index}>
              <span className="tb-avatar" aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </span>
              <div className="tb-comment-body">
                <div className="tb-comment-head">
                  <strong>{name}</strong>
                  <span>{item.cDT}</span>
                </div>
                <div className="tb-comment-text">
                  <TextEditorRender htmlString={item.comment} />
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </BlogArticle>
  );
};

export default BlogDetailsForUsers;
