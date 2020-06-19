import * as domElements from "../index.js";
import { gameConf } from "./create-new-game.js";

export function handleRestartGameCreate() {
  gameConf.gameId = "";
  domElements.restartGameCreate.classList.add("hide");
  domElements.newGameSelected.classList.remove("hide");
  domElements.joinExistingGame.parentElement.classList.remove("hide");
  domElements.joinExistingGame.classList.remove("hide");
  domElements.newGameDetails.classList.add("hide");
  domElements.categoriesOutput.parentElement.classList.add("hide");
  domElements.hideCreateGame.classList.remove("hide");
  domElements.gameIdInput.classList.add("hide");
  domElements.saveNewGameToFireStore.classList.add("hide");
  domElements.gameIDOutput.textContent = "";
  domElements.newGameDetails.cats.value = "";
  domElements.gameType.textContent = "";
  gameConf.gameId = null;
}
