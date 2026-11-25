import {ErrorMessage} from "@hookform/error-message";
import {useForm} from "react-hook-form";
import {useNavigate, Link} from "react-router-dom";
import {useState} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PublicNavbar from "../Components/PublicNavbar";
import Footer from "../Footer";

const AdminLogin = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const {register, handleSubmit, formState: {errors}} = useForm();

    async function loginAction(data) {
        setSubmitting(true);
        try {
            const response = await axios.post("/admin-login-action", data);
            if (response.data === "success") {
                navigate("/admin/home");
                return;
            }
            await Swal.fire({icon: "error", title: "Unable to sign in", text: "Check your username and password and try again."});
        } catch {
            await Swal.fire({icon: "error", title: "Sign in failed", text: "The service could not be reached. Please try again."});
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <PublicNavbar/>
            <main className="tb-auth-page tb-admin-login-page">
                <div className="tb-auth-intro">
                    <span className="tb-auth-eyebrow">TECHBLOG ADMIN</span>
                    <h1>Keep the community <span>thoughtful and useful.</span></h1>
                    <p>Sign in to review answers, manage categories, and keep the knowledge base organized.</p>
                    <Link to="/" className="tb-auth-explore-link">Back to TechBlog <span aria-hidden="true">→</span></Link>
                </div>
                <section className="tb-auth-card tb-admin-login-card" aria-labelledby="admin-login-title">
                    <div className="tb-auth-card-heading">
                        <span className="tb-auth-eyebrow">ADMIN ACCESS</span>
                        <h2 id="admin-login-title">Welcome back</h2>
                        <p>Use your administrator account to continue.</p>
                    </div>
                    <form className="tb-auth-form" onSubmit={handleSubmit(loginAction)} noValidate>
                        <div className="tb-auth-field">
                            <label htmlFor="admin-username">Username</label>
                            <input id="admin-username" type="text" autoComplete="username" placeholder="Your admin username"
                                   {...register("username", {required: "Username is required"})}/>
                            <ErrorMessage name="username" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                        </div>
                        <div className="tb-auth-field">
                            <label htmlFor="admin-password">Password</label>
                            <input id="admin-password" type="password" autoComplete="current-password" placeholder="Enter your password"
                                   {...register("password", {required: "Password is required"})}/>
                            <ErrorMessage name="password" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                        </div>
                        <button className="tb-auth-submit" type="submit" disabled={submitting}>
                            {submitting ? "Signing in..." : "Sign in to admin"}
                        </button>
                    </form>
                </section>
            </main>
            <Footer/>
        </>
    );
};

export default AdminLogin;
