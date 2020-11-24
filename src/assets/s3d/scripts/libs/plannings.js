class Plannings {
	constructor(conf) {
		this.list = conf.list
		this.listObj = conf.data
		this.wrap = conf.wrap
		this.inApart = conf.click
		this.activeFlat = conf.activeFlat
		this.init()
	}

	init() {
		this.createList(this.list, this.wrap)
		$('.js-s3d__pl__list').on('click', '.js-s3d-pl__link', event => {
			console.log(($(event.currentTarget).closest('.s3d-pl__plane').data('id')))
			console.log(this.inApart)
			const id = $(event.currentTarget).closest('.s3d-pl__plane').data('id')
			this.activeFlat.value = id
			this.inApart(id, 'apart', id)
		})
	}

	createList(data, wrap) {
		const result = []
		data.forEach(el => {
			const nodeElem = this.createCard(el)
			el['cardHtmlLink'] = nodeElem
			result.push(nodeElem)
		})
		$(wrap).append(result)
	}

	createCard(el) {
		const div = document.createElement('div')
		div.dataset.id = el.id
		div.classList = 's3d-pl__plane'
		div.innerHTML = `
        <div class="s3d-pl__type">тип ${el.type}</div><img class="s3d-pl__image" src=${el['img_small']}>
        <table class="s3d-pl__table">
          <tbody><tr class="s3d-pl__row">
            <td class="s3d-pl__value">${el.number}</td>
            <td class="s3d-pl__name">№ квартиры</td>
          </tr>
          <tr class="s3d-pl__row">
            <td class="s3d-pl__value">${el.floor}</td>
            <td class="s3d-pl__name">Этаж</td>
          </tr>
          <tr class="s3d-pl__row">
            <td class="s3d-pl__value">${el.rooms}</td>
            <td class="s3d-pl__name">Комнаты</td>
          </tr>
          <tr class="s3d-pl__row">
            <td class="s3d-pl__value">${el['all_room']}</td>
            <td class="s3d-pl__name">Площадь м2</td>
          </tr>
        </tbody></table>
        <div class="s3d-pl__buttons"><button type="button" class="s3d-pl__link js-s3d-pl__link">Подробнее</button>
          <label data-id="${el.id}" class="s3d-pl__add-favourites js-s3d-add__favourites">
          	<input type="checkbox">
            <svg>
              <use xlink:href="#icon-favourites"></use>
            </svg>
          </label>
        </div>
		`
		return div
	}
}
