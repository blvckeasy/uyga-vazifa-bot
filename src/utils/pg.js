import pg from 'pg'
import '../../config.js'

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL
})

async function db_fetch (query, ...params) {
	const client = await pool.connect()
	try {
		await client.query(`SET client_encoding = 'UTF8'; SET TIMEZONE='Asia/Tashkent';`)
		const { rows: [ row ] } = await client.query(query, params.length ? params : null)
		return row
	} catch(error) {
		console.error('pg -> fetch:', error)
		throw error
	} finally {
		client.release()
	}
}

async function db_fetchAll (query, ...params) {
	const client = await pool.connect()
	try {
		await client.query(`SET client_encoding = 'UTF8'; SET TIMEZONE='Asia/Tashkent';`)
		const { rows } = await client.query(query, params.length ? params : null)
		return rows
	} catch(error) {
		console.error('pg -> fetchAll:', error)
		throw error
	} finally {
		client.release()
	}
}

export {
	db_fetchAll,
	db_fetch,
}