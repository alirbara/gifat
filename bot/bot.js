const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '6171925209:AAG2FKLnGnEX07a6cASBomdzzDs_1ACJzsE';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});


// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  console.log(msg.document.file_id);
  bot.sendAnimation(msg.from.id, msg.document.file_id)
});
