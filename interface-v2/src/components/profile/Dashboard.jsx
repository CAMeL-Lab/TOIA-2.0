import { React } from "react";
import { Container, Col, Row, Form, Badge, Button } from "react-bootstrap";
import "../../scss/profileScss/dashboard.scss";
import Heart from "../../assets/Heart.svg";
import addvideo from "../../assets/addvideo.svg";
const Dashboard = () => {
	return (
		<>
			<Container className="dashboard-body">
				<div className="heading-dashboard">
					<p>My Dashboard</p>
				</div>

				<Row className="comnt-text-area">
					<Col className="text-area">
						<Form className="form-inout-sec">
							<Form.Group
								className="mb-3 input-sec"
								controlId="exampleForm.ControlTextarea1"
							>
								<Form.Control as="textarea" />
							</Form.Group>
						</Form>
					</Col>
					<Col className="comnt-area">
						<div className="comnt-area-body">
							<div className="heading-comment-badge">
								Comments{" "}
								<Badge bg="secondary" className="comnt-badge">
									9
								</Badge>
							</div>
							<div className="comment-read-area">
								<div className="comnts-comnt">
									<img
										src="https://picsum.photos/20/30"
										alt="...."
									/>
									<div className="name-comnt">
										<div className="name-lst-active">
											<div className="name">
												<p>Soojin Lee</p>
											</div>
											<div className="lst-active">
												<p> 1 minute ago</p>
											</div>
										</div>
										<div className="cmt-read">
											<p>
												What about saying this instead?
											</p>
										</div>
										<div className="btns-reply-like">
											<Button className="reply-btn">
												REPLY
											</Button>
											<Button>
												<img src={Heart} alt="..." />
											</Button>
										</div>
									</div>

									<div className="where-cmt"></div>
								</div>
							</div>
							<div className="comment-read-area">
								<div className="comnts-comnt">
									<img
										src="https://picsum.photos/20/30"
										alt="...."
									/>
									<div className="name-comnt">
										<div className="name-lst-active">
											<div className="name">
												<p>Soojin Lee</p>
											</div>
											<div className="lst-active">
												<p> 1 minute ago</p>
											</div>
										</div>
										<div className="cmt-read">
											<p>
												What about saying this instead?
											</p>
										</div>
										<div className="btns-reply-like">
											<Button className="reply-btn">
												REPLY
											</Button>
											<Button>
												<img src={Heart} alt="..." />
											</Button>
										</div>
									</div>

									<div className="where-cmt"></div>
								</div>
							</div>
						</div>
					</Col>
				</Row>
				<div className="practive-in-progress">
					<div className="heading-practice-inprocess">
						<p>PRACTICE. In Progress</p>
					</div>
					<Row className="in-progress-videos">
						<Col className="videos-block">
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
						</Col>
						<Col xs lg="3" className="add-video">
							<Button>
								<img src={addvideo} alt="..." />
							</Button>
						</Col>
					</Row>
				</div>
				<div className="recent-videos">
                    <div className="heading-recent-videos">
                        <p>REVIEW. Recent Videos</p>
                    </div>
					<Row className="recent-video-list">
						<Col className="video-list">
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
							<video
								src="https://www.youtube.com/watch?v=MytUmeRAwys"
								controls="controls"
							/>
						</Col>
					</Row>
				</div>
			</Container>
		</>
	);
};

export default Dashboard;
