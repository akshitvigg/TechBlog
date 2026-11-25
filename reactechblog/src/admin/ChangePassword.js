import {ErrorMessage} from "@hookform/error-message";
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ChangePassword = () => {
    const [username, setUsername] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const {register, handleSubmit, reset, getValues, formState: {errors}} = useForm();

    useEffect(() => {
        axios.get("/admin-check-authentication")
            .then(response => {
                if (response.data !== "fails") setUsername(response.data);
            })
            .catch(() => Swal.fire({icon: "error", title: "Could not load account details", text: "Refresh the page and try again."}));
    }, []);

    async function changePassword(data) {
        setSubmitting(true);
        try {
            const response = await axios.post("/update-password", {
                opassword: data.opassword,
                npassword: data.npassword,
                cpassword: data.cpassword
            });
            if (response.data === "updated") {
                reset();
                await Swal.fire({icon: "success", title: "Password updated", text: "Your admin password has been changed."});
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
            <section className="tb-account-card" aria-labelledby="admin-change-password-title">
                <div className="tb-account-heading">
                    <span className="tb-auth-eyebrow">ACCOUNT SECURITY</span>
                    <h1 id="admin-change-password-title">Change admin password</h1>
                    <p>Choose a password you do not use elsewhere.</p>
                </div>
                <p className="tb-account-identity"><span>Signed in as</span><strong>{username || "Loading account..."}</strong></p>
                <form className="tb-auth-form" onSubmit={handleSubmit(changePassword)} noValidate>
                    <div className="tb-auth-field">
                        <label htmlFor="admin-old-password">Current password</label>
                        <input id="admin-old-password" type="password" autoComplete="current-password"
                               {...register("opassword", {required: "Current password is required"})}/>
                        <ErrorMessage name="opassword" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                    </div>
                    <div className="tb-auth-field">
                        <label htmlFor="admin-new-password">New password</label>
                        <input id="admin-new-password" type="password" autoComplete="new-password"
                               {...register("npassword", {required: "New password is required", minLength: {value: 6, message: "Use at least 6 characters"}})}/>
                        <ErrorMessage name="npassword" errors={errors} render={({message}) => <p className="tb-field-error">{message}</p>}/>
                    </div>
                    <div className="tb-auth-field">
                        <label htmlFor="admin-confirm-password">Confirm new password</label>
                        <input id="admin-confirm-password" type="password" autoComplete="new-password"
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

export default ChangePassword;
