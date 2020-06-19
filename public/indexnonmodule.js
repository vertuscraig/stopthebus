////// CREATE FIRESTORE VARIABLE //////
const db = firebase.firestore();
// firestore db structure
//     1 - GAME ID
//       2 - Players
//         3 - Categories
//         4 - Answers
//         5 - Score

////// GLOBAL VARIABLES //////

// Create global game id var
let gameId = "";
let gameData;
let playingData = {};
let gameSheetHTML = `<div class="sheet-header">Categories</div>
<div class="sheet-header">Answers</div>
<div class="sheet-header">Points</div>`;
// Create global categories var.
let categoriesArray = [];

// CREATE global PLAYER VARS
const playerID = Math.floor(Math.random() * 16777215).toString(16);
let playerName = "";
let totalPlayers = null;
let answers = {};

// function to store player to firebase.
function createPlayer() {
  db.collection("players")
    .doc(playerID)
    .set({
      name: playerName,
      answers: [],
    })
    .then(function () {
      console.log("Document successfully written!");
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}

////// CREATE A NEW GAME //////

// DOM Elements
const newGameSelected = document.querySelector(".new-game");
const gameIDOutput = document.querySelector(".new-game-id");
const newGameDetails = document.querySelector("[name='new-game-details']");
const categoriesOutput = document.querySelector(".category-output");
const gameDetailsTitle = document.querySelector(".game-details-output-title");
const changeGameDetails = document.querySelector(".change-game-details");
const saveToFireStoreButton = document.querySelector(".confirm-game");
const restartGameCreate = document.querySelector(".restart");
const gameType = document.querySelector(".game-type");

// Callback to start configuring a new game
function handleStartNewGame() {
  // show restart button
  restartGameCreate.classList.remove("hide");
  gameType.textContent = "Creating a new game";
  // hide join game elements
  newGameSelected.classList.add("hide");
  joinExistingGame.parentElement.classList.add("hide");
  // generate random id and save to global var
  const id = Math.floor(Math.random() * 16777215).toString(16);
  gameId = id;
  // Display category selection
  newGameDetails.classList.remove("hide");
}

// Callback to handle category generation and game config messages
// to do - change config message to a pop up with confirm to save to firestore
function handleCreateGame(e) {
  e.preventDefault();
  // Hide Create Game Input Fields
  newGameDetails.classList.add("hide");
  //save player input to playerName var
  playerName = e.target.player.value;
  // save category input to string, convert to array and save in global var.
  const catsString = e.target.cats.value;
  const catsArray = catsString.split(",");
  categoriesArray = catsArray;
  // add player name to new game output title
  gameDetailsTitle.innerHTML = `Hi ${playerName}, are you happy with your categories?`;
  // create html for category list
  let catsHTML = ``;
  if (catsString) {
    catsArray.forEach((cat, i) => {
      const catNo = (i + 1).toString();
      catsHTML += `<li>${catNo} - ${cat}</li>`;
    });
    categoriesOutput.innerHTML = catsHTML;
    // show categories confirm message
    categoriesOutput.parentElement.classList.remove("hide");
    // save game id to string and output message
    const idString = `<h2>Game ID - ${gameId}</h2><p>Send the game ID above to the other players and ask them to join your game.</p><p>Click below to create your game, then you can play straight away or join the game later using your game ID</p><h3>Have Fun!!</h3>`;
    gameIDOutput.innerHTML = idString;
    // Show Save Game Button that saves to firestore
    saveToFireStoreButton.classList.remove("hide");
    // listen to changeGameDetails button
    changeGameDetails.addEventListener("click", () => {
      newGameDetails.classList.remove("hide");
    });
  }
}

function handleSaveToFireStore() {
  console.log("saving to fireStore");
  // create the game and categories in firestore
  db.collection("games")
    .doc(gameId)
    .set({
      players: [playerID],
      categories: categoriesArray,
    })
    .then(function () {
      console.log("Document successfully written!");
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });

  // call create player function
  createPlayer();
}
// new game event listener
newGameSelected.addEventListener("click", handleStartNewGame);
// selected categories event
newGameDetails.addEventListener("submit", handleCreateGame);
// saveToFirestore event listener
saveToFireStoreButton.addEventListener("click", handleSaveToFireStore);

////// JOIN EXISTING GAME ////////

// DOM Elements
const joinExistingGame = document.querySelector(".join-game");
const gameIdInput = document.querySelector(".input-game-id");
const hideCreateGame = document.querySelector(".create-new-game");
const idErrMessage = document.querySelector(".id-err");

function handleJoinButtonPressed() {
  // display game type
  gameType.textContent = "Joining an existing game";
  // show restart button
  restartGameCreate.classList.remove("hide");
  // hide join game button
  joinExistingGame.classList.add("hide");
  // show game id input
  gameIdInput.classList.remove("hide");
  // hide create game button
  hideCreateGame.classList.add("hide");
  console.log(gameIdInput);
}

function handleJoinExistingGame(e) {
  e.preventDefault();
  // reset error message
  idErrMessage.textContent = "";
  //save player input to playerName var
  playerName = e.target.player.value;
  // set gameId var to id input value
  gameId = e.target.id.value;

  //firestore game document ref
  const gameRef = db.collection("games").doc(gameId);

  // Get Game Data
  gameRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        // Create Player
        createPlayer();
        // Add new player to players array;
        gameRef.update({
          players: firebase.firestore.FieldValue.arrayUnion(playerID),
        });
        gameData = doc.data();
        console.log(gameData);
        createGameSheet(gameData);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        idErrMessage.textContent = "Game doesn't exist, try again";
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
      idErrMessage.textContent = `Error getting document: ${error}`;
    });
}

