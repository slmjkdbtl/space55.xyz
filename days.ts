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

for (const yearDir of await fs.readdir(DIR, { withFileTypes: true })) {
	if (!yearDir.isDirectory()) continue
	const year = yearDir.name
	book[year] = {}
	for (const monthDir of await fs.readdir(path.join(DIR, year), { withFileTypes: true })) {
		if (!monthDir.isDirectory()) continue
		const month = monthDir.name
		book[year][month] = {}
		for (const file of await fs.readdir(path.join(DIR, year, month), { withFileTypes: true })) {
			if (!file.isFile()) continue
			if (!file.name.endsWith(".txt")) continue
			const date = path.basename(file.name, ".txt")
			const content = await fs.readFile(path.join(DIR, year, month, file.name), "utf8")
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

list.sort((a, b) => a.date.getTime() - b.date.getTime())

function dateDiff(a: Date, b: Date) {
	return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)
}

const firstDate = list[0].date
const lastDate = list[list.length - 1].date

class Date2 extends Date {
	constructor(...args: ConstructorParameters<typeof Date>) {
		super(...args)
		this.setMinutes(this.getMinutes() - this.getTimezoneOffset())
	}
}

function month(year: number, month: number) {
	const calStart = new Date2(year, month - 1)
	const calEnd = new Date2(year, month)
	calStart.setDate(calStart.getDate() - calStart.getDay() + 1)
	calEnd.setDate(calEnd.getDate() - 1)
	if (calEnd.getDay() > 0) {
		calEnd.setDate(calEnd.getDate() + 7 - calEnd.getDay())
	}
	const rows = []
	let curRow = []
	let cur = new Date(calStart)
	while (cur <= calEnd) {
		curRow.push({
			date: new Date(cur),
		})
		if (curRow.length >= 7) {
			rows.push(curRow)
			curRow = []
		}
		cur.setDate(cur.getDate() + 1)
	}
	return h("table", {}, rows.map((r) => {
		return h("tr", {}, r.map((d) => {
			if (d.date.getMonth() !== month - 1) {
				return h("td", {}, [])
			}
			const isToday = new Date().toDateString() === d.date.toDateString()
			const yearStr = d.date.getFullYear().toString().padStart(4, "0")
			const monthStr = (d.date.getMonth() + 1).toString().padStart(2, "0")
			const dayStr = d.date.getDate().toString().padStart(2, "0")
			const diary = book[yearStr]?.[monthStr]?.[dayStr]
			return h("td", {}, [
				h("p", { class: "date" }, `${dayStr}`),
				h("p", { class: "diary" }, diary),
			])
		}))
	}))
}

function range(a: number, b: number) {
	return Array.from({ length: b - a + 1 }, (val, i) => a + i)
}

function cal(start: Date, end: Date) {
	return h("div", { class: "vstack g-16" }, range(firstDate.getMonth(), lastDate.getMonth()).map((m) => {
		return h("div", { class: "vstack g-8" }, [
			h("p", { class: "month" }, m + 1),
			// TODO
			month(2024, m + 1),
		])
	}))
}

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
				"max-width": "960px",
				"width": "100%",
				"margin": "0 auto",
			},
			"p": {
				"white-space": "pre-wrap",
				"font-size": "16px",
			},
			"table": {
				"border-collapse": "collapse",
				"width": "100%",
			},
			"table, th, td": {
				"border": "1px dashed rgba(0, 0, 0, 0.2)",
			},
			"th, td": {
				"padding": "8px",
				"vertical-align": "top",
				"max-width": "0",
				"max-height": "0",
				"height": "160px",
				"display": "table-cell",
			},
			".month": {
				"font-weight": "bold",
			},
			".date": {
				"color": "#999999",
				"font-size": "10px",
			},
			".diary": {
				"font-size": "10px",
			},
		})),
	]),
	h("body", {}, [
		h("main", {}, [
			cal(firstDate, lastDate),
		]),
	]),
])
