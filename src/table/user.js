import { db_fetch, db_fetchAll } from "../utils/pg.js";

const getUser = async (user_id, { role } = {}) => {
  try {
    const data = await db_fetch(`
      select * from users 
      where
        user_id = $1 and
        case 
          when length($2) > 0 then role = $2
          else true
        end and user_deleted_at is null;
    `, user_id, role);

    return { data };
  } catch (error) {
    console.error('table -> user.js -> getUser:', error.message);
    return { error };
  }
};

const updateUser = async (user_id, { group_id } = {}) => {
  try {
    const data = await db_fetch(`
      update users set
      group_id = case
        when $1::bigint > 0 then $1::bigint
        else group_id
      end
      where user_deleted_at is null
      returning *;
    `, group_id);

    return { data };
  } catch (error) {
    console.error('table -> user.js -> updateUser:', error.message);
    return { error };
  }
};

export {
  getUser,
  updateUser,
};