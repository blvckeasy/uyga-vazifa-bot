import TelegramBot from 'node-telegram-bot-api'
import { messageFunction, authorizationFunction } from './controller/text.js'
import { textMiddleware } from './middleware/text.js'
import { upload,sendHomework } from './controller/document.js'
import { callback_query } from '../config.js'
import { getRequests } from './table/request.js'

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
    const err = await textMiddleware(msg, bot)
    if (err) throw new Error()
  } catch (error) {
    console.error('server -> message:', error)
  }
})

bot.on('text', async msg => {
  try {
    
    if (msg.from.is_bot) throw new Error('You are bot -_-')
    if (!question && !offer && !homework) authorizationFunction(msg, bot)
    if (question) messageFunction(msg, bot, 'question', "36 soat ichida ustoz tarafidan javob keladi.")
    if (offer) messageFunction(msg, bot, 'offer', "Taklifingiz uchun raxmat :)")
  } catch (error) {
    console.error('server -> text:', error.message)
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
    console.error('server -> document:', error.message)
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
      
      if (response.error?.includes("duplicate key value violates unique constraint")) 
        throw new Error(response.error) // Client Error "file already uploaded!"
      
    }
    if (callbackQuery.data == 'reject') [confirmed, reject, selection] = [false, true, 'reject']

    await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id)
    await bot.answerCallbackQuery(callbackQuery.id).then(() => bot.sendMessage(callbackQuery.message.chat.id, callback_query[selection], {
        parse_mode: "HTML"
    }))
  } catch (error) {
    console.error('server.js -> callback_query:', error)
  }
})