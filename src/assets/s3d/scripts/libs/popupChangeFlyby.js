class PopupChangeFlyby {
	constructor(data) {
		this.state = {}
		this.popup = $('.js-s3d-popup-flyby')
		this.selectFlat = data.selectFlat
		// this.updateFsm = data.updateFsm
		this.popup.on('click', '[data-type="close"]', event => {
			this.closePopup()
		})
		this.popup.on('click', '[data-type="next"]', event => {
			this.activateTranslate()
		})

		this.updateState = this.updateState.bind(this)
		this.updateContent = this.updateContent.bind(this)
	}

	updateState(config, id) {
		this.currentId = id
		this.state = config
	}

	updateContent(flat) {
		// const wrap = $('.js-s3d-popup-flyby__active')
		const cor = flat.getBoundingClientRect()
		// wrap.css({
		// 	top: cor.y,
		// 	left: cor.x,
		// 	height: flat.offsetHeight,
		// 	width: flat.offsetWidth,
		// })

		// wrap.html('')
		// wrap.append(flat.cloneNode(true))

		const height = flat.offsetHeight
		const top = cor.y + (height / 2)
		$('.js-s3d-popup-flyby__bg-active').css({
			transform: `translate(0, ${top}px)`,
			width: $('.js-s3d-filter')[0].offsetWidth,
		})

		this.flatId = +flat.dataset.id
		this.popup.find('[data-type="title"]').html(flat.dataset.type)
	}

	openPopup() {
		if (!this.popup.hasClass('s3d-active')) {
			this.popup.addClass('s3d-active')
		}
	}

	closePopup() {
		this.popup.removeClass('s3d-active')
	}

	activateTranslate() {
		const type = Object.keys(this.state)[0]
		if (!type) return
		this.closePopup()
		const slideNumber = Object.keys(this.state[type])[0]
		this.selectFlat(this.currentId, type, slideNumber)
		// this.updateFsm(this.state, this.flatId)
	}
}
