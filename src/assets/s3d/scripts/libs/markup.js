function CreateMarkup(tag, wrapper, config) {
	const wrap = document.createElement(tag)
	wrap.classList = config.class || ''
	if (config.id) wrap.id = config.id
	if (config.style) wrap.style.cssText = config.style
	if (config.value) wrap.value = config.value
	if (config.type) wrap.type = config.type
	if (config.placeholder) wrap.placeholder = config.placeholder
	if (config.content) wrap.innerHTML = config.content

	if (typeof wrapper === 'string') {
		document.querySelector(wrapper).append(wrap)
		// $(wrapper).append(wrap)
	} else {
		wrapper.append(wrap)
	}
	return wrap
}
