import { pickALetter } from "./generate-letter.js";
import { gameConf } from "../new-game/create-new-game.js";

// TODO
// - Add a realtime listener to firestore game playing var
// - scores total function
// - stop the bus button - disables input on answers
// - Create exit game function that deletes game status and players

// Create Tabs plating sheet
// - only show players playing sheet until stop the bus presses.
// - function to listen for answers, save all answers to firestore when stop the bus pressed.
// - Remove snapshot listener when game closes

// Tabs HTML from Wes

// Tabs JS from Wes
// const tabs = document.querySelector(".tabs");
// const tabButtons = tabs.querySelectorAll('[role="tab"]');
// const tabPanels = Array.from(tabs.querySelectorAll('[role="tabpanel"]'));

// function handleTabClick(event) {
//   // hide all tab panels
//   tabPanels.forEach((panel) => {
//     panel.hidden = true;
//   });
//   // mark all tabs as unselected
//   tabButtons.forEach((tab) => {
//     // tab.ariaSelected = false;
//     tab.setAttribute("aria-selected", false);
//   });
//   // mark the clicked tab as selected
//   event.currentTarget.setAttribute("aria-selected", true);
//   // find the associated tabPanel and show it!
//   const { id } = event.currentTarget;

//   /*
//     METHOD 1
//   const tabPanel = tabs.querySelector(`[aria-labelledby="${id}"]`);
//   console.log(tabPanel);
//   tabPanel.hidden = false;
//   */

//   // METHOD 2 - find in the array of tabPanels
//   console.log(tabPanels);
//   const tabPanel = tabPanels.find(
//     (panel) => panel.getAttribute("aria-labelledby") === id
//   );
//   tabPanel.hidden = false;
// }

// tabButtons.forEach((button) =>
//   button.addEventListener("click", handleTabClick)
// );
