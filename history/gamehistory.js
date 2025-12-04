const consoleVersionStyle =
	'color: #fff; background: #e10a0a ; font-weight: bolder; font-size: 1.2em; padding: 3px 6px; border-radius: 5px;text-shadow: 1px 1px 0 #000, 1px 1px 0 #000;';
const consoleStateStyle =
	'color: #fff; background:teal; font-weight: bolder; font-size: 1.15em; padding: 3px 6px; border-radius: 5px;margin-top:10px;text-shadow: 1px 1px 0 #000, 1px 1px 0 #000;';
const playerViewStyle =
	'color: #fff; background:gold; font-weight: bolder; font-size: 1.15em; padding: 3px 6px; border-radius: 5px;margin-top:10px;text-shadow: 1px 1px 0 #000, 1px 1px 0 #000;';
const publicViewStyle =
	'color: #fff; background:rebeccapurple; font-weight: bolder; font-size: 1.15em; padding: 3px 6px; border-radius: 5px;margin-top:10px;text-shadow: 1px 1px 0 #000, 1px 1px 0 #000;';

//game history version
let version = '1.4';

console.log(`%cTURBO FOOTBALL GAME HISTORY v${version}`, consoleVersionStyle);

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
			<h1>TURBO FOOTBALL GAME HISTORY <span class="title-label">v${version}</span></h1>
		</div>
		`;
	}

	getTokenSrc(id) {
		return `${this.BASE_PATH}img/${id}.${EXTENSION}`;
	}

	findMatch(dataList, matchId) {
		for (let i = dataList.length - 1; i >= 0; i--) {
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

	getBetHTML(bet, tournamentNo, matchRowsHTML) {
		const betType = bet.matchOutcomes.length === 1 ? 'Single X1' : `Multi ${bet.matchOutcomes.length}`;

		// calcul betBoost:  (betBoost - 1) * 100
		const betBoostValue = bet.betBoost;
		const betBoostPercent = (betBoostValue - 1) * 100;
		const betBoostDisplay = betBoostPercent === 0 ? '0' : betBoostPercent.toFixed(0) + '%';

		const status = bet.allMatchesSettled ? 'Settled' : 'Pending';

		// win din bet exsita
		const win = bet.win !== undefined ? bet.win : 0;

		return `
		<div class="bet-history-item">
			<div class="bet-header">
				<div class="bet-field"><span class="bet-label">Tournament ID:</span> <strong class="bet-value">${
					tournamentNo || '-'
				}</strong></div>
				<div class="bet-field"><span class="bet-label">bet ID:</span> <strong class="bet-value">${bet.id}</strong></div>
				<div class="bet-field"><span class="bet-label">Round:</span> <strong class="bet-value">${
					bet.roundNumber || '-'
				}</strong></div>
				<div class="bet-field"><span class="bet-label">Status:</span> <strong class="bet-value">${status}</strong></div>
				<div class="bet-field"><span class="bet-label">BetType:</span> <strong class="bet-value">${betType}</strong></div>
				<div class="bet-field"><span class="bet-label">Stake:</span> <strong class="bet-value">${bet.stake.toFixed(
					2,
				)}</strong></div>
				<div class="bet-field"><span class="bet-label">Win:</span> <strong class="bet-value">${win.toFixed(2)}</strong></div>
				<div class="bet-field"><span class="bet-label">BetBoost:</span> <strong class="bet-value">${betBoostDisplay}</strong></div>
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
					${matchRowsHTML}
				</tbody>
			</table>
		</div>
		`;
	}

	//pentru turneu
	getOutrightBetHTML(outrightBet, tournamentEnded, winnerTeam, tournamentNo) {
		// win-ul trebuie luat direct din outright
		let win = outrightBet.win !== undefined ? outrightBet.win : 0;
		let isWon = false;
		let outcome = 'Pending';

		if (tournamentEnded) {
			isWon = winnerTeam === outrightBet.team;
			outcome = isWon ? 1 : 0;
			// dac win nu este definit în JSON, calclam doar daca echipa a castigat
			if (outrightBet.win === undefined) {
				if (isWon) {
					win = outrightBet.stake * outrightBet.odds;
				} else {
					win = 0;
				}
			}
		}

		const status = tournamentEnded ? (isWon ? 'Won' : 'Lost') : 'Pending';

		return `
		<div class="bet-history-item">
			<div class="bet-header">
				<div class="bet-field"><span class="bet-label">Type:</span> <strong class="bet-value">Outright</strong></div>
				<div class="bet-field"><span class="bet-label">Status:</span> <strong class="bet-value">${status}</strong></div>
				<div class="bet-field"><span class="bet-label">Team:</span> <strong class="bet-value">${outrightBet.team}</strong></div>
				<div class="bet-field"><span class="bet-label">Stake:</span> <strong class="bet-value">${outrightBet.stake.toFixed(
					2,
				)}</strong></div>
				<div class="bet-field"><span class="bet-label">Odds:</span> <strong class="bet-value">${outrightBet.odds}</strong></div>
				<div class="bet-field"><span class="bet-label">Win:</span> <strong class="bet-value">${win.toFixed(2)}</strong></div>
			</div>
			<div class="bet-header">
				<div class="bet-field"><span class="bet-label">Tournament ID:</span> <strong class="bet-value">${
					tournamentNo || '-'
				}</strong></div>
			</div>
			<table class="bet-match-table">
				<thead>
					<tr>
						<th>Bet Type</th>
						<th>Team</th>
						<th>Odds</th>
						<th>Outcome</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Tournament Winner</td>
						<td>${outrightBet.team}</td>
						<td>${outrightBet.odds}</td>
						<td>${outcome}</td>
					</tr>
				</tbody>
			</table>
		</div>
		`;
	}

	getBetsHistoryHTML(dataList) {
		// doar state-urile cu UpdateType === "TIMER"
		const timerStates = dataList.filter((state) => state.UpdateType === 'TIMER');

		if (timerStates.length === 0) {
			return '<div>No final states found...</div>';
		}

		const lastTimerState = timerStates[timerStates.length - 1];
		const publicView = lastTimerState.PublicView || {};

		//COLLECt toate beturile si win urile
		const allRoundBets = new Map();
		const allOutrightBets = [];

		// toate timer states
		for (let i = timerStates.length - 1; i >= 0; i--) {
			const state = timerStates[i];
			const playerView = state.PlayerView || {};
			const publicView = state.PublicView || {};
			const roundBets = playerView.roundBets || [];
			const outrightBets = playerView.outrightBets || [];

			console.log(`%cTIMER State: ${i}`, consoleStateStyle);
			console.log('%cPlayerView:', playerViewStyle, playerView);
			console.log('%cPublicView:', publicViewStyle, publicView);

			roundBets.forEach((bet) => {
				const betId = bet.id;
				if (!allRoundBets.has(betId)) {
					allRoundBets.set(betId, JSON.parse(JSON.stringify(bet)));
				} else {
					const existingBet = allRoundBets.get(betId);
					if (bet.win !== undefined && bet.win !== null) {
						existingBet.win = bet.win;
					}
				}
			});

			// outright bets (turneu)
			outrightBets.forEach((outrightBet) => {
				const existing = allOutrightBets.find((b) => b.id === outrightBet.id);
				if (!existing) {
					allOutrightBets.push({ ...outrightBet });
				} else {
					if (outrightBet.win !== undefined && outrightBet.win !== null) {
						existing.win = outrightBet.win;
					}
				}
			});
		}

		const roundBets = Array.from(allRoundBets.values());
		const outrightBets = allOutrightBets;

		//turneu
		const tournament = publicView.tournament || {};
		const tournamentEnded = tournament.isEnded || false;
		const tournamentNo = tournament.tournamentNo || null;

		let winnerTeam = null;
		if (tournamentEnded) {
			//winner din turneu
			if (tournament.winner) {
				winnerTeam = tournament.winner;
			} else if (tournament.league?.gridData?.rows) {
				const firstRow = tournament.league.gridData.rows[0];
				if (firstRow && firstRow.length > 1) {
					winnerTeam = firstRow[1];
				}
			}
		}

		let html = '';

		roundBets.forEach((bet) => {
			// toate meciurile
			let matchRowsHTML = '';
			let allMatchesSettled = true;
			let roundNumber = null;

			bet.matchOutcomes.forEach((matchOutcome) => {
				const matchData = this.findMatch(timerStates, matchOutcome.matchId);
				if (matchData && matchData.match) {
					const match = matchData.match;
					const isFinished = match.sc !== undefined && match.ot !== undefined;

					if (!isFinished) {
						allMatchesSettled = false;
					}

					// roundNumber
					if (!roundNumber && matchData.roundNumber) {
						roundNumber = matchData.roundNumber;
					}

					// selection si odds
					const selection =
						matchOutcome.outcome === 'T1' ? match.t1 : matchOutcome.outcome === 'T2' ? match.t2 : 'Draw';
					const odds = match.odds;
					const oddsIndex = matchOutcome.outcome === 'T1' ? 0 : matchOutcome.outcome === 'T2' ? 2 : 1;
					const selectedOdds = odds ? odds[oddsIndex] : null;

					// outcome
					let outcomeDisplay = 'Pending';
					if (isFinished) {
						outcomeDisplay = match.ot === matchOutcome.outcome ? 1 : 0;
					}

					matchRowsHTML += `
						<tr>
							<td>${match.t1}:${match.t2}</td>
							<td>${selection}</td>
							<td>${selectedOdds}</td>
							<td>${outcomeDisplay}</td>
						</tr>
					`;
				}
			});

			// ticket
			if (matchRowsHTML) {
				html += this.getBetHTML(
					{
						id: bet.id,
						stake: bet.stake,
						win: bet.win,
						betBoost: bet.betBoost || 1,
						matchOutcomes: bet.matchOutcomes,
						roundNumber: roundNumber,
						allMatchesSettled: allMatchesSettled,
					},
					tournamentNo,
					matchRowsHTML,
				);
			}
		});

		outrightBets.forEach((outrightBet) => {
			html += this.getOutrightBetHTML(outrightBet, tournamentEnded, winnerTeam, tournamentNo);
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

