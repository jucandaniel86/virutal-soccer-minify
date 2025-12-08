import {
  APP_STATE,
  GAME_NAME,
  RGS_ACTIONS,
  RoomTypesType,
  PublicViewType,
  PlayerViewType,
  CreditType,
  OutrightTeamType,
  ErrorType,
  OUTRIGHT_TEST,
} from "../config/app";
import { OUTRIGHT_BETS } from "../config/outrightbets";
import BetOptions from "./core.BetOptions";
import ModalCore from "./core.Modal";
import ProxiCore from "./core.Proxi";
import Renders from "./core.Renders";
import StakeSelector from "./core.StakeSelector";
import { ThemeGenerator } from "./core.ThemeGenerator";
import { animateStar, getQueryParams, isset } from "./core.Utils";
import WSCore from "./core.Websocket";

//Core Libraries
export let __Websocket: WSCore;
export let __StakeSelector: StakeSelector;
export let __CurrentRoom: RoomTypesType = null;
export let __PublicView: PublicViewType = null;
export let __PlayerView: PlayerViewType = null;
export let __Renders: Renders = null;
export let __BetOptions: BetOptions;
export let __Modal: ModalCore;
export let __Credit: CreditType = null;
export let __Proxi: ProxiCore;
export let __Theme: ThemeGenerator;

//Game Vars
export let __CurrentStake = 0;
export let __CurrentBets: any[] = [];
export let __BetType = 0;
export let __ChampionshipEnded = false;
export let __SelectedOutrightTeam: OutrightTeamType[] = [];
export let __CurrentRound = "";
export let __OutrightBettingRound = false;
export let __FixedPlayerReference = "";

/* GROUPS */
const GROUPS = {
  GridData: {
    Headers: ["Group", "Pos", "Team", "P", "W", "D", "L", "GD", "PTS"],
    Rows: [
      ["1", "1", "Mali", "3", "3", "0", "0", "5", "9"],
      ["1", "2", "Morocco", "3", "2", "0", "1", "4", "6"],
      ["1", "3", "Zambia", "3", "1", "0", "2", "-1", "3"],
      ["1", "4", "Comoros", "3", "0", "0", "3", "-8", "0"],
      ["2", "1", "Angola", "3", "3", "0", "0", "4", "9"],
      ["2", "2", "Egypt", "3", "1", "1", "1", "3", "4"],
      ["2", "3", "S. Africa", "3", "1", "1", "1", "-1", "4"],
      ["2", "4", "Zimbabwe", "3", "0", "0", "3", "-6", "0"],
      ["3", "1", "Nigeria", "3", "2", "0", "1", "3", "6"],
      ["3", "2", "Tunisia", "3", "2", "0", "1", "2", "6"],
      ["3", "3", "Uganda", "3", "2", "0", "1", "0", "6"],
      ["3", "4", "Tanzania", "3", "0", "0", "3", "-5", "0"],
      ["4", "1", "Senegal", "3", "2", "1", "0", "6", "7"],
      ["4", "2", "DR Congo", "3", "1", "1", "1", "-1", "4"],
      ["4", "3", "Benin", "3", "1", "1", "1", "-1", "4"],
      ["4", "4", "Botswana", "3", "0", "1", "2", "-4", "1"],
      ["5", "1", "Equ. Guinea", "3", "2", "1", "0", "2", "7"],
      ["5", "2", "Algeria", "3", "1", "2", "0", "2", "5"],
      ["5", "3", "Sudan", "3", "1", "0", "2", "1", "3"],
      ["5", "4", "Burkina Faso", "3", "0", "1", "2", "-5", "1"],
      ["6", "1", "Ivory Coast", "3", "2", "1", "0", "2", "7"],
      ["6", "2", "Cameroon", "3", "1", "1", "1", "0", "4"],
      ["6", "3", "Gabon", "3", "1", "0", "2", "-1", "3"],
      ["6", "4", "Mozambique", "3", "0", "2", "1", "-1", "2"],
    ],
  },
};

const displayError = (error: ErrorType) => {
  __Modal.showErrorModal(error.errorMessage, false);

  __Proxi.error(error.errorCode, error.errorMessage, error.errorType);
};

