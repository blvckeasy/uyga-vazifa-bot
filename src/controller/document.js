import { download } from '../utils/functions.js'
import fetch from 'node-fetch'
import path from 'path'
import { db_fetch } from '../utils/pg.js'

const upload = async (document, token, callback = () => console.log('Done!')) => {
  try {
    const fileId = document.document.file_id
    const file_name = `${Date.now() % 100000}${document.document.file_name.replace(/\s/g, '_')}`
    const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`)
    const file_path = (await res.json()).result.file_path
    const downloadURL = `https://api.telegram.org/file/bot${token}/${file_path}`

    download(downloadURL, path.join(process.cwd(), 'uploads', file_name), callback)
    return [file_name, file_path]
  } catch (error) {
    console.log(123, error)
  }
}

const sendHomework = async (document, [file_name, file_path]) => {
  try {
    const data = await db_fetch(`
      INSERT INTO files (user_id, file_id, file_orginal_name, file_name, file_path, mimetype, file_send_time, file_size, file_caption)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `, document.chat.id, document.document.file_id, document.document.file_name, file_name, file_path, document.document.mime_type, document.date, document.document.file_size, document.caption)
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
}

export {
  upload,
  sendHomework,
}