import React from "react";
import TextField from "@mui/material/TextField";
import '../pages/ShhhPage.css';


export default function FreeSoloCreateOption(props) {
    return (
        <TextField
            placeholder={"Type and click send button!"}
            value={props.textInputValue}
            sx={{
                backgroundColor: "rgba(126, 124, 124, 0.1)",
                left: 0,
                position: "absolute",
                borderRadius: "3px",
                textAlign: "left",
                top: "36.5vw",
                left: "73%",
                width: "22%",
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
            onChange={e => {
                props.handleTextChange(e);
            }}
        />
    );
}
