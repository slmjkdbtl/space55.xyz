import { h, css, } from "www/html"
import scripts from "./scripts"

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("meta", { charset: "utf-8", }),
		h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
		h("link", { rel: "icon", href: "/static/img/star.png" }),
		h("title", {}, "raccoon"),
		h("style", {}, css({
			"*": {
				// "cursor": "none",
			},
			"body": {
				"padding": "8px",
			},
		}))
	]),
	h("body", {}, [
		h("script", {}, scripts.raccoon),
	]),
])
