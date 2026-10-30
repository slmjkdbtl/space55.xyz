import { h, css, csslib } from "www/html"

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
				"font-size": "20px",
				"font-family": "Arial",
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
					// TODO
					"width": "100px",
				},
				":hover": {
					"img": {
						"transform": "scale(1.02)",
					},
				},
				"&.music": {
					"position": "absolute",
					"top": "40px",
					"left": "80px",
					"img": {
						"left": "32px",
						"width": "160px",
					},
					"p": {
						"top": "20px",
					},
				},
				"&.blog": {
					"position": "absolute",
					"top": "220px",
					"left": "200px",
					"img": {
						"width": "280px",
					},
					"p": {
						"top": "100px",
						"left": "270px",
					},
				},
				"&.games": {
					"position": "absolute",
					"top": "300px",
					"left": "60px",
					"img": {
						"width": "160px",
					},
					"p": {
						"top": "270px",
						"left": "160px",
					},
				},
				"&.lilfang": {
					"position": "absolute",
					"top": "0",
					"left": "400px",
					"img": {
						"width": "480px",
						"left": "90px",
					},
					"p": {
						"top": "500px",
					},
				},
			},
		})),
	]),
	h("body", {}, [
		h("a", { class: "box music", href: "https://slmjkdbtl.bandcamp.com/album/littlesongs" }, [
			h("img", { src: "/static/img/music.svg" }),
			h("p", {}, "music"),
		]),
		h("a", { class: "box blog", href: "/blog" }, [
			h("img", { src: "/static/img/sun.svg" }),
			h("p", {}, "blog"),
		]),
		h("a", { class: "box games", href: "/games" }, [
			h("img", { src: "/static/img/games.svg" }),
			h("p", {}, "games"),
		]),
		h("a", { class: "box lilfang", href: "/lilfang" }, [
			h("img", { src: "/static/img/lilfang.svg" }),
			h("p", {}, "lil fang"),
		]),
	]),
])
