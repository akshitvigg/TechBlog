import {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import TextEditorRender from "../TextEditorRender";

const AdminHome = () => {
    let [questions, setQuestions] = useState([])
    let [stats, setStats] = useState(null)
    useEffect(() => {
        axios.get("/admin-get-questions").then(res => {
            setQuestions(res.data);
        })
        axios.get("/admin-stats").then(res => setStats(res.data))
    }, [])

    return (
        <>
            <section className="faq p-60">
                <div className="container">
                    <h2 className="tb-admin-dashboard-title">Admin overview</h2>
                    <div className="tb-admin-stats">
                        {[
                            ["Users", stats?.users],
                            ["Questions", stats?.questions],
                            ["Blogs", stats?.blogs],
                            ["Pending answers", stats?.pendingAnswers]
                        ].map(([label, value]) => (
                            <div className="tb-admin-stat" key={label}>
                                <span>{label}</span>
                                <strong>{value === undefined ? "—" : value}</strong>
                            </div>
                        ))}
                    </div>
                    <div className="tb-admin-moderation">
                        <div className="tb-admin-section-heading">
                            <h3>Question moderation</h3>
                            <p>Review submitted answers and keep shared knowledge helpful.</p>
                        </div>
                        {questions.length ? questions.map(({quesDate, question, ques_id}, index) => (
                            <article className="tb-admin-question-card" key={ques_id}>
                                <div className="tb-admin-question-meta">
                                    <span>Question {index + 1}</span>
                                    <time>{quesDate}</time>
                                </div>
                                <div className="tb-admin-question-content"><TextEditorRender htmlString={question}/></div>
                                <Link to={`/admin/view-answers/${ques_id}`} className="tb-admin-review-link">Review answers <span aria-hidden="true">→</span></Link>
                            </article>
                        )) : (
                            <div className="tb-empty-state">
                                <h4>Nothing waiting for review</h4>
                                <p>New community questions will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}
export default AdminHome;