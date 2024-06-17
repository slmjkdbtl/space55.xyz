import { h, csslib, css, } from "./www"

const works = [
	{ name: "Website for Midorii", url: "https://coilsprite.com", img: "coilsprite.jpg" },
	{ name: "Website for DEOT", url: "https://deot.vercel.app/", img: "deot.jpg" },
	{ name: "Website for Locus Chen", url: "https://old.locuschen.com/", img: "locus.jpg" },
	{ name: "My Personal Website", url: "https://space55.xyz/", img: "space55.jpg" },
	{ name: "Website for FFF Food Studio", url: "https://ffffoodstudio.com/", img: "fff.jpg" },
	{ name: "Website for David Murray", url: "https://davidmurray.xyz/", img: "davidmurray.jpg" },
]

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
				"font-family": "Monospace",
				"font-size": "20px",
				"padding": "32px",
			},
			"main": {
				"max-width": "640px",
				"width": "100%",
				"margin": "0 auto",
			},
		})),
	]),
	h("body", {}, [
		h("main", { class: "vstack g32" }, [
			h("div", { class: "vstack g16" }, [
				h("p", {}, "Hi, I'm tga. I make websites for artists and creative studios. I do everything: design, illustrations, development and deployment."),
				h("p", {}, [
					"Contact me for work at ",
					h("a", { href: "mailto:tga@space55.xyz" }, "tga@space55.xyz"),
				]),
			]),
			h("div", { class: "vstack g16 stretch-x" }, works.map((w) => {
				return h("a", { href: w.url, class: "vstack g8 stretch-x" }, [
					h("p", {}, w.name),
					h("img", { src: `/static/img/portfolio/${w.img}` }),
				])
			})),
		]),
	]),
])
