import {Link} from "react-router-dom";
import PublicNavbar from "./Components/PublicNavbar";
import UserLogin from "./UserLogin";
import UserRegistration from "./UserRegistration";
import Footer from "./Footer";

const UserLoginRegister = () => (
    <>
        <PublicNavbar/>
        <main className="tb-auth-page">
            <div className="tb-auth-intro">
                <span className="tb-auth-eyebrow">TECHBLOG COMMUNITY</span>
                <h1>Good ideas get better <span>when shared.</span></h1>
                <p>Explore practical tech articles, ask questions, and learn from a community that likes figuring things out.</p>
                <Link to="/blogs" className="tb-auth-explore-link">Explore the latest articles <span aria-hidden="true">→</span></Link>
            </div>
            <div className="tb-auth-grid">
                <UserLogin/>
                <UserRegistration/>
            </div>
        </main>
        <Footer/>
    </>
);

export default UserLoginRegister;
