
## The installation process

1. copy repository with command:
    ```bash
    git clone https://github.com/tobiasz18/Puppeteer-Crawler.git
    ```
    * or download zip

2. type in terminal:
    ```bash
    npm install
    ```
 
3. install reddis date base:
 * if you using windows download from : https://github.com/MicrosoftArchive/redis/releases



## Getting Started / How to run on windows

1. run redis-server from the file you downloaded(Redis-x64-3.2.100)
2. choice your url in crawl.js || URL variable 
3. clear your data base:

 * run redis-cli from the file you downloaded(Redis-x64-3.2.100) 
 * type command - flushall 
 * when redis-server is running type in redis-cli ctrl + c to delete monitoring to debugging

4. type in your terminal to start:

    ```bash
    node crawl
    ``` 

## Check error handling

  ```bash  
  npm run test
```
* All errors are saved in the file:

  ```bash  
     ./errors/errors.csv
    ```

## Example output 


![Example output](https://i.ibb.co/T8fzMKV/output.jpg)

### files 
* www.onet.pl 
    ```bash  
      The name of the file that we take from the URL variable

    ```

* Coverage_Detail_List
    ```  
       Test lazy loading strategy by seeing CSS/JS code coverage usage across page load for single 
       url coverage_CSS_JS
    ```   
* Features_Detail_List
    ```  
        shows a name of unsupported features by chrome version 41 for single 
       url from features
    ``` 

* All_links_for_single_url
    ```  
        Like in name file, we taking all chilldrens from page who are crawled
    ``` 
* coverage_CSS_JS
    ```  
    general data 
    ``` 
* crawler
    ```  
    URL's main list 

    ``` 
* features
    ```  
    shows a number (length) of unsupported features by chrome version 41
    ```         

## what if you want to stop the crawler and start again 

1. Stop crowling , you can use ctrl-c
2. change file name in output: example www.onet.pl to onet.pl
3. clear data base:
 * open redis-cli file and write command:  flushall
4. run in terminal:
   ```bash
    node crawl
    ```  

 

## Built With
* [GoogleChromeLabs](https://github.com/GoogleChromeLabs/puppeteer-examples) 
* [headless-chrome-crawler](https://github.com/yujiosaka/headless-chrome-crawler) 
* [Meta-Robots](https://github.com/AdiCherryson/Meta-robots) 
