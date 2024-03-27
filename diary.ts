import * as fs from "fs/promises"
import * as path from "path"
import { h, css, csslib } from "./www"

type Diary = {
	[year: string]: {
		[month: string]: {
			[day: string]: string
		}
	}
}

const DIR = "files/diary"
const diary: Diary = {}

for (const year of await fs.readdir(DIR)) {
	diary[year] = {}
	for (const month of await fs.readdir(path.join(DIR, year))) {
		diary[year][month] = {}
		for (const file of await fs.readdir(path.join(DIR, year, month))) {
			if (file.endsWith(".txt")) {
				const day = path.basename(file, ".txt")
				diary[year][month][day] = await fs.readFile(path.join(DIR, year, month, file), "utf8")
			}
		}
	}
}

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("title", {}, "日常"),
		h("meta", { charset: "utf-8", }),
		h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
		h("link", { rel: "icon", href: "/static/img/icon.png" }),
		h("style", {}, csslib()),
		h("style", {}, css({
			"*": {
				"box-sizing": "border-box",
				"margin": "0",
				"padding": "0",
			},
			"body": {
				"padding": "24px",
			},
			"main": {
				"max-width": "480px",
				"width": "100%",
				"margin": "0 auto",
			},
		})),
	]),
	h("body", {}, [
		h("main", {}, [
		]),
	]),
])
