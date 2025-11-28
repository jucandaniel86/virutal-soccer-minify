import { PlayerViewType } from "../config/app";

export default class ModalCore {
  private hiddenClass = "hide";
  private autoCloseTime = 2000;

  /**
   *
   * @param modalEl
   * @param message
   * @returns {void}
   */
  showModal(
    modalEl: HTMLDivElement,
    message: string = "",
    soft: boolean = false
  ): void {
    if (message && modalEl.querySelector("p")) {
      modalEl.querySelector("p").textContent = message;
    }
    const reloadBtn = document.querySelector("#reloadBtn");
    if (soft) {
      if (reloadBtn) {
        reloadBtn.classList.add(this.hiddenClass);
        modalEl.classList.add("soft");
      }
      setTimeout(() => {
        if (modalEl) modalEl.classList.remove(this.hiddenClass);
      }, 100);

      setTimeout(() => {
        if (modalEl) modalEl.classList.add(this.hiddenClass);
        if (modalEl) modalEl.classList.remove("soft");
      }, this.autoCloseTime);
      return;
    } else {
      if (reloadBtn) {
        reloadBtn.classList.remove(this.hiddenClass);
        modalEl.classList.remove("soft");
      }
      if (modalEl) modalEl.classList.remove(this.hiddenClass);
      return;
    }
  }

  /**
   *
   * @param message
   * @returns
   */
  showErrorModal(message: string, soft: boolean = false) {
    const modalEl: HTMLDivElement = document.querySelector("#error");
    if (!modalEl) return;

    this.showModal(modalEl, message, soft);
  }

  /**
   *
   * @param modalEl
   * @returns {void}
   */
  hideModal(modalEl: HTMLDivElement): void {
    if (modalEl) modalEl.classList.add(this.hiddenClass);
  }

  /**
   * @returns {void}
   */
  showBetModal(playerview: PlayerViewType): Promise<void> {
    const betModal: HTMLDivElement = document.querySelector("#bet-modal");
    const betModalClose = document.querySelector(".modal-close-btn");
    let message = "Bet Placed Successfully";
    if (
      playerview.roundBets &&
      Array.isArray(playerview.roundBets) &&
      playerview.roundBets.length > 0
    ) {
      const maxID = Math.max(...playerview.roundBets.map((el) => el.id));
      const currentBet = playerview.roundBets.find((el) => el.id === maxID);
      const betBoost = currentBet.betBoost;
      const calcBetBoost = (betBoost - 1) * 100;
      if (calcBetBoost > 0) {
        message = `Bet ${currentBet.id} has been ODDS BOOSTED by ${Number(
          calcBetBoost
        ).toFixed(2)}%`;
      }
    }

    if (
      playerview.outrightBets &&
      Array.isArray(playerview.outrightBets) &&
      playerview.outrightBets.length
    ) {
      message = "Outright Bet Placed Successfully";
    }

    this.showModal(betModal, message);

    return new Promise((resolve) => {
      if (betModalClose) {
        //@ts-ignore
        betModalClose.removeEventListener("click", this.hideModal);
        betModalClose.addEventListener("click", () => {
          this.hideModal(betModal);
          resolve();
        });
      }
      setTimeout(() => {
        this.hideModal(betModal);
        resolve();
      }, this.autoCloseTime);
    });
  }

  showBetHistory() {
    const betHistoryModal: HTMLDivElement =
      document.querySelector("#bet-history-modal");

    if (betHistoryModal) {
      this.showModal(betHistoryModal);
    }
  }
}
