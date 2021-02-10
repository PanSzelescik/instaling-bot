const chalk = require('chalk');

function log(text) {
    console.log(text);
}

function green(text) {
    log(chalk.green(text));
}

function yellow(text) {
    log(chalk.yellow(text));
}

function red(text) {
    log(chalk.red(text));
}

function blue(text) {
    log(chalk.blue(text));
}

module.exports = {
    green: green,
    yellow: yellow,
    red: red,
    blue: blue
}
