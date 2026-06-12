import * as fs from "fs/promises"
import * as path from "path"
import {
	Handler,
	HTTPError,
	createRouter,
	trimSlashEnd,
} from "www/server"
import { h, css, csslib } from "www/html"

type Article = {
	slug: string,
	title: string,
	date: Date,
	content: string,
}

async function getArticle(slug: string) {

	const f = Bun.file(`blog/${slug}.html`)

	if (!await f.exists()) {
		return null
	}

	let content = await f.text()
	const lines = content.split("\n")
	const title = lines[0].trim()
	const date = new Date(lines[1].trim())

	function urlPrefix(el: HTMLRewriterTypes.Element) {
		const src = el.getAttribute("src")
		if (src && !src.startsWith("/") && !src.startsWith("http")) {
			el.setAttribute("src", `/static/blog/${slug}/${src}`)
		}
	}

	function toFig(el: HTMLRewriterTypes.Element) {
		const caption = el.getAttribute("data-caption")
		if (!caption) return
		el.before(`<figure>`, { html: true })
		el.after(`<figcaption>${caption}</figcaption></figure>`, { html: true })
	}

	const rewriter = new HTMLRewriter()
		.on("img[src]", { element: urlPrefix })
		.on("video[src]", { element: urlPrefix })
		.on("audio[src]", { element: urlPrefix })
		.on("img[data-caption]", { element: toFig })
		.on("video[data-caption]", { element: toFig })

	content = await rewriter.transform(content)

	return {
		slug,
		title,
		date,
		content,
	}

}

const articles: Record<string, Article> = {}

for (const f of await fs.readdir("blog")) {
	if (!f.endsWith(".html")) continue
	const name = path.basename(f, ".html")
	const article = await getArticle(name)
	if (article) {
		articles[name] = article
	}
}

const router = createRouter()

const commonStyles = {
	"*": {
		"box-sizing": "border-box",
		"margin": "0",
		"padding": "0",
	},
	"html": {
		"font-size": "16px",
	},
	"body": {
		"padding": "32px",
		"background": "#ffffff",
		"color": "#000000",
		"font-family": "monospace",
		"@media": {
			"(max-width: 480px)": {
				"padding": "16px",
			},
		},
	},
}

function fmtDate(date: Date) {
	const sep = "-"
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, "0")
	const d = String(date.getDate()).padStart(2, "0")
	return [y, m, d].join(sep)
}

router.add("GET", "/", ({ res, req }) => {
	const list = Object.values(articles)
		.sort((a, b) => a.date.getTime() - b.date.getTime())
	const p = trimSlashEnd(req.url.pathname)
	res.sendHTML("<!DOCTYPE html>" + h("html", { lang: "en" }, [
		h("head", {}, [
			h("title", {}, "space55 blog"),
			h("meta", { charset: "utf-8", }),
			h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
			h("link", { rel: "icon", href: "/static/img/tga.png" }),
			h("style", {}, csslib()),
			h("style", {}, css(commonStyles)),
			h("style", {}, css({
				"a": {
					"color": "blue",
					"text-decoration": "none",
					"cursor": "pointer",
					"width": "fit-content",
					":hover": {
						"background": "blue",
						"color": "white",
					},
					"&.selected": {
						"background": "blue",
						"color": "white",
					},
				},
			})),
		]),
		h("body", {}, [
			h("div", { class: "vstack g-8" }, list.map((article) => {
				return h("a", {
					href: `${p}/${article.slug}`,
					class: "hstack g-4 align-center",
				}, [
					h("span", {}, `${fmtDate(article.date)}`),
					h("span", {}, article.title),
				])
			})),
		]),
	]))
})

router.add("GET", "/:name", ({ req, res }) => {

	const name = req.params["name"]
	const article = articles[name]

	if (!article) {
		throw new HTTPError(404, "not found")
	}

	res.sendHTML("<!DOCTYPE html>" + h("html", { lang: "en" }, [
		h("head", {}, [
			h("title", {}, article.title),
			h("meta", { charset: "utf-8", }),
			h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
			h("link", { rel: "icon", href: "/static/img/tga.png" }),
			h("style", {}, css(commonStyles)),
			h("style", {}, css({
				".article": {
					"white-space": "pre-wrap",
					"width": "100%",
					"max-width": "480px",
					"img": {
						"width": "100%",
					},
					"video": {
						"width": "100%",
					},
					"audio": {
						"width": "100%",
					},
					"figcaption": {
						"color": "#666666",
						"font-style": "italic",
					},
				}

			})),
		]),
		h("body", {}, [
			h("div", { class: "article" }, article.content),
		]),
	]))

})

export {
	router,
}
