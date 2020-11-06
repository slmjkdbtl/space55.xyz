// wengwengweng

function preload(src) {
	const img = new Image();
	img.src = src;
}

preload("/img/drawings/flower1.png");
preload("/img/drawings/flower2.png");
preload("/img/drawings/flower3.png");
preload("/img/drawings/flower4.png");

const flower = document.querySelector("#flower");
let happy = false;
let curFlower = 1;
const numFlowers = 4;

function flowerSpin() {
	if (curFlower >= numFlowers) {
		curFlower = 1;
	} else {
		curFlower += 1;
	}
	flower.src = `/img/drawings/flower${curFlower}.png`;
}

flower.onclick = (() => {
	if (!happy) {
		happy = true;
		flowerSpin();
		setInterval(flowerSpin, 100);
	}
});

