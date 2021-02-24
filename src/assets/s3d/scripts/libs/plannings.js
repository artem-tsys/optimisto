class Plannings {
	constructor(conf) {
		this.list = conf.list
		this.listObj = conf.data
		this.wrap = conf.wrap
		this.inApart = conf.click
		this.activeFlat = conf.activeFlat
		this.getCurrentShowFlats = conf.getCurrentShowFlats
		this.currentShow = 0
		// this.init()
		this.updateShowFlat = this.updateShowFlat.bind(this)
	}

	init() {
		$.ajax('/wp-admin/admin-ajax.php?action=cardPlannings').then(response => {
		// $.ajax('/wp-content/themes/optimisto/assets/s3d/template/cardPlannings.php').then(response => {
			this.templateCard = JSON.parse(response)

			this.createList(this.list, this.wrap)
			$('.js-s3d__pl__list').on('click', '.js-s3d-pl__link', event => {
				const id = $(event.currentTarget).closest('.s3d-pl__plane').data('id')
				this.activeFlat.value = id
				this.inApart(id, 'apart', id)
			})
			this.getCurrentShowFlats(this.list)
			$('.js-s3d__pl__list').on('scroll', event => {
				const amount = this.checkCountShowElemInPage(event.currentTarget)
				if (amount) {
					this.addCardInPage(amount)
				}
			})
		})
	}

	update() {
		console.log('plannings update')
	}

	updateShowFlat(list) {
		this.showFlatList = list
	}

	pagination() {
		if (this.showFlatList.length > 0) {
			this.showFlatList[0].cardHtmlLink.parentNode.scrollTop = 0
			this.showFlatList.forEach((el, i) => {
				el.cardHtmlLink.style.display = 'none'
				if (i < 15) {
					const img = el.cardHtmlLink.querySelectorAll('img')[0]
					el.cardHtmlLink.style.display = ''
					if (img.src === '' || img.src === undefined) {
						img.src = img.dataset.src
					}
				}
			})
			this.currentShow = 15
		}
	}

	checkCountShowElemInPage(wrap) {
		const elWidth = this.showFlatList[0].cardHtmlLink.offsetWidth
		const elHeight = this.showFlatList[0].cardHtmlLink.offsetHeight
		const wrapHeight = wrap.offsetHeight
		const wrapWidth = wrap.offsetWidth
		const amount = (Math.ceil(wrapWidth / elWidth) + Math.ceil(wrapHeight / elHeight)) * 2
		if ((wrap.scrollHeight - elHeight - wrap.offsetHeight) < wrap.scrollTop && amount < this.showFlatList.length) {
			if (this.currentShow + amount <= this.showFlatList.length) {
				return amount
			} else {
				return (this.showFlatList.length - this.currentShow)
			}
		}
		return false
	}

	addCardInPage(amount) {
		for (let i = this.currentShow; i < (this.currentShow + amount); i++) {
			const img = this.showFlatList[i].cardHtmlLink.querySelectorAll('img')[0]
			this.showFlatList[i].cardHtmlLink.style.display = ''
			if (img.src === '' || img.src === undefined) {
				img.src = img.dataset.src
			}
		}
		this.currentShow += amount
	}

	createList(data, wrap) {
		const result = []
		data.forEach((el, i) => {
			const nodeElem = this.createCard(el)
			if (i < 15) {
				nodeElem.querySelectorAll('img')[0].src = el['img_small']
			} else {
				nodeElem.style.display = 'none'
			}
			el['cardHtmlLink'] = nodeElem
			result.push(nodeElem)
		})
		$(wrap).append(...result)
	}

	createCard(el) {
		const checked = el.favourite ? 'checked' : ''
		const div = $.parseHTML(this.templateCard)[0]
		div.dataset.id = el.id
		div.querySelector('[data-key="type"]').innerHTML = el.type
		div.querySelector('[data-key="id"]').dataset.id = el.id
		div.querySelector('[data-key="number"]').innerHTML = el.number
		div.querySelector('[data-key="floor"]').innerHTML = el.floor
		div.querySelector('[data-key="rooms"]').innerHTML = el.rooms
		div.querySelector('[data-key="area"]').innerHTML = el['all_room']
		div.querySelector('[data-key="src"]').src = el['img_small']
		div.querySelector('[data-key="checked"]').checked = checked

		return div
	}

	// createCard(el) {
	// 	const div = document.createElement('div')
	// 	div.dataset.id = el.id
	// 	div.classList = 's3d-pl__plane'
	// 	div.innerHTML = `
  //       <div class="s3d-pl__type" data-key="type">тип ${el.type}</div>
  //       <img class="s3d-pl__image"  data-key="src" data-src=${el['img_small']}>
  //       <table class="s3d-pl__table">
  //         <tbody><tr class="s3d-pl__row">
  //           <td class="s3d-pl__value">${el.number}</td>
  //           <td class="s3d-pl__name" data-key="number">№ квартиры</td>
  //         </tr>
  //         <tr class="s3d-pl__row">
  //           <td class="s3d-pl__value">${el.floor}</td>
  //           <td class="s3d-pl__name" data-key="floor">Этаж</td>
  //         </tr>
  //         <tr class="s3d-pl__row">
  //           <td class="s3d-pl__value">${el.rooms}</td>
  //           <td class="s3d-pl__name" data-key="rooms">Комнаты</td>
  //         </tr>
  //         <tr class="s3d-pl__row">
  //           <td class="s3d-pl__value">${el['all_room']}</td>
  //           <td class="s3d-pl__name" data-key="area">Площадь м2</td>
  //         </tr>
  //       </tbody></table>
  //       <div class="s3d-pl__buttons"><button type="button" class="s3d-pl__link js-s3d-pl__link">Подробнее</button>
  //         <label data-key="id" class="s3d-pl__add-favourites js-s3d-add__favourites">
  //         	<input type="checkbox">
  //           <svg>
  //             <use xlink:href="#icon-favourites"></use>
  //           </svg>
  //         </label>
  //       </div>
	// 	`
	// 	return div
	// }
}
