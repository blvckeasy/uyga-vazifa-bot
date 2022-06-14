import { db_fetch, db_fetchAll } from './utils/pg.js'
import TelegramBot from 'node-telegram-bot-api'
import Queries from '../sql/database.js'
import fetch from 'node-fetch'
import request from 'request'
import path from 'path'
import fs from 'fs'

const token = '5510818167:AAE3LxifhKSRbP_IaWAi6lB3xRhFtjNyV14'
const bot = new TelegramBot(token, {
  polling: true,
  updates: {
    enabled: true
  }
})

const download = (url, path, callback) => {
  request.head(url, () => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
};

bot.on('message', async (msg) => {
  try {
    const group_id = msg.chat.id

    if (msg.from.id == msg.chat.id) return 
    if (group_id) {
      await db_fetch(`
        INSERT INTO groups (group_id, group_title, group_link, chat_type)
          VALUES ($1, $2, $3, $4) returning *;  
      `, msg.chat.id, msg.chat.title, msg.chat.username || null, msg.chat.type)
    }
  } catch (error) {
    console.log(error.message)
  }
})

bot.on('text', async (msg) => {
  try {
    if (msg.from.is_bot) throw new Error('You are robot -_-')
    if (msg.from.id != msg.chat.id) return

    const groups = await db_fetchAll(`SELECT * FROM groups WHERE table_deleted_at is null;`)
    const groups_id = groups.map((obj) => obj.group_id)
    const user_id = msg.from.id
    let is_group_member = false

    const groups_member = await Promise.all(groups_id.map(async (group_id) => {
      try {
        const data = {
          [group_id]: await bot.getChatMember(group_id, user_id)
        }
        is_group_member = true
        return data
      } catch (error) {
        return {
          [group_id]: undefinedN
        }
      }      
    }))

    console.log(groups_member)
    console.log(is_group_member)

    if (is_group_member && msg.text == '/start') {
      bot.sendMessage(msg.chat.id, '')

    } else {
      bot.sendMessage(msg.chat.id, 'Guruhlardan topilmadingiz.')
    }

  } catch (error) {
    console.error(1, error.message)
  }
})

bot.on('document', async (document) => {
    try {
      if (document.from.is_bot) throw new Error('You are robot -_-')
      if (document.from.id != document.chat.id) return

      const fileId = document.document.file_id
      const file_name = `${Date.now() % 100000}${document.document.file_name.replace(/\s/g, '_')}`
      const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`)
      const file_path = (await res.json()).result.file_path
      const downloadURL = `https://api.telegram.org/file/bot${token}/${file_path}`

      if (file_name == 'package.json') throw new Error(`package.json file doesn't send!`)

      download(downloadURL, path.join(process.cwd(), 'uploads', file_name), () => {
        console.log('Done !')
      })
    } catch (error) {
      bot.sendMessage(document.chat.id, 'ERROR: ' + error.message)
    }
  }
)










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