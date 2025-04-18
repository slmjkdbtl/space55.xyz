import * as fs from "fs"
import * as path from "path"
import { h, css, cc, csslib, js } from "./www"

const skills = [
	{
		name: "Software Engineering",
		points: [
			"Mainly worked in front-end and game dev context, have full-stack experience for personal projects",
			"Very fluent in JavaScript, TypeScript, HTML and CSS, also have written a lot of Lua, C and Rust",
			"Love simple, clean, readable, maintainable code",
		],
	},
	{
		name: "UI/UX Design",
		points: [
			"Good at user centered design with touch of fun, creativity and individuality",
			"Good at expressing brand identity and consistency",
			"Fluent in softwares like Figma, Sketch, Affinity Designer, Photoshop, Illustrator etc",
		],
	},
	{
		name: "Game Design",
		points: [
			"Have designed and developed several small games and digital toys, doing all the design, visuals, development and music",
			"Knows how game engines work, have developed some small engines for personal use and have used engines like Unity, Godot, Love2D etc",
			"Knows how rendering work, have worked with low level stuff like OpenGL, WebGL and software rendering"
		],
	},
]

const experiences = [
	{
		role: "Designer & Developer",
		place: "Replit",
		start: "2020.12",
		end: "2024.06",
		points: [
			"Created <a href=\"https://kaboomjs.com\">Kaboom</a>, an open source JavaScript 2D game engine aimed to help beginners learn programming and game making",
			"Worked on design and engineering on Replit web app and the online code editor (typescript, react, figma)",
		],
	},
	{
		role: "Designer & Developer",
		place: "Gamecores",
		start: "2019.05",
		end: "2019.08",
		points: [
			"Designed and developed 3 built-in games & apps for DEOT (a DIY handheld gaming console) in Lua & Love2d",
		],
	},
]

const education = [
	{
		major: "Design & Technology",
		school: "Parsons School of Design",
		level: "BFA",
		start: "2016.09",
		end: "2020.05",
	},
]

const sites = [
	{ name: "Midorii", url: "https://coilsprite.com", img: "coilsprite.jpg" },
	{ name: "DEOT", url: "https://deot.vercel.app/", img: "deot.jpg" },
	{ name: "Locus Chen", url: "https://old.locuschen.com/", img: "locus.jpg" },
	{ name: "tga", url: "https://space55.xyz/", img: "space55.jpg" },
	{ name: "FFF Food Studio", url: "http://64.23.143.14:4004/", img: "fff.jpg" },
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
	{ name: "dirty", desc: "personal single header C library collection, including graphics engine, audio engine, scripting language, etc", img: "dirty.gif", url: "https://github.com/slmjkdbtl/dirty" },
	{ name: "kaboom", desc: "2d JavaScript game engine", url: "https://github.com/replit/kaboom", img: "kaboom.gif" },
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
				"display": "inline",
				"width": "fit-content",
				":hover": {
					"color": "#ffffff",
					"background": "#0000ff",
				},
			},
			"ul,ol": {
				...cc("vstack g-8"),
				"padding-left": "20px",
			},
			"h1": {
				"font-weight": "bold",
				"font-size": "1.5rem",
			},
			"h2,h3,h4,h5,h6": {
				"font-weight": "bold",
				"font-size": "1rem",
			},
			".date": {
				"color": "#666",
				"font-style": "italic",
			},
			".section": {
				...cc("vstack g-16")
			},
			".works": {
				...cc("grid g-16 fill-x colw-240")
			},
		})),
	]),
	h("body", {}, [
		h("main", { class: "vstack g-48" }, [
			h("div", { class: "vstack g-8" }, [
				h("img", { src: "/static/img/tga.png", class: "w-40" }),
				h("p", {}, "tga 吴曦远"),
				h("a", { href: "mailto:tga@space55.xyz" }, "tga@space55.xyz"),
				h("a", { href: "https://space55.xyz" }, "website"),
			]),
			h("div", { class: "section" }, [
				h("h1", {}, "Work Experience"),
				h("div", { class: "vstack g-16" }, experiences.map((e) => {
					return h("div", { class: "vstack g-8" }, [
						h("p", { class: "date" }, `${e.start} - ${e.end}`),
						h("h2", {}, `${e.role} @ ${e.place}`),
						h("ul", { class: "vstack g-8" }, e.points.map((p) => {
							return h("li", {}, p)
						})),
					])
				})),
			]),
			h("div", { class: "section" }, [
				h("h1", {}, "Education"),
				h("div", { class: "vstack g-16" }, education.map((e) => {
					return h("div", { class: "vstack g-8" }, [
						h("p", { class: "date" }, `${e.start} - ${e.end}`),
						h("h2", {}, `${e.major} @ ${e.school}`),
					])
				})),
			]),
			h("div", { class: "section" }, [
				h("h1", {}, "Skills"),
				h("div", { class: "vstack g-16" }, skills.map((s) => {
					return h("div", { class: "vstack g-16" }, [
						h("h2", {}, s.name),
						h("ul", {}, s.points.map((p) => {
							return h("li", {}, p)
						}))
					])
				})),
			]),
			h("div", { class: "section" }, [
				h("h1", {}, "Web Design & Development"),
				h("p", { class: "desc" }, "I make websites for artists, designers, musicians and creative studios etc. I do everything including design, illustration, development and deployment."),
				h("div", { class: "works" }, sites.map((w) => {
					return h("div", { class: "vstack g-8 fill-x" }, [
						h("a", { href: w.url }, w.name),
						h("img", { class: "media fill-x", src: `/static/img/sites/${w.img}` }),
					])
				})),
			]),
			h("div", { class: "section" }, [
				h("h1", {}, "Games & Digital Toys"),
				h("p", { class: "desc" }, "I make some small games and digital toys. You can find gameplay videos <a href=\"https://vimeo.com/slmjkdbtl\">here</a>."),
				h("div", { class: "works" }, games.map((g) => {
					return h("div", { href: g.url, class: "vstack g-8 fill-x" }, [
						h("a", { class: "name", href: g.url }, g.name),
						h("p", { class: "desc", }, g.desc),
						h("img", { class: "media fill-x", src: `/static/img/games/${g.img}` }),
					])
				})),
			]),
			h("div", { class: "section" }, [
				h("h1", {}, "Code"),
				h("p", { class: "desc" }, "I'm most fluent in JavaScript / TypeScript, also have written a lot of Lua, C, Rust in personal projects. Check out my <a href=\"https://github.com/slmjkdbtl/\">Github</a>."),
				h("div", { class: "works" }, code.map((c) => {
					return h("div", { href: c.url, class: "vstack g-8 fill-x" }, [
						h("a", { class: "name", href: c.url }, c.name),
						h("p", { class: "desc", }, c.desc),
						h("img", { class: "media fill-x", src: `/static/img/code/${c.img}` }),
					])
				})),
			]),
			h("div", { class: "section" }, [
				h("h1", {}, "Music"),
				h("p", { class: "desc" }, "I play tenor saxophone, and some trumpet, flute and bass. Mostly in the free jazz / improv scene. You can find some videos of my performances <a href=\"/files/music\">here</a>."),
			]),
		]),
	]),
])
