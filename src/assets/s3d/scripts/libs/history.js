class History {
	constructor(data) {
		this.history = []
		this.click = data.scrollToBlock
		this.animateBlock = data.animateBlock
		this.update = this.update.bind(this)
	}

	init() {
		this.pageLoad()
		this.history.push('complex')
		window.onpopstate = () => {
			this.onPopstate()
		}
	}

	pageLoad() {
		if (window.history.state === null) {
			window.history.replaceState(
				{
					isBackPage: true,
				},
				null,
				null,
			)
			window.history.pushState(
				{
					isBackPage: false,
				},
				null,
				null,
			)
		}
	}

	onPopstate() {
		window.history.pushState(
			{
				isBackPage: false,
			},
			null,
			null,
		)
		if (this.history.length > 0) {
			this.history.pop()
			this.animateBlock('translate', 'down')
			this.click(700)(this.history[this.history.length - 1])
		}
	}

	update(name) {
		this.history.push(name)
	}
}
