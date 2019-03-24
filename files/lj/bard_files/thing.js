//addEvent(window, 'load', initNavThing);
var theNavThing = false;
var theNavThingInited = false;
var theNavThingDomReady = false
var navThingSubs = {
	fullViewPage : 0,
	fullViewPageCol : 0,
	fullViewGoLeft : function (theNavThing, tbl) {
		if (navThingSubs.fullViewPage > 0) {
			var left = -(--navThingSubs.fullViewPage*305);
			tbl.morph({'left': left});
		}
	},
	fullViewGoRight : function (theNavThing, tbl) {
		if (navThingSubs.fullViewPage < navThingSubs.fullViewPageCol - 2) {
			var left = -(++navThingSubs.fullViewPage*305);
			tbl.morph({'left': left});
		}
	},
	makeFullView : function (subs, theNavThing) {
		var pagesCol = Math.ceil(subs.length / 3);
		navThingSubs.fullViewPageCol = pagesCol;
		var div = new Element('div', {'class':'subs subs_full'});
		var tbl = new Element('table');
		var tbody = new Element('tbody');
		var tr = new Element('tr');
		var td = new Element('td');
		td.inject(tr);
		tr.inject(tbody);
		tbody.inject(tbl)
		tbl.inject(div);
		
		
		subs.each(function (sub, i) {
			if ((i + 1) % 3 == 0) {
				sub.clone().addClass('sub_bottom').inject(td);
				if (i + 1 != subs.length) {
					td = new Element('td');
					td.inject(tr);
				}
			} else {
				sub.clone().inject(td);
			}
		});
		
		for (var i = 1; i <= subs.length; i++) {
			
		}
		
		if (pagesCol < 3) {
			theNavThing.getElements('.button_left, .button_right').set({'styles' : {'display':'none'}});
		} else {
			theNavThing.getElement('.button_left').addEvent('click', function (e) {
				e = new Event(e);
				e.preventDefault();
				navThingSubs.fullViewGoLeft(theNavThing, tbl);
			});
			theNavThing.getElement('.button_right').addEvent('click', function (e) {
				e = new Event(e);
				e.preventDefault();
				navThingSubs.fullViewGoRight(theNavThing, tbl);
			});
			tbl.set('morph', {duration: 333, link:'cancel'});
		}
		
		div.inject(theNavThing.getElement('.js-subs_container'));
		
	},
	makeImgView : function (subs, theNavThing) {
		var div = new Element('div', {'class':'subs subs_img_only'});
		subs.each(function (sub) {
			var logo_holder = new Element('div');
			sub.getElement('.logo').clone().inject(logo_holder);
			if (sub.getElement('.lock') != null) {
				sub.getElement('.lock').clone().inject(logo_holder);
			}
			logo_holder.inject(div);
		});
		
		div.inject(theNavThing.getElement('.js-subs_container'));
		
	},
	makeTextView : function (subs, theNavThing) {
		var div = new Element('div', {'class':'subs subs_text_only'});
		subs.each(function (sub) {
			var link = sub.getElement('.link').clone();
			link.innerHTML = link.innerHTML.split('.')[0];
			link.title = sub.getElement('h5').innerHTML;
			link.inject(div);
			div.appendText(' ');
		});
		
		div.inject(theNavThing.getElement('.js-subs_container'));
	}
};


function initNavThing(){
	theNavThingInited = true;
	theNavThing = $('navigation-thing');
	if(!theNavThing) return;

	theNavThing.fullWidth = 698;
	theNavThing.fullHeight = 377;
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
	
	/* add events to change view */
	
	var subs = theNavThing.getElements('.subs_loaded .sub');
	
	navThingSubs.makeFullView(subs, theNavThing);
	navThingSubs.makeImgView(subs, theNavThing);
	navThingSubs.makeTextView(subs, theNavThing);
	
	theNavThing.getElement('.show_text_only').addEvent('click', function (e) {
		e = new Event(e);
		e.preventDefault();
		theNavThing.removeClass('subs_img_only_active').removeClass('subs_full_active').addClass('subs_text_only_active');
		navThingHandler.fav('show', 'text', this);
	});
	theNavThing.getElement('.show_img_only').addEvent('click', function (e) {
		e = new Event(e);
		e.preventDefault();
		theNavThing.addClass('subs_img_only_active').removeClass('subs_full_active').removeClass('subs_text_only_active');
		navThingHandler.fav('show', 'pics', this);
	});
	theNavThing.getElement('.show_full').addEvent('click', function (e) {
		e = new Event(e);
		e.preventDefault();
		theNavThing.removeClass('subs_img_only_active').addClass('subs_full_active').removeClass('subs_text_only_active');
		navThingHandler.fav('show', 'both', this);
	});
	
	
	
}

function showThing(event, blockLocal) {
	if (theNavThingDomReady) {
		if (!theNavThingInited) initNavThing();
	}
	if (theNavThingDomReady && theNavThingInited) {
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
}

function hideThing(event, blockLocal) {
	if (theNavThing) {
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
		theNavThing.waitToHideTimer = (function () {
			clearInterval(theNavThing.timer);
			theNavThing.timer = setInterval("hideThingBySteps()", theNavThing.interval);
		}).delay(500);
	}
}
function dontHideThing(event, blockLocal) {
	if (theNavThing) {
		if(!theNavThing.waitToHideTimer) return;
		$clear(theNavThing.waitToHideTimer);
	}
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