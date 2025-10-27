// helper functions for creating canvas & webgl based games and toys

if (typeof window === "undefined") {
	throw new Error("app.ts only runs in browser")
}

import {
	Vec2,
	Mat4,
	Color,
	Quad,
	LerpValue,
	map,
	deg2rad,
	rad2deg,
	evaluateBezier,
	vec2,
	tween,
	wait,
	loop,
	Timer,
} from "./math"

import {
	Event,
	EventController,
	overload2,
	deepEq,
	getErrorMsg,
	runes,
} from "./utils"

const DEF_WIDTH = 640
const DEF_HEIGHT = 480

const GAMEPAD_MAP: Record<string, object> = {
	"Joy-Con L+R (STANDARD GAMEPAD Vendor: 057e Product: 200e)": {
		"buttons": {
			"0": "south",
			"1": "east",
			"2": "west",
			"3": "north",
			"4": "lshoulder",
			"5": "rshoulder",
			"6": "ltrigger",
			"7": "rtrigger",
			"8": "select",
			"9": "start",
			"10": "lstick",
			"11": "rstick",
			"12": "dpad-up",
			"13": "dpad-down",
			"14": "dpad-left",
			"15": "dpad-right",
			"16": "home",
			"17": "capture"
		},
		"sticks": {
			"left": { "x": 0, "y": 1 },
			"right": { "x": 2, "y": 3 }
		}
	},
	"Joy-Con (L) (STANDARD GAMEPAD Vendor: 057e Product: 2006)": {
		"buttons": {
			"0": "south",
			"1": "east",
			"2": "west",
			"3": "north",
			"4": "lshoulder",
			"5": "rshoulder",
			"9": "select",
			"10": "lstick",
			"16": "start"
		},
		"sticks": {
			"left": { "x": 0, "y": 1 }
		}
	},
	"Joy-Con (R) (STANDARD GAMEPAD Vendor: 057e Product: 2007)": {
		"buttons": {
			"0": "south",
			"1": "east",
			"2": "west",
			"3": "north",
			"4": "lshoulder",
			"5": "rshoulder",
			"9": "start",
			"10": "lstick",
			"16": "select"
		},
		"sticks": {
			"left": { "x": 0, "y": 1 }
		}
	},
	"Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)": {
		"buttons": {
			"0": "south",
			"1": "east",
			"2": "west",
			"3": "north",
			"4": "lshoulder",
			"5": "rshoulder",
			"6": "ltrigger",
			"7": "rtrigger",
			"8": "select",
			"9": "start",
			"10": "lstick",
			"11": "rstick",
			"12": "dpad-up",
			"13": "dpad-down",
			"14": "dpad-left",
			"15": "dpad-right",
			"16": "home",
			"17": "capture"
		},
		"sticks": {
			"left": { "x": 0, "y": 1 },
			"right": { "x": 2, "y": 3 }
		}
	},
	"default": {
		"buttons": {
			"0": "south",
			"1": "east",
			"2": "west",
			"3": "north",
			"4": "lshoulder",
			"5": "rshoulder",
			"6": "ltrigger",
			"7": "rtrigger",
			"8": "select",
			"9": "start",
			"10": "lstick",
			"11": "rstick",
			"12": "dpad-up",
			"13": "dpad-down",
			"14": "dpad-left",
			"15": "dpad-right",
			"16": "home"
		},
		"sticks": {
			"left": { "x": 0, "y": 1 },
			"right": { "x": 2, "y": 3 }
		}
	}
}

export type Cursor =
	string
	| "auto"
	| "default"
	| "none"
	| "context-menu"
	| "help"
	| "pointer"
	| "progress"
	| "wait"
	| "cell"
	| "crosshair"
	| "text"
	| "vertical-text"
	| "alias"
	| "copy"
	| "move"
	| "no-drop"
	| "not-allowed"
	| "grab"
	| "grabbing"
	| "all-scroll"
	| "col-resize"
	| "row-resize"
	| "n-resize"
	| "e-resize"
	| "s-resize"
	| "w-resize"
	| "ne-resize"
	| "nw-resize"
	| "se-resize"
	| "sw-resize"
	| "ew-resize"
	| "ns-resize"
	| "nesw-resize"
	| "nwse-resize"
	| "zoom-int"
	| "zoom-out"

export type Key =
	| "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12"
	| "`" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0" | "-" | "="
	| "q" | "w" | "e" | "r" | "t" | "y" | "u" | "i" | "o" | "p" | "[" | "]" | "\\"
	| "a" | "s" | "d" | "f" | "g" | "h" | "j" | "k" | "l" | ";" | "'"
	| "z" | "x" | "c" | "v" | "b" | "n" | "m" | "," | "." | "/"
	| "escape" | "backspace" | "enter" | "tab" | "control" | "alt" | "meta" | "space" | " "
	| "left" | "right" | "up" | "down" | "shift"

export type MouseButton =
	| "left"
	| "right"
	| "middle"
	| "back"
	| "forward"

export type GamepadButton =
	| "north"
	| "east"
	| "south"
	| "west"
	| "ltrigger"
	| "rtrigger"
	| "lshoulder"
	| "rshoulder"
	| "select"
	| "start"
	| "lstick"
	| "rstick"
	| "dpad-up"
	| "dpad-right"
	| "dpad-down"
	| "dpad-left"
	| "home"
	| "capture"

export type GamePad = {
	index: number;
	isPressed(b: GamepadButton): boolean,
	isDown(b: GamepadButton): boolean,
	isReleased(b: GamepadButton): boolean,
	getStick(stick: GamepadStick): Vec2,
}

export type GamepadStick = "left" | "right"

export type GamepadDef = {
	buttons: Record<string, GamepadButton>,
	sticks: Partial<Record<GamepadStick, { x: number, y: number }>>,
}

export class ButtonState<T = string> {
	pressed: Set<T> = new Set([])
	pressedRepeat: Set<T> = new Set([])
	released: Set<T> = new Set([])
	down: Set<T> = new Set([])
	update() {
		this.pressed.clear()
		this.released.clear()
		this.pressedRepeat.clear()
	}
	press(btn: T) {
		this.pressed.add(btn)
		this.pressedRepeat.add(btn)
		this.down.add(btn)
	}
	pressRepeat(btn: T) {
		this.pressedRepeat.add(btn)
	}
	release(btn: T) {
		this.down.delete(btn)
		this.pressed.delete(btn)
		this.released.add(btn)
	}
}

class GamepadState {
	buttonState: ButtonState<GamepadButton> = new ButtonState()
	stickState: Map<GamepadStick, Vec2> = new Map()
}

