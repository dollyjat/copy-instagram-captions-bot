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

bot.on('message', async (ctx2) => {
	const message = ctx2.message.text
	if (message) {
		const isLink = checkLinkIsValidate(message)
		if (isLink) {
			const loadingMsg = await ctx2.reply('\u{1F50D} Fetching caption from Instagram...')
			try {
				let captionText: string | null
				captionText = await fetchCaptionServerOne(message)
				if (!captionText) {
					await ctx2.api.editMessageText(
						ctx2.chat.id,
						loadingMsg.message_id,
						'\u{1F4BB} Re trying with server 2 ......',
					)
				}

				captionText = await fetchCaptionServerTwo(message)
				if (!captionText) {
					throw new Error('Failed to fetch caption. Please try again later.')
				}

				await ctx2.api.editMessageText(ctx2.chat.id, loadingMsg.message_id, `\`\`\`\n ${captionText}\`\`\``, {
					parse_mode: 'MarkdownV2',
				})
			} catch {
				await ctx2.api.editMessageText(
					ctx2.chat.id,
					loadingMsg.message_id,
					'\u274C Failed to fetch caption. Please try again later.',
				)
			}
		} else {
			return ctx2.reply('Invalid Instagram link')
		}
	}
})
