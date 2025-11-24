export const isset = (_var: any) => {
  return typeof _var !== "undefined" || _var !== null;
};

export const animateStar = (): Promise<void> => {
  const betStarEl: HTMLDivElement = document.querySelector("#bet-star");
  const betButton = document.querySelector("#bet-button");
  const betCountEl = document.querySelector("#bets-counter");

  return new Promise<void>((resolve) => {
    if (!betStarEl || !betButton || !betCountEl) {
      resolve();
      return;
    }
    const betButtonRect = betButton.getBoundingClientRect();
    const betCountRect = betCountEl.closest("span").getBoundingClientRect();
    const startX = betCountRect.left + betCountRect.width / 2;
    const startY = betButtonRect.top + betButtonRect.height / 2;
    const endX = startX;
    const endY = betCountRect.top + betCountRect.height / 2;
    betStarEl.style.left = `${startX}px`;
    betStarEl.style.top = `${startY}px`;
    betStarEl.style.transform = "translate(0, 0) scale(1)";
    betStarEl.classList.remove("hide");
    requestAnimationFrame(() => {
      setTimeout(() => {
        const moveX = endX - startX;
        const moveY = endY - startY;
        betStarEl.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.5)`;
      }, 20);
    });
    setTimeout(() => {
      betStarEl.classList.add("hide");
      betStarEl.style.transform = "translate(0, 0) scale(1)";
      resolve();
    }, 750);
  });
};

export const getQueryParams = () =>
  new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop: any) => searchParams.get(prop),
  });
