import {
	createGame,
	loadAssets,
	SpriteData,
	VideoData,
} from "www/game"

import {
	Vec2,
	vec2,
	testRectPoint,
	Rect,
} from "www/math"

const WIDTH = 240
const HEIGHT = 320
const SCALE = 2
const R = "/static/raccoon"
const NUM_VIDS = 14
const FUZZY = 10
const FUZZY_CHANGE = 100
const ANIM_FPS = 4

const g = createGame({
	width: WIDTH,
	height: HEIGHT,
	scale: SCALE,
	antialias: true,
	background: [0, 0, 0],
	globalMousePos: true,
	// crisp: true,
	// pixelDensity: 1,
	// background: [255, 255, 255],
})

const fuzzyShader = g.createShader(null, `
uniform float u_time;
uniform float u_intensity;
uniform float u_line_width;
uniform float u_line_speed;

float rand(vec2 co){
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 rand_vec2(vec2 seed) {
	return vec2(rand(seed), rand(seed + 17.23));
}

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
	vec2 d = (rand_vec2(uv + u_time) * vec2(2) - vec2(1)) * 0.001 * u_intensity;
	vec4 c = color * texture2D(tex, uv + d);
	vec2 p = gl_FragCoord.xy;
	if (mod((p.y + u_time * u_line_speed) / u_line_width, 2.0) < 1.0) {
		float d = 0.05;
		c -= vec4(d, d, d, 0.0);
	}
	return c;
}
`)

const magShader = g.createShader(null, `
uniform vec2 u_mpos;
uniform vec2 u_res;
uniform float u_size;
uniform float u_zoom;

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
	vec2 gpos = vec2(
		(1.0 + pos.x) * 0.5 * u_res.x,
		(1.0 - pos.y) * 0.5 * u_res.y
	);
	float dist = distance(gpos, u_mpos);
	vec2 center = vec2(
		u_mpos.x / u_res.x,
		1.0 - u_mpos.y / u_res.y
	);
	if (dist < u_size) {
		float t = 1.0 - smoothstep(0.0, u_size, dist);
		float zoom = mix(1.0, u_zoom, t);
		vec2 sample_uv = center + (uv - center) / zoom;
		return color * texture2D(tex, sample_uv);
	}
	return def_frag();
}
`)

const gameCanvas = g.createCanvas(g.width(), g.height())
const magCanvas = g.createCanvas(200, 200)

g.setCursor("none")
g.focus()

const vids: Record<string, Promise<VideoData>> = {}

for (let i = 0; i < NUM_VIDS; i++) {
	vids[`vid${i}`] = g.loadVideo(`${R}/vids/${i}.mp4`)
}

function animRaw(n: number) {
	return Math.floor(g.time() * ANIM_FPS % n)
}

function anim(name: string, animName?: string) {
	const spr = assets.sprites[name]
	const anim = animName ? spr.anims[animName] : null
	if (anim) {
		return anim.from + animRaw(anim.to - anim.from)
	} else {
		return animRaw(spr.frames.length)
	}
}

const assets = loadAssets({
	sprites: {
		cursor: g.loadAsepriteSpritesheet(`${R}/cursor`),
		bg: g.loadAsepriteSpritesheet(`${R}/bg`),
		tv: g.loadAsepriteSpritesheet(`${R}/tv`),
		wizard: g.loadAsepriteSpritesheet(`${R}/wizard`),
		mag: g.loadAsepriteSpritesheet(`${R}/mag`),
		note: g.loadAsepriteSpritesheet(`${R}/note`),
		magBig: g.loadAsepriteSpritesheet(`${R}/mag_big`),
	},
	videos: {
		...vids,
	},
	audio: {
		// song: g.loadAudio(`${R}/song.mp3`),
	},
	sounds: {
		// horn: g.loadSound(`${R}/horn.mp3`),
	},
})

function drawProgress(p: number) {
	const w = 100
	const h = 12
	const pos = vec2((g.width() - w) / 2, (g.height() - h) / 2)
	g.drawRect({
		pos: pos,
		width: w,
		height: h,
		outline: {
			width: 2,
			join: "round",
		},
		fill: false,
	})
	g.drawRect({
		pos: pos,
		width: w * assets.progress,
		height: h,
	})
}

type Cursor =
	| "default"
	| "pointer"

