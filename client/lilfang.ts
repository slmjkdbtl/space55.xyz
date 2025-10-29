import {
	createGame,
	loadAssets,
} from "www/game"

import {
	Vec2,
	Color,
	Line,
	vec2,
	rgb,
	hsl,
	map,
	mapc,
	lerp,
	wave,
	deg2rad,
	rand,
	easings,
	loop,
	choose,
	Trail,
	createTrail,
} from "www/math"

const WIDTH = 200
const HEIGHT = 200
const SCALE = 2
const G = 300
const ANIM_FPS = 8
const MAX_LILFANG_POS_HIST = 48
const BG_TIME = 7
const BG_TRANSITION = 1
const R = "/static/lilfang"
const TRAIL_SPACE = 12
const TRAIL_LEN = 3
const TRAIL_TIME = 0.5
const FLOWER_TIME = 1.5

const g = createGame({
	width: WIDTH,
	height: HEIGHT,
	scale: SCALE,
	crisp: true,
	// pixelDensity: 1,
	// background: [255, 255, 255],
	background: [0, 0, 0],
})

g.setCursor("none")
g.focus()

function seq(name: string, num: number) {
	const files = []
	for (let i = 1; i <= num; i++) {
		files.push(name.replace("?", i + ""))
	}
	return files
}

function anim(name: string, animName?: string) {
	const spr = assets.sprites[name]
	const anim = animName ? spr.anims[animName] : null
	if (anim) {
		return anim.from + Math.floor(g.time() * ANIM_FPS % (anim.to - anim.from))
	} else {
		return Math.floor(g.time() * ANIM_FPS % spr.frames.length)
	}
}

const assets = loadAssets({
	sprites: {
		lilfang: g.loadSpritesAnim(seq(`${R}/lilfang_head-?.png`, 3)),
		face: g.loadSpritesAnim(seq(`${R}/lilfang_face-?.png`, 1)),
		eye: g.loadSpritesAnim(seq(`${R}/lilfang_eye-?.png`, 3)),
		mouth: g.loadSpritesAnim(seq(`${R}/lilfang_mouth-?.png`, 6), {
			anims: {
				idle: { from: 0, to: 2, loop: true, },
				talk: { from: 3, to: 5, loop: true, },
			},
		}),
		moon: g.loadSpritesAnim(seq(`${R}/moon-?.png`, 3)),
		btfly: g.loadSpritesAnim(seq(`${R}/btfly-?.png`, 2)),
		bg: g.loadSpritesAnim(seq(`${R}/bg-?.jpg`, 8)),
		flower: g.loadSprite(`${R}/flower.png`),
		bear: g.loadSprite(`${R}/bear.png`),
		hairband: g.loadSprite(`${R}/hairband.png`),
	},
	audio: {
		song: g.loadAudio(`${R}/song.mp3`),
	},
	sounds: {
		horn: g.loadSound(`${R}/horn.mp3`),
	},
	fonts: {
		["04b03"]: g.loadBitmapFont(`${R}/04b03_6x8.png`, 6, 8),
	},
})

const crazyShader = g.createShader(null, `
uniform float u_time;
uniform float u_intensity;

float rand(vec2 co){
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
	float dx = sin(u_time + v_uv.y * 16.0) / 10.0 * u_intensity + rand(uv) * 0.01 * u_intensity;
	float dy = sin(u_time + v_uv.x * 16.0) / 30.0 * u_intensity + rand(uv) * 0.01 * u_intensity;
	vec4 c = v_color * texture2D(u_tex, vec2(v_uv.x + dx, v_uv.y + dy));
	return c;
}
`)

function shake(p: Vec2, s: number = 2) {
	return p.add(vec2(rand(-s, s), rand(-s, s)))
}

