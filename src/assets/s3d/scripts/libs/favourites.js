class Favourite {
	constructor(conf) {
		this.listObj = conf.data
		this.list = conf.list
		this.wrap = conf.wrap
		this.click = conf.click
		this.activeFlat = conf.activeFlat

		$('.js-s3d__slideModule').on('click', '.js-s3d__favourites', () => {
			this.createMarkup()
			$('.js-s3d__fv').addClass('s3d__active')
		})

		$('.js-s3d__slideModule').on('change', '.js-s3d-add__favourites', event => {
			const id = $(event.currentTarget).data('id')
			console.log('id', id)
			if (checkValue(id)) return
			if (event.target.checked) {
				this.addStorage(id)
			} else {
				this.removeElemStorage(id)
			}
		})

		$('.js-s3d__fv').on('click', '.js-s3d__fv__close', () => {
			$('.js-s3d__fv').removeClass('s3d__active')
		})

		$('.js-s3d__fv').on('click', '.js-s3d-fv__remove', e => {
			const id = $(e.target).closest('.js-s3d-fv__element').data('id')
			if (this.removeElemStorage(id)) {
				$(e.target).closest('.js-s3d-fv__element').remove()
			}
		})
		this.init()
	}

	init() {
		// sessionStorage.clear()
		this.createMarkup()
		this.showSelectFlats()
	}

	showSelectFlats() {
		const favourites = this.getFavourites()
		if (checkValue(favourites)) return
		favourites.forEach(id => {
			this.checkedFlat(id, true)
		})
	}

	checkedFlat(id, value) {
		let check = $(this.listObj[id].listHtmlLink).find('input').prop('checked')
		if (value !== 'undefined') { check = value }
		this.listObj[id].listHtmlLink.querySelector('input').checked = check
		this.listObj[id].cardHtmlLink.querySelector('input').checked = check
		this.listObj[id]['favourite'] = check
	}

	addStorage(id) {
		let favourites = this.getFavourites()
		if (checkValue(favourites)) {
			favourites = [id]
		} else {
			favourites.push(id)
		}
		if (favourites.length > 0) {
			$('.js-s3d-favorite__wrap').removeClass('s3d-hidden')
		}
		// this.listObj[id]['favourite'] = true
		sessionStorage.setItem('favourites', JSON.stringify(favourites))
		this.updateAmount(favourites.length)
		this.checkedFlat(id, true)
	}

	removeElemStorage(id) {
		const favourites = this.getFavourites()
		const index = favourites.indexOf(id)
		if (index === -1 || !favourites) return
		favourites.splice(index, 1)
		// this.listObj[id]['favourite'] = false
		sessionStorage.setItem('favourites', JSON.stringify(favourites))
		this.updateAmount(favourites.length)
		this.checkedFlat(id, false)
		if (favourites.length === 0) {
			$('.js-s3d-favorite__wrap').addClass('s3d-hidden')
			$('.js-s3d__fv').removeClass('s3d__active')
		}
		return true
	}

	clearStorage() {
		sessionStorage.removeItem('favourites')
		this.updateAmount(0)
		$('.js-s3d__pl__list input').prop('checked', false)
		$('.js-s3d-filter input').prop('checked', false)
		$('.js-s3d-favorite__wrap').addClass('s3d-hidden')
	}

	getFavourites() {
		const storage = JSON.parse(sessionStorage.getItem('favourites'))
		return storage ? storage : []
	}

	createMarkup() {
		$('.js-s3d-fv__element').remove()
		const favourites = this.getFavourites()
		this.updateAmount(favourites.length)
		if (favourites.length > 0) {
			$('.js-s3d-favorite__wrap').removeClass('s3d-hidden')
		}
		$(this.wrap).append(
			favourites.map(el => this.createElemHtml(this.listObj[el]))
		)

		$('.js-s3d__fv').on('click', '.js-s3d-fv__element', event => {
			if (event.target.classList.contains('js-s3d-fv__remove')) return
			this.activeFlat.value = +event.currentTarget.dataset.id
			this.click(+event.currentTarget.dataset.id, 'apart')
			setTimeout(() => {
				$('.js-s3d__fv').removeClass('s3d__active')
			}, 300)
		})
	}

	createElemHtml(el) {
		return `
			<tr class="s3d-fv__element js-s3d-fv__element" data-id=${el.id}>
        <td><img class="s3d-fv__image" src="${el['img_small']}"></td>
<!--        <td><img class="s3d-fv__image" src="wp-content/themes/optimisto/assets/s3d/images/KV.png"></td>-->
        <td>${el.number}</td>
        <td>${el.type}</td>
        <td>${el.rooms}</td>
        <td>${el.floor}</td>
        <td>${el['all_room']}</td>
        <td>
          <button class="s3d-fv__table__remove js-s3d-fv__remove" type="button">
            <svg class="s3d-fv__table__icon" role="presentation">
              <use xlink:href="#icon-reset"></use>
            </svg>
          </button>
        </td>
        <tr>
		`
	}

	updateAmount(value) {
		$('.js-s3d-favourites-amount').html(value)
		$('.js-s3d-favourites').attr('count', value)
	}
}