const setCurrentBetType = (_betType: number) => {
  __BetType = _betType;
};

const setGameTitle = () => {
  document.head.title = GAME_NAME;
};

const setGameHeight = () => {
  const mainEl = document.querySelector(".main");
  const overlay = document.querySelectorAll(".overlay");
  if (mainEl) {
    //@ts-ignore
    mainEl.style.height = window.innerHeight + "px";
  }
  if (overlay) {
    Array.from(overlay).forEach((element) => {
      //@ts-ignore
      element.style.height = window.innerHeight - 56 + "px";
    });
  }
};

const handleReloadButton = () => {
  document.querySelector("#reloadBtn").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.reload();
  });
};

const resetOutrightBets = () => {
  document
    .querySelectorAll(".outright-bet-btn")
    .forEach((button) => button.classList.remove("selected"));
  __SelectedOutrightTeam = [];
};

const handleOutrightBets = () => {
  const outrightContent = document.querySelector("#outright-content");

  if (!outrightContent) return;

  const handleClickOutrightButton = (event: any) => {
    //@ts-ignore
    const clickedButton = event.target.closest(".outright-bet-btn");

    if (!clickedButton) return;

    const findSelected = __SelectedOutrightTeam.findIndex((_selected) => {
      return clickedButton.dataset.team === _selected.team;
    });
    console.log(findSelected);
    if (findSelected !== -1) {
      clickedButton.classList.remove("selected");
      __SelectedOutrightTeam.splice(findSelected, 1);
    } else {
      __SelectedOutrightTeam.push({
        team: clickedButton.dataset.team,
        odds: clickedButton.dataset.odds,
      });
      clickedButton.classList.add("selected");
    }

    __BetOptions.setOutrightBet(__SelectedOutrightTeam);
  };

  outrightContent.removeEventListener("click", handleClickOutrightButton);
  outrightContent.addEventListener("click", (e) => {
    e.preventDefault();
    handleClickOutrightButton(e);
  });
};

export const initHTMLEvents = () => {
  window.addEventListener("beforeunload", (event) => {
    __Proxi.exitGame();
  });
  //handle resize
  window.addEventListener("resize", () => setGameHeight());
};

export const startGame = async (state: APP_STATE) => {
  //screens
  const LoadingScreen = document.querySelector("#LoadingScreen");
  const GameScreen = document.querySelector("#GameScreen");

  switch (state) {
    case APP_STATE.INIT:
      {
        LoadingScreen.classList.remove("hide");
        __Websocket.init();
      }
      break;
    case APP_STATE.CONNECTED:
      {
        __Websocket.login();
      }
      break;
    case APP_STATE.LOBBY:
      __Websocket.lobby();
      break;
    case APP_STATE.JOIN:
      if (!__CurrentRoom) {
        return displayError({
          errorCode: 9999,
          errorMessage: "Invalid Room.",
          errorType: "critical",
        });
      }
      __Websocket.join(__CurrentRoom.id);
      break;
    case APP_STATE.GAME:
      {
        LoadingScreen.classList.add("hide");
        GameScreen.classList.remove("hide");
      }
      break;
  }
};

/**
 *
 * @param payload
 * @returns void
 */
const handleBetsChange = (payload: any) => (__CurrentBets = payload);

/**
 * handle websocket response
 * @param response
 */