function drawLilFang(opt: {
	lookat: Vec2,
	pos: Vec2,
	angle?: number,
	crazy?: boolean,
	talking?: boolean,
}) {

	// TODO: eye pos when rotating
	const leftEyeCenter = vec2(-13, -1)
	const rightEyeCenter = vec2(13, -2)
	const eyeDist = 2
	const d1 = opt.lookat.sub(opt.pos.add(leftEyeCenter)).unit().scale(eyeDist)
	const d2 = opt.lookat.sub(opt.pos.add(rightEyeCenter)).unit().scale(eyeDist)

	for (let i = 0; i < lilfang.posHist.length - 1; i++) {
		g.drawSprite({
			pos: lilfang.posHist[i],
			sprite: assets.sprites["face"],
			opacity: map(i, 0, MAX_LILFANG_POS_HIST, 0.2, 0.7),
			anchor: "center",
		})
	}

	g.pushTransform()
	g.pushTranslate(crazy ? shake(opt.pos) : opt.pos)
	g.pushRotate(opt.angle ?? 0)
	g.pushScale(vec2(1.5))

	g.drawSprite({
		sprite: assets.sprites["lilfang"],
		frame: anim("lilfang"),
		anchor: "center",
	})

	g.pushTransform()
	g.pushTranslate(leftEyeCenter.add(d1))
	// g.pushTranslate(leftEyeCenter.add(crazy ? vec2(rand(-eyeDist, eyeDist), rand(-eyeDist, eyeDist)) : d1))
	g.drawSprite({
		sprite: assets.sprites["eye"],
		frame: anim("eye"),
		anchor: "center",
	})
	g.popTransform()

	g.pushTransform()
	g.pushTranslate(rightEyeCenter.add(d2))
	// g.pushTranslate(rightEyeCenter.add(crazy ? vec2(rand(-eyeDist, eyeDist), rand(-eyeDist, eyeDist)) : d2))
	g.drawSprite({
		sprite: assets.sprites["eye"],
		frame: anim("eye"),
		anchor: "center",
	})
	g.popTransform()

	g.pushTransform()
	g.pushTranslate(vec2(0, 10))
	g.drawSprite({
		sprite: assets.sprites["mouth"],
		frame: anim("mouth", opt.talking ? "talk" : "idle"),
		anchor: "center",
	})
	g.popTransform()

	g.popTransform()

}

let debug = false
let crazy = false
let crazyIntensity = 0
let talking = 0

type Btfly = {
	pos: Vec2,
	angle: number,
	lastPos: Vec2,
	trail: Trail,
}

const btfly: Btfly = {
	pos: vec2(0),
	angle: 0,
	lastPos: vec2(0),
	trail: createTrail(TRAIL_SPACE),
}

type LilFang = {
	pos: Vec2,
	angle: number,
	posHist: Vec2[],
}

const lilfang: LilFang = {
	pos: vec2(g.width() / 2, g.height() / 2),
	angle: 0,
	posHist: [],
}

type Flower = {
	pos: Vec2,
	angle: number,
	time: number,
}

type Hairband = {
	pos: Vec2,
	angle: number,
	vel: Vec2,
}

const flowers: Flower[] = []
const hairbands: Hairband[] = []

let popCursor = 0

const popSoundsTime = [
	9.15,
	27.15,
	27.3,
	27.45,
	40.05,
	40.15,
	57.25,
	57.35,
	115.3,
	115.5,
	115.7,
	121.9,
	121.9,
	130.15,
	130.4,
	130.5,
	130.75,
	182.55,
	182.65,
]

let curBg = 0
let bgTimer = 0
const trail: Poop[] = []
const bgCanvas = g.createCanvas(g.width(), g.height(), { wrap: "mirroredRepeat" })

const flowerTimer = loop(0.3, () => {
	const padX = 0
	const padY = 0
	flowers.push({
		pos: vec2(rand(padX, g.width() - padX), rand(padY, g.height() - padY)),
		angle: rand(0, 360),
		time: 0,
	})
})

const hairbandTimer = loop(0.8, () => {
	const padX = 0
	const pos = vec2(rand(padX, g.width() - padX), g.height())
	hairbands.push({
		pos: pos,
		angle: rand(0, 360),
		vel: vec2(rand(20, 100) * (pos.x < g.width() / 2 ? 1 : -1), rand(-300, -200)),
	})
})

assets.onReady(() => {
	g.onKeyPress("p", () => {
		const song = assets.audio["song"]
		if (song.paused) {
			g.playAudio(song)
		} else {
			song.pause()
		}
	})
})

type Poop = {
	p1: Vec2,
	p2: Vec2,
	time: number,
}

g.onKeyPress("space", () => {
	g.tween(0, 360, 0.4, (v) => lilfang.angle = v, easings.easeOutCubic)
})

g.onKeyPress("c", () => {
	crazy = !crazy
})

g.onKeyPress("h", () => {
	g.playSound(assets.sounds["horn"])
})

g.onKeyPress("f1", () => {
	debug = !debug
})

g.onKeyPress("right", () => {
	const song = assets.audio["song"]
	song.currentTime += 1.0
})

