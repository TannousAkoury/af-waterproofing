const loadPartial = (targetId, filePath) => {
	const target = document.getElementById(targetId);

	if (!target) {
		return Promise.resolve();
	}

	return fetch(filePath)
		.then(response => response.text())
		.then(html => {
			target.innerHTML = html;
		});
};

Promise.all([
	loadPartial("navigation", "navigation.html"),
	loadPartial("footer", "footer.html")
]).then(() => {
	document.dispatchEvent(new Event("afPartialsLoaded"));
});
