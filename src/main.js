const puppeteer = require('puppeteer');
const config = require('../config/Config.json');
const {getText, click, clickWait, type, delay, getRandomInt, isVisible, canLogin, useFeature} = require('./helpers.js');
const {green, yellow, red, blue} = require('./printer.js');
const chalk = require('chalk');
const {insertWord, getWord, saveWords} = require('./words.js');
const uniqueRandomArray = require('unique-random-array');

let i = 0;
const lastTyped = new Map();

// MAIN
(async () => {
    if (!canLogin) {
        red('Please type in config/Config.json your login and password!');
        return;
    }

    const browser = await puppeteer.launch({headless: !config.show_browser});
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
    blue('[LOGIN] Logging in...');
    await page.goto(config.sites.login);

    await type(page, '#log_email', config.login);
    await type(page, '#log_password', config.password);

    await click(page, '#main-container > div:nth-child(2) > form > div > div:nth-child(3) > button');
    green('[LOGIN] Logged in!');
}

async function startSession(page) {
    blue('[START] Starting...');
    await click(page, '#session_button');

    if (await isVisible(page, '#continue_session_button')) {
        await clickWait(page, '#continue_session_button');
        green('[START] Continue!');
    } else {
        await clickWait(page, '#start_session_button');
        green('[START] Start!');
    }
}

async function answerQuestion(page) {
    i++;
    blue(`[ANSWER ${i}] Detecting word...`);
    const polish = await getText(page, '#question > div.caption > div.translations');

    blue(`[ANSWER ${i}] Detected polish word: ${chalk.white(polish)}`);
    await delay(getRandomInt(config.delays.wait_min, config.delays.wait_max));

    const translation = await getWord(polish);
    const englishes = translation?.map?.(obj => obj.english) ?? [];
    const english = englishes.find(word => !lastTyped.get(word)) ?? uniqueRandomArray(englishes)();
    if (english) {
        green(`[ANSWER ${i}] Found translation for: ${chalk.white(polish)}: ${chalk.cyan(english)}`);
        const random = Math.random();
        if (random < config.valid_chance) {
            green(`[ANSWER ${i}] Typing!`);
            await type(page, '#answer', english);
        } else {
            yellow(`[ANSWER ${i}] Not typing! ${chalk.white(random)} is higher than ${chalk.cyan(config.valid_chance)}`);
        }
    } else {
        red(`[ANSWER ${i}] Not found translation for: ${chalk.white(polish)}`);
    }

    await clickWait(page, '#check', config.delays.check_min, config.delays.check_max);

    const valid_english = await getText(page, '#word');
    blue(`[ANSWER ${i}] Valid translation for: ${chalk.white(polish)} is: ${chalk.cyan(valid_english)}`);
    if (english) {
        lastTyped.set(english, english !== valid_english);
    }
    if (valid_english && !englishes.find(word => word === valid_english)) {
        yellow(`[ANSWER ${i}] Saving translation for: ${chalk.white(polish)}: ${chalk.cyan(valid_english)}`);
        await insertWord(polish, valid_english);
    }

    blue(`[ANSWER ${i}] Next word!`);
    await clickWait(page, '#next_word', config.delays.next_word_min, config.delays.next_word_max);
}

async function handleStop(browser, page) {
    blue('[STOP] Confirming...');
    await click(page, '#return_mainpage');

    if (!useFeature()) {
        blue('[STOP] Saving words...');
        await saveWords();
    }

    blue('[STOP] Closing...');
    await browser.close();

    green('Thanks for using InstaLing Bot by PanSzelescik');
    green('https://github.com/PanSzelescik/instaling-bot');
}
