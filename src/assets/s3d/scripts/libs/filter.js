class Filter {
	constructor(filterConfig) {
		// this.wrapper = config.wrap || ''
		this.filterName = { range: ['area', 'floor'], checkbox: ['rooms', 'build'] }
		this.filter = {}
		this.nameFilterFlat = {
			area: 'all_room',
			// living: 'life_room',
			// house: 'build_name',
			floor: 'floor',
			rooms: 'rooms',
			build: 'build',
			// price: 'price',
			// priceM2: 'price_m2',
		}
		// name key js and name key in flat
		this.flatList = filterConfig.flatList
		this.flatListObj = filterConfig.flatListObj
		this.currentAmountFlat = filterConfig.flatList.length
		// this.selectFlat = filterConfig.showSvgIn3D
		this.getCurrentShowFlats = filterConfig.getCurrentShowFlats
		this.setCurrentShowFlats = filterConfig.setCurrentShowFlats
		this.addBlur = filterConfig.addBlur
		this.initChangeFlybyHandler = filterConfig.initChangeFlybyHandler
		// this.unActive = config.unActive
		this.hidden = this.hidden.bind(this)
		this.show = this.show.bind(this)
		this.showSvgSelect = this.showSvgSelect.bind(this)
	}

	init(config) {
		this.createListFlat(this.flatList, '.js-s3d-filter__table tbody')
		$('.js-s3d-filter__button--reset').on('click', () => this.resetFilter())
		$('.js-s3d-filter__close').on('click', () => this.hidden())
		$('.js-s3d-filter__select').on('click', 'input', () => this.showSvgSelect(this.applyFilter(this.flatList)))

		$('.js-s3d-controller__showFilter').on('click', () => this.showAvailableFlat())

		$('.js-s3d-controller__openFilter').on('click', () => {
			$('.js-s3d-filter').addClass('active')
			if (!$('.js-s3d-controller__showFilter--input').prop('checked')) {
				$('.js-s3d-controller__showFilter--input').click()
			}
		})

		// $('.js-s3d-filter__table').on('click', 'tr', event => {
		// 	if ($(event.target).hasClass('js-s3d-add__favourites') || event.target.nodeName === 'INPUT' || event.currentTarget.dataset.id === undefined) return
		// 	this.selectFlat(event.currentTarget.dataset.id, 'complex1')
		// })
		$('.js-s3d-filter__table').on('click', 'tr', event => {
			if ($(event.target).hasClass('js-s3d-add__favourites') || event.target.nodeName === 'INPUT' || event.currentTarget.dataset.id === undefined) return
			const id = +event.currentTarget.dataset.id
			if (
				$(event.originalEvent.target).hasClass('js-s3d-add__favourites')
				|| event.originalEvent.target.nodeName === 'INPUT') {
				return
			}
			// const conf = this.checkFlatInSVG(id)
			this.initChangeFlybyHandler(id, event.currentTarget)
		})

		this.filterName.checkbox.forEach(name => {
			$('.js-s3d-filter [data-type=name]').each((i, el) => el.data(name, i + 1))
		})

		this.filterName.range.forEach(name => {
			const classes = this.getAttrInput(name)
			if (classes) {
				for (const key in config[this.nameFilterFlat[name]]) {
					classes[key] = (key === 'min') ? Math.floor(+config[this.nameFilterFlat[name]][key]) : Math.ceil(+config[this.nameFilterFlat[name]][key])
				}
				console.log(classes, config)
				this.createRange(classes)
			}
		})

		$('.js-s3d__amount-flat__num-all').html(this.flatList.length)
		this.setAmountSelectFlat(this.flatList.length)

		$('.js-s3d-filter__table thead').on('click', '.s3d-filter__th', e => {
			const nameSort = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.sort) ? e.currentTarget.dataset.sort : undefined
			if (!nameSort || (nameSort && nameSort === 'none')) {
				return
			}

			if (this.nameSort === nameSort) {
				this.directionSortUp = !this.directionSortUp
			} else {
				this.directionSortUp = true
			}
			$('.s3d-sort-active').removeClass('s3d-sort-active')
			if (this.directionSortUp) {
				$(e.currentTarget).addClass('s3d-sort-active')
			}
			this.nameSort = nameSort
			const result = sortArray([...$('.js-s3d-filter__table tbody tr')], this.nameFilterFlat[nameSort], this.flatListObj, this.directionSortUp)
			$('.js-s3d-filter__table tbody').append(result)
		})

		this.deb = this.debounce(this.resize.bind(this), 300)
		$(window).resize(() => {
			this.deb(this)
		})
	}

	getNameFilterFlat() { return this.nameFilterFlat }

	// запускает фильтр квартир
	filterFlatStart() {
		this.addBlur('.js-s3d-filter__table')
		this.addBlur('.s3d-pl__right')
		this.showSvgSelect(this.applyFilter(this.flatList))
	}

	// подсвечивает квартиры на svg облёта
	showSvgSelect(data) {
		// $('.js-s3d__wrapper__complex polygon').css({ opacity: 0 })
		// data.forEach(flat => $(`.js-s3d__wrapper__complex polygon[data-id=${flat.id}]`).css({ opacity: 0.5 }))
		$('.s3d__svg-container polygon').removeClass('active-selected')
		data.forEach(flat => $(`.s3d__svg-container polygon[data-id=${flat.id}]`).addClass('active-selected'))
		// фильтр svg , ищет по дата атрибуту, нужно подстраивать атрибут и класс обертки
	}

	// скрывает - показывает квартиры на svg облёта
	showAvailableFlat() {
		$('.js-s3d-controller__showFilter--input').click()
		if ($('.js-s3d-controller__showFilter--input').prop('checked')) {
			this.showSvgSelect(this.flatList)
			$('.floor-info-helper').css('opacity', '1')
		} else {
			$('.s3d__svg-container polygon').css({ opacity: '' })
			$('.floor-info-helper').css('opacity', '0')
		}
	}

	// возвращает data-attribute input-а
	getAttrInput(name) {
		return $(`.js-s3d-filter__${name}--input`).length > 0 ? $(`.js-s3d-filter__${name}--input`).data() : false
	}

	getAttrSelect(name) {
		const input = $(`.js-s3d-filter__${name}--input:checked`).length ? $(`.js-s3d-filter__${name}--input:checked`) : $(`.js-s3d-filter__${name}--input`)

		const arr = { type: input.data('type'), value: [] }
		input.each((i, el) => arr.value.push($(el).data(name)))
		return arr
	}

	// создает range slider (ползунки), подписывает на события
	createRange(config) {
		if (config.type !== undefined) {
			const self = this
			const { min } = config
			const { max } = config
			const $min = $(`.js-s3d-filter__${config.type}__min--input`)
			const $max = $(`.js-s3d-filter__${config.type}__max--input`)

			$(`.js-s3d-filter__${config.type}--input`).ionRangeSlider({
				type: 'double',
				grid: false,
				min: config.min || 0,
				max: config.max || 0,
				from: config.min || 0,
				to: config.max || 0,
				step: config.step || 1,
				onStart: updateInputs,
				onChange: updateInputs,
				onFinish(e) {
					updateInputs(e)
					self.filterFlatStart()
				},
				onUpdate: updateInputs,
			})

			const instance = $(`.js-s3d-filter__${config.type}--input`).data('ionRangeSlider')
			function updateInputs(data) {
				$min.prop('value', data.from)
				$max.prop('value', data.to)
			}

			$min.on('change', function () { changeInput.call(this, 'from') })
			$max.on('change', function () { changeInput.call(this, 'to') })

			function changeInput(key) {
				let val = $(this).prop('value')
				if (key === 'from') {
					if (val < min) val = min
					else if (val > instance.result.to) val = instance.result.to
				} else if (key === 'to') {
					if (val < instance.result.from) val = instance.result.from
					else if (val > max) val = max
				}

				instance.update(key === 'from' ? { from: val } : { to: val })
				$(this).prop('value', val)
				self.filterFlatStart()
			}
		}
	}

	// показать фильтр
	show() {
		$('.js-s3d-filter').addClass('active')
	}

	// спрятать фильтр
	hidden() {
		$('.js-s3d-filter').removeClass('active')
	}

	// добавить range в список созданых фильтров
	setRange(config) {
		if (config.type !== undefined) {
			this.filter[config.type] = {}
			this.filter[config.type].type = 'range'
			this.filter[config.type].elem = $(`.js-s3d-filter__${config.type}--input`).data('ionRangeSlider')
		}
	}

	// добавить checkbox в список созданых фильтров
	setCheckbox(config) {
		console.log(config)
		if (config.type !== undefined) {
			if (!this.filter[config.type] || !this.filter[config.type].elem) {
				this.filter[config.type] = {}
				this.filter[config.type].elem = []
				this.filter[config.type].value = []
				this.filter[config.type].type = 'select'
			}
			this.filter[config.type].elem = $(`.js-s3d-filter__${config.type} [data-type = ${config.type}]`)
		}
	}

	// сбросить значения фильтра
	resetFilter() {
		$('.js-s3d__svgWrap polygon').css({ opacity: '' })
		$('.js-s3d__svgWrap .active-selected').removeClass('active-selected')
		for (const key in this.filter) {
			if (this.filter[key].type === 'range') {
				this.filter[key].elem.update({ from: this.filter[key].elem.result.min, to: this.filter[key].elem.result.max })
			} else {
				this.filter[key].elem.each((i, el) => { el.checked ? el.checked = false : '' })
			}
		}
		this.flatList.forEach(flat => {
			flat.listHtmlLink.style.display = ''
			flat.cardHtmlLink.style.display = ''
		})
	}

	// запустить фильтрацию
	applyFilter(data) {
		this.clearFilterParam()
		this.checkFilter()
		this.getFilterParam()
		return this.filterFlat(data, this.filter, this.filterName, this.nameFilterFlat)
	}

	// обновить выбраные данные фильтра
	checkFilter() {
		this.filterName.range.forEach(name => {
			const classes = this.getAttrInput(name)
			if (classes) this.setRange(classes)
		})
		this.filterName.checkbox.forEach(name => this.setCheckbox(this.getAttrSelect(name)))
	}

	// установить кол-во наденных квартир
	setAmountSelectFlat(amount) {
		// $('.js-s3d-controller__openFilter-num').html(amount)
		$('.js-s3d__amount-flat__num').html(amount)
	}

	// поиск квартир по параметрам фильтра
	filterFlat(data, filter, filterName, nameFilterFlat) {
		// прерывает фильт если не выбран дом или комнаты
		this.currentAmountFlat = 0
		const select = data.filter(flat => {
			if (flat.listHtmlLink) {
				flat.listHtmlLink.dataset.style = 'none'
			}
			if (flat.cardHtmlLink) {
				flat.cardHtmlLink.style.display = 'none'
			}
			for (const param in filter) {
				if (+flat.sale !== 1) return false
				if (
					filterName.checkbox.includes(param)
					&& filter[param].value.length > 0
					&& !filter[param].value.some(key => +flat[nameFilterFlat[param]] === +key)
				) {
					return false
				} else if (filterName.range.includes(param)) {
					if (+flat[nameFilterFlat[param]] < +filter[param].min
						|| +flat[nameFilterFlat[param]] > +filter[param].max) {
						return false
					}
				}
			}

			if (!flat[nameFilterFlat.build]
			) {
				// eslint-disable-next-line no-param-reassign
				flat[nameFilterFlat.build].match(/^(\d+)/)[1] = []
			}

			// if (flat[nameFilterFlat.floor] !== undefined
			// 	&& flat[nameFilterFlat.build]
			// 	&& !flat[nameFilterFlat.build].includes(flat[nameFilterFlat.floor])
			// 	&& flat[nameFilterFlat.floor] > 0
			// ) {
			// 	console.log('nameFilterFlat.build', nameFilterFlat.build)
			// 	console.log('flat[nameFilterFlat.build]', flat[nameFilterFlat.build])
			// 	flat[nameFilterFlat.build].push(flat[nameFilterFlat.floor])
			// }
			this.currentAmountFlat += 1
			if (flat.listHtmlLink) {
				// flat.listHtmlLink.style.display = ''
				// eslint-disable-next-line no-param-reassign
				flat.listHtmlLink.dataset.style = 'visible'
			}
			if (flat.cardHtmlLink) {
				// eslint-disable-next-line no-param-reassign
				flat.cardHtmlLink.style.display = ''
			}
			return flat
		})
		this.setAmountSelectFlat(this.currentAmountFlat)
		this.setCurrentShowFlats(select)
		return select
	}

	// добавить возможные варианты и/или границы (min, max) в список созданых фильтров
	getFilterParam() {
		for (const key in this.filter) {
			switch (this.filter[key].type) {
			case 'select':
				$(`.js-s3d-filter__${key}--input:checked`).each((i, el) => this.filter[key].value.push($(el).data(key)))
				break
			case 'range':
				this.filter[key].min = this.filter[key].elem.result.from
				this.filter[key].max = this.filter[key].elem.result.to
				break
			default:
				break
			}
		}
	}

	// сбросить данные о фильтрах и выбранные квартиры
	clearFilterParam() {
		this.filter = {}
		$('#js-s3d__wrapper polygon').css({ opacity: '' })
		this.setAmountSelectFlat(this.flatList.length)
	}

	// создаёт html список квартир
	createListFlat(list, wrap) {
		const result = []
		list.forEach(elem => {
			const el = elem
			if (+el['type_object'] === 1) {
				const tr = document.createElement('tr')
				tr.dataset.id = el.id
				tr.innerHTML = `
					<td>${el.type}</td>
					<td>${el.build}</td>
					<td>${el.rooms}</td>
					<td>${el.floor}</td>
					<td>${el.all_room} m<sub>2</sub></td>
					<td>
						<label data-id="${el.id}" class="s3d-filter__table__label js-s3d-add__favourites">
							<input type="checkbox">
							<svg role="presentation"><use xlink:href="#icon-favourites"></use></svg>
						</label>
					</td>
				`
				el['listHtmlLink'] = tr
				result.push(tr)
			}
		})
		$(wrap).html('')
		$(wrap).append(...result)
		// return result
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

	resize() {
		if (document.documentElement.offsetWidth < 568) {
			$('.js-s3d-filter').removeClass('active')
		}
	}
}
