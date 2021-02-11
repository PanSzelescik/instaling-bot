const config = require('../config/Config.json');

async function getText(page, selector) {
    await checkVisibility(page, selector, config.delays.selector);
    const element = await page.$(selector);
    return page.evaluate(element => element.textContent, element);
}

async function click(page, selector) {
    await checkVisibility(page, selector, config.delays.selector);
    return Promise.all([
        page.click(selector),
        page.waitForNavigation({waitUntil: 'networkidle0'})
    ]);
}

async function clickWait(page, selector, wait_min = config.delays.click_min, wait_max = config.delays.click_max) {
    await checkVisibility(page, selector, config.delays.selector);
    await page.click(selector);
    return delay(getRandomInt(wait_min, wait_max))
}

async function type(page, selector, text, delay) {
    return page.type(selector, text, {delay: delay ?? getRandomInt(config.delays.type_min, config.delays.type_max)});
}

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

async function checkVisibility(page, selector, delay = 1000) {
    return page.waitForSelector(selector, {visible: true, timeout: delay});
}

async function isVisible(page, selector, delay) {
    return checkVisibility(page, selector, delay)
        .then(() => true)
        .catch(() => false)
}

function canLogin() {
    return config.login && config.password;
}

module.exports = {
    getText: getText,
    click: click,
    clickWait: clickWait,
    type: type,
    delay: delay,
    getRandomInt: getRandomInt,
    isVisible: isVisible,
    canLogin: canLogin
};
