import * as fs from "fs/promises"
import * as path from "path"
import { h, css, csslib, js } from "www/html"
import scripts from "./scripts"

const files = await fs.readdir("files/littlesongs")
const songs = files.sort().filter((f) => f.endsWith(".mp3"))

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("title", {}, "小歌曲 Little Songs"),
		h("meta", { charset: "utf-8", }),
		h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
		h("link", { rel: "icon", href: "/static/img/star.png" }),
		h("style", {}, csslib()),
		h("style", {}, css({
			"*": {
				"box-sizing": "border-box",
				"margin": "0",
				"padding": "0",
			},
			"html": {
				"font-size": "14px",
			},
			"body": {
				"padding": "32px",
				"font-family": "monospace",
				"background": "#ffffff",
				"color": "#000000",
			},
		})),
	]),
	h("body", {}, [
		h("main", { class: "vstack g-16" }, [
			h("canvas", { id: "cover" }, []),
			h("div", { class: "vstack g-4" }, [
				h("p", { id: "title", }, "小歌曲 Little Songs"),
				h("p", { id: "artist", }, "旋转笔 SpinPen"),
			]),
			h("div", { class: "vstack g-8" }, songs.map((s) => {
				const name = s.replace(/\.mp3$/, "")
				return h("div", { class: "vstack g-4" }, [
					h("p", {}, name),
					h("audio", { src: `/files/littlesongs/${s}`, controls: true }, []),
				])
			})),
		]),
		h("script", {}, scripts.littlesongs),
	]),
])
