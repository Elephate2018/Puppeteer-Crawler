const puppeteer = require('puppeteer');
const chalk = require('chalk');
const Table = require('cli-table');
const fs = require('fs')
//const URL = process.env.URL || 'https://www.chromestatus.com/features';

const stringify = require('csv-stringify');
const stringufyFunction = require('./stringify').createStringify;
const errorsHandle = require('./printErrors.js').handleErrors;


const EVENTS = [
  'domcontentloaded',
  'load',
  // 'networkidle2',
  'networkidle0',
];


function formatBytesToKB(bytes) {
  if (bytes > 1024) {
    const formattedNum = new Intl.NumberFormat('en-US', {maximumFractionDigits: 1}).format(bytes / 1024);
    return `${formattedNum}KB`;
  }
  return `${bytes} bytes`;
}

class UsageFormatter {
  constructor(stats) {
    this.stats = stats;
  }

  static eventLabel(event) {
    // const maxEventLabelLen = EVENTS.reduce((currMax, event) => Math.max(currMax, event.length), 0);
    // const eventLabel = event + ' '.repeat(maxEventLabelLen - event.length);
    return  event //chalk.magenta(event); event
  }

  summary(used = this.stats.usedBytes, total = this.stats.totalBytes) {
    const percent = Math.round((used / total) * 100);
    return `${formatBytesToKB(used)}/${formatBytesToKB(total)} (${percent}%)`;
  }

  shortSummary(used, total = this.stats.totalBytes) {
    const percent = Math.round((used / total) * 100);
    return used ? `${formatBytesToKB(used)} (${percent}%)` : 0;
  }

  barGraph(stats = this.stats) {
    // const MAX_TERMINAL_CHARS = process.stdout.columns;
    const maxBarWidth = 30;

    const jsSegment = ' '.repeat((stats.jsUsed / stats.totalBytes) * maxBarWidth);
    const cssSegment = ' '.repeat((stats.cssUsed / stats.totalBytes) * maxBarWidth);
    const unusedSegment = ' '.repeat(maxBarWidth - jsSegment.length - cssSegment.length);

    return chalk.bgRedBright(jsSegment) + chalk.bgBlueBright(cssSegment) +
           chalk.bgBlackBright(unusedSegment);
  }
}

const stats = new Map();

function addUsage(coverage, type, eventType) {
  for (const entry of coverage) {
    if (!stats.has(entry.url)) {
      stats.set(entry.url, []);
    }

    const urlStats = stats.get(entry.url);

    let eventStats = urlStats.find(item => item.eventType === eventType);
    if (!eventStats) {
      eventStats = {
        cssUsed: 0,
        jsUsed: 0,
        get usedBytes() { return this.cssUsed + this.jsUsed; },
        totalBytes: 0,
        get percentUsed() {
          return this.totalBytes ? Math.round(this.usedBytes / this.totalBytes * 100) : 0;
        },
        eventType,
        url: entry.url,
      };
      urlStats.push(eventStats);
    }

    eventStats.totalBytes += entry.text.length;

    for (const range of entry.ranges) {
      eventStats[`${type}Used`] += range.end - range.start - 1;
    }
  }
}

async function collectCoverage(URL) {
  const browser = await puppeteer.launch({headless: true});

  // Do separate load for each event. See
  // https://github.com/GoogleChrome/puppeteer/issues/1887
  const collectPromises = EVENTS.map(async event => {
    //console.log(`Collecting coverage @ ${UsageFormatter.eventLabel(event)}...`); ///////////////Collecting coverage//////////////// 1

    const page = await browser.newPage();

    // page.on('response', async response => {
    //   console.log(response.request().url(), (await response.text()).length);
    // });

    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage()
    ]);

    await page.goto(URL, {waitUntil: event}).catch(error => {
      console.log(error.name,':', error.message, '|| from navigation || coverage.js')
      errorsHandle(true, error.name, error.message, URL) //flag, name, message = parametrs
    });
    // await page.waitForNavigation({waitUntil: event});

    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage()
    ]);

    addUsage(cssCoverage, 'css', event);
    addUsage(jsCoverage, 'js', event);

    await page.close();
  });

  await Promise.all(collectPromises);

  return browser.close();
}

