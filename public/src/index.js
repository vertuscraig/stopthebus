import { restorePlayerLocalData } from "./new-game/player-data.js";

import {
  handleStartNewGame,
  handleCreateGame,
} from "./new-game/create-new-game.js";

import {
  handleJoinExistingGame,
  handleJoinButtonPressed,
} from "./new-game/join-game.js";

import { handleRestartGameCreate } from "./new-game/reset-game-create.js";

////// GLOBAL VARIABLES //////
// Global Vars
// Global Vars
//let gameId = "";
//let gameData;
let playingData = {};

// Create global categories var.
let categoriesArray = [];

// CREATE global PLAYER VARS
const playerID = Math.floor(Math.random() * 16777215).toString(16);
let playerName = "";
let totalPlayers = null;
let answers = {};

////// CREATE A NEW GAME //////

restorePlayerLocalData();

// DOM Elements - all new game elements
export const restartGameCreate = document.querySelector(".restart");
export const gameType = document.querySelector(".game-type");
export const newGameSelected = document.querySelector(".new-game");
export const joinExistingGame = document.querySelector(".join-game");
export const newGameDetails = document.querySelector(
  "[name='new-game-details']"
);
export const gameDetailsTitle = document.querySelector(
  ".game-details-output-title"
);
export const categoriesOutput = document.querySelector(".category-output");
export const gameIDOutput = document.querySelector(".new-game-id");
export const changeGameDetails = document.querySelector(".change-game-details");

export const saveNewGameToFireStore = document.querySelector(".confirm-game");

// new game event listener
newGameSelected.addEventListener("click", handleStartNewGame);

////// JOIN EXISTING GAME ////////

// DOM Elements
export const hideCreateGame = document.querySelector(".create-new-game");

export const gameIdInput = document.querySelector(".input-game-id");

export const idErrMessage = document.querySelector(".id-err");

// handleJoinButtonPressed();
// handleJoinExistingGame();

// listen for join game click
joinExistingGame.addEventListener("click", handleJoinButtonPressed);
// listen for game ID input
gameIdInput.addEventListener("submit", handleJoinExistingGame);

// Callback to handle reset game create for new and existing games
// handleRestartGameCreate();

// resetGameCreate event Listener
restartGameCreate.addEventListener("click", handleRestartGameCreate);
// To Do Get the Players and add to firestore
