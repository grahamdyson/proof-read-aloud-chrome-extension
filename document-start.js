'use strict';

let cancelled, keepAliveInterval, voice, x = 0, y = 0;

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
		speakElementAndParentSiblings(
			getElementFromCurrentMouse(),
		);
}

function cancel() {
	cancelled = true;
	
	stopKeepAlive();

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

async function speakElementAndParentSiblings(
	element,
) {
	cancelled = false;
	
	restartKeepAlive();

	await speakNodeAndSubsequentSiblings(element);
	await speakElementAncestorSubsequentSiblings(element);

	stopKeepAlive();
}

function restartKeepAlive() {
	stopKeepAlive();

	keepAliveInterval =
		setInterval(
			() => window.speechSynthesis.resume(),
			10000,
		);
}

function stopKeepAlive() {
	clearInterval(keepAliveInterval);
}

async function speakElementAncestorSubsequentSiblings(
	{ parentElement },
) {
	if (!cancelled && parentElement) {
		await speakNodeSubsequentSiblings(parentElement)
		await speakElementAncestorSubsequentSiblings(parentElement);
	}
}

async function speakNodeAndSubsequentSiblings(
	node,
) {
	await speakText(getNodeText(node));
	await speakNodeSubsequentSiblings(node);
}

function getNodeText({
	innerText,
	wholeText,
}) {
	return innerText || wholeText;
}

function speakText(
	text,
) {
	return (
		text
		&&
		speakLines(
			getLines(),
		)
	);

	function getLines() {
		return (
			text
			.split("\n")
			.filter(line => line)
		);
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

function speakNodeSubsequentSiblings(
	{ nextSibling },
) {
	if (nextSibling && !cancelled)
		return speakNodeAndSubsequentSiblings(nextSibling);
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