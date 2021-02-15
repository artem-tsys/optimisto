document.addEventListener('DOMContentLoaded', global => {
	init()
})

function init() {
	window.createMarkup = CreateMarkup
	const config = {
		complex: {
			id: '#js-s3d__wrapper',
			url: '',
			imageUrl: '/wp-content/themes/optimisto/assets/s3d/images/optimisto/complex/',
			class: 'js-s3d__wrapper',
			numberSlide: {
				min: 0,
				max: 119,
			},
			controlPoint: [29, 60, 88, 117],
			activeSlide: 29,
			mouseSpeed: 1,
		},
		courtyard: {
			id: '#js-s3d__wrapper',
			url: '',
			imageUrl: '/wp-content/themes/optimisto/assets/s3d/images/optimisto/courtyard/',
			class: 'js-s3d__wrapper',
			numberSlide: {
				min: 0,
				max: 119,
			},
			controlPoint: [12, 42, 72, 108],
			activeSlide: 12,
			mouseSpeed: 1,
		},
		apart: {
			id: '.js-s3d__slideModule',
		},
		plannings: {
			id: '.js-s3d__slideModule',
		},
	}

	let app
	new Promise(resolve => {
		loader(resolve, config.complex.activeSlide)
	}).then(value => {
		document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
		if (!value.fastSpeed) {
			config.complex.imageUrl += 'mobile/'
			config.courtyard.imageUrl += 'mobile/'
		}
		if (isDevice('mobile') || document.documentElement.offsetWidth <= 768) {
			$('.js-s3d__slideModule').addClass('s3d-mobile')
		}
		config.complex['browser'] = Object.assign(isBrowser(), value)
		app = new App(config)
		app.init()

		$(window).resize(() => {
			document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
		})
	})
}

window.checkValue = val => !val || val === null || val === undefined || (typeof val === 'number' && isNaN(val))
