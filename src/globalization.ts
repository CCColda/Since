import IntlMessageFormat from "intl-messageformat";
import { readFileSync } from "fs";

type TranslationPath = string | string[];

export default class Globalization {
	private dictionary: object;
	public locale: string;

	constructor(locale: string, file_or_data: string | object) {
		this.dictionary = typeof file_or_data === "string"
			? JSON.parse(readFileSync(file_or_data, "utf-8"))
			: file_or_data;

		this.locale = locale;
	}

	private findTranslation(translationPathArray: string[]): string | undefined {
		let dict = this.dictionary as any;

		for (const segment of [this.locale, ...translationPathArray]) {
			if (!dict) break;

			// beautiful
			dict = dict[segment as keyof typeof dict];
		}

		return !dict ? undefined : `${dict}`;
	}

	translate(path: TranslationPath, args?: any): string {
		const translationPathArray =
			(typeof path === "string" ? path.split(/[\/\\]/gi) : path).filter(v => !!v);
		const fallback = translationPathArray.join('/');

		const translation = this.findTranslation(translationPathArray) ?? fallback;

		const result = new IntlMessageFormat(translation, this.locale)
			.format(args);

		return typeof result === "string" ? result : (result as any[]).map(v => `${v}`).join("");
	}
};