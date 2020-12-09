class Apartments {
	constructor(data) {
		this.idCopmlex = data.idCopmlex
		this.type = data.type
		this.loader = data.loader
		this.wrapperId = data.idCopmlex
		this.imagesKeys = data.imagesKeys
		this.wrapper = $(`.js-s3d__wrapper__ ${this.wrapperId}`)
		this.click = data.click
		this.scrollBlock = data.scrollBlock
		this.activeFlat = data.activeFlat
		this.getFavourites = data.getFavourites
		this.getFlatObj = data.getFlatObj
		this.addBlur = data.addBlur
	}

	init(config) {
		// переключатель планировки обычная/3д
		// $('.s3d-filter__plan').removeClass('s3d-filter__plan-active')
		// получаем разметку квартиры с планом этажа
		this.getPlane(config)
		const self = this
		// $('.js-switch-btn').on('change', function () {
		// 	const has = $(this).is(':checked')
		// 	if (has && self.conf.plan3d) {
		// 		self.conf.$img.src = self.conf.plan3dSrc
		// 		self.conf.$mfpLink.href = self.conf.plan3dSrc
		// 	} else {
		// 		self.conf.$img.src = self.conf.planStandartSrc
		// 		self.conf.$mfpLink.href = self.conf.planStandartSrc
		// 	}
		// })

		$('#js-s3d__apart').on('click', '.js-s3d-flat__back', e => {
			// this.loader.show()
			this.click(+e.currentTarget.dataset.id, 'complex', this.activeFlat.value)
			// this.scrollBlock(e, 'complex', this.activeFlat.value)
		})
	}

	update(config) {
		// переключатель планировки обычная/3д
		// $('.s3d-filter__plan').removeClass('s3d-filter__plan-active')
		// this.updateFlat(flat)
		this.getPlane(config)
	}

	updateImage() {
		const type = $('.js-flat-plan-mfp').data('type')
		return {
			$img: document.querySelector('.flat-plan'),
			$mfpLink: document.querySelector('.js-flat-plan-mfp'),
			planStandartSrc: $('.js-flat-plan-mfp').attr('href'),
			planStandartName: type,
			plan3dSrc: `${window.location.origin}/wp-content/themes/boston/assets/img/projects/1/3d/ ${type.split('_')[0]}.jpg`,
			plan3d: false,
		}
	}

	checkImage() {
		const { conf } = this
		fetch(conf.plan3dSrc)
			.then(res => (res.ok ? res : Promise.reject(res)))
			.then(res => {
				$('.s3d-filter__plan').addClass('s3d-filter__plan-active')
				conf.plan3d = true
			}).catch(() => {
				$('.s3d-filter__plan').removeClass('s3d-filter__plan-active')
			})
	}

	/* Буква "Є" не воспринимается в адресной строке */
	changeYe() {
		$('.s3d-floor__helper-img img').src = $('.s3d-floor__helper-img img').src.replace(/%D0%84/, 'Ye')
		$('.s3d-floor__helper-img img').src = $('.s3d-floor__helper-img img').src.replace(/Є/, 'Ye')
		$('.flat-plan').src = $('.flat-plan').src.replace(/%D0%84/, 'Ye')
		$('.js-flat-plan-mfp').href = $('.js-flat-plan-mfp').href.replace(/Є/, 'Ye')
		$('.js-flat-plan-mfp').href = $('.js-flat-plan-mfp').href.replace(/%D0%84/, 'Ye')
	}

	// получаем разметку квартиры с планом этажа
	getPlane(config) {
		console.log('нужно раскоментировать')
		// this.setPlaneInPage(this.addHtmlAll(config))
		$.ajax({
			type: 'POST',
			// url: '/inc/functions.php',
			// url: './static/apPars.php',
			url: '/wp-admin/admin-ajax.php',
			data: `action=createFlat&id=${config.activeFlat.value}`,
			success: response => (this.setPlaneInPage(response)),
		})
	}

	// вставляем разметку в DOM вешаем эвенты
	setPlaneInPage(response) {
		$(`#js-s3d__${this.idCopmlex}`).html(JSON.parse(response))
		console.log(this.getFlatObj(this.activeFlat.value).images)
		this.checkPlaning()
		this.loader.hide(this.type)
		// $('.flat-group2 ').on('click', 'polygon', this.openPopup)
		// $('.js-s3d__wrapper__apart .form-js').on('click', () => $('.common-form-popup-js').addClass('active'))
		$('.js-flat-button-return').on('click', e => {
			e.preventDefault()
			this.click(e.currentTarget.dataset.id, 'complex', this.activeFlat.value)
			// $('.js-s3d-select__floor').click()
		})

		$('.s3d-flat__floor').on('click', 'a', event => {
			event.preventDefault()
			this.addBlur('.s3d-flat__floor')
			this.getNewFlat(event.currentTarget.dataset.id)
		})
		const favourite = this.getFavourites()
		if (favourite.includes(+this.activeFlat.value)) {
			$('.s3d-flat__favourites').removeClass('s3d-hidden')
			$('.js-s3d-favourites-amount').html(favourite.length)
			$('.s3d-flat__like input').prop('checked', true)
		}
		// $('.js-s3d-popup__mini-plan svg').on('click', 'polygon', e => {
		// 	this.activeSvg = $(e.target).closest('svg')
		// 	$(this.activeSvg).css({ fill: '' })
		// 	$('.s3d-floor__helper').css({ opacity: 0, top: '-10000px' })
		// 	this.click(e, 'floor')
		// 	// $('.js-s3d-popup__mini-plan').removeClass('active')
		// })

		$('.js-s3d__show-3d').on('click', event => {
			this.click(event.currentTarget.dataset.id, 'complex', this.activeFlat.value)
		})

		$('.js-s3d-flat').on('change', '.js-s3d__radio-type', el => {
			const image = this.getFlatObj(this.activeFlat.value).images
			this.showHideRadioView(image[el.currentTarget.dataset.type])
			this.setNewImage(image)
		})

		$('.js-s3d-flat').on('change', '.js-s3d__radio-view', el => {
			this.setNewImage(this.getFlatObj(this.activeFlat.value).images)
		})

		$('.js-s3d-flat__image').magnificPopup({
			type: 'image',
			showCloseBtn: true,
		})
		// меняет непонятные символы в ссылке
		// this.conf = this.updateImage()
		// проверяет есть ли эта планировка в 3d формате
		// this.checkImage()
	}

	openPopup() {
		$('.js-s3d-popup__mini-plan').addClass('active')
		$('.js-s3d-popup__mini-plan__close').on('click', () => $('.js-s3d-popup__mini-plan').removeClass('active'))
	}

	getNewFlat(id) {
		$.ajax({
			type: 'POST',
			url: '/wp-admin/admin-ajax.php',
			data: `action=halfOfFlat&id=${id}`,
		}).then(response => {
			this.activeFlat.value = id
			this.updateFlat(JSON.parse(response), id)
		})
	}

	updateFlat(flat, id) {
		const wrap = $('.js-s3d__wrapper__apart')
		wrap.find('.js-s3d-flat__image').attr('src', flat.img)
		wrap.find('.js-s3d-flat__image')[0].dataset.mfpSrc = flat.img
		wrap.find('.js-s3d-flat__table').html(flat['left_block'])
		wrap.find('.js-s3d__create-pdf').attr('href', flat.pdf)
		$('polygon.u-svg-plan--active').removeClass('u-svg-plan--active')
		wrap.find(`.s3d-flat__floor [data-id=${id}]`).addClass('u-svg-plan--active')
		this.checkPlaning()
	}

	addHtmlAll(elem) {
		return JSON.stringify(`
			<div class="s3d-flat js-s3d-flat">
			<div class="s3d-flat__back-wrap js-s3d-flat__back">
			 <button class="s3d-flat__back" type="button">
           <svg viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path fill-rule="evenodd" clip-rule="evenodd" d="M9 12L-1.21594e-06 6L9 0L9 5.09367L9 6.90633L9 12Z" fill="white"></path>
           </svg>
       </button>
       <div class="s3d-flat__back-text">НАЗАД</div>
       </div>
         <div class="s3d-flat__table">
            <div class="s3d-flat__mini-info">
              <div class="s3d-mini-info">
                <div class="s3d-mini-info__title">номер</div>
                <div class="s3d-mini-info__amount">54</div>
              </div>
              <div class="s3d-mini-info">
                <div class="s3d-mini-info__title">Этаж</div>
                <div class="s3d-mini-info__amount">6</div>
              </div>
              <div class="s3d-mini-info">
                <div class="s3d-mini-info__title">комнат</div>
                <div class="s3d-mini-info__amount">1</div>
              </div>
              <div class="s3d-mini-info">
                <div class="s3d-mini-info__title">метраж м2</div>
                <div class="s3d-mini-info__amount">24</div>
              </div>
            </div>
         		<div class="s3d-flat__table__title">Квартира 2А</div>
              <ul class="s3d-flat__list">
                <li class="s3d-flat__el">
                  <div class="s3d-flat__el__name">Спальня:</div>
                  <div class="s3d-flat__el__value">12 м<sub>2</sub></div>
                </li>
                <li class="s3d-flat__el">
                  <div class="s3d-flat__el__name">Спальня:</div>
                  <div class="s3d-flat__el__value">12 м<sub>2</sub></div>
                </li>
                <li class="s3d-flat__el">
                  <div class="s3d-flat__el__name">Спальня:</div>
                  <div class="s3d-flat__el__value">12 м<sub>2</sub></div>
                </li>
                <li class="s3d-flat__el">
                  <div class="s3d-flat__el__name">Спальня:</div>
                  <div class="s3d-flat__el__value">12 м<sub>2</sub></div>
                    </li>
                  </ul>
                </div>
                <a class="s3d-flat__tell s3d-tell s3d-genplan" type="tel">
                  <div class="s3d-tell__text">(067) 747-0151</div>
                  <div class="s3d-tell__icon-wrap">
                    <div class="s3d-tell__icon">
                      <svg role="presentation">
                        <use xlink:href="#icon-tell"></use>
                      </svg>
                    </div>
                  </div>
                  </a>
              	<img class="s3d-flat__image js-s3d-flat__image" src="assets/s3d/images/KV.png" data-mfp-src="assets/s3d/images/KV.png">
                <div class="s3d-flat__favourites js-s3d-favorite__wrap s3d-hidden js-s3d__favourites">Избранное
                  <div class="s3d-flat__favourites-icon js-s3d__favourites">
                    <svg>
                      <use xlink:href="#icon-favourites"></use>
                    </svg><span class="s3d-flat__favourites-amount js-s3d-favourites-amount">0</span>
                  </div>
                </div>
                <div class="s3d-flat__floor">
                <svg viewBox="0 0 2767 2378" width="165mm" height="155mm">
                <image xlink:href="https://comfortlife.devbase.pro/img/projects/8/1/Іdealіst-P6-1604317030-6000x85-.jpg" x="0" y="0" height="100%" width="100%"></image>
                  <a xlink:href="/flat/?flat=34" class="appart__hover" data-section="1" data-tot_square="69.76" data-liv_square="0" data-rooms="2" data-number="2А" data-id="34">
                                     <polygon class=" u-svg-plan--active" points="998,1062,1002,2160,242,2054,132,1998,82,1902,78,654,82,546,128,460,216,430,528,386,538,1096,534,1072" data-id="34" data-section="1" data-tot_square="69.76" data-liv_square="0" data-rooms="2" data-number="2А">
                                     </polygon> 
                                </a>
                     <a xlink:href="/flat/?flat=35" class="appart__hover" data-section="1" data-tot_square="38.18" data-liv_square="0" data-rooms="1" data-number="1А" data-id="35">
                        <polygon class="" points="530,386,1388,238,1384,1100,534,1100" data-id="35" data-section="1" data-tot_square="38.18" data-liv_square="0" data-rooms="1" data-number="1А">
                        </polygon> 
                   </a>
                     <a xlink:href="/flat/?flat=36" class="appart__hover" data-section="1" data-tot_square="46.01" data-liv_square="0" data-rooms="1" data-number="1Б" data-id="36">
                        <polygon class="" points="1386,236,2242,92,2230,1096,1388,1100" data-id="36" data-section="1" data-tot_square="46.01" data-liv_square="0" data-rooms="1" data-number="1Б">
                        </polygon> 
                   </a>
                     <a xlink:href="/flat/?flat=37" class="appart__hover" data-section="1" data-tot_square="88.06" data-liv_square="0" data-rooms="2" data-number="2Б" data-id="37">
                        <polygon class="" points="2246,90,2526,48,2632,82,2692,168,2686,2158,2640,2274,2518,2320,2252,2288,1794,2230,1800,1100,2228,1100" data-id="37" data-section="1" data-tot_square="88.06" data-liv_square="0" data-rooms="2" data-number="2Б">
                        </polygon> 
                   </a>
                                
               
            </svg>
                </div>
                <div class="s3d-flat__links">
                	<a href="#" class="js-s3d__create-pdf">
                	<svg width="25" height="11" viewBox="0 0 25 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.74865 10.0062V6.40824C2.1755 6.45092 2.74693 6.45093 3.04297 6.45093C5.41818 6.45093 6.68499 4.91356 6.68499 3.21925C6.68499 1.58276 5.76246 0.0165141 2.82959 0.0165141C2.13424 0.0165141 0.550774 0.0454244 0 0.0454244V10.0089H1.74865V10.0062ZM3.00171 1.65095C4.19275 1.65095 4.83986 2.16315 4.83986 3.20273C4.83986 4.31254 4.02751 4.81099 2.98792 4.81099C2.57395 4.80894 2.16031 4.78597 1.74865 4.74216V1.68121C2.21681 1.66537 2.6437 1.65095 3.00171 1.65095ZM8.70904 10.0062H8.90872C9.8175 10.0062 10.926 10.0351 11.5249 10.0351C15.3253 10.0351 17.2323 7.7287 17.2323 4.92457C17.2323 2.29119 15.6281 0 11.6419 0C10.9121 0 9.49391 0.042693 8.89494 0.042693H8.70904V10.0062ZM11.6144 1.63645C13.9896 1.63645 15.3872 2.91769 15.3872 4.92457C15.3872 7.03128 13.9896 8.39792 11.5869 8.39792C11.339 8.39792 10.9466 8.39791 10.4578 8.36968V1.67915C10.8571 1.65092 11.2014 1.63645 11.6144 1.63645ZM19.2564 10.0062H21.0051V6.13283H24.5232V4.49567H21.0051V1.67709H24.95V0.040592H19.2564V10.0041V10.0062Z"/></svg>
                	скачать буклет</a>
                	<button type="button" class="js-s3d__show-3d"><svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M17.6986 7.10868L16.1778 5.81272V1.51594C16.1771 1.38478 16.121 1.25924 16.0218 1.16679C15.9226 1.07434 15.7885 1.0225 15.6487 1.02262H11.9879C11.8481 1.02238 11.7138 1.07417 11.6145 1.16663C11.5152 1.2591 11.459 1.38471 11.4583 1.51594V1.79149L9.62154 0.226642C9.45175 0.0808559 9.22991 0 8.99974 0C8.76956 0 8.54773 0.0808559 8.37794 0.226642L0.300887 7.10868C0.163371 7.22599 0.0669817 7.37965 0.0244256 7.54939C-0.0181305 7.71913 -0.00485487 7.89698 0.0625021 8.0595C0.129859 8.22201 0.248135 8.36157 0.401737 8.45976C0.555339 8.55795 0.737054 8.61017 0.922927 8.60953H2.21296V15.5049C2.21321 15.6364 2.26909 15.7624 2.36832 15.8552C2.46755 15.948 2.60201 16.0001 2.74215 16H7.16939C7.30953 16.0001 7.44398 15.948 7.54321 15.8552C7.64244 15.7624 7.69832 15.6364 7.69857 15.5049V11.3183H10.3004V15.5049C10.3006 15.57 10.3144 15.6345 10.341 15.6946C10.3677 15.7548 10.4068 15.8094 10.456 15.8554C10.5051 15.9013 10.5635 15.9378 10.6277 15.9626C10.6919 15.9874 10.7607 16.0001 10.8301 16H15.2569C15.397 16.0001 15.5315 15.948 15.6307 15.8552C15.7299 15.7624 15.7858 15.6364 15.786 15.5049V8.60997H17.0765C17.2625 8.61071 17.4444 8.55853 17.5981 8.46032C17.7518 8.36211 17.8702 8.22248 17.9375 8.05986C18.0049 7.89725 18.0181 7.71929 17.9755 7.54947C17.9328 7.37965 17.8363 7.22596 17.6986 7.10868Z" />
</svg>посмотреть в 3D</button>
                	<button type="button" class="js-s3d-form--reservation__open"><svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.2902 6.83376H12.1507V5.31424C12.1507 3.90481 11.5908 2.55312 10.5942 1.5565C9.59762 0.559891 8.24592 0 6.8365 0C5.42707 0 4.07538 0.559891 3.07876 1.5565C2.08215 2.55312 1.52226 3.90481 1.52226 5.31424V6.83376H0.382844C0.281706 6.83352 0.184602 6.8734 0.112831 6.94466C0.0410597 7.01592 0.000482467 7.11274 0 7.21387L0 16.7084C0.00072441 17.1117 0.161425 17.4981 0.446825 17.783C0.732226 18.0679 1.11901 18.2279 1.52226 18.2279H12.1507C12.554 18.2279 12.9408 18.0679 13.2262 17.783C13.5116 17.4981 13.6723 17.1117 13.673 16.7084V7.21387C13.6725 7.11274 13.6319 7.01592 13.5602 6.94466C13.4884 6.8734 13.3913 6.83352 13.2902 6.83376ZM7.97591 14.7641C7.98036 14.8176 7.97375 14.8714 7.9565 14.9222C7.93925 14.973 7.91173 15.0197 7.87565 15.0594C7.84011 15.0993 7.79658 15.1311 7.74788 15.153C7.69919 15.1748 7.64644 15.1861 7.59307 15.1861H6.07993C6.02656 15.1861 5.97381 15.1748 5.92511 15.153C5.87642 15.1311 5.83288 15.0993 5.79735 15.0594C5.76127 15.0197 5.73375 14.973 5.7165 14.9222C5.69925 14.8714 5.69264 14.8176 5.69708 14.7641L5.9432 12.6092C5.74866 12.4704 5.5901 12.2872 5.4807 12.0747C5.3713 11.8623 5.31423 11.6268 5.31424 11.3878C5.31424 10.9841 5.47462 10.5969 5.7601 10.3114C6.04558 10.0259 6.43277 9.86552 6.8365 9.86552C7.24023 9.86552 7.62742 10.0259 7.9129 10.3114C8.19838 10.5969 8.35876 10.9841 8.35876 11.3878C8.35877 11.6268 8.3017 11.8623 8.1923 12.0747C8.0829 12.2872 7.92433 12.4704 7.7298 12.6092L7.97591 14.7641ZM9.8719 6.83376H3.80109V5.31424C3.80109 4.5092 4.12089 3.73713 4.69014 3.16788C5.25939 2.59863 6.03146 2.27883 6.8365 2.27883C7.64154 2.27883 8.41361 2.59863 8.98285 3.16788C9.5521 3.73713 9.8719 4.5092 9.8719 5.31424V6.83376Z"/>
</svg>заявка на бронь</button>
<!--                	<button type="button" class="js-s3d-add__favourites" data-id="${elem.id}"><img src="assets/s3d/images/icon/heart.svg">в избранное</button>-->
                	<label data-id="${elem.activeFlat.value}" class="s3d-flat__like js-s3d-add__favourites">
										<input type="checkbox">
										<svg role="presentation"><use xlink:href="#icon-favourites"></use></svg>в избранное</label>
                </div>
                <div class="s3d-flat__buttons  js-s3d-flat__buttons-type">
                <label class="s3d-flat__button js-s3d__radio-type" data-type="with" >
                	<input type="radio" name="type" class="s3d-flat__button-input" value="with" checked/>
                	<span>с мебелью</span></label>
                <label class="s3d-flat__button js-s3d__radio-type" data-type="without"  >
                	<input type="radio" name="type" class="s3d-flat__button-input" value="without"/>
                	<span>без мебели</span></label>
                	<label class="s3d-flat__button js-s3d__radio-type" data-type="re-planning">
                	<input type="radio" name="type" class="s3d-flat__button-input" value="re-planning"/>
                	<span>ПЕРЕПЛАНУВАННЯ</span></label>
								</div>
								<div class="s3d-flat__buttons-view js-s3d-flat__buttons-view">
									<label class="s3d-flat__button js-s3d__radio-view" data-type="2d">
										<input type="radio" name="view" class="s3d-flat__button-input" value="2d" checked />
										<span>2d</span>
									</label>
									<label  class="s3d-flat__button js-s3d__radio-view" data-type="3d">
										<input type="radio" name="view" class="s3d-flat__button-input" value="3d" />
										<span>3d</span>
									</label>
								</div>
     </div>
		`)
	}

	checkPlaning() {
		let active = false
		let currentTab = ''
		$('.js-s3d-flat .show').removeClass('show')
		$('.js-s3d__radio-type').each((i, type) => {
			if (this.showHideRadioType(type.dataset.type) && !active) {
				active = true
				currentTab = type.dataset.type
				$(`.js-s3d__radio-type[data-type=${currentTab}] input`).prop('checked', true)
			}
		})
		this.showHideRadioType(currentTab)
		this.setNewImage(this.getFlatObj(this.activeFlat.value).images)
	}

	showHideRadioType(type) {
		const flat = this.getFlatObj(this.activeFlat.value)
		const tab = flat.images[type] || flat.images
		if ($('.js-s3d__radio-type').length === 0 || type === undefined || type === '') return false
		$(`.js-s3d__radio-type[data-type=${type}]`).removeClass('show')
		if (this.showHideRadioView(tab)) {
			$(`.js-s3d__radio-type[data-type= ${type}]`).addClass('show')
			return true
		}
		// $(`.js-s3d__radio-type[data-type= ${type}]`).attr('disable', true)
		// $(`.js-s3d__radio-type[data-type= ${type}]`).remove()
		return false
	}

	checkActiveRadio(type) {
		return $(`.js-s3d__radio-${type} input:checked`).val()
	}

	showHideRadioView(type) {
		let index = 0
		for (const el in type) {
			if (this.checkSting(type[el])) {
				$(`.js-s3d__radio-view[data-type=${el}]`).addClass('show')
				if (index === 0) {
					$(`.js-s3d__radio-view[data-type=${el}] input`).prop('checked', true)
				}
				index++
			}
		}
		if (index < 2) {
			$('.js-s3d-flat__buttons-view').removeClass('show')
		} else {
			$('.js-s3d-flat__buttons-view').addClass('show')
		}
		if (index === 0) {
			return false
		}

		return true
	}

	checkSting(value) {
		return (typeof value === 'string' && value !== '')
	}

	setNewImage(img) {
		const type = this.checkActiveRadio('type')
		const view = this.checkActiveRadio('view')
		if (type === undefined) {
			$('.js-s3d-flat__image').css('display', 'none')
		} else {
			$('.js-s3d-flat__image').attr('src', `/wp-content/themes/optimisto/assets${img[type][view]}`)
			$('.js-s3d-flat__image')[0].dataset['mfpSrc'] = `/wp-content/themes/optimisto/assets${img[type][view]}`
		}
	}
}
