import { ArgumentType, CommandoClient } from "discord.js-commando";

export class DateType extends ArgumentType {
	constructor(client: CommandoClient) {
		super(client, "date");
	}

	async parse(val: string) {
		return new Date(val);
	}

	async validate(val: string) {
		return !isNaN(new Date(val).getTime());
	}
}

export const Types = [DateType];