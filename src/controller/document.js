import { db_fetch } from '../utils/pg.js'

const insertFileInfo = async (document, bot) => {
  try {
    const file_id = document.document.file_id
    const { file_path } = await bot.getFile(file_id)

    const data = await db_fetch(`
      INSERT INTO files (user_id, file_id, file_orginal_name, file_path, mimetype, file_size, file_caption)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `, document.chat.id, file_id, document.document.file_name, file_path, document.document.mime_type, document.document.file_size, document.caption)
 
    return { data }
  } catch (error) {
    console.error('document -> sendhomework:', error.message)
    return { error: error.message } 
  }
}

export {
  insertFileInfo,
}