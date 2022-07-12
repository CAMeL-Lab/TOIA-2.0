import React from "react";
import { Container, Row, Col, Stack, Button } from "react-bootstrap";
import "../scss/landingpage.scss";
import laptop from "../assets/Device - Macbook Air.svg";
import SurveyModal from "../components/SurveyModal.jsx";
const Landingpage = () => {
  const [modalShow, setModalShow] = React.useState(false);
  return (
    <>
      <Container>
        <Row className="main-sec">
          <Col>
            <Stack>
              <div className="into-text">
                <p>
                  Practice your Interview Skills for Job,Internship, or Graduate
                  School
                </p>
              </div>
              <div className="button-start">
                <Button
                  className="start-btn"
                  onClick={() => setModalShow(true)}
                >
                  Start
                </Button>
                <Button>Tutorial</Button>
              </div>
              <SurveyModal
                show={modalShow}
                onHide={() => setModalShow(false)}
              />
            </Stack>
          </Col>
          <Col>
            <img src={laptop} alt="...." />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Landingpage;
