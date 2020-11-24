class Svg {
	constructor(data) {
		this.complexData = {}
		// this.imageUrl = data.imageUrl;
		// this.id = data.id;
		// this.numberSlide = data.numberSlide;
		// this.controllPoint = data.controllPoint;
		this.activeSlide = data.activeSlide
		// this.mouseSpeed = data.mouseSpeed;
		this.idCopmlex = data.idCopmlex
		this.type = data.type
		// this.click = data.click;
	}

	init(fn) {
		this.setActiveSvg = fn
		this.getData(this.selectSvg)
	}

	getData(fn) {
		const self = this
		// $.ajax('./datfaylik.php').done(function (msg) {
		//     this.complexData = JSON.parse(msg);
		//     fn.call(self, this.complexData)
		// })
		$.ajax('/wp-content/themes/optimisto/assets/s3d/svg.json').done(msg => {
			// $.ajax('/wp-admin/svg.json').done(function (msg) {
			fn.call(self, msg)
		})
	}

	selectSvg(data) {
		console.log(this.type, 33, data)
		if (this.type === 'complex') {
			this.createSvg(data.complex, this.type)
		} else if (this.type === 'courtyard') {
			this.createSvg(data.courtyard, this.type)
		} else if (this.type === 'house') {
			for (const i in data.house) { this.createSvg(data.house[i], i) }
			this.setActiveSvg()
		}
	}

	// получает
	createSvg(data, name) {
		const svgContainer = createMarkup('div', `.js-s3d__wrapper__${this.idCopmlex}`, { class: `s3d__svg-container s3d__svg-container__${name} js-s3d__svg-container__${name}` })
		// const svgContainer = createMarkup('div', `.js-s3d__wrapper__${this.idCopmlex}`, { class: `s3d__svg-container s3d__svg-container${name === 'complex' ? '__complex' : name} js-s3d__svg-container${name === 'complex' ? '__complex' : name}` })

		for (const key in data) {
			const svgWrap = document.createElement('div')
			if (+key === +this.activeSlide) {
				svgWrap.classList = `s3d__svgWrap js-s3d__svgWrap ${this.type}__${key} s3d__svg__active`
			} else {
				svgWrap.classList = `s3d__svgWrap js-s3d__svgWrap ${this.type}__${key}`
			}
			svgWrap.dataset.id = key
			$(svgContainer).append(svgWrap)
			$.ajax(data[+key].path).done(svg => {
				$(svgWrap).append(svg.documentElement)
				this.showAvailableFlat()
			})
		}
		// при клике на инфруструктуру получает данные с сервера и вставляет в попап
		$('.js-s3d__svg-container').on('click', '.js-s3d-svg__point-group', function () {
			$.ajax({
				url: '/wp-admin/admin-ajax.php',
				method: 'POST',
				data: {
					action: 'markerPopup',
					type: this.dataset.type,
				},
			}).done(response => JSON.parse(response)).done(res => {
				const answer = JSON.parse(res)
				$('.s3d-point__help-img').attr('src', answer.img)
				$('.s3d-point__help-title').html((answer.title || $(this).html()))
				$('.s3d-point__help-text').html(answer.text)
				$('.s3d-point__help-button').attr('href', (answer.url.url || '#')).html((answer.url.name || 'Детальнее'))
				$('.js-s3d-point__help').addClass('point-active')
			})
		})
		// закрывает попап инфрструктуры
		$('.js-s3d-point__help').on('click', '.js-s3d-point__help-close', () => {
			$('.js-s3d-point__help').removeClass('point-active')
		})
	}

	// createPointInfo() {
	//     let svgContainer = createMarkup('div', '.js-s3d__slideModule' , {class:'js-s3d__svg-point__help s3d__svg-point__help'});
	//     let content = ``;
	// };

	showAvailableFlat() {
		if ($('.js-s3d-controller__showFilter--input').prop('checked')) {
			$('.js-s3d-svg__point-group').css({ opacity: '1', display: 'flex' })
			return
		}
		$('.js-s3d-svg__point-group').css({ opacity: '0', display: 'none' })
	}
}
