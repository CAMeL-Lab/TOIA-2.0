const fs = require("fs");
const path = require("path");

function findDockerIgnoreFiles(
    dirPath,
    ignoreDirs = [],
    dockerIgnoreFiles = []
) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !ignoreDirs.includes(file)) {
            findDockerIgnoreFiles(filePath, ignoreDirs, dockerIgnoreFiles);
        } else if (file === ".dockerignore") {
            dockerIgnoreFiles.push(path.relative(process.cwd(), filePath));
        }
    });
    return dockerIgnoreFiles;
}

const dockerIgnoreFiles = findDockerIgnoreFiles(process.cwd(), [
    "node_modules",
    "dist",
    "build",
    "deps",
    "Accounts",
    ".git",
]);
console.log(dockerIgnoreFiles);

const rootDockerIgnorePath = path.join(__dirname, "dockerignore.txt");
fs.writeFileSync(rootDockerIgnorePath, "");

for (const dockerIgnoreFile of dockerIgnoreFiles) {
    const dirName = path.dirname(dockerIgnoreFile);
    const contents = fs.readFileSync(dockerIgnoreFile, "utf8");
    const lines = contents.split("\n");
    for (const line of lines) {
        if (line.trim() !== "" && Array.from(line)[0] !== "#") {
            fs.appendFileSync(rootDockerIgnorePath, `${dirName}/${line}\n`);
        }
    }
}