export const onResponse = (response: any) => {
  if (response.credit) {
    __Credit = response.credit;
  }
  switch (response.requestType) {
    case RGS_ACTIONS.LOGIN:
      __StakeSelector.init(response);
      __Renders.renderBalance(response.credit);
      __Credit = response.credit;
      if (response.playerDetails) {
        __FixedPlayerReference = response.playerDetails.fixedReference;
      }
      startGame(APP_STATE.LOBBY);
      break;
    case RGS_ACTIONS.LOBBY:
      if (isset(response.roomTypes)) {
        __CurrentRoom = response.roomTypes[0];
        __Renders.renderTournamentName(__CurrentRoom);
        startGame(APP_STATE.JOIN);
      }
      break;
    case RGS_ACTIONS.JOIN:
      startGame(APP_STATE.GAME);
      __PublicView = response.publicView;
      __PlayerView = response.playerView;
      //call renders
      if (!__PublicView.tournament.isEnded) {
        __Renders.renderMatchBettingOptions(__PublicView.currentRound);
      } else {
        __Renders.renderKnockoutResults(__PublicView.tournament);
      }

      __Renders.renderTournamentNumber(__PublicView);

      const cRound =
        typeof __PublicView.previousRound !== "undefined"
          ? __PublicView.previousRound
          : __PublicView.currentRound;

      __CurrentRound = cRound.name;

      if (cRound) {
        __Renders.renderRoundTables(cRound.roundType, __PublicView.tournament);
      }
      __ChampionshipEnded = __PublicView.tournament.isEnded;

      __Renders.renderBetsCounter(__PlayerView);
      __Renders.renderCountdownTimer(__PublicView.secsToExtr);

      __BetOptions.init({
        onBetChange: handleBetsChange,
        onBetTypeChange: setCurrentBetType,
      });
      __Renders.renderRoundName(__PublicView.currentRound);
      __Renders.renderOutrightBetting(
        __PublicView.outrightBetting,
        handleOutrightBets
      );

      if (OUTRIGHT_TEST) {
        __Renders.renderOutrightBetting(
          OUTRIGHT_BETS as any,
          handleOutrightBets
        );
      }

      __Proxi.gameReady({});
      __Proxi.gameStarted(__PublicView.currentRound.name);
      __Proxi.updateBalance(__Credit.amount, __Credit.currency);
      __Renders.renderBalance(__Credit);
      break;
    case RGS_ACTIONS.GAME:
      __PlayerView = response.playerView;

      __Renders.renderBetsCounter(__PlayerView);

      if (typeof response.playerView.error !== "undefined") {
        if (response.playerView.error.errorObject) {
        }
        __Proxi.error(
          response.playerView.error.errorCode,
          response.playerView.error.errorMessage,
          response.playerView.error.errorType
        );
        return __Modal.showErrorModal(
          response.playerView.error.message || "Unknow error",
          true
        );
      }
      const betBtn: HTMLButtonElement = document.querySelector("#bet-button");
      __Modal.showBetModal(__PlayerView).then(() => {});
      __Renders.renderBalance(__Credit);
      break;
  }
};

export const onBroadcastResponse = (response: any) => {
  __PublicView = response.publicView;
  __PlayerView = response.playerView;

  if (response.credit) {
    __Credit = response.credit;
  }

  __OutrightBettingRound = typeof __PublicView.outrightBetting !== "undefined";
  resetOutrightBets();

  const betDetails = document.querySelector(".bet-type-selector");
  if (betDetails) {
    betDetails.classList.remove("hide");
  }

  const cRound: any =
    typeof __PublicView.previousRound === "undefined"
      ? __PublicView.currentRound
      : __PublicView.previousRound;

  if (cRound.name !== __CurrentRound && __PlayerView) {
    __Proxi.gameCompleted(
      __CurrentRound,
      __PlayerView.totalWin,
      __PlayerView.profit,
      __Credit.currency
    );
    __Proxi.updateBalance(__Credit.amount, __Credit.currency);
  }
  __CurrentRound = cRound.name;

  //call renders
  if (!__ChampionshipEnded) {
    __Renders.renderMatchResults(
      __PublicView.tournament.isEnded
        ? __PublicView.currentRound
        : __PublicView.previousRound,
      __CurrentRoom.name,
      __PlayerView,
      __Credit
    );
  }

  __Proxi.gameStarted(__PublicView.currentRound.name);

  __Renders.renderTournamentNumber(__PublicView);
  __Renders.renderBetsCounter(__PlayerView);
  __Renders.renderCountdownTimer(__PublicView.secsToExtr);
  __Renders.renderRoundName(__PublicView.currentRound);
  // __Renders.renderPlayerView(__PlayerView, __Credit);

  // __Renders.renderOutrightBetting({ teamOdds: testOut }, handleOutrightBets);

  __Renders.renderOutrightBetting(
    __PublicView.outrightBetting,
    handleOutrightBets
  );
  __Renders.renderBalance(__Credit);

  if (!__PublicView.tournament.isEnded) {
    __Renders.resetKnockoutResults();
    __Renders.renderMatchBettingOptions(__PublicView.currentRound);
  } else {
    __Renders.renderKnockoutResults(__PublicView.tournament);
  }

  if (cRound) {
    __Renders.renderRoundTables(cRound.roundType, __PublicView.tournament);
  }

  __BetOptions.init({
    onBetChange: handleBetsChange,
    onBetTypeChange: setCurrentBetType,
  });
  __BetOptions.resetBets();
  __ChampionshipEnded = __PublicView.tournament.isEnded;
};

