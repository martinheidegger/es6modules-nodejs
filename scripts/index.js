function toArray(nodeList) {
	return [].slice.call(nodeList)
}
document.getElementsByTagName('html')[0].className += ' js'

var Router = require('ampersand-router')
var scrollToElement = require('element-scroll-to')

var router = new Router()
var current = null

function switchTo(section, subSection) {
	if (current) {
		current.style.display = ''
	}
	section.style.display = 'block'
	scrollToElement(subSection || section, {
		margin: 100
	})
	current = section
}

require('domready')(function () {
	var sections = toArray(document.querySelectorAll('body > div > section > section'))
	router.route(/.*/, 'home', switchTo.bind(null, sections[0]))
	sections.forEach(function (section) {
		router.route(section.id, section.id, switchTo.bind(null, section))
		toArray(section.querySelectorAll('section')).forEach(function (subSection) {
			router.route(subSection.id, subSection.id, switchTo.bind(null, section, subSection))
		})
	})
	router.history.start({
		pushState: false,
		hashChange: true
	})
})
