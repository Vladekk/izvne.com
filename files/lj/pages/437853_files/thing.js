//addEvent(window, 'load', initNavThing);

function initNavThing(){
	theNavThing = $('navigation-thing');
	if(!theNavThing) return;

	theNavThing.fullWidth = 646;
	theNavThing.fullHeight = 256;
	theNavThing.widthStart = 0;
	theNavThing.heightStart = 0;
	theNavThing.width = 0;
	theNavThing.height = 0;

	theNavThing.stepX = 50;
	theNavThing.stepY = 50;

	theNavThing.stepsX = 7;
	theNavThing.stepsY = 7;

	theNavThing.timer = null;
	theNavThing.time = 50;
	theNavThing.interval = Math.round(theNavThing.time / theNavThing.stepsX);

	theNavThing.block = 0;

	if(typeof document.body.style.maxWidth == "undefined"){ // IE6- hack
		addEvent(window, 'resize', resizeNavThing); 
	}
}


function showThing(event, blockLocal) {
	if(typeof theNavThing == 'undefined') return;
	if(theNavThing.offsetWidth == theNavThing.fullWidth) return;

	if(!theNavThing.block) { 
		theNavThing.block = blockLocal.offsetParent;
		theNavThing.block.realChildren = theNavThing.block.getElementsByTagName("*");
		theNavThing.block.childrenLength = theNavThing.block.realChildren.length;
	}

	theNavThing.widthStart = theNavThing.width = theNavThing.offsetWidth;
	theNavThing.heightStart = theNavThing.height = theNavThing.offsetHeight;
	theNavThing.stepX = Math.round((theNavThing.fullWidth - theNavThing.widthStart) / theNavThing.stepsX);
	theNavThing.stepY = Math.round((theNavThing.fullHeight - theNavThing.heightStart) / theNavThing.stepsY);

	clearInterval(theNavThing.timer);
	theNavThing.timer = setInterval("showThingBySteps()", theNavThing.interval);
}

function hideThing(event, blockLocal) {
	if(!theNavThing.block) return;
	if (event.relatedTarget) {
		where = event.relatedTarget;
		if (where == blockLocal) return;
		for (i = 0; i < blockLocal.childrenLength; i++) {
			if (blockLocal.realChildren[i] == where || blockLocal.realChildren[i].firstChild == where) return;
		}
	}
	else if (event.toElement && blockLocal.contains(event.toElement)) {
		return;
	}

	clearInterval(theNavThing.timer);
	theNavThing.timer = setInterval("hideThingBySteps()", theNavThing.interval);
}

function showThingBySteps() {
	// Сначала вбок, потом вниз
	if (theNavThing.width < theNavThing.fullWidth) {
		theNavThing.width = theNavThing.width + theNavThing.stepX;
		if (theNavThing.width >= theNavThing.fullWidth) {
			theNavThing.width = theNavThing.fullWidth;
		}
		theNavThing.style.width = theNavThing.width + 'px';
		return;
	} else if (theNavThing.height < theNavThing.fullHeight) {
		theNavThing.height = theNavThing.height + theNavThing.stepY;
		if (theNavThing.height >= theNavThing.fullHeight) {
			theNavThing.height = theNavThing.fullHeight;
		}
		theNavThing.style.height = theNavThing.height + 'px';
		return;
	}
	clearInterval(theNavThing.timer);

	if ($("post_status") && getPageY($("post_status")) < theNavThing.fullHeight) {
		$("post_status").style.visibility="hidden";
	}
}

function hideThingBySteps() {
	if ($("post_status")) {
		$("post_status").style.visibility="visible";
	}

	// Сначала вбок, потом вверх
	if (theNavThing.height > theNavThing.heightStart) {
		theNavThing.height = theNavThing.height - theNavThing.stepY;
		if (theNavThing.height <= theNavThing.heightStart){
			theNavThing.height = theNavThing.heightStart;
		}
		theNavThing.style.height = theNavThing.height + 'px';
		return;
	}
	else if (theNavThing.width > theNavThing.widthStart) {
		theNavThing.width = theNavThing.width - theNavThing.stepX;
		if (theNavThing.width <= theNavThing.widthStart){
			theNavThing.width = theNavThing.widthStart;
			theNavThing.style.width = '31%'; 
			if(typeof document.body.style.maxWidth == "undefined") resizeNavThing(); // IE6- hack
			return;
		}
		theNavThing.style.width = theNavThing.width + 'px';
		return;
	}
	clearInterval(theNavThing.timer);
}

/* IE6- hack */
function resizeNavThing(){
	theNavThing.style.width = (document.documentElement.clientWidth || document.body.clientWidth) > 820 ? "31%" : "200px";
}