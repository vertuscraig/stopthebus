import { gameConf } from "./new-game/create-new-game.js";
import { ask } from "./popup.js";
import { handleRestartGameCreate } from "./new-game/reset-game-create.js";
import { idErrMessage } from "./index.js";
import { filterPlayerData } from "./play-game/start-game.js";
import { playingSheetEL, destroyEl } from "./play-game/playing-sheet.js";

////// CREATE FIRESTORE VARIABLES //////
const db = firebase.firestore();

//////****** FIRESTORE UTILITY FUNCTIONS ******//////

////// UPDATE DATA IN FIRESTORE //////
export function firestoreUpdate(collection, doc, data) {
  db.collection(collection).doc(doc).update(data);
}

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

////// ADD TO ARRAY ARRAY IN FIRESTORE - operation can also be arrayRemove//////
export function firestoreArrayUpdate(
  collection,
  doc,
  array,
  value,
  operation = arrayUnion
) {
  db.collection(collection)
    .doc(doc)
    .update({
      [array]: firebase.firestore.FieldValue[operation](value),
    });
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
  // Check local storage for player ID
  const playerId = localStorage.getItem("playerId");
  const playerName = localStorage.getItem("playerName");
  if (playerId) {
    gameConf.playerId = playerId;
    gameConf.playerName = playerName;
    console.log(gameConf.playerId, gameConf.playerName);
  } else {
    console.log("nothing in local storage!!");
  }

  if (!gameConf.playerId) {
    gameConf.playerId = Date.now().toString();
    localStorage.setItem("playerId", gameConf.playerId);
    localStorage.setItem("playerName", gameConf.playerName);
  }
  if (gameConf.playerName !== localStorage.getItem("playerName")) {
    localStorage.setItem("playerName", gameConf.playerName);
  }
  console.log("2 - Start - Create Player Doc");
  db.collection("players")
    .doc(gameConf.playerId)
    .set({
      name: gameConf.playerName,
      answers: null,
      score: null,
      playerId: gameConf.playerId,
      playing: false,
      // add saved categories and games later
    })
    .then(function () {
      console.log("2 - End - Create Player Doc");
      joinFirestoreGame();
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}

////// SAVE NEW GAME TO FIRESTORE //////
export function handleSaveNewGameToFireStore() {
  // Generate Initial Letter
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  gameConf.letter = letter;
  //create the game and categories in firestore
  db.collection("games")
    .doc(gameConf.gameId)
    .set({
      categories: gameConf.categoriesArray,
      letter: gameConf.letter,
      owner: gameConf.playerId,
      created: new Date(),
      playing: false,
    })
    .then(function () {})
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
        } else if (status === "play") {
          createPlayer();
        }
      });
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}
////// GAME STATUS //////
// CHECK IF GAME IS STARTED AND RETURN GAME STARTED MSG OR JOIN GAME
// export function gameStatusold() {
//   console.log("1 - Start - Check gameStatus in stopTheBus Doc");
//   db.collection("stopTheBus")
//     .doc(gameConf.gameId)
//     .get()
//     .then(function (doc) {
//       if (doc.exists) {
//         console.log("1 - inside - stopTheBus Doc exists");
//         gameConf.gameStatus = doc.data().playing;
//         if (gameConf.gameStatus === true) {
//           console.log("1 - inside - stopTheBus Doc exists and playing true");
//           const gameAlreadyStarted = ask({
//             buttons: [{ class: "quit", text: "Quit", data: "quit" }],
//             textContent: `<h2>Sorry, This game has already started!</h2>
//               <h3>Try again later or ask the other players to quit and start again</h3>`,
//           });
//           handleRestartGameCreate();
//           gameAlreadyStarted.then(function (status) {
//             if (status === "quit") {
//               handleRestartGameCreate();
//             }
//           });
//         } else {
//           console.log("1 - inside - stopTheBus Doc exists and playing false");
//           // run joinFirestoreGame if gameStatus false
//           createPlayer();
//         }
//       } else {
//         // run joinFirestoreGame if doc doesn't exist
//         console.log("1 - end - stopTheBus Doc doesn't exists");
//         createPlayer();
//       }
//     })
//     .catch(function (error) {
//       console.log("Error getting document:", error);
//     });
// }

