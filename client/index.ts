function preload(url: string) {
	const img = new Image()
	img.src = url
}

for (let i = 1; i <= 4; i++) {
	preload(`/static/img/drawings/flower${i}.png`)
}

const flower = document.querySelector<HTMLImageElement>("#flower")

if (flower) {
	flower.addEventListener("click", () => {
		flower.classList.add("happy")
	})
}
