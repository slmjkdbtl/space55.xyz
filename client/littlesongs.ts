import {
	SpriteData,
	createGame,
	loadAssets,
} from "www/game"

import {
	Vec2,
	vec2,
	rgb,
	hsl,
	wave,
} from "www/math"

import {
	isTouch,
} from "www/utils"

const R = "/static/lilfang"
const WIDTH = 480
const HEIGHT = 480
const ANIM_FPS = 8

const g = createGame({
	canvas: document.querySelector("#cover") as HTMLCanvasElement,
	width: WIDTH,
	height: HEIGHT,
	background: [255, 255, 255],
	// transparent: true,
	allowScroll: true,
	globalMousePos: true,
})

g.focus()

function seq(name: string, num: number) {
	const files = []
	for (let i = 1; i <= num; i++) {
		files.push(name.replace("?", i + ""))
	}
	return files
}

function framen(n: number) {
	return Math.floor(g.time() * ANIM_FPS % n)
}

const assets = loadAssets({
	sprites: {
		lilfang: g.loadSpritesAnim(seq(`${R}/lilfang_noeye-?.png`, 3)),
		eye: g.loadSpritesAnim(seq(`${R}/lilfang_eye-?.png`, 3)),
		moon: g.loadSpritesAnim(seq(`${R}/moon-?.png`, 3)),
	},
})

let eyeFixed = isTouch

function drawLilfang(opts: {
	lookat: Vec2,
	pos: Vec2,
	angle?: number,
}) {

	// TODO: eye pos when rotating
	const leftEyeCenter = vec2(-46, -9)
	const rightEyeCenter = vec2(-16, -10)
	const eyeDist = eyeFixed ? 0 : 1.5
	const d1 = opts.lookat.sub(opts.pos.add(leftEyeCenter)).unit().scale(eyeDist)
	const d2 = opts.lookat.sub(opts.pos.add(rightEyeCenter)).unit().scale(eyeDist)

	g.pushTransform()
	g.pushTranslate(opts.pos)
	g.pushRotate(opts.angle ?? 0)
	g.drawSprite({
		sprite: assets.sprites["lilfang"],
		frame: framen(3),
		anchor: "center",
	})

	g.pushTransform()
	g.pushTranslate(leftEyeCenter.add(d1))
	g.drawSprite({
		sprite: assets.sprites["eye"],
		frame: framen(3),
		anchor: "center",
	})
	g.popTransform()

	g.pushTransform()
	g.pushTranslate(rightEyeCenter.add(d2))
	g.drawSprite({
		sprite: assets.sprites["eye"],
		frame: framen(3),
		anchor: "center",
	})
	g.popTransform()

	g.popTransform()

}

g.run(() => {

	if (!assets.ready) {
		return
	}

	const mpos = g.mousePos()
	const lookat = mpos

	if (g.isKeyPressed("space")) {
		eyeFixed = !eyeFixed
	}

	g.pushTransform()
	g.pushTranslate(vec2(260, 300))
	g.drawSprite({
		sprite: assets.sprites["moon"], frame: framen(3),
		anchor: "center",
	})
	g.popTransform()

	drawLilfang({
		lookat: lookat,
		pos: vec2(350, 400),
	})

})
