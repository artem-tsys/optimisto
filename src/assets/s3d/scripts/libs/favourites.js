class Favourite {
	constructor(conf) {
		this.listObj = conf.data
		this.list = conf.list
		this.wrap = conf.wrap
		this.click = conf.click
		this.activeFlat = conf.activeFlat
		this.animationSpeed = 750

		$('.js-s3d__slideModule').on('click', '.js-s3d__favourites', () => {
			this.createMarkup()
			$('.js-s3d__fv').addClass('s3d__active')
		})

		$('.js-s3d__slideModule').on('change', '.js-s3d-add__favourites', event => {
			const id = +event.currentTarget.dataset.id
			// const id = $(event.currentTarget).data('id')
			if (checkValue(id)) return
			if (event.target.checked) {
				setTimeout(() => {
					this.addStorage(id)
				}, this.animationSpeed)
				if (event.target.closest('label') !== null) {
					this.moveToFavouriteEffectHandler(event.target.closest('label'));
				}
			} else {
				setTimeout(() => {
					this.removeElemStorage(id)
				}, this.animationSpeed)
				if (event.target.closest('label') !== null) {
					this.moveToFavouriteEffectHandler(event.target.closest('label'), true)
				}
			}
			// if (event.target.checked) {
			// 	this.addStorage(id)
			// } else {
			// 	this.removeElemStorage(id)
			// }
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
		this.addPulseCssEffect()
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
			favourites = [+id]
		} else {
			favourites.push(+id)
		}
		if (favourites.length > 0) {
			$('.js-s3d-favorite__wrap').removeClass('s3d-hidden')
		}
		// this.listObj[id]['favourite'] = true
		sessionStorage.setItem('favourites', JSON.stringify(favourites))
		this.updateAmount(favourites.length)
		this.checkedFlat(+id, true)
	}

	removeElemStorage(id) {
		const favourites = this.getFavourites()
		const index = favourites.indexOf(+id)
		if (index === -1 || !favourites) return
		favourites.splice(index, 1)
		// this.listObj[id]['favourite'] = false
		sessionStorage.setItem('favourites', JSON.stringify(favourites))
		this.updateAmount(favourites.length)
		this.checkedFlat(+id, false)
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
		return (storage || []).filter(el => (!checkValue(el))).map(el => +el)
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

	addPulseCssEffect() {
		this.animationPulseClass = 'pulse'
		document.body.insertAdjacentHTML('beforeend', `
		<style class="${this.animationPulseClass}">
			.${this.animationPulseClass} {
				border-radius: 50%;
				cursor: pointer;
				box-shadow: 0 0 0 rgba(255,255,255, 0.75);
				animation: pulse 0.5s 1 ease-out;
			}.${this.animationPulseClass}:hover {	animation: none;}@-webkit-keyframes ${this.animationPulseClass} {	0% {	  -webkit-box-shadow: 0 0 0 0 rgba(255,255,255, 0.4);	}	70% {		-webkit-box-shadow: 0 0 0 10px rgba(255,255,255, 0);	}	100% {		-webkit-box-shadow: 0 0 0 0 rgba(255,255,255, 0);	}}@keyframes pulse {	0% {	  -moz-box-shadow: 0 0 0 0 rgba(255,255,255, 0.4);	  box-shadow: 0 0 0 0 rgba(255,255,255, 0.4);	}	70% {		-moz-box-shadow: 0 0 0 10px rgba(255,255,255, 0);		box-shadow: 0 0 0 10px rgba(255,255,255, 0);	}	100% {		-moz-box-shadow: 0 0 0 0 rgba(255,255,255, 0);		box-shadow: 0 0 0 0 rgba(255,255,255, 0);	}}
		</style>
		`)
	}

	moveToFavouriteEffectHandler(target, reverse) {
		const currentScreen = document.querySelector('.js-s3d-controller').dataset.type
		const iconToAnimate = target.querySelector('svg')
		let distance
		if (document.documentElement.clientWidth < 576) {
			distance = this.getBetweenDistance(document.querySelector('.s3d-mobile-only[data-type="favourites"]'), iconToAnimate)
			this.animateFavouriteElement(document.querySelector('.s3d-mobile-only[data-type="favourites"]'), iconToAnimate, distance, reverse)
		} else {
			switch (currentScreen) {
				case 'complex1':
					distance = this.getBetweenDistance(document.querySelector('.s3d-filter-wrap .s3d__favourites'), iconToAnimate)
					this.animateFavouriteElement(document.querySelector('.s3d-filter-wrap .s3d__favourites'), iconToAnimate, distance, reverse)
					break;
				case 'plannings':
					distance = this.getBetweenDistance(document.querySelector('.s3d-pl__favourites-icon'), iconToAnimate)
					this.animateFavouriteElement(document.querySelector('.s3d-pl__favourites-icon'), iconToAnimate, distance, reverse)
					break
				case 'apart':
					distance = this.getBetweenDistance(document.querySelector('.s3d-pl__favourites-icon'), iconToAnimate)
					this.animateFavouriteElement(document.querySelector('.s3d-pl__favourites-icon'), iconToAnimate, distance, reverse)
					break
				default:
					break
			}
		}
	}

	getBetweenDistance(elem1, elem2) {
		// get the bounding rectangles
		const el1 = elem1.getBoundingClientRect()
		const el2 = elem2.getBoundingClientRect()
		// get div1's center point
		const div1x = el1.left + (el1.width / 2)
		const div1y = el1.top + (el1.height / 2)

		// get div2's center point
		const div2x = el2.left + (el2.width / 2)
		const div2y = el2.top + (el2.height / 2)

		// calculate the distance using the Pythagorean Theorem (a^2 + b^2 = c^2)
		const distanceSquared = Math.pow(div1x - div2x, 2) + Math.pow(div1y - div2y, 2)
		const distance = Math.sqrt(distanceSquared)

		return {
			x: div1x - div2x,
			y: div1y - div2y,
		}
	}

	animateFavouriteElement(destination, element, distance, reverse) {
		if (gsap === undefined) return
		const animatingElParams = element.getBoundingClientRect()
		element.style.cssText += `
			width:${animatingElParams.width}px;
			height:${animatingElParams.height}px;
			transform-origin:top left;`
		element.style.cssText += `
			fill: #85C441;
			position:relative;
			z-index:2000;
			stroke:none;
			position:fixed;
			left:${animatingElParams.left}px;
			top:${animatingElParams.top}px;`
		const speed = this.animationSpeed / 1000
		// element.classList.add(this.animationPulseClass)
		const tl = new TimelineMax({
			delay: 0,
			repeat: 0,
			paused: true,
			onComplete: () => {
				element.classList.remove(this.animationPulseClass)
				element.style.cssText = ''
			},
		})
		if (reverse === true) {
			tl.from(element, { y: distance.y, duration: speed, ease: Power1.easeIn })
			tl.from(element, { x: distance.x, duration: speed / 2.5, ease: Power1.easeIn }, `-=${speed / 2.5}`)
		} else {
			tl.set(element, { classList: `+=${this.animationPulseClass}` })
			tl.to(element, { y: distance.y, duration: speed, ease: Power1.easeIn })
			tl.to(element, { x: distance.x, duration: speed / 2.5, ease: Power1.easeIn }, `-=${speed / 2.5}`)
		}
		tl.set(element, { x: 0, y: 0 })
		// tl.set(element, {position:'',width:'',height:'',stroke:'', fill:'',top:'',left:'',x:'',y:''});
		tl.set(element, { clearProps: 'all' })
		tl.play()
		return distance
	}
}
