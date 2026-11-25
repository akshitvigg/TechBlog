import {ErrorMessage} from "@hookform/error-message";
import {useForm} from "react-hook-form";
import {useNavigate, Link} from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {useState} from "react";

const UserLogin = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const {register, handleSubmit, formState: {errors}} = useForm();

    async function loginAction(data) {
        setSubmitting(true);
        try {
            const response = await axios.post("/userLoginAction", data);
            if (response.data === "loggedIn") {
                navigate("/user/home");
                return;
            }
            await Swal.fire({icon: "error", title: "Unable to sign in", text: "Check your email and password and try again."});
        } catch {
            await Swal.fire({icon: "error", title: "Sign in failed", text: "The service could not be reached. Please try again."});
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="tb-auth-card" aria-labelledby="user-login-title">
            <div className="tb-auth-card-heading">
                <span className="tb-auth-eyebrow">WELCOME BACK</span>
                <h2 id="user-login-title">Sign in</h2>
                <p>Pick up where your curiosity left off.</p>
            </div>
            <form className="tb-auth-form" onSubmit={handleSubmit(loginAction)} noValidate>
                <div className="tb-auth-field">
                    <label htmlFor="login-email">Email address</label>
                    <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address"}
                        })}
                    />
                    <ErrorMessage name="email" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                </div>
                <div className="tb-auth-field">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        {...register("password", {required: "Password is required"})}
                    />
                    <ErrorMessage name="password" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                </div>
                <button className="tb-auth-submit" type="submit" disabled={submitting}>
                    {submitting ? "Signing in..." : "Sign in"}
                </button>
                <p className="tb-auth-switch">New to TechBlog? <Link to="/user-LoginRegister#register">Create an account</Link></p>
            </form>
        </section>
    );
};

export default UserLogin;
