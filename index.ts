import { h, css, csslib, js } from "./www"

const games = [
	{
		name: "好 GOOD",
		year: "2017",
		img: "/static/img/ui/games/good.png",
		desc: "a game about goodness",
		link: "https://slmjkdbtl.itch.io/good"
	},
	{
		name: "在哪里 wHERE'StIGA",
		year: "2018",
		img: "/static/img/ui/games/wherestiga.png",
		desc: "finding tiga",
		link: "https://slmjkdbtl.itch.io/wherestiga"
	},
	{
		name: "肮脏的手 DIRTY FINGER",
		year: "2018",
		img: "/static/img/ui/games/dirtyfinger.png",
		desc: "finger game",
		link: "https://slmjkdbtl.itch.io/dirty-finger"
	},
	{
		name: "大黄鸡的人生觉悟 Big Bird's Question About Life",
		year: "2018",
		img: "/static/img/ui/games/bigbird.png",
		desc: "bir bird game",
		link: "https://slmjkdbtl.itch.io/bigbirdsquestionaboutlife"
	},
	{
		name: "粉红鱼鱼 Find the Pink Fish",
		year: "2018",
		img: "/static/img/ui/games/pfish.png",
		desc: "fish game",
		link: "https://slmjkdbtl.itch.io/pfish"
	},
	{
		name: "吃鱼 Eat Fish",
		year: "2018",
		img: "/static/img/ui/games/eatfish.png",
		desc: "fish eating game",
		link: "https://slmjkdbtl.itch.io/eat-fish"
	},
	{
		name: "角膜 CONJUN",
		year: "2017",
		img: "/static/img/ui/games/conjun.png",
		desc: "squeeze game",
		link: "https://slmjkdbtl.itch.io/conjun"
	},
	{
		name: "高光 BL00000M",
		year: "2017",
		img: "/static/img/ui/games/bl00000m.png",
		desc: "flower game",
		link: "https://slmjkdbtl.itch.io/bl00000m"
	},
	{
		name: "丽萨 LISA",
		year: "2018",
		img: "/static/img/ui/games/lisa.png",
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
		"cursor": "url(/static/img/ui/cursor1.png), default",
	},
	".obj": {
		":hover": {
			"cursor": "url(/static/img/ui/cursor2.png), default",
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
		"background": "url(/static/img/ui/space.jpg)",
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
			"screen and (max-width: 960px)": {
				"width": "84%",
				"height": "calc(84% * .75)",
			},
			"screen and (max-width: 640px)": {
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
	},
	"#title": {
		"display": "block",
		"width": "32%",
		"height": "auto",
		"margin": "32px auto",
		"padding": "1px",
		"@media": {
			"screen and (max-width: 960px)": {
				"width": "48%",
			},
			"screen and (max-width: 640px)": {
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
					"screen and (max-width: 960px)": {
						"width": "45%",
					},
					"screen and (max-width: 640px)": {
						"width": "100%",
					},
				},
			},
		},
		"&.sites": {
			".box": {
				"width": "25%",
				"@media": {
					"screen and (max-width: 640px)": {
						"width": "100%",
					},
				},
			},
		},
		"@media": {
			"screen and (max-width: 640px)": {
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
			"screen and (max-width: 960px)": {
				"width": "64%",
			},
			"screen and (max-width: 640px)": {
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
			"screen and (max-width: 960px)": {
				"width": "64%",
			},
			"screen and (max-width: 640px)": {
				"width": "84%",
			},
		},
	},
	"@keyframes": {
		"happy": {
			"0%": {
				"content": "url(/static/img/ui/flower1.png)",
			},
			"25%": {
				"content": "url(/static/img/ui/flower2.png)",
			},
			"50%": {
				"content": "url(/static/img/ui/flower3.png)",
			},
			"75%": {
				"content": "url(/static/img/ui/flower4.png)",
			},
			"100%": {
				"content": "url(/static/img/ui/flower1.png)",
			},
		},
	},
}

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
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
			h("img", { id: "body", src: "/static/img/ui/dino.png", alt: "dino" }),
			h("img", { id: "flower", class: "obj", src: "/static/img/ui/flower1.png", alt: "flower"  }),
		]),
		h("img", { id: "title", src: "/static/img/ui/title.png", alt: "title", }),
		h("div", { class: "games wrapper", }, games.map((game) => h("a", { class: "box obj", href: game.link }, [
			h("img", { class: "img obj", src: game.img, alt: game.name, }),
		]))),
		h("a", { href: "/randomlink", target: "_blank" }, [
			h("img", { id: "randomlink", class: "obj", src: "/static/img/ui/randomlink.png", alt: "random link", }),
		]),
		h("img", { id: "elsewhere", src: "/static/img/ui/elsewhere.png", alt: "elsewhere", }),
		h("div", { class: "sites wrapper", }, sites.map((site) => h("a", { class: "box obj", href: site.link }, [
			h("img", { class: "img obj", src: `/static/img/ui/${site.name}.png`, alt: site.name, })
		]))),
		h("script", {}, await js("client/index.ts")),
	]),
])
