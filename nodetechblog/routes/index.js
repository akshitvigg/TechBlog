var express = require('express');
var router = express.Router();
var rateLimit = require('express-rate-limit').rateLimit;
var bcrypt = require('bcryptjs');
var sanitizeHtml = require('sanitize-html');
var mongoose = require('mongoose');
var Admin    = require('../models/Admin');
var Category = require('../models/Category');
var User     = require('../models/User');
var Question = require('../models/Question');
var Answer   = require('../models/Answer');
var Blog     = require('../models/Blog');
var Comment  = require('../models/Comment');

require('../dbConfig/connection');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Too many login attempts. Please try again later.'
});

const cleanHtml = (value) => sanitizeHtml(String(value || ''), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ['href', 'name', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height']
    },
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    transformTags: {
        img: (_tagName, attributes) => {
            const src = attributes.src || '';
            const safeSrc = /^https?:\/\//i.test(src) ||
                /^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(src);
            const attribs = { alt: attributes.alt || '' };
            if (safeSrc) attribs.src = src;
            if (attributes.width) attribs.width = attributes.width;
            if (attributes.height) attribs.height = attributes.height;
            return { tagName: 'img', attribs };
        }
    }
});

const cleanText = (value) => sanitizeHtml(String(value || ''), { allowedTags: [], allowedAttributes: {} }).trim();

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function isValidPhone(value) {
    return /^\d{10,15}$/.test(String(value || '').trim());
}

async function getDisplayNames(emails) {
    const uniqueEmails = [...new Set(emails.filter(Boolean))];
    const users = await User.find({ email: { $in: uniqueEmails } }).select('email fullname').lean();
    return Object.fromEntries(users.map(user => [user.email, user.fullname]));
}

function requireUser(req, res, next) {
    if (!req.session.userSession) return res.status(401).send("authentication required");
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.adminSession) return res.status(401).send("authentication required");
    next();
}

async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

async function passwordMatches(password, storedPassword) {
    if (/^\$2[aby]\$\d{2}\$/.test(storedPassword)) {
        return bcrypt.compare(password, storedPassword);
    }
    return password === storedPassword;
}

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
        if (await Admin.exists({}) && !req.session.adminSession) {
            return res.status(401).send("admin authentication required");
        }
        let { username, password, fullname, phone } = req.body;
        phone = typeof phone === 'string' ? phone.trim() : '';
        if (!username || !password || !fullname || !phone) return res.status(400).send("all fields are required");
        if (!isValidPhone(phone)) return res.status(400).send("phone must contain 10 to 15 digits");
        if (password.length < 6) return res.status(400).send("password must be at least 6 characters");
        if (await Admin.findOne({ username })) return res.send("exists");
        await Admin.create({ username, password: await hashPassword(password), fullname, phone, status: 'active' });
        res.send("inserted");
    } catch (err) {
        if (err.code === 11000) return res.status(409).send("exists");
        console.error("Admin creation failed:", err);
        res.status(500).send("server error");
    }
});

