const addButton = document.querySelector<HTMLButtonElement>("#add-button")

if (addButton) {
	addButton.addEventListener("click", () => {
		const contents = document.querySelectorAll(".content")
		contents.forEach((c) => {
			c.textContent += "家人们谁懂"
		})
	})
}
