const { exec } = require("child_process");
const fs = require("fs");

const addCommitHashToWorker = () => {
  exec('git log -n1 --format=format:"%H"', {}, (_err, result, _stderr) => {
    const firstLine = `const VERSION = "${result.replace("\n", "")}";\n`;
    fs.readFile("./src/service-worker.ts", "utf-8", (_err, data) => {
      const newFile = data.replace(/^(.*)$/m, firstLine);
      fs.writeFile(
        "./src/service-worker.ts",
        newFile,
        { encoding: "utf-8" },
        () => {}
      );
    });
  });
};

addCommitHashToWorker();
