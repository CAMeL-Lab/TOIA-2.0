import * as React from 'react';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';

const labels = {
  
  1: 'Clearly not a good match',
 
  2: 'Poor match',
 
  3: 'Neutral',

  4: 'Good match',
  
  5: 'Perfect match for the context',
  
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

export default function HoverRating({setRatingValue, setRatingComplete, recUserRating, newUserRatingVal, skipFillVideo}) {
  const [value, setValue] = React.useState(1);
  const [hover, setHover] = React.useState(-1);
  // setRatingComplete(false);

  return (
    <Box
      sx={{
        width: 200,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Rating
        name="hover-feedback"
        size="large"
        value={value}
        precision={1}
        max={5}
        getLabelText={getLabelText}
        onChange={(event, newValue) => {
          setValue(newValue);
          setRatingValue(newValue);
          setRatingComplete(true);
          newUserRatingVal.current = 'true';
          skipFillVideo();

          // recording the user rating
         recUserRating(newValue);
          
        }}
        onChangeActive={(event, newHover) => {
          setHover(newHover);
        }}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      />
      {value !== null && (
        <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
      )}
    </Box>
  );
}
