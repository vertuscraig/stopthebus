import { gameConf } from "./new-game/create-new-game.js";
import { ask } from "./popup.js";
import { handleRestartGameCreate } from "./new-game/reset-game-create.js";
import { idErrMessage } from "./index.js";
import { filterPlayerData } from "./play-game/start-game.js";
import { playingSheetEL, destroyEl } from "./play-game/playing-sheet.js";

////// CREATE FIRESTORE VARIABLES //////
const db = firebase.firestore();

//////****** FIRESTORE UTILITY FUNCTIONS ******//////
////// DELETE DATA FROM FIRESTORE//////
export function firestoreDelete(collection, doc) {
  db.collection(collection)
    .doc(doc)
    .delete()
    .then(function () {
      console.log("Document successfully deleted!");
    })
    .catch(function (error) {
      console.error("Error removing document: ", error);
    });
}

////// MERGE VALUE IN FIRESTORE DOC HIGHER ORDER FUNCTION //////
export function firestoreMerge(collection, doc, data) {
  db.collection(collection).doc(doc).set(data, { merge: true });
}

//////****** FUNCTION TO CHECK IF GAME ID ALREADY EXIST IN FIRESTORE ******//////
////// RUNS BEFORE WRITING GAME DATA TO FIRESTORE //////
export function checkIfGameIdExists() {
  const gameRef = db.collection("games").doc(gameConf.gameId);
  gameRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        gameConf.gameId = Math.floor(Math.random() * 16777215).toString(16);
      } else {
        return;
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
      idErrMessage.textContent = `Error getting document: ${error}`;
    });
}

// store new player to firebase and local storage.
function createPlayer() {
  // create playerId if not in local and save name and id to local storage
  console.log(gameConf);
  if (!gameConf.playerId) {
    gameConf.playerId = Date.now().toString();
    localStorage.setItem("playerId", gameConf.playerId);
    localStorage.setItem("playerName", gameConf.playerName);
  }
  if (gameConf.playerName !== localStorage.getItem("playerName")) {
    localStorage.setItem("playerName", gameConf.playerName);
  }

  db.collection("players")
    .doc(gameConf.playerId)
    .set({
      name: gameConf.playerName,
      answers: [],
      score: [],
      playerId: gameConf.playerId,
      // add saved categories and games later
    })
    // .then(function () {
    //   console.log("Document successfully written!");
    // })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}

////// SAVE NEW GAME TO FIRESTORE //////
export function handleSaveNewGameToFireStore() {
  // create player if doesn't exist
  if (!gameConf.playerId) {
    createPlayer();
  }
  //create the game and categories in firestore
  db.collection("games")
    .doc(gameConf.gameId)
    .set({
      categories: gameConf.categoriesArray,
      owner: gameConf.playerId,
      created: new Date(),
    })
    .then(function () {
      // start game now or join later popup
      const startGame = ask({
        buttons: [
          { class: "play-now", text: "Play Now", data: "play" },
          { class: "join-later", text: "Join Later", data: "join" },
        ],
        textContent: `<h3>Game Stored Successfully:</h3><h2>Game ID - ${gameConf.gameId}</h2>
        <p>Do you want to join now or later?</p>
        <p class="small">(remember your Game ID if playing later)</p>`,
      });
      startGame.then(function (status) {
        if (status === "join") {
          handleRestartGameCreate();
        } else {
          joinFirestoreGame();
        }
      });
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}
////// GAME STATUS //////
// CHECK IF GAME IS STARTED AND RETURN GAME STARTED MSG OR JOIN GAME
export function gameStatus() {
  const playingRef = db.collection("stopTheBus").doc(gameConf.gameId);
  playingRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        gameConf.gameStatus = doc.data().playing;
        if (gameConf.gameStatus === true) {
          const gameAlreadyStarted = ask({
            buttons: [{ class: "quit", text: "Quit", data: "quit" }],
            textContent: `<h2>Sorry, This game has already started!</h2>
              <h3>Try again later or ask the other players to quit and start again</h3>`,
          });
          handleRestartGameCreate();
          gameAlreadyStarted.then(function (status) {
            if (status === "quit") {
              handleRestartGameCreate();
            }
          });
        } else {
          joinFirestoreGame();
        }
      } else {
        // doc.data() will be undefined in this case
        joinFirestoreGame();
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });
}

////// JOIN FIRESTORE GAME //////
////// JOIN AN EXISTING FIRESTORE GAME, GET DATA, SAVE PLAYER AND RESET ANSWERS
export function joinFirestoreGame() {
  let gameData = {};
  const gameRef = db.collection("games").doc(gameConf.gameId);
  const playerRef = db.collection("players").doc(gameConf.playerId);
  //console.log("Joining A Game");
  // Create Player and update players array
  createPlayer();
  gameRef.update({
    players: firebase.firestore.FieldValue.arrayUnion(gameConf.playerId),
  });
  playerRef.update({
    currentGameId: gameConf.gameId,
  });
  // Get the game data from firestore
  gameRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        //console.log("This one:", doc.data());
        gameData = doc.data();
        gameData.gameId = gameConf.gameId;
        gameData.answers = [];
        console.log(gameData);
        playerListener(gameData);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });
}

