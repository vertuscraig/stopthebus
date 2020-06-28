import { ask } from "../popup.js";
import { gameConf } from "../new-game/create-new-game.js";
import {
  gameListener,
  firestoreArrayUpdate,
  firestoreMerge,
} from "../firestore.js";

export function filterPlayerData(
  gameData,
  playerData,
  unsubscribeGamePlayerArrayListener
) {
  // called from firestore
  const localPlayer = playerData.filter(
    (player) => player.playerId === gameConf.playerId
  );
  console.log("Local Player Data-", localPlayer);
  // Get rest of player data
  const remotePlayers = playerData
    .map((UnfilteredPlayer) => {
      if (gameConf.playerId !== UnfilteredPlayer.playerId) {
        // Create playing sheet in tab that will show after game.
        if (UnfilteredPlayer.name) {
          return {
            name: UnfilteredPlayer.name,
            id: UnfilteredPlayer.playerId,
            answers: UnfilteredPlayer.answers,
            score: UnfilteredPlayer.score,
            playing: UnfilteredPlayer.playing,
          };
        }
      }
    })
    // why are there undefined players? Why did I add this?
    .filter((filteredPlayer) => filteredPlayer !== undefined);
  console.log("Other Player Data-", remotePlayers);
  startTheBus(
    gameData,
    localPlayer,
    remotePlayers,
    unsubscribeGamePlayerArrayListener
  );
}

function startTheBus(
  gameData,
  localPlayer,
  remotePlayers,
  unsubscribeGamePlayerArrayListener
) {
  const startTheBusPopUp = ask({
    buttons: [
      { class: "start-the-bus", text: "Start The Bus", data: "start-the-bus" },
      { class: "cancel", text: "Cancel", data: "cancel" },
    ],
    textContent: `<h2>...Waiting For Other Players</h2><h3>Current Players:</h3>
    <ul class="current-players">
    <li>Player1 - ${localPlayer[0].name}</li>
    ${remotePlayers
      .map((player, i) => {
        console.log(player);
        return `<li>Player${i + 2} - ${player.name}</li>`;
      })
      .join("")} 
    </ul>
    <p>Once all players have joined click Start The Bus</p>`,
  });
  // create player listener for game being started
  const unsubscribeGameStartedListener = firebase
    .firestore()
    .collection("players")
    .where("currentGameId", "==", gameData.gameId)
    .onSnapshot(function (querySnapshot) {
      if (querySnapshot) {
        console.log("data-changed");
        querySnapshot.forEach(function (player) {
          if (player.data().playing === true) {
            console.log(player.data().playing);
            firebase
              .firestore()
              .collection("players")
              .doc(gameConf.playerId)
              .update({
                playing: true,
              })
              .then(function () {
                unsubscribeGamePlayerArrayListener();
                unsubscribeGameStartedListener();
              })
              .then(function () {
                gameListener(gameData, localPlayer, remotePlayers); //firestore
              })
              .catch(function (error) {
                console.error("Error writing document: ", error);
              });
          } else {
            startTheBusPopUp.then(function (status) {
              if (status === "cancel") {
                // delete player from game players array
                firestoreArrayUpdate(
                  "games",
                  gameConf.gameId,
                  "players",
                  gameConf.playerId,
                  "arrayRemove"
                );
                // delete gameId from player doc in firestore
                firestoreMerge("players", gameConf.playerId, {
                  currentGameId: null,
                });
                // reload main page
                location.reload();
              } else {
                firebase
                  .firestore()
                  .collection("players")
                  .doc(gameConf.playerId)
                  .update({
                    playing: true,
                  })
                  .then(function () {
                    unsubscribeGamePlayerArrayListener();
                    unsubscribeGameStartedListener();
                  })
                  .then(function () {
                    gameListener(gameData, localPlayer, remotePlayers); //firestore
                  });
              }
            });
          }
        });
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        //idErrMessage.textContent = "Game doesn't exist, try again";
      }
    });
}
