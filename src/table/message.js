import { db_fetch, db_fetchAll } from "../utils/pg.js";

const getMessages = async (message_id) => {
  try {
    const data = await db_fetchAll(`
      select * from messages 
        where
          case 
            when $1::bigint > 0 then message_id = $1
            else true
          end and message_deleted_at is null;
    `, message_id);

    return { data: message_id ? data[0] : data }
  } catch (error) {
    console.error(error);
    return { error }
  }
}


const updateMessage = async (message_id ,{ assistant_id, assistant_reply_message }) => {
  try {
    const data = await db_fetch(`
      update messages set 
        assistant_id = $2, assistant_reply_message = $3
      where 
        message_id = $1 and message_deleted_at is null
      returning *;
    `, message_id, assistant_id, assistant_reply_message)

    return { data }
  } catch (error) {
    console.error(error);
    return { error }
  }
}

export {
  getMessages,
  updateMessage,
}