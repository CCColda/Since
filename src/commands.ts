import { MessageEmbed } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import Logger from "./logger";
import sinceGlobal from "./global";
import DatabaseTools from "./database";

const commandLogger = new Logger("CMD");

export class RegisterDateCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: "register",
			aliases: ["reg", "re", "r", "create"],
			group: "since",
			memberName: "register",
			description: sinceGlobal.globalization!.translate("register/desc"),
			guildOnly: true,
			args: [
				{
					key: "label",
					prompt: sinceGlobal.globalization!.translate("register/label-prompt"),
					type: "string"
				},
				{
					key: "date",
					prompt: sinceGlobal.globalization!.translate("register/date-prompt"),
					type: "date"
				}
			]
		});
	}

	async run(message: CommandoMessage, args: { label: string, date: Date }) {
		if (!sinceGlobal.db) {
			commandLogger.error("Dates database is invalid during command " + this.name);
			return message;
		}

		try {
			const entry = await sinceGlobal.db.tools.getDate(message.guild.id, args.label);
			if (entry) {
				const creatorName =
					message.guild.member(entry.creator)?.displayName ?? "<ismeretlen>";

				return message.channel.send(
					new MessageEmbed()
						.setColor(sinceGlobal.color!)
						.setDescription(
							sinceGlobal.globalization!.translate("register/err", {
								creator: creatorName,
								date: new Date(entry.date)
							})));
			}

			await sinceGlobal.db.tools.addDate(message.guild.id, { ...args, creator: message.author.id });

			commandLogger.log(`[Guild ${message.guild.id}] "${message.author.username}" created event "${args.label}" with date "${args.date.toISOString()}"`);
			return message.channel.send(
				new MessageEmbed()
					.setColor(sinceGlobal.color!)
					.setDescription(sinceGlobal.globalization!.translate("register/res")));
		}
		catch (exc) {
			commandLogger.error(`Exception in register:`, exc);
			return message;
		}
	}
};

export class SinceCommand extends Command {
	private static epoch = Object.freeze({
		year: 1970,
		month: 0,
		day: 0,
		hour: 0,
		minute: 0,
		second: 0,
	});

	constructor(client: CommandoClient) {
		super(client, {
			name: "since",
			aliases: ["until"],
			group: "since",
			memberName: "since",
			description: sinceGlobal.globalization!.translate("since/desc"),
			guildOnly: true,
			args: [
				{
					key: "label",
					prompt: sinceGlobal.globalization!.translate("since/label-prompt"),
					type: "string"
				}
			]
		});
	}

	createMessage(label: string, date: Date) {
		const now = new Date();
		const duration = new Date(Math.abs(now.valueOf() - date.valueOf()));

		const timespan = {
			year: duration.getUTCFullYear() - SinceCommand.epoch.year,
			month: duration.getUTCMonth() - SinceCommand.epoch.month,
			day: duration.getUTCDate() - SinceCommand.epoch.day,
			hour: duration.getUTCHours() - SinceCommand.epoch.hour,
			minute: duration.getUTCMinutes() - SinceCommand.epoch.minute,
			second: duration.getUTCSeconds() - SinceCommand.epoch.second
		};

		return sinceGlobal.globalization!.translate(["since", date > now ? "for" : "since"], {
			label,
			time: sinceGlobal.globalization!.translate("since/time", timespan)
		});
	}

	async run(message: CommandoMessage, args: { label: string }) {
		if (!sinceGlobal.db) {
			commandLogger.error("Dates database is invalid during command " + this.name);
			return message;
		}

		try {
			const entry = await sinceGlobal.db.tools.getDate(message.guild.id, args.label);

			if (entry) {
				return message.channel.send(
					new MessageEmbed()
						.setColor(sinceGlobal.color!)
						.setDescription(
							sinceGlobal.globalization!.translate("since/res", {
								for_or_until: this.createMessage(entry.label, new Date(entry.date))
							})));
			}

			return message.channel.send(
				new MessageEmbed()
					.setColor(sinceGlobal.color!)
					.setDescription(sinceGlobal.globalization!.translate("since/err")));
		}
		catch (exc) {
			commandLogger.error(`Exception in since:`, exc);
			return message;
		}
	}
};

