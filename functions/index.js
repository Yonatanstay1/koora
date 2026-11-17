"use strict";
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { createBridge, createHandler } = require("./beds24.cjs");
const villaMap = require("./villa-map.json");

const BEDS24_REFRESH_TOKEN = defineSecret("BEDS24_REFRESH_TOKEN");

let handler = null;

exports.beds24 = onRequest(
  { region: "us-central1", secrets: [BEDS24_REFRESH_TOKEN], maxInstances: 5, memory: "256MiB", timeoutSeconds: 20 },
  (req, res) => {
    if (!handler) {
      handler = createHandler(createBridge({ refreshToken: BEDS24_REFRESH_TOKEN.value(), villaMap }));
    }
    return handler(req, res);
  },
);
