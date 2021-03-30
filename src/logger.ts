/**
 * Simple logger class for logging into files and the console simultaneously
 * Requirements: `npm i colors`
 * @copyright COlda <cccolda@gmail.com>, 2021
 */

import { yellow, reset, red, italic, gray } from "colors/safe";
import { openSync, writeSync, closeSync, writeFile } from "fs";
import { Writable } from "stream";

class Logger {
	private descriptor: string;
	private static outputFileDescriptor = -1;
	private static outputConsoleStream: Writable = process.stderr;

	constructor(descriptor: string) {
		this.descriptor = descriptor;
	}

	private argumentsToString(args: any[]): string {
		return [...args].map((v: any): string => {
			try {
				const res = v?.toString() ?? v;

				return typeof res == "string" ? res : JSON.stringify(res);
			} catch (exc) {
				return `<exception ${exc}>`;
			}
		}).join(" ");
	}

	private writeToConsole(message: string) {
		if (Logger.outputConsoleStream.writable)
			Logger.outputConsoleStream.write(
				reset("[") + yellow(this.descriptor) + reset("]: ") + message + "\n"
			);
	}

	anonymous(...log: any[]) {
		this.writeToConsole(gray(this.argumentsToString(log)));
	}

	log(...log: any[]) {
		const argumentsAsString = this.argumentsToString(log);

		this.writeToConsole(italic(argumentsAsString));
		Logger.writeToLog(`[${this.descriptor}] INFO: ${argumentsAsString}`);
	}

	warning(...log: any[]) {
		const argumentsAsString = this.argumentsToString(log);

		this.writeToConsole(yellow(argumentsAsString));
		Logger.writeToLog(`[${this.descriptor}] WARN: ${argumentsAsString}`);
	}

	error(...log: any[]): void {
		const argumentsAsString = this.argumentsToString(log);

		this.writeToConsole(red(argumentsAsString));
		Logger.writeToLog(`[${this.descriptor}] FAIL: ${argumentsAsString}`);
	}

	static dump(pathToFile: string, data: Buffer | string) {
		return new Promise<void>((res) => {
			this.writeToLog(`---Creating dump at "${pathToFile}"---`);
			writeFile(pathToFile, data, (err) => {
				if (err) {
					this.writeToLog(`---Creating dump at "${pathToFile}" failed: ${err}---`);
				}
				else {
					this.writeToLog(`---Dump successful---`);
				}
				res();
			});
		});
	}

	static init(pathToFile: string, outputConsoleDescriptor: Writable = process.stderr): void {
		this.outputConsoleStream = outputConsoleDescriptor;
		this.outputFileDescriptor = openSync(pathToFile, "a");
		this.writeToLog(`---------LOG OPENED---------`);
		this.writeToLog(`---${new Date().toLocaleString("iso")}---`);
	}

	static destroy(): void {
		this.writeToLog(`---------LOG CLOSED---------`);
		this.writeToLog(`---${new Date().toLocaleString("iso")}---`);
		closeSync(this.outputFileDescriptor);
		this.outputFileDescriptor = -1;
	}

	static get initialized() {
		return this.outputFileDescriptor != -1;
	}

	private static writeToLog(log: string): boolean {
		return this.initialized && writeSync(this.outputFileDescriptor, `${new Date().toLocaleTimeString("iso")} ${log}\n`) > 0;
	}
};

export default Logger;