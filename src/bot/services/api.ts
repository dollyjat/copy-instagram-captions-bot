import { env } from 'cloudflare:workers'
import getCaption from './dom'

export async function fetchCaptionServerOne(url: string): Promise<string | null> {
	const apiToken = env.API_TOKEN

	const options = {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			token: apiToken,
			url,
		}),
	}
	const res = await fetch('https://instaspeeder.com/app/instagram/getCaptionRapid.php', options)
	if (!res.ok) {
		return null
	}
	const getcaption = await res.text()
	const caption = getCaption(getcaption)
	const captionText = Array.isArray(caption) ? caption.join('\n') : caption.toString()
	return captionText
}

export async function fetchCaptionServerTwo(url: string): Promise<string | null> {
	const formData = new FormData()

	formData.append('url', url)

	formData.append('ajax', '1')

	const response = await fetch('https://followmeter.app/copy-caption', {
		method: 'POST',
		body: formData,
	})

	if (!response.ok) {
		return null
	}

	const data = (await response.json()) as { caption: string }
	if (!data.caption) {
		return null
	}

	return data.caption
}
