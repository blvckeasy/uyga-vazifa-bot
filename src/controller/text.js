import dateFormat from 'dateformat';
import { db_fetch, db_fetchAll } from '../utils/pg.js';
import { getRequest, updateRequestSelection } from "../table/request.js";
import { list_limit } from "../../config.js";
import { getUser } from '../table/user.js';
import { getAllGroups, getGroup } from "../table/group.js";
import { updateMessage } from '../table/message.js'


const authorizationFunction = async (msg, bot) => {
  try {
    const chat_id = msg.chat.id;
    const user_id = msg.from.id;

    if (user_id != chat_id) return;
    const { data: user_follow_groups } = await getAllGroups(user_id, bot);

    if (user_follow_groups?.length) {
      const { data: { role }, error } = await getUser(user_id);
      if (error) return; // server error
      
      if (["student"].includes(role)) {
        if (msg.text == '/start') {
          const opts = {
            inline_keyboard: [
              [
                { text: 'Savol ❓', callback_data: 'question' },
                { text: 'Taklif ➕', callback_data: 'offer' },
                { text: 'Uyga vazifa 🏘', callback_data: 'homework' },
              ],
              [{ text: 'Bekor qilish ❌', callback_data: 'cancel' }]
            ],
          };
    
          await bot.sendMessage(chat_id, `Qanday turdagi malumot yubormoxchisiz ?`, {
            reply_markup: JSON.stringify(opts),
          });
        }

        if (msg.text == "/list") {
          await updatePageAndLimit(user_id);
          const { error, opts, all_keyboard } = await listRouteOpts(user_id, chat_id);
          if (!all_keyboard.length) return await bot.sendMessage(chat_id, "Siz 2 kun oraligida hech qanday hech qanday vazifa yuklamagansiz.");
          if (error) throw new Error(error);
    
          await bot.sendMessage(chat_id, '2 kun oraliqda tashlagan uyga vazifalaringiz.', {
            reply_markup: JSON.stringify(opts)
          });
        }
      }    
    } else {
      await bot.sendMessage(chat_id, 'Guruhlardan topilmadingiz.');
    }
  } catch (error) {
    console.error('controller -> authorizationFunction:', error);
    return { error: error };
  }
};

const messageFunction = async (msg, bot, message_type, send_message_text) => {
  try {
    const user_id = msg.from.id;
    const chat_id = msg.chat.id;

    await db_fetch(`
      insert into messages 
        (message_id, user_id, message_type, message_text)
      values ($1, $2, $3, $4) returning *;
    `, msg.message_id, msg.from.id, message_type, msg.text);

    // user jonatgan malumotni ozining assistentini group_id si bo'yicha qidirib jonatadi
    const user = await db_fetch(`
      select * from users where 
        user_id = $1 and role = 'student' and user_deleted_at is null;
    `, user_id);

    const assistant = await db_fetch(`
      select * from users where 
        group_id = $1 and role = 'admin' and user_deleted_at is null;
    `, user.group_id);

    const { data: group_info } = await getGroup(user.group_id);

    const message = `
      #${message_type}: "${msg.text}"

  User:
      id: "${user.user_id}"
      firstname: "${user.first_name}"
      lastname: "${user.last_name || ""}"
      username: "${user.username || ""}"
  Group:
      id: "${group_info.group_id}"
      title: "${group_info.group_title}"
      link: "${group_info.group_link || ""}"
      `;

    const opts = {
      inline_keyboard: [
        [
          { text: 'Javob berish', callback_data: `answer_the_request&&${msg.message_id}` },
          { text: 'Bekor qilish', callback_data: 'cancel' }
        ],
      ],
    };

    await bot.sendMessage(assistant.chat_id, message, {
      reply_markup: JSON.stringify(opts)
    });
    await bot.sendMessage(chat_id, send_message_text);
    await updateRequestSelection(chat_id);
  } catch (error) {
    console.error('controllers -> text -> messageFunction:', error)
    return { error: error.message };
  }
};


const adminMessageFunction = async (msg, bot, message_id, send_message_text) => {
  try {
    
    const assistant_id = msg.from.id;
    const assistant_reply_message = msg.text;
    const { data: updated_message } = await updateMessage(message_id, { assistant_id, assistant_reply_message })
    const { data: assistant } = await getUser(assistant_id) 
    const text = `
      #${updated_message.message_type}: "${updated_message.message_text}"\n#Javob: "${assistant_reply_message}"\n\nassistant: ${assistant.first_name} ${assistant.last_name || ""}
    `

    await bot.sendMessage(assistant_id, send_message_text)
    await bot.sendMessage(updated_message.user_id, text);
  } catch (error) {
    console.error('controllers -> text -> adminMessageFunction:', error)
    return { error }
  }
}


const listRouteOpts = async (user_id, chat_id) => {
  try {
    const all_files = await db_fetchAll(`
      SELECT * from files WHERE
        user_id = $1 AND 
        file_deleted_at is null AND 
        file_created_at > (current_timestamp - interval '2 day') AND
        is_confirmed = false and file_deleted_at is null;
    `, chat_id);


    const { list_page: page, list_limit: limit } = await getRequest(user_id);
    const all_keyboard = all_files.map(({ file_created_at, file_orginal_name, id }) =>
      [{ text: `"${file_orginal_name}"  |  ${dateFormat(Number(file_created_at), 'yyyy-mm-dd HH:MM:ss')}`, callback_data: `user_uploaded_files&&${id}` }]);

    const inline_keyboard = all_keyboard.slice(page * limit - limit, limit * page);
    const next_prev = [];

    if (all_keyboard.length) {
      if (all_keyboard.slice((page + 1) * limit - limit, limit * (page + 1)).length) next_prev.push({ text: "Keyingisi", callback_data: "list_next" });
      if (all_keyboard.slice((page - 1) * limit - limit, limit * (page - 1)).length) next_prev.push({ text: "Olgingisi", callback_data: "list_prev" });
    }


    const opts = {
      inline_keyboard: [
        ...inline_keyboard,
        next_prev
      ],
    };
    return { opts, all_keyboard };
  } catch (error) {
    console.error('controller -> text -> listRoute:', error);
    return { error: error };
  }
};


const updatePageAndLimit = async (user_id, page = 1, limit = list_limit) => {
  try {
    if (!user_id) return { error: "User_id not Found!" };

    await db_fetch(`
      UPDATE requests SET 
        list_page = $2,
        list_limit = $3,
        request_updated_at = localtimestamp
      WHERE 
        user_id = $1;
    `, user_id, page, limit);

  } catch (error) {
    console.error('controllers -> updatePageAndLimit:', error);
    return { error: error.message };
  }
};



export {
  authorizationFunction,
  messageFunction,
  listRouteOpts,
  updatePageAndLimit,
  adminMessageFunction,
};