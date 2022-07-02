import { db_fetch } from '../utils/pg.js'

const getRequest = async (user_id) => {
  try {
    const request = await db_fetch(`SELECT * FROM requests WHERE user_id = $1 and request_deleted_at is null;`, user_id);
    return request
  } catch (error) {
    console.error('request -> getRequest:', error)
    return {error: error.message}
  }
}

const updateRequest = async (user_id, { selection, question, offer, homework, confirmed, reject }) => {
  try {

    console.log('kelgan-malumot:', { selection, question, offer, homework, confirmed, reject })

    const updated_request = await db_fetch(`
      UPDATE requests SET 
        selection = $2, 
        question = CASE WHEN $3 is not NULL THEN $3 ELSE question END,
        offer = CASE WHEN $4 is not NULL THEN $4 ELSE offer END, 
        homework = CASE WHEN $5 is not NULL THEN $5 ELSE homework END, 
        confirmed = CASE WHEN $6 is not NULL THEN $6 ELSE confirmed END,
        reject = CASE WHEN $7 is not NULL THEN $7 ELSE reject END,
        request_updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $1 RETURNING *`, user_id, selection, question, offer, homework, confirmed, reject
    )

    console.log('\n\nchidiiii\n\n')
    console.log(updated_request)
    
  } catch (error) {
    console.error('request -> udpateRequest:', error);
    return { error: error.message }
  }
}

export {
  getRequest,
  updateRequest,
}