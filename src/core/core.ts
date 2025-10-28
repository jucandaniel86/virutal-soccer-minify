import {
  APP_STATE,
  GAME_NAME,
  RGS_ACTIONS,
  RoomTypesType,
  PublicViewType,
  BetItemType,
  PlayerViewType,
  CreditType,
} from "../config/app";
import BetOptions from "./core.BetOptions";
import ModalCore from "./core.Modal";
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

//Game Vars
export let __CurrentStake = 0;
export let __CurrentBets: any[] = [];

const displayError = (message: string) => {
  const ErrorModalWrapper = document.querySelector("#error");
  ErrorModalWrapper.classList.remove("hide");
  ErrorModalWrapper.querySelector("p").innerHTML = message;
};

const setGameTitle = () => {
  document.head.title = GAME_NAME;
};

const setGameHeight = () => {
  const mainEl = document.querySelector(".main");
  if (mainEl) {
    //@ts-ignore
    mainEl.style.height = window.innerHeight + "px";
  }
};

const handleReloadButton = () => {
  document.querySelector("#reloadBtn").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.reload();
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
      if (
        !__CurrentRoom ||
        Array.isArray(__CurrentRoom.rooms) !== true ||
        __CurrentRoom.rooms.length === 0
      ) {
        return displayError("Invalid Room.");
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
      __Renders.renderLeagueTable(__PublicView.tournament.league);
      __Renders.renderCountdownTimer(__PublicView.secsToExtr);
      if (!__PublicView.tournament.isEnded) {
        __Renders.renderMatchBettingOptions(__PublicView.currentRound);
      } else {
        __Renders.renderKnockoutResults(
          __PublicView.tournament.knockout.rounds
        );
      }
      __BetOptions.init({
        onBetChange: handleBetsChange,
      });
      __Renders.renderRoundName(__PublicView.currentRound);
      break;
  }
};

export const onBroadcastResponse = (response: any) => {
  __PublicView = response.publicView;
  __PlayerView = response.playerView;

  //call renders
  __Renders.renderMatchResults(__PublicView.previousRound, __CurrentRoom.name);
  __Renders.renderLeagueTable(__PublicView.tournament.league);
  __Renders.renderCountdownTimer(__PublicView.secsToExtr);
  __Renders.renderRoundName(__PublicView.currentRound);
  __Renders.renderPlayerView(__PlayerView, __Credit);

  if (!__PublicView.tournament.isEnded) {
    __Renders.resetKnockoutResults();
    __Renders.renderMatchBettingOptions(__PublicView.currentRound);
  } else {
    __Renders.renderKnockoutResults(__PublicView.tournament.knockout.rounds);
  }

  __BetOptions.init({
    onBetChange: handleBetsChange,
  });
  __BetOptions.resetBets();
};

const handleStakeChange = (_stake: any) => {
  __BetOptions.updateCalculations();
  __CurrentStake = _stake;
};

const handlePlaceBet = async () => {
  if (!__CurrentBets || __CurrentBets.length === 0 || !__CurrentStake) return;

  const CurrentBets = __CurrentBets.map((bet: any) => ({
    matchId: bet.matchId,
    outcome: `${bet.outcome}`,
    stake: parseFloat(Number(__CurrentStake).toFixed(2)),
  }));
  __Websocket.bet(CurrentBets);
  await animateStar();
  await __Modal.showBetModal();
  __BetOptions.resetBets();
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

  //handle place bets
  document
    .querySelector(".bet-button")
    .addEventListener("click", handlePlaceBet);

  //handle user history
  const matchInfoBar = document.querySelector(".match-info-bar");
  const betHistoryModal = document.querySelector("#bet-history-modal");
  const betHistoryCloseBtn = document.getElementById("bet-history-close-btn");

  if (matchInfoBar)
    matchInfoBar.addEventListener("click", () => __Modal.showBetHistory());
  //@ts-ignore
  if (betHistoryCloseBtn)
    betHistoryCloseBtn.addEventListener("click", () =>
      //@ts-ignore
      __Modal.hideModal(betHistoryModal)
    );

  setGameTitle();
  setGameHeight();
  handleReloadButton();
  startGame(APP_STATE.INIT);
};
