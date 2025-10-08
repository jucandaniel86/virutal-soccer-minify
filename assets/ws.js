const LOG = true;

export default class WS {
  queryParams = null;
  name = "WS: Connector";
  ws = null;
  connected = false;
  isLogged = true;
  sessionID = "";
  lastAction = null;
  hasError = false;

  constructor({ onReady, onSetup, onSetupReady, displayError, onResponse }) {
    this.queryParams = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    this.onReady = onReady;
    this.onSetup = onSetup;
    this.onSetupReady = onSetupReady;
    this.displayError = displayError;
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
    this.ws = new WebSocket(`wss://${this.queryParams.endpoint}/websocket`);
    this.ws.addEventListener("error", this.onError.bind(this));
    this.ws.addEventListener("close", this.onClose.bind(this));
    this.ws.addEventListener("message", this.onMessage.bind(this));
    this.ws.addEventListener("open", this.onOpen.bind(this));
  }

  onError(err) {
    this.triggerErrorModal("Websocket Error");
    this.log("[error]");
    this.connected = false;
  }

  isConnected() {
    if (this.ws !== undefined && this.ws.readyState === WebSocket.OPEN)
      return true;
    return false;
  }

  onClose(event) {
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

  send(_payload) {
    if (!this.isConnected()) {
      return this.log("[Sending error:: Server disconnected]");
    }
    this.ws.send(JSON.stringify(_payload));
  }

  onMessage(event) {
    const { response } = JSON.parse(event.data);
    if (!response) {
      return this.log("[Invalid Socket Response]");
    }

    if (response.error.errorCode !== 0) {
      this.triggerErrorModal(response.error.errorMessage);
      return;
    }
    this.onResponse(response);

    switch (this.lastAction) {
      case "LOGIN":
        return this.handleLoginResponse(response);

      case "SETUP":
        return this.onSetupReady(response);
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

  triggerErrorModal(message) {
    this.displayError(message);
  }

  login() {
    this.lastAction = "LOGIN";
    this.send({
      brandID: this.queryParams.brandID,
      fixedID: "",
      funReal: this.queryParams.funReal || -1,
      gameID: this.queryParams.gameID,
      requestType: "login",
      sessionID: this.queryParams.playToken,
      siteID: this.queryParams.siteID,
    });
  }

  handleLoginResponse(payload) {
    if (payload.playerDetails.sessionID) {
      this.isLogged = true;
      this.sessionID = payload.playerDetails.sessionID;
      this.onSetup();
    }
    return false;
  }

  setup() {
    if (!this.isConnected && !this.isLogged) {
      return this.log("[Invalid Login]");
    }
    this.lastAction = "SETUP";
    this.send({
      requestType: "game",
      bonusRef1: "",
      gameID: this.queryParams.gameID,
      padding: 20,
      sessionID: this.sessionID,
      publicState: {
        action: "INIT",
      },
      setup: false,
    });
  }

  log(message) {
    console.groupCollapsed(
      `%c ${this.name} :: INFO `,
      `background: blue; color: white; display: block;`
    );
    console.log(message);
    console.groupEnd();
  }
}
