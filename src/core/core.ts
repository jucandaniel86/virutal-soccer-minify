import {
  APP_STATE,
  GAME_NAME,
  RGS_ACTIONS,
  RoomTypesType,
  PublicViewType,
  PlayerViewType,
  CreditType,
  RoundTypesE,
  OutrightTeamType,
  ErrorType,
} from "../config/app";
import BetOptions from "./core.BetOptions";
import ModalCore from "./core.Modal";
import ProxiCore from "./core.Proxi";
import Renders from "./core.Renders";
import StakeSelector from "./core.StakeSelector";
import { animateStar, isset } from "./core.Utils";
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

//Game Vars
export let __CurrentStake = 0;
export let __CurrentBets: any[] = [];
export let __BetType = 0;
export let __ChampionshipEnded = false;
export let __SelectedOutrightTeam: OutrightTeamType | null = null;
export let __CurrentRound = "";

const displayError = (error: ErrorType) => {
  const ErrorModalWrapper = document.querySelector("#error");
  ErrorModalWrapper.classList.remove("hide");
  ErrorModalWrapper.querySelector("p").innerHTML = error.errorMessage;

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

const handleOutrightBets = () => {
  const outrightContent = document.querySelector("#outright-content");
  if (!outrightContent) return;

  const handleClickOutrightButton = (event: any) => {
    //@ts-ignore
    const clickedButton = event.target.closest(".outright-bet-btn");

    if (!clickedButton) return;
    document
      .querySelectorAll(".outright-bet-btn")
      .forEach((button) => button.classList.remove("selected"));

    __SelectedOutrightTeam = {
      team: clickedButton.dataset.team,
      odds: clickedButton.dataset.odds,
    };
    clickedButton.classList.add("selected");

    __BetOptions.setOutrightBet(__SelectedOutrightTeam);
  };

  outrightContent.removeEventListener("click", handleClickOutrightButton);
  outrightContent.addEventListener("click", handleClickOutrightButton);
};

export const initHTMLEvents = () => {
  window.addEventListener("beforeunload", (event) => {
    __Proxi.exitGame();
  });
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

      const cRound =
        typeof __PublicView.previousRound !== "undefined"
          ? __PublicView.previousRound
          : __PublicView.currentRound;

      __CurrentRound = cRound.name;

      if (cRound) {
        switch (cRound.roundType) {
          case RoundTypesE.LEAGUE:
            __Renders.renderLeagueTable(__PublicView.tournament.league);
            break;
          case RoundTypesE.KNOCKOUT:
            if (!__PublicView.tournament.isEnded) {
              __Renders.renderKnockoutRounds(__PublicView.tournament);
            }
            break;
        }
      }
      __ChampionshipEnded = __PublicView.tournament.isEnded;
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

      __Proxi.gameReady({});
      __Proxi.gameStarted(__PublicView.currentRound.name);
      __Proxi.updateBalance(__Credit.amount, __Credit.currency);
      __Renders.renderBalance(__Credit);
      break;
    case RGS_ACTIONS.GAME:
      __PlayerView = response.playerView;

      if (typeof response.playerView.error !== "undefined") {
        if (response.playerView.error.errorObject) {
        }
        __Proxi.error(
          response.playerView.error.errorCode,
          response.playerView.error.errorMessage,
          response.playerView.error.errorType
        );
        return __Modal.showErrorModal(
          response.playerView.error.message || "Unknow error"
        );
      }
      const betBtn: HTMLButtonElement = document.querySelector("#bet-button");
      __Modal.showBetModal(__PlayerView).then(() => {
        __BetOptions.resetBets();
        __SelectedOutrightTeam = null;
        betBtn.disabled = false;
      });
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
      __CurrentRoom.name
    );
  }

  __Proxi.gameStarted(__PublicView.currentRound.name);
  __Renders.renderCountdownTimer(__PublicView.secsToExtr);
  __Renders.renderRoundName(__PublicView.currentRound);
  __Renders.renderPlayerView(__PlayerView, __Credit);
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
    switch (cRound.roundType) {
      case RoundTypesE.LEAGUE:
        __Renders.renderLeagueTable(__PublicView.tournament.league);
        break;
      case RoundTypesE.KNOCKOUT:
        if (!__PublicView.tournament.isEnded) {
          __Renders.renderKnockoutRounds(__PublicView.tournament);
        }
        break;
    }
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

  if (__SelectedOutrightTeam) {
    __Websocket.outrightBet(
      __SelectedOutrightTeam,
      parseFloat(Number(__CurrentStake).toFixed(2))
    );
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

  await animateStar();
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

  __Proxi.listening();

  //handle place bets
  document
    .querySelector(".bet-button")
    .addEventListener("click", handlePlaceBet);

  //handle user history
  const menuBtn = document.querySelector("#app-menu");
  const betHistoryModal = document.querySelector("#bet-history-modal");
  const betHistoryCloseBtn = document.getElementById("bet-history-close-btn");
  const historyBtn = document.querySelector("#app-history-btn");

  if (historyBtn) {
    historyBtn.addEventListener("click", () => __Proxi.goToExternalHistory());
  }

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
