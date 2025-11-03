import { APP_LOG, BetItemType, RGS_ACTIONS } from "../config/app";

interface WSCoreInterface {
  onResponse: (_payload: any) => void;
  onError: (message: string) => void;
  onReady: (_payload?: any) => void;
  onBroadcastResponse: (_payload: any) => void;
}

export default class WSCore {
  queryParams: any;
  name: string = "WS: Connector";
  ws: WebSocket = null;
  connected = false;
  isLogged = true;
  sessionID = "";
  lastAction: string = null;
  hasError = false;
  heartbeatHandle: any = null;
  onResponse: (_payload: any) => void;
  onBroadcastResponse: (_payload: any) => void;
  onError: (message: any) => void;
  onReady: (_payload?: string) => void;

  constructor({
    onReady,
    onError,
    onResponse,
    onBroadcastResponse,
  }: WSCoreInterface) {
    this.queryParams = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop: any) => searchParams.get(prop),
    });

    this.onBroadcastResponse = onBroadcastResponse;
    this.onReady = onReady;
    this.onError = onError;
    this.onResponse = onResponse;
  }

  init() {
    if (!this.validateParams()) {
      this.triggerErrorModal("Invalid Game Params");
      return false;
    }

    this.connect();
  }

  connect() {
    this.ws = new WebSocket(`wss://${this.queryParams.endpoint}`);
    this.ws.addEventListener("error", this.onSocketError.bind(this));
    this.ws.addEventListener("close", this.onClose.bind(this));
    this.ws.addEventListener("message", this.onMessage.bind(this));
    this.ws.addEventListener("open", this.onOpen.bind(this));
  }

  onSocketError(err: any) {
    this.triggerErrorModal("Websocket Error");
    this.log("[error]");
    this.connected = false;
  }

  isConnected() {
    if (this.ws !== undefined && this.ws.readyState === WebSocket.OPEN)
      return true;
    return false;
  }

  onClose(event: any) {
    this.connected = false;
    if (event.wasClean) {
      this.log(
        `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
      );
    } else {
      this.log("[close] Connection closed");
    }
    this.triggerErrorModal("[close] Connection closed");
  }

  send(_payload: any) {
    if (!this.isConnected()) {
      return this.log("[Sending error:: Server disconnected]");
    }
    this.ws.send(JSON.stringify(_payload));
  }

  onMessage(event: any) {
    const _wsResponse = JSON.parse(event.data);

    if (
      (_wsResponse.response &&
        _wsResponse.response.requestType === RGS_ACTIONS.BROADCAST) ||
      _wsResponse.requestType === RGS_ACTIONS.BROADCAST
    ) {
      return this.onBroadcastResponse(_wsResponse);
    }

    if (
      (!_wsResponse.response ||
        _wsResponse.response.requestType !== this.lastAction) &&
      (!_wsResponse.requestType || _wsResponse.requestType !== this.lastAction)
    ) {
      return this.log("[Invalid Socket Response]");
    }

    if (_wsResponse.error) {
      this.triggerErrorModal(_wsResponse.error.errorMessage);
      return;
    }

    switch (this.lastAction) {
      case RGS_ACTIONS.LOGIN:
        this.handleLoginResponse(_wsResponse.response);
    }

    if (_wsResponse.response) {
      this.onResponse(_wsResponse.response);
    } else {
      this.onResponse(_wsResponse);
    }
  }

  onOpen() {
    this.connected = true;
    this.onReady();
    this.log("[ws: open]");
  }

  validateParams() {
    if (
      this.queryParams.siteID == null ||
      this.queryParams.siteID === "" ||
      this.queryParams.gameID == null ||
      this.queryParams.gameID === "" ||
      this.queryParams.endpoint == null ||
      this.queryParams.endpoint === "" ||
      this.queryParams.playToken == null ||
      this.queryParams.playToken === ""
    ) {
      this.log("Invalid game params");
      return false;
    }
    return true;
  }

  triggerErrorModal(message: string) {
    this.onError(message);
  }

  login() {
    this.lastAction = RGS_ACTIONS.LOGIN;
    this.send({
      brandID: this.queryParams.brandID,
      fixedID: "",
      funReal: this.queryParams.funReal || -1,
      gameID: this.queryParams.gameID,
      requestType: RGS_ACTIONS.LOGIN,
      sessionID: this.queryParams.playToken,
      siteID: this.queryParams.siteID,
    });
  }

  lobby() {
    this.lastAction = RGS_ACTIONS.LOBBY;
    this.send({
      requestType: RGS_ACTIONS.LOBBY,
    });
  }

  join(roomTypeId: string) {
    this.lastAction = RGS_ACTIONS.JOIN;
    this.send({
      requestType: RGS_ACTIONS.JOIN,
      roomTypeId,
      roomId: null,
    });
  }

  handleLoginResponse(payload: any) {
    if (payload.playerDetails.fixedReference) {
      this.isLogged = true;
      this.sessionID = payload.playerDetails.fixedReference;
      this.resetHeartbeat();
    }
    return false;
  }

  bet(bets: BetItemType[]): void {
    if (!bets || bets.length === 0) return;

    this.lastAction = RGS_ACTIONS.GAME;
    this.send({
      requestType: RGS_ACTIONS.GAME,
      publicState: {
        action: "BET",
        payload: {
          bets,
        },
      },
    });
  }

  resetHeartbeat() {
    // stop
    this.stopHeartbeat();
    // start again
    this.startHeartbeat();
  }

  stopHeartbeat() {
    if (this.heartbeatHandle !== null) {
      clearTimeout(this.heartbeatHandle);
    }
  }

  startHeartbeat() {
    let nInterval = 20000;

    // stop if started
    if (this.heartbeatHandle !== null) {
      clearTimeout(this.heartbeatHandle);
    }

    this.heartbeatHandle = setTimeout(() => {
      if (this.sessionID) {
        this.send({
          requestType: RGS_ACTIONS.HEARTBEAT,
        });
      }
      // start again
      this.startHeartbeat();
    }, nInterval);
  }

  log(message: string) {
    if (!APP_LOG) return false;
    console.groupCollapsed(
      `%c ${this.name} :: INFO `,
      `background: blue; color: white; display: block;`
    );
    console.log(message);
    console.groupEnd();
  }
}
