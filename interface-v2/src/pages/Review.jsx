import React from "react";
import NavBar from "../components/navbar";
import { Row, Col, Stack, Form, Button } from "react-bootstrap";
import edit from "../assets/edit.svg";
import "../scss/review.scss"
import del from "../assets/del.svg";
import Footer from "../components/Footer";
const Review = () => {
	return (
		<>
			<NavBar />
			<div className="practice-main-sec">
				<Row>
					<Col className="side-bar-practice" xs lg="2">
						<div className="marking-sec">
							<div className="back-to-cat">
								<a href="/"> &#60;- Back to Categories </a>
							</div>
							<div className="mark-display-area">
								<div className="score">0 </div>{" "}
								<div className="full-score">/10</div>
							</div>
							<div className="practicing-subject">
								<p>Investment Banking</p>
							</div>
						</div>
						<Stack>
							<div className="ques-sec ">
								<Form.Check inline type="checkbox" />
								<p>
									Why investment banking versus sales and
									trading?
								</p>
								<a href="#">
									<img src={edit} alt="" />
								</a>
								<a href="#">
									<img src={del} alt="" />
								</a>
							</div>
							<div className="ques-sec ">
								<Form.Check inline type="checkbox" />
								<p>
									Why investment banking versus sales and
									trading?
								</p>
								<a href="#">
									<img src={edit} alt="" />
								</a>
								<a href="#">
									<img src={del} alt="" />
								</a>
							</div>
							<div className="ques-sec ">
								<Form.Check inline type="checkbox" />
								<p>
									Why investment banking versus sales and
									trading?
								</p>
								<a href="#">
									<img src={edit} alt="" />
								</a>
								<a href="#">
									<img src={del} alt="" />
								</a>
							</div>
							<div className="ques-sec ">
								<Form.Check inline type="checkbox" />
								<p>
									Why investment banking versus sales and
									trading?
								</p>
								<a href="#">
									<img src={edit} alt="" />
								</a>
								<a href="#">
									<img src={del} alt="" />
								</a>
							</div>
							<div className="ques-sec ">
								<Form.Check inline type="checkbox" />
								<p>
									Why investment banking versus sales and
									trading?
								</p>
								<a href="#">
									<img src={edit} alt="" />
								</a>
								<a href="#">
									<img src={del} alt="" />
								</a>
							</div>
							<div className="ques-sec ">
								<Form.Check inline type="checkbox" />
								<p>
									Why investment banking versus sales and
									trading?
								</p>
								<a href="#">
									<img src={edit} alt="" />
								</a>
								<a href="#">
									<img src={del} alt="" />
								</a>
							</div>
							<div className="ques-sec ">
								<Form.Check inline type="checkbox" />
								<p>
									Why investment banking versus sales and
									trading?
								</p>
								<a href="#">
									<img src={edit} alt="" />
								</a>
								<a href="#">
									<img src={del} alt="" />
								</a>
							</div>
							<div className="ques-sec ">
								<Form.Check inline type="checkbox" />
								<p>
									Why investment banking versus sales and
									trading?
								</p>
								<a href="#">
									<img src={edit} alt="" />
								</a>
								<a href="#">
									<img src={del} alt="" />
								</a>
							</div>
							<div className="ques-sec ">
								<Form.Check inline type="checkbox" />
								<p>
									Tell me about the time you worked the
									hardest in your life.
								</p>
								<a href="#">
									<img src={edit} alt="" />
								</a>
								<a href="#">
									<img src={del} alt="" />
								</a>
							</div>
						</Stack>
						<Form className="add-question-form">
							<Form.Group
								className="mb-3"
								controlId="formGroupEmail"
							>
								<Form.Control
									type="text"
									placeholder=" Type in a Question"
								/>
							</Form.Group>
							<Button variant="primary" type="submit">
								Add
							</Button>
						</Form>
					</Col>

					<Col>
						<div className="video-side">
							<div className="heading-sec">
								<h1>
									Why investment banking versus sales and
									trading?
								</h1>
							</div>
							<Row className="video-comment-sec">
								<Col>
									<div className="video-sec"></div>
								</Col>
								<Col xs lg="4">
									<Form className="form-inout-sec-aa">
										<Form.Group
											className="mb-3 "
											controlId="exampleForm.ControlTextarea1"
										>
											<Form.Control
												as="textarea"
												className="comnt-area-aa"
											/>
										</Form.Group>
									</Form>
								</Col>
							</Row>
						</div>
						<Row className="type-comment-review mt-5">
							<Form className="comment-area-review-form">
								<Form.Group
									className="mb-3 w-50 h-100"
									controlId="exampleForm.ControlTextarea1"
								>
									<Form.Control
										as="textarea"
                    placeholder="Type in a comment"
										className="comment-area-review "
									/>
								</Form.Group>
								<Button className="comnt-review">Comment</Button>
							</Form>
						</Row>
					</Col>
				</Row>
			</div>
			<Footer />
		</>
	);
};

export default Review;
