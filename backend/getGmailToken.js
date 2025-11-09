import { google } from "googleapis";
import readline from "readline";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const oAuth2Client = new google.auth.OAuth2(
  "366997255633-kkpvh98393husa77044pf7q8og0utbd5.apps.googleusercontent.com",
  "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",
  
  "https://developers.google.com/oauthplayground"
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});
console.log("Authorize this app by visiting:", authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Enter the code from that page here: ", async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  fs.writeFileSync("gmail_token.json", JSON.stringify(tokens));
  console.log("Tokens saved to gmail_token.json");
  rl.close();
});
