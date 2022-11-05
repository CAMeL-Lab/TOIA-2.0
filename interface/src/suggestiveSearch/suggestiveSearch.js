import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

const filter = createFilterOptions({
	matchFrom: "start",
});

export default function FreeSoloCreateOption(props) {
	const [value, setValue] = React.useState(null);
	const disableTyping = React.useRef(true);

	return (
		<Autocomplete
			value={value}
			onChange={(event, newValue) => {
				if (typeof newValue === "string") {
					setValue({
						question: newValue,
					});
					props.handleTextInputChange(newValue);
				} else if (newValue && newValue.inputValue) {
					// Create a new value from the user input
					setValue({
						question: newValue.inputValue,
					});
					props.handleTextInputChange(newValue);
				} else {
					setValue(newValue);
					props.handleTextInputChange(newValue);
				}
			}}
			filterOptions={(options, params) => {
				if (disableTyping.current) {
					// if disable typing, then stop showing the suggestions
					return [];
				}
				const filtered = filter(options, params);

				const { inputValue } = params;
				// Suggest the creation of a new value
				const isExisting = options.some(
					option => inputValue === option.question,
				);
				if (inputValue !== "" && !isExisting) {
					filtered.push({
						inputValue,
						question: `"${inputValue}"`,
					});
				}

				return filtered;
			}}
			selectOnFocus
			clearOnBlur
			handleHomeEndKeys
			id="free-solo-with-text-demo"
			options={props.questions}
			getOptionLabel={option => {
				// Value selected with enter, right from the input
				if (typeof option === "string") {
					return option;
				}
				// Add "xxx" option created dynamically
				if (option.inputValue) {
					return option.inputValue;
				}
				// Regular option
				return option.question;
			}}
			renderOption={(props, option) => (
				<li {...props}>{option.question}</li>
			)}
			sx={{ width: 200 }}
			freeSolo
			renderInput={params => (
				<TextField
					sx={{
						// width: 100,
						height: 70,
						// backgroundColor: "rgba(126, 124, 124, 0.1)",
						border: 0,
						/* left: 39%; */
						left: "0%",
						padding: "0px",
						position: "absolute",
						resize: "none",
						textAlign: "left",
						/* top: 75%; */
						top: "90%",
						width: "55.25%",
						left: "1%",
						height: "7.5%",
						// height: "80.25%",
						color: "#707070",
						fontSize: "1.5rem",
						paddingTop: "25px",
						paddingBottom: "25px",
						"& label": {
							marginLeft: "35%",
							paddingTop: "3.55%",
							fontSize: "1.2rem",
							"&.Mui-focused": {
								marginLeft: 0,
							},
						},
					}}
					{...params}
					label="Type a question to ask"
					onChange={value => {
						disableTyping.current = Boolean(!value.target.value); // if string is empty, return true. Otherwise, false
						props.handleTextChange(value);
					}}
				/>
			)}
		/>
	);
}
