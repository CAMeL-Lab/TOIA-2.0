import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import image1 from "../assets/signuphuman.svg";
import logo from "../assets/whitelogo.svg";
import "../scss/signup.scss";
import Footer from "../components/Footer";
import fb from "../assets/fb.svg";
import google from "../assets/google.svg";
import line from "../assets/Line 4.svg";
import passeye from "../assets/passeye.svg";

const Signup = () => {
	const [passwordShown, setPasswordShown] = useState(false);

	// Password toggle handler
	const togglePassword = () => {
		// When the handler is invoked
		// inverse the boolean state of passwordShown
		setPasswordShown(!passwordShown);
	};
	return (
		<>
			<div className="signup-page-sec">
				<div className="image-side">
					<img className="signup-logo" src={logo} alt="...." />
					<img
						className="signup-human"
						src={image1}
						alt="...."
					/>
				</div>
				<Container>
					{laguageDropdown()}

					<div className="form-sec-fown">
						<div className="inner-div-form">
							{signupBtns()}
							<div className="or-sec">
								<img src={line} alt="---" /> <p>OR</p>
								<img src={line} alt="---" />
							</div>
							<div className="sign-up-form">
								<Form.Floating className="mb-3">
									<Form.Control
										id="floatingInputCustom"
										type="text"
										placeholder="Your Name"
									/>
									<label htmlFor="floatingInputCustom">
										Full name
									</label>
								</Form.Floating>
								<Form.Floating className="mb-3">
									<Form.Control
										id="floatingInputCustom"
										type="email"
										placeholder="name@example.com"
									/>
									<label htmlFor="floatingInputCustom">
										Email Address
									</label>
								</Form.Floating>
								<Form.Floating>
									<Form.Control
										id="floatingPasswordCustom"
										type={
											passwordShown ? "text" : "password"
										}
										placeholder="Password"
									/>
									<div className="btn-pass-show">
										<button
											onClick={togglePassword}
											className="show-password"
										>
											<img src={passeye} alt="...." />
										</button>
									</div>

									<label htmlFor="floatingPasswordCustom">
										Password
									</label>
								</Form.Floating>

								<Button>Create Account</Button>
								<div className="alrd-account">
									<p>Already have an account?</p>{" "}
									<a href="">Login</a>
								</div>
							</div>
						</div>
					</div>
				</Container>
			</div>
			<Footer />
		</>
	);
};

export default Signup;
function laguageDropdown() {
	return (
		<Col className="form-side">
			<Form.Select aria-label="Default " className="language-dropdown">
				<option>English (US) </option>
				<option value="1">One</option>
				<option value="2">Two</option>
				<option value="3">Three</option>
			</Form.Select>
		</Col>
	);
}
function signupBtns() {
	return (
		<Row>
			<Col>
				<div className="signup-from">
					<h1>Create Account</h1>
					<div className="sign-up-with-btn">
						<Button>
							<img src={google} alt="...." /> Sign up with Google
						</Button>
						<Button>
							<img src={fb} alt="..." /> Sign up with Facebook
						</Button>
					</div>
				</div>
			</Col>
		</Row>
	);
}
