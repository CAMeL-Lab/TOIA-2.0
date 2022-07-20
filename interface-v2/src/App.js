import React from "react";
import Home from "./pages/home.jsx";
import Practice from "./pages/Practice.jsx";
import Signup from "./pages/Signup.jsx";
import Review from "./pages/Review.jsx";
import Profile from "./pages/Profile.jsx";
import MockInterview from "./pages/MockInterview.jsx";
import PracticeA from "./components/practice/practiceA.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route exact index element={<Home />} />
					<Route path="practice" element={<Practice />} />
					<Route path="pa" element={<PracticeA/>} />
					<Route path="review" element={<Review />} />
					<Route path="mock-interview" element={<MockInterview />} />
					<Route path="sign-up" element={<Signup />} />
					<Route path="profile" element={<Profile />} />
				</Routes>
			</Router>
		</>
	);
}

export default App;
