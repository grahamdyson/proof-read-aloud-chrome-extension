'use strict';

let cancelled, voice, x = 0, y = 0;

if (window === top) {
	window.addEventListener("keypress", onKeyPress);
	window.addEventListener("mousemove", onMouseMove);
	window.speechSynthesis.onvoiceschanged = assignVoice;
}

function onKeyPress({
	ctrlKey,
	key,
}) {
	if (ctrlKey && key === " ")
		cancelOrSpeak();
}

function cancelOrSpeak() {
	if (window.speechSynthesis.speaking)
		cancel();
	else
		speakElement(
			getElementFromCurrentMouse(),
		);
}

function cancel() {
	cancelled = true;
	window.speechSynthesis.cancel();
}

function speakElement(
	element,
) {
	cancelled = false;

	window.speechSynthesis.speak(
		createUtteranceFromElement(
			element,
		)
	);
}

function getElementFromCurrentMouse() {
	const element = document.elementFromPoint(x, y);

	return getParentWhenInline() || element;

	function getParentWhenInline() {
		return (
			isInline()
			&&
			element.parentElement
		);

		function isInline() {
			return [ "A", "SPAN" ].includes(element.tagName);
		}
	}
}

function createUtteranceFromElement(
	element,
) {
	const utterance =
		new SpeechSynthesisUtterance(
			element.innerText,
		);

	utterance.onend = speakNextElement;
	utterance.voice = voice;

	return utterance;

	function speakNextElement() {
		if (!cancelled) {
			const sibling = getNextSiblingWithText(element);
			
			if (sibling)
				speakElement(sibling);
		}
	}
}

function getNextSiblingWithText(
	{ nextElementSibling },
) {
	return (
		getAfterNextWhenNoInnerText()
		||
		nextElementSibling
	);

	function getAfterNextWhenNoInnerText() {
		return (
			hasNoInnerText()
			&&
			getNextSiblingWithText(nextElementSibling)
		);

		function hasNoInnerText() {
			return (
				nextElementSibling
				&&
				!nextElementSibling.innerText
			);
		}
	}
}

function onMouseMove({
	clientX,
	clientY,
}) {
	x = clientX;
	y = clientY;
}

function assignVoice() {
	voice = window.speechSynthesis.getVoices().find(({ name }) => name === "Google US English");
}