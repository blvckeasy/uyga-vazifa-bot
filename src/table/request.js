import { db_fetch } from '../utils/pg.js'

const getRequest = async (user_id) => {
  try {
    const request = await db_fetch(`
      SELECT * FROM requests 
      WHERE 
        user_id = $1 and request_deleted_at is null;
      `, user_id)
    return request || {}
  } catch (error) {
    console.error('request -> getRequest:', error)
    return {error: error.message}
  }
}

const updateRequestSelection = async (user_id, selection = null) => {
  try {
    const updated_request = await db_fetch(`
      UPDATE requests SET 
        selection = $2, 
        request_updated_at = CURRENT_TIMESTAMP  
      WHERE user_id = $1 
      RETURNING *;
    `, user_id, selection)
    return updated_request || {}
  } catch (error) {
    console.error('request -> updateRequestSelection:', error);
    return { error: error.message }
  }
}

export {
  getRequest,
  updateRequestSelection,
}