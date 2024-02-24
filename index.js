const puppeteer = require('puppeteer');
const cron = require('node-cron');
const { url } = require('inspector');
const fs = require('fs').promises;
//const {TimeoutError} = require('puppeteer/Errors');


const user = "mcarrolldev@gmail.com";
const password = "BotUserDev505#"

// If Tom Brown CourtNum = 1-4
// If Four Oaks CourtNum = 1-6
const TimeSlot = 8;
const CourtNum = 4;

// Tom Brown or Four Oaks
const WhichCourt="Four Oaks"



//import { config } from './config.js';

/*
    COURT SCHEDULER WIDGET SELECTOR:
    #CourtsScheduler > table > tbody > tr:nth-child(2) > td:nth-child(2) > 
    div > table > tbody > tr:nth-child(3) > td:nth-child(2) > span > button
    
    tr:nth-child(3) after table on the second line corresponds to row 
    (nth-child(3) is row 3 which is 11:30am)

    td:nth-child(2) is the selector for which court 1-6 for four oaks.

*/

//const expectedKey = 'fsu_pickle_access_key';

// Function to verify the personal key
/*
function verifyKey(providedKey) {
    return providedKey === expectedKey;
}

// Check if the personal key is provided as a command-line argument
const providedKey = process.argv[2];
if (!providedKey || !verifyKey(providedKey)) {
    console.error('Invalid personal key. Please provide a valid key.');
    process.exit(1);
}
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
    const browser = await puppeteer.launch({headless: false, slowMo: 20});
    const page = await browser.newPage();
    // these lines of code r to test log in functionality

    // NEED THESE ON FIRST RUN
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
    const dateTimeStart = new Date();
    console.log(`Start Time: ${dateTimeStart.toTimeString()}`);
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
    if(WhichCourt == "Tom Brown"){
        await page.goto('https://app.courtreserve.com/Online/Reservations/Bookings/7975?sId=12131');    }
    else if(WhichCourt == "Four Oaks"){
        await page.goto('https://app.courtreserve.com/Online/Reservations/Bookings/7975?sId=13515');    }
    console.log('went to page');
   
    const dateTimeObject = new Date();
    console.log(`Date: ${dateTimeObject.toDateString()}`);
    console.log(`Time: ${dateTimeObject.toTimeString()}`);


    // wait for here button
     //await page.waitForSelector('#ReservationOpenTimeDispplay > span > a', {timeout: 5_000});
     try {
        await page.waitForSelector('#ReservationOpenTimeDispplay > span > a', {timeout: 30_000});
        await page.evaluate(()=> document.querySelector('#ReservationOpenTimeDispplay > span > a').click())

    } catch (e) {
            console.log('here button not displayed/clicked')
          // Do something if this is a timeout.
      }
    
     // click here
     // await page.evaluate(()=> document.querySelector('#ReservationOpenTimeDispplay > span > a'))


    // TESTING
    // await page.evaluate(()=>document.querySelector('#CourtsScheduler > div > span.k-scheduler-navigation.k-button-group > button.k-button.k-button-md.k-rounded-md.k-button-solid.k-button-solid-base.k-icon-button.k-nav-next').click())
    // await page.evaluate(()=>document.querySelector('#CourtsScheduler > div > span.k-scheduler-navigation.k-button-group > button.k-button.k-button-md.k-rounded-md.k-button-solid.k-button-solid-base.k-icon-button.k-nav-next').click())
    // await page.evaluate(()=>document.querySelector('#CourtsScheduler > div > span.k-scheduler-navigation.k-button-group > button.k-button.k-button-md.k-rounded-md.k-button-solid.k-button-solid-base.k-icon-button.k-nav-next').click())
    // await page.evaluate(()=>document.querySelector('#CourtsScheduler > div > span.k-scheduler-navigation.k-button-group > button.k-button.k-button-md.k-rounded-md.k-button-solid.k-button-solid-base.k-icon-button.k-nav-next').click())
    // await page.evaluate(()=>document.querySelector('#CourtsScheduler > div > span.k-scheduler-navigation.k-button-group > button.k-button.k-button-md.k-rounded-md.k-button-solid.k-button-solid-base.k-icon-button.k-nav-next').click())
    // await page.evaluate(()=>document.querySelector('#CourtsScheduler > div > span.k-scheduler-navigation.k-button-group > button.k-button.k-button-md.k-rounded-md.k-button-solid.k-button-solid-base.k-icon-button.k-nav-next').click())
    // await page.evaluate(()=>document.querySelector('#CourtsScheduler > div > span.k-scheduler-navigation.k-button-group > button.k-button.k-button-md.k-rounded-md.k-button-solid.k-button-solid-base.k-icon-button.k-nav-next').click())

    await delay(2000);
    
    // wait for court scheduler
    await page.waitForSelector('xpath=//*[@id="CourtsScheduler"]', { timeout: 10_000 });


    console.log(TimeSlot, CourtNum)
    await page.evaluate((TimeSlot, CourtNum)=>{
        console.log(TimeSlot, CourtNum)
        document.querySelector('#CourtsScheduler > table > tbody > tr:nth-child(2) > td:nth-child(2) > div > table > tbody > tr:nth-child(' + TimeSlot + ') > td:nth-child(' + CourtNum + ') > span > button').click();
    }, TimeSlot, CourtNum);


    await page.waitForSelector('#reservation-general-info', {timeout: 30_000});
    // OPENS DROPDOWN FOR RESERVATION TYPE
    await page.evaluate(()=>document.querySelector('#reservation-general-info > div > div:nth-child(2) > div > div > span > button').click())
    // wait for drop down

    await page.waitForSelector('#ReservationTypeId-list > div.k-list-content.k-list-scroller', {timeout: 15_000});
    
    // NEW LINE to make sure doubles is loaded.
    await page.waitForSelector('#ReservationTypeId_listbox > li:nth-child(2)', {timeout: 15_000});

    // select doubles
    // first test failed here. click was null
    await page.evaluate(()=>document.querySelector('#ReservationTypeId_listbox > li:nth-child(2)').click())

    // wait for duration to update
    await page.waitForSelector('#EndTime', {timeout: 10_000})
    await delay(2000);
    await page.evaluate(()=>document.querySelector('#Duration_listbox').click())

    await delay(2000);

    // save
    await page.evaluate(()=>document.querySelector('#createReservation-Form > div.modal-footer-container > div > button.btn.btn-primary.btn-submit').click())
    const dateTimeEnd = new Date();
    console.log(` End Time: ${dateTimeEnd.toTimeString()}`);
    await delay(4000);

    const dateTimeAfter = new Date();
    console.log(`Date: ${dateTimeAfter.toDateString()}`);
    console.log(`Time: ${dateTimeAfter.toTimeString()}`);



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