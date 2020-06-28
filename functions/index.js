// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
// const functions = require("firebase-functions");

// // The Firebase Admin SDK to access Cloud Firestore.
// const admin = require("firebase-admin");
// admin.initializeApp();

// // Generate Initial Letter For Stop The Bus
// exports.genLetter = functions.firestore
//   .document("games/{gameId}")
//   .onCreate((snap) => {
//     const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//     // Get an object representing the document create in firestore
//     const newGame = snap.data();
//     // create new letter in firestore
//     let letter = newGame.letter;
//     // Generate random letter
//     letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
//     // update firestore
//     return snap.ref.set({ letter: letter }, { merge: true });
//   });
