async function fetchCaption({ token, url }: { token: string; url: string }) {
	const options = {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			token,
			url,
		}),
	}
	const res = await fetch('https://instaspeeder.com/app/instagram/getCaptionRapid.php', options)
	if (!res.ok) {
		throw new Error('Failed to fetch caption')
	}
	return await res.text()
}
export default fetchCaption