export function gameStatus() {
  console.log("1 - Start - Check gameStatus in Game Doc");
  db.collection("games")
    .doc(gameConf.gameId)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        console.log("1 - inside - Games Doc exists");
        gameConf.gameStatus = doc.data().playing;
        if (gameConf.gameStatus === true) {
          console.log("1 - inside - stopTheBus Doc exists and playing true");
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
          console.log("1 - inside - stopTheBus Doc exists and playing false");
          // run joinFirestoreGame if gameStatus false
          createPlayer();
        }
      } else {
        // run joinFirestoreGame if doc doesn't exist
        console.log("1 - end - Game Doc doesn't exists - Invalid GameId");
        // Add err message here
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });
}

////// JOIN FIRESTORE GAME //////
////// JOIN AN EXISTING FIRESTORE GAME, GET DATA, SAVE PLAYER AND RESET ANSWERS
// TODO - refactor this to start game with all join game functions
export function joinFirestoreGame() {
  let gameData = {};
  //console.log("Joining A Game");
  // Create Player and update players array
  console.log("3 - Start - Update players array in game doc");
  db.collection("games")
    .doc(gameConf.gameId)
    .update({
      players: firebase.firestore.FieldValue.arrayUnion(gameConf.playerId),
    })
    .then(function () {
      console.log("3 - End - Update players array in game doc");
      console.log("4 - Start - Add current game Id to player doc");
      db.collection("players")
        .doc(gameConf.playerId)
        .update({
          currentGameId: gameConf.gameId,
        })
        .then(function () {
          console.log("4 - End - Add current game Id to player doc");
          console.log("5 - Start - Get game data from game doc");
          db.collection("games")
            .doc(gameConf.gameId)
            .get()
            .then(function (doc) {
              if (doc.exists) {
                //console.log("This one:", doc.data());
                gameData = doc.data();
                gameData.gameId = gameConf.gameId;
                gameData.answers = [];
                console.log("5 - inside - Get game data from game doc");
                gamePlayerArrayListener(gameData);
              } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
              }
            });
        })
        .catch(function (error) {
          console.log("Error getting document:", error);
        });
    });
}

////// PLAYER LISTENER //////
////// LISTEN FOR CHANGES IN THE GAME PLAYERS //////
export function gamePlayerArrayListener(gameData) {
  // create player data var
  let playerData = null;
  // Listen to Game Data on firestore for realtime changes
  console.log("6 - start listening to game doc in firestore");
  const unsubscribeGamePlayerArrayListener = db
    .collection("games")
    .doc(gameConf.gameId)
    .onSnapshot(function (doc) {
      if (doc.exists) {
        //var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        // console.log(source, " data: ", doc.data());
        // updates the players data when firestore receives realtime data, i.e. another player joins.
        console.log(
          "7 - update player doc where currentGameId == gameId when listener 6 fires"
        );
        db.collection("players")
          .where("currentGameId", "==", gameData.gameId)
          .get()
          .then(function (querySnapshot) {
            playerData = [];
            querySnapshot.forEach(function (doc) {
              console.log(playerData);
              console.log(
                "8 - each time a player joins push doc data - to local playerData Array"
              );
              return playerData.push({ ...doc.data() });
            });
          })
          .then(function () {
            filterPlayerData(
              gameData,
              playerData,
              unsubscribeGamePlayerArrayListener
            ); // Start Game File
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
}

////// GAME LISTENER & GENERATE INITIAL LETTER//////
// SET START THE BUS TO TRUE AND LISTEN FOR CHANGE TO FALSE IN FIRESTORE
export function gameListener(gameData, localPlayer, remotePlayers) {
  console.log(gameData);
  db.collection("games")
    .doc(gameConf.gameId)
    .update({
      playing: false, // change to true when not testing ***********************
    })
    .then(function () {
      const unsubscribeGameListener = db
        .collection("games")
        .doc(gameConf.gameId)
        .onSnapshot(function (doc) {
          if (doc.exists) {
            // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
            // console.log(source, " data: ", doc.data());
            gameData.letter = doc.data().letter;
            const playingSheet = document.querySelector(
              ".playing-sheet-container"
            );
            console.log(playingSheet);
            if (playingSheet) {
              console.log("destroying playing sheet!!!");
              destroyEl(playingSheet);
            }
            // Cover element for when game is restarted to stop home screen flashing
            // hide background els
            const headerEl = document.querySelector("header");
            const mainEl = document.querySelector("main");
            headerEl.classList.add("hide");
            mainEl.classList.add("hide");
            playingSheetEL(gameData, localPlayer, remotePlayers);
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            idErrMessage.textContent = "Game doesn't exist, try again";
          }
        });
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}
