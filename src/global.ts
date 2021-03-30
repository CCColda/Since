import { Database } from "sqlite";
import DatabaseTools from "./database";
import Globalization from "./globalization";

export interface SinceDB {
	database: Database,
	tools: DatabaseTools,
};

export interface SinceGlobal {
	db?: SinceDB,
	color?: string,
	globalization?: Globalization,
}

var sinceGlobal: SinceGlobal = {};

export default sinceGlobal;