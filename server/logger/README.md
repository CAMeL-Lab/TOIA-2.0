# Winston Logger

Template used: https://github.com/productioncoder/node-winston-logging

### Usage

```javascript
const logger = require("../logger/index");

logger.error("Error message"); // Prints in production and development. Behaviour can be changed in index.js
logger.info("Info message"); // Prints in production and development
logger.debug("Debug message"); // Prints only in development
```

### Error levels

From most important to least. 

```javascript
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};
```

More info: https://www.npmjs.com/package/winston