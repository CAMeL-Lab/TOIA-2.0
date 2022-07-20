import React, { useState } from "react";
import { Container, Col, Row, Button } from "react-bootstrap";
import NavBar from "../navbar";
import "./pa.scss";
import add from "../../assets/add.svg";
import Footer from "../Footer";
import Form from "react-bootstrap/Form";

const PracticeA = () => {
	const [showForm, setShowForm] = useState(false);
	const ShowForm = () => {
		setShowForm(true);
	};
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
				<Row className="skip-diy-qus add-question">
					{!showForm ? (
						<>
							<Col className="top-qus-list">
								<Button onClick={ShowForm}>
									Start Practicing Top Question List
								</Button>
							</Col>
							<Col className="diy-qus">
								<Button>Skip and DIY Questions</Button>
							</Col>
						</>
					) : (
						<Col className="form-add-qus">
							<Form className="add-qus-form">
								<div className="form-wrapper-pa">
									<Form.Group
										className="mb-3 qus-title"
										controlId="exampleForm.ControlInput1"
									>
										<Form.Control
											type="text"
											placeholder="Title"
										/>
									</Form.Group>
									<Form.Group
										className=" qus-dec"
										controlId="exampleForm.ControlTextarea1"
									>
										<Form.Control
											as="textarea"
											placeholder="Describe your Interview"
											rows={3}
										/>
									</Form.Group>
								</div>
								<Button className="lets-start-pa">
									Let’s Start
								</Button>
							</Form>
						</Col>
					)}
				</Row>
				<Button className="add-question-dec">
					<img src={add} alt="...." />
				</Button>
			</Container>
			<Footer />
		</>
	);
};

export default PracticeA;
