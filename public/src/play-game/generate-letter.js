import { letterListener, firestoreUpdate } from "../firestore.js";

export function getLetter(gameData, localPlayer, remotePlayers) {
  // create playing container for rest of game
  // Create Main Container
  const letterContainer = document.createElement("div");
  letterContainer.classList.add("letter-container");

  // Create Letter Container
  const letterContainerEl = document.createElement("div");
  letterContainerEl.classList.add("letter");
  letterContainerEl.innerHTML = `<h2>The Letter Is</h2><div class="playing-letter"><p>${gameData.letter}</p></div>`;
  letterContainer.appendChild(letterContainerEl);

  // Create letter button
  const newLetterButton = document.createElement("button");
  newLetterButton.classList.add("button");
  newLetterButton.textContent = "Change Letter";
  newLetterButton.type = "button";
  letterContainer.appendChild(newLetterButton);

  // Create letter button
  const startTheBusButton = document.createElement("button");
  startTheBusButton.classList.add("button");
  startTheBusButton.textContent = "Start The Bus!";
  startTheBusButton.type = "button";
  letterContainer.appendChild(startTheBusButton);

  // TODO ADD QUIT BUTTON THAT CLEARS LOCAL PLAYER DATA
  // Append playing container to body
  document.body.appendChild(letterContainer);

  ////// EVENT LISTENERS & HANDLERS //////
  // Get a new letter
  function handleGenNewLetter(gameData) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    gameData.letter = letter;
    firestoreUpdate("games", gameConf.gameId, { letter });
    letterContainerEl.innerHTML = `<h2>The Letter Is</h2><div class="playing-letter"><p>${gameData.letter}</p></div>`;
  }
  newLetterButton.addEventListener("click", handleGenNewLetter);

  // Start the bus
  function handleStartTheBus(gameData, localPlayer, remotePlayers) {
    console.log("Start the bus!");
  }
  startTheBusButton.addEventListener("click", handleStartTheBus);
}
