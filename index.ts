import { h, css, csslib, js } from "./www"

const games = [
	{
		name: "好 GOOD",
		year: "2017",
		img: "/static/img/good.png",
		desc: "a game about goodness",
		link: "https://slmjkdbtl.itch.io/good"
	},
	{
		name: "在哪里 wHERE'StIGA",
		year: "2018",
		img: "/static/img/wherestiga.png",
		desc: "finding tiga",
		link: "https://slmjkdbtl.itch.io/wherestiga"
	},
	{
		name: "肮脏的手 DIRTY FINGER",
		year: "2018",
		img: "/static/img/dirtyfinger.png",
		desc: "finger game",
		link: "https://slmjkdbtl.itch.io/dirty-finger"
	},
	{
		name: "大黄鸡的人生觉悟 Big Bird's Question About Life",
		year: "2018",
		img: "/static/img/bigbird.png",
		desc: "bir bird game",
		link: "https://slmjkdbtl.itch.io/bigbirdsquestionaboutlife"
	},
	{
		name: "粉红鱼鱼 Find the Pink Fish",
		year: "2018",
		img: "/static/img/pfish.png",
		desc: "fish game",
		link: "https://slmjkdbtl.itch.io/pfish"
	},
	{
		name: "吃鱼 Eat Fish",
		year: "2018",
		img: "/static/img/eatfish.png",
		desc: "fish eating game",
		link: "https://slmjkdbtl.itch.io/eat-fish"
	},
	{
		name: "角膜 CONJUN",
		year: "2017",
		img: "/static/img/conjun.png",
		desc: "squeeze game",
		link: "https://slmjkdbtl.itch.io/conjun"
	},
	{
		name: "高光 BL00000M",
		year: "2017",
		img: "/static/img/bl00000m.png",
		desc: "flower game",
		link: "https://slmjkdbtl.itch.io/bl00000m"
	},
	{
		name: "丽萨 LISA",
		year: "2018",
		img: "/static/img/lisa.png",
		desc: "tommy tearing apart game",
		link: "https://slmjkdbtl.itch.io/lisa"
	}
]

const sites = [
	{
		name: "instagram",
		link: "https://www.instagram.com/slmjkdbtl/",
	},
	{
		name: "twitter",
		link: "https://twitter.com/slmjkdbtl/",
	},
	{
		name: "github",
		link: "https://github.com/slmjkdbtl/",
	},
	{
		name: "itch.io",
		link: "https://slmjkdbtl.itch.io/",
	},
]