type Tool =
	| "magnifier"
	| "notebook"

let debug = false
let curVid = 0
let fuzzyIntensity = FUZZY
let changingVid = false
let curTool: Tool | null = null
let curCursor: Cursor = "default"
let curNotebookPage = 0

async function toVid(n: number) {
	if (changingVid) return
	const prev = assets.videos[`vid${curVid}`]
	prev.vid.pause()
	changingVid = true
	await g.tween(FUZZY, FUZZY_CHANGE, 0.1, (v) => fuzzyIntensity = v)
	curVid = n
	const cur = assets.videos[`vid${curVid}`]
	cur.vid.play()
	await g.tween(FUZZY_CHANGE, FUZZY, 0.1, (v) => fuzzyIntensity = v)
	changingVid = false
}

const nextVid = () => toVid((curVid + 1) % NUM_VIDS)
const prevVid = () => toVid(curVid - 1 < 0 ? NUM_VIDS - 1 : curVid - 1)

assets.onReady(() => toVid(0))

g.run(() => {

	if (!assets.ready) {
		drawProgress(assets.progress)
		return
	}

	if (g.isKeyPressed("f1")) {
		debug = !debug
	}

	if (g.isKeyPressed("left")) {
		prevVid()
	}

	if (g.isKeyPressed("right")) {
		nextVid()
	}

	if (g.isKeyPressed("escape")) {
		curTool = null
	}

	if (curTool === "notebook") {
		if (g.isKeyPressed("left")) {
			// TODO
		} else if (g.isKeyPressed("right")) {
			// TODO
		}
	}

	gameCanvas.draw(() => {

		let usePointer = false

		gameCanvas.clear()

		g.drawSprite({
			sprite: assets.sprites["bg"],
			frame: anim("bg"),
		})

		g.pushTransform()
		g.pushTranslate(vec2(8, 30))

		const vid = assets.videos[`vid${curVid}`]

		vid.update()

		g.drawVideo({
			video: vid,
			pos: vec2(45, 73).add(vec2(animRaw(2), animRaw(2))),
			width: 140,
			height: 120,
			shader: fuzzyShader,
			uniform: {
				"u_time": g.time(),
				"u_intensity": fuzzyIntensity,
				"u_line_width": 2,
				"u_line_speed": 5,
			},
		})

		g.drawSprite({
			sprite: assets.sprites["tv"],
			frame: anim("tv"),
		})

		g.popTransform()

		g.drawSprite({
			sprite: assets.sprites["wizard"],
			pos: vec2(8, 200),
			frame: anim("wizard"),
		})

		function button(name: string, pos: Vec2, onClick: () => void) {
			const spr = assets.sprites[name]
			let hovering = false
			const rect = new Rect(pos.sub(vec2(spr.width / 2, spr.height / 2)), spr.width, spr.height)
			if (testRectPoint(rect, g.mousePos())) {
				usePointer = true
				hovering = true
				if (g.isMousePressed()) {
					onClick()
				}
			}
			g.drawSprite({
				sprite: spr,
				pos: pos,
				frame: anim(name),
				anchor: "center",
				scale: hovering ? vec2(1.1) : vec2(1),
			})
		}

		if (curTool !== "magnifier") {
			button("mag", vec2(214, 246), () => curTool === null && (curTool = "magnifier"))
		}

		if (curTool !== "notebook") {
			button("note", vec2(200, 284), () => curTool === null && (curTool = "notebook"))
		}

		if (curTool === "notebook") {
			// TODO
		}

		if (curTool !== "magnifier") {
			g.drawSprite({
				sprite: assets.sprites["cursor"],
				pos: g.mousePos().add(vec2(-3, -3)),
				frame: usePointer ? 1 : 0,
			})
		}

	})

	g.drawCanvas({
		canvas: gameCanvas,
		...(curTool === "magnifier" ? {
			shader: magShader,
			uniform: {
				"u_mpos": g.mousePos(),
				"u_res": vec2(gameCanvas.width, gameCanvas.height),
				"u_size": 80,
				"u_zoom": 3,
			},
		} : {})
	})

	if (curTool === "magnifier") {
		g.drawSprite({
			sprite: assets.sprites["magBig"],
			pos: g.mousePos().add(vec2(-100, -90)),
			frame: anim("magBig"),
		})
	}

})
