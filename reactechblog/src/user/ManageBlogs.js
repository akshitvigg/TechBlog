import {FaEdit, FaPlus, FaTrash} from "react-icons/fa";
import {Button, Modal} from "react-bootstrap";
import {ErrorMessage} from "@hookform/error-message";
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import ReactLoading from "react-loading";
import {Link} from "react-router-dom";
import {excerpt} from "../Components/textUtils";

const ManageBlogs = () => {
    const [show, setShow] = useState(false);
    let [category, setCategoey] = useState([]);
    let [blogs, setBlogs] = useState([]);
    let [status, setStatus] = useState(true)
    const [editingBlogId, setEditingBlogId] = useState(null);
    const handleClose = () => setShow(false);
    const {register, handleSubmit, reset, formState: {errors, isSubmitting}} = useForm()
    const handleShow = () => {
        setEditingBlogId(null);
        reset({category: "", title: "", description: ""});
        setShow(true);
    };
    useEffect(() => {
        axios.get("/view-categories").then(res => {
            console.log(res.data);
            setCategoey(res.data);
        })
        viewBlogs();
    }, [])

    function editBlog(blog) {
        const content = document.createElement("div");
        content.innerHTML = blog.message || "";
        setEditingBlogId(blog.blog_id);
        reset({
            category: blog.category || "",
            title: blog.title || "",
            description: content.textContent || ""
        });
        setShow(true);
    }

    async function blogAction(data) {
        const payload = {
            category: data.category,
            message: `<pre>${data.description}</pre>`,
            title: data.title
        };
        try {
            const response = editingBlogId
                ? await axios.put(`/update-blog/${editingBlogId}`, payload)
                : await axios.post("/add-blog", payload);
            const expected = editingBlogId ? "updated" : "inserted";
            if (response.data !== expected) {
                await Swal.fire({icon: "error", title: "Could not save blog", text: "Please review the details and try again."});
                return;
            }
            reset();
            setShow(false);
            setEditingBlogId(null);
            await Swal.fire({
                icon: "success",
                title: editingBlogId ? "Blog updated" : "Blog added",
                showConfirmButton: false,
                timer: 1200
            });
            viewBlogs();
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: editingBlogId ? "Could not update blog" : "Could not add blog",
                text: typeof error.response?.data === "string" ? error.response.data : "Please check your connection and try again."
            });
        }
    }

    function viewBlogs() {
        axios.get("/view-my-blogs").then(res => {
            console.log(res.data);
            setBlogs(res.data)
            setStatus(false);
        })
    }

    function delBlog(blogId) {
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete("/del-blog/" + blogId).then(() => viewBlogs()).catch(error => {
                    Swal.fire({
                        icon: "error",
                        title: "Could not delete blog",
                        text: error.response?.data || "Please try again."
                    });
                });
            }
        });
    }

    return (<>
        <div className="section page-banner-section user-login-banner">
            <div className="shape-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="726.5px" height="726.5px">
                    <path fillRule="evenodd" stroke="rgb(255, 255, 255)" strokeWidth="1px" strokeLinecap="butt"
                          strokeLinejoin="miter" opacity="0.302" fill="none"
                          d="M28.14,285.269 L325.37,21.217 C358.860,-8.851 410.655,-5.808 440.723,28.14 L704.777,325.36 C734.846,358.859 731.802,410.654 697.979,440.722 L400.955,704.776 C367.132,734.844 315.338,731.802 285.269,697.978 L21.216,400.954 C-8.852,367.132 -5.808,315.337 28.14,285.269 Z"/>
                </svg>
            </div>
            <div className="shape-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="972.5px" height="970.5px">
                    <path fillRule="evenodd" stroke="rgb(255, 255, 255)" strokeWidth="1px" strokeLinecap="butt"
                          strokeLinejoin="miter" fill="none"
                          d="M38.245,381.102 L435.258,28.158 C480.467,-12.32 549.697,-7.964 589.888,37.244 L942.832,434.257 C983.23,479.466 978.955,548.697 933.746,588.888 L536.733,941.832 C491.524,982.23 422.293,977.955 382.103,932.745 L29.158,535.732 C-11.32,490.523 -6.963,421.293 38.245,381.102 Z"/>
                </svg>
            </div>
            <div className="container">
                <div className="page-banner-wrap">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="page-banner text-center">
                                <h2 className="title">Manage my Blogs</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="section login-register-section section-padding-02 mb-5">
            <div className="container">
                <div className="login-register-wrap">
                    <div className="row gx-5">
                        <div className="col-lg-12 mb-2">
                            <Button variant="primary" className={"mb-2"} onClick={handleShow}>
                                <FaPlus/> Add a blog
                            </Button>
                            {
                                status ?
                                    <ReactLoading type={"spinningBubbles"} color={"coral"}></ReactLoading> :
                                    blogs.length > 0 ?
                                        <div className="tb-my-blog-grid">
                                            {blogs.map((blog) => (
                                                <article className="tb-my-blog-card" key={blog.blog_id}>
                                                    <div className="tb-my-blog-meta">
                                                        <span className="tb-category-chip">{blog.cat_name || "Article"}</span>
                                                        <time>{blog.bdt}</time>
                                                    </div>
                                                    <h3>{blog.title}</h3>
                                                    <p>{excerpt(blog.message, 180) || "This article has no preview text yet."}</p>
                                                    <div className="tb-my-blog-actions">
                                                        <Link to={`/user/blog-details-user/${blog.blog_id}`} className="tb-my-blog-read">
                                                            Read article
                                                        </Link>
                                                        <div>
                                                            <button type="button" className="tb-my-blog-icon"
                                                                    aria-label={`Edit ${blog.title}`}
                                                                    onClick={() => editBlog(blog)}><FaEdit/></button>
                                                            <button type="button" className="tb-my-blog-icon is-danger"
                                                                    aria-label={`Delete ${blog.title}`}
                                                                    onClick={() => delBlog(blog.blog_id)}><FaTrash/></button>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                        :
                                        <div className="tb-empty-state">
                                            <h4>No articles yet</h4>
                                            <p>Your published blogs will appear here. Use “Add blog” to write your first one.</p>
                                        </div>
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className={"text-dark"}>{editingBlogId ? "Edit Blog" : "Add New Blog"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit(blogAction)}>
                    <div className={"row "}>
                        <div className={"col-lg-12 my-3"}>
                            <label htmlFor={"category"}>Category:</label>
                            <select id={"category"}
                                    className={"form-control"} {...register('category', {required: 'Category is required'})}>
                                <option value={""}>Select</option>
                                {category.map((value, index) => {
                                    let {cat_id, cat_name} = value;
                                    return (<option key={index} value={cat_id}>{cat_name}</option>)
                                })}
                            </select>
                            <ErrorMessage name={"category"} errors={errors}
                                          render={({message}) => <p
                                              className={"text-danger"}>{message}</p>}></ErrorMessage>
                        </div>
                        <div className={"col-lg-12 my-3"}>
                            <label htmlFor={"title"}>Title:</label>
                            <input id={"title"}
                                   className={"form-control"} {...register('title', {required: 'Title is required'})}/>

                            <ErrorMessage name={"title"} errors={errors}
                                          render={({message}) => <p
                                              className={"text-danger"}>{message}</p>}></ErrorMessage>
                        </div>
                        <div className={"col-lg-12 my-3"}>
                            <label htmlFor={"description"}>Description:</label>
                            <textarea
                                rows={"5"} {...register('description', {required: 'Description is required'})}/>
                            <ErrorMessage name={"description"} errors={errors}
                                          render={({message}) => <p
                                              className={"text-danger"}>{message}</p>}></ErrorMessage>
                        </div>
                        <div className={"col-lg-12"}>
                            <button type={"submit"} className={"btn btn-2"} disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : editingBlogId ? "Save changes" : "Publish blog"}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>

            </Modal.Footer>
        </Modal>

    </>)
}
export default ManageBlogs;