const handleStakeChange = (_stake: any) => {
  __BetOptions.updateCalculations();
  __CurrentStake = _stake;
};

const handlePlaceBet = async () => {
  if (!__CurrentBets || __CurrentBets.length === 0 || !__CurrentStake) return;
  console.log("PLACE BET", __SelectedOutrightTeam);
  if (__SelectedOutrightTeam && __OutrightBettingRound) {
    __Websocket.outrightBet(
      __SelectedOutrightTeam,
      parseFloat(Number(__CurrentStake).toFixed(2))
    );

    resetOutrightBets();
    return;
  }
  const betBtn: HTMLButtonElement = document.querySelector("#bet-button");

  const CurrentBets = __CurrentBets.map((bet: any) => ({
    matchId: bet.matchId,
    outcome: `${bet.outcome}`,
    stake: parseFloat(Number(__CurrentStake).toFixed(2)),
  }));
  __Websocket.bet(CurrentBets, __BetType);

  if (betBtn) {
    betBtn.disabled = true;
  }

  __BetOptions.resetBets();
  resetOutrightBets();

  await animateStar();
};

export const handleInfoPopupActions = () => {
  const historyBtn = document.querySelector("#app-history-btn");
  const infoBtn = document.querySelector("#app-info-btn");
  const infoContent = document.querySelector("#bet-history-info");
  const historyContent = document.querySelector("#bet-history-list");

  if (infoBtn) {
    infoBtn.addEventListener("click", (event: PointerEvent) => {
      historyBtn.classList.remove("active");
      infoBtn.classList.add("active");
      infoContent.classList.remove("hide");
      historyContent.classList.add("hide");
    });
  }

  if (historyBtn) {
    historyBtn.addEventListener("click", (event: PointerEvent) => {
      __Proxi.goToExternalHistory(false, __FixedPlayerReference);
      return;
      historyBtn.classList.add("active");
      infoBtn.classList.remove("active");
      infoContent.classList.add("hide");
      historyContent.classList.remove("hide");
    });
  }
};

const generateHistoryIframeURL = () => {
  const historyURL = __Proxi.goToExternalHistory(true, __FixedPlayerReference);
  const historyIframe: HTMLIFrameElement =
    document.querySelector("#history-iframe");
  if (historyURL && historyIframe) {
    historyIframe.src = historyURL;
  }
};

export const __init = () => {
  __StakeSelector = new StakeSelector({
    onStakeChange: handleStakeChange,
  });
  __Renders = new Renders();
  __BetOptions = new BetOptions();
  __Websocket = new WSCore({
    onReady: () => startGame(APP_STATE.CONNECTED),
    onError: displayError,
    onBroadcastResponse,
    onResponse,
  });
  __Modal = new ModalCore();
  __Proxi = new ProxiCore();
  //@ts-ignore
  __Theme = new ThemeGenerator(getQueryParams().siteID);

  __Proxi.listening();
  __Theme.generate();

  //handle place bets
  document
    .querySelector(".bet-button")
    .addEventListener("click", handlePlaceBet);

  //handle user history
  const menuBtn = document.querySelector("#app-menu");
  const betHistoryModal = document.querySelector("#bet-history-modal");
  const betHistoryCloseBtn = document.getElementById("bet-history-close-btn");

  handleInfoPopupActions();
  generateHistoryIframeURL();

  if (menuBtn)
    menuBtn.addEventListener("click", () => __Modal.showBetHistory());
  //@ts-ignore
  if (betHistoryCloseBtn)
    betHistoryCloseBtn.addEventListener("click", () =>
      //@ts-ignore
      __Modal.hideModal(betHistoryModal)
    );

  setGameTitle();
  setGameHeight();
  handleReloadButton();
  initHTMLEvents();
  startGame(APP_STATE.INIT);
};
