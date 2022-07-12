import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import gmailLogo from "../assets/Gmail logo.svg";
import linkedin from "../assets/LinkedIn.svg";
import "../scss/footer.scss";
const Footer = () => {
  return (
    <>
      <footer>
        <Container>
          <Row>
            <Col>
              <div className="footer-right-compo">
                <a className="footer-compo">@ 2022 Fluent</a>
                <a href="#" className="footer-compo">
                  Terms of Service
                </a>
                <a href="#" className="footer-compo">
                  Privacy Policy
                </a>
              </div>
            </Col>
            <Col>
              <div className="footer-left-compo">
                <a href="#" className="footer-compo">
                  <img src={gmailLogo} alt="....." />
                </a>
                <a href="#" className="footer-compo">
                  <img src={linkedin} alt="...." />
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};

export default Footer;
