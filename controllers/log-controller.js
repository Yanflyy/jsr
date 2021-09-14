const fs = require("fs");
const path = require("path");

const logAction = async (actionText) => {
  let reqPath = path.join(__dirname, "..", "logs", "action-log.txt");
  let time = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
  let str = time + ": " + actionText + "\n";

  // open the file in writing mode, adding a callback function where we do the actual writing
  fs.open(reqPath, "a", function (err, fd) {
    if (err) {
      throw "could not open file: " + err;
    }

    // write the contents of the buffer, from position 0 to the end, to the file descriptor returned in opening our file
    fs.write(fd, str, (err) => {
      if (err) throw "error writing file: " + err;
      fs.close(fd, function () {
        console.log(time + " : Action Logged");
      });
    });
  });
};

const logError = async () => {};

exports.logAction = logAction;
exports.logError = logError;
