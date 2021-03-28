const Bot = require('./classes/Bot');

const bot = new Bot();

const today = new Date();
// change search offset based on current week
const week = Math.ceil((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24 * 7));

bot.new_photos(week);