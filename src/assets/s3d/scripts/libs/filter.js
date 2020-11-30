class Filter {
	constructor(config, data, dataObj, selectFlat) {
		this.wrapper = config.wrap || ''
		this.filterName = { range: ['area', 'floor'], checkbox: ['rooms'] }
		this.filter = {}
		this.nameFilterFlat = {
			area: 'all_room',
			// living: 'life_room',
			// house: 'build_name',
			floor: 'floor',
			rooms: 'rooms',
			// price: 'price',
			// priceM2: 'price_m2',
		}
		// name key js and name key in flat
		// this.filterSelect = {}
		this.flatList = data
		this.flatListObj = dataObj
		this.currentAmountFlat = data.length
		this.selectFlat = selectFlat
		this.addBlur = config.addBlur
		// this.unActive = config.unActive
		this.hidden = this.hidden.bind(this)
		this.show = this.show.bind(this)
	}

	init(config) {
		// this.filterHtml = createFilter('.js-s3d__slideModule')

		// $(this.filterHtml.reset).on('click', () => this.resetFilter())
		// $(this.filterHtml.house).on('click', 'input', () => this.showSvgSelect())
		// $(this.filterHtml.room).on('click', 'input', () => this.showSvgSelect())
		// $(this.filterHtml.close).on('click', () => this.hidden())
		//

		this.createListFlat(this.flatList, '.js-s3d-filter__table tbody')
		$('.js-s3d-filter__button--reset').on('click', () => this.resetFilter())
		$('.js-s3d-filter__close').on('click', () => this.hidden())
		// $('.js-s3d-filter__button--apply').on('click', () => this.showSvgSelect());
		$('.js-s3d-filter__select').on('click', 'input', () => this.showSvgSelect(this.applyFilter(this.flatList)))
		// $('.js-s3d-filter__button--apply').on('click', () => $('.js-s3d-filter').removeClass('active'))
		// $('.js-s3d-filter__close').on('click', () => {
		// 	$('.js-s3d-filter').removeClass('active')
		// })

		$('.js-s3d-controller__showFilter').on('click', () => this.showAvailableFlat())

		$('.js-s3d-controller__openFilter').on('click', () => {
			$('.js-s3d-filter').addClass('active')
			if (!$('.js-s3d-controller__showFilter--input').prop('checked')) {
				$('.js-s3d-controller__showFilter--input').click()
			}
		})

		$('.js-s3d-filter__table').on('click', 'tr', event => {
			if ($(event.originalEvent.target).hasClass('js-s3d-add__favourites') || event.originalEvent.target.nodeName === 'INPUT') return
			this.selectFlat(event.currentTarget.dataset.id, 'complex')
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
				this.createRange(classes)
			}
		})

		$('.js-s3d__amount-flat__num-all').html(this.flatList.length)
		this.setAmountSelectFlat(this.flatList.length)
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
		$('.js-s3d__wrapper__complex polygon').css({ opacity: 0 })
		data.forEach(flat => $(`.js-s3d__wrapper__complex polygon[data-id=${flat.id}]`).css({ opacity: 0.5 }))
		// фильтр svg , ищет по дата атрибуту, нужно подстраивать атрибут и класс обертки
		// for (const key in data) {
		// 	// if ($('.js-s3d__svg-container__complex').length > 0) {
		// 	// 	console.log('showSvgSelect', data, this.flatListObj[key])
		// 	// 	console.log('showSvgSelect', key, this.flatListObj)
		// 	// 	$(`.js-s3d__wrapper__complex polygon[data-id=${this.flatListObj[key].id}]`).css({ opacity: 0.5 })
		// 	// }
		// 	if (+data[key].length > 0) {
		// 		// $('#js-s3d__wrapper__complex polygon[data-build="'+key+'"]').css({'opacity':0.5});
		// 		console.log('showSvgSelect(data) data[key]', data[key])
		// 		data[key].forEach(
		// 			flat => {
		// 				if ($('.js-s3d__svg-container__complex').length > 0) { $(`.js-s3d__wrapper__complex polygon[data-id="${flat}"]`).css({ opacity: 0.5 }) }
		// 			},
		// 		)
		// 	}
		// }
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

		for (const key in this.filter) {
			if (this.filter[key].type === 'range') {
				// this.filter[key].elem.reset();
				this.filter[key].elem.update({ from: this.filter[key].elem.result.min, to: this.filter[key].elem.result.max })
			} else {
				// this.filter[key].elem.each((i, el) => { el.checked ? el.checked = false : '' })
			}
		}
		// this.filterFlatStart()
	}

	// запустить фильтрацию
	applyFilter(data) {
		this.clearFilterParam()
		this.checkFilter()
		this.getFilterParam()
		console.log('applyFilter')
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
		// if (filter.house.value.length === 0 || filter.rooms.value.length === 0) {
		// 	return {}
		// }
		console.log(data)
		this.currentAmountFlat = 0
		const select = data.filter(flat => {
			flat.listHtmlLink.style.display = 'none'
			flat.cardHtmlLink.style.display = 'none'
			for (const param in filter) {
				if (+flat.sale !== 1) return true
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
			if (flat[nameFilterFlat.house] !== undefined
				&& !flat[nameFilterFlat.house]
			) {
				// eslint-disable-next-line no-param-reassign
				flat[nameFilterFlat.house].match(/^(\d+)/)[1] = []
			}

			if (flat[nameFilterFlat.floor] !== undefined
				&& flat[nameFilterFlat.house]
				&& !flat[nameFilterFlat.house].includes(flat[nameFilterFlat.floor])
				&& flat[nameFilterFlat.floor] > 0
			) {
				flat[nameFilterFlat.house].push(flat[nameFilterFlat.floor])
			}
			this.currentAmountFlat += 1
			flat.listHtmlLink.style.display = ''
			flat.cardHtmlLink.style.display = ''
			return flat
		})
		this.setAmountSelectFlat(this.currentAmountFlat)
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
		// this.filterSelect = {}
		this.filter = {}
		$('#js-s3d__wrapper polygon').css({ opacity: '' })
		this.setAmountSelectFlat(this.flatList.length)
	}

	// создаёт html список квартир
	createListFlat(list, wrap) {
		const result = []
		list.forEach(el => {
			const tr = document.createElement('tr')
			tr.dataset.id = el.id
			tr.innerHTML = `
					<td>${el.type}</td>
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
			// $(wrap).append(tr)
			result.push(tr)
		})
		$(wrap).append(...result)
		// return result
	}
}
