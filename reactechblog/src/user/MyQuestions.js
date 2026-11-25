import {useEffect, useState} from "react";
import axios from "axios";
import {FaRegEye, FaTrashAlt} from "react-icons/fa";
import Swal from "sweetalert2";
import {Link} from "react-router-dom";
import {excerpt} from "../Components/textUtils";
import ReactLoading from "react-loading";
const MyQuestions = () => {
    let [questions, setQuestions] = useState([])
    let [status,setStatus] = useState(true)
    useEffect(() => {
        view_questions();
    }, [])

    function view_questions() {
        return axios.get("/view-my-questions").then(res => {
            // console.log(res.data);
            setQuestions(res.data)
            setStatus(false)
        })
    }

    async function del_question(qid) {
        const result = await Swal.fire({
            title: "Delete this question?",
            text: "Its answers will also be deleted. This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete question",
            confirmButtonColor: "#c44949"
        });
        if (!result.isConfirmed) return;
        try {
            const response = await axios.delete("/del-question/" + qid);
            if (response.data === "deleted") {
                await view_questions();
                Swal.fire({icon: "success", title: "Question deleted", timer: 1200, showConfirmButton: false});
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Could not delete question",
                text: error.response?.data || "Please try again."
            });
        }
    }

    return (
        <>
            <div className="section page-banner-section user-login-banner">
                <div className="shape-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="726.5px" height="726.5px">
                        <path fillRule="evenodd" stroke="rgb(255, 255, 255)" strokeWidth="1px"
                              strokeLinecap="butt"
                              strokeLinejoin="miter" opacity="0.302" fill="none"
                              d="M28.14,285.269 L325.37,21.217 C358.860,-8.851 410.655,-5.808 440.723,28.14 L704.777,325.36 C734.846,358.859 731.802,410.654 697.979,440.722 L400.955,704.776 C367.132,734.844 315.338,731.802 285.269,697.978 L21.216,400.954 C-8.852,367.132 -5.808,315.337 28.14,285.269 Z"/>
                    </svg>
                </div>
                <div className="shape-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="972.5px" height="970.5px">
                        <path fillRule="evenodd" stroke="rgb(255, 255, 255)" strokeWidth="1px"
                              strokeLinecap="butt"
                              strokeLinejoin="miter" fill="none"
                              d="M38.245,381.102 L435.258,28.158 C480.467,-12.32 549.697,-7.964 589.888,37.244 L942.832,434.257 C983.23,479.466 978.955,548.697 933.746,588.888 L536.733,941.832 C491.524,982.23 422.293,977.955 382.103,932.745 L29.158,535.732 C-11.32,490.523 -6.963,421.293 38.245,381.102 Z"/>
                    </svg>
                </div>
                <div className="container">
                    <div className="page-banner-wrap">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="page-banner text-center">
                                    <h2 className="title">My Questions</h2>

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
                                <div className="login-register-form">
                                    {
                                        status ?
                                            <ReactLoading type={"spinningBubbles"} color={"coral"}></ReactLoading> :
                                            questions.length > 0 ?
                                                <div className="tb-my-question-list">
                                                    {questions.map(({ques_id, question, cat_name, qdate}) => (
                                                        <article className="tb-my-question-card" key={ques_id}>
                                                            <div className="tb-my-question-meta">
                                                                <span className="tb-category-chip">{cat_name || "Question"}</span>
                                                                <time>{qdate}</time>
                                                            </div>
                                                            <p>{excerpt(question, 240)}</p>
                                                            <div className="tb-my-question-actions">
                                                                <Link to={"/user/my-answers/" + ques_id} className="tb-my-question-link">
                                                                    <FaRegEye/> View answers
                                                                </Link>
                                                                <button type="button" className="tb-my-question-delete"
                                                                        onClick={() => del_question(ques_id)}>
                                                                    <FaTrashAlt/> Delete question
                                                                </button>
                                                            </div>
                                                        </article>
                                                    ))}
                                                </div>
                                                        :
                                                        <div className="tb-empty-state">
                                                            <h4>No questions yet</h4>
                                                            <p>Questions you post will be collected here.</p>
                                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default MyQuestions;