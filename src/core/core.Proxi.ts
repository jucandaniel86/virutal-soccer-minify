import { APP_LOG, LOG_PROXI } from "../config/app";
import { getQueryParams } from "./core.Utils";

export enum ProxiEventTypes {
  LISTENING = "LISTENING",
  GAME_READY = "GAME_READY",
  GAME_STARTED = "GAME_STARTED",
  GAME_COMPLETED = "GAME_COMPLETED",
  EXIT_GAME = "EXIT_GAME",
  OPEN_DEPOSIT = "OPEN_DEPOSIT",
  GAME_PAUSED = "GAME_PAUSED",
  BALANCE_UPDATED = "BALANCE_UPDATED",
  ERROR = "ERROR",
  SESSION_STARTED = "SESSION_STARTED",
  USER_ACTION = "USER_ACTION",
  REALITY_CHECK = "REALITY_CHECK",
}

export default class ProxiCore {
  private PROTOCOL_V = 1;
  public name: string = "PROXI:";

  private generateTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  /**
   *
   * @param event
   * @param payload
   */
  public send(event: ProxiEventTypes, payload: any) {
    const message = {
      event,
      payload,
      version: this.PROTOCOL_V,
      timestamp: this.generateTimestamp(),
    };
    window.postMessage(message);
    this.log(message);
  }

  /**
   *
   * @param payload
   */
  public gameReady(payload: any) {
    this.send(ProxiEventTypes.GAME_READY, payload);
  }

  /**
   * @param {null}
   */
  public listening() {
    this.send(ProxiEventTypes.LISTENING, {
      supportedVersions: [this.PROTOCOL_V],
    });
  }

  /**
   *
   * @param roundId
   */
  public gameStarted(roundId: string | number) {
    this.send(ProxiEventTypes.GAME_STARTED, {
      roundId,
    });
  }

  /**
   *
   * @param currentRound
   * @param win
   * @param profit
   * @param currency
   */
  public gameCompleted(
    currentRound: string,
    win: number,
    profit: number,
    currency: string
  ) {
    this.send(ProxiEventTypes.GAME_COMPLETED, {
      roundId: currentRound,
      win: { amount: win, currency },
      netResult: profit,
    });
  }

  /**
   *
   * @param balance
   * @param currency
   */
  public updateBalance(balance: number, currency: string) {
    this.send(ProxiEventTypes.BALANCE_UPDATED, {
      balance,
      currency,
    });
  }

  /**
   *
   * @param errorCode
   * @param errorMessage
   */
  public error(
    errorCode: number | string,
    errorMessage: string,
    errorType: string
  ) {
    this.send(ProxiEventTypes.ERROR, {
      code: errorCode,
      message: errorMessage,
      severity: errorType,
    });
  }

  /**
   * @param {null}
   */
  public exitGame() {
    this.send(ProxiEventTypes.EXIT_GAME, {});
  }

  /**
   *
   * @param message
   * @returns
   */
  private log(message: any) {
    if (!APP_LOG) return false;
    console.groupCollapsed(
      `%c ${this.name} :: INFO `,
      `background: #e10a0a; color: white; display: block;`
    );
    console.log(message);
    console.groupEnd();
  }

  public goToExternalHistory(): void {
    const queryParams: any = getQueryParams();

    const historyUrl: any = new URL(queryParams.historyURL);

    historyUrl.searchParams.append("siteID", queryParams.siteID as string);
    historyUrl.searchParams.append("gameID", queryParams.gameID as string);
    historyUrl.searchParams.append("fixedID", queryParams.playToken as string);
    //@ts-ignore
    window.open(historyUrl, "_blank").focus();
  }
}
