
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
		'.stat-item',
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

			if (target.matches('.solution-card, .bullets, .gallery img, .stat-item')) {
				const groupSelector = target.matches('.solution-card')
					? '.solutions-grid .solution-card'
					: target.matches('.gallery img')
						? '.gallery img'
						: target.matches('.stat-item')
							? '.stats-grid .stat-item'
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

(() => {
	const counters = document.querySelectorAll('[data-count]');
	if (!counters.length) {
		return;
	}

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const animateCounter = (counter) => {
		if (counter.dataset.counted === 'true') {
			return;
		}

		counter.dataset.counted = 'true';

		const target = Number(counter.dataset.count || 0);
		const duration = 1300;
		const start = performance.now();

		if (reduceMotion) {
			counter.textContent = target;
			return;
		}

		const tick = (now) => {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			counter.textContent = Math.round(target * eased);

			if (progress < 1) {
				requestAnimationFrame(tick);
			}
		};

		requestAnimationFrame(tick);
	};

	if (!('IntersectionObserver' in window)) {
		counters.forEach(animateCounter);
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.28 });

	document.querySelectorAll('.stats-band').forEach(section => observer.observe(section));
})();
