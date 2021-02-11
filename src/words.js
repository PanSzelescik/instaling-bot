const axios = require('axios');
const config = require('../config/Config.json');
const {useFeature} = require('./helpers.js');
const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function getWord(polish) {
    if (useFeature) {
        const {data} = await axios.get('https://api.crawcik.space/instaling.php', {
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
}

async function insertWord(polish, english) {
    if (useFeature) {
        const {data} = await axios.get('https://api.crawcik.space/instaling.php', {
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
}

module.exports = {
    getWord: getWord,
    insertWord: insertWord
};
