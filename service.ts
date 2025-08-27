import { h, css, csslib, cc, js } from "./www"
import msg from "./files/service.txt"

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("title", {}, "服务"),
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
				"font-family": "monospace",
			},
			"main": {
				"max-width": "640px",
				"font-size": "20px",
				"width": "100%",
				"margin": "80px auto",
				"white-space": "pre-wrap",
				"@media": {
					"(max-width: 640px)": {
						"max-width": "240px",
					},
				},
			},
		})),
	]),
	h("body", {}, [
		h("main", {}, msg),
	]),
])
