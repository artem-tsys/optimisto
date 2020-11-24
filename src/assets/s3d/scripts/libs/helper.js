class Helper {
	constructor(data) {
		this.conf = [['.s3d__button-right', 'circle', 'Натисайте на стрілки<br/> щоб обертати модель', 2, 'big'],
			['.js-s3d__slideModule', 'circle', 'Також Ви можете обертати <br/>модель своєю мишкою', 0.4, 'small'],
		]
		this.currentWindow = 0
	}

	// ['.js-s3d-controller__showFilter', 'circle', 'Ви можете підсвітити<br/> інфраструктуру натиснув<br/> на кнопку', 1.2, 'big']

	init() {
		if (window.localStorage.getItem('info')) return
		this.createHelper()
		$('.js-s3d__helper__figure').addClass(`s3d__helper-${this.conf[0][1]}`)
		$('.js-s3d__helper__button').on('click', () => {
			$('.js-s3d__helper__content').removeClass('active')
			this.currentWindow++
			if (this.conf.length <= this.currentWindow) {
				this.hiddenHelper()
				return
			}
			this.update(this.conf[this.currentWindow])
		})
		this.update(this.conf[0])

		window.addEventListener('resize', () => {
			if (this.currentWindow >= this.conf.length) return
			this.update(this.conf[this.currentWindow])
		})
	}

	createHelper() {
		createMarkup('div', '.js-s3d__slideModule', {
			class: 's3d__helper js-s3d__helper',
			content: '<div class="s3d__helper__bg"></div>'
				+ '<div class="js-s3d__helper__figure"><div class="s3d__helper__figure-wrap"></div></div>'
				+ '<div class="js-s3d__helper__content s3d__helper__content">'
				+ '<div class="s3d__helper__text js-s3d__helper__text"></div>'
				+ '<button type="button" class="s3d__helper__button js-s3d__helper__button" ><svg width="24" height="17" viewBox="0 0 24 17" fill="none" xmlns="http://www.w3.org/2000/svg">\n'
				+ '<path d="M8.26465 0.0327106C9.1255 0.172903 9.59896 0.453288 7.8127 0.636617C7.41456 0.679753 4.27246 1.03563 3.61607 1.13268C2.64761 1.28366 3.36857 1.52091 4.38007 1.866C5.15483 2.1356 7.35 2.70715 9.91102 3.36498V0.517992C9.90026 -0.0319936 8.04944 0.000358471 8.04944 0.000358471C8.14628 0.0219265 8.22161 0.0327106 8.26465 0.0327106Z" fill="white"/>\n'
				+ '<path d="M21.3705 6.19048C22.651 6.49243 22.8124 7.19339 20.585 8.04533C16.1408 9.73843 14.1824 10.4286 10.5023 11.7119C9.56609 12.0354 9.66293 12.4452 10.5453 12.7687C15.7212 14.6452 22.2851 16.101 23.2321 16.3059V7.15026C23.2321 6.21205 21.2844 6.12577 21.0692 6.11499C21.1983 6.14734 21.3059 6.17969 21.3705 6.19048Z" fill="white"/>\n'
				+ '<path d="M2.4857 10.8059C4.28272 10.2128 10.1688 8.6922 14.6667 7.58145C16.3238 7.17165 15.8719 6.82656 14.9142 6.58932C9.15728 5.14425 2.64711 3.10607 0.258255 2.14629C0.161409 2.11394 0.0860849 2.0708 0 2.03845V11.7441C0 12.7686 2.01223 13.1784 2.01223 13.1784L2.03376 13.1676C-0.032282 12.1754 1.16215 11.248 2.4857 10.8059Z" fill="white"/>\n'
				+ '</svg> Далі </button></div>',
		})
		$('.js-s3d__helper').addClass('active')
	}

	update(conf) {
		const target = $(conf[0])
		const height = target.outerHeight()
		const width = target.outerWidth()
		const position = target.offset()
		const centerX = position.left + (width / 2)
		const centerY = position.top + (height / 2)
		const scale = conf[3]
		const list = $('.js-s3d__helper__figure')[0].classList

		for (const cl of list) {
			if (cl !== 'js-s3d__helper__figure') {
				$('.js-s3d__helper__figure').removeClass(cl)
			}
		}
		let size
		if (conf[4] === 'big') {
			size = (width > height) ? width * scale : height * scale
		} else if (conf[4] === 'small') {
			size = (width < height) ? width * scale : height * scale
		}

		$('.js-s3d__helper__figure').addClass(`s3d__helper-${conf[1]}`)
		$('.js-s3d__helper__content').addClass('active')
		$('.js-s3d__helper__figure').css({
			height: `${size}px`, width: `${size}px`, left: `${centerX}px`, top: `${centerY}px`,
		})
		$('.js-s3d__helper__text').html(conf[2])

		const x = this.checkPosContent(centerX, size, $('.js-s3d__helper__content').width(), $('.js-s3d__helper').width() / 2, scale, 20)
		let y = this.checkPosContent(centerY, size, $('.js-s3d__helper__content').height(), $('.js-s3d__helper').height() / 2, scale, 20)

		// console.log('x', x)
		// console.log('y', y)
		// else position in center screen translate on top
		if (x === centerX && y === centerY) y = centerY - (size / 2) - 20 - ($('.js-s3d__helper__content').height() / 2)

		$('.js-s3d__helper__content').css({ left: `${x}px`, top: `${y}px` })

		// $('.js-s3d__helper__figure')[0].classList.map(cl => {console.log(cl)});
	}

	// вычислить позицию контента,
	checkPosContent(pos, size, sizeWrap, centerScreen, scale, padding) {
		if ((pos < centerScreen) + (centerScreen / 2) && pos > centerScreen - (centerScreen / 2)) return pos
		if (pos >= centerScreen) {
			return pos - (size / 2) - padding - (sizeWrap / 2)
		}

		return pos + (size / 2) + padding + (sizeWrap / 2)
	}

	hiddenHelper() {
		$('.js-s3d__helper').removeClass('active')
		window.localStorage.setItem('info', true)
	}
}
