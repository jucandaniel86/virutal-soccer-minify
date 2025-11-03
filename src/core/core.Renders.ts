import {
  CreditType,
  CurrentRoundType,
  KnockoutRound,
  LegueData,
  PlayerViewType,
  RoomTypesType,
} from "../config/app";

export default class Renders {
  countdownInterval: any = null;
  /**
   *
   * @param payload
   */
  renderLeagueTable(payload: LegueData): void {
    const htmlTable = document.querySelector(".legue-table");
    const htmlBody = document.querySelector("#league-body");
    if (!htmlTable || !htmlBody) return;

    //reset
    htmlBody.innerHTML = "";
    htmlTable.querySelector("thead").innerHTML = "";

    //render headers
    const htmlTableHead = htmlTable.querySelector("thead");
    const row = document.createElement("tr");
    const borderedTh = [0, 1, 9];
    payload.gridData.headers.forEach((header, index) => {
      const col = document.createElement("th");
      let html = borderedTh.indexOf(index) !== -1 ? "<b>" : "";
      html += header;
      html += borderedTh.indexOf(index) !== -1 ? "</b>" : "";
      col.innerHTML = html;
      row.appendChild(col);
    });

    payload.gridData.rows.forEach((element) => {
      const bodyRow = document.createElement("tr");
      if (Array.isArray(element) && element.length > 0) {
        const bodyRow = document.createElement("tr");

        element.forEach((_colElement, index) => {
          const col = document.createElement("td");
          let html = index + 1 === element.length ? "<b>" : "";
          html += _colElement;
          html += index + 1 === element.length ? "</b>" : "";
          col.innerHTML = html;
          bodyRow.appendChild(col);
        });
        htmlBody.appendChild(bodyRow);
      }
    });
    htmlTableHead.appendChild(row);
  }

  renderOutrightWinnerBets(outrightData: any[]) {
    const outrightContent = document.querySelector("#outright-content");

    if (!outrightContent || !outrightData || !outrightData) return;
    outrightContent.innerHTML = "";
    outrightData.forEach((selection) => {
      const btn = document.createElement("button");
      btn.className = "outright-bet-btn";
      btn.textContent = `${selection.team_name} - ${selection.odds}`;
      btn.dataset.teamId = selection.team_id;
      btn.dataset.odds = selection.odds;
      outrightContent.appendChild(btn);
    });
  }

