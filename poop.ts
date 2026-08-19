import * as fs from "fs/promises"
import * as path from "path"
import { h, css, csslib, } from "www/html"
import scripts from "./scripts"

type File = {
	title: string,
	content: string,
	path: string,
}

async function getFiles(dir: string): Promise<File[]> {
	return Promise.all(
		(await fs.readdir(dir))
			.filter((entry) => !entry.startsWith(".") && entry.endsWith(".txt"))
			.sort((a, b) => a > b ? -1 : 1)
			.map(async (f) => {
				const p = path.join(dir, f)
				return {
					title: path.basename(f, ".txt"),
					content: await fs.readFile(p, "utf8"),
					path: p,
				}
			})
	)
}

const files = (await Promise.all([
	"files/poop",
	"files/reality",
].map(getFiles))).flat()

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("title", {}, "嗯！嗯！！"),
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
				"padding": "16px",
				"font-family": "monospace",
			},
			"main": {
				"max-width": "480px",
				"width": "100%",
				"margin": "32px auto",
			},
			"p": {
				"white-space": "pre-wrap",
				"font-size": "16px",
			},
			".title": {
				"font-weight": "bold",
				"color": "#0000ff",
			},
			"button": {
				"width": "fit-content",
				"padding": "2px 4px",
			},
		})),
	]),
	h("body", {}, [
		h("main", { class: "vstack g-64" }, [
			h("img", { src: "/static/img/smile.gif", class: "w-20" }),
			h("div", { class: "vstack g-32" }, files.map(({ title, content }) => {
				return h("div", { class: "vstack g-8" }, [
					h("p", { class: "title" }, title),
					h("p", { class: "content" }, content),
					title === "在世界上所有诗后面加一句\"家人们谁懂\""
						? h("button", { id: "add-button" }, "加上")
						: null
				])
			})),
		]),
		h("script", {}, scripts.poop),
	]),
])
