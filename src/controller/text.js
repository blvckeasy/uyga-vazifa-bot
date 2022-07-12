import dateFormat from 'dateformat'
import { db_fetch, db_fetchAll } from '../utils/pg.js'
import { getRequest, updateRequestSelection } from "../table/request.js"
import { list_limit } from "../../config.js";

const authorizationFunction = async (msg, bot) => {
  try {
    const chat_id = msg.chat.id
    const user_id = msg.from.id
    let is_group_member = false
    
    if (user_id != chat_id) return
    
    const groups = await db_fetchAll(`SELECT * FROM groups WHERE group_deleted_at is null;`)
    const groups_id = groups.map(obj => obj.group_id)
    
    await Promise.all(
      groups_id.map(async group_id => {
        try {9
          const data = {
            [group_id]: await bot.getChatMember(group_id, user_id),
          }
          is_group_member = true
          return data
        } catch (error) {
          return {
            [group_id]: undefined,
          }
        }
      })
    )
    
    if (is_group_member) {
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
        }
        
        await bot.sendMessage(chat_id, `Qanday turdagi malumot yubormoxchisiz ?`, {
          reply_markup: JSON.stringify(opts),
        })
      }

      if (msg.text == "/list") {
        await updatePageAndLimit(user_id)
        const { error, opts, all_keyboard } = await listRouteOpts(user_id, chat_id)
        if (!all_keyboard.length) return await bot.sendMessage(chat_id, "Siz 2 kun oraligida hech qanday hech qanday vazifa yuklamagansiz.")
        if (error) throw new Error(error)

        await bot.sendMessage(chat_id, '2 kun oraliqda tashlagan uyga vazifalaringiz.', {
          reply_markup: JSON.stringify(opts)
        })
      }
    } else {
      await bot.sendMessage(chat_id, 'Guruhlardan topilmadingiz.')
    }
  } catch (error) {
    console.error('controller -> authorizationFunction:', error)
    return { error: error } 
  }
}

const messageFunction = async (msg, bot, message_type, send_message_text) => {
  try {
    await db_fetch(`
      insert into messages 
        (message_id, user_id, first_name, last_name, username, message_type, message_text)
      values ($1, $2, $3, $4, $5, $6, $7) returning *;
    `, msg.message_id, msg.from.id, msg.from.first_name, msg.from.last_name, msg.from.username, message_type, msg.text)

    await bot.sendMessage(msg.chat.id, send_message_text)
    await updateRequestSelection(msg.chat.id)
  } catch (error) { 
    return { error: error.message }  
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
    `, chat_id)

    
    const { list_page: page, list_limit: limit } = await getRequest(user_id)
    const all_keyboard = all_files.map(({file_created_at, file_orginal_name, id}) =>
      [{ text: `"${file_orginal_name}"  |  ${dateFormat(Number(file_created_at), 'yyyy-mm-dd HH:MM:ss')}`, callback_data: `user_uploaded_files&&${id}` }])
    
    const inline_keyboard = all_keyboard.slice(page * limit - limit, limit * page)
    const next_prev = []
    
    if (all_keyboard.length) {
      if (all_keyboard.slice((page + 1) * limit - limit, limit * (page + 1)).length) next_prev.push({text: "Keyingisi", callback_data: "list_next"})
      if (all_keyboard.slice((page - 1) * limit - limit, limit * (page - 1)).length) next_prev.push({text: "Olgingisi", callback_data: "list_prev"})
    }


    const opts = {
      inline_keyboard: [
        ...inline_keyboard,
        next_prev
      ],
    }
    return { opts, all_keyboard }
  } catch (error) {
    console.error('controller -> text -> listRoute:', error)
    return { error: error }
  }
}


const updatePageAndLimit = async (user_id, page = 1, limit = list_limit) => {
  try {
    if (!user_id) return {error: "User_id not Found!"}
    
    await db_fetch(`
      UPDATE requests SET 
        list_page = $2,
        list_limit = $3,
        request_updated_at = localtimestamp
      WHERE 
        user_id = $1;
    `, user_id, page, limit)

  } catch (error) {
    console.error('controllers -> updatePageAndLimit:', error)
    return { error: error.message }
  }
}



export {
  authorizationFunction,
  messageFunction,
  listRouteOpts,
  updatePageAndLimit,
}