import TelegramBot from 'node-telegram-bot-api'
import { messageFunction, authorizationFunction } from './controller/text.js'
import { textMiddleware } from './middleware/text.js';
import { upload,sendHomework } from './controller/document.js'
import { callback_query } from '../config.js'

const token = '5510818167:AAE3LxifhKSRbP_IaWAi6lB3xRhFtjNyV14'
const bot = new TelegramBot(token, {
  polling: true,
  updates: {
    enabled: true,
  },
})
let [question, offer, homework, confirmed, reject] = [false, false, false, false, false]


bot.on('message', async msg => {
  try {
    textMiddleware(msg, bot).then((err) => console.log(err))
  } catch (error) {
    console.log(error)
  }
})

bot.on('text', async msg => {
  try {
    if (msg.from.is_bot) throw new Error('You are bot -_-')
    if (!question && !offer && !homework) authorizationFunction(msg, bot)
    if (question) messageFunction(msg, bot, 'question', "36 soat ichida ustoz tarafidan javob keladi.")
    if (offer) messageFunction(msg, bot, 'offer', "Taklifingiz uchun raxmat :)")
  } catch (error) {
    console.error(1, error.message)
  }
})

bot.on('document', async document => {
  try {
    if (homework) {

      const opts = {
        inline_keyboard: [
          [
            { text: 'Tasdiqlash', callback_data: 'confirmed' },
            { text: 'Rad etish', callback_data: 'reject' },
          ],
        ],
      }

      bot.sendDocument(document.chat.id, document.document.file_id, {
        caption: "tasdiqlansinmi ?",
        reply_markup: JSON.stringify(opts)
      }) 
    }
  } catch (error) {
    console.log(error.message)
  }
})

bot.on('callback_query', async callbackQuery => {
  try {
    let selection = ''
    if (callbackQuery.data == 'question') [question, offer, homework, selection] = [true, false, false, 'question']
    if (callbackQuery.data == 'offer')    [question, offer, homework, selection] = [false, true, false, 'offer']
    if (callbackQuery.data == 'homework') [question, offer, homework, selection] = [false, false, true, 'homework']
    if (callbackQuery.data == 'cancel')   [question, offer, homework, selection] = [false, false, false, 'cancel']

    // buttons entered after sending the task
    if (callbackQuery.data == 'confirmed') {
      selection = 'confirmed'
      if (!callbackQuery.message.from.is_bot || callbackQuery.message.from.id < 0) 
        throw new Error('File upload is not for super group!')

      const file_info = await upload(callbackQuery.message, token)
      const response = await sendHomework(callbackQuery.message, file_info)  
      
      if (response.error.includes("duplicate key value violates unique constraint")) 
        throw new Error("file already uploaded!") // Client Error
      
    }
    if (callbackQuery.data == 'reject') [confirmed, reject, selection] = [false, true, 'reject']


    bot.answerCallbackQuery(callbackQuery.id).then(() => bot.sendMessage(callbackQuery.message.chat.id, callback_query[selection], {
        parse_mode: "HTML"
    }))
  } catch (error) {
    console.log('>_<\n', error)
  }
})






















// bot.on('text', async (msg) => {
//   const chatId = msg.chat.id
//   const res = await bot.sendMessage(chatId, 'SALOM')
//   const messageId = res.message_id

//   const message = 'its edited'
//   const opts = {
//         inline_keyboard: [[
//           {text: 'Add Option', callback_data: 'addOption'},
//           {text: 'Send', callback_data: 'send'},
//           {text: 'Delete', callback_data: 'delete'}
//           ]]
//    }
//   bot.editMessageText(message, {
//      chat_id: chatId,
//      message_id: messageId,
//      reply_markup: JSON.stringify(opts  ),
//   });

//   // console['log'](1, msg.chat.id)
// })

// bot.on("callback_query", async (callbackQuery) => {
//   const msg = callbackQuery.message;
//   bot.answerCallbackQuery(callbackQuery.id)
//       .then(() => bot.sendMessage(msg.chat.id, "You clicked!"));
// });

// bot.on('edited_message', (msg) => {
//   console.log(2, msg)
// })

// bot.on('sticker', s => {
//   console.log(3, s)
// })
