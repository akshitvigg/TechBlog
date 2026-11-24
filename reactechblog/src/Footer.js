import ScrollToTopButton from "./ScrollToTopButton";
import {useEffect} from "react";
let Footer = () => {
    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])
    return (
        <>
            <ScrollToTopButton/>
            <div className="section footer-section footer-section-03 footer-bg">
                <div className="footer-copyright-area">
                    <div className="container">
                        <div className="footer-copyright-wrap">
                            <div className="row align-items-center">
                                <div className="col-lg-12">
                                    <div className="copyright-text text-center">
                                        <p>© Copyright {new Date().getFullYear()} Techwix All rights reserved. </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
)
}
export default Footer;