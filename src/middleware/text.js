import { db_fetch } from '../utils/pg.js'

const textMiddleware = async (msg) => {
  try {
    const group_id = msg.chat.id

    if (msg.chat.type != 'supergroup') {

      if (msg.chat.id == msg.from.id) {
        // inserts user when the user is not found in the database
        const found_user = await db_fetch(`SELECT * FROM users WHERE user_id = $1 and user_deleted_at is null;`, msg.from.id)
        if (!found_user) {
          await db_fetch( 
            `INSERT INTO users (user_id, chat_id, first_name, last_name, username) VALUES ($1, $2, $3, $4, $5) RETURNING *;`, 
            msg.from.id, msg.chat.id, msg.from.first_name, msg.from.last_name, msg.from.username
          )
        }

        // inserts request when the user is not found in the database
        const found_request = await db_fetch(`SELECT * FROM requests WHERE user_id = $1;`, msg.chat.id)
        if (!found_request) {
          await db_fetch("INSERT INTO requests (user_id) values ($1) RETURNING *;", msg.from.id)
        }
        return { status: 200, message: "Data were inserted successfully." }
      }
      return { status: 200} 
    }

    // inserts groups when the group is not found in the database
    const found_group = await db_fetch(`SELECT * FROM groups WHERE group_id = $1;`, group_id)
    if (group_id && !found_group) {
      await db_fetch( `INSERT INTO groups (group_id, group_title, group_link, chat_type) VALUES ($1, $2, $3, $4) RETURNING *;`, 
        msg.chat.id, msg.chat.title, msg.chat.username || null, msg.chat.type )
    }
    return { status: 200 }
  } catch (error) {
    console.error('middleware/text -> textMiddleware:', error.message)
    return { error: error.message } 
  }
}

export {
  textMiddleware
}