export class RemoveCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: "remove",
			aliases: ["delete", "del", "unregister", "unreg"],
			group: "since",
			memberName: "remove",
			description: sinceGlobal.globalization!.translate("remove/desc"),
			guildOnly: true,
			args: [
				{
					key: "label",
					prompt: sinceGlobal.globalization!.translate("remove/label-prompt"),
					type: "string"
				}
			]
		});
	}

	async run(message: CommandoMessage, args: { label: string }) {
		if (!sinceGlobal.db) {
			commandLogger.error("Dates database is invalid during command " + this.name);
			return message;
		}

		try {
			const deleted = await sinceGlobal.db.tools.removeDate(message.guild.id, args.label);
			if (deleted) {
				commandLogger.log(`"${message.author.username}" removed event "${DatabaseTools.escapeLabel(args.label)}"`);
				return message.channel.send(
					new MessageEmbed()
						.setColor(sinceGlobal.color!)
						.setDescription(sinceGlobal.globalization!.translate("remove/res")));
			}

			return message.channel.send(
				new MessageEmbed()
					.setColor(sinceGlobal.color!)
					.setDescription(sinceGlobal.globalization!.translate("remove/err")));
		}
		catch (exc) {
			commandLogger.error(`Exception in remove:`, exc);
			return message;
		}
	}
};

export class ListCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: "list",
			aliases: [],
			group: "since",
			memberName: "list",
			description: sinceGlobal.globalization!.translate("list/desc"),
			guildOnly: true,
			args: []
		});
	}

	async run(message: CommandoMessage) {
		if (!sinceGlobal.db) {
			commandLogger.error("Dates database is invalid during command " + this.name);
			return message;
		}

		try {
			const dates = await sinceGlobal.db.tools.getDates(message.guild.id);
			const padding = Math.min(15, dates.map(v => v.label.length).reduce((a, b) => Math.max(a, b)));

			if (dates.length > 0) {
				return message.channel.send(new MessageEmbed().setColor(sinceGlobal.color!).setDescription(
					sinceGlobal.globalization!.translate("list/res-head", { count: dates.length }) +
					dates.slice(0, Math.min(dates.length, 15))
						.map(v => sinceGlobal.globalization!.translate("list/res-line", { label: v.label, padding: " ".repeat(Math.max(2, padding - v.label.length)), date: new Date(v["date"]) })).join("\n") +
					sinceGlobal.globalization!.translate("list/res-bot")
				));
			}

			return message.channel.send(new MessageEmbed().setColor(sinceGlobal.color!)
				.setDescription(sinceGlobal.globalization!.translate("list/err")));
		}
		catch (exc) {
			commandLogger.error(`Exception in since:`, exc);
			return message;
		}
	}
};

export class WhenCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: "when",
			aliases: [],
			group: "since",
			memberName: "when",
			description: sinceGlobal.globalization!.translate("when/desc"),
			guildOnly: true,
			args: [
				{
					key: "label",
					prompt: sinceGlobal.globalization!.translate("when/label-prompt"),
					type: "string"
				}
			]
		});
	}

	async run(message: CommandoMessage, args: { label: string }) {
		if (!sinceGlobal.db) {
			commandLogger.error("Dates database is invalid during command " + this.name);
			return message;
		}

		try {
			const entry = await sinceGlobal.db.tools.getDate(message.guild.id, args.label);

			if (entry)
				return message.channel.send(new MessageEmbed().setColor(sinceGlobal.color!)
					.setDescription(sinceGlobal.globalization!.translate("when/res", { date: new Date(entry.date), label: entry.label })));

			return message.channel.send(new MessageEmbed().setColor(sinceGlobal.color!)
				.setDescription(sinceGlobal.globalization!.translate("when/err")));
		}
		catch (exc) {
			commandLogger.error(`Exception in when:`, exc);
			return message;
		}
	}
};

export const Commands = [
	RegisterDateCommand, SinceCommand, RemoveCommand, ListCommand, WhenCommand
];