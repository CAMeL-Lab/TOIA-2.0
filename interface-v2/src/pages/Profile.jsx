import React from "react";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Footer from "../components/Footer";
import NavBar from "../components/navbar";
import { Card, Container } from "react-bootstrap";
import dashbord from "../assets/dashbord.svg";
import QuestionSet from "../components/profile/QuestionSet";
import qusset from "../assets/Ask Question.svg";
import answernotes from "../assets/answer-notes.svg";
import practice from "../assets/practice.svg";
import review from "../assets/review.svg";
import comments from "../assets/comments.svg";
import Recordvoiceover from "../assets/Record voice over.svg";
import Dashboard from "../components/profile/Dashboard";
import "../scss/profile.scss";
const Profile = () => {
	return (
		<>
			<NavBar />
			<div className="profile-main-body">
				<Tab.Container id="left-tabs-example" defaultActiveKey="first">
					<Row className="profile-side-bar">
						<Col sm={3} className="profile-col">
							<Card className="profile-image">
								<Card.Img
									className="profile-image-card"
									variant="top"
									src="https://picsum.photos/200/300"
								/>
								<Card.Body className="profile-card-body">
									<Card.Title className="profile-user-name">
										Soojin Lee
									</Card.Title>
									<Card.Text className="profile-user-category">
										Investment Banking
									</Card.Text>
								</Card.Body>
							</Card>
							<Nav
								variant="pills"
								className="flex-column side-bar-tabs"
							>
								<Nav.Item className="tabs-name">
									<Nav.Link eventKey="first" href="#">
										<img src={dashbord} alt="..." />{" "}
										Dashboard
									</Nav.Link>
								</Nav.Item>
								<Nav.Item className="tabs-name">
									<Nav.Link eventKey="second" href="#">
										<img src={qusset} alt="..." />
										Question Set
									</Nav.Link>
								</Nav.Item>
								<Nav.Item className="tabs-name">
									<Nav.Link eventKey="third" href="#">
										<img src={answernotes} alt="..." />
										Answer Notes
									</Nav.Link>
								</Nav.Item>
								<Nav.Item className="tabs-name">
									<Nav.Link eventKey="forth" href="#">
										<img src={practice} alt="..." />
										Practice
									</Nav.Link>
								</Nav.Item>
								<Nav.Item className="tabs-name">
									<Nav.Link eventKey="fifth" href="#">
										<img src={review} alt="..." />
										Review
									</Nav.Link>
								</Nav.Item>
								<Nav.Item className="tabs-name">
									<Nav.Link eventKey="sixth" href="#">
										<img src={comments} alt="..." />
										Comment
									</Nav.Link>
								</Nav.Item>
								<Nav.Item className="tabs-name">
									<Nav.Link eventKey="seventh" href="#">
										<img src={Recordvoiceover} alt="..." />
										Mock-Interview
									</Nav.Link>
								</Nav.Item>
							</Nav>
						</Col>
						<Col sm={9}>
							<Tab.Content>
								<Tab.Pane eventKey="first">
									<Dashboard />
								</Tab.Pane>
								<Tab.Pane eventKey="second">
									<QuestionSet />
								</Tab.Pane>
								<Tab.Pane eventKey="third">
									<QuestionSet />
								</Tab.Pane>

								<Tab.Pane eventKey="forth">
									<QuestionSet />
								</Tab.Pane>
							</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			</div>
			<Footer />
		</>
	);
};

export default Profile;
