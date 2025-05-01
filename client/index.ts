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

const map = (v: number, l1: number, h1: number, l2: number, h2: number): number =>
	l2 + (v - l1) * (h2 - l2) / (h1 - l1)

const eye = document.querySelector<HTMLImageElement>("#eye")

if (eye) {
	const origEyePos = eye.getBoundingClientRect()
	document.addEventListener("mousemove", (e) => {
		const [mx, my] = [e.clientX, e.clientY]
		const [dx, dy] = [e.clientX - origEyePos.x, e.clientY - origEyePos.y]
		const dis = Math.sqrt(dx * dx + dy * dy)
		const [ux, uy] = [dx / dis, dy / dis]
		const d = map(dis, 0, 100, 0, 1)
		eye.style["transform"] = `translate(${ux * d}px, ${uy * d * (dy < 0 ? 5 : 1)}px)`
	})
}
