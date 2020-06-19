import { gameConf } from "../new-game/create-new-game.js";
import { wait } from "../popup.js";
import { handleRestartGameCreate } from "../new-game/reset-game-create.js";
import { gameListener, firestoreDelete, firestoreMerge } from "../firestore.js";

// function generateLetter(gameData) {
//   const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   const letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
//   gameData.letter = letter;
// }

// TODO
// - Add a realtime listener to firestore game playing var
// - scores total function
// - stop the bus button - disables input on answers
// - Create exit game function that deletes game status and players

// Create Tabs plating sheet
// - only show players playing sheet until stop the bus presses.
// - function to listen for answers, save all answers to firestore when stop the bus pressed.
// - Remove snapshot listener when game closes

////// CREATE PLAYING SHEET //////

// Destroy El function
export async function destroyEl(el, ms = 10) {
  //playingSheetContainer.classList.remove("open");
  await wait(ms);
  // remove the popup entirely!
  el.remove();
  /* eslint-disable no-param-reassign */
  el = null;
  /* eslint-enable no-param-reassign */
}

// Playing Sheet HTML and Cats
export function playingSheetEL(gameData, localPlayer, remotePlayers) {
  // console.log("creating Playing Sheet");
  // console.log(gameData);
  // console.log(remotePlayers);
  // console.log(localPlayer);

  // Get the Categories save to localPlayingData
  let localPlayingData = gameData.categories.map((category, i) => {
    return {
      [i]: {
        category,
        answer: `answer`,
        points: `score`,
      },
    };
  });

  // Create Main Container
  const playingSheetContainer = document.createElement("div");
  playingSheetContainer.classList.add("playing-sheet-container");

  ///// CREATE SHEET HEADER ELEMENTS //////
  // Create Sheet Header
  const playingSheetHeaderContainer = document.createElement("div");
  playingSheetHeaderContainer.classList.add("playing-sheet-header");
  playingSheetContainer.appendChild(playingSheetHeaderContainer);

  // Create Sheet Title
  const sheetTitle = document.createElement("h2");
  sheetTitle.classList.add("sheet-title");
  sheetTitle.textContent = "Stop The Bus!";
  playingSheetHeaderContainer.appendChild(sheetTitle);

  // Create Letter Container
  const letterContainer = document.createElement("div");
  letterContainer.classList.add("letter-container");
  letterContainer.innerHTML = `<h2>The Letter Is</h2><div class="playing-letter"><p>${gameData.letter}</p></div>`;
  playingSheetHeaderContainer.appendChild(letterContainer);

  // Create Sheet Buttons Container
  const headerButtonsContainer = document.createElement("div");
  headerButtonsContainer.classList.add("buttons-container");
  playingSheetHeaderContainer.appendChild(headerButtonsContainer);

  // Create Regenerate Letter Button
  const newLetterButton = document.createElement("button");
  newLetterButton.classList.add("button");
  newLetterButton.textContent = "Change Letter";
  newLetterButton.type = "button";
  headerButtonsContainer.appendChild(newLetterButton);

  // Create Play Again button
  const playAgainButton = document.createElement("button");
  playAgainButton.classList.add("button");
  playAgainButton.type = "button";
  playAgainButton.textContent = "Play Again";
  headerButtonsContainer.appendChild(playAgainButton);

  // Create Quit button
  const finishGameButton = document.createElement("button");
  finishGameButton.classList.add("button");
  finishGameButton.classList.add("quit");
  finishGameButton.type = "button";
  finishGameButton.textContent = "Quit";
  headerButtonsContainer.appendChild(finishGameButton);

  ///// Create SHEETS ELEMENTS //////
  // Create Tabs Container
  const sheetTabs = document.createElement("div");
  sheetTabs.classList.add("tabs");
  playingSheetContainer.appendChild(sheetTabs);

  // Create Sheet tablist
  const sheetTabList = document.createElement("div");
  sheetTabList.setAttribute("role", "tablist");
  sheetTabList.setAttribute("aria-label", "Players");
  sheetTabs.appendChild(sheetTabList);

  // Create tablist tab button for local player
  const localTab = document.createElement("button");
  localTab.setAttribute("role", "tab-local");
  localTab.id = "local-player";
  localTab.setAttribute("aria-selected", true);
  console.log(localPlayer);
  localTab.innerHTML = `<h2>${localPlayer[0].name}</h2>`;
  sheetTabList.appendChild(localTab);

  // Create tablist tab buttons for remote players, need to change to remote players array and filter out local player
  if (remotePlayers.length) {
    remotePlayers.forEach((remotePlayer, i) => {
      const tabs = document.createElement("button");
      tabs.setAttribute("role", "tab-remote");
      tabs.id = `player${i + 2}`;
      tabs.innerHTML = `<h2>${remotePlayer.name}</h2>`;
      sheetTabList.appendChild(tabs);
    });
  }

  // Create Local tabpanel
  const tabPanelLocal = document.createElement("div");
  let localGameHTML = `<div class="sheet-header"><h2>Categories</h2></div>
  <div class="sheet-header"><h2>Answers</h2></div>
  <div class="sheet-header"><h2>Points</h2></div>`;
  localGameHTML += localPlayingData
    .map((data, i) => {
      return `
      <div class="sheet-cats sheet-cats${i + 1}"><h3>${
        data[i].category
      }</h3></div>
      <input
        class="sheet-answers sheet-answers${i + 1}"
        name="sheet-answer${i + 1}"
       placeholder="${data[i].answer}"
     />
      <input
       class="sheet-points sheet-points${i + 1}"
       name="sheet-points${i + 1}"
       placeholder="${data[i].points}"
      />`;
    })
    .join("");
  tabPanelLocal.classList.add("local-tabpanel");
  tabPanelLocal.classList.add("tabpanel");
  tabPanelLocal.setAttribute("role", "tabpanel");
  tabPanelLocal.setAttribute("aria-labelledby", "local-player");
  tabPanelLocal.innerHTML = localGameHTML; // Change to playing sheet
  sheetTabs.appendChild(tabPanelLocal);

  // Create Remote tabpanels
  const otherPlayers = gameData.players.filter(
    (player) => player !== gameConf.playerId
  );
  otherPlayers.forEach((player, i) => {
    // remove inputs, replace with textContent for answers and score
    let remoteGameHTML = `<div class="sheet-header"><h2>Categories</h2></div>
      <div class="sheet-header"><h2>Answers</h2></div>
      <div class="sheet-header"><h2>Points</h2></div>`;
    remoteGameHTML += localPlayingData
      .map((data, i) => {
        return `
      <div class="sheet-cats sheet-cats${i + 1}"><h3>${
          data[i].category
        }</h3></div>
      <input
        class="sheet-answers sheet-answers${i + 1}"
        name="sheet-answer${i + 1}"
       placeholder="${data[i].answer}"
     />
      <input
       class="sheet-points sheet-points${i + 1}"
       name="sheet-points${i + 1}"
       placeholder="${data[i].points}"
      />`;
      })
      .join("");
    const tabPanelsRemote = document.createElement("div");
    tabPanelsRemote.classList.add("remote-tabpanel");
    tabPanelsRemote.classList.add("tabpanel");
    tabPanelsRemote.setAttribute("role", "tabpanel");
    tabPanelsRemote.setAttribute("aria-labelledby", `player${i + 2}`);
    tabPanelsRemote.setAttribute("hidden", true);
    tabPanelsRemote.innerHTML = remoteGameHTML;
    sheetTabs.appendChild(tabPanelsRemote);
  });

  ////// APPEND ELEMENTS TO BODY //////
  document.body.appendChild(playingSheetContainer);
  async function openContainer() {
    await wait(10);
    sheetTabs.classList.add("open");
  }
  openContainer();

  console.log(gameData);
  ////// PLAYER TABS LOGIC //////
  const tabButtonsRemote = sheetTabs.querySelectorAll("[role = 'tab-remote']");
  const tabPanels = Array.from(
    sheetTabs.querySelectorAll("[role = 'tabpanel']")
  );

  function handleTabClick(event) {
    // hide all tab panels
    tabPanels.forEach((panel) => {
      panel.hidden = true;
    });
    localTab.setAttribute("aria-selected", false);
    // mark all tabs as unselected
    tabButtonsRemote.forEach((tab) => {
      tab.setAttribute("aria-selected", false);
    });
    // mark the clicked tab as selected
    event.currentTarget.setAttribute("aria-selected", true);
    // find the associated tab panel and show it
    const { id } = event.currentTarget;
    console.log(event.currentTarget);
    console.log(tabPanels);
    const tabPanel = tabPanels.find(
      (panel) => panel.getAttribute("aria-labelledby") === id
    );
    console.log(tabPanel);
    tabPanel.hidden = false;
  }
  // Tabs event listeners
  localTab.addEventListener("click", handleTabClick);
  tabButtonsRemote.forEach((button) => {
    button.addEventListener("click", handleTabClick);
  });

  ////// GENERATE A NEW LETTER BUTTON //////
  function handleGenNewLetter(gameData) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    gameData.letter = letter;
    letterContainer.innerHTML = `<h2>The Letter Is</h2><div class="playing-letter"><p>${gameData.letter}</p></div>`;
  }
  newLetterButton.addEventListener("click", handleGenNewLetter);

  ////// PLAY AGAIN BUTTON //////
  function handlePlayAgain() {
    destroyEl(playingSheetContainer);
    gameListener(gameData, localPlayer, remotePlayers);
  }
  playAgainButton.addEventListener("click", handlePlayAgain);

  ////// QUIT BUTTON //////
  function handleQuitGame() {
    // hide background els
    const headerEl = document.querySelector("header");
    const mainEl = document.querySelector("main");
    headerEl.classList.remove("hide");
    mainEl.classList.remove("hide");
    // Delete Game from stopTheBus Doc in firestore
    firestoreDelete("stopTheBus", gameData.gameId);
    // Set Players array to empty in Game Doc firestore
    firestoreMerge("players", gameConf.playerId, { currentGameId: null });
    // set gameData to null
    gameData = null;

    destroyEl(playingSheetContainer);
    handleRestartGameCreate();
    console.log(gameData);
    // Need condition for when player has left without quitting, (delete player after no activity?)
  }
  finishGameButton.addEventListener("click", handleQuitGame);
}

// Deal with Score and Answers Below
const pointsInputs = Array.from(document.querySelectorAll(".sheet-points"));

export function sheetAnswers() {
  const answerInputs = Array.from(document.querySelectorAll(".sheet-answers"));
  answerInputs.forEach((answer, i) => {
    answer.addEventListener("input", (e) => {
      // do I need this is submitting all values on stop the bus button best bet, and save in an array.
      // then another button for submitting points.
      // then save these to firestore
      // below outputs input value and iterator, push values to an array
      console.log(e.target.value, i);
      console.log(answer);
      // doesn't work gives new values for each key press.
      answer = { [i]: e.target.value };
      console.log(answer);
    });
  });
}
