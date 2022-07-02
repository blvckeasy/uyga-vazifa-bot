import { db_fetch, db_fetchAll } from '../utils/pg.js'


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
        bot.sendMessage(chat_id, 'welcome')
      }

      const opts = {
        inline_keyboard: [
          [
            { text: 'Savol', callback_data: 'question' },
            { text: 'Taklif', callback_data: 'offer' },
            { text: 'Uyga vazifa', callback_data: 'homework' },
          ],
          [{ text: 'Bekor qilish', callback_data: 'cancel' }]
        ],
      }

      await bot.sendMessage(chat_id, `Qanday turdagi malumot yubormoxchisiz ?`, {
        reply_markup: JSON.stringify(opts),
      })
    } else {
      await bot.sendMessage(chat_id, 'Guruhlardan topilmadingiz.')
    }
  } catch (error) {
    return { error } // Client error
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
  } catch (error) { 
    return { error: error.message }  // Client error
  }
}



export {
  authorizationFunction,
  messageFunction,
}