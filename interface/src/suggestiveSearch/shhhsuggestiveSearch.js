import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import '../pages/ShhhPage.css';

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
            freeSolo
            renderInput={params => (
                <TextField
                    placeholder={"Type to ask!"}
                    sx={{
                        backgroundColor: "rgba(126, 124, 124, 0.1)",
                        left: 0,
                        position: "absolute",
                        borderRadius: "3px",
                        textAlign: "left",
                        /* top: 75%; */
                        top: "36.5vw",
                        left: "75%",
                        width: "20%",
                        height: "4vw",
                        fontSize: "1.5vw",
                        fontFamily: "Work Sans",
                        color: "#ffffff", // Add this line to set the text color to white
                        "& label": {
                            marginLeft: "35%",
                            paddingTop: "3.55%",
                            fontSize: "1.2rem",
                            "&.Mui-focused": {
                                marginLeft: 0,
                            },
                        },
                        "& input": {
                            color: "#ffffff",
                        }, // Add this
                    }}
                    {...params}
                    onChange={value => {
                        disableTyping.current = Boolean(!value.target.value); // if string is empty, return true. Otherwise, false
                        props.handleTextChange(value);
                    }}
                />
            )}
        />
    );
}
