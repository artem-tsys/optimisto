class App {
	constructor(data) {
		this.config = data
		this.id = data.id
		this.sectionName = ['complex1', 'courtyard1', 'complex2', 'courtyard2', 'plannings', 'apart']
		this.activeSectionList = ['complex1', 'courtyard1', 'complex2', 'courtyard2', 'plannings', 'apart']
		this.activeSection = 'complex1'
		this.activeHouse = undefined
		this.flatList = {}
		this.init = this.init.bind(this)
		this.filterInit = this.filterInit.bind(this)
		this.loader = {
			show: () => {
				$('.fs-preloader').addClass('preloader-active')
				$('.fs-preloader-bg').css({ filter: 'blur(10px)' })
			},
			hide: block => {
				if (block) this.scrollToBlock(600)(block)
				// this.loader.miniOn()
				setTimeout(() => {
					$('.fs-preloader').removeClass('preloader-active')
					$('.fs-preloader-bg').css({ filter: 'none' })
					$('.first-loader').removeClass('first-loader')
				}, 200)
			},
			turnOn: el => {
				if (el && el.length > 0) {
					el.addClass('s3d-unActive').prop('disabled', true)
					return
				}
				const arr = ['.s3d__button', '.js-s3d-select[data-type="plannings"]', '.js-s3d-controller__openFilter']
				arr.forEach(name => {
					$(name).addClass('s3d-unActive').prop('disabled', true)
				})
			},
			turnOff: el => {
				if (el && el.length > 0) {
					el.removeClass('s3d-unActive').prop('disabled', false)
					return
				}
				const arr = ['.s3d__button', '.js-s3d-select[data-type="plannings"]', '.js-s3d-controller__openFilter']
				arr.forEach(name => {
					$(name).removeClass('s3d-unActive').prop('disabled', false)
				})
			},
			miniOn: () => {
				$('.js-fs-preloader-before').addClass('preloader-active')
			},
			miniOff: () => {
				$('.js-fs-preloader-before').removeClass('preloader-active')
			},
		}
		this.configProject = {}
		this.flatListObj = {}
		this.activeFlat = {
			get value() {
				return this.num
			},
			set value(val) {
				this.num = +val
			},
		}
		this.scrollToBlock = this.scrollToBlock.bind(this)
		this.showSvgIn3D = this.showSvgIn3D.bind(this)
		this.selectSlider = this.selectSlider.bind(this)
		this.addBlur = this.addBlur.bind(this)
		this.changeBlockIndex = this.changeBlockIndex.bind(this)
		this.ActiveHouse = {
			get: () => this.activeHouse,
			set: num => {
				this.activeHouse = +num
			},
		}
		this.compass = {
			set: active => {
				let deg = 0
				if (active) {
					this.compass.current = active
					deg = (360 / 180 * active) + (360 / 180 * this.compass.default)
				} else {
					deg = this.compass.defaultDeg
				}
				$('.s3d-controller__compass svg').css('transform', `rotate(-${deg}deg)`)
			},
			setApart: () => {
				$('.s3d-controller__compass svg').css('transform', `rotate(${this.compass.degApart}deg)`)
			},
			setFloor: () => {
				$('.s3d-controller__compass svg').css('transform', `rotate(${this.compass.degFloor}deg)`)
			},
			save: deg => {
				this.compass.lastDeg = deg
			},
			current: 0,
			default: 11,
			defaultDeg: -230,
			degApart: -310,
			degFloor: -230,
			lastDeg: -230,
		}
		this.currentShowFlats = []
		// this.currentShowFlats = new Proxy(this.currentShowFlats, {
		// 	self: this,
		// 	set(target, prop, val) {
		// 		console.log(106, target, prop, val)
		// 		if (val) {
		// 			console.log(106)
		// 			this.self.plannings.updateShowFlat(val)
		// 			this.self.plannings.pagination()
		// 		}
		// 		return val
		// 	},
		// })
		this.popupChangeFlyby = new PopupChangeFlyby({ selectFlat: this.showSvgIn3D })

		this.getCurrentShowFlats = this.getCurrentShowFlats.bind(this)
		this.setCurrentShowFlats = this.setCurrentShowFlats.bind(this)

		this.lang = document.querySelector('html').lang
		this.infoBlockTranslateFlybyTexts = {
			ua: {
				build: 'Будинок',
				complex: 'Зовнішній \n фасад',
				courtyard: 'Внутрішній \n фасад',
			},
			en: {
				build: 'House',
				complex: 'External \n facade',
				courtyard: 'Internal \n facade',
			},
			ru: {
				build: 'Дом',
				complex: 'Внешний \n фасад',
				courtyard: 'Внутренний \n фасад',
			},
		}

		this.infoBlockTranslateFlybyWrapContainer = document.querySelector('.js-s3d-hover-translate')
		this.infoBlockTranslateFlybyContainer = document.querySelector('.js-s3d-hover-translate--text')
		this.infoBlockTranslateFlybyLinkContainer = document.querySelector('.js-s3d-hover-translate [data-link]')
	}

	init() {
		this.history = new History({ scrollToBlock: this.scrollToBlock, animateBlock: this.animateBlock })
		this.history.init()
		if (window.location.hostname === 'localhost') {
			this.getFlatList('/wp-content/themes/optimisto/static/flats.json', this.filterInit)
		} else {
			this.getFlatList('/wp-admin/admin-ajax.php', this.filterInit)
		}
		// scroll blocks
		// $('body').on('mousewheel', (e) =>  {
		//   if($(document).width() > 1024 && !$('.js-s3d__slideModule').hasClass('no-scroll')) this.scrollBlock(e,this.activeSection);
		// });
		function removeHoverHandler() {
			$('.s3d-select__hover').removeClass('s3d-select__hover')
			$(document).off('click', removeHoverHandler)
		}
		function hoverHandler(e) {
			if (window.innerWidth > 769) return
			e.stopPropagation()
			e.currentTarget.closest('.s3d-select').classList.add('s3d-select__hover')
			$(document).on('click', removeHoverHandler)
		}
		$('.js-s3d-select__hover').on('click', hoverHandler)

		$('.js-s3d-controller__elem').on('click', '.js-s3d-select', e => {
			const { type, value } = e.currentTarget.dataset
			if (!type || type === this.activeSection) return
			let updatedType = ''
			const side = $('.js-s3d-select-side')
			const build = $('.js-s3d-select-build')
			switch (type) {
			case 'build':
				updatedType = side.data('value') + value
				this.changeControllerActive(build, value, e.target.innerHTML)
				break
			case 'side':
				updatedType = value + build.data('value')
				this.changeControllerActive(side, value, e.target.innerHTML)
				break
			case 'plannings':
				updatedType = type
				break
			default:
				break
			}
			this.setActiveButtonController(type)
			this.history.update(updatedType)
			this.selectSlider(e, updatedType)
			// if (type && type !== this.activeSection) {
			// 	this.history.update(type)
			// 	this.selectSlider(e, type)
			// }
		})

		// this.createStructureFlatsIdSvg()
		$('.js-s3d-hover-translate').on('click', '[data-closed]', () => {
			this.clearStyleInfoBlockTranslateFlyby()
		})

		$('.js-s3d-hover-translate').on('click', '[data-link]', e => {
			e.preventDefault()
			this.selectSlider(e, e.target.dataset.type)
			this.clearStyleInfoBlockTranslateFlyby()
		})

		this.infoBox = $('.js-s3d-infoBox')
		this.infoBox.on('click', '.js-s3d-infoBox__close', () => {
			this.infoBoxActive = false
			this.infoBox.removeClass('s3d-infoBox-active')
			this.infoBox.removeClass('s3d-infoBox-hover')
		})

		this.infoBox.on('click', '.s3d-infoBox__link', event => {
			event.preventDefault()
			const id = +event.currentTarget.dataset.id
			const status = this.flatListObj[id].sale
			if (status !== '1') return
			this.activeFlat.value = id
			this.selectSlider(+event.currentTarget.dataset.id, 'apart', +event.currentTarget.dataset.id)
		})
	}

	controllerHandler(name) {
		const side = $('.js-s3d-select-side')
		const build = $('.js-s3d-select-build')
		const translates = this.infoBlockTranslateFlybyTexts[this.lang]
		switch (name) {
		case 'complex1':
			this.changeControllerActive(build, 1, `${translates.build} 1`)
			this.changeControllerActive(side, 'complex', translates.complex)
			break
		case 'complex2':
			this.changeControllerActive(build, 2, `${translates.build} 2`)
			this.changeControllerActive(side, 'complex', translates.complex)
			break
		case 'courtyard1':
			this.changeControllerActive(build, 1, `${translates.build} 1`)
			this.changeControllerActive(side, 'courtyard', translates.courtyard)
			break
		case 'courtyard2':
			this.changeControllerActive(build, 2, `${translates.build} 2`)
			this.changeControllerActive(side, 'courtyard', translates.courtyard)
			break
		default:
			break
		}
	}

	changeControllerActive(element, value, text) {
		element.find('.js-s3d-select-text').html(text)
		element.data('value', value)
	}

	setActiveButtonController(type) {
		$('.s3d-select').removeClass('active')
		const side = $('.js-s3d-select-side')
		const build = $('.js-s3d-select-build')
		const plannings = $('.js-s3d-select[data-type="plannings"]')
		switch (type) {
		case 'build':
			side.closest('.s3d-select').addClass('active')
			build.closest('.s3d-select').addClass('active')
			break
		case 'side':
			side.closest('.s3d-select').addClass('active')
			build.closest('.s3d-select').addClass('active')
			break
		case 'plannings':
			plannings.addClass('active')
			break
		default:
			break
		}
	}

	createStructureFlatsIdSvg() {
		const conf = ['complex1', 'complex2', 'courtyard1', 'courtyard2']
		const result = {}
		conf.map(type => {
			result[type] = {}
			this.config[type].controlPoint.forEach(slide => {
				result[type][slide] = []
				$.ajax(`/wp-content/themes/optimisto/assets/s3d/images/svg/${type}/${slide}.svg`).then(responsive => {
					const list = [...responsive.querySelectorAll('polygon')]
					result[type][slide] = list.map(el => +el.dataset.id)
				})
			})
		})
		// setTimeout(() => {
		// 	console.log(JSON.stringify(result))
		// }, 10000)
	}

	showAvailableFlat() {
		// $('.js-s3d-controller__showFilter--input').click();
		if ($('.js-s3d-controller__showFilter--input').prop('checked')) {
			// $('.js-s3d-controller__showFilter--input').prop('checked',false);
			$('.js-s3d-svg__point-group').css({ opacity: '1', display: 'flex' })
		} else {
			// $('.js-s3d-controller__showFilter--input').prop('checked',true);
			// $('#js-s3d__wrapper polygon').css({'opacity': ''});
			$('.js-s3d-svg__point-group').css({ opacity: '0', display: 'none' })
		}
	}

	scrollBlock(e, active) {
		if (this.filter) {
			this.filter.hidden()
		}

		const ind = this.activeSectionList.findIndex(el => (el === active))
		if (this.animateFlag && this.activeSectionList.length >= 2) {
			// this.complex.hiddenInfo()
			this.animateFlag = false
			if (e.originalEvent && e.originalEvent.wheelDelta / 120 > 0) {
				this.animateBlock('translate', 'up')
				if (ind > 0) {
					this.history.update(this.activeSectionList[ind - 1])
					this.scrollToBlock(600)(this.activeSectionList[ind - 1])
				} else if (ind === 0) {
					this.history.update(this.activeSectionList[this.activeSectionList.length - 1])
					this.scrollToBlock(600)(this.activeSectionList[this.activeSectionList.length - 1])
				}
			} else if (e.originalEvent && e.originalEvent.wheelDelta / 120 < 0) {
				this.animateBlock('translate', 'down')
				if (ind < this.activeSectionList.length - 1) {
					this.history.update(this.activeSectionList[ind + 1])
					this.scrollToBlock(600)(this.activeSectionList[ind + 1])
				} else if (ind === this.activeSectionList.length - 1) {
					this.history.update(this.activeSectionList[0])
					this.scrollToBlock(600)(this.activeSectionList[0])
				}
			} else {
				this.animateBlock('translate', 'down')
				this.scrollToBlock(600)(active)
			}
		}
	}

	filterButtonShowHide(type) {
		if (type !== 'complex1') {
			$('.js-s3d-filter').removeClass('active')
			// $('.js-s3d-filter__show').css('display','none');
			// return;
		} else if (type !== 'apart') {
			// $('.js-s3d-filter__open').css('display','flex');
			// $('.js-s3d-filter__show').css('display','flex');
			// return;
		}
		// $('.js-s3d-filter').show();
		// $('.js-s3d-filter__open').css('display','flex');
		// $('.js-s3d-filter__show').css('display','flex');
	}

	getFlatList(url, callback) {
		if (window.location.hostname === 'localhost') {
			$.ajax({
				url,
				type: 'GET',
				success: response => {
					callback(response)
				},
			})
		} else {
			$.ajax({
				url,
				type: 'POST',
				data: 'action=getFlats',
				success: response => {
					callback(JSON.parse(response))
				},
			})
		}
	}

	setCurrentShowFlats(list) {
		this.currentShowFlats = list
		this.plannings.updateShowFlat(list)
		this.plannings.pagination()
	}

	getCurrentShowFlats() {
		return this.currentShowFlats
	}

	getFlatObj(id) {
		return this.flatListObj[id]
	}

	getMinMaxParam(data) {
		const names = this.filter.getNameFilterFlat()
		data.forEach(el => {
			for (const key in el) {
				for (const nameKey in names) {
					if (key === names[nameKey]) {
						const num = typeof el[key] === 'string' ? el[key].replace(/\s+/g, '') : el[key]
						if (!this.configProject[key]) this.configProject[key] = { min: num, max: num }
						if (num < +this.configProject[key].min) this.configProject[key].min = num
						if (num > +this.configProject[key].max) this.configProject[key].max = num
					}
				}
			}
		})
	}

	changePopupFlyby(foundApartments, flat, id) {
		this.popupChangeFlyby.updateContent(flat)
		this.popupChangeFlyby.updateState(foundApartments, id)
		this.popupChangeFlyby.openPopup()
	}

	checkFirstLoadState() {
		$.ajax('/wp-content/themes/optimisto/static/structureFlats.json').then(resp => {
			this.structureFlats = resp
		})
	}

	// checkNextFlyby(type, id) {
	// 	const foundApartments = this.checkFlatInSVG(id)
	// 	console.log(type, foundApartments)
	// 	if (Object.keys(foundApartments).length == 0) {
	// 		return null
	// 	}
	// 	if (foundApartments[type]) {
	// 		return {
	// 			change: false,
	// 		}
	// 	}
	// 	return listId
	// }

	checkFlatInSVG(id) { // получает id квартиры, отдает объект с ключами где есть квартиры
		const flyby = this.structureFlats
		const result = {}
		for (const type in flyby) {
			for (const slide in flyby[type]) {
				const hasId = flyby[type][slide].includes(+id)
				if (hasId && !result[type]) {
					result[type] = {}
				}
				if (hasId && !result[type][slide]) {
					result[type][slide] = []
				}
				if (hasId) {
					result[type][slide].push(+slide)
				}
			}
		}
		// for (const num in flyby) {
		// 	for (const side in flyby[num]) {
		// 		const type = flyby[num][side]
		// 		for (const slide in type) {
		// 			const hasId = type[slide].includes(+id)
		// 			if (hasId && !_.has(result, [num])) {
		// 				result[num] = {}
		// 			}
		// 			if (hasId && !_.has(result, [side])) {
		// 				result[num][side] = []
		// 			}
		// 			if (hasId) {
		// 				result[num][side].push(+slide)
		// 			}
		// 		}
		// 	}
		// }
		return result
	}

	initChangeFlybyHandler(id, flat) {
		const foundApartments = this.checkFlatInSVG(id)
		const type = this.activeSection
		if (Object.keys(foundApartments).length == 0) {
			return
		}

		if (foundApartments[type]) {
			const slideNum = Object.keys(foundApartments[type]).map(value => +value)
			this.showSvgIn3D(id, type, slideNum)
			return
		}

		this.changePopupFlyby(foundApartments, flat, id)
	}

	filterInit(data) {
		const list = {}
		const flats = data.filter(el => {
			// условие откидывающее все кроме квартир
			if (el.type === 'TEST_OUTSIDE' || el.type === 'TEST_INSIDE') return false
			list[el.id] = el
			list[el.id]['favourite'] = false
			return el
		})
		this.flatListObj = list
		this.flatList = flats
		const filterConfig = {
			addBlur: this.addBlur,
			flatList: this.flatList,
			flatListObj: this.flatListObj,
			showSvgIn3D: this.showSvgIn3D,
			getCurrentShowFlats: this.getCurrentShowFlats,
			setCurrentShowFlats: this.setCurrentShowFlats,
			initChangeFlybyHandler: this.initChangeFlybyHandler.bind(this),
		}
		this.filter = new Filter(filterConfig)
		this.getMinMaxParam(this.flatList)
		this.filter.init(this.configProject)
		this.loader.turnOff($('.js-s3d-controller__openFilter'))
		// plannings должен быть выше favourites.  plannings создает элементы записывает ссылку в обьект, favourites обращается по этой ссылке к элементу.
		this.plannings = new Plannings({
			wrap: '.js-s3d__pl__list',
			data: this.flatListObj,
			list: this.flatList,
			click: this.selectSlider,
			activeFlat: this.activeFlat,
			getCurrentShowFlats: this.getCurrentShowFlats,
			setCurrentShowFlats: this.setCurrentShowFlats,
		})
		this.plannings.init()
		this.loader.turnOff($('.js-s3d-select[data-type="plannings"]'))
		this.favourites = new Favourite({
			wrap: '.js-s3d__fv tbody',
			data: this.flatListObj,
			list: this.flatList,
			click: this.selectSlider,
			activeFlat: this.activeFlat,
		})
		// this.deb = this.debounce(this.resize.bind(this), 700)
		// $(window).resize(() => {
		// 	this.deb(this)
		// })
		this.checkFirstLoadState()

		//
		//
		//
		//
		this.loader.turnOn()
		const config = this.config.complex1
		config.idCopmlex = 'complex1'
		config.type = 'complex1'
		config.click = this.selectSlider.bind(this)
		config.getFlatObj = this.getFlatObj.bind(this)
		config.activeFlat = this.activeFlat
		config.loader = this.loader
		config.ActiveHouse = this.ActiveHouse
		config.compass = this.compass
		config.addBlur = this.addBlur
		// config.unActive = this.unActive
		config.changeBlockIndex = this.changeBlockIndex
		config.filter = this.filter
		config.getCurrentShowFlats = this.getCurrentShowFlats
		config.infoBlockTranslateFlybyHandler = this.infoBlockTranslateFlybyHandler.bind(this)
		config.clearStyleInfoBlockTranslateFlyby = this.clearStyleInfoBlockTranslateFlyby.bind(this)
		config.infoBlockTranslateFlyby = this.infoBlockTranslateFlyby.bind(this)

		this.createWrap(config, 'canvas')
		this.complex1 = new Slider(config)
		this.complex1.init()

		$('.js-s3d__wrapper__complex').css('z-index', '100')
		$('.js-s3d-controller').data('type', 'complex1')
		this.setActiveButtonController('build')

		this.animateFlag = true
	}

	createWrap(conf, tag) {
		const wrap = createMarkup('div', `${conf.id}`, { class: `s3d__wrap js-s3d__wrapper__${conf.idCopmlex} s3d__wrapper__${conf.idCopmlex}` })
		const wrap2 = createMarkup('div', wrap, { id: `js-s3d__wrapper__${conf.idCopmlex}`, style: 'position:relative;' })
		createMarkup(tag, wrap2, { id: `js-s3d__${conf.idCopmlex}` })
	}

	selectSlider(id, type, numSlide) {
		// const houseNum = e.currentTarget.dataset.build || e.currentTarget.value
		// this.loader.show()
		// this.animateBlock('translate', 'down')
		switch (type) {
		case 'complex1':
			this.selectSliderType(id, type, Layout, numSlide)
			break
		case 'courtyard1':
			this.selectSliderType(id, type, Slider, numSlide)
			break
		case 'complex2':
			this.selectSliderType(id, type, Slider, numSlide)
			break
		case 'courtyard2':
			this.selectSliderType(id, type, Slider, numSlide)
			break
		case 'apart':
			$('.fs-preloader').addClass('s3d-preloader__full')
			this.selectSliderType(id, type, Apartments)
			break
		case 'plannings':
			// $('.fs-preloader').addClass('s3d-preloader__full')
			this.scrollBlock({}, type)
			break
		default:
			this.animateBlock('translate', 'down')
			break
		}
	}

	selectSliderType(id, type, Fn, idApart) {
		const config = this.config[type]
		// this.history.update(type)
		// if (id) config.flat = id
		config.idCopmlex = type
		config.type = type
		config.loader = this.loader
		config.configProject = this.configProject
		// config.changeCurrentFloor = this.changeCurrentFloor
		config.ActiveHouse = this.ActiveHouse
		config.activeFlat = this.activeFlat
		config.compass = this.compass
		config.addBlur = this.addBlur
		// config.unActive = this.unActive
		config.click = this.selectSlider
		config.scrollBlock = this.scrollBlock.bind(this)
		config.getFavourites = this.favourites.getFavourites
		config.getFlatObj = this.getFlatObj.bind(this)
		config.changeBlockIndex = this.changeBlockIndex
		config.filter = this.filter
		config.getCurrentShowFlats = this.getCurrentShowFlats
		config.infoBlockTranslateFlybyHandler = this.infoBlockTranslateFlybyHandler.bind(this)
		config.clearStyleInfoBlockTranslateFlyby = this.clearStyleInfoBlockTranslateFlyby.bind(this)
		config.infoBlockTranslateFlyby = this.infoBlockTranslateFlyby.bind(this)
		config.typePrevFlyby = this.activeSection
		// config.lang = this.lang
		// config.infoBlockTranslateFlybyTexts = this.infoBlockTranslateFlybyTexts

		if ($(`#js-s3d__${type}`).length > 0) {
			this.animateBlock('translate', 'down')
			this[type].update(config)
			if (idApart) {
				this[type].toSlideNum(idApart)
			}
			// this.activeSectionList.push(config.idCopmlex);
		} else {
			if (type === 'courtyard1' || type === 'complex1' || type === 'courtyard2' || type === 'complex2') {
				this.filter.hidden()
				this.loader.show()
			} else {
				this.animateBlock('translate', 'down')
			}

			const typeWrap = (['complex1', 'courtyard1', 'complex2', 'courtyard2'].includes(type)) ? 'canvas' : 'div'
			this.createWrap(config, typeWrap)
			// this.createWrap(config, type !== 'courtyard1' ? 'div' : 'canvas')
			if (idApart) {
				config.activeSlide = idApart
				config.activeFlat.value = id
			}
			this[type] = new Fn(config)
			this[type].init(config)
			this.activeSectionList.push(config.idCopmlex)
			// делает кнопку переключателя неактивной
			// $(`.js-s3d-select__${config.type}`).prop('disabled', false)
		}
	}

	showSvgIn3D(id, type, slideNum = null) {
		if (type !== this.activeSection) {
			this.history.update(type)
			this.scrollBlock(type)
		}

		if (!this[type]) {
			this.selectSlider(id, type, slideNum)
			return
		}
		this[type].toSlideNum(id, slideNum)
	}

	scrollToBlock(time = 600) {
		return block => {
			setTimeout(() => {
				if (this.filter) {
					this.filter.hidden()
				}
				// this.complex1.hiddenInfo()
				// this.complex1.hiddenInfoFloor()
				this.compass.save(this.compass.current)
				switch (block) {
				case 'apart':
					this.compass.setApart()
					break
				case 'floor':
					this.compass.setFloor()
					break
				case 'plannings':
					if (document.documentElement.clientWidth > 768) {
						this.filter.show()
						$('.js-s3d-filter').removeClass('active-filter')
					} else {
						this.filter.hidden()
						$('.js-s3d-filter').addClass('active-filter')
					}
					break
				default:
					$('.js-s3d-filter').addClass('active-filter')
					this.compass.set(this.compass.lastDeg)
				}

				this.changeBlockIndex(block)
			}, time)
		}
	}

	changeBlockIndex(block) {
		// $('.js-s3d-select.active').removeClass('active')
		this.sectionName.forEach(name => {
			if (name === block) {
				this.activeSection = name
				$(`.js-s3d__wrapper__${name}`).css('z-index', '100')
				$('.js-s3d-controller')[0].dataset.type = name
				if (name === 'plannings') {
					$(`.js-s3d-select[data-type = ${name}]`).addClass('active')
				} else {
					this.controllerHandler(name)
				}
			} else {
				$(`.js-s3d__wrapper__${name}`).css('z-index', '')
			}
		})
	}

	// changeCurrentFloor(floor) {
	// 	this.complex.updateActiveFloor(floor)
	// }

	// changeCurrentFlat(flat) {
	// this.complex1.updateActiveFlat(flat)
	// this.complex2.updateActiveFlat(flat)
	// }

	getInfoBlockTranslateText(build, flyby) {
		if (flyby.includes('complex')) {
		// if (type.includes(flyby)) {
			return `${this.infoBlockTranslateFlybyTexts[this.lang].build}-${build}`
		}
		return this.infoBlockTranslateFlybyTexts[this.lang][flyby]
	}

	infoBlockTranslateFlyby(e) {
		const { clientX: x, clientY: y } = e
		const { build, flyby } = e.target.dataset
		const text = this.getInfoBlockTranslateText(build, flyby)
		this.infoBlockTranslateFlybyWrapContainer.style = `opacity: 1; top: ${y}px; left: ${x}px;`
		this.infoBlockTranslateFlybyContainer.innerText = text
		this.infoBlockTranslateFlybyLinkContainer.dataset.type = `${flyby}-${build}`
	}

	clearStyleInfoBlockTranslateFlyby() {
		this.infoBlockTranslateFlybyWrapContainer.style = ''
	}

	infoBlockTranslateFlybyHandler(e, type, flyby, build) {
		if (!isDevice('mobile')) {
			this.selectSlider(e, flyby + build)
			return
		}
		if (type && type === 'flyby') {
			this.infoBlockTranslateFlyby(e)
			return
		}
		this.clearStyleInfoBlockTranslateFlyby()
	}

	animateBlock(id, clas) {
		const layers = document.querySelectorAll(`.${id}-layer`)
		layers[0].classList.remove('translate-layer__down', 'translate-layer__up', 'active')
		layers[0].classList.add(`translate-layer__${clas}`)
		setTimeout(() => layers[0].classList.add('active'), 100)
		setTimeout(() => {
			this.animateFlag = true
			return true
		}, 1000)
	}

	addBlur(wrap, time) {
		$(wrap).addClass('s3d-blur')
		setTimeout(() => {
			$(wrap).removeClass('s3d-blur')
		}, time || 700)
	}

	resize() {
		const type = $('.js-s3d-controller')[0].dataset.type || ''
		if (document.documentElement.offsetWidth <= 768) {
			if (type === 'plannings') {
				this.filter.hidden()
				$('.js-s3d-filter').removeClass('active-filter')
			} else {
				this.filter.hidden()
				$('.js-s3d-filter').addClass('active-filter')
			}
		} else {
			if (type === 'plannings') {
				this.filter.show()
				$('.js-s3d-filter').removeClass('active-filter')
				return
			}
			// else {
			this.filter.hidden()
			$('.js-s3d-filter').addClass('active-filter')
			// }
		}
	}

	debounce(f, t) {
		return function (args) {
			const previousCall = this.lastCall
			this.lastCall = Date.now()
			if (previousCall && ((this.lastCall - previousCall) <= t)) {
				clearTimeout(this.lastCallTimer)
			}
			this.lastCallTimer = setTimeout(() => f(args), t)
		}
	}
}