// listen for join game click
joinExistingGame.addEventListener("click", handleJoinButtonPressed);
// listen for game ID input
gameIdInput.addEventListener("submit", handleJoinExistingGame);

// To do - enter a game id from another player that looks for a db in firestore and request the player can join the game.
// need to listen for new player being added to firestore and request permission.

// Callback to handle reset game create for new and existing games
function handleRestartGameCreate() {
  restartGameCreate.classList.add("hide");
  newGameSelected.classList.remove("hide");
  joinExistingGame.parentElement.classList.remove("hide");
  joinExistingGame.classList.remove("hide");
  newGameDetails.classList.add("hide");
  categoriesOutput.parentElement.classList.add("hide");
  hideCreateGame.classList.remove("hide");
  gameIdInput.classList.add("hide");
  saveToFireStoreButton.classList.add("hide");
  gameId = "";
  gameIDOutput.textContent = "";
  newGameDetails.cats.value = "";
  gameType.textContent = "";
}

// resetGameCreate event Listener
restartGameCreate.addEventListener("click", handleRestartGameCreate);
// To Do Get the Players and add to firestore

////// CREATE GAME SHEET //////
function createGameSheet(data) {
  // get game sheet elements from DOM
  const gameSheetContainer = document.querySelector(".play-game");
  const gameTeam = document.querySelector(".team-name");
  const gameSheet = document.querySelector(".game-sheet");

  gameTeam.textContent = playerName;

  const gameSheetObject = {};
  // Players
  data.players.forEach((player, i) => {
    //console.log(player, i);
  });
  // categories
  playingData = data.categories.map((category, i) => {
    return {
      [i]: {
        category,
        answer: `answer`,
        points: `score`,
      },
    };
  });

  gameSheetHTML += playingData
    .map((data, i) => {
      return `
      <div class="sheet-cats sheet-cats${i + 1}">${data[i].category}</div>
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

  gameSheet.innerHTML = gameSheetHTML;
  gameSheetContainer.classList.remove("hide");

  // Add Event listeners to sheet inputs
  // ToDo - on the game form inputs add an event listeners using a forEach on answer inputs and points input.
  const answerInputs = Array.from(document.querySelectorAll(".sheet-answers"));
  const pointsInputs = Array.from(document.querySelectorAll(".sheet-points"));
  answerInputs.forEach((answer, i) => {
    answer.addEventListener("input", (e) => {
      // do I need this is submitting all values on stop the bus button best bet, and save in an array.
      // then another button for submitting points.
      // then save these to firestore
      // below outputs input value and iterator, push values to an array
      console.log(e.target.value, i);
      console.log(answers);
      // doesn't work gives new values for each key press.
      answers = { [i]: e.target.value };
      console.log(answers);
    });
  });
}

// GENERATE A LETTER //
// Get the letter container
const getLetter = document.querySelector(".gen-letter");
// getLetter event callback
function pickALetter(e) {
  const el = e.currentTarget;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  el.textContent = letter;
  el.classList.add("large");
}

// EVENT LISTENERS //
// DOM loaded for firebase
//document.addEventListener("DOMContentLoaded", firestoreCB);
// getLetter event
getLetter.addEventListener("click", pickALetter);
