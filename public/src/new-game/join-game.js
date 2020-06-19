import { gameConf } from "./create-new-game.js";
import { gameStatus } from "../firestore.js";
import * as domElements from "../index.js";

export function handleJoinButtonPressed() {
  // display game type
  domElements.gameType.textContent = "Joining an existing game";
  // show restart button
  domElements.restartGameCreate.classList.remove("hide");
  // hide join game button
  domElements.joinExistingGame.classList.add("hide");
  // show game id input and input value of player name if in local storage
  domElements.gameIdInput.classList.remove("hide");
  if (gameConf.playerName) {
    domElements.gameIdInput.player.value = gameConf.playerName;
  }
  // hide create game button
  domElements.hideCreateGame.classList.add("hide");
}

export function handleJoinExistingGame(e) {
  e.preventDefault();
  //save player input to playerName var
  gameConf.playerName = e.target.player.value;
  // set gameId var to id input value
  gameConf.gameId = e.target.id.value;
  // Check Game Status
  gameStatus(); // firestore
}
