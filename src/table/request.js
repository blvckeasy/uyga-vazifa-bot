import { db_fetch } from '../utils/pg.js'

const getRequests = async (user_id) => {
  try {
    const requests = await db_fetch("SELECT * FROM requests WHERE user_id = $1 and request_deleted_at is null;", user_id);
    return requests
  } catch (error) {
    console.error('functions -> getRequest:', error.message)
    return {error: error.message}
  }
}

export {
  getRequests,
}