document.addEventListener('DOMContentLoaded', global => {
	init()
})

function init() {
	window.createMarkup = CreateMarkup
	const config = {
		complex: {
			url: '',
			imageUrl: '/wp-content/themes/optimisto/assets/s3d/images/optimisto/complex/',
			class: 'js-s3d__wrapper',
			numberSlide: {
				min: 0,
				max: 179,
			},
			controlPoint: [43, 89, 132, 175],
			activeSlide: 43,
			mouseSpeed: 1,
			// mouseSpeed: 300,
		},
		// floor: {
		// 	id: 'js-s3d__wrapper',
		// },
		courtyard: {
			url: '',
			imageUrl: '/wp-content/themes/optimisto/assets/s3d/images/optimisto/courtyard/',
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
			id: 'js-s3d__wrapper',
		},
	}

	let app
	new Promise(resolve => {
		loader(resolve)
	}).then(value => {
		// console.log('load', value)
		if (!value.fastSpeed) {
			// $('.js-s3d__slideModule').addClass('s3d-mobile')
			config.complex.imageUrl += 'mobile/'
		}
		if (isDevice('mobile')) {
			$('.js-s3d__slideModule').addClass('s3d-mobile')
			// config.complex.imageUrl += 'mobile/'
		}
		config.complex['browser'] = Object.assign(isBrowser(), value)
		// console.log(config.complex['browser'])
		app = new App(config)
		app.init()

		$(window).resize(() => {
			app.resize()
		})
	})
}

window.checkValue = val => !val || val === null || val === undefined || (typeof val === 'number' && isNaN(val))
