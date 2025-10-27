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

// function dottedLine(pts: Vec2[], len: number): Line[] {
	// const lines: Line[] = []
	// for (let i = 0; i < pts.length - 1; i++) {
		// const p1 = pts[i]
		// const p2 = pts[i + 1]
	// }
	// return lines
// }

const WIDTH = 200
const HEIGHT = 200
const SCALE = 2
const ANIM_FPS = 8

const g = createGame({
	width: WIDTH,
	height: HEIGHT,
	scale: SCALE,
	crisp: true,
	// pixelDensity: 1,
	background: [255, 255, 255],
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

const a = "/static/lilfang"

const assets = loadAssets({
	sprites: {
		lilfang: g.loadSpritesAnim(seq(`${a}/lilfang_head-?.png`, 3)),
		face: g.loadSpritesAnim(seq(`${a}/lilfang_face-?.png`, 1)),
		eye: g.loadSpritesAnim(seq(`${a}/lilfang_eye-?.png`, 3)),
		mouth: g.loadSpritesAnim(seq(`${a}/lilfang_mouth-?.png`, 6), {
			anims: {
				idle: { from: 0, to: 2, loop: true, },
				talk: { from: 3, to: 5, loop: true, },
			},
		}),
		moon: g.loadSpritesAnim(seq(`${a}/moon-?.png`, 3)),
		btfly: g.loadSpritesAnim(seq(`${a}/btfly-?.png`, 2)),
		bg: g.loadSpritesAnim(seq(`${a}/bg-?.jpg`, 8)),
		flower: g.loadSprite(`${a}/flower.png`),
		bear: g.loadSprite(`${a}/bear.png`),
	},
	audio: {
		song: g.loadAudio(`${a}/song.mp3`),
	},
	sounds: {
		horn: g.loadSound(`${a}/horn.mp3`),
	},
	fonts: {
		["04b03"]: g.loadBitmapFont(`${a}/04b03_6x8.png`, 6, 8),
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
	trail: createTrail(12, 20),
}

const MAX_LILFANG_POS_HIST = 48

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
	sprite: string,
	angle: number,
	time: number,
}

const flowers: Flower[] = []

g.onKeyPress("space", () => {
	g.tween(0, 360, 0.4, (v) => lilfang.angle = v, easings.easeOutCubic)
})

g.onKeyPress("c", () => {
	crazy = !crazy
})

g.onKeyPress("h", () => {
	g.playSound(assets.sounds["horn"])
})

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
const BG_TIME = 7
const BG_TRANSITION = 1

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

const bgCanvas = g.createCanvas(g.width(), g.height(), { wrap: "mirroredRepeat" })

const flowerTimer = loop(0.3, () => {
	const f: Flower = {
		sprite: choose(["flower"]),
		pos: vec2(rand(0, g.width()), rand(0, g.height())),
		angle: rand(0, 360),
		time: 0,
	}
	flowers.push(f)
})

g.run(() => {

	if (!assets.ready) {
		// TODO
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

	crazyIntensity = lerp(crazyIntensity, crazy ? 1 : 0, g.dt() * 1.0)

	bgCanvas.draw(() => {

		// TODO: ppt transition effects
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
			f.time += g.dt()
			if (f.time >= 1.5) {
				flowers.splice(i, 1)
				continue
			}
			g.drawSprite({
				sprite: assets.sprites[f.sprite],
				pos: f.pos,
				angle: f.angle + g.time() * 60,
				scale: Math.sin(f.time * 2) * 1.5,
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
		lilfang.posHist.push(shake(lilfang.pos, 16))
		if (lilfang.posHist.length > MAX_LILFANG_POS_HIST) {
			lilfang.posHist.shift()
		}
	} else {
		lilfang.posHist.shift()
	}

	if (crazy) {
		flowerTimer.update(g.dt())
	}

	const d = 2

	drawLilFang({
		crazy: crazy,
		lookat: btfly.pos,
		pos: crazy ? lilfang.pos.add(vec2(rand(-d, d), rand(-d, d))) : lilfang.pos,
		angle: lilfang.angle,
		talking: talking > 0,
	})

	for (let i = 0; i < btfly.trail.pts.length - 1; i++) {
		const p1 = btfly.trail.pts[i]
		const p2 = btfly.trail.pts[i + 1]
		const d = p2.sub(p1).unit()
		g.drawLine({
			p1: p1,
			p2: p1.add(d.scale(6)),
			width: 2,
			opacity: map(i, 0, btfly.trail.max, 0, 0.5),
			color: rgb(255, 255, 255),
		})
	}

	btfly.lastPos = btfly.pos.clone()
	btfly.pos = btfly.pos.lerp(mpos, dt * 4)
	btfly.trail.push(btfly.pos)
	btfly.angle = btfly.pos.angle(btfly.lastPos)

	g.drawSprite({
		pos: crazy ? shake(btfly.pos) : btfly.pos,
		angle: btfly.angle + 90,
		sprite: assets.sprites["btfly"], frame: anim("btfly"),
		anchor: "center",
	})

	// g.drawText({
		// text: `${song.currentTime}`,
		// font: assets.fonts["04b03"],
		// size: 16,
		// pos: vec2(16),
	// })

})