export class FPSCounter {
	#dts: number[] = []
	#timer: number = 0
	fps: number = 0
	tick(dt: number) {
		this.#dts.push(dt)
		this.#timer += dt
		if (this.#timer >= 1) {
			this.#timer = 0
			this.fps = Math.round(1 / (this.#dts.reduce((a, b) => a + b) / this.#dts.length))
			this.#dts = []
		}
	}
}

export type Vertex = {
	pos: Vec2,
	uv: Vec2,
	color: Color,
	opacity: number,
}

export type ImageSource = Exclude<TexImageSource, VideoFrame>
export type TexFilter = "nearest" | "linear"
export type TexWrap = "repeat" | "clampToEdge" | "mirroredRepeat"

export type TextureOpt = {
	filter?: TexFilter,
	wrap?: TexWrap,
}

export type UniformValue =
	number
	| Vec2
	| Color
	| Mat4
	| number[]
	| Vec2[]
	| Color[]

export type UniformKey = Exclude<string, "u_tex">
export type Uniform = Record<UniformKey, UniformValue>

export const DEF_FILTER: TexFilter = "nearest"
export const DEF_WRAP: TexWrap = "repeat"

export type Outline = {
	width: number,
	color: Color,
	join: LineJoin,
}

export type RenderProps = {
	pos?: Vec2,
	scale?: Vec2 | number,
	angle?: number,
	color?: Color,
	opacity?: number,
	uniform?: Uniform,
	shader?: Shader,
	outline?: Outline,
}

type DrawTextureOpt = RenderProps & {
	tex: Texture,
	width?: number,
	height?: number,
	tiled?: boolean,
	flipX?: boolean,
	flipY?: boolean,
	quad?: Quad,
	anchor?: Anchor | Vec2,
}

export type NineSlice = {
	left: number,
	right: number,
	top: number,
	bottom: number,
}

export type LoadSpriteSrc = string | ImageSource

export type LoadSpriteOpt = TextureOpt & {
	sliceX?: number,
	sliceY?: number,
	slice9?: NineSlice,
	frames?: Quad[],
	anims?: SpriteAnims,
}

export type LoadSpritesAnimOpt = {
	anims?: SpriteAnims,
}

export type SpriteAnim = {
	from: number,
	to: number,
	loop?: boolean,
	pingpong?: boolean,
	speed?: number,
}

export type SpriteAnims = Record<string, SpriteAnim>

export interface LoadBitmapFontOpt {
	chars?: string,
	filter?: TexFilter,
	outline?: number,
}

export type SoundData = AudioBuffer
export type AudioData = HTMLAudioElement

export function loadImg(src: string): Promise<HTMLImageElement> {
	const img = new Image()
	img.crossOrigin = "anonymous"
	img.src = src
	return new Promise<HTMLImageElement>((resolve, reject) => {
		img.onload = () => resolve(img)
		img.onerror = (e) => reject(e)
	})
}

export default class TexPacker {
	private textures: Texture[] = []
	private bigTextures: Texture[] = []
	private canvas: HTMLCanvasElement
	private c2d: CanvasRenderingContext2D
	private x: number = 0
	private y: number = 0
	private curHeight: number = 0
	private glCtx: GLCtx
	constructor(glCtx: GLCtx, w: number, h: number) {
		this.glCtx = glCtx
		this.canvas = document.createElement("canvas")
		this.canvas.width = w
		this.canvas.height = h
		this.textures = [Texture.fromImage(glCtx, this.canvas)]
		this.bigTextures = []
		const ctx2D = this.canvas.getContext("2d")
		if (!ctx2D) {
			throw new Error("failed to get canvas 2d context")
		}
		this.c2d = ctx2D
	}
	add(img: ImageSource): [Texture, Quad] {
		if (img.width > this.canvas.width || img.height > this.canvas.height) {
			const tex = Texture.fromImage(this.glCtx, img)
			this.bigTextures.push(tex)
			return [tex, new Quad(0, 0, 1, 1)]
		}
		// next row
		if (this.x + img.width > this.canvas.width) {
			this.x = 0
			this.y += this.curHeight
			this.curHeight = 0
		}
		// next texture
		if (this.y + img.height > this.canvas.height) {
			this.c2d.clearRect(0, 0, this.canvas.width, this.canvas.height)
			this.textures.push(Texture.fromImage(this.glCtx, this.canvas))
			this.x = 0
			this.y = 0
			this.curHeight = 0
		}
		const curTex = this.textures[this.textures.length - 1]
		const pos = new Vec2(this.x, this.y)
		this.x += img.width
		if (img.height > this.curHeight) {
			this.curHeight = img.height
		}
		if (img instanceof ImageData) {
			this.c2d.putImageData(img, pos.x, pos.y)
		} else {
			this.c2d.drawImage(img, pos.x, pos.y)
		}
		curTex.update(this.canvas)
		return [curTex, new Quad(
			pos.x / this.canvas.width,
			pos.y / this.canvas.height,
			img.width / this.canvas.width,
			img.height / this.canvas.height,
		)]
	}
	free() {
		for (const tex of this.textures) {
			tex.free()
		}
		for (const tex of this.bigTextures) {
			tex.free()
		}
	}
}

export type DrawSpriteOpt = RenderProps & {
	sprite: SpriteData,
	frame?: number,
	width?: number,
	height?: number,
	tiled?: boolean,
	flipX?: boolean,
	flipY?: boolean,
	quad?: Quad,
	anchor?: Anchor | Vec2,
}

export type DrawCanvasOpt = RenderProps & {
	canvas: Canvas,
	width?: number,
	height?: number,
	tiled?: boolean,
	flipX?: boolean,
	flipY?: boolean,
	quad?: Quad,
	anchor?: Anchor | Vec2,
}

export type DrawRectOpt = RenderProps & {
	width: number,
	height: number,
	gradient?: [Color, Color],
	horizontal?: boolean,
	fill?: boolean,
	radius?: number,
	anchor?: Anchor | Vec2,
}

export type DrawLineOpt = Omit<RenderProps, "angle" | "scale"> & {
	p1: Vec2,
	p2: Vec2,
	width?: number,
}

export type LineJoin =
	| "none"
	| "round"
	| "bevel"
	| "miter"

export type DrawLinesOpt = Omit<RenderProps, "angle" | "scale"> & {
	pts: Vec2[],
	width?: number,
	radius?: number,
	join?: LineJoin,
}

export type DrawCurveOpt = RenderProps & {
	segments?: number
	width?: number
}

export type DrawBezierOpt = DrawCurveOpt & {
	pt1: Vec2,
	pt2: Vec2,
	pt3: Vec2,
	pt4: Vec2,
}

export type DrawTriangleOpt = RenderProps & {
	p1: Vec2,
	p2: Vec2,
	p3: Vec2,
	fill?: boolean,
	radius?: number,
}

export type DrawCircleOpt = Omit<RenderProps, "angle"> & {
	radius: number,
	start?: number,
	end?: number,
	fill?: boolean,
	gradient?: [Color, Color],
	resolution?: number,
	anchor?: Anchor | Vec2,
}

export type DrawEllipseOpt = RenderProps & {
	radiusX: number,
	radiusY: number,
	start?: number,
	end?: number,
	fill?: boolean,
	gradient?: [Color, Color],
	resolution?: number,
	anchor?: Anchor | Vec2,
}

export type DrawPolygonOpt = RenderProps & {
	pts: Vec2[],
	fill?: boolean,
	indices?: number[],
	offset?: Vec2,
	radius?: number,
	colors?: Color[],
}

export type TextAlign =
	| "center"
	| "left"
	| "right"

export type BitmapFontData = {
	tex: Texture,
	map: Record<string, Quad>,
	size: number,
}

export type DrawTextOpt = RenderProps & {
	text: string,
	font?: string | Font | BitmapFontData,
	size?: number,
	align?: TextAlign,
	width?: number,
	lineSpacing?: number,
	letterSpacing?: number,
	anchor?: Anchor | Vec2,
	transform?: CharTransform | CharTransformFunc,
	styles?: Record<string, CharTransform | CharTransformFunc>,
}

export type FormattedText = {
	width: number,
	height: number,
	chars: FormattedChar[],
	opt: DrawTextOpt,
}

export type FormattedChar = {
	ch: string,
	tex: Texture,
	width: number,
	height: number,
	quad: Quad,
	pos: Vec2,
	scale: Vec2,
	angle: number,
	color: Color,
	opacity: number,
}

export type CharTransformFunc = (idx: number, ch: string) => CharTransform

export type CharTransform = {
	pos?: Vec2,
	scale?: Vec2 | number,
	angle?: number,
	color?: Color,
	opacity?: number,
}

export type SpriteFrame = {
	tex: Texture,
	quad: Quad,
}

export class SpriteData {
	frames: SpriteFrame[]
	anims: SpriteAnims
	width: number
	height: number
	constructor(frames: SpriteFrame[], anims: SpriteAnims, width: number, height: number) {
		this.frames = frames
		this.anims = anims
		this.width = width
		this.height = height
	}
}

export type Canvas = {
	width: number,
	height: number,
	tex: Texture,
	clear: () => void,
	free: () => void,
	toDataURL: () => string,
	toImageData: () => ImageData,
	draw: (action: () => void) => void,
}

export type LoadFontOpt = {
	filter?: TexFilter,
	outline?: Outline,
	size?: number,
}

export class Font {
	fontface: FontFace
	filter: TexFilter = DEF_FONT_FILTER
	size: number = DEF_TEXT_CACHE_SIZE
	outline: Outline | null = null
	constructor(face: FontFace, size: number, outline: Outline, filter: TexFilter) {
		this.fontface = face
		this.size = size
		this.outline = outline
		this.filter = filter
	}
}

export type Anchor =
	"topleft"
	| "top"
	| "topright"
	| "left"
	| "center"
	| "right"
	| "botleft"
	| "bot"
	| "botright"

export type DrawUVQuadOpt = RenderProps & {
	width: number,
	height: number,
	flipX?: boolean,
	flipY?: boolean,
	tex?: Texture,
	quad?: Quad,
	anchor?: Anchor | Vec2,
}

// some default charsets for loading bitmap fonts
const ASCII_CHARS = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"

const DEF_ANCHOR: Anchor = "topleft"
const BG_GRID_SIZE = 64

const DEF_FONT = "monospace"
const DBG_FONT = "monospace"
const DEF_TEXT_SIZE = 32
const DEF_TEXT_CACHE_SIZE = 64
const MAX_TEXT_CACHE_SIZE = 256
const FONT_ATLAS_WIDTH = 2048
const FONT_ATLAS_HEIGHT = 2048
const SPRITE_ATLAS_WIDTH = 2048
const SPRITE_ATLAS_HEIGHT = 2048
// 0.1 pixel padding to texture coordinates to prevent artifact
const UV_PAD = 0.1
const DEF_HASH_GRID_SIZE = 64
const DEF_FONT_FILTER: TexFilter = "linear"

const LOG_MAX = 8
const LOG_TIME = 4

const VERTEX_FORMAT = [
	{ name: "a_pos", size: 2 },
	{ name: "a_uv", size: 2 },
	{ name: "a_color", size: 4 },
]

const STRIDE = VERTEX_FORMAT.reduce((sum, f) => sum + f.size, 0)

const MAX_BATCHED_QUAD = 2048
const MAX_BATCHED_VERTS = MAX_BATCHED_QUAD * 4 * STRIDE
const MAX_BATCHED_INDICES = MAX_BATCHED_QUAD * 6

// vertex shader template, replace {{user}} with user vertex shader code
const VERT_TEMPLATE = `
attribute vec2 a_pos;
attribute vec2 a_uv;
attribute vec4 a_color;

varying vec2 v_pos;
varying vec2 v_uv;
varying vec4 v_color;

vec4 def_vert() {
	return vec4(a_pos, 0.0, 1.0);
}

{{user}}

void main() {
	vec4 pos = vert(a_pos, a_uv, a_color);
	v_pos = a_pos;
	v_uv = a_uv;
	v_color = a_color;
	gl_Position = pos;
}
`

// fragment shader template, replace {{user}} with user fragment shader code
const FRAG_TEMPLATE = `
precision mediump float;

varying vec2 v_pos;
varying vec2 v_uv;
varying vec4 v_color;

uniform sampler2D u_tex;

vec4 def_frag() {
	return v_color * texture2D(u_tex, v_uv);
}

{{user}}

void main() {
	gl_FragColor = frag(v_pos, v_uv, v_color, u_tex);
	if (gl_FragColor.a == 0.0) {
		discard;
	}
}
`

// default {{user}} vertex shader code
const DEF_VERT = `
vec4 vert(vec2 pos, vec2 uv, vec4 color) {
	return def_vert();
}
`

// default {{user}} fragment shader code
const DEF_FRAG = `
vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
	return def_frag();
}
`

export type GLCtx = ReturnType<typeof createGLCtx>

export class Texture {

	ctx: GLCtx
	src: null | ImageSource = null
	glTex: WebGLTexture
	width: number
	height: number

	constructor(ctx: GLCtx, w: number, h: number, opt: TextureOpt = {}) {

		this.ctx = ctx
		const gl = ctx.gl
		this.glTex = ctx.gl.createTexture()
		ctx.onDestroy(() => this.free())

		this.width = w
		this.height = h

		// TODO: no default
		const filter = {
			"linear": gl.LINEAR,
			"nearest": gl.NEAREST,
		}[opt.filter ?? ctx.opts.texFilter ?? DEF_FILTER]

		const wrap = {
			"repeat": gl.REPEAT,
			"clampToEdge": gl.CLAMP_TO_EDGE,
			"mirroredRepeat": gl.MIRRORED_REPEAT,
		}[opt.wrap ?? DEF_WRAP]

		this.bind()

		if (w && h) {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0, gl.RGBA,
				w,
				h,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				null,
			)
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap)
		this.unbind()

	}

	static fromImage(ctx: GLCtx, img: ImageSource, opt: TextureOpt = {}): Texture {
		const tex = new Texture(ctx, img.width, img.height, opt)
		tex.update(img)
		tex.src = img
		return tex
	}

	update(img: ImageSource, x = 0, y = 0) {
		const gl = this.ctx.gl
		this.bind()
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, img)
		this.unbind()
	}

	bind() {
		this.ctx.pushTexture2D(this.glTex)
	}

	unbind() {
		this.ctx.popTexture2D()
	}

	free() {
		this.ctx.gl.deleteTexture(this.glTex)
	}

}

export class FrameBuffer {

	ctx: GLCtx
	tex: Texture
	glFramebuffer: WebGLFramebuffer
	glRenderbuffer: WebGLRenderbuffer

	constructor(ctx: GLCtx, w: number, h: number, opt: TextureOpt = {}) {

		this.ctx = ctx
		const gl = ctx.gl
		ctx.onDestroy(() => this.free())
		this.tex = new Texture(ctx, w, h, opt)
		this.glFramebuffer = gl.createFramebuffer()
		this.glRenderbuffer = gl.createRenderbuffer()
		this.bind()
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h)
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			this.tex.glTex,
			0,
		)
		gl.framebufferRenderbuffer(
			gl.FRAMEBUFFER,
			gl.DEPTH_STENCIL_ATTACHMENT,
			gl.RENDERBUFFER,
			this.glRenderbuffer,
		)
		this.unbind()
	}

	get width() {
		return this.tex.width
	}

	get height() {
		return this.tex.height
	}

	toImageData() {
		const gl = this.ctx.gl
		const data = new Uint8ClampedArray(this.width * this.height * 4)
		this.bind()
		gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, data)
		this.unbind()
		// flip vertically
		const bytesPerRow = this.width * 4
		const temp = new Uint8Array(bytesPerRow)
		for (let y = 0; y < (this.height / 2 | 0); y++) {
			const topOffset = y * bytesPerRow
			const bottomOffset = (this.height - y - 1) * bytesPerRow
			temp.set(data.subarray(topOffset, topOffset + bytesPerRow))
			data.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow)
			data.set(temp, bottomOffset)
		}
		return new ImageData(data, this.width, this.height)
	}

	toDataURL() {
		const canvas = document.createElement("canvas")
		const ctx = canvas.getContext("2d")
		if (!ctx) {
			throw new Error("failed to get canvas 2d context")
		}
		canvas.width = this.width
		canvas.height = this.height
		ctx.putImageData(this.toImageData(), 0, 0)
		return canvas.toDataURL()
	}

	clear() {
		const gl = this.ctx.gl
		gl.clear(gl.COLOR_BUFFER_BIT)
	}

	draw(action: () => void) {
		this.bind()
		action()
		this.unbind()
	}

	bind() {
		this.ctx.pushFramebuffer(this.glFramebuffer)
		this.ctx.pushRenderbuffer(this.glRenderbuffer)
		this.ctx.pushViewport({ x: 0, y: 0, w: this.width, h: this.height })
	}

	unbind() {
		this.ctx.popFramebuffer()
		this.ctx.popRenderbuffer()
		this.ctx.popViewport()
	}

	free() {
		const gl = this.ctx.gl
		gl.deleteFramebuffer(this.glFramebuffer)
		gl.deleteRenderbuffer(this.glRenderbuffer)
		this.tex.free()
	}

}

export class Shader {

	ctx: GLCtx
	glProgram: WebGLProgram

