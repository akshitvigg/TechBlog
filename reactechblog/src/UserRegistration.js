import {ErrorMessage} from "@hookform/error-message";
import {useForm} from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import {useState} from "react";

const UserRegistration = () => {
    const [submitting, setSubmitting] = useState(false);
    const {register, handleSubmit, reset, formState: {errors}} = useForm();

    async function registerForm(data) {
        setSubmitting(true);
        try {
            const response = await axios.post("/user-registration", data);
            if (response.data === "inserted") {
                reset();
                await Swal.fire({icon: "success", title: "You're on the list", text: "Your TechBlog account is ready.", confirmButtonText: "Great"});
            } else if (response.data === "exists") {
                await Swal.fire({icon: "info", title: "Email already registered", text: "Sign in with this email or use another one."});
            } else {
                await Swal.fire({icon: "error", title: "Registration failed", text: typeof response.data === "string" ? response.data : "Please check your details and try again."});
            }
        } catch (error) {
            const message = error.response?.data;
            await Swal.fire({
                icon: "error",
                title: "Could not create your account",
                text: typeof message === "string" ? message : "Please check your connection and try again."
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="tb-auth-card tb-auth-card-register" id="register" aria-labelledby="user-register-title">
            <div className="tb-auth-card-heading">
                <span className="tb-auth-eyebrow">JOIN THE COMMUNITY</span>
                <h2 id="user-register-title">Create account</h2>
                <p>Ask questions, share what you know, and keep learning.</p>
            </div>
            <form className="tb-auth-form" onSubmit={handleSubmit(registerForm)} noValidate>
                <div className="tb-auth-field">
                    <label htmlFor="register-name">Full name</label>
                    <input
                        id="register-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        {...register("fullname", {required: "Your name is required", minLength: {value: 2, message: "Enter at least 2 characters"}})}
                    />
                    <ErrorMessage name="fullname" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                </div>
                <div className="tb-auth-field">
                    <label htmlFor="register-email">Email address</label>
                    <input
                        id="register-email"
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
                    <label htmlFor="register-phone">Phone number</label>
                    <input
                        id="register-phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="numeric"
                        placeholder="10–15 digits"
                        {...register("phone", {
                            required: "Phone number is required",
                            pattern: {value: /^\d{10,15}$/, message: "Enter 10 to 15 digits, without spaces"}
                        })}
                    />
                    <ErrorMessage name="phone" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                </div>
                <div className="tb-auth-field">
                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        {...register("password", {
                            required: "Password is required",
                            minLength: {value: 6, message: "Password must be at least 6 characters"}
                        })}
                    />
                    <ErrorMessage name="password" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                </div>
                <button className="tb-auth-submit" type="submit" disabled={submitting}>
                    {submitting ? "Creating account..." : "Create account"}
                </button>
                <p className="tb-auth-note">By joining, you agree to keep discussions helpful and respectful.</p>
            </form>
        </section>
    );
};

export default UserRegistration;
