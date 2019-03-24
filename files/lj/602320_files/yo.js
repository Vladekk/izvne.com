window.addEvent('domready', function() {
	var limit = new Object();
	
	
    var yoHandler = new Drag($('yo'), {
		limit : limit,
		
		onBeforeStart : function () {
			if ($('yo').style.position != 'fixed') {
				this.options.limit.x = [0, window.getScrollSize().x-22];
				this.options.limit.y = [0, window.getScrollSize().y-22];
			} else {
				this.options.limit.x = [0, window.getSize().x-22];
				this.options.limit.y = [0, window.getSize().y-22];
			}
		}
	});
	
	$('yo').addEvent('dblclick', function (event) {
		var ev = new Event(event);
		ev.preventDefault();
		if ($('yo').style.position != 'fixed') {
			$('yo').style.position = 'fixed';
			$('yo').style.left = $('yo').style.left.toInt() - window.getScroll().x + 'px';
			$('yo').style.top = $('yo').style.top.toInt() - window.getScroll().y + 'px';
			console.log($('yo').style.left, $('yo').style.top, $('yo').style.position);
		} else {
			$('yo').style.position = 'absolute';
			$('yo').style.left = $('yo').style.left.toInt() + window.getScroll().x + 'px';
			$('yo').style.top = $('yo').style.top.toInt() + window.getScroll().y + 'px';
			console.log($('yo').style.left, $('yo').style.top);
		}
	});
	
	$('yo').addEvent('click', function (event) {
		//commentsHandler.refresh('{"status":"OK", "id":"666","rating":"22","vote_enabled":"true","voted":"1","show_stars":"true","colored_ord":"false","colored_pop":"false","closed":"false","is_in_interests":"false","is_in_favourites":"false","tags":{"tag123":{"id":"123","text":"вау!","assigners":{"1":"jovan"},"new":"true","my":"false"}},"comments":{"comment776":{"user_id":"1","user_login":"jovan","gender":"m","comment_id":"776","prev_comment_id":"62","date":"12.09.2008","time":"17.20","body":"комментарий Йована","reply_offset":"0","replyto_id":"false","shrinked":"true","mine":"false","new_comment":"true","_exceedlimit":"false","vote_enabled":"true","rating":"100","voted":"0","president":"true"},"comment777":{"user_id":"6","user_login":"dirty","gender":"m","comment_id":"777","prev_comment_id":"776","date":"12.09.2008","time":"17.21","body":"комментарий dirty","reply_offset":"1","replyto_id":"776","shrinked":"false","mine":"false","new_comment":"true","_exceedlimit":"false","vote_enabled":"true","rating":"112","voted":"-1","president":"true"}}}');
		kgbHandler.getInfo();
	});
	//console.log(window.getSize().y);
	//console.log(document.getSize().y);
});



