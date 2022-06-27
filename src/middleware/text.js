import { db_fetch } from '../utils/pg.js'

const textMiddleware = async (msg) => {
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
    console.log('middleware/text -> textMiddleware', error.message)
    return { error: error.message } // Client error
  }
}

export {
  textMiddleware
}