  renderCountdownTimer(seconds: number) {
    const countdownEl: HTMLSpanElement = document.querySelector("#countdown");
    clearInterval(this.countdownInterval);
    let timeLeft = seconds || 0;
    if (countdownEl) countdownEl.textContent = String(timeLeft);
    this.countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft >= 0) {
        if (countdownEl) countdownEl.textContent = String(timeLeft);
      } else {
        clearInterval(this.countdownInterval);
        // showMatchFlow();
      }
    }, 1000);
  }

  renderMatchBettingOptions(payload: CurrentRoundType) {
    const HTMLDiv = document.querySelector(".match-betting-options");
    if (!HTMLDiv || payload.matches.length === 0) return;
    HTMLDiv.innerHTML = "";

    const headersDiv = document.createElement("div");
    headersDiv.className = "match-fixture";

    const headers = `<div class="team-container"></div>
    <div class="odds-buttons">
    	<span class="odds-header">1</span>
    	<span class="odds-header">X</span>
    	<span class="odds-header">2</span>
    </div>`;
    headersDiv.innerHTML = headers;
    HTMLDiv.appendChild(headersDiv);

    payload.matches.forEach((match) => {
      const matchEl = document.createElement("div");
      matchEl.className = "match-fixture";
      const odds = match.odds;

      if (odds) {
        matchEl.innerHTML = `<div class="teams-container"><div class="team-name team-a">${match.t1}</div><div class="team-name team-b">${match.t2}</div></div><div class="odds-buttons"><button data-match-id="${match.id}" data-outcome="T1" data-odds="${odds[0]}" class="odds-selector">${odds[0]}</button><button data-match-id="${match.id}" data-outcome="D" data-odds="${odds[1]}" class="odds-selector">${odds[1]}</button><button data-match-id="${match.id}" data-outcome="T2" data-odds="${odds[2]}" class="odds-selector">${odds[2]}</button></div>`;

        HTMLDiv.appendChild(matchEl);
      }
    });
  }

  resetKnockoutResults() {
    const oddsHeaderEl = document.querySelector(".match-info-bar");
    const bettingOptionsEl = document.querySelector("#match-betting-options");
    const knockOutDiv = document.querySelector("#knockout-results-display");
    const leagueTable = document.querySelector(".legue-table");
    const betDetails = document.querySelector(".bet-details");
    const betInfo = document.querySelector(".bet-info");
    const leagueDisplay = document.querySelector(".league-display");

    if (oddsHeaderEl) {
      oddsHeaderEl.classList.remove("hide");
    }
    if (bettingOptionsEl) {
      bettingOptionsEl.classList.remove("hide");
    }

    if (knockOutDiv) {
      knockOutDiv.classList.add("hide");
    }

    if (leagueTable) {
      leagueTable.classList.remove("hide");
    }

    if (betDetails) {
      betDetails.classList.remove("hide");
    }

    if (betInfo) {
      betInfo.classList.remove("hide");
    }

    if (leagueDisplay) {
      leagueDisplay.classList.remove("h-100");
    }
  }

  renderKnockoutResults(payload: KnockoutRound[]) {
    const knockOutDiv = document.querySelector("#knockout-results-display");
    const leagueTable = document.querySelector(".legue-table");
    const knockOutTable = document.querySelector(".knockout-results-table");
    const oddsHeaderEl = document.querySelector(".match-info-bar");
    const bettingOptionsEl = document.querySelector("#match-betting-options");
    const betDetails = document.querySelector(".bet-details");
    const betInfo = document.querySelector(".bet-info");
    const leagueDisplay = document.querySelector(".league-display");

    if (!knockOutDiv || !knockOutDiv) return;

    if (leagueTable) {
      leagueTable.classList.add("hide");
    }
    if (bettingOptionsEl) {
      bettingOptionsEl.classList.add("hide");
    }
    if (betDetails) {
      betDetails.classList.add("hide");
    }
    if (betInfo) {
      betInfo.classList.add("hide");
    }
    knockOutDiv.classList.remove("hide");

    if (leagueDisplay) {
      leagueDisplay.classList.add("h-100");
    }

    if (oddsHeaderEl) {
      oddsHeaderEl.classList.add("hide");
    }
    payload.forEach((roundData) => {
      const h3 = document.createElement("h3");
      h3.textContent = roundData.name;
      h3.classList.add("knockout-round-title");
      knockOutDiv.appendChild(h3);

      let tableHTML = `
                        <table class="knockout-results-table">
                            <tr>
                                <th width="90%">Match</th>
                                <th>Score</th>
                            </tr>
                    `;

      roundData.matches.forEach((result) => {
        tableHTML += `
						<tr>
								<td>${result.t1} vs ${result.t2}</td>
								<td>${result.sc[0]} - ${result.sc[1]}</td>
						</tr>
				`;
      });
      tableHTML += "</table>";
      knockOutDiv.innerHTML += tableHTML;
    });
  }

  renderRoundName(payload: CurrentRoundType) {
    const HTMLDivElement = document.querySelector("#round-name");

    if (HTMLDivElement) {
      HTMLDivElement.innerHTML = payload.name;
    }
  }

  renderTournamentName(payload: RoomTypesType) {
    const HTMLDivElement = document.querySelector("#tournament-name");
    const EndTournamentTitle = document.querySelector(
      "#knockout-results-title"
    );

    if (HTMLDivElement) {
      HTMLDivElement.innerHTML = payload.name;
    }
    if (EndTournamentTitle) {
      EndTournamentTitle.innerHTML = payload.name + " Results";
    }
  }

  renderBalance(payload: any) {
    const formatedBalance = `
    ${payload.currency}
    ${parseFloat(payload.amount).toFixed(payload.decimalPrecision)}`;
    const balanceEl = document.querySelector("#balance");
    if (!balanceEl) return;

    balanceEl.innerHTML = formatedBalance;
  }

  private displayMatchResults(fullData: CurrentRoundType, tournamentName = "") {
    const resultsListEl = document.getElementById("results-list");
    const roundSummaryEl = document.getElementById("round-summary");
    const resultsRoundNameEl = document.getElementById("results-round-name");

    return new Promise<void>((resolve) => {
      if (resultsListEl) resultsListEl.innerHTML = "";
      // if (roundSummaryEl) roundSummaryEl.innerHTML = "";
      if (!fullData || !fullData.matches || !resultsListEl) {
        resolve();
        return;
      }
      if (resultsRoundNameEl)
        resultsRoundNameEl.textContent = `Match Results: ${tournamentName} ${fullData.name}`;
      const results = fullData.matches;
      results.forEach((result, index) => {
        setTimeout(() => {
          const resultItem = document.createElement("div");
          resultItem.className = "result-item";
          resultItem.innerHTML = `<div class="main-score-line"><span class="result-team-name result-team-a">${result.t1}</span>
					<span class="result-score">${result.sc[0]} - ${result.sc[1]}</span>
					<span class="result-team-name result-team-b">${result.t2}</span></div>`;

          resultsListEl.appendChild(resultItem);
          setTimeout(() => resultItem.classList.add("visible"), 50);
          if (index === results.length - 1) resolve();
        }, index * 500);
      });
    });
  }

  async renderMatchResults(
    payload: CurrentRoundType,
    tournamentName: string
  ): Promise<void> {
    const transitionScreenEl = document.querySelector("#transition-screen");
    const resultsScreenEl = document.querySelector("#results-screen");

    if (transitionScreenEl) transitionScreenEl.classList.remove("hide");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (transitionScreenEl) transitionScreenEl.classList.add("hide");
    if (resultsScreenEl) resultsScreenEl.classList.remove("hide");

    await this.displayMatchResults(payload, tournamentName);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (resultsScreenEl) resultsScreenEl.classList.add("hide");
  }

  renderPlayerView(playerView: PlayerViewType, credit: CreditType) {
    const roundSummaryEl = document.querySelector("#round-summary");
    const resultsList = document.querySelector("#results-list");

    if (!roundSummaryEl) return;

    if (!playerView) {
      roundSummaryEl.classList.add("hide");
      roundSummaryEl.innerHTML = "";
      if (resultsList) {
        //@ts-ignore
        resultsList.style.height = "100%";
      }
      return;
    }

    if (resultsList) {
      //@ts-ignore
      resultsList.style.height = "calc(70% - 20px)";
    }

    roundSummaryEl.classList.remove("hide");
    roundSummaryEl.innerHTML = `<div>Staked: ${
      credit.currency
    } <b>${playerView.staked.toFixed(2)}</b></div>
                                <div>Returns: ${
                                  credit.currency
                                } <b>${playerView.returned.toFixed(2)}</b></div>
                                <div>Profit: ${
                                  credit.currency
                                } <b>${playerView.totalWin.toFixed(
      2
    )}</b></div>`;
  }
}
