import React, { useState } from "react";
import { Container, Row, Col, Stack, Form, Button } from "react-bootstrap";
import NavBar from "../components/navbar";
import "../scss/practice.scss";
import edit from "../assets/edit.svg";
import del from "../assets/del.svg";
import Footer from "../components/Footer";
import { Editor, EditorState } from "draft-js";

const Practice = () => {
	const [editorState, setEditorState] = useState(() =>
		EditorState.createEmpty()
	);
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
									<Editor
										editorState={editorState}
										onChange={setEditorState}
									/>
								</Col>
							</Row>
						</div>
						<div className="previous-next-btn">
							<Button className="prev">Previous</Button>
							<Button className="next">Next</Button>
						</div>
					</Col>
				</Row>
			</div>
			<Footer />
		</>
	);
};

export default Practice;
