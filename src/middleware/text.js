import { db_fetch } from '../utils/pg.js';
import { getAllGroups } from '../table/group.js';
import { updateUser } from '../table/user.js';

const textMiddleware = async (msg, bot) => {
  try {
    const group_id = msg.chat.id;
    const user_id = msg.from.id;

    if (msg.chat.type != 'supergroup') {

      if (group_id == user_id) {
        // inserts user when the user is not found in the database
        const found_user = await db_fetch(`SELECT * FROM users WHERE user_id = $1 and user_deleted_at is null;`, user_id);
        if (!found_user) {
          const { data: user_follow_group } = await getAllGroups(user_id, bot);
          // console.log('middlewaredan: ', user_follow_group);
          if (!user_follow_group.length) return {};

          await db_fetch(
            `INSERT INTO users (user_id, chat_id, group_id, first_name, last_name, username) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
            user_id, group_id, user_follow_group[0].group_id, msg.from.first_name, msg.from.last_name, msg.from.username
          );
          console['log']('inser qilindi.');
        } else {
          const { data: [group] } = await getAllGroups(user_id, bot);
          // console.log('mawumasmikn:', [group]);
          await updateUser(user_id, { group_id: group.group_id });
        }

        // inserts request when the user is not found in the database
        const found_request = await db_fetch(`SELECT * FROM requests WHERE user_id = $1;`, group_id);
        if (!found_request) {
          await db_fetch("INSERT INTO requests (user_id) values ($1) RETURNING *;", user_id);
        }
        return { status: 200, message: "Data were inserted successfully." };
      }
      return { status: 200 };
    }

    // inserts groups when the group is not found in the database
    const found_group = await db_fetch(`SELECT * FROM groups WHERE group_id = $1;`, group_id);
    if (group_id && !found_group) {
      await db_fetch(`INSERT INTO groups (group_id, group_title, group_link, chat_type) VALUES ($1, $2, $3, $4) RETURNING *;`,
        group_id, msg.chat.title, msg.chat.username || null, msg.chat.type);
    }
    return { status: 200 };
  } catch (error) {
    console.error('middleware/text -> textMiddleware:', error.message);
    return { error: error.message };
  }
};

export {
  textMiddleware
};