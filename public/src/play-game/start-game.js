import { ask } from "../popup.js";
import { gameConf } from "../new-game/create-new-game.js";
//import { playingSheetEL } from "../play-game/playing-sheet.js";
import { gameListener } from "../firestore.js";
import { handleRestartGameCreate } from "../new-game/reset-game-create.js";

export function filterPlayerData(gameData, playerData) {
  // called from firestore
  const localPlayer = playerData.filter(
    (player) => player.playerId === gameConf.playerId
  );
  //console.log("Local Player Data-", localPlayer);
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
          };
        }
      }
    })
    // why is there undefined players? Why did I add this?
    .filter((filteredPlayer) => filteredPlayer !== undefined);
  //console.log("Other Player Data-", remotePlayers);
  startTheBus(gameData, localPlayer, remotePlayers);
  // playingSheetEL(gameData, localPlayer, remotePlayers);
  // sheetAnswers();
}

function startTheBus(gameData, localPlayer, remotePlayers) {
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
  startTheBusPopUp.then(function (status) {
    if (status === "cancel") {
      //handleRestartGameCreate();
      location.reload();
      //gameConf = null;
      console.log("cancelled join game");
    } else {
      gameListener(gameData, localPlayer, remotePlayers); //firestore
    }
  });
}