const styles = {
	"*": {
		"margin": "0",
		"padding": "0",
		"box-sizing": "border-box",
		"user-select": "none",
		"cursor": "url(/static/img/cursor1.png), default",
	},
	".obj": {
		":hover": {
			"cursor": "url(/static/img/cursor2.png), default",
		},
	},
	"a": {
		"outline": "0",
		":hover": {
			"cursor": "url(/static/img/cursors/2.png), default",
		},
	},
	"html": {
		"width": "100%",
	},
	"body": {
		"width": "100%",
		"background-color": "#000000",
		"background": "url(/static/img/space.jpg)",
		"text-align": "center",
	},
	".box": {
		"height": "auto",
		".img": {
			"width": "100%",
			"height": "auto",
			"transition": "0.2s",
			":hover": {
				"transform": "scale(0.95)",
			},
		},
	},
	"#dino": {
		"position": "relative",
		"width": "64%",
		"margin": "0 auto",
		"@media": {
			"(max-width: 960px)": {
				"width": "84%",
				"height": "calc(84% * .75)",
			},
			"(max-width: 640px)": {
				"width": "100%",
				"height": "calc(96% * .75)",
				"margin-top": "24px",
			},
		},
		"#body": {
			"width": "100%",
			"height": "auto",
		},
		"#flower": {
			"position": "absolute",
			"top": "11%",
			"left": "31%",
			"width": "10%",
			"height": "auto",
			"&.happy": {
				"animation": "happy 0.5s infinite",
			},
		},
		"#eye": {
			"position": "absolute",
			"top": "30%",
			"left": "35%",
			"width": "0.5%",
			"height": "auto",
		},
	},
	"#title": {
		"display": "block",
		"width": "32%",
		"height": "auto",
		"margin": "32px auto",
		"padding": "1px",
		"@media": {
			"(max-width: 960px)": {
				"width": "48%",
			},
			"(max-width: 640px)": {
				"width": "72%",
			},
		},
	},
	".wrapper": {
		"width": "80%",
		"margin": "24px auto",
		"display": "flex",
		"justify-content": "space-between",
		"flex-wrap": "wrap",
		"&.games": {
			".box": {
				"width": "33%",
				"@media": {
					"(max-width: 960px)": {
						"width": "45%",
					},
					"(max-width: 640px)": {
						"width": "100%",
					},
				},
			},
		},
		"&.sites": {
			".box": {
				"width": "25%",
				"@media": {
					"(max-width: 640px)": {
						"width": "100%",
					},
				},
			},
		},
		"@media": {
			"(max-width: 640px)": {
				"margin-top": "-32px",
			},
		},
	},
	"#randomlink": {
		"display": "block",
		"width": "36%",
		"height": "auto",
		"margin": "0 auto",
		"transition": "0.2s",
		"@media": {
			"(max-width: 960px)": {
				"width": "64%",
			},
			"(max-width: 640px)": {
				"width": "84%",
			},
		},
		":hover": {
			"transform": "scale(1.05)",
		},
	},
	"#elsewhere": {
		"display": "block",
		"width": "54%",
		"height": "auto",
		"margin-top": "48px",
		"margin-left": "8%",
		"transition": "0.25s",
		"@media": {
			"(max-width: 960px)": {
				"width": "64%",
			},
			"(max-width: 640px)": {
				"width": "84%",
			},
		},
	},
	"@keyframes": {
		"happy": {
			"0%": {
				"content": "url(/static/img/flower1.png)",
			},
			"25%": {
				"content": "url(/static/img/flower2.png)",
			},
			"50%": {
				"content": "url(/static/img/flower3.png)",
			},
			"75%": {
				"content": "url(/static/img/flower4.png)",
			},
			"100%": {
				"content": "url(/static/img/flower1.png)",
			},
		},
	},
}

export default async () => {
	return "<!DOCTYPE html>" + h("html", { lang: "en" }, [
		h("head", {}, [
			h("title", {}, "tga"),
			h("meta", { charset: "utf-8", }),
			h("meta", { name: "description", content: "tga's homepage", }),
			h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
			h("link", { rel: "icon", href: "/static/img/tga.png" }),
			h("style", {}, css(styles)),
		]),
		h("body", {}, [
			h("div", { id: "dino", }, [
				h("img", { id: "body", src: "/static/img/dino.png", alt: "dino" }),
				h("img", { id: "flower", class: "obj", src: "/static/img/flower1.png", alt: "flower"  }),
				h("img", { id: "eye", src: "/static/img/eye.png", alt: "eye"  }),
			]),
			h("img", { id: "title", src: "/static/img/title.png", alt: "title", }),
			h("div", { class: "games wrapper", }, games.map((game) => h("a", { class: "box obj", href: game.link }, [
				h("img", { class: "img obj", src: game.img, alt: game.name, }),
			]))),
			h("a", { href: "/randomlink", target: "_blank" }, [
				h("img", { id: "randomlink", class: "obj", src: "/static/img/randomlink.png", alt: "random link", }),
			]),
			h("img", { id: "elsewhere", src: "/static/img/elsewhere.png", alt: "elsewhere", }),
			h("div", { class: "sites wrapper", }, sites.map((site) => h("a", { class: "box obj", href: site.link }, [
				h("img", { class: "img obj", src: `/static/img/${site.name}.png`, alt: site.name, })
			]))),
			h("script", {}, await js("client/index.ts")),
		]),
	])
}
