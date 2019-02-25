const fs = require('fs');
const stringify = require('csv-stringify');

async function handleErrors(flag, name, message, url) {
    try {
        
        let data = [];
        let columns = {
          name: 'Error name',
          message: 'Error message', 
          url: 'URL'  
        }
        data.push([name, message, url])

        await printError(flag, columns, data)

    } catch (error) {
        console.log(error.name,':', error.message, '|| from: printErrors.js')
       // await handleErrors(flag, name)
        await handleErrors(true, error.name, error.message)

    }
}

async function printError(flag, columns, data) {
    let dirPath = './errors'
    flag = false
    try {
        if(!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
            flag = true
        } 
       // console.log(flag)
        stringify(data, {header: flag, columns: columns}, (err, output) => {
            if(err) throw err;
            fs.appendFileSync(`${dirPath}/errors.csv`, output, 'utf8', (err) => {
                if (err) throw err;
            })
        })
    } catch (error) {
        console.log(error.name,':', error.message, '|| from: printErrors.js')
        await handleErrors(true, error.name, error.message)
    }

}



module.exports.handleErrors = handleErrors;