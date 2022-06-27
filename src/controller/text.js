import { db_fetch, db_fetchAll } from '../utils/pg.js'


const authorizationFunction = async (msg, bot) => {
  try {
    const chat_id = msg.chat.id
    const user_id = msg.from.id
    let is_group_member = false
    
    if (user_id != chat_id) return
    
    const groups = await db_fetchAll(
      `SELECT * FROM groups WHERE group_deleted_at is null;`
      )
    const groups_id = groups.map(obj => obj.group_id)
    
    const groups_member = await Promise.all(
      groups_id.map(async group_id => {
        try {
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

      const found_user = await db_fetch(
        `SELECT * FROM users WHERE user_id = $1 and user_deleted_at is null;
      `,
        user_id
      )

      if (!found_user) {
        const user = await db_fetch(
          `
          INSERT INTO users (user_id, chat_id, first_name, last_name, username)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `,
          user_id,
          chat_id,
          msg.from.first_name,
          msg.from.last_name,
          msg.from.username
        )
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

      bot.sendMessage(chat_id, `qanday turdagi malumot yubormoxchisiz ?`, {
        reply_markup: JSON.stringify(opts),
      })
    } else {
      bot.sendMessage(chat_id, 'Guruhlardan topilmadingiz.')
    }
  } catch (error) {
    return { error } // Client error
  }
}

const messageFunction = async (msg, bot, message_type, send_message_text) => {
  try {
    const message = await db_fetch(`
      insert into messages 
        (message_id, user_id, first_name, last_name, username, message_type, message_text) 
      values ($1, $2, $3, $4, $5, $6, $7) returning *;
    `, msg.message_id, msg.from.id, msg.from.first_name, msg.from.last_name, msg.from.username, message_type, msg.text)

    bot.sendMessage(msg.chat.id, send_message_text)
  } catch (error) { 
    return { error: error.message }  // Client error
  }
}



export {
  authorizationFunction,
  messageFunction,
}