const puppeteer = require('puppeteer');
const cron = require('node-cron');
const user = "mcarrolldev@gmail.com";
const password = "BotUserDev505#"
const fs = require('fs').promises;


/*
    COURT SCHEDULER WIDGET SELECTOR:
    #CourtsScheduler > table > tbody > tr:nth-child(2) > td:nth-child(2) > 
    div > table > tbody > tr:nth-child(3) > td:nth-child(2) > span > button
    
    tr:nth-child(3) after table on the second line corresponds to row 
    (nth-child(3) is row 3 which is 11:30am)

    td:nth-child(2) is the selector for which court 1-6 for four oaks.

*/
//save cookie function
const saveCookie = async (page) => {
    const cookies = await page.cookies();
    const cookieJson = JSON.stringify(cookies, null, 2);
    await fs.writeFile('cookies.json', cookieJson);
}

//load cookie function
const loadCookie = async (page) => {
    const cookieJson = await fs.readFile('cookies.json');
    const cookies = JSON.parse(cookieJson);
    await page.setCookie(...cookies);
}

async function initBrowser(){
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    // these lines of code r to test log in functionality
    // const cookies = await page.cookies();   
    // await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
    await loadCookie(page);
    await page.goto('https://app.courtreserve.com/Online/Account/Login/7975?isMobileLayout=False');
    await saveCookie(page);
    if(page.url() == "https://app.courtreserve.com/Online/Account/Login/7975?isMobileLayout=False"){
        await logIn(page);
    }
    else{
        await reserve(page);
    }
    //await logIn(page);
    await browser.close();
}


async function logIn(page){
    console.log(page.url());
    await page.focus('input[name="UserNameOrEmail"]')
    await page.keyboard.type(user)
    await page.focus('input[name=Password')
    await page.keyboard.type(password);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({waitUntil: 'networkidle2'});
    await saveCookie(page);
   // await page.screenshot({ path: 'loggedin.png' })
    console.log('Logged in!');
    await reserve(page);
 
}

async function reserve(page){
    console.log('starting reservation');

    // goes to page
    await page.goto('https://app.courtreserve.com/Online/Reservations/Bookings/7975?sId=13515');
    console.log('went to page');
 //   await page.screenshot({ path: 'page.png', fullpage: true})
    const dateTimeObject = new Date();
    console.log(`Date: ${dateTimeObject.toDateString()}`);
    console.log(`Time: ${dateTimeObject.toTimeString()}`);
    await delay(10000);

    const dateTimeAfter = new Date();
    console.log(`Date: ${dateTimeAfter.toDateString()}`);
    console.log(`Time: ${dateTimeAfter.toTimeString()}`);

    // wait for here button
    await page.waitForSelector('#ReservationOpenTimeDispplay > span > a', {timeout: 5_000});
    // click here
    await page.evaluate(()=> document.querySelector('#ReservationOpenTimeDispplay > span > a'))

    // wait for court scheduler
    await page.waitForSelector('xpath=//*[@id="CourtsScheduler"]', { timeout: 5_000 });

    await page.evaluate(()=>document.querySelector('#CourtsScheduler > table > tbody > tr:nth-child(2) > td:nth-child(2) > div > table > tbody > tr:nth-child(8) > td:nth-child(2) > span > button').click())
    
    await page.waitForSelector('#reservation-general-info', {timeout: 5_000});
    // OPENS DROPDOWN FOR RESERVATION TYPE
    await page.evaluate(()=>document.querySelector('#reservation-general-info > div > div:nth-child(2) > div > div > span > button').click())
    // wait for drop down
    await page.waitForSelector('#ReservationTypeId-list > div.k-list-content.k-list-scroller', {timeout: 5_000});
    // select doubles
    await page.evaluate(()=>document.querySelector('#ReservationTypeId_listbox > li:nth-child(2)').click())

    // wait for duration to update
    await page.waitForSelector('#EndTime', {timeout: 5_000})
    //await page.evaluate(()=>document.querySelector('#Duration_listbox').click())
    await delay(200);

    // save
    //await page.evaluate(()=>document.querySelector('#createReservation-Form > div.modal-footer-container > div > button.btn.btn-primary.btn-submit').click())

    await delay(4000);



}



function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

initBrowser();

// cron.schedule('*/5 * * * * *', ()=> {
//     console.log("running every 5seconds");
//     initBrowser()
// });