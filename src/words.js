const {get} = require('axios');
const config = require('../config/Config.json');
const words = require('../config/SavedWords.json');
const {useFeature} = require('./helpers.js');
const {Agent} = require('https');
const {writeFile} = require('fs/promises');

const agent = new Agent({
    rejectUnauthorized: false
});

async function getAllWords() {
    if (useFeature()) {
        const {data} = await get('https://api.crawcik.space/instaling.php', {
            httpsAgent: agent,
            params: {
                user: config.feature.user,
                pass: config.feature.password,
                type: 'select'
            }
        });
        return data
    }
    return words;
}

async function getWord(polish) {
    if (!polish) {
        console.error(new TypeError(`Tried to get word using nullish value: ${polish}! Aborting!`));
    }

    if (useFeature()) {
        const {data} = await get('https://api.crawcik.space/instaling.php', {
            httpsAgent: agent,
            params: {
                user: config.feature.user,
                pass: config.feature.password,
                type: 'select',
                pol: polish
            }
        });
        return data
    }
    return words.filter(obj => obj.polish === polish);
}

async function insertWord(polish, english) {
    if (!polish || !english) {
        console.error(new TypeError(`Tried to insert nullish value: ${{polish, english}}! Aborting!`));
    }

    if (useFeature()) {
        const {data} = await get('https://api.crawcik.space/instaling.php', {
            httpsAgent: agent,
            params: {
                user: config.feature.user,
                pass: config.feature.password,
                type: 'insert',
                pol: polish,
                eng: english
            }
        });
        return data;
    }
    return words.push({polish, english});
}

async function saveWords() {
    return writeFile('../config/SavedWords.json', JSON.stringify(words, null, 4), {encoding: 'utf8'})
}

module.exports = {
    getAllWords: getAllWords,
    getWord: getWord,
    insertWord: insertWord,
    saveWords: saveWords
};
