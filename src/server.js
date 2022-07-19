import TelegramBot from "node-telegram-bot-api";
import dateFormat from "dateformat";
import { messageFunction, authorizationFunction, listRouteOpts, updatePageAndLimit } from "./controller/text.js";
import { getRequest, updateRequestSelection } from "./table/request.js";
import { getFiles, deleteFileInfo } from './table/file.js';
import { textMiddleware } from "./middleware/text.js";
import { insertFileInfo } from "./controller/document.js";
import { callback_query } from "../config.js";


const token = process.env.TOKEN;
const bot = new TelegramBot(token, {
  polling: true,
  updates: {
    enabled: true,
  },
});

bot.on("message", async msg => {
  try {
    const { error } = await textMiddleware(msg, bot);
  } catch (error) {
    console.error("server -> message:", error);
  }
});

bot.on("text", async msg => {
  try {
    if (msg.chat.type == "supergroup") return;
    const { selection } = await getRequest(msg.chat.id);

    if (msg.from.is_bot) throw new Error("You are bot -_-");
    if (!selection) authorizationFunction(msg, bot);
    if (selection == "question") messageFunction(msg, bot, selection, "36 soat ichida ustoz tarafidan javob keladi.");
    if (selection == "offer") messageFunction(msg, bot, selection, "Taklifingiz uchun raxmat :)");
    if (selection == "homework") await bot.sendMessage(msg.chat.id, "Only file upload!");
  } catch (error) {
    console.error("server -> text:", error.message);
  }
});

bot.on("document", async document => {
  try {
    const { selection } = await getRequest(document.chat.id);

    if (selection == "homework") {
      const opts = {
        inline_keyboard: [
          [
            { text: "Tasdiqlash ✅", callback_data: "confirmed" },
            { text: "Rad etish ❌", callback_data: "reject" },
          ],
        ],
      };

      await bot.sendDocument(document.chat.id, document.document.file_id, {
        caption: document.caption,
        reply_markup: JSON.stringify(opts)
      });
    }
  } catch (error) {
    console.error("server -> document:", error);
  }
});

bot.on("callback_query", async (callbackQuery) => {
  try {
    const user_id = callbackQuery.from.id;
    const chat_id = callbackQuery.message.chat.id;
    const message_id = callbackQuery.message.message_id;
    const message = callbackQuery.message.text;

    if (callback_query[callbackQuery.data]) {
      await updateRequestSelection(user_id, callbackQuery.data);
    }

    // buttons entered after sending the task
    if (callbackQuery.data == "confirmed") {
      if (!callbackQuery.message.from.is_bot || callbackQuery.message.from.id < 0) throw new Error("File upload is not for super group!");
      // await upload(callbackQuery.message, token, bot)
      await insertFileInfo(callbackQuery.message, bot);
    }

    if (["confirmed", "reject", "cancel", "cancel&&mute", "delete_file"].includes(callbackQuery.data)) {
      await updateRequestSelection(user_id);
    }

    if (callbackQuery.data.split("&&")[0] == "user_uploaded_files") {
      const id = callbackQuery.data.split("&&")[1];

      const { data: file_info, error } = await getFiles(user_id, { id });
      if (!file_info) return await bot.sendMessage(chat_id, "File o'chirilgan !");
      if (error) throw new Error(error.message);

      const opts = {
        inline_keyboard: [
          [
            { text: "O'chirib yuborish", callback_data: `delete_file&&${file_info.id}` },
            { text: "Bekor qilish", callback_data: "cancel&&mute" }
          ]
        ]
      };

      await bot.answerCallbackQuery(callbackQuery.id).then(() => bot.sendDocument(chat_id, file_info.file_id, {
        caption: `${file_info.file_caption || ''}\nYaratilgan vaqti:  ${dateFormat(Number(file_info.file_created_at), 'yyyy-mm-dd HH:MM:ss')}`,
        reply_markup: JSON.stringify(opts)
      }), {
        parse_mode: "HTML"
      });
    }

    if (["delete_file"].includes(callbackQuery.data.split("&&")[0])) {
      const id = callbackQuery.data.split("&&")[1];
      if (!id) return await bot.sendMessage(chat_id, "id not found!");
      const { error } = await deleteFileInfo(user_id, { id });
      if (error) throw new Error(error.message);
    }

    if (["list_next", "list_prev"].includes(callbackQuery.data)) {
      await updateRequestSelection(user_id);
      const { list_page: page } = await getRequest(user_id);
      await updatePageAndLimit(user_id, page + (callbackQuery.data == "list_next" ? 1 : -1));
      const { opts } = await listRouteOpts(user_id, chat_id);

      await bot.editMessageText(message, {
        chat_id: chat_id,
        message_id: message_id,
        reply_markup: opts,
      });
    }

    if (callback_query[callbackQuery.data?.split("&&")[0]]) {
      const inline_keyboard = [];

      await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
      if (callbackQuery.data.split("&&")[1] != "mute") {
        if (["homework", "offer", "question"].includes(callbackQuery.data)) {
          inline_keyboard.push([{ text: "Bekor qilish", callback_data: "cancel" }]);
        }

        await bot.answerCallbackQuery(callbackQuery.id).then(() => bot.sendMessage(callbackQuery.message.chat.id, callback_query[callbackQuery.data.split("&&")[0]], {
          parse_mode: "HTML",
          reply_markup: JSON.stringify({ inline_keyboard })
        }));
      }
    }

  } catch (error) {
    console.error("server.js -> callback_query:", error);
  }
});