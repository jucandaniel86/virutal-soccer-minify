type BetItemType = {
  matchId: string;
  outcome: string;
  odds: number;
};

interface BetOptionsInterface {
  onBetChange: (_payload: BetItemType[]) => void;
}

export default class BetOptions {
  bets: BetItemType[] = [];
  onBetChange = (_payload: BetItemType[]) => {};

  //html buttons
  betSingleBtn: HTMLButtonElement = null;
  betAccumulatorBtn: HTMLButtonElement = null;
  betBtn: HTMLButtonElement = null;

  //display values
  totalOutlay: HTMLElement = null;
  maxWin: HTMLElement = null;
  stakeInput: HTMLElement = null;
  betsCounter: HTMLElement = null;

  //accuulator types
  accumulator = [
    { counter: 2, label: "Double" },
    { counter: 3, label: "Treble" },
    { counter: 4, label: "4-Fold" },
    { counter: 5, label: "5-Fold" },
    { counter: 6, label: "6-Fold" },
    { counter: 7, label: "7-Fold" },
    { counter: 8, label: "8-Fold" },
    { counter: 9, label: "9-Fold" },
  ];

  constructor() {
    this.betSingleBtn = document.querySelector("#bet-type-singles");
    this.betAccumulatorBtn = document.querySelector("#bet-type-accumulator");
    this.totalOutlay = document.querySelector("#total-outlay");
    this.maxWin = document.querySelector("#max-win");
    this.stakeInput = document.querySelector(".stake-input");
    this.betsCounter = document.querySelector("#bets-counter");
    this.betBtn = document.querySelector("#bet-button");
  }

  init({ onBetChange }: BetOptionsInterface) {
    this.onBetChange = onBetChange;

    const Buttons = Array.from(document.querySelectorAll(".odds-selector"));
    Buttons.forEach((button) => {
      button.removeEventListener("click", this.handleBetSelect.bind(this));
      button.addEventListener("click", this.handleBetSelect.bind(this));
    });
  }

  private handleButtons() {
    this.betSingleBtn.disabled = this.bets.length === 0;
    this.betAccumulatorBtn.disabled = this.bets.length < 2;
    this.betBtn.disabled = this.bets.length === 0;

    this.betSingleBtn.textContent =
      this.bets.length > 0 ? `Singles X${this.bets.length}` : "Singles";

    if (this.bets.length === 0) {
      this.betSingleBtn.classList.remove("active");
      this.betAccumulatorBtn.classList.remove("active");
      this.betAccumulatorBtn.textContent = "Accumulator";
    }
    if (this.bets.length === 1) {
      this.betSingleBtn.classList.add("active");

      this.betAccumulatorBtn.classList.remove("active");
      this.betAccumulatorBtn.textContent = "Accumulator";
      return;
    }
    if (this.bets.length > 1) {
      this.betSingleBtn.classList.remove("active");
      this.betAccumulatorBtn.classList.add("active");
      const currentAccumulator = this.accumulator.find(
        (acc: any) => acc.counter === this.bets.length
      );

      if (currentAccumulator) {
        this.betAccumulatorBtn.textContent = currentAccumulator.label;
      }
    }
  }

  private resetOddsButtons() {
    Array.from(document.querySelectorAll(".odds-selector")).forEach((el) =>
      el.classList.remove("active")
    );
  }

  private handleBetSelect(payloadComponent: any) {
    const currentTarget = payloadComponent.target;
    if (!currentTarget) return;

    const { matchId, odds, outcome } = currentTarget.dataset;

    const matchFixture = currentTarget.closest(".match-fixture");
    const isAlreadySelected = currentTarget.classList.contains("active");

    const allButtonsInMatch = matchFixture.querySelectorAll(
      ".odds-buttons button"
    );
    allButtonsInMatch.forEach((btn: any) => btn.classList.remove("active"));

    const selectedBet = this.bets.findIndex((bet) => bet.matchId === matchId);
    if (selectedBet !== -1) {
      this.bets.splice(selectedBet, 1);
    }
    if (isAlreadySelected) {
    } else {
      currentTarget.classList.add("active");
      this.bets.push({
        matchId,
        outcome,
        odds,
      });
    }

    this.onBetChange(this.bets);
    this.handleButtons();
    this.updateCalculations();
  }

  public updateCalculations() {
    const selectionCount = this.bets.length;
    const stake = this.stakeInput.dataset.stake;
    let maxWin = 0;

    if (selectionCount === 0) {
      if (this.totalOutlay) this.totalOutlay.textContent = "0.00";
      if (this.maxWin) this.maxWin.textContent = "0.00";
      if (this.betsCounter) this.betsCounter.textContent = "0";
      return;
    }
    //@ts-ignore
    this.totalOutlay.textContent = (stake * selectionCount).toFixed(2);
    const productOfOdds = this.bets.reduce(
      (product, selection) => product * selection.odds,
      1
    );
    //@ts-ignore
    maxWin = productOfOdds * stake;

    this.maxWin.textContent = maxWin.toFixed(2);
    if (this.betsCounter) {
      this.betsCounter.textContent = String(this.bets.length);
    }
  }

  public resetBets() {
    this.bets = [];
    this.updateCalculations();
    this.onBetChange(this.bets);
    this.handleButtons();
    this.resetOddsButtons();
  }
}
