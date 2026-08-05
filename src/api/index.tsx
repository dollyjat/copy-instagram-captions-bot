import { env } from 'cloudflare:workers'
import { Hono } from 'hono'
import { userDatabase } from '../db/user'
import StatsPage from './stats'

const app = new Hono()
const users = new userDatabase(env.shuta)

app.get('/', (c) => c.json(JSON.parse(env.BOT_INFO)))

app.get('/stats', async (c) => {
	const usersAll = await users.all(20)
	const countUsers = await users.count()
	const todayUsers = await users.todayCount()
	const yesterdayUsers = await users.yesterdayCount()
	return c.html(
		<StatsPage
			users={usersAll}
			countUsers={countUsers}
			todayUsers={todayUsers}
			yesterdayUsers={yesterdayUsers}
			growthRate={((todayUsers - yesterdayUsers) / yesterdayUsers) * 100}
		/>,
	)
})

app.get('/api/stats', async (c) => {
	const usersAll = await users.all(20)
	const countUsers = await users.count()
	const todayUsers = await users.todayCount()
	const yesterdayUsers = await users.yesterdayCount()
	return c.json({
		users: usersAll,
		countUsers,
		todayUsers,
		yesterdayUsers,
		growthRate: ((todayUsers - yesterdayUsers) / yesterdayUsers) * 100,
	})
})

export default app