router.get("/fetch-admins", requireAdmin, async (req, res) => {
    try {
        const admins = await Admin.find({ username: { $ne: req.session.adminSession } }).lean();
        res.send(admins.map(a => ({
            username:  a.username,
            full_name: a.fullname,
            phone:     a.phone,
            status:    a.status
        })));
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.post("/admin-login-action", loginLimiter, async (req, res) => {
    try {
        let { username, password } = req.body;
        const admin = await Admin.findOne({ username, status: 'active' });
        if (admin && await passwordMatches(password, admin.password)) {
            if (!/^\$2[aby]\$\d{2}\$/.test(admin.password)) {
                admin.password = await hashPassword(password);
                await admin.save();
            }
            req.session.adminSession = username;
            res.send("success");
        } else {
            res.send("fail");
        }
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.get("/admin-check-authentication", (req, res) => {
    req.session.adminSession !== undefined ? res.send(req.session.adminSession) : res.send("fails");
});

router.get("/admin-stats", requireAdmin, async (req, res) => {
    try {
        const [users, questions, blogs, pendingAnswers] = await Promise.all([
            User.countDocuments(),
            Question.countDocuments(),
            Blog.countDocuments(),
            Answer.countDocuments({ status: 'pending' })
        ]);
        res.json({ users, questions, blogs, pendingAnswers });
    } catch (err) {
        console.error("Could not load admin statistics:", err);
        res.status(500).send("server error");
    }
});

router.post("/update-password", requireAdmin, async (req, res) => {
    try {
        let { opassword, npassword, cpassword } = req.body;
        if (typeof opassword !== 'string' || typeof npassword !== 'string' || typeof cpassword !== 'string') {
            return res.status(400).send("all password fields are required");
        }
        if (npassword.length < 6) return res.status(400).send("password must be at least 6 characters");
        const admin = await Admin.findOne({ username: req.session.adminSession });
        if (!admin || !(await passwordMatches(opassword, admin.password))) return res.send("Old not");
        if (npassword !== cpassword) return res.send("new and confirm not");
        admin.password = await hashPassword(npassword);
        await admin.save();
        res.send("updated");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.post("/admin-logout", (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.send("logged out");
    });
});

router.post("/update-status-admin", requireAdmin, async (req, res) => {
    try {
        let { username, status } = req.body;
        if (username === req.session.adminSession && status !== 'active') {
            return res.status(400).send("cannot deactivate your own account");
        }
        if (!['active', 'in-active'].includes(status)) return res.status(400).send("invalid status");
        await Admin.updateOne({ username }, { status });
        res.send("updated");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

// ── Categories ────────────────────────────────────────────────────────────────
router.post("/add-category", requireAdmin, async (req, res) => {
    try {
        let { category } = req.body;
        category = typeof category === "string" ? category.trim() : "";
        if (!category) return res.status(400).send("category is required");
        if (await Category.findOne({ cat_name: category })) return res.send("exists");
        await Category.create({ cat_name: category });
        res.send("inserted");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.get("/view-categories", async (req, res) => {
    try {
        const cats = await Category.find().lean();
        res.send(cats.map(c => ({ cat_id: c._id, cat_name: c.cat_name })));
    } catch (err) {
        console.error("Could not load categories:", err.message);
        res.status(500).send("Could not load categories");
    }
});

router.delete("/del-category/:id", requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidId(id)) return res.status(400).send("invalid category id");
        if (await Question.exists({ category: id }) || await Blog.exists({ category: id })) {
            return res.status(409).send("in use");
        }
        await Category.findByIdAndDelete(id);
        res.send("deleted");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

// ── Users ─────────────────────────────────────────────────────────────────────
router.post("/user-registration", async (req, res) => {
    try {
        let { email, fullname, password, phone } = req.body;
        email = typeof email === "string" ? email.trim().toLowerCase() : "";
        phone = typeof phone === 'string' ? phone.trim() : '';
        if (!email || !fullname || !password || !phone) return res.status(400).send("all fields are required");
        if (!isValidPhone(phone)) return res.status(400).send("phone must contain 10 to 15 digits");
        if (password.length < 6) return res.status(400).send("password must be at least 6 characters");
        if (await User.findOne({ email })) return res.send("exists");
        await User.create({ email, fullname, password: await hashPassword(password), phone });
        res.send("inserted");
    } catch (err) {
        if (err.code === 11000) return res.status(409).send("exists");
        console.error("User registration failed:", err);
        res.status(500).send("server error");
    }
});

router.post("/userLoginAction", loginLimiter, async (req, res) => {
    try {
        let { email, password } = req.body;
        email = typeof email === "string" ? email.trim().toLowerCase() : "";
        const user = await User.findOne({ email });
        if (user && await passwordMatches(password, user.password)) {
            if (!/^\$2[aby]\$\d{2}\$/.test(user.password)) {
                user.password = await hashPassword(password);
                await user.save();
            }
            req.session.userSession = email;
            res.send("loggedIn");
        } else {
            res.send("invalid");
        }
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.get('/user-check-authentication', (req, res) => {
    req.session.userSession !== undefined ? res.send(req.session.userSession) : res.send("fails");
});

router.post("/user-logout", (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.send("logged out");
    });
});

// ── Questions ─────────────────────────────────────────────────────────────────
router.post("/post-question", requireUser, async (req, res) => {
    try {
        let { category, nquestion } = req.body;
        nquestion = cleanHtml(nquestion);
        if (!nquestion || !isValidId(category) || !(await Category.exists({ _id: category }))) {
            return res.status(400).send("Please enter a question and select a valid category");
        }
        await Question.create({ question: nquestion, category, user: req.session.userSession, ques_date: new Date() });
        res.send("inserted");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.get("/view-my-questions", requireUser, async (req, res) => {
    try {
        const questions = await Question.find({ user: req.session.userSession }).populate('category').lean();
        const names = await getDisplayNames(questions.map(q => q.user));
        res.send(questions.map(q => ({
            ques_id:   q._id,
            question:  q.question,
            category:  q.category ? q.category._id : null,
            cat_name:  q.category ? q.category.cat_name : '',
            user:      names[q.user] || "TechBlog member",
            ques_date: q.ques_date,
            qdate:     fmtDate(q.ques_date)
        })));
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.delete("/del-question/:qid", requireUser, async (req, res) => {
    try {
        if (!isValidId(req.params.qid)) return res.status(400).send("invalid question id");
        const question = await Question.findOneAndDelete({
            _id: req.params.qid,
            user: req.session.userSession
        });
        if (!question) return res.status(404).send("question not found");
        await Answer.deleteMany({ question: question._id });
        res.send("deleted");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.get("/admin-get-questions", requireAdmin, async (req, res) => {
    try {
        const questions = await Question.find()
            .sort({ _id: -1 })
            .populate('category')
            .lean();
        const names = await getDisplayNames(questions.map(q => q.user));
        res.send(questions.map(q => ({
            ques_id:   q._id,
            question:  q.question,
            category:  q.category ? q.category._id : null,
            cat_name:  q.category ? q.category.cat_name : '',
            user:      names[q.user] || "TechBlog member",
            ques_date: q.ques_date,
            quesDate:  fmtOrdinal(q.ques_date)
        })));
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

async function getQuestions(req, res) {
    try {
        const questions = await Question.find({ user: { $ne: req.session.userSession } })
            .sort({ _id: -1 })
            .populate('category')
            .lean();
        const names = await getDisplayNames(questions.map(q => q.user));
        res.send(questions.map(q => ({
            ques_id:   q._id,
            question:  q.question,
            category:  q.category ? q.category._id : null,
            cat_name:  q.category ? q.category.cat_name : '',
            user:      names[q.user] || "TechBlog member",
            ques_date: q.ques_date,
            qdate:     fmtDate(q.ques_date),
            quesDate:  fmtOrdinal(q.ques_date)
        })));
    } catch (err) { console.error("Could not load questions:", err); res.status(500).send("server error"); }
}

router.get("/get-questions", getQuestions);

router.get("/search/:str", async (req, res) => {
    try {
        const searchTerm = req.params.str.slice(0, 100);
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const questions = await Question.find({ question: { $regex: escapedTerm, $options: 'i' } }).limit(100).lean();
        const names = await getDisplayNames(questions.map(q => q.user));
        res.send(questions.map(q => ({
            ques_id:   q._id,
            question:  q.question,
            category:  q.category,
            user:      names[q.user] || "TechBlog member",
            ques_date: q.ques_date,
            quesDate:  fmtOrdinal(q.ques_date)
        })));
    } catch (err) { console.error("Question search failed:", err); res.status(500).send("server error"); }
});

// ── Answers ───────────────────────────────────────────────────────────────────
router.post("/add-answers", requireUser, async (req, res) => {
    try {
        let { qid, answer } = req.body;
        answer = cleanHtml(answer);
        if (!answer || !isValidId(qid) || !(await Question.exists({ _id: qid }))) {
            return res.status(400).send("Please enter an answer for a valid question");
        }
        await Answer.create({ answer, question: qid, user: req.session.userSession, ans_date: new Date(), status: 'pending' });
        res.send("inserted");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

async function getAnswers(req, res, questionId) {
    try {
        if (!isValidId(questionId)) return res.status(400).send("invalid question id");
        const question = await Question.findById(questionId).select('user').lean();
        if (!question) return res.status(404).send("question not found");
        const canReview = Boolean(req.session.adminSession) ||
            (Boolean(req.session.userSession) && question.user === req.session.userSession);
        const query = { question: questionId };
        if (!canReview) query.status = 'correct';
        const answers = await Answer.find(query).lean();
        const names = await getDisplayNames(answers.map(answer => answer.user));
        res.send(answers.map(a => ({
            ans_id:   a._id,
            answer:   a.answer,
            question: a.question,
            user:     names[a.user] || "TechBlog member",
            ans_date: a.ans_date,
            adate:    fmtDate(a.ans_date),
            status:   a.status
        })));
    } catch (err) { console.error("Could not load answers:", err); res.status(500).send("server error"); }
}

router.get("/get-answers/:qid", (req, res) =>
    getAnswers(req, res, req.params.qid, false));

router.post("/update-ans-status", requireAdmin, async (req, res) => {
    try {
        let { answer, status } = req.body;
        const allowed = ['correct', 'rejected'];
        if (!allowed.includes(status)) return res.send("invalid status");
        if (!isValidId(answer)) return res.status(400).send("invalid answer id");
        await Answer.findByIdAndUpdate(answer, { status });
        res.send("updated");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

// ── Blogs ─────────────────────────────────────────────────────────────────────
router.post("/add-blog", requireUser, async (req, res) => {
    try {
        let { category, message, title } = req.body;
        title = typeof title === "string" ? title.trim() : "";
        message = cleanHtml(message);
        if (!title || !message || !isValidId(category) || !(await Category.exists({ _id: category }))) {
            return res.status(400).send("Please enter a title, content, and valid category");
        }
        await Blog.create({ message, user: req.session.userSession, blog_dt: new Date(), category, title });
        res.send("inserted");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.get("/view-my-blogs", requireUser, async (req, res) => {
    try {
        const blogs = await Blog.find({ user: req.session.userSession })
            .sort({ blog_dt: -1 })
            .populate('category')
            .lean();
        const names = await getDisplayNames(blogs.map(blog => blog.user));
        res.send(blogs.map(b => ({
            blog_id:  b._id,
            message:  b.message,
            user:     names[b.user] || "You",
            blog_dt:  b.blog_dt,
            bdt:      fmtDateTime(b.blog_dt),
            category: b.category ? b.category._id : null,
            cat_name: b.category ? b.category.cat_name : '',
            title:    b.title
        })));
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.delete("/del-blog/:blogId", requireUser, async (req, res) => {
    try {
        if (!isValidId(req.params.blogId)) return res.status(400).send("invalid blog id");
        const blog = await Blog.findOneAndDelete({
            _id: req.params.blogId,
            user: req.session.userSession
        });
        if (!blog) return res.status(404).send("blog not found");
        await Comment.deleteMany({ blog: blog._id });
        res.send("deleted");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
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
            user:     userMap[b.user] || "TechBlog member",
            blog_dt:  b.blog_dt,
            bdt:      fmtDateShortYear(b.blog_dt),
            category: b.category ? b.category._id : null,
            cat_name: b.category ? b.category.cat_name : '',
            title:    b.title,
            fullname: userMap[b.user] || "TechBlog member"
        })));
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.get("/blog-details/:blog_id", async (req, res) => {
    try {
        if (!isValidId(req.params.blog_id)) return res.status(400).send("invalid blog id");
        const blog = await Blog.findById(req.params.blog_id).populate('category').lean();
        if (!blog) return res.send([]);
        const userInfo = await User.findOne({ email: blog.user }).lean();
        res.send([{
            blog_id:  blog._id,
            message:  blog.message,
            user:     userInfo ? userInfo.fullname : "TechBlog member",
            blog_dt:  blog.blog_dt,
            bdt:      fmtDateShortYear(blog.blog_dt),
            category: blog.category ? blog.category._id : null,
            cat_name: blog.category ? blog.category.cat_name : '',
            title:    blog.title,
            fullname: userInfo ? userInfo.fullname : blog.user
        }]);
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

// ── Comments ──────────────────────────────────────────────────────────────────
router.get("/fetch-comments/:blog_id", async (req, res) => {
    try {
        if (!isValidId(req.params.blog_id)) return res.status(400).send("invalid blog id");
        const comments = await Comment.find({ blog: req.params.blog_id }).lean();
        const names = await getDisplayNames(comments.map(comment => comment.user));
        res.send(comments.map(c => ({
            comment_id: c._id,
            comment:    c.comment,
            user:       names[c.user] || "TechBlog member",
            cDT:        fmtComment(c.comment_dt)
        })));
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

router.post("/post-comment", requireUser, async (req, res) => {
    try {
        let { blog_id, comment } = req.body;
        comment = cleanText(comment);
        if (!comment || !isValidId(blog_id) || !(await Blog.exists({ _id: blog_id }))) {
            return res.status(400).send("Please enter a comment for a valid blog");
        }
        await Comment.create({ comment, user: req.session.userSession, blog: blog_id, comment_dt: new Date() });
        res.send("inserted");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

// ── User change password ──────────────────────────────────────────────────────
router.post("/user-update-password", requireUser, async (req, res) => {
    try {
        let { opassword, npassword, cpassword } = req.body;
        if (typeof opassword !== 'string' || typeof npassword !== 'string' || typeof cpassword !== 'string') {
            return res.status(400).send("all password fields are required");
        }
        if (npassword.length < 6) return res.status(400).send("password must be at least 6 characters");
        const user = await User.findOne({ email: req.session.userSession });
        if (!user || !(await passwordMatches(opassword, user.password))) return res.send("Old not");
        if (npassword !== cpassword) return res.send("new and confirm not");
        user.password = await hashPassword(npassword);
        await user.save();
        res.send("updated");
    } catch (err) { console.error(err); res.status(500).send("server error"); }
});

module.exports = router;
