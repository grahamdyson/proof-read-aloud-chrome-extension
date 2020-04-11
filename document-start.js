'use strict';

let voice, x = 0, y = 0;

if (window === top) {
	window.addEventListener("keypress", onKeyPress);
	window.addEventListener("mousemove", onMouseMove);
	window.speechSynthesis.onvoiceschanged = onVoicesChanged;
}

function onKeyPress({
	ctrlKey,
	key,
}) {
	if (ctrlKey && key === " ")
		if (window.speechSynthesis.speaking)
			window.speechSynthesis.cancel();
		else {
			window.speechSynthesis.speak(
				createUtteranceFromElement(
					getElementFromCurrentMouse(),
				),
			);
		}

	function getElementFromCurrentMouse() {
		const element = document.elementFromPoint(x, y);

		return whenAnchor() || element;

		function whenAnchor() {
			return (
				[ "A", "SPAN" ].includes(element.tagName)
				&&
				element.parentElement
			);
		}
	}

	function createUtteranceFromElement(
		element
	) {
		const utterance =
			new SpeechSynthesisUtterance(
				element.innerText,
			);

		utterance.voice = voice;

		return utterance;
	}
}

function onMouseMove({
	clientX,
	clientY,
}) {
	x = clientX;
	y = clientY;
}

function onVoicesChanged() {
	voice = window.speechSynthesis.getVoices().find(({ name }) => name === "Google US English");
}