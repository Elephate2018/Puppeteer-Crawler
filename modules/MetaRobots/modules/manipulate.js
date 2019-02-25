const puppeteer = require("puppeteer");
const fs = require("fs");

exports.initializeBrowser = function initializeBrowser() {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await resolve([browser, page]);
    } catch (err) {
      reject(err);
    }
  });
};

exports.writeResults = function writeResults(stream, Metrics) {

    stream.write(Metrics.url);
    stream.write(" ");
  
    //Performance metrics
    for (let key in Metrics.performance) {
      stream.write(Metrics.performance[key].toString());
      stream.write(" ");
    }
    //Indexability status
    for (let key in Metrics.indexability) {
      stream.write(Metrics.indexability[key].toString());
      stream.write(" ");
    }
    //Canonicalization status
    for (let key in Metrics.canonicalization) {
      stream.write(Metrics.canonicalization[key].toString());
      stream.write(" ");
    }
    //Number of tags With and Without JavaScript
    for (let key in Metrics.numberOfTags) {
      stream.write(Metrics.numberOfTags[key].toString());
      stream.write(" ");
    }
   
    stream.write("\n");
};

exports.initializeWriteStream = function initializeWriteStream(output) {
  return fs.createWriteStream(`${output}\\Times.txt`, {
    flags: "a",
    encoding: "utf8"
  });
};
