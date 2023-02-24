/**
 * Lab Website Theme by GramThanos
 */

(function() {
	const $ = window.jQuery;

	// Back to top
	let backtotop = $('.back-to-top')[0]
	if (backtotop) {
		const toggleBacktotop = () => {
			if (window.scrollY > 120) {
				backtotop.classList.add('active')
			} else {
				backtotop.classList.remove('active')
			}
		}
		window.addEventListener('load', toggleBacktotop);
		document.addEventListener('scroll', toggleBacktotop);
	}

	// Fire jumbotron
	let canvas = document.getElementById('jumbotron-canvas');
	if (canvas && NeonHexagons) NeonHexagons.init(canvas);

	// On load
	$(() => {
		// Scroll with ofset on page load with hash links in the url
		if (window.location.hash && (/^[a-z0-9_-]+$/).test(window.location.hash)) {
			let el = $('#' + window.location.hash);
			if (el) window.scrollTo({top: el.offsetTop, behavior: 'smooth'});
		}

		// Apply tooltips
		$('body').tooltip({selector: '[data-toggle=tooltip]'});
	});

	// Handle auto menu highlighting
	$(() => {
		if (!document.getElementById('home')) return;

		var info = [];
		var active = $('#main-navbar a.active');
		var links = $('#main-navbar a');

		var init = function() {
			links.each(function() {
				var id = $(this).attr('href');
				if (id[0] === '#' && id.length > 1) {
					var target = $(id);
					if (target.length) {
						info.push([target.offset().top, $(this)]);
					}
				}
			});
		};

		init();
		$(window).resize(function() {
			init();
		});

		var update = function() {
			var top = $(document).scrollTop();
			var found = false;
			for (var i = info.length - 1; i >= 0; i--) {
				if (info[i][0] <= top + 10) {
					if (active) active.removeClass('active');
					active = info[i][1];
					active.addClass('active');
					found = true;
					break;
				}
			};
			if (!found) active.removeClass('active');
		};

		update();
		$(document).scroll(function() {
			update();
		});
	});

	// Handle more info toggle
	$(() => {
		$('.more-info-toggle').each(function() {
			let btn = $(this);
			let text = btn.text().trim();
			if (text == '﹀' || text == '︿') {
				text = ['﹀', '︿'];
			}
			else {
				text = ['show more', 'show less'];
			}
			btn.click(() => {
				btn.parent().toggleClass('closed');
				btn.text(btn.text().trim() == text[0] ? text[1] : text[0]);
			});
		});
	});

})();
