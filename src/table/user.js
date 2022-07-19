import { db_fetch, db_fetchAll } from "../utils/pg.js"

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
    `, user_id, role)

    return { data }
  } catch (error) {
    console.error('table -> user.js -> getUser:', error.message)
    return { error }
  }
}

const getRoleAdmin = async () => {
  try {
    const data = await db_fetch(`
      select * from users
      where
        
    `)
  } catch (error) {
    console.error('table -> user.js -> getRoleAdmin:', error.message)
    return { error }
  }
}

export {
  getUser,
}