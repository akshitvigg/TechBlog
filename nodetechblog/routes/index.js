var express = require('express');
var router = express.Router();
var session = require("express-session");
var Admin    = require('../models/Admin');
var Category = require('../models/Category');
var User     = require('../models/User');
var Question = require('../models/Question');
var Answer   = require('../models/Answer');
var Blog     = require('../models/Blog');
var Comment  = require('../models/Comment');

require('../dbConfig/connection');

// ── Date formatting helpers ──────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function fmtDate(d) {           // "15 November,2023"
    if (!d) return '';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')} ${MONTHS[dt.getMonth()]},${dt.getFullYear()}`;
}

function fmtDateShortYear(d) {  // "15 November,23"
    if (!d) return '';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')} ${MONTHS[dt.getMonth()]},${String(dt.getFullYear()).slice(-2)}`;
}

function fmtDateTime(d) {       // "15 November,2023 02:30 PM"
    if (!d) return '';
    const dt   = new Date(d);
    const h    = dt.getHours();
    const h12  = String(h % 12 || 12).padStart(2,'0');
    const mins = String(dt.getMinutes()).padStart(2,'0');
    const ap   = h >= 12 ? 'PM' : 'AM';
    return `${String(dt.getDate()).padStart(2,'0')} ${MONTHS[dt.getMonth()]},${dt.getFullYear()} ${h12}:${mins} ${ap}`;
}

function fmtOrdinal(d) {        // "15th November,2023"
    if (!d) return '';
    const dt  = new Date(d);
    const day = dt.getDate();
    const v   = day % 100;
    const sfx = ['th','st','nd','rd'];
    const ord = sfx[(v - 20) % 10] || sfx[v] || sfx[0];
    return `${day}${ord} ${MONTHS[dt.getMonth()]},${dt.getFullYear()}`;
}

function fmtComment(d) {        // "15,11 2023 14:30"
    if (!d) return '';
    const dt   = new Date(d);
    const day  = String(dt.getDate()).padStart(2,'0');
    const mon  = String(dt.getMonth() + 1).padStart(2,'0');
    const h    = String(dt.getHours()).padStart(2,'0');
    const mins = String(dt.getMinutes()).padStart(2,'0');
    return `${day},${mon} ${dt.getFullYear()} ${h}:${mins}`;
}

// ── Home ─────────────────────────────────────────────────────────────────────
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

// ── Admin ─────────────────────────────────────────────────────────────────────
router.post("/add-admin-action", async (req, res) => {
    try {
        let { username, password, fullname, phone } = req.body;
        if (await Admin.findOne({ username })) return res.send("exists");
        await Admin.create({ username, password, fullname, phone, status: 'active' });
        res.send("inserted");
    } catch (err) { res.send(err.message); }
});

router.get("/fetch-admins", async (req, res) => {
    try {
        const admins = await Admin.find({ username: { $ne: session.adminSession } }).lean();
        res.send(admins.map(a => ({
            username:  a.username,
            full_name: a.fullname,
            phone:     a.phone,
            status:    a.status
        })));
    } catch (err) { res.send(err.message); }
});

router.post("/admin-login-action", async (req, res) => {
    try {
        let { username, password } = req.body;
        const admin = await Admin.findOne({ username, password, status: 'active' });
        if (admin) {
            session.adminSession = username;
            res.send("success");
        } else {
            res.send("fail");
        }
    } catch (err) { res.send(err.message); }
});

router.get("/admin-check-authentication", (req, res) => {
    session.adminSession !== undefined ? res.send(session.adminSession) : res.send("fails");
});

router.post("/update-password", async (req, res) => {
    try {
        let { opassword, npassword, cpassword } = req.body;
        const admin = await Admin.findOne({ username: session.adminSession, password: opassword });
        if (!admin) return res.send("Old not");
        if (npassword !== cpassword) return res.send("new and confirm not");
        await Admin.updateOne({ username: session.adminSession }, { password: npassword });
        res.send("updated");
    } catch (err) { res.send(err.message); }
});

router.get("/admin-logout", (req, res) => {
    session.adminSession = undefined;
    res.send("logged out");
});

router.post("/update-status-admin", async (req, res) => {
    try {
        let { username, status } = req.body;
        await Admin.updateOne({ username }, { status });
        res.send("updated");
    } catch (err) { res.send(err.message); }
});

// ── Categories ────────────────────────────────────────────────────────────────
router.post("/add-category", async (req, res) => {
    try {
        let { category } = req.body;
        if (await Category.findOne({ cat_name: category })) return res.send("exists");
        await Category.create({ cat_name: category });
        res.send("inserted");
    } catch (err) { res.send(err.message); }
});

router.get("/view-categories", async (req, res) => {
    try {
        const cats = await Category.find().lean();
        res.send(cats.map(c => ({ cat_id: c._id, cat_name: c.cat_name })));
    } catch (err) { res.send(err.message); }
});

