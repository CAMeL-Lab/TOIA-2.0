import React from "react";
import { Container, Col, Row, Button } from "react-bootstrap";
import NavBar from "../navbar";
import add from "../../assets/add.svg";
import Footer from "../Footer";

const Practiceb = () => {
	return (
		<>
			<NavBar />
			<Container className="question-list-practice">
				<Row className="answer-question-video-sec">
					<Col className="ongoing-vieo">
						<video src="..." controls></video>
					</Col>
					<Col xs={6} className="text-answer-sec">
						<div className="heading-fit">
							<p className="headingA">Investment Banking</p>
							<p className="fit">.Fit</p>
						</div>
						<p className="dec-video">
							For investment banking professionals -- and
							candidates looking to break into banking
						</p>
						<div className="fit-btn">
							<Button className="cont-btn">Continue</Button>
							<Button className="reviw-btn">Review</Button>
						</div>
					</Col>
					<Col className="interact-video">
						<video src="..." controls></video>
					</Col>
				</Row>
				<Row className="skip-diy-qus">
					<Col className="top-qus-list">
						<Button>Start Practicing Top Question List</Button>
					</Col>
					<Col className="diy-qus">
						<Button>Skip and DIY Questions</Button>
					</Col>
				</Row>
				<Button className="add-question-dec">
					<img src={add} alt="...." />
				</Button>
			</Container>
			<Footer />
		</>
	);
};

export default Practiceb;
