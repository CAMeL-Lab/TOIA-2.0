import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { Input } from 'semantic-ui-react'
import { useState } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const filter = createFilterOptions({
	matchFrom: "start",
});

const theme = createTheme({
	components: {
	  MuiTextField: {
		styleOverrides: {
		  root: {
			'& .MuiInputBase-input': {
			  color: 'black', // Text color
			},
			'& .MuiInputLabel-root': {
			  color: 'black', // Label color
			},
			'& .MuiOutlinedInput-root': {
			  '& fieldset': {
				borderColor: 'black', // Border color
			  },
			  '&:hover fieldset': {
				borderColor: 'black', // Hover border color
			  },
			  '&.Mui-focused fieldset': {
				borderColor: 'black', // Focused border color
			  },
			},
		  },
		},
	  },
	},
  });


export default function FreeSoloCreateOption(props) {
	const [value, setValue] = React.useState(null);
	const disableTyping = React.useRef(true);
	const [searchTerm, setSearchTerm] = useState('');

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
			// sx={{ width: 200 }}
			freeSolo
			renderInput={params => (
				<div className="search-bar">

					<ThemeProvider theme={theme}>
						<TextField
							{...params}
							className="searching"
							id="filled-hidden-label-small"
							size="small"
							placeholder="Type a question to ask"
							onChange={value => {
								disableTyping.current = Boolean(
									!value.target.value,
								); // if string is empty, return true. Otherwise, false
								props.handleTextChange(value);
							}}
						/>
					</ThemeProvider>

				</div>
			)}
		/>
	);
}
