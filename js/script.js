
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
const siteHeader = document.querySelector(".site-header");

if (menuBtn && nav) {
	menuBtn.addEventListener("click", () => {
		nav.classList.toggle("open");
	});
}

if (siteHeader) {
	const updateHeaderState = () => {
		siteHeader.classList.toggle("scrolled", window.scrollY > 12);
	};

	updateHeaderState();
	window.addEventListener("scroll", updateHeaderState, { passive: true });
}

// Scroll-reveal animations using IntersectionObserver
(() => {
	if (window.afScrollRevealReady) {
		return;
	}

	window.afScrollRevealReady = true;

	const selectors = [
		'.hero h1',
		'.hero .sub',
		'.hero p',
		'.hero .hero-actions',
		'.quick-services div',
		'.solutions-head',
		'.solution-card',
		'.about-box',
		'.about-box .lead',
		'.about-features div',
		'.about-process-card',
		'.services-center',
		'.service-lux-card',
		'.services-bottom-cta',
		'.page-hero',
		'.page-hero h1',
		'.page-hero p',
		'.page-title',
		'.lead',
		'.contact-link',
		'.contact-card',
		'.contact-card input',
		'.contact-card select',
		'.contact-card textarea',
		'.dark-band .kicker',
		'.dark-band h3',
		'.dark-band h4',
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
			if (target.matches('.quick-services div, .about-features div')) {
				const groupSelector = target.matches('.quick-services div') ? '.quick-services div' : '.about-features div';
				const items = Array.from(document.querySelectorAll(groupSelector));
				const idx = items.indexOf(target);
				target.revealTimer = setTimeout(() => target.classList.add('in-view'), idx * 70);
				return;
			}

			if (target.matches('.solution-card, .about-process-card, .service-lux-card, .bullets, .gallery img, .stat-item, .contact-link, .contact-card input, .contact-card select, .contact-card textarea')) {
				const groupSelector = target.matches('.solution-card')
					? '.solutions-grid .solution-card'
					: target.matches('.about-process-card')
						? '.about-process-grid .about-process-card'
						: target.matches('.service-lux-card')
							? '.services-grid .service-lux-card'
							: target.matches('.gallery img')
								? '.gallery img'
								: target.matches('.stat-item')
									? '.stats-grid .stat-item'
									: target.matches('.contact-link')
										? '.contact-details .contact-link'
										: target.matches('.contact-card input, .contact-card select, .contact-card textarea')
											? '.contact-card input, .contact-card select, .contact-card textarea'
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
	const statsSections = document.querySelectorAll('.stats-band');

	const animateCounter = (counter) => {
		const target = Number(counter.dataset.count || 0);
		const duration = 900;
		const start = performance.now();
		const animationId = String(start);
		counter.dataset.animationId = animationId;
		counter.textContent = 0;

		if (reduceMotion) {
			counter.textContent = target;
			return;
		}

		const tick = (now) => {
			if (counter.dataset.animationId !== animationId) {
				return;
			}

			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			counter.textContent = Math.min(target, Math.round(target * eased));

			if (progress < 1) {
				requestAnimationFrame(tick);
			} else {
				counter.textContent = target;
			}
		};

		requestAnimationFrame(tick);
	};

	const showFinalNumbers = (section) => {
		section.querySelectorAll('[data-count]').forEach((counter) => {
			counter.textContent = Number(counter.dataset.count || 0);
		});
	};

	if (!('IntersectionObserver' in window)) {
		statsSections.forEach(showFinalNumbers);
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
			} else {
				entry.target.querySelectorAll('[data-count]').forEach((counter) => {
					counter.dataset.animationId = '';
					counter.textContent = 0;
				});
			}
		});
	}, { threshold: 0.25 });

	statsSections.forEach(section => observer.observe(section));
})();