	constructor(ctx: GLCtx, vert: string, frag: string, attribs: string[]) {

		this.ctx = ctx
		ctx.onDestroy(() => this.free())

		const gl = ctx.gl
		const vertShader = gl.createShader(gl.VERTEX_SHADER)
		const fragShader = gl.createShader(gl.FRAGMENT_SHADER)

		if (!vertShader) {
			throw new Error("failed to create vertex shader")
		}

		if (!fragShader) {
			throw new Error("failed to create vertex shader")
		}

		gl.shaderSource(vertShader, vert)
		gl.shaderSource(fragShader, frag)
		gl.compileShader(vertShader)
		gl.compileShader(fragShader)

		const prog = gl.createProgram()
		this.glProgram = prog

		gl.attachShader(prog, vertShader)
		gl.attachShader(prog, fragShader)

		attribs.forEach((attrib, i) => gl.bindAttribLocation(prog, i, attrib))

		gl.linkProgram(prog)

		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			const vertError = gl.getShaderInfoLog(vertShader)
			if (vertError) throw new Error("VERTEX SHADER " + vertError)
			const fragError = gl.getShaderInfoLog(fragShader)
			if (fragError) throw new Error("FRAGMENT SHADER " + fragError)
		}

		gl.deleteShader(vertShader)
		gl.deleteShader(fragShader)

	}

	bind() {
		this.ctx.pushProgram(this.glProgram)
	}

	unbind() {
		this.ctx.popProgram()
	}

	send(uniform: Uniform) {
		const gl = this.ctx.gl
		for (const name in uniform) {
			const val = uniform[name]
			const loc = gl.getUniformLocation(this.glProgram, name)
			if (typeof val === "number") {
				gl.uniform1f(loc, val)
			} else if (val instanceof Mat4) {
				gl.uniformMatrix4fv(loc, false, new Float32Array(val.m))
			} else if (val instanceof Color) {
				gl.uniform3f(loc, val.r, val.g, val.b)
			} else if (val instanceof Vec2) {
				gl.uniform2f(loc, val.x, val.y)
			} else if (Array.isArray(val)) {
				const first = val[0]
				if (typeof first === "number") {
					gl.uniform1fv(loc, val as number[])
				} else if (first instanceof Vec2) {
					// @ts-ignore
					gl.uniform2fv(loc, val.map(v => [v.x, v.y]).flat())
				} else if (first instanceof Color) {
					// @ts-ignore
					gl.uniform3fv(loc, val.map(v => [v.r, v.g, v.b]).flat())
				}
			} else {
				throw new Error("Unsupported uniform data type")
			}
		}
	}

	free() {
		this.ctx.gl.deleteProgram(this.glProgram)
	}

}

export type VertexFormat = {
	name: string,
	size: number,
}[]

export type AudioPlayOpt = {
	paused?: boolean,
	loop?: boolean,
	volume?: number,
	speed?: number,
	detune?: number,
	seek?: number,
}

export type SoundPlayOpt = {
	volume?: number,
	speed?: number,
	detune?: number,
}

export type SoundPlayback = {
	then(action: () => void): EventController,
}

export class BatchRenderer {

	ctx: GLCtx

	glVBuf: WebGLBuffer
	glIBuf: WebGLBuffer
	vqueue: number[] = []
	iqueue: number[] = []
	stride: number
	maxVertices: number
	maxIndices: number

	vertexFormat: VertexFormat
	numDraws: number = 0

	curPrimitive: GLenum | null = null
	curTex: Texture | null = null
	curShader: Shader | null = null
	curUniform: Uniform = {}

	constructor(ctx: GLCtx, format: VertexFormat, maxVertices: number, maxIndices: number) {

		const gl = ctx.gl

		this.vertexFormat = format
		this.ctx = ctx
		this.stride = format.reduce((sum, f) => sum + f.size, 0)
		this.maxVertices = maxVertices
		this.maxIndices = maxIndices

		this.glVBuf = gl.createBuffer()
		ctx.pushArrayBuffer(this.glVBuf)
		gl.bufferData(gl.ARRAY_BUFFER, maxVertices * 4, gl.DYNAMIC_DRAW)
		ctx.popArrayBuffer()

		this.glIBuf = gl.createBuffer()
		ctx.pushElementArrayBuffer(this.glIBuf)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, maxIndices * 4, gl.DYNAMIC_DRAW)
		ctx.popElementArrayBuffer()

	}

	push(
		primitive: GLenum,
		verts: number[],
		indices: number[],
		shader: Shader,
		tex: Texture | null = null,
		uniform: Uniform = {},
	) {
		if (
			primitive !== this.curPrimitive
			|| tex !== this.curTex
			|| shader !== this.curShader
			|| !deepEq(this.curUniform, uniform)
			|| this.vqueue.length + verts.length * this.stride > this.maxVertices
			|| this.iqueue.length + indices.length > this.maxIndices
		) {
			this.flush()
		}
		const indexOffset = this.vqueue.length / this.stride
		for (const v of verts) {
			this.vqueue.push(v)
		}
		for (const i of indices) {
			this.iqueue.push(i + indexOffset)
		}
		this.curPrimitive = primitive
		this.curShader = shader
		this.curTex = tex
		this.curUniform = uniform
	}

	flush() {

		if (
			!this.curPrimitive
			|| !this.curShader
			|| this.vqueue.length === 0
			|| this.iqueue.length === 0
		) {
			return
		}

		const gl = this.ctx.gl

		this.ctx.pushArrayBuffer(this.glVBuf)
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.vqueue))
		this.ctx.pushElementArrayBuffer(this.glIBuf)
		gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(this.iqueue))
		this.ctx.setVertexFormat(this.vertexFormat)
		this.curShader.bind()
		this.curShader.send(this.curUniform)
		this.curTex?.bind()
		gl.drawElements(this.curPrimitive, this.iqueue.length, gl.UNSIGNED_SHORT, 0)
		this.curTex?.unbind()
		this.curShader.unbind()

		this.ctx.popArrayBuffer()
		this.ctx.popElementArrayBuffer()

		this.vqueue = []
		this.iqueue = []
		this.numDraws++

	}

	free() {
		const gl = this.ctx.gl
		gl.deleteBuffer(this.glVBuf)
		gl.deleteBuffer(this.glIBuf)
	}

}

export class Mesh {

	ctx: GLCtx
	glVBuf: WebGLBuffer
	glIBuf: WebGLBuffer
	vertexFormat: VertexFormat
	count: number

	constructor(ctx: GLCtx, format: VertexFormat, verts: number[], indices: number[]) {

		const gl = ctx.gl

		this.vertexFormat = format
		this.ctx = ctx

		this.glVBuf = gl.createBuffer()
		ctx.pushArrayBuffer(this.glVBuf)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)
		ctx.popArrayBuffer()

		this.glIBuf = gl.createBuffer()
		ctx.pushElementArrayBuffer(this.glIBuf)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
		ctx.popElementArrayBuffer()

		this.count = indices.length

	}

	draw(primitive?: GLenum) {
		const gl = this.ctx.gl
		this.ctx.pushArrayBuffer(this.glVBuf)
		this.ctx.pushElementArrayBuffer(this.glIBuf)
		this.ctx.setVertexFormat(this.vertexFormat)
		gl.drawElements(primitive ?? gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0)
		this.ctx.popArrayBuffer()
		this.ctx.popElementArrayBuffer()
	}

	free() {
		const gl = this.ctx.gl
		gl.deleteBuffer(this.glVBuf)
		gl.deleteBuffer(this.glIBuf)
	}

}

function genStack<T>(setFunc: (item: T | null) => void) {
	const stack: T[] = []
	// TODO: don't do anything if pushed item is the same as the one on top?
	const push = (item: T) => {
		stack.push(item)
		setFunc(item)
	}
	const pop = () => {
		stack.pop()
		setFunc(cur() ?? null)
	}
	const cur = () => stack[stack.length - 1]
	return [push, pop, cur] as const
}

export function createGLCtx(gl: WebGLRenderingContext, opts: {
	texFilter?: TexFilter,
} = {}) {

	const gc: Array<() => void> = []

	function onDestroy(action: () => void) {
		gc.push(action)
	}

	function destroy() {
		gc.forEach((action) => action())
		gl.getExtension("WEBGL_lose_context")?.loseContext()
	}

	let curVertexFormat: VertexFormat | null = null

	function setVertexFormat(fmt: VertexFormat) {
		if (deepEq(fmt, curVertexFormat)) return
		curVertexFormat = fmt
		const stride = fmt.reduce((sum, f) => sum + f.size, 0)
		fmt.reduce((offset, f, i) => {
			gl.vertexAttribPointer(i, f.size, gl.FLOAT, false, stride * 4, offset)
			gl.enableVertexAttribArray(i)
			return offset + f.size * 4
		}, 0)
	}

	const [ pushTexture2D, popTexture2D ] =
		genStack<WebGLTexture>((t) => gl.bindTexture(gl.TEXTURE_2D, t))

	const [ pushArrayBuffer, popArrayBuffer ] =
		genStack<WebGLBuffer>((b) => gl.bindBuffer(gl.ARRAY_BUFFER, b))

	const [ pushElementArrayBuffer, popElementArrayBuffer ] =
		genStack<WebGLBuffer>((b) => gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b))

	const [ pushFramebuffer, popFramebuffer ] =
		genStack<WebGLFramebuffer>((b) => gl.bindFramebuffer(gl.FRAMEBUFFER, b))

	const [ pushRenderbuffer, popRenderbuffer ] =
		genStack<WebGLRenderbuffer>((b) => gl.bindRenderbuffer(gl.RENDERBUFFER, b))

	const [ pushViewport, popViewport ] =
		genStack<{ x: number, y: number, w: number, h: number }>((v) => {
			if (v) {
				gl.viewport(v.x, v.y, v.w, v.h)
			} else {
				gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
			}
		})

	const [ pushProgram, popProgram ] = genStack<WebGLProgram>((p) => gl.useProgram(p))

	pushViewport({ x: 0, y: 0, w: gl.drawingBufferWidth, h: gl.drawingBufferHeight })

	return {
		gl,
		opts,
		onDestroy,
		destroy,
		pushTexture2D,
		popTexture2D,
		pushArrayBuffer,
		popArrayBuffer,
		pushElementArrayBuffer,
		popElementArrayBuffer,
		pushFramebuffer,
		popFramebuffer,
		pushRenderbuffer,
		popRenderbuffer,
		pushViewport,
		popViewport,
		pushProgram,
		popProgram,
		setVertexFormat,
	}

}

function anchorPt(orig: Anchor | Vec2): Vec2 {
	switch (orig) {
		case "topleft": return new Vec2(-1, -1)
		case "top": return new Vec2(0, -1)
		case "topright": return new Vec2(1, -1)
		case "left": return new Vec2(-1, 0)
		case "center": return new Vec2(0, 0)
		case "right": return new Vec2(1, 0)
		case "botleft": return new Vec2(-1, 1)
		case "bot": return new Vec2(0, 1)
		case "botright": return new Vec2(1, 1)
		default: return orig
	}
}

function alignPt(align: TextAlign): number {
	switch (align) {
		case "left": return 0
		case "center": return 0.5
		case "right": return 1
		default: return 0
	}
}

export async function loadMap<T>(entries: Record<string, Promise<T>>): Promise<Record<string, T>> {
	return await Promise.all(Object.entries(entries).map(([k, v]) => v.then(val => [k, val] as const)))
		.then((d) => {
			const bucket: Record<string, T> = {}
			for (const [name, data] of d) {
				bucket[name] = data
			}
			return bucket
		})
}

export type AssetsEntries = {
	sprites?: Record<string, Promise<SpriteData>>,
	audio?: Record<string, Promise<AudioData>>,
	sounds?: Record<string, Promise<SoundData>>,
	fonts?: Record<string, Promise<BitmapFontData>>,
	text?: Record<string, Promise<string>>,
}

export type Assets = {
	ready: boolean,
	sprites: Record<string, SpriteData>,
	audio: Record<string, AudioData>,
	sounds: Record<string, SoundData>,
	fonts: Record<string, BitmapFontData>,
	text: Record<string, string>,
	onReady: (action: () => void) => void,
	then: (action: () => void) => void,
}

