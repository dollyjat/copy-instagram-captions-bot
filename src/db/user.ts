export interface User {
	telegram_id: number
	username: string | null
	name: string
	joined_at: number
}

const tableName = 'users_caption_bot'

export class userDatabase {
	constructor(private readonly db: D1Database) {}

	async getByTelegramId(id: number) {
		return await this.db
			.prepare(
				`
        SELECT *
        FROM ${tableName}
        WHERE telegram_id = ?
        LIMIT 1
      `,
			)
			.bind(id)
			.first<User>()
	}

	async exists(id: number) {
		const row = await this.db
			.prepare(
				`
        SELECT 1
        FROM ${tableName}
        WHERE telegram_id = ?
        LIMIT 1
      `,
			)
			.bind(id)
			.first()

		return row !== null
	}

	async create(data: User) {
		const now = Date.now()

		await this.db
			.prepare(
				`
        INSERT INTO ${tableName} (
          telegram_id,
          username,
          name,
          joined_at
        )
        VALUES (?, ?, ?, ?)
      `,
			)
			.bind(data.telegram_id, data.username ?? null, data.name, now)
			.run()
	}

	async createIfNotExists(data: User) {
		const now = Date.now()

		await this.db
			.prepare(
				`
        INSERT OR IGNORE INTO ${tableName} (
          telegram_id,
          username,
          name,
          joined_at
        )
        VALUES (?, ?, ?, ?)
      `,
			)
			.bind(data.telegram_id, data.username ?? null, data.name, now)
			.run()
	}

	async delete(id: number) {
		await this.db
			.prepare(
				`
        DELETE FROM ${tableName}
        WHERE telegram_id = ?
      `,
			)
			.bind(id)
			.run()
	}

	async count() {
		const row = await this.db
			.prepare(
				`
        SELECT COUNT(*) as total
        FROM ${tableName}
      `,
			)
			.first<{ total: number }>()

		return row?.total ?? 0
	}

	async todayCount() {
		const row = await this.db
			.prepare(
				`
        SELECT COUNT(*) as total
        FROM ${tableName}
        WHERE joined_at >= ?
        AND joined_at < ?
      `,
			)
			.bind(Date.now() - 24 * 60 * 60 * 1000, Date.now())
			.first<{ total: number }>()

		return row?.total ?? 0
	}

	async yesterdayCount() {
		const row = await this.db
			.prepare(
				`
        SELECT COUNT(*) as total
        FROM ${tableName}
        WHERE joined_at >= ?
        AND joined_at < ?
      `,
			)
			.bind(Date.now() - 48 * 60 * 60 * 1000, Date.now() - 24 * 60 * 60 * 1000)
			.first<{ total: number }>()

		return row?.total ?? 0
	}

	async all(limit = 100, offset = 0) {
		const { results } = await this.db
			.prepare(
				`
        SELECT *
        FROM ${tableName}
        ORDER BY joined_at DESC
        LIMIT ?
        OFFSET ?
      `,
			)
			.bind(limit, offset)
			.all<User>()

		return results
	}
}
