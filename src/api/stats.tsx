import { User } from '../db/user'

interface StatsPageProps {
	users: User[]
	countUsers: number
	todayUsers: number
	yesterdayUsers: number
	growthRate: number | null
}

const indianDateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Asia/Kolkata',
})

function formatIndianDateTime(timestamp: number) {
	return indianDateTimeFormatter.format(new Date(timestamp))
}

// oxlint-disable-next-line max-lines-per-function
export default function StatsPage({
	users,
	countUsers,
	todayUsers,
	yesterdayUsers,
	growthRate,
}: StatsPageProps) {
	return (
		<html>
			<head>
				<title>🤖 Telegram Bot Dashboard</title>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.zinc.min.css"
				></link>
			</head>

			<body>
				<main className="container">
					<header>
						<h1>🤖 Telegram Bot Dashboard</h1>
						<p>Monitor your bot users and growth.</p>
					</header>

					<section
						style={{
							display: 'grid',
							gap: '1rem',
							gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
							marginBottom: '2rem',
						}}
					>
						<article>
							<h5>👥 Total Users</h5>
							<h2>{countUsers.toLocaleString()}</h2>
						</article>

						<article>
							<h5>🆕 Joined Today (IST)</h5>
							<h2>{todayUsers}</h2>
						</article>

						<article>
							<h5>📅 Joined Yesterday (IST)</h5>
							<h2>{yesterdayUsers}</h2>
						</article>

						<article>
							<h5>📈 Growth</h5>

							<h2
								style={{
									color:
										growthRate === null
											? 'inherit'
											: growthRate > 0
												? 'var(--pico-color-green-500)'
												: growthRate < 0
													? 'var(--pico-color-red-500)'
													: 'inherit',
								}}
							>
								{growthRate === null ? 'New' : `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`}
							</h2>
						</article>
					</section>

					<article>
						<header>
							<strong>👤 Recent Users ({users.length})</strong>
						</header>

						<figure>
							<table role="grid">
								<thead>
									<tr>
										<th>ID</th>
										<th>Name</th>
										<th>Username</th>
										<th>Joined (IST)</th>
									</tr>
								</thead>

								<tbody>
									{users.length === 0 ? (
										<tr>
											<td colSpan={4} style={{ textAlign: 'center' }}>
												No users found.
											</td>
										</tr>
									) : (
										users.map((user) => (
											<tr key={user.telegram_id}>
												<td>{user.telegram_id}</td>

												<td>{user.name}</td>

												<td>{user.username ? <code>@{user.username}</code> : '-'}</td>

												<td>{formatIndianDateTime(user.joined_at)}</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</figure>
					</article>
				</main>
			</body>
		</html>
	)
}
