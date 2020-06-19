// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Generate Letter For Stop The Bus
exports.genLetter = functions.firestore
  .document("games/{gameId}")
  .onCreate((snap) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // Get an object representing the document create in firestore
    const newGame = snap.data();
    // create new letter in firestore
    let initLetter = newGame.initLetter;
    // Generate random letter
    initLetter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    // update firestore
    return snap.ref.set({ initLetter }, { merge: true });
  });
