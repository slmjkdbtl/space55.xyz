import { h, css, } from "www/html"
import scripts from "./scripts"

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("meta", { charset: "utf-8", }),
		h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
		h("link", { rel: "icon", href: "/static/img/star.png" }),
		h("title", {}, "小芳妙味旋转后空踢 Lil Fang Fantasy Spin Backflip Kick"),
		h("style", {}, css({
			"*": {
				// "cursor": "none",
			},
		}))
	]),
	h("body", {}, [
		h("script", {}, scripts.lilfang),
	]),
])