router.get("/del-category/:id", async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.send("deleted");
    } catch (err) { res.send(err.message); }
});

// ── Users ─────────────────────────────────────────────────────────────────────
router.post("/user-registration", async (req, res) => {
    try {
        let { email, fullname, password, phone } = req.body;
        if (await User.findOne({ email })) return res.send("exists");
        await User.create({ email, fullname, password, phone });
        res.send("inserted");
    } catch (err) { res.send(err.message); }
});

router.post("/userLoginAction", async (req, res) => {
    try {
        let { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (user) {
            session.userSession = email;
            res.send("loggedIn");
        } else {
            res.send("invalid");
        }
    } catch (err) { res.send(err.message); }
});

router.get('/user-check-authentication', (req, res) => {
    session.userSession !== undefined ? res.send(session.userSession) : res.send("fails");
});

router.get("/user-logout", (req, res) => {
    session.userSession = undefined;
    res.send("logged out");
});

// ── Questions ─────────────────────────────────────────────────────────────────
router.post("/post-question", async (req, res) => {
    try {
        let { category, nquestion } = req.body;
        await Question.create({ question: nquestion, category, user: session.userSession, ques_date: new Date() });
        res.send("inserted");
    } catch (err) { res.send(err.message); }
});

router.get("/view-my-questions", async (req, res) => {
    try {
        const questions = await Question.find({ user: session.userSession }).populate('category').lean();
        res.send(questions.map(q => ({
            ques_id:   q._id,
            question:  q.question,
            category:  q.category ? q.category._id : null,
            cat_name:  q.category ? q.category.cat_name : '',
            user:      q.user,
            ques_date: q.ques_date,
            qdate:     fmtDate(q.ques_date)
        })));
    } catch (err) { res.send(err.message); }
});

router.get("/del-question/:qid", async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.qid);
        res.send("deleted");
    } catch (err) { res.send(err.message); }
});

router.get("/admin-get-questions", async (req, res) => {
    try {
        const questions = await Question.find()
            .sort({ _id: -1 })
            .populate('category')
            .lean();
        res.send(questions.map(q => ({
            ques_id:   q._id,
            question:  q.question,
            category:  q.category ? q.category._id : null,
            cat_name:  q.category ? q.category.cat_name : '',
            user:      q.user,
            ques_date: q.ques_date,
            quesDate:  fmtOrdinal(q.ques_date)
        })));
    } catch (err) { res.send(err.message); }
});

router.get("/get-questions", async (req, res) => {
    try {
        const questions = await Question.find({ user: { $ne: session.userSession } })
            .sort({ _id: -1 })
            .populate('category')
            .lean();
        res.send(questions.map(q => ({
            ques_id:   q._id,
            question:  q.question,
            category:  q.category ? q.category._id : null,
            cat_name:  q.category ? q.category.cat_name : '',
            user:      q.user,
            ques_date: q.ques_date,
            quesDate:  fmtOrdinal(q.ques_date)
        })));
    } catch (err) { res.send(err.message); }
});

router.get("/get-questions-user", async (req, res) => {
    try {
        const questions = await Question.find({ user: { $ne: session.userSession } })
            .populate('category')
            .lean();

        for (let i = 0; i < questions.length; i++) {
            const ans = await Answer.find({ question: questions[i]._id }).lean();
            questions[i].answers = ans.map(a => ({
                ans_id:   a._id,
                answer:   a.answer,
                question: a.question,
                user:     a.user,
                adate:    fmtDate(a.ans_date),
                status:   a.status,
                votes:    a.votes
            }));
        }

        res.send(questions.map(q => ({
            ques_id:   q._id,
            question:  q.question,
            category:  q.category ? q.category._id : null,
            cat_name:  q.category ? q.category.cat_name : '',
            user:      q.user,
            ques_date: q.ques_date,
            qdate:     fmtDate(q.ques_date),
            answers:   q.answers
        })));
    } catch (err) { res.send(err.message); }
});

router.get("/search/:str", async (req, res) => {
    try {
        const questions = await Question.find({ question: { $regex: req.params.str, $options: 'i' } }).lean();
        res.send(questions.map(q => ({
            ques_id:   q._id,
            question:  q.question,
            category:  q.category,
            user:      q.user,
            ques_date: q.ques_date,
            quesDate:  fmtOrdinal(q.ques_date)
        })));
    } catch (err) { res.send(err.message); }
});

// ── Answers ───────────────────────────────────────────────────────────────────
router.post("/add-answers", async (req, res) => {
    try {
        let { qid, answer } = req.body;
        await Answer.create({ answer, question: qid, user: session.userSession, ans_date: new Date(), status: 'pending', votes: 0 });
        res.send("inserted");
    } catch (err) { res.send(err.message); }
});