////// PLAYER LISTENER //////
////// LISTEN FOR CHANGES IN THE GAME PLAYERS //////
export function playerListener(gameData) {
  const gameRef = db.collection("games").doc(gameConf.gameId);
  // create player data var
  let playerData = null;
  // Listen to Game Data on firestore for realtime changes
  gameRef.onSnapshot(function (doc) {
    if (doc.exists) {
      //var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      // console.log(source, " data: ", doc.data());
      // updates the players data when firestore receives realtime data, i.e. another player joins.
      db.collection("players")
        .where("currentGameId", "==", gameData.gameId)
        .get()
        .then(function (querySnapshot) {
          playerData = [];
          querySnapshot.forEach(function (doc) {
            return playerData.push({ ...doc.data() });
            // git first - incorporate filter player data into this foreach and check data as it arrives. function commented below
          });
        })
        .then(function () {
          filterPlayerData(gameData, playerData); // Start Game File
        })
        .catch(function (error) {
          console.log("Error getting documents: ", error);
        });
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
      idErrMessage.textContent = "Game doesn't exist, try again";
    }
  });
  //filterPlayerData(gameData, playerData);
}

// function filterPlayerData(gameData, playerData) {
//   // called from firestore
//   const localPlayer = playerData.filter(
//     (player) => player.playerId === gameConf.playerId
//   );
//   //console.log("Local Player Data-", localPlayer);
//   // Get rest of player data
//   const remotePlayers = playerData
//     .map((UnfilteredPlayer) => {
//       if (gameConf.playerId !== UnfilteredPlayer.playerId) {
//         // Create playing sheet in tab that will show after game.
//         if (UnfilteredPlayer.name) {
//           return {
//             name: UnfilteredPlayer.name,
//             id: UnfilteredPlayer.playerId,
//             answers: UnfilteredPlayer.answers,
//             score: UnfilteredPlayer.score,
//           };
//         }
//       }
//     })
//     // why is there undefined players? Why did I add this?
//     .filter((filteredPlayer) => filteredPlayer !== undefined);
//   //console.log("Other Player Data-", remotePlayers);
//   startTheBus(gameData, localPlayer, remotePlayers);
//   // playingSheetEL(gameData, localPlayer, remotePlayers);
//   // sheetAnswers();
// }

////// GAME LISTENER & GENERATE INITIAL LETTER//////
// SET START THE BUS TO TRUE AND LISTEN FOR CHANGE TO FALSE IN FIRESTORE
export function gameListener(gameData, localPlayer, remotePlayers) {
  // Cover element for when game is restarted to stop home screen flashing
  console.log(gameData);
  db.collection("stopTheBus")
    .doc(gameConf.gameId)
    .set({
      playing: false, // change to true when not testing ***********************
      letter: gameData.letter,
    })
    .then(function () {
      const playingSheet = document.querySelector(".playing-sheet-container");
      console.log(playingSheet);
      if (playingSheet) {
        destroyEl(playingSheet);
      }
      // hide background els
      const headerEl = document.querySelector("header");
      const mainEl = document.querySelector("main");
      headerEl.classList.add("hide");
      mainEl.classList.add("hide");
      playingSheetEL(gameData, localPlayer, remotePlayers);
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}
