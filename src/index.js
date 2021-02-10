const puppeteer = require('puppeteer');
const config = require('../config/Config.json');
const fs = require('fs/promises');

const words = new Map();
Object.entries(require('../config/Words.json')).forEach(([polish, english]) => words.set(polish, english));

// MAIN
(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await login(page);
    await startSession(page);
    try {
        // Jak się wypierdoli to znaczy że koniec i można zamknąć
        while (true) {
            await answerQuestion(page);
        }
    } catch (e) {
        console.error(e);
        await handleStop(browser, page);
    }
})();

// STEPS
async function login(page) {
    await page.goto(config.sites.login);
    console.log('[LOGIN] Logging in...');
    await page.type('#log_email', config.login, {delay: getRandomInt(config.delays.type_min, config.delays.type_max)});
    await page.type('#log_password', config.password, {delay: getRandomInt(config.delays.type_min, config.delays.type_max)});
    await click(page, '#main-container > div:nth-child(2) > form > div > div:nth-child(3) > button');
    console.log('[LOGIN] Logged in!');
}

async function startSession(page) {
    console.log('[START] Starting instaling...');
    await click(page, '#session_button');

    //await clickWait(page, '#continue_session_button'); // Uncomment if you have error in starting session
    await clickWait(page, '#start_session_button');
    console.log('[START] Started instaling!');
}

async function answerQuestion(page) {
    console.log('[ANSWER] Detecting word...');
    const polish = await getText(page, '#question > div.caption > div.translations');

    console.log(`[ANSWER] Detected polish word: ${polish}`);
    await delay(getRandomInt(config.delays.wait_min, config.delays.wait_max));

    if (words.has(polish)) {
        const translation = words.get(polish);
        console.log(`[ANSWER] Found translation for: ${polish}: ${translation}`);
        const random = Math.random();
        if (random < config.valid_chance) {
            console.log(`[ANSWER] Typing!`);
            await page.type('#answer', translation, {delay: getRandomInt(config.delays.type_min, config.delays.type_max)});
        } else {
            console.log(`[ANSWER] Not typing! ${random} is higher than ${config.valid_chance}`);
        }
    } else {
        console.log(`[ANSWER] Not found translation for: ${polish}`);
    }

    await clickWait(page, '#check', getRandomInt(config.delays.check_min, config.delays.check_max));
    const english = await getText(page, '#word');
    console.log(`[ANSWER] Valid translation for: ${polish} is: ${english}`);
    if (words.get(polish) !== english) {
        console.log(`[ANSWER] Saving translation for: ${polish}: ${english}`);
        words.set(polish, english);
    }

    console.log(`[ANSWER] Next word!`);
    await clickWait(page, '#next_word', getRandomInt(config.delays.next_word_min, config.delays.next_word_max));
}

async function handleStop(browser, page) {
    console.log('[STOP] Saving words...');
    const json = {};
    words.forEach((value, key) => json[key] = value);
    await fs.writeFile('config/Words.json', JSON.stringify(json, null, 4));

    console.log('[STOP] Confirming...');
    await click(page, '#return_mainpage');

    console.log('[STOP] Closing...');
    await browser.close();
}

// HELPERS
async function getText(page, selector) {
    await page.waitForSelector(selector, {visible: true, timeout: config.delays.selector});
    const element = await page.$(selector);
    return page.evaluate(element => element.textContent, element);
}

async function click(page, selector) {
    await page.waitForSelector(selector, {visible: true, timeout: config.delays.selector});
    return Promise.all([
        page.click(selector),
        page.waitForNavigation({waitUntil: 'networkidle0'})
    ]);
}

async function clickWait(page, selector, wait = config.delays.default) {
    await page.waitForSelector(selector, {visible: true, timeout: config.delays.selector});
    await page.click(selector);
    await delay(wait);
}

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
