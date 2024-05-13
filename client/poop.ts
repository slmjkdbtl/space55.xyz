const addButton: HTMLButtonElement | null = document.querySelector("#add-button")

if (addButton) {
	addButton.onclick = (() => {
		const contents = document.querySelectorAll(".content")
		contents.forEach((c) => {
			c.textContent += "家人们谁懂"
		})
	})
}
