const puppeteer = require('puppeteer');
const config = require('../config/Config.json');
const {getText, click, clickWait, type, isVisible, canLogin, useFeature, savePage, prepare, eventer} = require('./helpers.js');
const {green, yellow, red, blue, error} = require('./printer.js');
const chalk = require('chalk');
const {insertWord, getWord, saveWords} = require('./words.js');
const uniqueRandomArray = require('unique-random-array');

let i = 0;
const lastTyped = new Map();

// MAIN
(async () => {
    let page;
    try {
        if (!canLogin) {
            red('Please type in config/Config.json your login and password!');
            return;
        }

        page = await start();
        await login(page);
        await startSession(page);
        try {
            // Jak się wypierdoli to znaczy że koniec i można zamknąć
            while (true) {
                await answerQuestion(page);
            }
        } catch (e) {
            error(e);
            await savePage(page, 'error');
            await handleStop(page);
            eventer.emit('stopBot', 0);
        }
    } catch (err) {
        error(err);
        await savePage(page, 'error');
        await handleStop(page);
        eventer.emit('stopBot', 1);
    }
})();

async function start() {
    const options = {
        headless: !config.show_browser,
        devtools: config.open_devtools,
        args: [`--disable-extensions-except=${__dirname}/../uBlock_Origin_1.34.0_0/`, `--load-extension=${__dirname}/../uBlock_Origin_1.34.0_0/`]
    };

    if (config.mute_audio) {
        options.args.push('--mute-audio');
    }

    const [browser] = await Promise.all([
        puppeteer.launch(options),
        prepare()
    ]);
    const pages = await browser.pages();
    return pages[0] ?? await browser.newPage();
}

// STEPS
async function login(page) {
    if (config.debug) {
        page.on('console', message => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
            .on('pageerror', ({ message }) => console.log(message))
            .on('response', response => console.log(`${response.status()} ${response.url()}`))
            .on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`))
    }

    page.on('dialog', async dialog => {
        red(`Dialog: \`${dialog.message()}\``);
        if (dialog.message() === 'Błąd połączenia') {
            error(new Error('Błąd połączenia'));
            eventer.emit('stopBot', 1);
        }
        await dialog.dismiss();
    });

    blue(`[LOGIN] Logging in as \`${config.login}\`...`);
    await page.goto(config.sites.login);

    await type(page, '#log_email', config.login);
    await type(page, '#log_password', config.password);

    await click(page, '#main-container > div:nth-child(3) > form > div > div:nth-child(3) > button');
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
    await savePage(page, i);
    blue(`[ANSWER ${i}] Detecting word...`);

    const [sentence, polish] = await Promise.all([
        getText(page, '#question > div.usage_example'),
        getText(page, '#question > div.caption > div.translations')
    ]);

    blue(`[ANSWER ${i}] Detected sentence: \`${chalk.white(sentence)}\``);
    blue(`[ANSWER ${i}] Detected polish word: \`${chalk.white(polish)}\``);

    const translation = await getWord(polish, sentence);
    const englishes = translation?.map?.(obj => obj.english) ?? [];
    const english = englishes.find(word => !lastTyped.get(word)) ?? uniqueRandomArray(englishes)();

    if (await isVisible(page, '#new_word_form')) {
        return newWord(page);
    } else {
        if (english) {
            green(`[ANSWER ${i}] Found translation for: \`${chalk.white(polish)}\`: \`${chalk.cyan(english)}\``);
            const random = Math.random();
            if (random < config.valid_chance) {
                green(`[ANSWER ${i}] Typing!`);
                await type(page, '#answer', english);
            } else {
                yellow(`[ANSWER ${i}] Not typing! \`${chalk.white(random)}\` is higher than \`${chalk.cyan(config.valid_chance)}\``);
            }
        } else {
            red(`[ANSWER ${i}] Not found translation for: \`${chalk.white(polish)}\``);
        }

        await clickWait(page, '#check', config.delays.check_min, config.delays.check_max);

        const valid_english = (await getText(page, '#word')).trim();
        blue(`[ANSWER ${i}] Valid translation for: \`${chalk.white(polish)}\` is: \`${chalk.cyan(valid_english)}\``);
        if (english) {
            lastTyped.set(english, english !== valid_english);
        }
        if (valid_english && !englishes.find(word => word === valid_english)) {
            yellow(`[ANSWER ${i}] Saving translation for: \`${chalk.white(polish)}\`: \`${chalk.cyan(valid_english)}\``);
            await insertWord(polish, valid_english, sentence);
        }
    }

    blue(`[ANSWER ${i}] Next word!`);
    await clickWait(page, '#next_word', config.delays.next_word_min, config.delays.next_word_max);
}

async function newWord(page) {
    const known = false;
    if (known) {
        console.log('--------- KNOWN ----------');
        //TODO
    } else {
        await savePage(page, `${i}_feature_0`);
        await clickWait(page, '#dont_know_new', config.delays.check_min, config.delays.check_max);
        await savePage(page, `${i}_feature_1`);
        blue(`[ANSWER ${i}] Next word!`);
        await clickWait(page, '#skip > #next_word', config.delays.next_word_min, config.delays.next_word_max);
    }
}

async function handleStop(page) {
    if (!page) return;
    blue('[STOP] Confirming...');
    await click(page, '#return_mainpage');

    if (!useFeature()) {
        blue('[STOP] Saving words...');
        await saveWords();
    }

    blue('[STOP] Closing...');
    await page.browser().close();

    green('Thanks for using InstaLing Bot by PanSzelescik');
    green('https://github.com/PanSzelescik/instaling-bot');
}
