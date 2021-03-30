# `Since` discord bot

Simple discord bot for keeping track of dates.
Written using the discord.js commando, and sqlite3 libraries.

Default prefix: `s.`

## Installation

Prerequisites: [node.js, npm](https://nodejs.org/), [typescript](https://www.npmjs.com/package/typescript)

1. Clone the repository
2. Open the folder in a command shell
```sh
# Install dependencies
> npm install

# Compile .ts to .js
> tsc

# Run node on the "dist" folder
> node dist
```

## Localization
Additional translations may be added in the `data/localization` folder, according to the schema of the files already existing there.
To apply, modify `localization` in `data/config.json`.
