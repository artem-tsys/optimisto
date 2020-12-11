class App {
	constructor(data) {
		this.config = data
		this.id = data.id
		// this.sectionName = ['complex']
		this.sectionName = ['complex', 'courtyard', 'plannings', 'apart']
		this.activeSectionList = ['complex', 'courtyard', 'plannings', 'apart']
		this.activeSection = 'complex'
		this.activeHouse = undefined
		this.flatList = {};
		this.init = this.init.bind(this)
		this.filterInit = this.filterInit.bind(this)
		this.loader = {
			show: () => {
				$('.fs-preloader').addClass('preloader-active')
				$('.fs-preloader-bg').css({ filter: 'blur(10px)' })
			},
			hide: block => {
				if (block) this.scrollToBlock(600)(block)
				setTimeout(() => {
					$('.fs-preloader').removeClass('preloader-active')
					$('.fs-preloader-bg').css({ filter: 'none' })
					$('.first-loader').removeClass('first-loader')
				}, 200)
			},
		}
		this.configProject = {}
		this.flatListObj = {}
		this.activeFlat = {
			// value: null,
			get value() {
				return this.num
			},
			set value(val) {
				this.num = +val
			},
		}
		// this.changeCurrentFloor = this.changeCurrentFloor.bind(this);
		this.scrollToBlock = this.scrollToBlock.bind(this)
		this.showSvgIn3D = this.showSvgIn3D.bind(this)
		this.selectSlider = this.selectSlider.bind(this)
		this.unActive = this.unActive.bind(this)
		this.addBlur = this.addBlur.bind(this)
		this.changeBlockIndex = this.changeBlockIndex.bind(this)
		this.getCurrentShowFlats = this.getCurrentShowFlats.bind(this)
		// this.animateBlock = this.animateBlock.bind(this);
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
		this.currentShowFlats = {
			flats: [],
		}
		this.currentShowFlats = new Proxy(this.currentShowFlats, {
			self: this,
			set(target, prop, val) {
				if (val) {
					console.trace()
					console.log(this.self.plannings)
					this.self.plannings.updateShowFlat(val)
					this.self.plannings.pagination()
				}
				return val
			},
		})
	}

	init() {
		this.history = new History({ scrollToBlock: this.scrollToBlock, animateBlock: this.animateBlock })
		// this.history = new History({ scrollToBlock: this.scrollToBlock })
		this.history.init()

		this.getFlatList('/wp-content/themes/optimisto/static/flats.json', this.filterInit)
		// this.getFlatList('static/apPars.php', this.filterInit)
		// this.getFlatList('/wp-admin/admin-ajax.php', this.filterInit)

		this.loader.show()
		const config = this.config.complex
		config.idCopmlex = 'complex'
		config.type = 'complex'
		config.click = this.selectSlider.bind(this)
		config.getFlatObj = this.getFlatObj.bind(this)
		config.activeFlat = this.activeFlat
		config.loader = this.loader
		config.ActiveHouse = this.ActiveHouse
		config.compass = this.compass
		config.addBlur = this.addBlur
		config.unActive = this.unActive
		config.changeBlockIndex = this.changeBlockIndex

		this.createWrap(config, 'canvas')
		this.complex = new Slider(config)
		this.complex.init()
		$('.js-s3d__wrapper__complex').css('z-index', '100')
		$('.js-s3d-controller').data('type', 'complex')
		// $('.s3d-select__head').on('click', e => {
		// 	const self = this
		// 	const block = $(e.currentTarget).next()
		// 	block.css({ visibility: 'visible' })
		// 	function select(ev) {
		// 		if (ev.target.className === 's3d-select-value' && ev.target.dataset.house) {
		// 			self.selectSlider(e, self.complex.type);
		// 		}
		// 		$('body').off('click', event => { select(event) })
		// 		block.css({ visibility: 'hidden' })
		// 	}
		// 	$('body').on('mousedown', select)
		// });

		this.animateFlag = true

		// scroll blocks
		// $('body').on('mousewheel', (e) =>  {
		//   if($(document).width() > 1024 && !$('.js-s3d__slideModule').hasClass('no-scroll')) this.scrollBlock(e,this.activeSection);
		// });

		$('.js-s3d-controller__elem').on('click', '.s3d-select', e => {
			const { type } = e.currentTarget.dataset
			if (type && type !== this.activeSection) {
				this.history.update(type)
				this.selectSlider(e, type)
			}
		})

		// const helper = new Helper()
		// helper.init()

		// $('.js-s3d-controller__showFilter').on('click', () => {
		// 	$('.js-s3d-controller__showFilter--input').prop('checked',
		// 		!$('.js-s3d-controller__showFilter--input').prop('checked'))
		// 	this.showAvailableFlat()
		// })

		// this.helpsInfo();
		// this.loader.hide();
		// this.resize()
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

		const ind = this.activeSectionList.findIndex(el => { if (el === active) return true })
		if (this.animateFlag && this.activeSectionList.length >= 2) {
			this.complex.hiddenInfo()
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
		if (type !== 'complex') {
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
		// $.ajax({
		// 	url,
		// 	type: 'POST',
		// 	data: 'action=getFlats',
		// 	success: response => {
		// 		callback(JSON.parse(response))
		// 	},
		// })
		$.ajax({
			url,
			type: 'GET',
			success: response => {
				callback(response)
			},
		})
	}

	getCurrentShowFlats(list) {
		this.currentShowFlats.flats = list
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

	filterInit(data) {
		// this.filter = new Filter(this.config, data)
		const list = {}
		const flats = data.filter(el => {
			if (el['type_object'] === '1') {
				list[el.id] = el
				list[el.id]['favourite'] = false
				return el
			}
			return false
		})
		this.flatListObj = list
		this.flatList = flats
		const filterConfig = {
			addBlur: this.addBlur,
			flatList: this.flatList,
			flatListObj: this.flatListObj,
			showSvgIn3D: this.showSvgIn3D,
			getCurrentShowFlats: this.getCurrentShowFlats,
		}
		this.filter = new Filter(filterConfig)
		this.getMinMaxParam(this.flatList)
		this.filter.init(this.configProject)

		// plannings должен быть выше favourites.  plannings создает элементы записывает ссылку в обьект, favourites обращается по этой ссылке к элементу.
		this.plannings = new Plannings({
			wrap: '.js-s3d__pl__list',
			data: this.flatListObj,
			list: this.flatList,
			click: this.selectSlider,
			activeFlat: this.activeFlat,
			getCurrentShowFlats: this.getCurrentShowFlats,
		})
		this.plannings.init()
		this.favourites = new Favourite({
			wrap: '.js-s3d__fv tbody',
			data: this.flatListObj,
			list: this.flatList,
			click: this.selectSlider,
			activeFlat: this.activeFlat,
		})
		this.deb = this.debounce(this.resize.bind(this), 700)
		$(window).resize(() => {
			this.deb(this)
		})
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
		case 'complex':
			// this.selectSliderType(e, 'house', Slider)
			// this.selectSliderType(e, 'floor', Layout)
			this.selectSliderType(id, type, Layout, numSlide)
			break
			// case 'house':
			//     this.selectSliderType(e, 'floor', Layout);
			//     break;
		case 'courtyard':
			// this.selectSliderType(e, 'house', Slider)
			// this.selectSliderType(e, 'floor', Layout)
			this.selectSliderType(id, type, Slider, numSlide)
			break
			// case 'house':
			//     this.selectSliderType(e, 'floor', Layout);
			//     break;
		case 'apart':
			// $('.fs-preloader').addClass('s3d-preloader__full')
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
		console.log('selectSliderType(id, type, Fn, idApart)', this.favourites)
		const config = this.config[type]
		// this.history.update(type)
		if (id) config.flat = id
		config.idCopmlex = type
		config.type = type
		config.loader = this.loader
		config.configProject = this.configProject
		config.changeCurrentFloor = this.changeCurrentFloor
		config.ActiveHouse = this.ActiveHouse
		config.activeFlat = this.activeFlat
		config.compass = this.compass
		config.addBlur = this.addBlur
		config.unActive = this.unActive
		config.click = this.selectSlider
		config.scrollBlock = this.scrollBlock.bind(this)
		config.getFavourites = this.favourites.getFavourites
		config.getFlatObj = this.getFlatObj.bind(this)
		config.changeBlockIndex = this.changeBlockIndex

		if ($(`#js-s3d__${type}`).length > 0) {
			this.animateBlock('translate', 'down')
			this[type].update(config)
			if (idApart) {
				this[type].toSlideNum(idApart)
			}
			// this.activeSectionList.push(config.idCopmlex);
		} else {
			if (type === 'courtyard' || type === 'complex') {
				this.filter.hidden()
				this.loader.show()
			} else {
				this.animateBlock('translate', 'down')
			}
			this.createWrap(config, type !== 'courtyard' ? 'div' : 'canvas')
			this[type] = new Fn(config)
			this[type].init(config)
			this.activeSectionList.push(config.idCopmlex)
			// делает кнопку переключателя неактивной
			// $(`.js-s3d-select__${config.type}`).prop('disabled', false)
		}
	}

	showSvgIn3D(id, type) {
		if (type !== this.activeSection) {
			this.history.update(type)
			this.scrollBlock(type)
		}
		this[type].toSlideNum(id)
	}

	scrollToBlock(time = 600) {
		return block => {
			setTimeout(() => {
				if (this.filter) {
					this.filter.hidden()
				}
				this.complex.hiddenInfo()
				this.complex.hiddenInfoFloor()
				this.compass.save(this.compass.current)
				switch (block) {
				case 'apart':
					this.compass.setApart()
					break
				case 'floor':
					this.compass.setFloor()
					break
				case 'plannings':
					if (document.documentElement.clientWidth > 767) {
						this.filter.show()
					}
					$('.js-s3d-filter').removeClass('active-filter')
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
		$('.js-s3d-select.active').removeClass('active')
		this.sectionName.forEach(name => {
			if (name === block) {
				this.activeSection = name
				$(`.js-s3d__wrapper__${name}`).css('z-index', '100')
				$(`.js-s3d-select[data-type = ${name}]`).addClass('active')
				$('.js-s3d-controller')[0].dataset.type = name
			} else {
				$(`.js-s3d__wrapper__${name}`).css('z-index', '')
			}
		})
	}

	changeCurrentFloor(floor) {
		this.complex.updateActiveFloor(floor)
	}

	changeCurrentFlat(flat) {
		this.complex.updateActiveFlat(flat)
	}

	animateBlock(id, clas) {
		const layers = document.querySelectorAll(`.${id}-layer`)
		layers[0].classList.remove('translate-layer__down', 'translate-layer__up', 'active')
		layers[0].classList.add(`translate-layer__${clas}`)
		setTimeout(() => layers[0].classList.add('active'), 100)
		setTimeout(() => this.animateFlag = true, 1000)
	}

	unActive() {
		$('.js-s3d__slideModule').removeClass('s3d-unActive')
	}

	addBlur(wrap, time) {
		$(wrap).addClass('s3d-blur')
		setTimeout(() => {
			$(wrap).removeClass('s3d-blur')
		}, time || 700)
	}

	resize() {
		console.log('resize', this)
		const type = $('.js-s3d-controller')[0].dataset.type || ''
		console.log('resize type', type)
		if (document.documentElement.offsetWidth < 768) {
			if (type === 'plannings') {
				this.filter.hidden()
				$('.js-s3d-filter').removeClass('plannings-filter')
			} else {
				this.filter.hidden()
				$('.js-s3d-filter').addClass('plannings-filter')
			}
		} else {
			if (type === 'plannings') {
				this.filter.show()
				$('.js-s3d-filter').removeClass('plannings-filter')
			} else {
				this.filter.hidden()
				$('.js-s3d-filter').addClass('plannings-filter')
			}
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
