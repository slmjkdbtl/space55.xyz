import * as fs from "fs"
import * as path from "path"
import { h, css, csslib, js } from "./www"

const sites = [
	{ name: "Midorii", url: "https://coilsprite.com", img: "coilsprite.jpg" },
	{ name: "DEOT", url: "https://deot.vercel.app/", img: "deot.jpg" },
	{ name: "Locus Chen", url: "https://old.locuschen.com/", img: "locus.jpg" },
	{ name: "tga", url: "https://space55.xyz/", img: "space55.jpg" },
	{ name: "FFF Food Studio", url: "https://ffffoodstudio.com/", img: "fff.jpg" },
	{ name: "David Murray", url: "https://davidmurray.xyz/", img: "davidmurray.jpg" },
]

const games = [
	{ name: "wHERE'StGa", img: "wherestga.jpg", url: "https://slmjkdbtl.itch.io/wherestiga", desc: "self introduction game, solve puzzles and find tga in the room!" },
	{ name: "space55", img: "space.jpg", url: "", desc: "personal digital space" },
	{ name: "LISA", img: "lisa.jpg", url: "https://slmjkdbtl.itch.io/lisa", desc: "Lisa! You're tearing me apart!!" },
	{ name: "bl00000m", img: "bl00000m.jpg", url: "https://slmjkdbtl.itch.io/bl00000m", desc: "2 player arcade, play as flowers, shoot pollens and protect your petals!" },
	{ name: "DEOT Space Exploration Program", img: "deot.jpg", url: "https://deot.vercel.app/", desc: "explore space, gather resources and battle alien bugs for DEOT space operation" },
	{ name: "GOOD", img: "good.jpg", url: "https://slmjkdbtl.itch.io/good", desc: "feel" },
	{ name: "gardenFX", img: "garden.jpg", url: "", desc: "gardening themed drum sequencer" },
	{ name: "DIRTY FINGER", img: "dirtyfinger.jpg", url: "", desc: "the fingers are dirty" },
	{ name: "Eat Fish", img: "eatfish.jpg", url: "", desc: "enjoy your meal while battling the evil hedgehog!" },
	{ name: "FEEDME", img: "feedme.jpg", url: "", desc: "satisfy your man, man" },
]

const code = [
	{ name: "dirty", desc: "personal single header c library collection, including graphics engine, audio engine, scripting language, etc", url: "https://github.com/slmjkdbtl/dirty" },
	{ name: "kaboom", desc: "2d JavaScript game engine", url: "https://github.com/replit/kaboom" },
]

export default "<!DOCTYPE html>" + h("html", { lang: "en" }, [
	h("head", {}, [
		h("title", {}, "tga's resume"),
		h("meta", { charset: "utf-8", }),
		h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
		h("link", { rel: "icon", href: "/static/img/tga.png" }),
		h("style", {}, csslib()),
		h("style", {}, css({
			"html": {
				"font-size": "20px",
			},
			"*": {
				"box-sizing": "border-box",
				"margin": "0",
				"padding": "0",
			},
			"body": {
				"font-family": "Monospace",
				"padding": "32px",
				"@media": {
					"screen and (max-width: 640px)": {
						"padding": "16px",
					},
				},
			},
			"main": {
				"max-width": "640px",
				"width": "100%",
				"margin": "0 auto",
			},
			"a": {
				"color": "#0000ff",
				"text-decoration": "none",
				":hover": {
					"text-decoration": "underline",
				},
			},
			"ul,ol": {
				"padding-left": "20px",
			},
			".works": {
				"grid-template-columns": "repeat(2, 1fr)",
				"@media": {
					"screen and (max-width: 640px)": {
						"grid-template-columns": "repeat(1, 1fr)",
					},
				},
			},
			".title": {
				"font-weight": "bold",
				"font-size": "1.5rem",
			},
			".date": {
				"color": "#666",
				"font-style": "italic",
			},
		})),
	]),
	h("body", {}, [
		h("main", { class: "vstack g48" }, [
			h("p", {}, "tga"),
			h("div", { class: "section vstack g16" }, [
				h("p", { class: "title" }, "Websites"),
				h("p", { class: "desc" }, "I make websites for artists, musicians and creative studios. I do everything including design, illustration, development and deployment."),
				h("div", { class: "grid g16 stretch-x works" }, sites.map((w) => {
					return h("a", { href: w.url, class: "vstack g8 stretch-x" }, [
						h("p", {}, w.name),
						h("img", { class: "media stretch-x", src: `/static/sites/${w.img}` }),
					])
				})),
			]),
			h("div", { class: "section vstack g16" }, [
				h("p", { class: "title" }, "Games & Digital Toys"),
				h("p", { class: "desc" }, [
					"I make some small games and digital toys. You can find gameplay videos ",
					h("a", { href: "https://vimeo.com/slmjkdbtl" }, "here"),
					".",
				]),
				h("div", { class: "grid g16 stretch-x works" }, games.map((g) => {
					return h("div", { href: g.url, class: "vstack g8 stretch-x" }, [
						h("a", { class: "name", href: g.url }, g.name),
						h("p", { class: "desc", }, g.desc),
						h("img", { class: "media stretch-x", src: `/static/games/${g.img}` }),
					])
				})),
			]),
			h("div", { class: "section vstack g16" }, [
				h("p", { class: "title" }, "Music"),
				h("p", { class: "desc" }, [
					"I play tenor saxophone, and some trumpet, flute and bass on the side. Mostly in the jazz / free jazz / improv scene. You can find some videos of my performances ",
					h("a", { href: "https://www.instagram.com/slmjkdbtl/reels/" }, "here"),
					".",
				]),
			]),
			h("div", { class: "section vstack g16" }, [
				h("p", { class: "title" }, "Education"),
				h("div", { class: "vstack g8" }, [
					h("p", { class: "date" }, "2016 - 2020"),
					h("p", { class: "bold" }, "Design & Technology @ Parsons School of Design"),
				]),
			]),
			h("div", { class: "section vstack g16" }, [
				h("p", { class: "title" }, "Work Experience"),
				h("div", { class: "vstack g8" }, [
					h("p", { class: "date" }, "2020 - 2024"),
					h("p", { class: "bold" }, "Designer & Developer @ Replit"),
					h("ul", { class: "vstack g8" }, [
						h("li", {}, [
							"Started ",
							h("a", { href: "https://kaboomjs.com" }, "Kaboom"),
							", an open source JavaScript 2D game engine aimed to help beginners learn programming and game making.",
						]),
						h("li", {}, "Worked on design and engineering on Replit web app and the online code editor"),
					]),
				]),
			]),
		]),
	]),
])
