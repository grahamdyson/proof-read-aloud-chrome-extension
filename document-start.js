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

async function speakElement(
	element,
) {
	cancelled = false;

	await speakLines(
		getLines()
	);

	if (!cancelled)
		speakNextElement();

	function getLines() {
		return (
			element.innerText
			.split("\n")
			.filter(line => line)
		);
	}

	function speakNextElement() {
		const sibling = getNextSiblingWithText(element);

		if (sibling)
			speakElement(sibling);
	}
}

async function speakLines(
	lines,
) {
	for (const line of lines)
		if (!cancelled)
			await speak(line);
}

function speak(
	text,
) {
	return (
		new Promise(
			resolve =>
				window.speechSynthesis.speak(
					createUtterance({
						text,
						onEnd: resolve,
					}),
				),
			)
	);
}

function createUtterance({
	text,
	onEnd,
}) {
	const utterance =
		new SpeechSynthesisUtterance(
			text,
		);

	utterance.onend = onEnd;
	utterance.voice = voice;

	return utterance;
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