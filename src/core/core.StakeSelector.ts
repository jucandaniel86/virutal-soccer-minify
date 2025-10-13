type CreditResponse = {
  currency: string;
  amount: number;
  decimalPrecision: number;
};

interface StakeSelectorInitI {
  stakeValues: number[];
  defaultStake: number;
  credit: CreditResponse;
}

export default class StakeSelector {
  private stakes: number[] = [];
  private stakeIndex: number = 0;

  //inputs
  private stakeInput!: HTMLInputElement;
  private stakeUp!: HTMLInputElement;
  private stakeDown!: HTMLInputElement;

  //websocket rgs vars
  private currency: string = "";
  private decimalPrecision: number = 2;

  //callbacks
  onStakeChange: (stake: any) => {};

  constructor({ onStakeChange }: any) {
    this.onStakeChange = onStakeChange;
  }

  /**
   *
   * @param payload
   * @returns {void}
   */
  init(payload: StakeSelectorInitI): void {
    //init dom elements
    this.stakeInput = document.querySelector(".stake-input");
    this.stakeUp = document.querySelector(".stake-up");
    this.stakeDown = document.querySelector(".stake-down");

    //init vars
    this.currency = payload.credit.currency;
    this.decimalPrecision = payload.credit.decimalPrecision;

    if (
      payload.stakeValues &&
      Array.isArray(payload.stakeValues) &&
      payload.stakeValues.length > 0
    ) {
      this.stakes = payload.stakeValues;

      if (payload.defaultStake) {
        this.stakeIndex = this.stakes.findIndex(
          (stake) => stake === payload.defaultStake
        );
        this.changeStake(this.stakeIndex);
      }
    }

    //init html events
    this.setStakeSelectorActions();
  }

  changeStake = (index: number) => {
    if (!this.stakeInput) return;

    const amount = String(this.stakes[index] || 0);

    const formatedBalance = `${this.currency} ${parseFloat(amount).toFixed(
      this.decimalPrecision
    )}`;

    this.stakeInput.innerHTML = formatedBalance;
    this.stakeInput.dataset.stake = parseFloat(amount).toFixed(
      this.decimalPrecision
    );

    this.onStakeChange(parseFloat(amount).toFixed(this.decimalPrecision));
  };

  setStakesButtonsState() {
    if (this.stakeIndex === 0) {
      this.stakeUp.disabled = true;
    } else {
      this.stakeUp.disabled = false;
    }
    if (this.stakeIndex === this.stakes.length - 1) {
      this.stakeDown.disabled = true;
    } else {
      this.stakeDown.disabled = false;
    }
  }

  prevStakes() {
    if (this.stakeIndex - 1 >= 0) {
      this.stakeIndex = this.stakeIndex - 1;
      this.changeStake(this.stakeIndex);
      this.setStakesButtonsState();
    }
  }

  nextStakes() {
    if (this.stakeIndex + 1 < this.stakes.length) {
      this.stakeIndex = this.stakeIndex + 1;
      this.changeStake(this.stakeIndex);
      this.setStakesButtonsState();
    }
  }

  setStakeSelectorActions = () => {
    this.stakeUp.addEventListener("click", this.prevStakes.bind(this));
    this.stakeDown.addEventListener("click", this.nextStakes.bind(this));
  };

  getCurrentStake = () => {
    return this.stakes[this.stakeIndex];
  };
}
