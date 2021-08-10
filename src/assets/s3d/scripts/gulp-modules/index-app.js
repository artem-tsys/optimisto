document.addEventListener('DOMContentLoaded', global => {
	init()
})

function init() {
	window.createMarkup = CreateMarkup
	const config = {
		complex1: {
			id: '#js-s3d__wrapper',
			url: '',
			imageUrl: '/wp-content/themes/optimisto/assets/s3d/images/optimisto/complex1/',
			class: 'js-s3d__wrapper',
			numberSlide: {
				min: 0,
				max: 179,
			},
			controlPoint: [41, 85, 132, 170],
			activeSlide: 41,
			mouseSpeed: 1,
		},
		courtyard1: {
			id: '#js-s3d__wrapper',
			url: '',
			imageUrl: '/wp-content/themes/optimisto/assets/s3d/images/optimisto/courtyard1/',
			class: 'js-s3d__wrapper',
			numberSlide: {
				min: 0,
				max: 179,
			},
			controlPoint: [18, 63, 108, 162],
			activeSlide: 18,
			mouseSpeed: 1,
		},
		complex2: {
			id: '#js-s3d__wrapper',
			url: '',
			imageUrl: '/wp-content/themes/optimisto/assets/s3d/images/optimisto/complex2/',
			class: 'js-s3d__wrapper',
			numberSlide: {
				min: 0,
				max: 179,
			},
			controlPoint: [2, 46, 91, 134],
			activeSlide: 91,
			mouseSpeed: 1,
		},
		courtyard2: {
			id: '#js-s3d__wrapper',
			url: '',
			imageUrl: '/wp-content/themes/optimisto/assets/s3d/images/optimisto/courtyard2/',
			class: 'js-s3d__wrapper',
			numberSlide: {
				min: 0,
				max: 179,
			},
			controlPoint: [18, 63, 108, 162],
			activeSlide: 18,
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
		loader(resolve, config.complex1.activeSlide)
	}).then(value => {
		document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
		// if (!value.fastSpeed) {
		// 	config.complex1.imageUrl += 'mobile/'
		// 	config.courtyard1.imageUrl += 'mobile/'
		// 	config.complex2.imageUrl += 'mobile/'
		// 	config.courtyard2.imageUrl += 'mobile/'
		// }
		if (isDevice('mobile') || document.documentElement.offsetWidth <= 768) {
			$('.js-s3d__slideModule').addClass('s3d-mobile')
		}
		config.complex1['browser'] = Object.assign(isBrowser(), value)
		app = new App(config)
		app.init()

		$(window).resize(() => {
			document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
		})
	})
}

window.checkValue = val => !val || val === null || val === undefined || (typeof val === 'number' && isNaN(val))
