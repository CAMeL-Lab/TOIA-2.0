import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

const filter = createFilterOptions();

export default function FreeSoloCreateOption(props) {
  const [value, setValue] = React.useState(null);

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
          console.log("newValue: ", newValue)
          console.log("event: ", event);
        if (typeof newValue === "string") {
          setValue({
            question: newValue
          });
          props.handleTextInputChange(newValue);
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            question: newValue.inputValue
          });
          props.handleTextInputChange(newValue);
        } else {
          setValue(newValue);
          props.handleTextInputChange(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some(
          (option) => inputValue === option.question
        );
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue,
            question: `"${inputValue}"`
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={props.questions}
      getOptionLabel={(option) => {
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
      renderOption={(props, option) => <li {...props}>{option.question}</li>}
      sx={{ width: 200 }}
      freeSolo
      renderInput={(params) => (
       
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
            top: "80.75%",
            width: "90.25%",
            // height: "80.25%",
            color: "#707070",
            fontSize: "1.5rem",
            paddingTop: "25px",
            paddingBottom: "25px"
          }}
          {...params}
          label="Enter search phrase"
          onChange={(value) => {
           props.handleTextChange(value);
          }}
        
        />
      
        
        
      )}
    />
  );
}

