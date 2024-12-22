"use strict";
var admin = require("firebase-admin");
var serviceAccount = require("./podcasty-be7a1-firebase-adminsdk-li3ze-600ae65056.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://podcasty-be7a1.firebaseio.com",
});
const db = admin.firestore();
module.exports = { db };
