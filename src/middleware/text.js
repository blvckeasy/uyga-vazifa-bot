import { db_fetch, db_fetchAll } from '../utils/pg.js'

const textMiddleware = async (msg, bot) => {
  try {
    const group_id = msg.chat.id

    if (msg.from.type != 'supergroup') return
    if (group_id) {
      await db_fetch(
        `
        INSERT INTO groups (group_id, group_title, group_link, chat_type)
          VALUES ($1, $2, $3, $4) returning *;  
      `,
        msg.chat.id,
        msg.chat.title,
        msg.chat.username || null,
        msg.chat.type
      )
    }
  } catch (error) {
    return error.message
  }
}

export {
  textMiddleware
}