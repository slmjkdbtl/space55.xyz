import {
	mapc,
} from "www/math"

function preload(url: string) {
	const img = new Image()
	img.src = url
}

for (let i = 1; i <= 4; i++) {
	preload(`/static/img/flower${i}.png`)
}

const flower = document.querySelector<HTMLImageElement>("#flower")

if (flower) {
	flower.addEventListener("click", () => {
		flower.classList.add("happy")
	})
}

const eye = document.querySelector<HTMLImageElement>("#eye")

// TODO: doesn't work when cursor is above

if (eye) {
	const origEyePos = eye.getBoundingClientRect()
	document.addEventListener("mousemove", (e) => {
		const [mx, my] = [e.clientX, e.clientY]
		const [dx, dy] = [e.clientX - origEyePos.x, e.clientY - origEyePos.y]
		const dis = Math.sqrt(dx * dx + dy * dy)
		const [ux, uy] = [dx / dis, dy / dis]
		// const d = mapc(dis, 0, 100, 0, 3)
		const d = 3
		eye.style["transform"] = `translate(${ux * d}px, ${uy * d}px)`
	})
}
