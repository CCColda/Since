# `Since` discord bot

Simple discord bot for keeping track of dates.
Written using the discord.js commando, and sqlite3 libraries.

Default prefix: `s.`

## Installation

Prerequisites: [node.js, npm](https://nodejs.org/), [typescript](https://www.npmjs.com/package/typescript)

1. Clone the repository
2. Create a `secret.json` file in `data` with the following structure:
```json
{
	// Copy from the Discord Developer portal
	"token": "your-bot-token-here",
	// May leave blank ("") or paste in your discord user ID
	"owner": "your-account-id"
}
```
^ <sub><sup>[Discord Developer Portal](https://discord.com/developers/)</sup></sub>

3. Open the folder in a command shell
```sh
# Install dependencies
npm install

# Compile .ts to .js
tsc

# Run node on the "dist" folder
node dist
```

## Localization
Additional translations may be added in the `data/localization` folder, according to the schema of the files already existing there.
To apply, modify `localization` in `data/config.json`.
