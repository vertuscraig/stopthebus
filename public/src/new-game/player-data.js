import { gameConf } from "./create-new-game.js";

export function restorePlayerLocalData() {
  const playerId = localStorage.getItem("playerId");
  const playerName = localStorage.getItem("playerName");
  if (playerId) {
    gameConf.playerId = playerId;
    gameConf.playerName = playerName;
    console.log(gameConf.playerId, gameConf.playerName);
  } else {
    console.log("nothing in local storage!!");
  }

  // pull the items from LS
  // const lsItems = JSON.parse(localStorage.getItem("items"));
  // if (lsItems.length) {
  //   // items = lsItems;
  //   // lsItems.forEach(item => items.push(item));
  //   // items.push(lsItems[0], lsItems[1]);
  //   items.push(...lsItems);
  //   list.dispatchEvent(new CustomEvent("itemsUpdated"));
  // }
}