// TODO: progress
// TODO: kinda ugly
export function loadAssets(entries: AssetsEntries): Assets {

	const onReadyEvent = new Event()
	let spritesLoaded = false
	let audioLoaded = false
	let soundsLoaded = false
	let fontsLoaded = false
	let textLoaded = false
	let sprites: Record<string, SpriteData> = {}
	let audio: Record<string, AudioData> = {}
	let sounds: Record<string, SoundData> = {}
	let fonts: Record<string, BitmapFontData> = {}
	let text: Record<string, string> = {}

	function isReady() {
		return spritesLoaded
			&& audioLoaded
			&& soundsLoaded
			&& fontsLoaded
			&& textLoaded
	}

	function onReady(action: () => void) {
		onReadyEvent.add(action)
	}

	loadMap<SpriteData>(entries.sprites ?? {}).then((s) => {
		spritesLoaded = true
		Object.assign(sprites, s)
		if (isReady()) {
			onReadyEvent.trigger()
		}
	})

	loadMap<AudioData>(entries.audio ?? {}).then((s) => {
		audioLoaded = true
		Object.assign(audio, s)
		if (isReady()) {
			onReadyEvent.trigger()
		}
	})

	loadMap<SoundData>(entries.sounds ?? {}).then((s) => {
		soundsLoaded = true
		Object.assign(sounds, s)
		if (isReady()) {
			onReadyEvent.trigger()
		}
	})

	loadMap<BitmapFontData>(entries.fonts ?? {}).then((s) => {
		fontsLoaded = true
		Object.assign(fonts, s)
		if (isReady()) {
			onReadyEvent.trigger()
		}
	})

	loadMap<string>(entries.text ?? {}).then((s) => {
		textLoaded = true
		Object.assign(text, s)
		if (isReady()) {
			onReadyEvent.trigger()
		}
	})

	return {
		get ready() {
			return isReady()
		},
		sprites: sprites,
		audio: audio,
		fonts: fonts,
		text: text,
		sounds: sounds,
		onReady: onReady,
		then: onReady,
	}

}

export type CreateGameOpts = {
	canvas?: HTMLCanvasElement,
	width?: number,
	height?: number,
	scale?: number,
	touchToMouse?: boolean,
	maxFPS?: number,
	crisp?: boolean,
	pixelDensity?: number,
	background?: [number, number, number] | [number, number, number, number],
}

export type GameCtx = ReturnType<typeof createGame>

// TODO: use this
export class GameError extends Error {
	ctx: GameCtx
	constructor(ctx: GameCtx, msg: string) {
		super(msg)
		this.ctx = ctx
	}
}

