import TelegramBot from "node-telegram-bot-api"
import { messageFunction, authorizationFunction, listRouteOpts, updatePageAndLimit } from "./controller/text.js"
import { getRequest, updateRequestSelection } from "./table/request.js"
import { textMiddleware } from "./middleware/text.js"
import { upload } from "./controller/document.js"
import { callback_query } from "../config.js"


const token = process.env.TOKEN
const bot = new TelegramBot(token, {
  polling: true,
  updates: {
    enabled: true,
  },
})

bot.on("message", async msg => {
  try {
    const { error } = await textMiddleware(msg, bot)
    if (error) throw new Error(error)
  } catch (error) {
    console.error("server -> message:", error)
  }
})

bot.on("text", async msg => {
  try {
    if (msg.chat.type == "supergroup") return
    const { selection } = await getRequest(msg.chat.id)

    if (msg.from.is_bot) throw new Error("You are bot -_-")
    if (!selection) authorizationFunction(msg, bot)
    if (selection == "question") messageFunction(msg, bot, selection, "36 soat ichida ustoz tarafidan javob keladi.")
    if (selection == "offer") messageFunction(msg, bot, selection, "Taklifingiz uchun raxmat :)")
  } catch (error) {
    console.error("server -> text:", error.message)
  }
})

bot.on("document", async document => {
  try {
    const { selection } = await getRequest(document.chat.id)
    
    if (selection == "homework") {
      const opts = {
        inline_keyboard: [
          [
            { text: "Tasdiqlash ✅", callback_data: "confirmed" },
            { text: "Rad etish ❌", callback_data: "reject" },
          ],
        ],
      }

      await bot.sendDocument(document.chat.id, document.document.file_id, {
        caption: document.caption,
        reply_markup: JSON.stringify(opts)
      })
    }
  } catch (error) {
    console.error("server -> document:", error)
  }
})

bot.on("callback_query", async (callbackQuery) => {
  try {
    const user_id = callbackQuery.from.id
    const chat_id = callbackQuery.message.chat.id
    const message_id = callbackQuery.message.message_id
    const message = callbackQuery.message.text
    await updateRequestSelection(user_id, callbackQuery.data)

    // buttons entered after sending the task
    if (callbackQuery.data == "confirmed") {
      if (!callbackQuery.message.from.is_bot || callbackQuery.message.from.id < 0) throw new Error("File upload is not for super group!")
      await upload(callbackQuery.message, token)
    }

    if (callbackQuery.data == "confirmed" || callbackQuery.data == "reject" || callbackQuery.data == "cancel") {
      await updateRequestSelection(user_id)
    }

    if (callbackQuery.data == "user_uploaded_files") {
      console.log(callbackQuery)
    }

    if (callbackQuery.data == "list_next") {
      const { list_page: page } = await getRequest(user_id)
      await updatePageAndLimit(user_id, page + 1)
      const { opts } = await listRouteOpts(user_id, chat_id)


      await bot.editMessageText(message, {
        chat_id: chat_id,
        message_id: message_id,
        reply_markup: opts,
     })
  
      await updateRequestSelection(user_id)
    }

    if (callbackQuery.data == "list_prev") {
      const { list_page: page } = await getRequest(user_id)
      await updatePageAndLimit(user_id, page - 1)
      const { opts } = await listRouteOpts(user_id, chat_id)


      await bot.editMessageText(message, {
        chat_id: chat_id,
        message_id: message_id,
        reply_markup: opts,
     })
      await updateRequestSelection(user_id)
    }


    if (callback_query[callbackQuery.data]) {
      await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id)
      await bot.answerCallbackQuery(callbackQuery.id).then(() => bot.sendMessage(callbackQuery.message.chat.id, callback_query[callbackQuery.data], {
          parse_mode: "HTML"
      }))
    }

  } catch (error) {
    console.error("server.js -> callback_query:", error)
  }
})




// const func = (d) => {
//   const date = new Date(d) 
//   console.log(date.getFullYear() + ':' + String(date.getMonth() - 1).padStart(2, '0') + ':' + String(date.getDate()).padStart(2, '0')) 
  
// }
// import dateFormat from 'dateformat';
// var now = new Date();
// const a = dateFormat(1657010472, "dddd, mmmm dS, yyyy, h:MM:ss TT");
// console.log(a)
// func(Date.now())