g.onKeyPress("left", () => {
	const song = assets.audio["song"]
	song.currentTime -= 1.0
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

g.run(() => {

	if (!assets.ready) {
		drawProgress(assets.progress)
		return
	}

	const song = assets.audio["song"]

	const dt = g.dt()
	const mpos = g.mousePos()
	const lookat = mpos

	const nextPop = popSoundsTime[popCursor]

	if (song.currentTime >= nextPop) {
		talking += 1
		g.wait(0.15, () => {
			talking -= 1
		})
		popCursor += 1
	}

	const bgSprite = assets.sprites["bg"]
	bgTimer += dt

	if (bgTimer >= BG_TIME) {
		curBg = (curBg + 1) % bgSprite.frames.length
		bgTimer = 0
	}

	crazyIntensity = lerp(crazyIntensity, crazy ? 1 : 0, dt * 1.0)

	bgCanvas.draw(() => {

		g.drawSprite({
			sprite: bgSprite,
			frame: (curBg + 1) % bgSprite.frames.length,
			width: g.width(),
			height: g.height(),
		})

		g.drawSprite({
			sprite: bgSprite,
			frame: curBg,
			width: g.width(),
			height: g.height(),
			opacity: bgTimer >= BG_TIME - BG_TRANSITION ? mapc(bgTimer, BG_TIME - BG_TRANSITION, BG_TIME, 1, 0) : 1,
		})

		if (crazy) {
			g.drawRect({
				width: g.width(),
				height: g.height(),
				color: hsl(wave(0, 1, g.time() * 2), 0.5, 0.5),
				opacity: crazyIntensity * 0.1,
			})
		}

		for (let i = flowers.length - 1; i >= 0; i--) {
			const f = flowers[i]
			f.time += dt
			if (f.time >= FLOWER_TIME) {
				flowers.splice(i, 1)
				continue
			}
			g.drawSprite({
				sprite: assets.sprites["flower"],
				pos: f.pos,
				angle: f.angle + g.time() * 60,
				scale: Math.sin(f.time * Math.PI / FLOWER_TIME) * 1.5,
				anchor: "center",
			})
		}

	})

	g.drawCanvas({
		canvas: bgCanvas,
		shader: crazyShader,
		uniform: {
			"u_time": g.time(),
			"u_intensity": crazyIntensity,
		},
	})

	if (crazy) {
		lilfang.posHist.push(shake(lilfang.pos, 20))
		if (lilfang.posHist.length > MAX_LILFANG_POS_HIST) {
			lilfang.posHist.shift()
		}
	} else {
		lilfang.posHist.shift()
	}

	if (crazy) {
		flowerTimer.update(dt)
		hairbandTimer.update(dt)
	}

	const d = 2

	drawLilFang({
		crazy: crazy,
		lookat: btfly.pos,
		pos: crazy ? lilfang.pos.add(vec2(rand(-d, d), rand(-d, d))) : lilfang.pos,
		angle: lilfang.angle,
		talking: talking > 0,
	})

	btfly.lastPos = btfly.pos.clone()
	btfly.pos = btfly.pos.lerp(mpos, dt * 4)
	btfly.angle = btfly.pos.angle(btfly.lastPos)
	btfly.trail.push(btfly.pos)

	for (let i = 0; i < btfly.trail.pts.length - 1; i++) {
		const p1 = btfly.trail.pts[i]
		const p2 = btfly.trail.pts[i + 1]
		const d = p2.sub(p1).unit()
		trail.push({
			p1: p1.clone(),
			p2: p1.add(d.scale(TRAIL_LEN)),
			time: 0,
		})
	}

	btfly.trail.pts.splice(0, btfly.trail.pts.length - 1)

	for (let i = trail.length - 1; i >= 0; i--) {
		const t = trail[i]
		t.time += dt
		if (t.time >= TRAIL_TIME) {
			trail.splice(i, 1)
			continue
		}
		const center = t.p1.add(t.p2).scale(0.5)
		g.pushTransform()
		g.pushTranslate(center)
		g.pushScale(Math.sin(t.time * Math.PI / TRAIL_TIME))
		g.drawLine({
			p1: t.p1.sub(center),
			p2: t.p2.sub(center),
			width: 1.5,
			cap: "round",
		})
		g.popTransform()
	}

	g.drawSprite({
		pos: crazy ? shake(btfly.pos) : btfly.pos,
		angle: btfly.angle + 90,
		sprite: assets.sprites["btfly"], frame: anim("btfly"),
		anchor: "center",
	})

	for (let i = hairbands.length - 1; i >= 0; i--) {
		const h = hairbands[i]
		const t = g.time() + h.angle
		h.vel.y += G * dt
		h.pos = h.pos.add(h.vel.scale(dt))
		g.drawSprite({
			sprite: assets.sprites["hairband"],
			pos: h.pos,
			angle: h.angle + g.time() * 60 * (h.vel.x < 0 ? -1 : 1),
			scale: vec2(wave(0.8, 1.2, t * 8), wave(0.8, 1.2, t * 8 + Math.PI)),
			anchor: "center",
		})
	}

	if (debug) {
		g.drawText({
			text: `${song.currentTime}`,
			font: assets.fonts["04b03"],
			size: 16,
			pos: vec2(8),
		})
	}

})
