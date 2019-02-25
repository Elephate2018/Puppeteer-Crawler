
function evaluatePerformance(page) {
    try {
      return page.evaluate(() => {
        return performance.toJSON();
      });
    } catch (error) {
      console.log("Error during performance evaluation ");
      console.log(error);
    }
  }

  exports.measurePerformance = async function measurePerformance(page) {
    //Evaluate performance
    var perf = await evaluatePerformance(page);
    console.log()
    var TTFB =  perf.timing.responseStart - perf.timing.requestStart;
    var trueTTFB = perf.timing.responseStart - perf.timing.fetchStart;
    return([TTFB, trueTTFB])
}