import { FaPlusCircle, FaRegEye} from "react-icons/fa";
import {useEffect, useState} from "react";
import axios from "axios";
import TextEditorRender from "../TextEditorRender";
import {Link} from "react-router-dom";
import {Button, Modal} from "react-bootstrap";
import {ErrorMessage} from "@hookform/error-message";
import {useForm} from "react-hook-form";
import Swal from "sweetalert2";

const UserHome = () => {
    let [user, setUser] = useState("");
    let [status, setStatus] = useState(true);
    let [questions, setQuestions] = useState([]);
    let [qid, setQid] = useState(0);
    const [show, setShow] = useState(false);
    let {register, handleSubmit, reset, formState: {errors}} = useForm()

    useEffect(() => {
        axios.get("/user-check-authentication").then(res => {
            // console.log(res.data);
            setUser(res.data);
        })

        axios.get("/get-questions").then(res => {
            console.log(res.data);
            setQuestions(res.data);
            setStatus(false);
        })
    }, [])
    const handleClose = () => setShow(false);
    const handleShow = (quesid) => {
        setQid(quesid)
        setShow(true)

    };
    let addAnswer = (data) => {
        console.log(data)
        let {qid,answer} = data;
        answer =`<pre>${answer}</pre>`
        axios.post("/add-answers", {
            qid,answer
        }).then(res => {
            if (res.data === "inserted") {
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Answer added successfully',
                    showConfirmButton:false,
                    timer:1500
                })
            } else {
                Swal.fire({icon: "error", title: "Could not add answer", text: res.data});
            }
        }).catch(error => {
            Swal.fire({
                icon: "error",
                title: "Could not add answer",
                text: error.response?.data || "Check your connection and try again."
            });
        })
    }

    return (
        <>
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
                                    <h2 className="title">Welcome, {user}</h2>
                                    <h3 className={"text-white"}>Questions &amp; Answers</h3>
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
                            <div className="col-lg-12">
                                {
                                    status ?
                                        <div className={"text-center mt-5"}>
                                            <div className={"spinner-grow text-warning"} role={"status"}></div>
                                        </div>
                                        :
                                        questions.length === 0 ?
                                            <div className={"alert alert-info mt-4"}>No questions from other users yet.</div>
                                            :
                                            questions.map((value, index) => {
                                                let {qdate, question, ques_id, cat_name} = value;
                                                return (
                                                    <article key={ques_id} className="tb-question-card">
                                                        <div className="tb-question-meta">
                                                            <span className="tb-category-chip">{cat_name || "Question"}</span>
                                                            <span>Posted {qdate}</span>
                                                        </div>
                                                        <div className="tb-question-content">
                                                            <TextEditorRender htmlString={question}/>
                                                        </div>
                                                        <div className="tb-question-actions">
                                                            <Button type="button" className="btn btn-4"
                                                                    onClick={() => handleShow(ques_id)}>
                                                                <FaPlusCircle/> Add an answer
                                                            </Button>
                                                            <Link to={`/user/view-others-answers/${ques_id}`} className="btn btn-3">
                                                                <FaRegEye/> View answers
                                                            </Link>
                                                        </div>
                                                    </article>
                                                )
                                            })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className={"text-dark"}>Add New Answer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form id={"form"} onSubmit={handleSubmit(addAnswer)}>
                        <div className={"row mb-4"}>
                            <div className={"col-lg-12"}>
                                <div className="single-form">
                                    <input type={"hidden"} value={qid} {...register('qid')} />
                                    <label htmlFor={"category"} className={"text-dark"}>Answer</label>
                                    <textarea rows={"5"} {...register('answer', {required: "Answer is required"})}/>
                                    <ErrorMessage name={"answer"} errors={errors}
                                                  render={({message}) => <p
                                                      className={"text-danger"}>{message}</p>}></ErrorMessage>

                                </div>
                            </div>
                            <div className={"col-lg-12 mt-3"}>
                                <div className="single-form">
                                    <button type={"submit"} className={"btn btn-1"}>Submit</button>
                                </div>
                            </div>

                        </div>

                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
export default UserHome;