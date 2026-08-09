// oxlint-disable typescript/ban-ts-comment
import { Bot, Context, InlineKeyboard } from 'grammy'
import { env } from 'cloudflare:workers'
import { checkLinkIsValidate } from './services/validate'
import { userDatabase } from '../db/user'
import { fetchCaptionServerOne, fetchCaptionServerTwo } from './services/api'

const channelId = env.CHANNEL_ID
const users = new userDatabase(env.shuta)

export const bot = new Bot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) })

const startHandler = async (ctx2: Context) => {
	await users.createIfNotExists({
		// @ts-expect-error
		telegram_id: ctx2.from?.id,
		// @ts-expect-error
		username: ctx2.from?.username,
		// @ts-expect-error
		name: ctx2.from?.first_name + ctx2.from?.last_name?.trim(),
	})
	return await ctx2.replyWithPhoto('https://i.ytimg.com/vi/5_hUo2PYmH8/hq720.jpg', {
		caption: `
		 *\u{1F44B} Welcome to the Instagram Caption Copy Bot \\!*

		 Send me any Instagram post link, and I\\'ll extract\\.
		 \\- \u2714\uFE0F Full caption
		 \\- \u2714\uFE0F Hashtags
		 \\- \u2714\uFE0F Clean formatting

		 _Just paste the link below \u{1F447}_
				 `,
		parse_mode: 'MarkdownV2',
	})
}

bot.command('start', startHandler)

bot.on('message', async (ctx2, next2) => {
	const userId = ctx2.from?.id
	if (!userId) return next2()
	try {
		const chatMember = await ctx2.api.getChatMember(channelId, userId)
		const allowedStatuses = ['creator', 'administrator', 'member', 'restricted']
		if (allowedStatuses.includes(chatMember.status)) {
			return next2()
		}
		const inviteUrl = await getInviteLink(ctx2)
		const keyboard = new InlineKeyboard()
			.url('📢 Join Developer Channel', inviteUrl)
			.text("✅ I've Joined", 'check_joined')

		await ctx2.reply(
			`📢 <b>Join Our Developer Community</b>

Stay connected with our development team to get:
• 🚀 Latest bot updates
• ✨ Early access to new features
• 🤖 New useful bots & tools
• 📢 Important announcements
• 💡 Tips, guides, and support

<b>🔒 Channel Join is required to use this bot.</b>

1️⃣ Tap <b>📢 Join Developer Channel</b>
2️⃣ Join the channel
3️⃣ Return here and tap <b>✅ I've Joined</b>`,
			{
				parse_mode: 'HTML',
				reply_markup: keyboard,
			},
		)
	} catch {}
})
bot.callbackQuery('check_joined', async (ctx2) => {
	const userId = ctx2.from?.id
	try {
		const member = await ctx2.api.getChatMember(channelId, userId)
		if (['creator', 'administrator', 'member', 'restricted'].includes(member.status)) {
			await ctx2.answerCallbackQuery({ text: 'Thanks \u2014 you can use the bot now!' })
			return ctx2.editMessageText(
				'✅ Thanks \u2014 you can use the bot now! \n\n<b>🔄 Re send your link</b> to get started.',
				{
					parse_mode: 'HTML',
				},
			)
		}
		await ctx2.answerCallbackQuery({
			text: 'Please join the channel first.',
			show_alert: true,
		})
	} catch {
		await ctx2.answerCallbackQuery({
			text: 'Please join the channel first.',
			show_alert: true,
		})
	}
})

async function getInviteLink(ctx2: Context) {
	if (typeof channelId === 'string' && channelId.startsWith('@')) {
		return `https://t.me/${channelId.slice(1)}`
	}
	try {
		const res = await ctx2.api.createChatInviteLink(channelId, {
			creates_join_request: false,
			// or `true` if channel uses join requests
			expire_date: void 0,
			member_limit: void 0,
		})
		return res.invite_link
	} catch {
		try {
			const exportRes = await ctx2.api.exportChatInviteLink(channelId)
			return exportRes
		} catch {
			return `https://t.me/${String(channelId)}`
		}
	}
}

bot.on('message:text', async (ctx) => {
	const message = ctx.message.text.trim()

	if (!checkLinkIsValidate(message)) {
		await ctx.reply('❌ Invalid Instagram link. Please send a valid Instagram URL.')
		return
	}

	const loadingMsg = await ctx.reply('🔍 Fetching caption from Instagram...\n\n⏳ Please wait...')

	try {
		let caption = await fetchCaptionServerOne(message)

		if (!caption) {
			await ctx.api.editMessageText(
				ctx.chat.id,
				loadingMsg.message_id,
				'🔄 Server 1 failed.\n\n⏳ Trying backup server...',
			)

			caption = await fetchCaptionServerTwo(message)
		}

		if (!caption) {
			throw new Error('Caption not found')
		}

		await ctx.api.editMessageText(ctx.chat.id, loadingMsg.message_id, caption)
	} catch {
		await ctx.api.editMessageText(
			ctx.chat.id,
			loadingMsg.message_id,
			[
				'❌ <b>Unable to fetch the caption</b>',
				'',
				'🔄 Please try again in a few moments.',
				'',
				'🛠️ If the problem continues, contact support:',
				'👤 @DevGauravJatt',
			].join('\n'),
			{ parse_mode: 'HTML' },
		)
	}
})
