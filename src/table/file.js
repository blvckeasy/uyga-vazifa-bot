import { db_fetch, db_fetchAll } from "../utils/pg.js"

const getFiles = async (user_id, { id }) => {
  try {
    if (!user_id) throw new Error("user_id not defined!")

    const data = await db_fetch(`
      SELECT * FROM files 
        WHERE
        user_id = $1 and
        CASE 
          WHEN $2 > 0 THEN id = $2
          ELSE TRUE
        END and file_deleted_at is null;
    `, user_id, id)

    return { data }
  } catch (error) {
    console.error(error)
    return { error: error.message }
  } 
}

const deleteFileInfo = async (user_id, { id, file_id }) => {
  try {
    const data = await db_fetch(`
      UPDATE files SET file_deleted_at = localtimestamp 
      where 
        user_id = $1 and
        case
          when $2 > 0 then id = $2
          else true
        end and
        case
          when length($3) > 0 then file_id = $3
          else true
        end and file_deleted_at is null
      returning *;
    `, user_id, id, file_id)
    
    return { data }
  } catch (error) {
    console.error('table -> files.js -> deleteFilesInfo:', error.message)
    return { error }
  }
}

export {
  getFiles,
  deleteFileInfo,
}



