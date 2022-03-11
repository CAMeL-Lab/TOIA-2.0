const fs = require('fs');

const cssDir = 'build/static/css/';

const fileNames = fs.readdirSync(cssDir);

const cssNames = fileNames.filter((name) => {return name.slice(-3) === "css"})
const mapNames = fileNames.filter((name) => {return name.slice(-3) === "map"})

console.assert(cssNames.length === 2);
console.assert(mapNames.length === 2);

// rename css
fs.renameSync(cssDir + cssNames[0], cssDir + "temp.css");
fs.renameSync(cssDir + cssNames[1], cssDir + cssNames[0]);
fs.renameSync(cssDir + "temp.css", cssDir + cssNames[1]);

// rename map
fs.renameSync(cssDir + mapNames[0], cssDir + "temp.map");
fs.renameSync(cssDir + mapNames[1], cssDir + mapNames[0]);
fs.renameSync(cssDir + "temp.map", cssDir + mapNames[1]);