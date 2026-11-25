import {useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import ReactLoading from "react-loading";
import TextEditorRender from "../TextEditorRender";
import {BsFillXCircleFill, BsPatchCheckFill} from "react-icons/bs";

const ViewAnswers = () => {
    let {qid} = useParams();
    let [answers, setAnswers] = useState([])
    let [status, setStatus] = useState(true);
    const viewAnswers = useCallback(() => {
        return axios.get("/get-answers/" + qid).then(res => {
            console.log(res.data);
            setStatus(false)
            setAnswers(res.data);
        })
    }, [qid]);

    useEffect(() => {
        viewAnswers();
    }, [viewAnswers]);

    function upStatus(answer, status) {
        axios.post("/update-ans-status", {
            answer, status
        }).then(res => {
            if (res.data === "updated") {
                viewAnswers();
            }
        })
    }

    return (
        <>
            <section className="faq p-60">
                <div className="container">
                    <div className="heading">
                        <div className="mb-5">
                            <h3 className="light-black text-center mb-5">Answers for Ques. No. {qid}</h3>
                            {
                                status ?
                                    <ReactLoading type={"spinningBubbles"} color={"coral"}></ReactLoading>
                                    :
                                    answers.length > 0 ?
                                        <table className={"table"}>
                                            <thead>
                                            <tr className={"text-center"}>
                                                <th>Sr. No.</th>
                                                <th>Answer</th>
                                                <th>Posted On</th>
                                                <th>Visibility</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                answers.map((value, index) => {
                                                    let {ans_id, answer, adate, status, isAccepted} = value;
                                                    return (
                                                        <tr key={index} className={"text-center"}>
                                                            <td>{index + 1}</td>
                                                            <td><TextEditorRender htmlString={answer}/></td>
                                                            <td>{adate}</td>
                                                            <td>
                                                                <div className="tb-admin-answer-status">
                                                                    <span>{status === "rejected" ? "Hidden" : "Visible"}{isAccepted ? " · Accepted by asker" : ""}</span>
                                                                    {status === "rejected" ? (
                                                                        <button type="button" className="tb-admin-restore-answer"
                                                                                onClick={() => upStatus(ans_id, "correct")}>
                                                                            <BsPatchCheckFill/> Restore
                                                                        </button>
                                                                    ) : (
                                                                        <button type="button" className="tb-admin-hide-answer"
                                                                                onClick={() => upStatus(ans_id, "rejected")}>
                                                                            <BsFillXCircleFill/> Hide answer
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                            </tbody>
                                        </table>
                                        :
                                        <div className={"alert alert-danger"}>No data found</div>
                            }
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}
export default ViewAnswers;