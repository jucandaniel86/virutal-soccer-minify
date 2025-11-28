const consoleVersionStyle =
	'color: #fff; background: #902ec2; font-weight: bolder; font-size: 1.2em; padding: 3px 6px; border-radius: 5px;text-shadow: 1px 1px 0 #000, 1px 1px 0 #000;';
const consoleStateStyle =
	'color: #fff; background:rebeccapurple; font-weight: bolder; font-size: 1.15em; padding: 3px 6px; border-radius: 5px;margin-top:10px';

console.log('%cTURBO FOOTBALL GAME HISTORY v1.0', consoleVersionStyle);

const EXTENSION = 'png';
const MAX_ROWS = 4;
const MAX_REELS = 5;

let BASE_PATH = '';

class HistoryManager {
	constructor(basePath) {
		this.BASE_PATH = basePath;
	}

	getGameTitle(title) {
		return `
		<div class="bets-header">
			<h1>TURBO FOOTBALL GAME HISTORY</h1>
		</div>
		`;
	}

	getTokenSrc(id) {
		return `${this.BASE_PATH}img/${id}.${EXTENSION}`;
	}

	findMatch(dataList, matchId) {
		for (let i = 0; i < dataList.length; i++) {
			const publicView = dataList[i].PublicView || {};
			const previousRound = publicView.previousRound;
			const currentRound = publicView.currentRound;

			if (previousRound?.matches) {
				const match = previousRound.matches.find((m) => m.id === matchId);
				if (match) {
					return {
						match: match,
						roundNumber: previousRound.name.match(/\d+/)?.[0] || null,
						roundName: previousRound.name,
					};
				}
			}

			if (currentRound?.matches) {
				const match = currentRound.matches.find((m) => m.id === matchId);
				if (match) {
					return {
						match: match,
						roundNumber: currentRound.name.match(/\d+/)?.[0] || null,
						roundName: currentRound.name,
					};
				}
			}
		}

		return null;
	}

	getBetHTML(bet) {
		const selection = bet.betOutcome === 'T1' ? bet.match.t1 : bet.betOutcome === 'T2' ? bet.match.t2 : 'Draw';
		const odds = bet.match.odds;
		const oddsIndex = bet.betOutcome === 'T1' ? 0 : bet.betOutcome === 'T2' ? 2 : 1;
		const selectedOdds = odds ? odds[oddsIndex] : null;

		let outcome = -1;
		let win = 0;
		if (bet.match.sc && bet.match.ot) {
			if (bet.match.ot === bet.betOutcome) {
				outcome = 1;
				win = bet.stake * selectedOdds;
			}
		} else {
			outcome = 0;
		}

		const status = bet.match.sc ? 'Settled' : 'Pending';
		const desc = bet.matchOutcomes.length === 1 ? 'Single X1' : `Multi ${bet.matchOutcomes.length}`;

		return `
		<div class="bet-history-item">
			<div class="bet-header">
				<div class="bet-field"><span class="bet-label">Id:</span> <strong class="bet-value">${bet.matchId}</strong></div>
				<div class="bet-field"><span class="bet-label">Status:</span> <strong class="bet-value">${status}</strong></div>
				<div class="bet-field"><span class="bet-label">Desc:</span> <strong class="bet-value">${desc}</strong></div>
				<div class="bet-field"><span class="bet-label">Round:</span> <strong class="bet-value">${
					bet.roundNumber || '-'
				}</strong></div>
				<div class="bet-field"><span class="bet-label">Stake:</span> <strong class="bet-value">${bet.stake.toFixed(
					2,
				)}</strong></div>
				<div class="bet-field"><span class="bet-label">Win:</span> <strong class="bet-value">${win.toFixed(2)}</strong></div>
				<div class="bet-field"><span class="bet-label">BB:</span> <strong class="bet-value">${
					bet.betBoost > 1 ? 'Yes' : 'No'
				}</strong></div>
			</div>
			<table class="bet-match-table">
				<thead>
					<tr>
						<th>Match</th>
						<th>Selection</th>
						<th>Odds</th>
						<th>Outcome</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>${bet.match.t1}:${bet.match.t2}</td>
						<td>${selection}</td>
						<td>${selectedOdds}</td>
						<td>${outcome}</td>
					</tr>
				</tbody>
			</table>
		</div>
		`;
	}

	getBetsHistoryHTML(dataList) {
		const lastState = dataList[dataList.length - 1];
		const playerView = lastState.PlayerView || {};
		const roundBets = playerView.roundBets || [];
		let html = '';

		console.log('%cLast State:', consoleStateStyle, lastState);
		console.log('%cPlayerView:', consoleStateStyle, playerView);
		console.log('%cRound Bets:', consoleStateStyle, roundBets);

		roundBets.forEach((bet) => {
			bet.matchOutcomes.forEach((matchOutcome) => {
				const matchData = this.findMatch(dataList, matchOutcome.matchId);
				if (matchData) {
					html += this.getBetHTML({
						matchId: matchOutcome.matchId,
						stake: bet.stake,
						betBoost: bet.betBoost || 1,
						betOutcome: matchOutcome.outcome,
						match: matchData.match,
						roundNumber: matchData.roundNumber,
						matchOutcomes: bet.matchOutcomes,
					});
				}
			});
		});

		return html;
	}
}

function getDataList(stringJson) {
	return JSON.parse(stringJson);
}

function getGameHistoryHTML(stringJsonData, basePath) {
	const dataList = getDataList(stringJsonData);
	const manager = new HistoryManager(basePath);
	let stringOutput = '';

	stringOutput += manager.getGameTitle('Turbo Football');
	stringOutput += manager.getBetsHistoryHTML(dataList);

	return stringOutput;
}