const runCoverage = async(URL, path_Details, output) => {

  await collectCoverage(URL);

  let data = []
  let columns = {
    EventType: 'EventType',
    UsedBytes: 'used Bytes',
    JsUsed: 'Js Used',
    CssUsed: 'css Used',
    TotalBytes: 'total Bytes',
    URL: 'URL'
  };

  for (const [url, vals] of stats) {
    //console.log('\n' + chalk.cyan(url));

    const table = new Table({
      // chars: {mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
      head: [
        'Event',
        `${chalk.bgRedBright(' JS ')} ${chalk.bgBlueBright(' CSS ')} % used`,
        'JS used',
        'CSS used',
        'Total bytes used'
      ],
      // style : {compact : true, 'padding-left' : 0}
      style: {head: ['white'], border: ['grey']}
      // colWidths: [20, 20]
    });

    EVENTS.forEach(event => {
      const usageForEvent = vals.filter(val => val.eventType === event);

      if (usageForEvent.length) {
        for (const stats of usageForEvent) {
          // totalBytes += stats.totalBytes;
          // totalUsedBytes += stats.usedBytes;

          const formatter = new UsageFormatter(stats);
      /*   table.push([
            UsageFormatter.eventLabel(stats.eventType),
            formatter.barGraph(),
            formatter.shortSummary(stats.jsUsed), // !== 0 ? `${formatBytesToKB(stats.jsUsed)}KB` : 0,
            formatter.shortSummary(stats.cssUsed),
            formatter.summary()
          ]);*/
        /*  console.log(
            chalk.magenta(UsageFormatter.eventLabel(stats.eventType)), '|||',
            //  formatter.barGraph(),'|||',
              formatter.shortSummary(stats.jsUsed),'|||', // !== 0 ? `${formatBytesToKB(stats.jsUsed)}KB` : 0,
              formatter.shortSummary(stats.cssUsed),'|||',
              formatter.summary()
          )*/
          data.push([
            UsageFormatter.eventLabel(stats.eventType),
            `${usageForEvent[0].usedBytes}`,
            usageForEvent[0].jsUsed,
            usageForEvent[0].cssUsed,
            usageForEvent[0].totalBytes,
            `  ${usageForEvent[0].url}`
        ]);
        }
      } else {
        //table.push([UsageFormatter.eventLabel(event), 'no usage found', '-', '-', '-']);
       // console.log(chalk.magenta(UsageFormatter.eventLabel(event)), 'no usage found', '-', '-', '-')
        data.push([UsageFormatter.eventLabel(event), 'no usage found', '-', '-', '-', `${url}`]);
      }
    });

    }


    let mainData = [];
    let columns2 = {
      ID: 'ID',
      Event: 'Event',
      TotalUsed: 'TotalUsed',
      PercentUsed: 'Percent Used',
      url: 'Url'
     };
  
     let randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
     let uniqid = randLetter + Date.now();

    EVENTS.forEach(event => {
      let totalBytes = 0;
      let totalUsedBytes = 0;

      const metrics = Array.from(stats.values());
      const statsForEvent = metrics.map(eventStatsForUrl => {
        const statsForEvent = eventStatsForUrl.filter(stat => stat.eventType === event)[0];
        // TODO: need to sum max totalBytes. Currently ignores stats if event didn't
        // have an entry. IOW, all total numerators should be max totalBytes seen for that event.
        if (statsForEvent) {
          totalBytes += statsForEvent.totalBytes;
          totalUsedBytes += statsForEvent.usedBytes;
        }
      });

      const percentUsed = Math.round(totalUsedBytes / totalBytes * 100);

    // console.log(`Total used @ ${chalk.magenta(event)}: ${formatBytesToKB(totalUsedBytes)}/${formatBytesToKB(totalBytes)} (${percentUsed}%)`);
     
      mainData.push([uniqid, event, ` ${formatBytesToKB(totalUsedBytes)}/${formatBytesToKB(totalBytes)}`, `${percentUsed}%`, URL])
    
    });
    
    try {
      let dithPath = `${output}/coverage_CSS_JS.csv`;

      await stringufyFunction(dithPath, mainData, columns) //save to csv main datas
  
      await stringufyFunction(`${path_Details}/${uniqid}.csv`, data, columns) //save to csv details datas
      data = []
      stats.clear()
      // console.log(data)
    } catch (error) {
      console.log(error.name,':', error.message, '|| from save to csv || coverage.js')
      errorsHandle(true, error.name, error.message, URL) //flag, name, message = parametrs
    }
    
   
  console.log('Coverage done')
   
};

module.exports.runCoverage = runCoverage;