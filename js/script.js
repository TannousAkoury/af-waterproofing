
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");

if (menuBtn && nav) {
	menuBtn.addEventListener("click", () => {
		nav.classList.toggle("open");
	});
}

// Scroll-reveal animations using IntersectionObserver
(() => {
	const selectors = [
		'.hero h1',
		'.hero .sub',
		'.hero p',
		'.hero .hero-actions',
		'.quick-services div',
		'.solutions-head',
		'.solution-card',
		'.dark-band .kicker',
		'.dark-band h3',
		'.dark-band .bullets',
		'.section-head',
		'.process-card',
		'.service-card',
		'.gallery img',
		'.cta h2',
		'.cta p',
		'.cta .hero-actions'
	];

	const initScrollReveal = () => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const els = document.querySelectorAll(selectors.join(','));
		els.forEach(el => el.classList.add('animate'));

		if (reduceMotion || !('IntersectionObserver' in window)) {
			els.forEach(el => el.classList.add('in-view'));
			return;
		}

		const reveal = (target) => {
			if (target.matches('.quick-services div')) {
				const items = Array.from(document.querySelectorAll('.quick-services div'));
				const idx = items.indexOf(target);
				target.revealTimer = setTimeout(() => target.classList.add('in-view'), idx * 70);
				return;
			}

			if (target.matches('.solution-card, .bullets, .gallery img')) {
				const groupSelector = target.matches('.solution-card')
					? '.solutions-grid .solution-card'
					: target.matches('.gallery img')
						? '.gallery img'
						: '.dark-band .bullets';
				const items = Array.from(document.querySelectorAll(groupSelector));
				const idx = items.indexOf(target);
				target.revealTimer = setTimeout(() => target.classList.add('in-view'), idx * 110);
				return;
			}

			target.classList.add('in-view');
		};

		const reset = (target) => {
			clearTimeout(target.revealTimer);
			target.classList.remove('in-view');
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					reveal(entry.target);
				} else {
					reset(entry.target);
				}
			});
		}, {
			rootMargin: '0px 0px -8% 0px',
			threshold: 0.01
		});

		els.forEach(el => observer.observe(el));
	};

	requestAnimationFrame(initScrollReveal);
})();
