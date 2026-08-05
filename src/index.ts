import { Hono } from 'hono'
import { webhookCallback } from 'grammy'
import { bot } from './bot/index'
import api from './api'

const app = new Hono()

app.route('/', api)

app.post('/webhook', (c) => {
	return webhookCallback(bot, 'cloudflare-mod')(c.req.raw)
})

export default app
