import { load } from 'cheerio'

function getCaption(html3: string) {
	const $2 = load(html3)
	const caption = $2('#rapidCaption').val() || ''
	return caption
}
export default getCaption
