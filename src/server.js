import TelegramBot from "node-telegram-bot-api"
import { messageFunction, authorizationFunction } from "./controller/text.js"
import { textMiddleware } from "./middleware/text.js"
import { upload } from "./controller/document.js"
import { callback_query } from "../config.js"
import { getRequest, updateRequestSelection } from "./table/request.js"

const token = "5510818167:AAE3LxifhKSRbP_IaWAi6lB3xRhFtjNyV14"
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
    const user_id = callbackQuery.message.chat.id
    await updateRequestSelection(user_id, callbackQuery.data)

    // buttons entered after sending the task
    if (callbackQuery.data == "confirmed") {
      if (!callbackQuery.message.from.is_bot || callbackQuery.message.from.id < 0) throw new Error("File upload is not for super group!")
      await upload(callbackQuery.message, token)
    }

    if (callbackQuery.data == "confirmed" || callbackQuery.data == "reject" || callbackQuery.data == "cancel") {
      await updateRequestSelection(user_id)
    }

    await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id)
    await bot.answerCallbackQuery(callbackQuery.id).then(() => bot.sendMessage(callbackQuery.message.chat.id, callback_query[callbackQuery.data], {
        parse_mode: "HTML"
    }))
  } catch (error) {
    console.error("server.js -> callback_query:", error)
  }
})