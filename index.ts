import { h, css, csslib } from "www/html"

const things = [
	{ name: "music", link: "/music" },
	{ name: "blog", link: "/blog" },
	{ name: "games", link: "/games" },
	{ name: "lilfang", link: "/lilfang" },
	{ name: "poop", link: "/poop" },
]

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("title", {}, "tga"),
		h("meta", { charset: "utf-8", }),
		h("meta", { name: "description", content: "tga's homepage", }),
		h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
		h("link", { rel: "icon", href: "/static/img/tga.png" }),
		h("style", {}, css({
			"*": {
				"box-sizing": "border-box",
				"margin": "0",
				"padding": "0",
			},
			"html": {
				"font-size": "16px",
				"font-family": "Helvetica, Arial, sans-serif;",
				"color": "black",
			},
			"body": {
				"background": "#e7e8e9",
			},
			".box": {
				"position": "relative",
				"text-decoration": "none",
				"color": "black",
				"img": {
					"position": "absolute",
					"transition": "0.25s transform",
				},
				"p": {
					"position": "absolute",
					"width": "max-content",
				},
				":hover": {
					"img": {
						"transform": "scale(1.02)",
					},
				},
				"&.music": {
					"position": "absolute",
					"top": "30px",
					"left": "60px",
					"img": {
						"left": "30px",
						"width": "120px",
					},
					"p": {
						"top": "20px",
					},
				},
				"&.blog": {
					"position": "absolute",
					"top": "160px",
					"left": "170px",
					"img": {
						"width": "200px",
					},
					"p": {
						"top": "0px",
						"left": "210px",
					},
				},
				"&.games": {
					"position": "absolute",
					"top": "220px",
					"left": "50px",
					"img": {
						"width": "120px",
					},
					"p": {
						"top": "120px",
						"left": "130px",
					},
				},
				"&.lilfang": {
					"position": "absolute",
					"top": "0",
					"left": "340px",
					"img": {
						"width": "340px",
						"left": "60px",
						"top": "-1px",
					},
					"p": {
						"top": "300px",
					},
				},
				"&.poop": {
					"position": "absolute",
					"top": "410px",
					"left": "260px",
					"img": {
						"width": "100px",
						"top": "20px",
						"left": "30px",
					},
				},
			},
		})),
	]),
	h("body", {}, [
		...things.map(({ name, link }) => {
			return h("a", { class: `box ${name}`, href: link }, [
				h("img", { src: `/static/img/${name}.svg` }),
				h("p", {}, name),
			])
		}),
	]),
])
