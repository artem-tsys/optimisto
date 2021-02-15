function sortArray(arr, name, getFlat, directionSortUp) {
	const result = arr.reduce((previous, current) => {
		const id = +current.dataset.id
		const flat = getFlat[id]
		previous.push([current, flat[name]])
		return previous
	}, [])
	const coll = result.sort(directionSortUp ? sortUp : sortDown).map(el => el[0])
	return coll

	function sortUp(a, b) {
		if (+a[1] < +b[1]) {
			return -1
		} if (+a[1] > +b[1]) {
			return 1
		}
		return 0
	}
	function sortDown(a, b) {
		if (+a[1] > +b[1]) {
			return -1
		} if (+a[1] < +b[1]) {
			return 1
		}
		return 0
	}
}
