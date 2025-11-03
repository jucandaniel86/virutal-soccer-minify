export default class ModalCore {
  private hiddenClass = "hide";

  /**
   *
   * @param modalEl
   * @param message
   * @returns {void}
   */
  showModal(modalEl: HTMLDivElement, message: string = ""): void {
    if (message && modalEl.querySelector("p")) {
      modalEl.querySelector("p").textContent = message;
    }
    if (modalEl) modalEl.classList.remove(this.hiddenClass);
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
  showBetModal(): Promise<void> {
    const betModal: HTMLDivElement = document.querySelector("#bet-modal");
    const betModalClose = document.querySelector(".modal-close-btn");

    this.showModal(betModal, "Bet Placed Successfully");

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
      }, 2000);
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
