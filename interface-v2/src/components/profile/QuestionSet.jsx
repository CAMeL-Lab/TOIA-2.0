import React from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import JobInternship from "./JobInternship";
import "../../scss/profileScss/questionset.scss";
const QuestionSet = () => {
	return (
		<>
			<div className="ques-set-main">
				<Tabs
					defaultActiveKey="Job/Internship"
					id="uncontrolled-tab-example"
					className="mb-3 job-admission-tabs"
				>
					<Tab eventKey="Job/Internship" title="Job/Internship" className="job-admission">
						<JobInternship />
					</Tab>
					<Tab
						eventKey="Admissions"
						title="Admissions"
						className="job-admission"
					>
						<h1>hello</h1>
					</Tab>
				</Tabs>
			</div>
		</>
	);
};

export default QuestionSet;
