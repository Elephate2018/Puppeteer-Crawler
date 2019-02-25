const stringify = require("csv-stringify");
const fs = require('fs');

async function createStringify(FILE, data, columns)  {

  try {
    if(!fs.existsSync(FILE)) {
      const dataEmpty = []
      dataEmpty.push([''])
      await stringifyPrint(dataEmpty, columns, true, FILE)
    }
   // await stringifyPrint(data, columns, false, FILE)
    stringify(data, {header: false, columns: columns}, (err, output) => {
      if(err) throw err;
      
      fs.appendFileSync(FILE, output, 'utf8', (err) => {
        if(err) throw err;
      })
    })

  } catch(error) {
    console.log(error, "Error from createStringify")
  } 
}


async function stringifyPrint(data, columns, flag, FILE) {
  stringify(data, {header: flag, columns: columns}, (err, output) => {
    if(err) throw err;
    fs.writeFileSync(FILE, output, 'utf8', (err) => {
      if(err) throw err;
    })
  })
}
  
module.exports.createStringify = createStringify;
