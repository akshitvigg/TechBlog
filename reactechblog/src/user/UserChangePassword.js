import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {ErrorMessage} from "@hookform/error-message";
import axios from "axios";
import Swal from "sweetalert2";

const UserChangePassword = () => {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const {register, handleSubmit, reset, getValues, formState: {errors}} = useForm();

    useEffect(() => {
        axios.get("/user-check-authentication")
            .then(response => {
                if (response.data !== "fails") setEmail(response.data);
            })
            .catch(() => Swal.fire({icon: "error", title: "Could not load account details", text: "Refresh the page and try again."}));
    }, []);

    async function changePassword(data) {
        setSubmitting(true);
        try {
            const response = await axios.post("/user-update-password", {
                opassword: data.opassword,
                npassword: data.npassword,
                cpassword: data.cpassword
            });
            if (response.data === "updated") {
                reset();
                await Swal.fire({icon: "success", title: "Password updated", text: "Your account password has been changed."});
            } else if (response.data === "Old not") {
                await Swal.fire({icon: "error", title: "Current password is incorrect"});
            } else if (response.data === "new and confirm not") {
                await Swal.fire({icon: "error", title: "Passwords do not match", text: "Enter the same new password in both fields."});
            } else {
                await Swal.fire({icon: "error", title: "Password was not updated", text: "Please review the form and try again."});
            }
        } catch (error) {
            const message = error.response?.data;
            await Swal.fire({icon: "error", title: "Password update failed", text: typeof message === "string" ? message : "Please check your connection and try again."});
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="tb-account-page">
            <section className="tb-account-card" aria-labelledby="user-change-password-title">
                <div className="tb-account-heading">
                    <span className="tb-auth-eyebrow">ACCOUNT SECURITY</span>
                    <h1 id="user-change-password-title">Change your password</h1>
                    <p>Choose a password you do not use elsewhere.</p>
                </div>
                <p className="tb-account-identity"><span>Signed in as</span><strong>{email || "Loading account..."}</strong></p>
                <form className="tb-auth-form" onSubmit={handleSubmit(changePassword)} noValidate>
                    <div className="tb-auth-field">
                        <label htmlFor="user-old-password">Current password</label>
                        <input id="user-old-password" type="password" autoComplete="current-password"
                               {...register("opassword", {required: "Current password is required"})}/>
                        <ErrorMessage name="opassword" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                    </div>
                    <div className="tb-auth-field">
                        <label htmlFor="user-new-password">New password</label>
                        <input id="user-new-password" type="password" autoComplete="new-password"
                               {...register("npassword", {required: "New password is required", minLength: {value: 6, message: "Use at least 6 characters"}})}/>
                        <ErrorMessage name="npassword" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                    </div>
                    <div className="tb-auth-field">
                        <label htmlFor="user-confirm-password">Confirm new password</label>
                        <input id="user-confirm-password" type="password" autoComplete="new-password"
                               {...register("cpassword", {
                                   required: "Please confirm your new password",
                                   validate: value => value === getValues("npassword") || "Passwords do not match"
                               })}/>
                        <ErrorMessage name="cpassword" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                    </div>
                    <button className="tb-auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Updating password..." : "Update password"}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default UserChangePassword;