router.get("/fetch-answers/:ques_id", async (req, res) => {
    try {
        const answers = await Answer.find({ question: req.params.ques_id }).lean();
        res.send(answers.map(a => ({
            ans_id:   a._id,
            answer:   a.answer,
            question: a.question,
            user:     a.user,
            ans_date: a.ans_date,
            adate:    fmtDate(a.ans_date),
            status:   a.status,
            votes:    a.votes
        })));
    } catch (err) { res.send(err.message); }
});

router.get("/get-answers/:qid", async (req, res) => {
    try {
        const answers = await Answer.find({ question: req.params.qid }).lean();
        res.send(answers.map(a => ({
            ans_id:   a._id,
            answer:   a.answer,
            question: a.question,
            user:     a.user,
            ans_date: a.ans_date,
            adate:    fmtDate(a.ans_date),
            status:   a.status,
            votes:    a.votes
        })));
    } catch (err) { res.send(err.message); }
});

router.post("/update-ans-status", async (req, res) => {
    try {
        let { answer, status } = req.body;
        const allowed = ['correct', 'rejected'];
        if (!allowed.includes(status)) return res.send("invalid status");
        await Answer.findByIdAndUpdate(answer, { status });
        res.send("updated");
    } catch (err) { res.send(err.message); }
});

// ── Blogs ─────────────────────────────────────────────────────────────────────
router.post("/add-blog", async (req, res) => {
    try {
        let { category, message, title } = req.body;
        await Blog.create({ message, user: session.userSession, blog_dt: new Date(), category, title });
        res.send("inserted");
    } catch (err) { res.send(err.message); }
});

router.get("/view-my-blogs", async (req, res) => {
    try {
        const blogs = await Blog.find({ user: session.userSession })
            .sort({ blog_dt: -1 })
            .populate('category')
            .lean();
        res.send(blogs.map(b => ({
            blog_id:  b._id,
            message:  b.message,
            user:     b.user,
            blog_dt:  b.blog_dt,
            bdt:      fmtDateTime(b.blog_dt),
            category: b.category ? b.category._id : null,
            cat_name: b.category ? b.category.cat_name : '',
            title:    b.title
        })));
    } catch (err) { res.send(err.message); }
});

router.get("/del-blog/:blogId", async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.blogId);
        res.send("deleted");
    } catch (err) { res.send(err.message); }
});

router.get("/fetch-blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ blog_dt: -1 }).populate('category').lean();

        const emails   = [...new Set(blogs.map(b => b.user))];
        const users    = await User.find({ email: { $in: emails } }).lean();
        const userMap  = Object.fromEntries(users.map(u => [u.email, u.fullname]));

        res.send(blogs.map(b => ({
            blog_id:  b._id,
            message:  b.message,
            user:     b.user,
            blog_dt:  b.blog_dt,
            bdt:      fmtDateShortYear(b.blog_dt),
            category: b.category ? b.category._id : null,
            cat_name: b.category ? b.category.cat_name : '',
            title:    b.title,
            fullname: userMap[b.user] || b.user
        })));
    } catch (err) { res.send(err.message); }
});

router.get("/blog-details/:blog_id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blog_id).populate('category').lean();
        if (!blog) return res.send([]);
        const userInfo = await User.findOne({ email: blog.user }).lean();
        res.send([{
            blog_id:  blog._id,
            message:  blog.message,
            user:     blog.user,
            blog_dt:  blog.blog_dt,
            bdt:      fmtDateShortYear(blog.blog_dt),
            category: blog.category ? blog.category._id : null,
            cat_name: blog.category ? blog.category.cat_name : '',
            title:    blog.title,
            fullname: userInfo ? userInfo.fullname : blog.user
        }]);
    } catch (err) { res.send(err.message); }
});

// ── Comments ──────────────────────────────────────────────────────────────────
router.get("/fetch-comments/:blog_id", async (req, res) => {
    try {
        const comments = await Comment.find({ blog: req.params.blog_id }).lean();
        res.send(comments.map(c => ({
            comment_id: c._id,
            comment:    c.comment,
            user:       c.user,
            cDT:        fmtComment(c.comment_dt)
        })));
    } catch (err) { res.send(err.message); }
});

router.post("/post-comment", async (req, res) => {
    try {
        let { blog_id, comment } = req.body;
        await Comment.create({ comment, user: session.userSession, blog: blog_id, comment_dt: new Date() });
        res.send("inserted");
    } catch (err) { res.send(err.message); }
});

// ── User change password ──────────────────────────────────────────────────────
router.post("/user-update-password", async (req, res) => {
    try {
        let { opassword, npassword, cpassword } = req.body;
        const user = await User.findOne({ email: session.userSession, password: opassword });
        if (!user) return res.send("Old not");
        if (npassword !== cpassword) return res.send("new and confirm not");
        await User.updateOne({ email: session.userSession }, { password: npassword });
        res.send("updated");
    } catch (err) { res.send(err.message); }
});

module.exports = router;
