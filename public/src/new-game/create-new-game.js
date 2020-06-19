//import { restorePlayerLocalData } from "./player-data";

import {
  handleSaveNewGameToFireStore,
  checkIfGameIdExists,
} from "../firestore.js";

import * as domElements from "../index.js";

export let gameConf = {};

// Callback to start configuring a new game
export function handleStartNewGame() {
  // get input for player name and add value
  //const playerInputValue = document.querySelector(".player");
  if (gameConf.playerName) {
    domElements.newGameDetails.player.value = gameConf.playerName;
  }
  // show restart button
  domElements.restartGameCreate.classList.remove("hide");
  domElements.gameType.textContent = "Creating a new game";
  // hide join game elements
  domElements.newGameSelected.classList.add("hide");
  domElements.joinExistingGame.parentElement.classList.add("hide");
  // generate random game id
  gameConf.gameId = Math.floor(Math.random() * 16777215).toString(16);
  // Display category selection
  domElements.newGameDetails.classList.remove("hide");

  // create team and categories event
  domElements.newGameDetails.addEventListener("submit", handleCreateGame);
}

// Callback to handle category generation and game config messages
export function handleCreateGame(e) {
  e.preventDefault();
  // check if game ids exists
  checkIfGameIdExists();
  // Hide Create Game Input Fields
  domElements.newGameDetails.classList.add("hide");
  //save player input to playerName var
  gameConf.playerName = e.target.player.value;
  // save category input to string, convert to array and save in global var.
  const catsString = e.target.cats.value;
  const catsArray = catsString.split(",");
  gameConf.categoriesArray = catsArray;
  // add player name to new game output title
  domElements.gameDetailsTitle.innerHTML = `Hi ${gameConf.playerName}, are you happy with your categories?`;
  // create html for category list
  let catsHTML = ``;
  if (catsString) {
    catsArray.forEach((cat, i) => {
      const catNo = (i + 1).toString();
      catsHTML += `<li>${catNo} - ${cat}</li>`;
    });
    domElements.categoriesOutput.innerHTML = catsHTML;
    // show categories confirm message
    domElements.categoriesOutput.parentElement.classList.remove("hide");
    // save game id to string and output message
    const idString = `<h2>Game ID - ${gameConf.gameId}</h2><p>Send the game ID above to the other players and ask them to join your game.</p><p>Click below to create your game, then you can play straight away or join the game later using your game ID</p><h3>Have Fun!!</h3>`;
    domElements.gameIDOutput.innerHTML = idString;
    // Show Save Game Button that saves to firestore
    domElements.saveNewGameToFireStore.classList.remove("hide");
    // listen to changeGameDetails button
    domElements.changeGameDetails.addEventListener(
      "click",
      () => {
        domElements.newGameDetails.classList.remove("hide");
      },
      { once: true }
    );
  }
  // Event listener to save new game to firestore
  domElements.saveNewGameToFireStore.addEventListener(
    "click",
    handleSaveNewGameToFireStore
  );
}
