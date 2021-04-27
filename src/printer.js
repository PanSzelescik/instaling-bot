const chalk = require('chalk');
const config = require('../config/Config.json');
const {WebhookClient} = require('discord.js');
const stripAnsi = require('strip-ansi');
const {MessageEmbed} = require('discord.js');

let webhook = undefined;
let string = '';
let interval;
prepareWebhook();

function log(text) {
    string += '\n';
    string += text;
    console.log(text);
}

function green(text) {
    return log(chalk.green(text));
}

function yellow(text) {
    return log(chalk.yellow(text));
}

function red(text) {
    return log(chalk.red(text));
}

function blue(text) {
    return log(chalk.blue(text));
}

function error(text) {
    sendAndClear().catch(console.error);
    webhook?.send?.('', new MessageEmbed()
        .setColor('RED')
        .setTitle(`:exclamation: ${text?.name}`)
        .addField('Message', text?.message, false)
        .addField('Text', text, false)
        .setFooter('InstaLing Bot by PanSzelescik', 'https://avatars.githubusercontent.com/u/26679785')
        .setTimestamp(new Date())
        .addField('Stacktrace', text?.stack?.length > 1024 ? text?.stack?.substring?.(0, 1023) : text?.stack, false)
        .setDescription(`Wystąpił nieznany błąd i bot został zatrzymany!\n[ZGŁOŚ BŁĄD](https://github.com/PanSzelescik/instaling-bot/issues)`)).catch(console.error);
    console.error(text);
}

function prepareWebhook() {
    if (config?.webhook) {
        const splitted = config.webhook.split('/');
        const id = splitted[splitted.length - 2];
        const token = splitted[splitted.length - 1];
        if (id && token) {
            webhook = new WebhookClient(id, token, {apiRequestMethod: 'sequential'});
            interval = setInterval(async () => sendAndClear(), 5000);
        }
    }
}

async function send(text) {
    return webhook?.send?.(stripAnsi(text));
}

async function sendAndClear() {
    if (string) {
        const toSend = string;
        string = '';
        return send(toSend);
    }
}

module.exports = {
    green,
    yellow,
    red,
    blue,
    error,
    interval,
    sendAndClear
}
