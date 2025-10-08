import WS from "./ws.js";

document.addEventListener("DOMContentLoaded", () => {
  //ws class
  let wsClass = null;
  let stakes = [];
  let stakeIndex = 0;
  let currency = "";
  let decimalPrecision = 2;
  let countdownInterval = null;
  const transitionScreenEl = document.querySelector("#transition-screen");
  const resultsScreenEl = document.querySelector("#results-screen");
  const resultsListEl = document.getElementById("results-list");
  const roundSummaryEl = document.getElementById("round-summary");
  const resultsRoundNameEl = document.getElementById("results-round-name");

  var roundNames = [
    "Pre-Tournament",
    "Gameweek 1A",
    "Gameweek 1B",
    "Gameweek 2A",
    "Gameweek 2B",
    "Gameweek 3A",
    "Gameweek 3B",
    "Gameweek 4A",
    "Gameweek 4B",
    "Gameweek 5A",
    "Gameweek 5B",
    "Gameweek 6A",
    "Gameweek 6B",
    "Gameweek 7A",
    "Gameweek 7B",
    "Gameweek 8A",
    "Gameweek 8B",
    "Knockout: Leg 1",
    "Knockout: Leg2",
    "Round of 16: Leg 1",
    "Round of 16: Leg 2",
    "QFs: Leg 1",
    "QFs: Leg 2",
    "SFs: Leg 1",
    "SFs: Leg 2",
    "Final",
  ];

  const displayError = (message) => {
    const ErrorModalWrapper = document.querySelector("#error");
    ErrorModalWrapper.classList.remove("hide");
    ErrorModalWrapper.querySelector("p").innerHTML = message;
  };

  const updateLeagueDisplay = async (fullData, groupId = 1) => {
    const leagueBody = document.querySelector("#league-body");

    if (!leagueBody) return;

    const groupData = fullData.league_group_standings.find(
      (g) => g.group_id === groupId
    );

    groupData.standings.forEach((team) => {
      const stats = team.stats;
      const row = document.createElement("tr");

      row.innerHTML = `<td>${team.position}</td><td>${team.team_name}</td><td>${stats[0]}</td><td>${stats[1]}</td><td>${stats[2]}</td><td>${stats[3]}</td><td>${stats[4]}</td><td>${stats[5]}</td><td>${stats[6]}</td><td><b>${stats[7]}</b></td>`;
      leagueBody.appendChild(row);
    });
  };

  const populateNextMatches = (fullData) => {
    const matchOptionsEl = document.getElementById("match-betting-options");

    if (matchOptionsEl) matchOptionsEl.innerHTML = "";

    if (fullData && fullData.next_matches) {
      fullData.next_matches.forEach((match) => {
        const matchEl = document.createElement("div");
        matchEl.className = "match-fixture";
        const odds = match.odds;
        matchEl.innerHTML = `<div class="teams-container"><div class="team-name team-a">${match.team_a_name}</div><div class="team-name team-b">${match.team_b_name}</div></div><div class="odds-buttons"><button data-match-id="${match.match_id}" data-outcome="1" data-odds="${odds[0]}">${odds[0]}</button><button data-match-id="${match.match_id}" data-outcome="X" data-odds="${odds[1]}">${odds[1]}</button><button data-match-id="${match.match_id}" data-outcome="2" data-odds="${odds[2]}">${odds[2]}</button></div>`;

        if (matchOptionsEl) matchOptionsEl.appendChild(matchEl);
      });
    }
  };

  const fetchResults = async () => {
    const fullData = await fetch("/assets/teams.json", { method: "GET" }).then(
      async (res) => res.json()
    );

    updateLeagueDisplay(fullData);
    populateNextMatches(fullData);
  };

  const updateBalance = (payload) => {
    const formatedBalance = `
    ${payload.currency}
    ${parseFloat(payload.amount).toFixed(payload.decimalPrecision)}`;
    const balanceEl = document.querySelector("#balance");
    if (!balanceEl) return;

    balanceEl.innerHTML = formatedBalance;
    currency = payload.currency;
    decimalPrecision = payload.decimalPrecision;
  };

  const updateStakes = (payload) => {
    if (
      payload.stakeValues &&
      Array.isArray(payload.stakeValues) &&
      payload.stakeValues.length > 0
    ) {
      stakes = payload.stakeValues;

      if (payload.defaultStake) {
        stakeIndex = stakes.findIndex(
          (stake) => stake === payload.defaultStake
        );
        changeStake(stakeIndex);
      }
    }
  };

  const changeStake = (index) => {
    const stakeEl = document.querySelector(".stake-input");
    if (!stakeEl) return;

    const amount = stakes[index] || 0;

    const formatedBalance = `
    ${currency}
    ${parseFloat(amount).toFixed(decimalPrecision)}`;

    stakeEl.innerHTML = formatedBalance;
  };

  const setStakesButtonsState = () => {
    if (stakeIndex === 0) {
      document.querySelector(".stake-up").disabled = true;
    } else {
      document.querySelector(".stake-up").disabled = false;
    }
    if (stakeIndex === stakes.length - 1) {
      document.querySelector(".stake-down").disabled = true;
    } else {
      document.querySelector(".stake-down").disabled = false;
    }
  };

  const prevStakes = () => {
    if (stakeIndex - 1 >= 0) {
      stakeIndex = stakeIndex - 1;
      changeStake(stakeIndex);
      setStakesButtonsState();
    }
  };

  const nextStakes = () => {
    if (stakeIndex + 1 < stakes.length) {
      stakeIndex = stakeIndex + 1;
      changeStake(stakeIndex);
      setStakesButtonsState();
    }
  };

  const setStakeSelectorActions = () => {
    document.querySelector(".stake-up").addEventListener("click", prevStakes);
    document.querySelector(".stake-down").addEventListener("click", nextStakes);
  };

  const handleServerResponse = (response) => {
    switch (response.requestType) {
      case "login":
        {
          updateBalance(response.credit);
          updateStakes(response);
          setStakeSelectorActions();
        }
        break;
    }
  };

  const displayMatchResults = (fullData) => {
    return new Promise((resolve) => {
      if (resultsListEl) resultsListEl.innerHTML = "";
      if (roundSummaryEl) roundSummaryEl.innerHTML = "";
      if (!fullData || !fullData.match_results || !resultsListEl) {
        resolve();
        return;
      }
      if (resultsRoundNameEl)
        resultsRoundNameEl.textContent = `Match Results: ${
          roundNames[fullData.game_round_played] ||
          `Round ${fullData.game_round_played}`
        }`;
      const results = fullData.match_results;
      results.forEach((result, index) => {
        setTimeout(() => {
          const resultItem = document.createElement("div");
          resultItem.className = "result-item";
          resultItem.innerHTML = `<div class="main-score-line"><span class="result-team-name result-team-a">${result.team_a[1]}</span><span class="result-score">${result.score[0]} - ${result.score[1]}</span><span class="result-team-name result-team-b">${result.team_b[1]}</span></div>`;
          if (result.went_to_etp === 1) {
            const extraInfoDiv = document.createElement("div");
            extraInfoDiv.className = "extra-info";
            let extraText = `Extra Time: ${result.extra_time}`;
            if (result.penalties && result.penalties !== "") {
              extraText += `<br>Pens: ${result.penalties}`;
            }
            extraInfoDiv.innerHTML = extraText;
            resultItem.appendChild(extraInfoDiv);
          }
          resultsListEl.appendChild(resultItem);
          setTimeout(() => resultItem.classList.add("visible"), 50);
          if (index === results.length - 1) resolve();
        }, index * 500);
      });
    });
  };

  const showMatchFlow = async () => {
    if (transitionScreenEl) transitionScreenEl.classList.remove("hide");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (transitionScreenEl) transitionScreenEl.classList.add("hide");

    const fullData = await fetch("/assets/teams.json", { method: "GET" }).then(
      async (res) => res.json()
    );

    if (
      fullData &&
      fullData.match_results &&
      fullData.match_results.length > 0
    ) {
      if (resultsScreenEl) resultsScreenEl.classList.remove("hide");
      await displayMatchResults(fullData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (resultsScreenEl) resultsScreenEl.classList.add("hide");

      updateCountdown(5);
    }
  };

  const updateCountdown = (seconds) => {
    const countdownEl = document.querySelector("#countdown");
    clearInterval(countdownInterval);
    let timeLeft = seconds || 0;
    if (countdownEl) countdownEl.textContent = timeLeft;
    countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft >= 0) {
        if (countdownEl) countdownEl.textContent = timeLeft;
      } else {
        clearInterval(countdownInterval);
        showMatchFlow();
      }
    }, 1000);
  };

  const startGame = async (state) => {
    //screens
    const LoadingScreen = document.querySelector("#LoadingScreen");
    const GameScreen = document.querySelector("#GameScreen");

    switch (state) {
      case "INIT":
        {
          LoadingScreen.classList.remove("hide");
          wsClass = new WS({
            onReady: () => startGame("CONNECTED"),
            onSetup: () => startGame("SETUP"),
            onSetupReady: () => startGame("GAME"),
            displayError: (message) => displayError(message),
            onResponse: (response) => handleServerResponse(response),
          });
          wsClass.init();
        }
        break;
      case "CONNECTED":
        {
          wsClass.login();
          await fetchResults();
        }
        break;
      case "SETUP":
        wsClass.setup();

        break;
      case "GAME":
        {
          LoadingScreen.classList.add("hide");
          GameScreen.classList.remove("hide");
          updateCountdown(5);
        }
        break;
    }
  };
  startGame("INIT");
  document.querySelector("#reloadBtn").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.reload();
  });
});
