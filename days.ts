import * as fs from "fs/promises"
import * as path from "path"
import { h, css, csslib, cc, js } from "www/html"

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

const firstDate = list[0].date
const lastDate = list[list.length - 1].date

function fixDate(d: Date) {
	d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
	return d
}

function monthRange(start: Date, end: Date) {
	const months = []
	const startYear = start.getFullYear()
	const endYear = end.getFullYear()
	for (let y = startYear; y <= endYear; y++) {
		const sm = y === startYear ? start.getMonth() : 0
		const em = y === endYear ? end.getMonth() : 11
		for (let m = sm; m <= em; m++) {
			months.push([y, m])
		}
	}
	return months
}

function dateRange(start: Date, end: Date) {
	const days = []
	let cur = new Date(start)
	while (cur <= end) {
		days.push(new Date(cur))
		cur.setDate(cur.getDate() + 1)
	}
	return days
}

function getDay(d: Date) {
	return d.getDay() === 0 ? 7 : d.getDay()
}

function month(year: number, month: number) {
	const calStart = fixDate(new Date(year, month - 1))
	const calEnd = fixDate(new Date(year, month))
	calStart.setDate(calStart.getDate() - getDay(calStart) + 1)
	calEnd.setDate(calEnd.getDate() - 1)
	calEnd.setDate(calEnd.getDate() + 7 - getDay(calEnd))
	const days = dateRange(calStart, calEnd)
	return h("div", { class: "cal" }, days.map((d) => {
		if (d.getMonth() !== month - 1) {
			return h("div", { class: "day empty" }, [])
		}
		const yearStr = d.getFullYear().toString().padStart(4, "0")
		const monthStr = (d.getMonth() + 1).toString().padStart(2, "0")
		const dayStr = d.getDate().toString().padStart(2, "0")
		const diary = book[yearStr]?.[monthStr]?.[dayStr]
		if (diary) {
			return h("div", { class: "day" }, [
				h("p", { class: "date" }, `${dayStr}`),
				h("p", { class: "diary" }, diary),
			])
		} else {
			return h("div", { class: "day empty" }, [
				h("p", { class: "date" }, `${dayStr}`),
			])
		}
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
				"background": "url(/static/img/sky.jpg)",
				"background-size": "1200px",
				"font-family": "monospace",
			},
			"main": {
				"max-width": "960px",
				"width": "100%",
				"margin": "0 auto",
				"@media": {
					"(max-width: 640px)": {
						"max-width": "240px",
					},
				},
			},
			"p": {
				"white-space": "pre-wrap",
				"font-size": "16px",
			},
			".cal": {
				"gap": "1px",
				...cc("grid col-7"),
				"@media": {
					"(max-width: 640px)": {
						...cc("col-1"),
					},
				},
			},
			".day": {
				...cc("vstack g-4 p-8"),
				"outline": "1px dashed black",
				"min-height": "120px",
			},
			".empty": {
				"@media": {
					"(max-width: 640px)": {
						"display": "none",
					},
				},
			},
			".month": {
				"font-weight": "bold",
			},
			".date": {
				"font-size": "10px",
				"font-weight": "bold",
			},
			".diary": {
				"font-size": "10px",
			},
		})),
	]),
	h("body", {}, [
		h("main", {}, [
			h("div", {
				class: "vstack g-16",
			}, monthRange(firstDate, lastDate).map(([y, m]) => {
				const d = `${y}.${(m + 1).toString().padStart(2, "0")}`
				return h("div", { class: "vstack g-8" }, [
					h("p", { class: "month" }, d),
					month(y, m + 1),
				])
			}))
		]),
	]),
])