export function createGame(gopt: CreateGameOpts = {}) {

	const canvas = gopt.canvas ?? (() => {
		const canvasEl = document.createElement("canvas")
		document.body.append(canvasEl)
		return canvasEl
	})()

	const pd = gopt.pixelDensity ?? window.devicePixelRatio
	const gw = (gopt.width || DEF_WIDTH)
	const gh = (gopt.height || DEF_HEIGHT)
	const gs = gopt.scale || 1
	canvas.width = gw * pd
	canvas.height = gh * pd
	canvas.tabIndex = 0

	const styles = [
		"outline: none",
		"cursor: default",
	]

	styles.push(`width: ${gw * gs}px`)
	styles.push(`height: ${gh * gs}px`)

	if (gopt.crisp) {
		// chrome only supports pixelated and firefox only supports crisp-edges
		styles.push("image-rendering: pixelated")
	}

	canvas.style.cssText = styles.join(";")

	const app = {
		canvas: canvas,
		loopID: null as null | number,
		stopped: false,
		dt: 0,
		time: 0,
		realTime: 0,
		fpsCounter: new FPSCounter(),
		timeScale: 1,
		skipTime: false,
		isHidden: false,
		numFrames: 0,
		mousePos: new Vec2(0),
		mouseDeltaPos: new Vec2(0),
		keyState: new ButtonState<Key>(),
		mouseState: new ButtonState<MouseButton>(),
		gamepadStates: new Map<number, GamepadState>(),
		gamepads: [] as GamePad[],
		charInputted: [] as string[],
		isMouseMoved: false,
		lastWidth: canvas.offsetWidth,
		lastHeight: canvas.offsetHeight,
		events: {
			mouseMove: new Event<void>(),
			mouseDown: new Event<MouseButton>(),
			mousePress: new Event<MouseButton>(),
			mouseRelease: new Event<MouseButton>(),
			charInput: new Event<string>(),
			keyPress: new Event<Key>(),
			keyDown: new Event<Key>(),
			keyPressRepeat: new Event<Key>(),
			keyRelease: new Event<Key>(),
			touchStart: new Event<[Vec2, Touch]>,
			touchMove: new Event<[Vec2, Touch]>,
			touchEnd: new Event<[Vec2, Touch]>,
			gamepadButtonDown: new Event<GamepadButton>(),
			gamepadButtonPress: new Event<GamepadButton>(),
			gamepadButtonRelease: new Event<GamepadButton>(),
			gamepadStick: new Event<[GamepadStick, Vec2]>(),
			gamepadConnect: new Event<GamePad>(),
			gamepadDisconnect: new Event<GamePad>(),
			scroll: new Event<Vec2>(),
			hide: new Event<void>(),
			show: new Event<void>(),
			resize: new Event<void>(),
			input: new Event<void>(),
		},
	}

	function dt() {
		return app.dt * app.timeScale
	}

	function focus() {
		canvas.focus()
	}

	function isFocused(): boolean {
		return document.activeElement === app.canvas
	}

	function isHidden() {
		return app.isHidden
	}

	function time() {
		return app.time
	}

	function fps() {
		return app.fpsCounter.fps
	}

	function numFrames() {
		return app.numFrames
	}

	function screenshot(): string {
		return app.canvas.toDataURL()
	}

	function setCursor(c: Cursor): void {
		app.canvas.style.cursor = c
	}

	function getCursor(): Cursor {
		return app.canvas.style.cursor
	}

	async function setCursorLocked(b: boolean): Promise<void> {
		if (b) {
			return app.canvas.requestPointerLock()
		} else {
			return Promise.resolve(document.exitPointerLock())
		}
	}

	function isCursorLocked(): boolean {
		return !!document.pointerLockElement
	}

	function setFullscreen(f: boolean = true) {
		if (f) {
			app.canvas.requestFullscreen()
		} else {
			document.exitFullscreen()
		}
	}

	function isFullscreen(): boolean {
		return Boolean(document.fullscreenElement)
	}

	function quit() {
		app.stopped = true
		for (const name in canvasEvents) {
			// @ts-ignore
			app.canvas.removeEventListener(name, canvasEvents[name])
		}
		for (const name in docEvents) {
			// @ts-ignore
			document.removeEventListener(name, docEvents[name])
		}
		for (const name in winEvents) {
			// @ts-ignore
			window.removeEventListener(name, winEvents[name])
		}
		resizeObserver.disconnect()
	}

	let timers: Timer[] = []

	function tween2<T extends LerpValue>(...args: Parameters<typeof tween<T>>) {
		let t = tween(...args)
		timers.push(t)
		return t
	}

	function wait2(...args: Parameters<typeof wait>) {
		let t = wait(...args)
		timers.push(t)
		return t
	}

	function loop2(...args: Parameters<typeof loop>) {
		let t = loop(...args)
		timers.push(t)
		return t
	}

	function run(action: () => void) {

		if (app.loopID !== null) {
			cancelAnimationFrame(app.loopID)
		}

		let accumulatedDt = 0

		const frame = (t: number) => {

			if (app.stopped) return

			// TODO: allow background actions?
			if (document.visibilityState !== "visible") {
				app.loopID = requestAnimationFrame(frame)
				return
			}

			const loopTime = t / 1000
			const realDt = loopTime - app.realTime
			const desiredDt = gopt.maxFPS ? 1 / gopt.maxFPS : 0

			app.realTime = loopTime
			accumulatedDt += realDt

			if (accumulatedDt > desiredDt) {

				if (!app.skipTime) {
					app.dt = accumulatedDt
					app.time += dt()
					app.fpsCounter.tick(app.dt)
				}

				accumulatedDt = 0
				app.skipTime = false
				app.numFrames++
				processInput()
				frameStart()

				for (const t of timers) {
					t.update(app.dt)
				}

				timers = timers.filter((t) => !t.done)
				action()
				frameEnd()
				resetInput()

			}

			app.loopID = requestAnimationFrame(frame)

		}

		frame(0)

	}

	function isTouchscreen() {
		return ("ontouchstart" in window) || navigator.maxTouchPoints > 0
	}

	function mousePos(): Vec2 {
		return app.mousePos.clone()
	}

	function mouseDeltaPos(): Vec2 {
		return app.mouseDeltaPos.clone()
	}

	function isMousePressed(m: MouseButton = "left"): boolean {
		return app.mouseState.pressed.has(m)
	}

	function isMouseDown(m: MouseButton = "left"): boolean {
		return app.mouseState.down.has(m)
	}

	function isMouseReleased(m: MouseButton = "left"): boolean {
		return app.mouseState.released.has(m)
	}

	function isMouseMoved(): boolean {
		return app.isMouseMoved
	}

	function isKeyPressed(k?: Key): boolean {
		return k === undefined
			? app.keyState.pressed.size > 0
			: app.keyState.pressed.has(k)
	}

	function isKeyPressedRepeat(k?: Key): boolean {
		return k === undefined
			? app.keyState.pressedRepeat.size > 0
			: app.keyState.pressedRepeat.has(k)
	}

	function isKeyDown(k?: Key): boolean {
		return k === undefined
			? app.keyState.down.size > 0
			: app.keyState.down.has(k)
	}

	function isKeyReleased(k?: Key): boolean {
		return k === undefined
			? app.keyState.released.size > 0
			: app.keyState.released.has(k)
	}

	function onResize(action: () => void): EventController {
		return app.events.resize.add(action)
	}

	// input callbacks
	const onKeyDown = overload2((action: (key: Key) => void) => {
		return app.events.keyDown.add(action)
	}, (key: Key, action: (key: Key) => void) => {
		return app.events.keyDown.add((k) => k === key && action(key))
	})

	const onKeyPress = overload2((action: (key: Key) => void) => {
		return app.events.keyPress.add(action)
	}, (key: Key, action: (key: Key) => void) => {
		return app.events.keyPress.add((k) => k === key && action(key))
	})

	const onKeyPressRepeat = overload2((action: (key: Key) => void) => {
		return app.events.keyPressRepeat.add(action)
	}, (key: Key, action: (key: Key) => void) => {
		return app.events.keyPressRepeat.add((k) => k === key && action(key))
	})

	const onKeyRelease = overload2((action: (key: Key) => void) => {
		return app.events.keyRelease.add(action)
	}, (key: Key, action: (key: Key) => void) => {
		return app.events.keyRelease.add((k) => k === key && action(key))
	})

	const onMouseDown = overload2((action: (m: MouseButton) => void) => {
		return app.events.mouseDown.add((m) => action(m))
	}, (mouse: MouseButton, action: (m: MouseButton) => void) => {
		return app.events.mouseDown.add((m) => m === mouse && action(m))
	})

	const onMousePress = overload2((action: (m: MouseButton) => void) => {
		return app.events.mousePress.add((m) => action(m))
	}, (mouse: MouseButton, action: (m: MouseButton) => void) => {
		return app.events.mousePress.add((m) => m === mouse && action(m))
	})

	const onMouseRelease = overload2((action: (m: MouseButton) => void) => {
		return app.events.mouseRelease.add((m) => action(m))
	}, (mouse: MouseButton, action: (m: MouseButton) => void) => {
		return app.events.mouseRelease.add((m) => m === mouse && action(m))
	})

	function onMouseMove(f: (pos: Vec2, dpos: Vec2) => void): EventController {
		return app.events.mouseMove.add(() => f(mousePos(), mouseDeltaPos()))
	}

	function onCharInput(action: (ch: string) => void): EventController {
		return app.events.charInput.add(action)
	}

	function onTouchStart(f: ([pos, t]: [Vec2, Touch]) => void): EventController {
		return app.events.touchStart.add(f)
	}

	function onTouchMove(f: ([pos, t]: [Vec2, Touch]) => void): EventController {
		return app.events.touchMove.add(f)
	}

	function onTouchEnd(f: ([pos, t]: [Vec2, Touch]) => void): EventController {
		return app.events.touchEnd.add(f)
	}

	function onScroll(action: (delta: Vec2) => void): EventController {
		return app.events.scroll.add(action)
	}

	function onHide(action: () => void): EventController {
		return app.events.hide.add(action)
	}

	function onShow(action: () => void): EventController {
		return app.events.show.add(action)
	}

	function charInputted(): string[] {
		return [...app.charInputted]
	}

	function getGamepads(): GamePad[] {
		return [...app.gamepads]
	}

	function processInput() {
		app.events.input.trigger()
		app.keyState.down.forEach((k) => app.events.keyDown.trigger(k))
		app.mouseState.down.forEach((k) => app.events.mouseDown.trigger(k))
	}

	function resetInput() {
		app.keyState.update()
		app.mouseState.update()
		app.charInputted = []
		app.isMouseMoved = false

		app.gamepadStates.forEach((s) => {
			s.buttonState.update()
			s.stickState.forEach((v, k) => {
				s.stickState.set(k, new Vec2(0))
			})
		})
	}

	function registerGamepad(browserGamepad: Gamepad) {

		const gamepad = {
			index: browserGamepad.index,
			isPressed: (btn: GamepadButton) => {
				return app.gamepadStates.get(browserGamepad.index)?.buttonState.pressed.has(btn) ?? false
			},
			isDown: (btn: GamepadButton) => {
				return app.gamepadStates.get(browserGamepad.index)?.buttonState.down.has(btn) ?? false
			},
			isReleased: (btn: GamepadButton) => {
				return app.gamepadStates.get(browserGamepad.index)?.buttonState.released.has(btn) ?? false
			},
			getStick: (stick: GamepadStick) => {
				return app.gamepadStates.get(browserGamepad.index)?.stickState.get(stick) ?? new Vec2(0)
			},
		}

		app.gamepads.push(gamepad)

		app.gamepadStates.set(browserGamepad.index, {
			buttonState: new ButtonState(),
			stickState: new Map([
				["left", new Vec2(0)],
				["right", new Vec2(0)],
			]),
		})

		return gamepad

	}

	function removeGamepad(gamepad: Gamepad) {
		app.gamepads = app.gamepads.filter((g) => g.index !== gamepad.index)
		app.gamepadStates.delete(gamepad.index)
	}

	type EventList<M> = {
		[event in keyof M]?: (event: M[event]) => void
	}

	const canvasEvents: EventList<HTMLElementEventMap> = {}
	const docEvents: EventList<DocumentEventMap> = {}
	const winEvents: EventList<WindowEventMap> = {}

	canvasEvents.mousemove = (e) => {
		const x = e.offsetX / gs
		const y = e.offsetY / gs
		const dx = e.movementX / gs
		const dy = e.movementY / gs
		const mousePos = new Vec2(x, y)
		const mouseDeltaPos = new Vec2(dx, dy)
		if (isFullscreen()) {
			const cw = app.canvas.width
			const ch = app.canvas.height
			const ww = window.innerWidth
			const wh = window.innerHeight
			const rw = ww / wh
			const rc = cw / ch
			if (rw > rc) {
				const ratio = wh / ch
				const offset = (ww - (cw * ratio)) / 2
				mousePos.x = map(x - offset, 0, cw * ratio, 0, cw)
				mousePos.y = map(y, 0, ch * ratio, 0, ch)
			} else {
				const ratio = ww / cw
				const offset = (wh - (ch * ratio)) / 2
				mousePos.x = map(x , 0, cw * ratio, 0, cw)
				mousePos.y = map(y - offset, 0, ch * ratio, 0, ch)
			}
		}
		app.events.input.addOnce(() => {
			app.isMouseMoved = true
			app.mousePos = mousePos
			app.mouseDeltaPos = mouseDeltaPos
			app.events.mouseMove.trigger()
		})
	}

	const MOUSE_BUTTONS: MouseButton[] = [
		"left",
		"middle",
		"right",
		"back",
		"forward",
	]

	canvasEvents.mousedown = (e) => {
		app.events.input.addOnce(() => {
			const m = MOUSE_BUTTONS[e.button]
			if (!m) return
			app.mouseState.press(m)
			app.events.mousePress.trigger(m)
		})
	}

	canvasEvents.mouseup = (e) => {
		app.events.input.addOnce(() => {
			const m = MOUSE_BUTTONS[e.button]
			if (!m) return
			app.mouseState.release(m)
			app.events.mouseRelease.trigger(m)
		})
	}

	const PREVENT_DEFAULT_KEYS = new Set([
		" ",
		"ArrowLeft",
		"ArrowRight",
		"ArrowUp",
		"ArrowDown",
		"Tab",
	])

	// translate these key names to a simpler version
	const KEY_ALIAS: Record<string, Key> = {
		"ArrowLeft": "left",
		"ArrowRight": "right",
		"ArrowUp": "up",
		"ArrowDown": "down",
		" ": "space",
	}

	canvasEvents.keydown = (e) => {
		if (PREVENT_DEFAULT_KEYS.has(e.key)) {
			e.preventDefault()
		}
		app.events.input.addOnce(() => {
			const k = KEY_ALIAS[e.key] || e.key.toLowerCase()
			if (k.length === 1) {
				app.events.charInput.trigger(k)
				app.charInputted.push(k)
			} else if (k === "space") {
				app.events.charInput.trigger(" ")
				app.charInputted.push(" ")
			}
			if (e.repeat) {
				app.keyState.pressRepeat(k)
				app.events.keyPressRepeat.trigger(k)
			} else {
				app.keyState.press(k)
				app.events.keyPressRepeat.trigger(k)
				app.events.keyPress.trigger(k)
			}
		})
	}

	canvasEvents.keyup = (e) => {
		app.events.input.addOnce(() => {
			const k = KEY_ALIAS[e.key] || e.key.toLowerCase()
			app.keyState.release(k)
			app.events.keyRelease.trigger(k)
		})
	}


	canvasEvents.touchstart = (e) => {
		// disable long tap context menu
		e.preventDefault()
		app.events.input.addOnce(() => {
			const touches = Array.from(e.changedTouches)
			const box = app.canvas.getBoundingClientRect()
			if (gopt.touchToMouse !== false) {
				app.mousePos = new Vec2(
					touches[0].clientX / gs - box.x,
					touches[0].clientY / gs - box.y,
				)
				app.mouseState.press("left")
				app.events.mousePress.trigger("left")
			}
			touches.forEach((t) => {
				app.events.touchStart.trigger(
					[new Vec2(t.clientX / gs - box.x, t.clientY / gs - box.y), t],
				)
			})
		})
	}

	canvasEvents.touchmove = (e) => {
		// disable scrolling
		e.preventDefault()
		app.events.input.addOnce(() => {
			const touches = Array.from(e.changedTouches)
			const box = app.canvas.getBoundingClientRect()
			if (gopt.touchToMouse !== false) {
				const lastMousePos = app.mousePos
				app.mousePos = new Vec2(
					touches[0].clientX / gs - box.x,
					touches[0].clientY / gs - box.y,
				)
				app.mouseDeltaPos = app.mousePos.sub(lastMousePos)
				app.events.mouseMove.trigger()
			}
			touches.forEach((t) => {
				app.events.touchMove.trigger(
					[new Vec2(t.clientX / gs - box.x, t.clientY / gs - box.y), t],
				)
			})
		})
	}

	function handleTouchEnd(e: TouchEvent) {
		const touches = Array.from(e.changedTouches)
		const box = app.canvas.getBoundingClientRect()
		if (gopt.touchToMouse !== false) {
			app.mousePos = new Vec2(
				touches[0].clientX / gs - box.x,
				touches[0].clientY / gs - box.y,
			)
			app.mouseDeltaPos = new Vec2(0,0)
			app.mouseState.release("left")
			app.events.mouseRelease.trigger("left")
		}
		touches.forEach((t) => {
			app.events.touchEnd.trigger(
				[new Vec2(t.clientX / gs - box.x, t.clientY / gs - box.y), t],
			)
		})
	}

	canvasEvents.touchend = (e) => {
		app.events.input.addOnce(() => {
			handleTouchEnd(e)
		})
	}

	canvasEvents.touchcancel = (e) => {
		app.events.input.addOnce(() => {
			handleTouchEnd(e)
		})
	}

	// TODO: option to not prevent default?
	canvasEvents.wheel = (e) => {
		e.preventDefault()
		app.events.input.addOnce(() => {
			app.events.scroll.trigger(new Vec2(e.deltaX, e.deltaY))
		})
	}

	canvasEvents.contextmenu = (e) => e.preventDefault()

	docEvents.visibilitychange = () => {
		if (document.visibilityState === "visible") {
			// prevent a surge of dt when switch back after the tab being hidden for a while
			app.skipTime = true
			app.isHidden = false
			app.events.show.trigger()
		} else {
			app.isHidden = true
			app.events.hide.trigger()
		}
	}

	winEvents.gamepadconnected = (e) => {
		const kbGamepad = registerGamepad(e.gamepad)
		app.events.input.addOnce(() => {
			app.events.gamepadConnect.trigger(kbGamepad)
		})
	}

	winEvents.gamepaddisconnected = (e) => {
		const kbGamepad = getGamepads().filter((g) => g.index === e.gamepad.index)[0]
		removeGamepad(e.gamepad)
		app.events.input.addOnce(() => {
			app.events.gamepadDisconnect.trigger(kbGamepad)
		})
	}

	for (const name in canvasEvents) {
		// @ts-ignore
		app.canvas.addEventListener(name, canvasEvents[name])
	}

	for (const name in docEvents) {
		// @ts-ignore
		document.addEventListener(name, docEvents[name])
	}

	for (const name in winEvents) {
		// @ts-ignore
		window.addEventListener(name, winEvents[name])
	}

	const resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			if (entry.target !== app.canvas) continue
			if (
				app.lastWidth === app.canvas.offsetWidth
				&& app.lastHeight === app.canvas.offsetHeight
			) return
			app.lastWidth = app.canvas.offsetWidth
			app.lastHeight = app.canvas.offsetHeight
			app.events.input.addOnce(() => {
				app.events.resize.trigger()
			})
		}
	})

	resizeObserver.observe(app.canvas)

	const gl = canvas.getContext("webgl2", {
		antialias: true,
		depth: true,
		stencil: true,
		alpha: true,
		preserveDrawingBuffer: true,
	}) as WebGLRenderingContext

	if (!gl) {
		throw new Error("failed to get webgl2 context")
	}

	const glCtx = createGLCtx(gl)

	function createShader(
		vertSrc: string | null = DEF_VERT,
		fragSrc: string | null = DEF_FRAG,
	): Shader {
		const vcode = VERT_TEMPLATE.replace("{{user}}", vertSrc ?? DEF_VERT)
		const fcode = FRAG_TEMPLATE.replace("{{user}}", fragSrc ?? DEF_FRAG)
		try {
			return new Shader(glCtx, vcode, fcode, VERTEX_FORMAT.map((vert) => vert.name))
		} catch (e) {
			const lineOffset = 14
			const fmt = /(?<type>^\w+) SHADER ERROR: 0:(?<line>\d+): (?<msg>.+)/
			const match = getErrorMsg(e).match(fmt)
			if (match?.groups) {
				const line = Number(match.groups.line) - lineOffset
				const msg = match.groups.msg.trim()
				const ty = match.groups.type.toLowerCase()
				throw new Error(`${ty} shader line ${line}: ${msg}`)
			} else {
				throw e
			}
		}
	}

	const gfx = (() => {

		const defShader = createShader(DEF_VERT, DEF_FRAG)

		const emptyTex = Texture.fromImage(
			glCtx,
			new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1),
		)

		const frameBuffer = new FrameBuffer(glCtx, gl.drawingBufferWidth, gl.drawingBufferHeight)

		let bgColor: null | Color = null
		let bgAlpha = 1

		if (gopt.background) {
			bgColor = Color.fromArray(gopt.background)
			bgAlpha = gopt.background[3] ?? 1
			gl.clearColor(
				bgColor.r / 255,
				bgColor.g / 255,
				bgColor.b / 255,
				bgAlpha ?? 1,
			)
		}

		gl.enable(gl.BLEND)

		gl.blendFuncSeparate(
			gl.SRC_ALPHA,
			gl.ONE_MINUS_SRC_ALPHA,
			gl.ONE,
			gl.ONE_MINUS_SRC_ALPHA,
		)

		const renderer = new BatchRenderer(
			glCtx,
			VERTEX_FORMAT,
			MAX_BATCHED_VERTS,
			MAX_BATCHED_INDICES,
		)

		const bgTex = Texture.fromImage(
			glCtx,
			new ImageData(new Uint8ClampedArray([
				128, 128, 128, 255,
				190, 190, 190, 255,
				190, 190, 190, 255,
				128, 128, 128, 255,
			]), 2, 2), {
				wrap: "repeat",
				filter: "nearest",
			},
		)

		const fontCacheCanvas = document.createElement("canvas")
		fontCacheCanvas.width = MAX_TEXT_CACHE_SIZE
		fontCacheCanvas.height = MAX_TEXT_CACHE_SIZE
		const fontCacheC2d = fontCacheCanvas.getContext("2d", {
			willReadFrequently: true,
		})

		if (!fontCacheC2d) {
			throw new Error("failed to create font cache canvas context 2d")
		}

		return {

			lastDrawCalls: 0,

			defShader: defShader,
			defTex: emptyTex,
			frameBuffer: frameBuffer,
			postShader: null,
			postShaderUniform: null,
			renderer: renderer,

			transform: new Mat4(),
			transformStack: [] as Mat4[],

			bgTex: bgTex,
			bgColor: bgColor,
			bgAlpha: bgAlpha,

			width: gw,
			height: gh,

			viewport: {
				x: 0,
				y: 0,
				width: gw,
				height: gh,
			},

			fontCacheCanvas: fontCacheCanvas,
			fontCacheC2d: fontCacheC2d,

		}

	})()

	function screen2ndc(pt: Vec2): Vec2 {
		return new Vec2(
			pt.x / gfx.width * 2 - 1,
			-pt.y / gfx.height * 2 + 1,
		)
	}

	function pushTransform() {
		gfx.transformStack.push(gfx.transform.clone())
	}

	function popTransform() {
		if (gfx.transformStack.length > 0) {
			gfx.transform = gfx.transformStack.pop() ?? new Mat4()
		}
	}

	function pushTranslate(p: Vec2) {
		if (p.x === 0 && p.y === 0) return
		gfx.transform.translate(p)
	}

	function pushScale(s: Vec2 | number) {
		if (typeof s === "number") return pushScale(new Vec2(s))
		if (s.x === 1 && s.y === 1) return
		gfx.transform.scale(s)
	}

	function pushRotate(a: number) {
		if (!a) return
		gfx.transform.rotate(a)
	}

	function drawRaw(
		verts: Vertex[],
		indices: number[],
		tex: Texture = gfx.defTex,
		shader: Shader = gfx.defShader,
		uniform: Uniform = {},
	) {

		const transformedVerts = []

		for (const v of verts) {
			const pt = screen2ndc(gfx.transform.multVec2(v.pos))
			transformedVerts.push(
				pt.x, pt.y,
				v.uv.x, v.uv.y,
				v.color.r / 255, v.color.g / 255, v.color.b / 255, v.opacity,
			)
		}

		gfx.renderer.push(
			gl.TRIANGLES,
			transformedVerts,
			indices,
			shader,
			tex,
			uniform,
		)

	}

	function drawUnscaled(content: () => void) {
		flush()
		const ow = gfx.width
		const oh = gfx.height
		gfx.width = gfx.viewport.width
		gfx.height = gfx.viewport.height
		content()
		flush()
		gfx.width = ow
		gfx.height = oh
	}

	function drawUVQuad(opt: DrawUVQuadOpt) {

		if (opt.width === undefined || opt.height === undefined) {
			throw new Error("drawUVQuad() requires property \"width\" and \"height\".")
		}

		if (opt.width <= 0 || opt.height <= 0) {
			return
		}

		const w = opt.width
		const h = opt.height
		const anchor = anchorPt(opt.anchor || DEF_ANCHOR)
		const offset = anchor.scale(new Vec2(w, h).scale(-0.5))
		const q = opt.quad || new Quad(0, 0, 1, 1)
		const color = opt.color || new Color(255, 255, 255)
		const opacity = opt.opacity ?? 1

		// apply uv padding to avoid artifacts
		const uvPadX = opt.tex ? UV_PAD / opt.tex.width : 0
		const uvPadY = opt.tex ? UV_PAD / opt.tex.height : 0
		const qx = q.x + uvPadX
		const qy = q.y + uvPadY
		const qw = q.w - uvPadX * 2
		const qh = q.h - uvPadY * 2

		pushTransform()
		if (opt.pos) pushTranslate(opt.pos)
		if (opt.angle) pushRotate(opt.angle)
		if (opt.scale) pushScale(opt.scale)
		pushTranslate(offset)

		drawRaw([
			{
				pos: new Vec2(-w / 2, h / 2),
				uv: new Vec2(opt.flipX ? qx + qw : qx, opt.flipY ? qy : qy + qh),
				color: color,
				opacity: opacity,
			},
			{
				pos: new Vec2(-w / 2, -h / 2),
				uv: new Vec2(opt.flipX ? qx + qw : qx, opt.flipY ? qy + qh : qy),
				color: color,
				opacity: opacity,
			},
			{
				pos: new Vec2(w / 2, -h / 2),
				uv: new Vec2(opt.flipX ? qx : qx + qw, opt.flipY ? qy + qh : qy),
				color: color,
				opacity: opacity,
			},
			{
				pos: new Vec2(w / 2, h / 2),
				uv: new Vec2(opt.flipX ? qx : qx + qw, opt.flipY ? qy : qy + qh),
				color: color,
				opacity: opacity,
			},
		], [0, 1, 3, 1, 2, 3], opt.tex, opt.shader, opt.uniform)

		popTransform()

	}

	function drawTexture(opt: DrawTextureOpt) {

		if (!opt.tex) {
			throw new Error("drawTexture() requires property \"tex\".")
		}

		const q = opt.quad ?? new Quad(0, 0, 1, 1)
		const w = opt.tex.width * q.w
		const h = opt.tex.height * q.h
		const scale = new Vec2(1)

		if (opt.tiled) {

			// TODO: draw fract
			const repX = Math.ceil((opt.width || w) / w)
			const repY = Math.ceil((opt.height || h) / h)
			const anchor = anchorPt(opt.anchor || DEF_ANCHOR).add(new Vec2(1, 1)).scale(0.5)
			const offset = anchor.scale(new Vec2(repX * w, repY * h))

			// TODO: rotation
			for (let i = 0; i < repX; i++) {
				for (let j = 0; j < repY; j++) {
					drawUVQuad(Object.assign({}, opt, {
						pos: (opt.pos || new Vec2(0)).add(new Vec2(w * i, h * j)).sub(offset),
						scale: scale.scale(opt.scale || new Vec2(1)),
						tex: opt.tex,
						quad: q,
						width: w,
						height: h,
						anchor: "topleft",
					}))
				}
			}
		} else {

			// TODO: should this ignore scale?
			if (opt.width && opt.height) {
				scale.x = opt.width / w
				scale.y = opt.height / h
			} else if (opt.width) {
				scale.x = opt.width / w
				scale.y = scale.x
			} else if (opt.height) {
				scale.y = opt.height / h
				scale.x = scale.y
			}

			drawUVQuad(Object.assign({}, opt, {
				scale: scale.scale(opt.scale || new Vec2(1)),
				tex: opt.tex,
				quad: q,
				width: w,
				height: h,
			}))

		}

	}

	function drawSprite(opt: DrawSpriteOpt) {

		if (!opt.sprite) {
			throw new Error("drawSprite() requires property \"sprite\"")
		}

		const frame = opt.sprite.frames[opt.frame ?? 0]

		if (!frame) {
			throw new Error(`frame not found: ${opt.frame ?? 0}`)
		}

		drawTexture(Object.assign({}, opt, {
			tex: frame.tex,
			quad: frame.quad.scale(opt.quad ?? new Quad(0, 0, 1, 1)),
		}))

	}

	function drawCanvas(opt: DrawCanvasOpt) {
		drawTexture(Object.assign({}, opt, {
			flipY: opt.flipY === true ? false : true,
			tex: opt.canvas.tex,
		}))
	}

	// generate vertices to form an arc
	function getArcPts(
		pos: Vec2,
		radiusX: number,
		radiusY: number,
		start: number,
		end: number,
		res: number = 1,
	): Vec2[] {

		// normalize and turn start and end angles to radians
		start = deg2rad(start % 360)
		end = deg2rad(end % 360)
		if (end <= start) end += Math.PI * 2

		const pts = []
		const nverts = Math.ceil((end - start) / deg2rad(8) * res)
		const step = (end - start) / nverts

		// calculate vertices
		for (let a = start; a < end; a += step) {
			pts.push(pos.add(new Vec2(radiusX * Math.cos(a), radiusY * Math.sin(a))))
		}

		pts.push(pos.add(new Vec2(radiusX * Math.cos(end), radiusY * Math.sin(end))))

		return pts

	}

	function drawRect(opt: DrawRectOpt) {

		if (opt.width === undefined || opt.height === undefined) {
			throw new Error("drawRect() requires property \"width\" and \"height\".")
		}

		if (opt.width <= 0 || opt.height <= 0) {
			return
		}

		const w = opt.width
		const h = opt.height
		const anchor = anchorPt(opt.anchor || DEF_ANCHOR).add(new Vec2(1, 1))
		const offset = anchor.scale(new Vec2(w, h).scale(-0.5))

		let pts = [
			new Vec2(0, 0),
			new Vec2(w, 0),
			new Vec2(w, h),
			new Vec2(0, h),
		]

		// TODO: gradient for rounded rect
		// TODO: drawPolygon should handle generic rounded corners
		if (opt.radius) {

			// maxium radius is half the shortest side
			const r = Math.min(Math.min(w, h) / 2, opt.radius)

			pts = [
				new Vec2(r, 0),
				new Vec2(w - r, 0),
				...getArcPts(new Vec2(w - r, r), r, r, 270, 360),
				new Vec2(w, r),
				new Vec2(w, h - r),
				...getArcPts(new Vec2(w - r, h - r), r, r, 0, 90),
				new Vec2(w - r, h),
				new Vec2(r, h),
				...getArcPts(new Vec2(r, h - r), r, r, 90, 180),
				new Vec2(0, h - r),
				new Vec2(0, r),
				...getArcPts(new Vec2(r, r), r, r, 180, 270),
			]

		}

		drawPolygon(Object.assign({}, opt, {
			offset,
			pts,
			...(opt.gradient ? {
				colors: opt.horizontal ? [
					opt.gradient[0],
					opt.gradient[1],
					opt.gradient[1],
					opt.gradient[0],
				] : [
					opt.gradient[0],
					opt.gradient[0],
					opt.gradient[1],
					opt.gradient[1],
				],
			} : {}),
		}))

	}

	function drawLine(opt: DrawLineOpt) {

		const { p1, p2 } = opt

		if (!p1 || !p2) {
			throw new Error("drawLine() requires properties \"p1\" and \"p2\".")
		}

		const w = opt.width || 1

		// the displacement from the line end point to the corner point
		const dis = p2.sub(p1).unit().normal().scale(w * 0.5)

		// calculate the 4 corner points of the line polygon
		const verts = [
			p1.sub(dis),
			p1.add(dis),
			p2.add(dis),
			p2.sub(dis),
		].map((p) => ({
			pos: new Vec2(p.x, p.y),
			uv: new Vec2(0),
			color: opt.color ?? Color.WHITE,
			opacity: opt.opacity ?? 1,
		}))

		drawRaw(verts, [0, 1, 3, 1, 2, 3], gfx.defTex, opt.shader, opt.uniform)

	}

	function drawLines(opt: DrawLinesOpt) {

		const pts = opt.pts

		if (!pts) {
			throw new Error("drawLines() requires property \"pts\".")
		}

		if (pts.length < 2) {
			return
		}

		if (opt.radius && pts.length >= 3) {

			// TODO: line joines
			// TODO: rounded vertices for arbitury polygonic shape
			let minSLen = pts[0].sdist(pts[1])

			for (let i = 1; i < pts.length - 1; i++) {
				minSLen = Math.min(pts[i].sdist(pts[i + 1]), minSLen)
			}

			// eslint-disable-next-line
			const radius = Math.min(opt.radius, Math.sqrt(minSLen) / 2)

			drawLine(Object.assign({}, opt, { p1: pts[0], p2: pts[1] }))

			for (let i = 1; i < pts.length - 2; i++) {
				const p1 = pts[i]
				const p2 = pts[i + 1]
				drawLine(Object.assign({}, opt, {
					p1: p1,
					p2: p2,
				}))
			}

			drawLine(Object.assign({}, opt, {
				p1: pts[pts.length - 2],
				p2: pts[pts.length - 1],
			}))

		} else {

			for (let i = 0; i < pts.length - 1; i++) {
				drawLine(Object.assign({}, opt, {
					p1: pts[i],
					p2: pts[i + 1],
				}))
				// TODO: other line join types
				if (opt.join !== "none") {
					drawCircle(Object.assign({}, opt, {
						pos: pts[i],
						radius: opt.width ?? 1 / 2,
					}))
				}
			}

		}

	}

	function drawCurve(curve: (t: number) => Vec2, opt: DrawCurveOpt) {
		const segments = opt.segments ?? 16
		const p: Vec2[] = []
		for (let i = 0; i <= segments; i++) {
			p.push(curve(i / segments))
		}
		drawLines({
			pts: p,
			width: opt.width || 1,
			pos: opt.pos,
			color: opt.color,
		})
	}

	function drawBezier(opt: DrawBezierOpt) {
		drawCurve(t => evaluateBezier(opt.pt1, opt.pt2, opt.pt3, opt.pt4, t), opt)
	}

	function drawTriangle(opt: DrawTriangleOpt) {
		if (!opt.p1 || !opt.p2 || !opt.p3) {
			throw new Error("drawTriangle() requires properties \"p1\", \"p2\" and \"p3\".")
		}
		return drawPolygon(Object.assign({}, opt, {
			pts: [opt.p1, opt.p2, opt.p3],
		}))
	}

	function drawCircle(opt: DrawCircleOpt) {

		if (typeof opt.radius !== "number") {
			throw new Error("drawCircle() requires property \"radius\".")
		}

		if (opt.radius === 0) {
			return
		}

		drawEllipse(Object.assign({}, opt, {
			radiusX: opt.radius,
			radiusY: opt.radius,
			angle: 0,
		}))

	}

	function drawEllipse(opt: DrawEllipseOpt) {

		if (opt.radiusX === undefined || opt.radiusY === undefined) {
			throw new Error("drawEllipse() requires properties \"radiusX\" and \"radiusY\".")
		}

		if (opt.radiusX === 0 || opt.radiusY === 0) {
			return
		}

		const start = opt.start ?? 0
		const end = opt.end ?? 360
		const offset = anchorPt(opt.anchor ?? "center").scale(new Vec2(-opt.radiusX, -opt.radiusY))

		const pts = getArcPts(
			offset,
			opt.radiusX,
			opt.radiusY,
			start,
			end,
			opt.resolution,
		)

		// center
		pts.unshift(offset)

		const polyOpt = Object.assign({}, opt, {
			pts,
			radius: 0,
			...(opt.gradient ? {
				colors: [
					opt.gradient[0],
					...Array(pts.length - 1).fill(opt.gradient[1]),
				],
			} : {}),
		})

		// full circle with outline shouldn't have the center point
		if (end - start >= 360 && opt.outline) {
			if (opt.fill !== false) {
				drawPolygon(Object.assign({}, polyOpt, {
					outline: null,
				}))
			}
			drawPolygon(Object.assign({}, polyOpt, {
				pts: pts.slice(1),
				fill: false,
			}))
			return
		}

		drawPolygon(polyOpt)

	}

	function drawPolygon(opt: DrawPolygonOpt) {

		if (!opt.pts) {
			throw new Error("drawPolygon() requires property \"pts\".")
		}

		const npts = opt.pts.length

		if (npts < 3) {
			return
		}

		pushTransform()
		if (opt.pos) pushTranslate(opt.pos)
		if (opt.scale) pushScale(opt.scale)
		if (opt.angle) pushRotate(opt.angle)
		if (opt.offset) pushTranslate(opt.offset)

		if (opt.fill !== false) {

			const color = opt.color ?? Color.WHITE

			const verts = opt.pts.map((pt, i) => ({
				pos: new Vec2(pt.x, pt.y),
				uv: new Vec2(0, 0),
				color: opt.colors ? (opt.colors[i] ? opt.colors[i].mult(color) : color) : color,
				opacity: opt.opacity ?? 1,
			}))

			// TODO: better triangulation
			const indices = [...Array(npts - 2).keys()]
				.map((n) => [0, n + 1, n + 2])
				.flat()

			drawRaw(verts, opt.indices ?? indices, gfx.defTex, opt.shader, opt.uniform)

		}

		if (opt.outline) {
			drawLines({
				pts: [...opt.pts, opt.pts[0]],
				radius: opt.radius,
				width: opt.outline.width,
				color: opt.outline.color,
				join: opt.outline.join,
				uniform: opt.uniform,
				opacity: opt.opacity,
			})
		}

		popTransform()

	}

	function applyCharTransform(fchar: FormattedChar, tr: CharTransform) {
		if (tr.pos) fchar.pos = fchar.pos.add(tr.pos)
		if (tr.scale) fchar.scale = fchar.scale.scale(tr.scale)
		if (tr.angle) fchar.angle += tr.angle
		if (tr.color && fchar.ch.length === 1) fchar.color = fchar.color.mult(tr.color)
		if (tr.opacity) fchar.opacity *= tr.opacity
	}

	const TEXT_STYLE_RE = /\[(?<style>\w+)\](?<text>.*?)\[\/\k<style>\]/g

	function compileStyledText(text: string): {
		charStyleMap: Record<number, string[]>,
		text: string,
	} {

		const charStyleMap: Record<number, string[]> = {}
		// get the text without the styling syntax
		const renderText = text.replace(TEXT_STYLE_RE, "$2")
		let idxOffset = 0

		// put each styled char index into a map for easy access when iterating each char
		for (const match of text.matchAll(TEXT_STYLE_RE)) {
			const origIdx = match.index - idxOffset
			if (!match.groups) continue
			for (let i = 0; i < match.groups.text.length; i++) {
				charStyleMap[i + origIdx] = [match.groups.style]
			}
			// omit the style syntax in format string when calculating index
			idxOffset += match[0].length - match.groups.text.length
		}

		return {
			charStyleMap: charStyleMap,
			text: renderText,
		}

	}

	type FontAtlas = {
		font: BitmapFontData,
		cursor: Vec2,
		outline: Outline | null,
	}

	const fontAtlases: Record<string, FontAtlas> = {}

	// TODO: cache formatted text
	// format text and return a list of chars with their calculated position
	function formatText(opt: DrawTextOpt): FormattedText {

		if (opt.text === undefined) {
			throw new Error("formatText() requires property \"text\".")
		}

		let font = opt.font ?? DEF_FONT

		const { charStyleMap, text } = compileStyledText(opt.text + "")
		const chars = runes(text)

		// if it's not bitmap font, we draw it with 2d canvas or use cached image
		if (font instanceof Font || typeof font === "string") {

			const [ fontName, outline, filter ] = font instanceof Font
				? [ font.fontface.family, font.outline, font.filter ]
				: [ font, null, DEF_FONT_FILTER ]

			// TODO: customizable font tex filter
			const atlas: FontAtlas = fontAtlases[fontName] ?? {
				font: {
					tex: new Texture(glCtx, FONT_ATLAS_WIDTH, FONT_ATLAS_HEIGHT, {
						filter: filter,
					}),
					map: {},
					size: DEF_TEXT_CACHE_SIZE,
				},
				cursor: new Vec2(0),
				outline: outline,
			}

			if (!fontAtlases[fontName]) {
				fontAtlases[fontName] = atlas
			}

			font = atlas.font

			for (const ch of chars) {

				if (!atlas.font.map[ch]) {

					// TODO: use assets.packer to pack font texture
					const c2d = gfx.fontCacheC2d
					c2d.clearRect(0, 0, gfx.fontCacheCanvas.width, gfx.fontCacheCanvas.height)
					c2d.font = `${font.size}px ${fontName}`
					c2d.textBaseline = "top"
					c2d.textAlign = "left"
					c2d.fillStyle = "#ffffff"
					const m = c2d.measureText(ch)
					let w = Math.ceil(m.width)
					if (!w) continue
					let h = font.size
					if (atlas.outline) {
						c2d.lineJoin = "round"
						c2d.lineWidth = atlas.outline.width * 2
						c2d.strokeStyle = atlas.outline.color.toHex()
						c2d.strokeText(ch, atlas.outline.width, atlas.outline.width)
						w += atlas.outline.width * 2
						h += atlas.outline.width * 3
					}
					c2d.fillText(ch, atlas.outline?.width ?? 0, atlas.outline?.width ?? 0)

					const img = c2d.getImageData(0, 0, w, h)

					// if we are about to exceed the X axis of the texture, go to another line
					if (atlas.cursor.x + w > FONT_ATLAS_WIDTH) {
						atlas.cursor.x = 0
						atlas.cursor.y += h
						if (atlas.cursor.y > FONT_ATLAS_HEIGHT) {
							// TODO: create another atlas
							throw new Error("font atlas exceeds character limit")
						}
					}

					font.tex.update(img, atlas.cursor.x, atlas.cursor.y)
					font.map[ch] = new Quad(atlas.cursor.x, atlas.cursor.y, w, h)
					atlas.cursor.x += w

				}

			}

		}

		const size = opt.size || DEF_TEXT_SIZE
		const scale = vec2(opt.scale ?? 1).scale(size / font.size)
		const lineSpacing = opt.lineSpacing ?? 0
		const letterSpacing = opt.letterSpacing ?? 0
		let curX = 0
		let tw = 0
		let th = 0
		const lines: Array<{
			width: number,
			chars: FormattedChar[],
		}> = []
		let curLine: FormattedChar[] = []
		let cursor = 0
		let lastSpace = null
		let lastSpaceWidth = null

		// TODO: word break
		while (cursor < chars.length) {

			let ch = chars[cursor]

			// always new line on '\n'
			if (ch === "\n") {

				th += size + lineSpacing

				lines.push({
					width: curX - letterSpacing,
					chars: curLine,
				})

				lastSpace = null
				lastSpaceWidth = null
				curX = 0
				curLine = []

			} else {

				let q = font.map[ch]

				// TODO: leave space if character not found?
				if (q) {

					let gw = q.w * scale.x

					if (opt.width && curX + gw > opt.width) {
						// new line on last word if width exceeds
						th += size + lineSpacing
						if (lastSpace !== null) {
							cursor -= curLine.length - lastSpace
							ch = chars[cursor]
							q = font.map[ch]
							gw = q.w * scale.x
							// omit trailing space
							curLine = curLine.slice(0, lastSpace - 1)
							curX = lastSpaceWidth ?? 0
						}
						lastSpace = null
						lastSpaceWidth = null
						lines.push({
							width: curX - letterSpacing,
							chars: curLine,
						})
						curX = 0
						curLine = []
					}

					// push char
					curLine.push({
						tex: font.tex,
						width: q.w,
						height: q.h,
						// without some padding there'll be visual artifacts on edges
						quad: new Quad(
							q.x / font.tex.width,
							q.y / font.tex.height,
							q.w / font.tex.width,
							q.h / font.tex.height,
						),
						ch: ch,
						pos: new Vec2(curX, th),
						opacity: opt.opacity ?? 1,
						color: opt.color ?? Color.WHITE,
						scale: scale,
						angle: 0,
					})

					if (ch === " ") {
						lastSpace = curLine.length
						lastSpaceWidth = curX
					}

					curX += gw
					tw = Math.max(tw, curX)
					curX += letterSpacing

				}

			}

			cursor++

		}

		lines.push({
			width: curX - letterSpacing,
			chars: curLine,
		})

		th += size

		if (opt.width) {
			tw = opt.width
		}

		const fchars: FormattedChar[] = []

		for (let i = 0; i < lines.length; i++) {

			const ox = (tw - lines[i].width) * alignPt(opt.align ?? "left")

			for (const fchar of lines[i].chars) {

				const q = font.map[fchar.ch]
				const idx = fchars.length + i

				fchar.pos = fchar.pos.add(new Vec2(ox, 0)).add(new Vec2(
					q.w * scale.x * 0.5,
					q.h * scale.y * 0.5,
				))

				if (opt.transform) {
					const tr = typeof opt.transform === "function"
						? opt.transform(idx, fchar.ch)
						: opt.transform
					if (tr) {
						applyCharTransform(fchar, tr)
					}
				}

				if (charStyleMap[idx]) {
					const styles = charStyleMap[idx]
					for (const name of styles) {
						const style = (opt.styles ?? {})[name]
						const tr = typeof style === "function"
							? style(idx, fchar.ch)
							: style
						if (tr) {
							applyCharTransform(fchar, tr)
						}
					}
				}

				fchars.push(fchar)

			}

		}

		return {
			width: tw,
			height: th,
			chars: fchars,
			opt: opt,
		}

	}

	function drawText(opt: DrawTextOpt) {
		drawFormattedText(formatText(opt))
	}

	function drawFormattedText(ftext: FormattedText) {
		pushTransform()
		if (ftext.opt.pos) pushTranslate(ftext.opt.pos)
		if (ftext.opt.angle) pushRotate(ftext.opt.angle)
		pushTranslate(anchorPt(ftext.opt.anchor ?? "topleft")
			.add(new Vec2(1, 1))
			.scale(new Vec2(ftext.width, ftext.height))
			.scale(-0.5)
		)
		ftext.chars.forEach((ch) => {
			drawUVQuad({
				tex: ch.tex,
				width: ch.width,
				height: ch.height,
				pos: ch.pos,
				scale: ch.scale,
				angle: ch.angle,
				color: ch.color,
				opacity: ch.opacity,
				quad: ch.quad,
				anchor: "center",
				uniform: ftext.opt.uniform,
				shader: ftext.opt.shader,
			})
		})
		popTransform()
	}

	function drawStenciled(content: () => void, mask: () => void, test: number) {

		flush()
		gl.clear(gl.STENCIL_BUFFER_BIT)
		gl.enable(gl.STENCIL_TEST)

		// don't perform test, pure write
		gl.stencilFunc(
			gl.NEVER,
			1,
			0xFF,
		)

		// always replace since we're writing to the buffer
		gl.stencilOp(
			gl.REPLACE,
			gl.REPLACE,
			gl.REPLACE,
		)

		mask()
		flush()

		// perform test
		gl.stencilFunc(
			test,
			1,
			0xFF,
		)

		// don't write since we're only testing
		gl.stencilOp(
			gl.KEEP,
			gl.KEEP,
			gl.KEEP,
		)

		content()
		flush()
		gl.disable(gl.STENCIL_TEST)

	}

	function drawMasked(content: () => void, mask: () => void) {
		drawStenciled(content, mask, gl.EQUAL)
	}

	function drawSubtracted(content: () => void, mask: () => void) {
		drawStenciled(content, mask, gl.NOTEQUAL)
	}

	function flush() {
		gfx.renderer.flush()
	}

	function frameStart() {

		gl.clear(gl.COLOR_BUFFER_BIT)
		gfx.frameBuffer.bind()
		gl.clear(gl.COLOR_BUFFER_BIT)

		if (!gfx.bgColor) {
			drawUnscaled(() => {
				drawUVQuad({
					width: gfx.width,
					height: gfx.height,
					quad: new Quad(
						0,
						0,
						gfx.width / BG_GRID_SIZE,
						gfx.height / BG_GRID_SIZE,
					),
					tex: gfx.bgTex,
				})
			})
		}

		gfx.renderer.numDraws = 0
		gfx.transformStack.length = 0
		gfx.transform = new Mat4()

	}

	function frameEnd() {

		flush()
		gfx.lastDrawCalls = gfx.renderer.numDraws
		gfx.frameBuffer.unbind()
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

		drawTexture({
			flipY: true,
			tex: gfx.frameBuffer.tex,
			pos: new Vec2(gfx.viewport.x, gfx.viewport.y),
			width: gfx.viewport.width,
			height: gfx.viewport.height,
		})

		flush()

	}

	const packer = new TexPacker(glCtx, SPRITE_ATLAS_WIDTH, SPRITE_ATLAS_HEIGHT)

	function slice(x = 1, y = 1, dx = 0, dy = 0, w = 1, h = 1): Quad[] {
		const frames = []
		const qw = w / x
		const qh = h / y
		for (let j = 0; j < y; j++) {
			for (let i = 0; i < x; i++) {
				frames.push(new Quad(
					dx + i * qw,
					dy + j * qh,
					qw,
					qh,
				))
			}
		}
		return frames
	}

	// TODO: how to support texture opt here?
	async function loadSprite(src: string, opt: LoadSpriteOpt = {}): Promise<SpriteData> {
		const img = await loadImg(src)
		const [tex, quad] = packer.add(img)
		const quads = opt.frames ? opt.frames.map((f) => new Quad(
			quad.x + f.x * quad.w,
			quad.y + f.y * quad.h,
			f.w * quad.w,
			f.h * quad.h,
		)) : slice(opt.sliceX || 1, opt.sliceY || 1, quad.x, quad.y, quad.w, quad.h)
		const frames = quads.map((q) => ({
			tex: tex,
			quad: q,
		}))
		const w = frames[0].tex.width * frames[0].quad.w
		const h = frames[0].tex.height * frames[0].quad.h
		return new SpriteData(frames, opt.anims ?? {}, w, h)
	}

	async function loadSpritesAnim(src: string[], opt: LoadSpriteOpt = {}): Promise<SpriteData> {
		const imgs = await Promise.all(src.map((url) => loadImg(url)))
		const frames = imgs.map((img) => {
			const [tex, quad] = packer.add(img)
			return {
				tex: tex,
				quad: quad,
			}
		})
		const w = frames[0].tex.width * frames[0].quad.w
		const h = frames[0].tex.height * frames[0].quad.h
		return new SpriteData(frames, opt.anims ?? {}, w, h)
	}

	async function loadBitmapFont(
		src: string,
		gw: number,
		gh: number,
		opt: LoadBitmapFontOpt = {},
	): Promise<BitmapFontData> {

		const img = await loadImg(src)
		const tex = Texture.fromImage(glCtx, img, opt)
		const cols = tex.width / gw
		const map: Record<string, Quad> = {}
		const charMap = (opt.chars ?? ASCII_CHARS).split("").entries()

		for (const [i, ch] of charMap) {
			map[ch] = new Quad(
				(i % cols) * gw,
				Math.floor(i / cols) * gh,
				gw,
				gh,
			)
		}

		return {
			tex: tex,
			map: map,
			size: gh,
		}

	}

	async function loadFont(
		name: string,
		src: string | BufferSource,
		opt: LoadFontOpt = {},
	): Promise<Font> {
		const font = new FontFace(name, src)
		await font.load()
		document.fonts.add(font)
		if (opt.size && opt.size > MAX_TEXT_CACHE_SIZE) {
			throw new Error(`exceeds max font size: ${opt.size} > ${MAX_TEXT_CACHE_SIZE}`)
		}
		return new Font(
			font,
			opt.size ?? DEF_TEXT_CACHE_SIZE,
			Object.assign({}, {
				width: 1,
				color: new Color(0, 0, 0),
				join: "none",
			}, opt.outline),
			opt.filter ?? DEF_FONT_FILTER,
		)
	}

	function createCanvas(w: number, h: number, opt: TextureOpt = {}): Canvas {
		const fb = new FrameBuffer(glCtx, w, h, opt)
		return {
			width: fb.width,
			height: fb.height,
			tex: fb.tex,
			clear: () => fb.clear(),
			free: () => fb.free(),
			toDataURL: () => fb.toDataURL(),
			toImageData: () => fb.toImageData(),
			draw: (action: () => void) => {
				flush()
				fb.bind()
				action()
				flush()
				fb.unbind()
			},
		}
	}

	function width() {
		return gfx.width
	}

	function height() {
		return gfx.height
	}

	const audio = (() => {
		const ctx = new AudioContext()
		const masterNode = ctx.createGain()
		masterNode.connect(ctx.destination)
		return {
			ctx,
			masterNode,
		}
	})()

	function loadSound(src: string): Promise<AudioBuffer> {
		return fetch(src)
			.then((res) => res.arrayBuffer())
			.then((buf) => audio.ctx.decodeAudioData(buf))
	}

	function loadAudio(src: string) {
		const el = new Audio()
		el.crossOrigin = "anonymous"
		el.src = src
		return new Promise<AudioData>((resolve, reject) => {
			el.addEventListener("canplaythrough", () => {
				const srcNode = audio.ctx.createMediaElementSource(el)
				srcNode.connect(audio.masterNode)
				resolve(el)
			})
			el.addEventListener("error", (e) => {
				reject(e)
			})
		})
	}

	function playAudio(el: AudioData, opt: AudioPlayOpt = {}) {
		if (audio.ctx.state === "suspended") {
			audio.ctx.resume()
		}
		el.play()
	}

	function playSound(snd: SoundData, opt: SoundPlayOpt = {}): SoundPlayback {

		if (audio.ctx.state === "suspended") {
			audio.ctx.resume()
		}

		const ctx = audio.ctx
		const srcNode = ctx.createBufferSource()
		const gainNode = ctx.createGain()
		const onEndEvent = new Event()

		srcNode.buffer = snd
		srcNode.detune.value = opt.detune ?? 0
		srcNode.playbackRate.value = opt.speed ?? 1
		srcNode.connect(gainNode)
		gainNode.gain.value = opt.volume ?? 1
		gainNode.connect(audio.masterNode)
		srcNode.start()

		srcNode.onended = () => {
			onEndEvent.trigger()
		}

		return {
			then: (action: () => void) => onEndEvent.add(action),
		}

	}

	function setVolume(v: number) {
		audio.masterNode.gain.value = v
	}

	function getVolume(): number {
		return audio.masterNode.gain.value
	}

	return {

		dt,
		time,
		run,
		canvas,
		fps,
		numFrames,
		focus,
		isFocused,
		quit,
		isHidden,
		setFullscreen,
		isFullscreen,
		setCursor,
		screenshot,
		getGamepads,
		getCursor,
		setCursorLocked,
		isCursorLocked,
		isTouchscreen,
		mousePos,
		mouseDeltaPos,
		isKeyDown,
		isKeyPressed,
		isKeyPressedRepeat,
		isKeyReleased,
		isMouseDown,
		isMousePressed,
		isMouseReleased,
		isMouseMoved,
		charInputted,
		onResize,
		onKeyDown,
		onKeyPress,
		onKeyPressRepeat,
		onKeyRelease,
		onMouseDown,
		onMousePress,
		onMouseRelease,
		onMouseMove,
		onCharInput,
		onTouchStart,
		onTouchMove,
		onTouchEnd,
		onScroll,
		onHide,
		onShow,
		events: app.events,

		loadSprite,
		loadSpritesAnim,
		loadAudio,
		loadSound,
		loadFont,
		loadBitmapFont,
		createShader,

		width,
		height,
		drawSprite,
		drawCanvas,
		drawRect,
		drawCircle,
		drawEllipse,
		drawPolygon,
		drawTriangle,
		drawLine,
		drawLines,
		drawCurve,
		drawText,
		drawStenciled,
		drawMasked,
		drawSubtracted,
		pushTransform,
		popTransform,
		pushTranslate,
		pushScale,
		pushRotate,
		createCanvas,

		playAudio,
		playSound,
		setVolume,
		getVolume,

		tween: tween2,
		wait: wait2,
		loop: loop2,

		ASCII_CHARS,

	}

}

declare global {
	interface FontFaceSet {
		add(font: FontFace): void;
	}
}
