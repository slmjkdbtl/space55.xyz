import * as path from "node:path"
import { Handler, h, css, csslib } from "./www"
import type { Env } from "./main"

const DIR = "files/poop"

const handler: Handler<Env> = async ({ res, fs }) => {

	const entries = await Promise.all(fs.readDir(DIR)
		.filter((entry) => !entry.startsWith(".") && entry.endsWith(".txt"))
		.sort((a, b) => a > b ? -1 : 1)
		.map((f) => fs.readFile(path.join(DIR, f)).then((content) => ({
			title: path.basename(f, ".txt"),
			content: content,
		}))))

	const page = "<!DOCTYPE html>" + h("html", { lang: "en" }, [
		h("head", {}, [
			h("title", {}, "嗯！嗯！！"),
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
				"p": {
					"white-space": "pre-wrap",
					"font-size": "16px",
				},
				".title": {
					"font-weight": "bold",
					"color": "tomato",
				},
				"button": {
					"width": "fit-content",
					"padding": "2px 4px",
				},
			})),
		]),
		h("body", {}, [
			h("main", {}, [
				h("div", { class: "vstack g32" }, entries.map(({ title, content }) => {
					return h("div", { class: "vstack g8" }, [
						h("p", { class: "title" }, title),
						h("p", { class: "content" }, content),
						title === "在世界上所有诗后面加一句\"家人们谁懂\""
							? h("button", { onclick: "add()" }, "加上")
							: null
					])
				})),
			]),
			h("script", { src: "/static/scripts/poop.js" }, ""),
		]),
	])
	return res.sendHTML(page)
}

export default handler
