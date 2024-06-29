import * as fs from "fs/promises"
import * as path from "path"
import { h, css, csslib } from "./www"

type Book = {
	[year: string]: {
		[month: string]: {
			[day: string]: string
		}
	}
}

const DIR = "files/days"
const book: Book = {}
const list: Array<{
	date: Date,
	content: string,
}> = []

for (const year of await fs.readdir(DIR)) {
	book[year] = {}
	for (const month of await fs.readdir(path.join(DIR, year))) {
		book[year][month] = {}
		for (const file of await fs.readdir(path.join(DIR, year, month))) {
			if (file.endsWith(".txt")) {
				const date = path.basename(file, ".txt")
				const content = await fs.readFile(path.join(DIR, year, month, file), "utf8")
				if (content) {
					book[year][month][date] = content
					list.push({
						date: new Date(`${year}-${month}-${date}`),
						content: content.trim(),
					})
				}
			}
		}
	}
}

list.sort((a, b) => a.date.getTime() - b.date.getTime())

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("title", {}, "日常"),
		h("meta", { charset: "utf-8", }),
		h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
		h("link", { rel: "icon", href: "/static/img/tga.png" }),
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
			"p": {
				"white-space": "pre-wrap",
				"font-size": "16px",
			},
			".date": {
				"font-weight": "bold",
				"color": "blue",
			},
		})),
	]),
	h("body", {}, [
		h("main", {}, [
			h("div", { class: "vstack g-16" }, list.map(({ date, content }) => {
				const year = date.getFullYear()
				const month = date.getMonth() + 1
				const day = date.getDate()
				return h("div", {}, [
					h("p", { class: "date" }, `${year}.${month}.${day}`),
					h("p", {}, content)
				])
			})),
		]),
	]),
])
