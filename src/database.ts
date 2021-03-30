import { Database } from "sqlite";

export interface JSDateEntry {
	label: string,
	date: Date,
	creator: string
};

export interface SQLDateEntry {
	label: string,
	date: string,
	creator: string,
};

class DatabaseTools {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	static guildTableName(guild_id: string) {
		return `dates_${guild_id}`;
	}

	static escapeLabel(label: string) {
		return label.replace(/\\\/\"\'\`\%/gi, "\\$0");
	}

	async checkGuildTable(guild_id: string) {
		return !! await this.db.get(`SELECT name FROM sqlite_master WHERE name="${DatabaseTools.guildTableName(guild_id)}"`);
	}

	async addDate(guild_id: string, { label, date, creator }: JSDateEntry) {
		await this.db.run(`CREATE TABLE IF NOT EXISTS "${DatabaseTools.guildTableName(guild_id)}" (label TEXT UNIQUE, date DATETIME, creator TEXT)`);
		await this.db.run(`INSERT INTO "${DatabaseTools.guildTableName(guild_id)}" (label, date, creator) VALUES ("${DatabaseTools.escapeLabel(label)}", "${date.toISOString()}", "${creator}")`);
	}

	async getDate(guild_id: string, label: string): Promise<SQLDateEntry | undefined> {
		return await this.checkGuildTable(guild_id)
			? await this.db.get(`SELECT * FROM "${DatabaseTools.guildTableName(guild_id)}" WHERE label="${DatabaseTools.escapeLabel(label)}"`)
			: undefined;
	}

	async getDates(guild_id: string): Promise<SQLDateEntry[]> {
		return await this.checkGuildTable(guild_id)
			? await this.db.all(`SELECT * FROM "${DatabaseTools.guildTableName(guild_id)}"`)
			: [];
	}

	async removeDate(guild_id: string, label: string): Promise<boolean> {
		return await this.checkGuildTable(guild_id)
			? !!(await this.db.run(`DELETE FROM "${DatabaseTools.guildTableName(guild_id)}" WHERE label="${DatabaseTools.escapeLabel(label)}"`)).changes
			: false;
	}
};

export default DatabaseTools;