import { readFileSync } from "fs";

import * as Commando from "discord.js-commando";
import * as sqlite from "sqlite";
import * as sqlite3 from "sqlite3";
import Logger from "./logger";

import sinceGlobal from "./global";
import DatabaseTools from "./database";
import Globalization from "./globalization";

import { Types } from "./types";
import { Commands } from "./commands";

const mainLogger = new Logger("MAIN");
const paths = Object.freeze({
	config: "data/config.json",
	log: `data/logs/sincebot-${new Date().toLocaleDateString("ISO").replace(/[^0-9a-z\-]/gi, "")}.log`,
	database: "data/sincebot.db",
	secret: "data/secret.json",
});

interface ConfigFile {
	localization: {
		file: string,
		locale: string,
	},
	prefix: string,
	color: string,
}

interface SecretFile {
	token: string,
	owner: string,
}

async function main() {
	Logger.init(paths.log);

	try {
		const secret: SecretFile = JSON.parse(readFileSync(paths.secret, "utf-8"));
		const config: ConfigFile = JSON.parse(readFileSync(paths.config, "utf-8"));
		mainLogger.anonymous("Loaded secrets and config");

		const database = await sqlite.open({ filename: paths.database, driver: sqlite3.Database });

		sinceGlobal.db = {
			database,
			tools: new DatabaseTools(database),
		};

		sinceGlobal.globalization = new Globalization(config.localization.locale, config.localization.file);
		sinceGlobal.color = config.color ?? "#390B31";

		mainLogger.anonymous("Loaded dates database");

		const client = new Commando.Client({
			commandPrefix: config.prefix ?? "s.",
			owner: secret.owner,
		});

		client.registry
			.registerDefaultTypes()
			.registerTypes(Types)
			.registerGroup("since")
			.registerDefaultGroups()
			.registerDefaultCommands({
				commandState: false,
				eval: false,
				help: true,
				ping: false,
				prefix: true,
				unknownCommand: false
			})
			.registerCommands(Commands);

		mainLogger.anonymous(`Set up ${client.registry.commands.size} commands`);

		await client.login(secret.token);
		mainLogger.anonymous("Logged in");

		await client.setProvider(new Commando.SQLiteProvider(database));
		mainLogger.anonymous("Set up settings provider");

		const interrupt = async () => {
			try {
				mainLogger.anonymous("Interrupt");

				process.on('SIGINT', () => { mainLogger.anonymous(">>> Interrupt still in progress, [CTRL+D] to force terminate"); });
				process.removeListener('SIGINT', interrupt);

				client.destroy();
				await database.close();
			} catch (exc) {
				mainLogger.error(`Exception while closing:`, exc);
			}
		};

		process.on('SIGINT', interrupt);
	}
	catch (exc) {
		mainLogger.error("Exception thrown:", exc);
	}
}

main();