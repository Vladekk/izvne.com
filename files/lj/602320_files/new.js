/* AJAX handlers */
ajaxHandler = {
	alertError : function (message) {
		if (message && message != '') {
			showGenericWarning('<p>&mdash; ' + message + '</p>');
		} else {
			showGenericWarning('<p>&mdash; Ошибка без названия.</p>');
		}
	},
	checkResponse : function (ajaxObj, text) {
		if (text) {
			var response = JSON.decode(ajaxObj);
		} else {
			var response = JSON.decode(ajaxObj.responseText);
		}
		//var response = JSON.decode(ajaxObj);
		if (!$defined(response)) {
			ajaxHandler.alertError('Сервер почему-то ничего не ответил.');
			return false;
		}
		
		if (!response.status) {
			ajaxHandler.alertError('Сервер ни с того, ни с сего сообщил следующее: «' + ajaxObj.responseText + '»');
			return false;
		}
		
		if (response.status == 'ERR') {
			ajaxHandler.alertError(response.message);
			return false;
		}
		
		if (response.status == 'OK') {
			if (response.message == '') {
				return response;
			} else {
				ajaxHandler.alertError(response.message);
				return response;
			}
		} else {
			ajaxHandler.alertError('Сервер не сообщил об ошибке, но и не подтвердил, что всё прошло хорошо.');
			return response;
		}
	},
	highlightField : function (input, bg_color, highlight_color) {
		var input = $(input);
		var bg_color = bg_color || '#FFFFFF';
		var highlight_color = highlight_color || '#FF0000';
		$(input).set('morph');
		input.style.backgroundColor = highlight_color;
		input.morph({'background-color':bg_color});
		
	}
};

utils = {
	getPlural : function (num, texts) {
		var n = num % 100;
		var n1 = num % 10;
		if (n > 10 && n < 20) return texts[2];
		if (n1 > 1 && n1 < 5) return texts[1];
		if (n1 == 1) return texts[0];
		return texts[2];
	},
	focusText : function (input, text, input_holder) {
		input = $(input);
		if (!input_holder) {
			var input_holder = input;
		}
		input.addEvent('focus', function () {
			if (input.value == text) {
				input.value = '';
				input_holder.removeClass('js-input_default');
			}
			input_holder.addClass('js-input_focus');
		});
		input.addEvent('blur', function () {
			if (input.value == '') {
				input.value = text;
				input_holder.addClass('js-input_default');
			} else {
				input_holder.removeClass('js-input_default');
			}
			input_holder.removeClass('js-input_focus');
		});
	}
};


/* Favourites handlers */
favsHandler = {
	wtf : '',
	tens : 0,
	fav : function (what, id, button) {
		if (id < 1) return false;
		if ($(button).hasClass('js-loading')) return false;
		button.addClass('js-loading');
		
		var data = what + '=' + id + '&wtf=' + favsHandler.wtf;
		
		ajaxLoadPost('/favsctl', data, function (ajaxObj) {
			var response = ajaxHandler.checkResponse(ajaxObj);
			if (response) {
				if (what == 'add') {
					$(button).getParent().destroy();
				}
				if (what == 'del') {
					$(getAncestorByClassName($(button), 'post', 'DIV')).destroy();
				}
			}
			button.removeClass('js-loading');
		});
	}
};

/* My things handlers */
mythingsHandler = {
	wtf : '',
	fav : function (what, id, button, params) {
		if (what == 'del') {
			if (button.innerHTML == 'удалить до первого ответа') { // arrrrggghhhhh!!!
				var del_until_answer = true;
			} else {
				var del_until_answer = false;
			}
		}
		if (what == 'socialize' || what == 'desocialize') {
			if (button.checked) {
				what = 'socialize';
			} else {
				what = 'desocialize';
			}
		}
		if (what == 'noindex' || what == 'index') {
			if (button.checked) {
				what = 'index';
			} else {
				what = 'noindex';
			}
		}
		var params = (params) ? params : {};
		if (id < 1) return;
		if ($(button).hasClass('js-loading')) return false;
		button.addClass('js-loading');
		var data = what + '=' + id + '&wtf=' + mythingsHandler.wtf;
		if (what == 'del' && del_until_answer) {
			data += '&restorable=1';
		}
		ajaxLoadPost('/myctl', data, function (ajaxObj) {
			var response = ajaxHandler.checkResponse(ajaxObj);
			if (response) {
				if (what == 'add') {
					// shitty interface thing
					var favs_button_slash = $(button).getParent().getParent().getElement('.js-addToFavsSlash') || null;
					if (favs_button_slash && favs_button_slash.innerHTML == '/') {
						favs_button_slash.innerHTML = '|';
					}
					
					// destroy the button
					$(button).getParent().destroy();
				}
				if (what == 'del') {
					mythingsHandler.hovered_button = false;
					$(getAncestorByClassName($(button), 'post', 'DIV')).destroy();
				}
				if (what == 'desocialize' && params.empire_blogs) {
					//$(button).getParent('p').destroy();
				}
				if ((what == 'socialize' || what == 'desocialize') && !params.empire_blogs) {
					//$(button).getParent('div').destroy();
				}
			}
			if (button) {
				button.removeClass('js-loading');
			}
		});
	},
	hovered_button : false,
	del_from_my_things_out : function (e) {
		e = new Event(e);
		mythingsHandler.hovered_button = false;
		if (e.target.innerHTML == 'удалить до первого ответа') {
			e.target.innerHTML = 'стереть из моих вещей';
		}
	},
	del_from_my_things_hover : function (e) {
		e = new Event(e);
		mythingsHandler.hovered_button = e.target;
		if (e.control) {
			e.target.innerHTML = 'удалить до первого ответа';
		}
	}
};
document.addEvent('keydown', function (e) {
	if (mythingsHandler.hovered_button) {
		e = new Event(e);
		if (e.control || e.metaKey) {
			e.preventDefault();
			mythingsHandler.hovered_button.innerHTML = 'удалить до первого ответа';
		}
	}
});
document.addEvent('keyup', function (e) {
	if (mythingsHandler.hovered_button) {
		e = new Event(e);
		if (!e.control && !e.metaKey && mythingsHandler.hovered_button.innerHTML == 'удалить до первого ответа') {
			mythingsHandler.hovered_button.innerHTML = 'стереть из моих вещей';
		}
	}
});
/* nav thing handler */
navThingHandler = {
	wtf : '',
	fav : function (what, id, button) {
		if (id < 1) return;
		if ($(button).hasClass('js-loading')) return false;
		button.addClass('js-loading');
		if (what == 'add' || what == 'del') {
			if (button.checked) {
				what = 'add';
			} else {
				what = 'del';
			}
		}
		var data = what + '=' + id + '&wtf=' + navThingHandler.wtf;
		
		ajaxLoadPost('/navctl', data, function (ajaxObj) {
			var response = ajaxHandler.checkResponse(ajaxObj);
			if (response) {
				if (what == 'add') {
					//button.getParent().destroy();
				}
				if (what == 'del') {
					//button.getParent().destroy();
				}
				if (what == 'up') {
				}
				if (what == 'down') {
				}
				if (what == 'show') {
				}
			}
			button.removeClass('js-loading');
		});
	}
};


/* Inbox handlers */
inboxHandler = {
	wtf : '',
	
	// kick ban unban people
	users : function (what, inbox_id, user_id, button) {
		if ($(button).hasClass('js-loading')) return false;
		button.addClass('js-loading');
		
		var data = 'pid=' + inbox_id + '&wtf=' + inboxHandler.wtf + '&' + what + '=' + user_id;
		
		ajaxLoadPost('/inboxctl', data, function (ajaxObj) {
			var response = ajaxHandler.checkResponse(ajaxObj);
			if (response) {
				var personDiv = $(getAncestorByClassName($(button), 'js-inboxPerson', 'DIV'));
				if (what == 'kick') {
					personDiv.destroy();
				}
				if (what == 'ban') {
					personDiv.getElement('.js-inboxPerson-unban').removeClass('hidden');
					personDiv.getElement('.js-inboxPerson-ban').addClass('hidden');
					personDiv.getElement('.js-inboxPerson-name').getFirst().addClass('irony');
					
				}
				if (what == 'unban') {
					personDiv.getElement('.js-inboxPerson-unban').addClass('hidden');
					personDiv.getElement('.js-inboxPerson-ban').removeClass('hidden');
					personDiv.getElement('.js-inboxPerson-name').getFirst().removeClass('irony');
				}
			}
			button.removeClass('js-loading');
		});
	},
	
	// add people to inbox
	usersAdd : function (what, inbox_id, user_str) {
		if ($('js-inboxUserAddInput').value.trim() != '') {
			var data = 'pid=' + inbox_id + '&wtf=' + inboxHandler.wtf + '&' + what + '=' + user_str;
			ajaxLoadPost('/inboxctl', data, function (ajaxObj) {
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					var peopleDiv = $('js-inboxPeople');
					$('js-inboxUserAddInput').value = '';
					if (response.added.length) {
						for (var i = 0; i < response.added.length; i++) {
							var newPers = new Element('div',{'class':'js-inboxPerson'});
							
							var iHTMLnewPers = '[<a title="удалить" href="#" onclick="inboxHandler.users(\'kick\', \''+response.pid+'\', \''+response.added[i].uid+'\', this); return false;">x</a>]';
							iHTMLnewPers += '&nbsp;<a href="/users/'+response.added[i].login+'" class="js-inboxPerson-name"><span><i>'+response.added[i].login+'</i></span></a>&nbsp;';
							iHTMLnewPers += '[<a href="#" title="разбанить" class="js-inboxPerson-unban hidden" onclick="inboxHandler.users(\'unban\', \''+response.pid+'\', \''+response.added[i].uid+'\', this); return false;">-</a><a href="#" title="забанить" class="js-inboxPerson-ban" onclick="inboxHandler.users(\'ban\', \''+response.pid+'\', \''+response.added[i].uid+'\', this); return false;">+</a>]';	
							newPers.innerHTML = iHTMLnewPers;
							
							newPers.inject($$('.js-inboxPeople')[0], 'bottom');
						}
					} else {
						ajaxHandler.alertError('Никого не удалось добавить.');
					}
				}
			});
		} else {
			ajaxHandler.alertError('Введите имя или номер кого-нибудь!');
		}
		
	},
	
	fav : function (what, inbox_id, button) {
		if (inbox_id < 1) return;
		// smart buttons technology in action
		
		// if we are loading gtfo
		if ($(button).hasClass('js-loading')) return;
		
		// if we were waiting now we will delete
		if ($(button).hasClass('js-waiting')) {
			button.addClass('js-loading');
			button.removeClass('js-waiting');
			button.innerHTML = 'удаляем';
			var data = what + '=' + inbox_id + '&wtf=' + inboxHandler.wtf;
			ajaxLoadPost('/inboxctl', data, function (ajaxObj) {
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					if (what == 'del') {
						$(getAncestorByClassName(button, 'post', 'DIV')).destroy();
					}
				}
			});
			return;
		}
		
		// its the first time - we are waiting
		button.addClass('js-waiting');
		button.innerHTML = 'точно удалить?';
	},
	
	// vicont doesnt like everything else in this handler
	deleteTimers : [],
	checkTimer : function (params) {
		var inbox_id = params.inbox_id;
		var what = params.what;
		var time_left = --inboxHandler.deleteTimers[inbox_id].time_left;
		var button = inboxHandler.deleteTimers[inbox_id].button;
		if (time_left < 1) {
			$clear(inboxHandler.deleteTimers[inbox_id].timer);
			button.addClass('js-loading');
			button.removeClass('js-waiting');
			button.innerHTML = 'удаляем';
			var data = what + '=' + inbox_id + '&wtf=' + inboxHandler.wtf;
			ajaxLoadPost('/inboxctl', data, function (ajaxObj) {
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					if (what == 'del') {
						$(getAncestorByClassName(button, 'post', 'DIV')).destroy();
					}
				}
			});
		} else {
			button.innerHTML = 'удаляем через ' + time_left + ' ' + inboxHandler.getPluralSeconds(time_left) + ', отменить?';
		}
	},
	
	getPluralSeconds : function (sec) {
		var texts = ['секунду', 'секунды', 'секунд'];
		var n = sec % 100;
		var n1 = sec % 10;
		if (n > 10 && n < 20) return texts[2];
		if (n1 > 1 && n1 < 5) return texts[1];
		if (n1 == 1) return texts[0];
		return texts[2];
	}
};

/* Comments handlers */
commentsHandler = {
	wtf : '',
	plainComments : false,
	removeNewOnRefresh : false,
	old_school : false,
	new_first : false,
	inbox_page : false,
	iframeOnload : function (id) {
		doc = window.frames['post_add_iframe'].document;
		$('js-post_pic_file').destroy();
		$('reply_form_pic_hide').getElement('p').innerHTML = '<input type="file" id="js-post_pic_file" name="file"/>';
		$('js-post-yarrr').removeClass('js-loading');
		$('reply_form').getElement('.comments_form_loading').addClass('hidden');
		if (doc && doc.getElementById('comments')) {
			$('js-post-yarrr').removeClass('js-loading');
			$('reply_form').getElement('.comments_form_loading').addClass('hidden');
			var val = new String(doc.getElementById('comments').value);
			val = val.replace(/%/g,'\%');
			val = val.replace(/…/g,'\…');
			var response = ajaxHandler.checkResponse(val, true);
			if (response) {
				commentsHandler.refreshJSON(response,id);
			}
		}
	},
	refreshAll : function (id, params) {
		if (params.plaincomments) {
			commentsHandler.plainComments = true;
		}
		if ($(params.button).hasClass('js-loading')) {
			return false;
		} else {
			$(params.button).addClass('js-loading');
			$(params.button).innerHTML = 'работаем';
		}
		
		commentsHandler.prepareToSendCommentForm();
		
		var data = 'wtf=' + commentsHandler.wtf + '&pid=' + id;
		
		ajaxLoadPost('/commctl/', data, function (ajaxObj) {
			$(params.button).removeClass('js-loading');
			$(params.button).innerHTML = 'обновить комментарии';
			if ($('reply_form')) {
				$('reply_form').getElement('.comments_form_loading').addClass('hidden');
			}
			var val = ajaxObj.responseText;
			//val = val.replace(/\\\\"/g,'\\"');
			//val = val.replace(/%/g,'\%');
			//val = val.replace(/\\/g,'\\\\"');
			var response = ajaxHandler.checkResponse(val, true);
			if (response) {
				commentsHandler.refreshJSON(response,id);
			} else {
				commentsHandler.clearCommentForm();
			}
		});
	},
	refreshMy : function (id, params) {
		if (params.plaincomments) {
			commentsHandler.plainComments = true;
		}
		if ($(params.button).hasClass('js-loading')) {
			return false;
		} else {
			$(params.button).addClass('js-loading');
		}
		
		commentsHandler.prepareToSendCommentForm();
		if ($('js-post_pic_file').value.length > 0) {
			$('js-post_iframe_check').value = '1';
			$('comments-form').submit();
		} else {
			$('js-post_iframe_check').value = '0';
			var data = $('comments-form').toQueryString();
			ajaxLoadPost('/commctl/', data, function (ajaxObj) {
				$(params.button).removeClass('js-loading');
				$('reply_form').getElement('.comments_form_loading').addClass('hidden');
				var val = ajaxObj.responseText;
				//val = val.replace(/\\\\"/g,'\\"');
				//val = val.replace(/\\\\"/g,'\\"');
				//val = val.replace(/%/g,'\%');
				//val = val.replace(/\\/g,'\\\\"');
				//console.log(val);
				var response = ajaxHandler.checkResponse(val, true);
				if (response) {
					commentsHandler.refreshJSON(response,id);
				} else {
					commentsHandler.clearCommentForm();
				}
			});
		}
	},
	prepareToSendCommentForm : function (){
		if ($('reply_form')) {
			var w = $('reply_form').getCoordinates().width;
			var h = $('reply_form').getCoordinates().height;
			$('reply_form').getElement('.comments_form_loading').removeClass('hidden');
			$('reply_form').getElement('.comments_form_loading').set({'styles':{'width':w, 'height':h}});
			$('comment_textarea').blur();
			$('comment_textarea').set({'readonly':'readonly'});
		}
	},
	clearCommentForm : function (){
		if ($('reply_form')) {
			$('reply_form').style.display = 'none';
			$('comments-form').elements['i'].value = '0';
			$('comment_textarea').value = '';
			if ($('reply_link_default')) {
				$('reply_link_default').style.display = 'block';
			}
			$('comment_textarea').set({'readonly':''});
		}
	},
	clearCommentFormAfterError : function () {
		if ($('reply_form')) {
			$('reply_form').getElement('.comments_form_loading').addClass('hidden');
			$('comments-form').elements['i'].value = '0';
			$('comment_textarea').set({'readonly':''});
		}
	},
	refreshJSON : function (oj,id) {
		if (oj.comments) {
			var hash_comments = new Hash(oj.comments);
			for (var i = 0; i < hash_comments.getLength(); i++) {
				var data = hash_comments.get(i);
				var key = i;
				commentsHandler.buildComment(data, key, id);
			}
		} else if (oj.new_comment) {
			commentsHandler.buildComment(oj.new_comment, 0, id);
		}
		commentsHandler.countComments();
		commentsHandler.clearCommentForm();
	},
	countComments : function () {
		var all_comments = $('js-commentsHolder').getChildren('.post').length;
		var shrinked_comments = $('js-commentsHolder').getChildren('.shrinked').length;
		var new_comments = $('js-commentsHolder').getChildren('.new').length;
		if ($('js-comments_trashhold_count')) {
			if (all_comments > 0) {
				$('js-comments_trashhold_count').innerHTML = (all_comments - shrinked_comments) + ' из ' + all_comments + ' ' + commentsHandler.getPluralComments(all_comments);
			} else {
				$('js-comments_trashhold_count').innerHTML = 'нет комментариев';
			}
		}
		$('show_new').innerHTML = '<a href="" onclick="return showNew();">новые</a> ('+ new_comments +')';
		$('show_all').innerHTML = '<a href="" onclick="return showNew();">все</a> ('+ all_comments +')';
	},
	getPluralComments : function (sec) {
		var texts = ['комментария', 'комментариев', 'комментариев'];
		var n = sec % 100;
		var n1 = sec % 10;
		if (n > 10 && n < 20) return texts[2];
		if (n1 > 1 && n1 < 5) return texts[1];
		if (n1 == 1) return texts[0];
		return texts[2];
	},
	buildComment : function (data, key, pid) {
		if (!$(data.comment_id)) {
			data.pid = pid;
			var shrinked = (data.shrinked == 'true') ? 'shrinked' : '';
			var new_comment = (data.new_comment == 'true') ? 'new' : '';
			var mine = (data.mine == 'true') ? true: false;
			if (mine) {
				if (data.replyto_id != 0) {
					var replyto_classes = $(data.replyto_id).className.split(' ');
					$A(replyto_classes).each(function (cl) {
						if (cl.substr(0, 7) == 'indent_') {
							data.reply_offset = Number(cl.substr(7)) + 1;
						}
					});
				} else {
					data.reply_offset = 0;
				}
			} else {
				if (commentsHandler.plainComments) {
					data.reply_offset = 0;
				}
			}
			
			
			
			data.shrinked = '';
			if (data.vote_enabled && $('post_status') && $('post_status').value != 'all') {
				if (data.rating < $('post_status').value) {
					data.shrinked = 'shrinked';
				}
			}
			
			var comment_div = new Element('div', {
				'class':"post tree indent_{indent} {shrinked} {new_comment} {mine} u{user}".substitute({indent:data.reply_offset, user:data.user_id, shrinked:data.shrinked, new_comment:new_comment, mine:((mine) ? 'mine' : '')}),
				'id':data.comment_id 
			});
			
			
			var comment_text_div = new Element('div', {'class':'dt'});
			comment_text_div.innerHTML = data.body;
			
			var comment_other_div = new Element('div', {'class':'dd'});
			
			var iHTML = '<div class="p">';
			var exceedLimitHTML = (data._exceedlimit != 'true') ? 'onclick="return commentIt(event, this, \''+data.user_login+'\');"' : '';
			var gender = (data.gender == 'f') ? 'а' : ''
			iHTML += '<span><a class="login" href="/{url_part}/{post_id}#{comment_id}" {exceedLimitHTML}>&nbsp;</a></span> '.substitute({post_id:data.pid, comment_id:data.comment_id, exceedLimitHTML:exceedLimitHTML, url_part : (commentsHandler.inbox_page) ? 'my/inbox' : 'comments'});
			iHTML += 'Написал{gender} {rank} <a href="{parentSite}/users/{user_login}">{user_login}</a>, {date} в {time} '.substitute({gender:gender, user_id:data.user_id, user_login:data.user_login, date:data.date, time:data.time, parentSite:kgbHandler.parentSite, rank:data.rank});
			iHTML += (data._exceedlimit != 'true') ? '<span>| <a href="" onclick="return commentIt(event, this, \'{user_login}\');" class="reply_link">ответить</a></span> '.substitute({user_login:data.user_login}) : '';
			iHTML += '<a href="" class="show_link" onclick="return noShrink(this);">что он{gender} написал{gender}?</a> '.substitute({gender:gender});
			iHTML += (data.replyto_id) ? '<a href="#{replyto_id}" class="show_parent" replyto="{replyto_id}" onclick="return showParent(this);">&uarr;</a> '.substitute({replyto_id:data.replyto_id}) : '';
			iHTML += '<a href="" class="u" onclick="return allUserPosts(\'u{user_id}\');">.</a>'.substitute({user_id:data.user_id});
			iHTML += (data.editable == 'true') ? '| [<a href="#" onclick="javascript:openmodwin({comment_id}); return false;">я - у руля!</a>]'.substitute({comment_id:data.comment_id}):'';
			iHTML += '</div>';
			
			if (!commentsHandler.old_school) {
				iHTML += '<div class="vote" onmouseout="hideChoice(event, this);">';
				iHTML += '<div>';
				iHTML += '<span onmouseover="showChoice(this);" class="rating" onclick="kgbHandler.getInfo({type:\'comment\', button:this, id:{comment_id}});"><em>{rating}</em></span>'.substitute({rating:data.rating, comment_id:data.comment_id});
				if (data.vote_enabled) {
					var positive_voted = (data.votes > 0) ? ' voted' : '';
					var negative_voted = (data.votes < 0) ? ' voted' : '';
					if (!mine) {
						iHTML += '<a href="#" onclick="return vote(this);" class="plus{positive_voted}"><em>+</em></a>'.substitute({positive_voted:positive_voted});
						iHTML += '<a href="#" onclick="return vote(this);" class="minus{negative_voted}"><em>&mdash;</em></a>'.substitute({negative_voted:negative_voted});
					}
				}
				iHTML += '</div>';
				iHTML += '</div>';
			}
			
			comment_other_div.innerHTML = iHTML;
			
			comment_text_div.inject(comment_div);
			comment_other_div.inject(comment_div);
			if (mine) {
				if (data.replyto_id != 0) {
					//if (!commentsHandler.plainComments) {
						if (commentsHandler.new_first) {
							$(comment_div).inject($(data.replyto_id), 'before');
						} else {
							$(comment_div).inject($(data.replyto_id), 'after');
						}
					//} else {
					//	comment_div.inject($('js-commentsHolder'));
					//}
				} else {
					if (commentsHandler.new_first) {
						comment_div.inject($('js-commentsHolder'), 'top');
					} else {
						comment_div.inject($('js-commentsHolder'));
					}
				}
			} else {
				if (data.replyto_id != 0) {
					if (commentsHandler.new_first) {
						$(comment_div).inject($(data.replyto_id), 'before');
					} else {
						$(comment_div).inject($(data.replyto_id), 'after');
					}
				} else {
					if (commentsHandler.new_first) {
						comment_div.inject($('js-commentsHolder'), 'top');
					} else {
						comment_div.inject($('js-commentsHolder'));
					}
				}
			}
			if (!mine && commentsHandler.removeNewOnRefresh && key == 0) {
				$('js-commentsHolder').getElements('.new').each(function (comment) {
					if (comment != comment_div) {
						comment.removeClass('new');
					}
				});
				$('js-commentsHolder').getElements('.show').removeClass('show');
				var new_comment_anchor = new Element('a', {'name':'new'});
				var old_anchor = $('js-commentsHolder').getElement('a[name=new]');
				
				if (old_anchor) {
					old_anchor.destroy();
				}
				new_comment_anchor.inject(comment_div, 'before');
			}
		}
	}
	
};

/* sublepro window */
subleproHandler = {
	wtf : '',
	toggleSettings : function () {
		if ($('sublepro_header_kgb').hasClass('hidden')) {
			$('sublepro_header_kgb').removeClass('hidden')
			if (Browser.Engine.trident && Browser.Engine.version < 5 && $('kgb_posts_trashholder_select')) {
				$('kgb_posts_trashholder_select').style.display = 'block';
			}
		} else {
			$('sublepro_header_kgb').addClass('hidden')
			if (Browser.Engine.trident && Browser.Engine.version < 5 && $('kgb_posts_trashholder_select')) {
				$('kgb_posts_trashholder_select').style.display = 'none';
			}
		}
		
	},
	gertruda_inputs_counter : 0,
	addGertrudaInput : function () {
		var cloned_div = $('js-gertruda_file_sample').clone();
		subleproHandler.gertruda_inputs_counter++;
		cloned_div.getElement('input').name = 'gertruda_' + subleproHandler.gertruda_inputs_counter;
		cloned_div.inject($('js-gertruda_inputs'));
	},
	gertrudasEdit : {
		active : false,
		run : function (holder) {
			$(holder).getElements('div').each(function (gertr) {
				gertr.addEvent('mouseenter', function () {
					if (gertr != subleproHandler.gertrudasEdit.active) {
						if (subleproHandler.gertrudasEdit.active) {
							subleproHandler.gertrudasEdit.active.removeClass('active');
						}
						gertr.addClass('active');
						subleproHandler.gertrudasEdit.active = gertr;
					}
				});
				gertr.addEvent('mouseleave', function () {
					gertr.removeClass('active');
					subleproHandler.gertrudasEdit.active = false;
				});
			});
		},
		deleteGertruda : function (id, button) {
			if (id < 1) return;
			if ($(button).hasClass('js-loading')) return false;
			button.addClass('js-loading');

			var data = 'wtf=' + subleproHandler.wtf + '&delete_gertruda=' + id;
			
			ajaxLoadPost('/subctl', data, function (ajaxObj) {
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					button.getParent('.gertr').destroy();
				}
			});
		}
	},
	picRestore : function (id, button, default_pic) {
		if ($(button).hasClass('js-loading')) return false;
		button.addClass('js-loading');
		button.innerHTML = 'работаем';

		var data = 'wtf=' + subleproHandler.wtf + '&delete_pic=' + id;
		
		ajaxLoadPost('/subctl', data, function (ajaxObj) {
			var response = ajaxHandler.checkResponse(ajaxObj);
			if (response) {
				if (default_pic) {
					$(button).getParent('.sub_design_block').getElement('.sub_design_pic').src = default_pic;
					button.innerHTML = 'вернуть картинку';
				} else {
					$(button).getParent('.block_mini').destroy();
				}
			} else {
				button.innerHTML = 'вернуть картинку';
			}
		});
	},
	colorRestore : function (id, button, color) {
		if ($(button).hasClass('js-loading')) return false;
		button.addClass('js-loading');
		button.innerHTML = 'работаем';
		var data = 'wtf=' + subleproHandler.wtf + '&delete_color=' + id;
		ajaxLoadPost('/subctl', data, function (ajaxObj) {
			var response = ajaxHandler.checkResponse(ajaxObj);
			if (response) {
				var c = new Color(color);
				$('color_' + id).set('styles', {'background-color' : '#' + color});
				if ($('block_' + id).hasClass('sub_design_block_text_color')) {
					$('block_' + id).getElement('h5 span').style.color = '#' + color;
				}
				$('input_' + id).value = color;
			}
			button.removeClass('js-loading');
			button.innerHTML = 'восстановить';
		});
	},
	tagline_inputs_counter : 0,
	addTaglineInput : function () {
		var cloned_div = $('js-tagline_input_sample').clone();
		subleproHandler.tagline_inputs_counter++;
		cloned_div.getElement('input').name = 'tagline_' + subleproHandler.tagline_inputs_counter;
		cloned_div.getElement('a').destroy();
		cloned_div.inject($('js-taglines_inputs'));
	},
	bigImages : function () {
		if (Browser.Engine.trident && Browser.Engine.version < 5) {
			var images = $$('.big_img_holder');
			$A(images).each(function (img) {
				img.addEvent('mouseenter', function () {
					img.addClass('big_img_holder_hover');
				});
				img.addEvent('mouseleave', function () {
					img.removeClass('big_img_holder_hover');
				});
			});
		}
	}
};

subsAdsHandler = {
	wtf : '',
	sendPreview : function (form) {
		if (subsAdsHandler.checkPreview()) {
			if (!$(form).hasClass('js-loading')) {
				$(form).addClass('js-loading')
				var data = 'wtf=' + subsAdsHandler.wtf + '&preview=' + encodeURIComponent($('js-subs_ads_preview_body').value);
				ajaxLoadPost('/adsctl/', data, function (ajaxObj) {
					$(form).removeClass('js-loading')
					var response = ajaxHandler.checkResponse(ajaxObj);
					if (response) {
						//$('js-subs_ads_preview_logo').style.backgroundImage = 'url('+ response.preview.logo +')';
						$('js-subs_ads_preview_name').innerHTML = response.preview.body;
						$('js-subs_ads_preview').removeClass('hidden');
					}
				});
			}
		}
	},
	checkPreview : function () {
		if ($('js-subs_ads_preview_body').value.length < 1 || $('js-subs_ads_preview_body').value.length > 100) {
			ajaxHandler.highlightField($('js-subs_ads_preview_body'));
			return false;
		}
		return true;
	},
	askFinal : function () {
		var text =  'Вы действительно хотите купить рекламу на ' + subsAdsHandler.price*$('js-subs_ads_add_time').value + ' ЛВ?';
		Charley.ask({
			text:text,
			yes:'- Да, Пожалуйста!',
			no:'Вы знаете, я передумал',
			password:true,
			onYes:function () {
				subsAdsHandler.sendFinal($('js-subs_ads_form_final'));
			}
		});
	},
	sendFinal : function (form) {
		if (!$(form).hasClass('js-loading')) {
			$(form).addClass('js-loading');
			Charley.close();
			var data = 'wtf=' + subsAdsHandler.wtf + '&add=1&body=' + encodeURIComponent($('js-subs_ads_preview_body').value) + '&days=' + $('js-subs_ads_add_time').value + '&password=' + encodeURIComponent($('charley_holder').getElement('.password').value);
			ajaxLoadPost('/adsctl/', data, function (ajaxObj) {
				$(form).removeClass('js-loading')
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					var ad = subsAdsHandler.buildAdsBlock(response.ad);
					ad.inject($('js-subs_ads_current_holder'));
				}
			});
		}
	},
	cancel : function () {
		$('js-subs_ads_preview').addClass('hidden');
		$('js-subs_ads_preview_body').focus();
	},
	buildAdsBlock : function (ad) {
		var iHTML = '<a class="subs_ads_logo" href="#" style="background-image:url(' + ad.logo + ');"></a>';
		iHTML +=    '	<div class="subs_ads_text">';
		iHTML +=    '		<h2 class="subs_ads_name"><a href="http://' + ad.url + '">' + ad.body + '&mdash;&nbsp;<span class="subs_ads_url">' + ad.url + '</span></a></h2>';
		iHTML +=    '		<div class="subs_ads_index">';
		iHTML +=    '			<input type="checkbox" />';
		iHTML +=    '			<label>выводить на главную</label>';
		iHTML +=    '		</div>';
		iHTML +=    '	</div>';
		iHTML +=    '	<div class="subs_ads_settings">';
		iHTML +=    '		<p class="subs_ads_expires">до ' + ad.expires + '</p>';
		iHTML +=    '		<p class="subs_ads_delete"><a href="#" onclick="subsAdsHandler.deleteAd(\'' + ad.id + '\', this); return false;">удалить</a></p>';
		iHTML +=    '		<p class="subs_ads_prolong"><a href="#" onclick="subsAdsHandler.prolong(\'' + ad.id + '\', this); return false;">продлить</a></p>';
		iHTML +=    '	</div>';
		var newAd = new Element('div', {'class':'subs_ads'});
		newAd.innerHTML = iHTML;
		return newAd;
	},
	prolong : function (id, button) {
		var iHTML = '<input type="text" value="1" class="subs_ads_prolong_time" onkeydown="subsAdsHandler.checkProlong(event, \''+ id+ '\', this);" /> дней';
		var subs_ads_prolong_holder = $(button).getParent('.subs_ads_prolong');
		subs_ads_prolong_holder.innerHTML = iHTML;
		subs_ads_prolong_holder.getElement('.subs_ads_prolong_time').focus();
	},
	checkProlong : function (e, id, input) {
		e = new Event(e);
		if (e.key == 'enter') {
			subsAdsHandler.askProlong(id, input);
		}
	},
	askProlong : function (id, input) {
		var text =  'Вы действительно хотите продлить рекламу на ' + subsAdsHandler.price*input.value + ' ЛВ?';
		Charley.ask({
			text:text,
			yes:'- Да, Пожалуйста!',
			no:'Вы знаете, я передумал',
			password:true,
			onYes:function () {
				subsAdsHandler.sendProlong(id, input);
			}
		});
	},
	sendProlong : function (id, input) {
		if (!$(input).hasClass('js-loading')) {
			$(input).addClass('js-loading');
			Charley.close();
			var data = 'wtf=' + subsAdsHandler.wtf + '&prolong=' + id + '&days=' + input.value + '&password=' + encodeURIComponent($('charley_holder').getElement('.password').value);
			ajaxLoadPost('/adsctl/', data, function (ajaxObj) {
				$(input).removeClass('js-loading')
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					var ads_expires = $(input).getParent('.subs_ads').getElement('.subs_ads_expires');
					var ads_prolong = $(input).getParent('.subs_ads').getElement('.subs_ads_prolong');
					
					ads_prolong.innerHTML = '<a href="#" onclick="subsAdsHandler.prolong(\'' + id + '\', this); return false;">продлить</a>';
					ads_expires.innerHTML = 'до ' + response.ad.expires;
				}
			});
		}
	},
	deleteAd : function (id, button) {
		//subsAdsHandler.askDeleteAd(id, button);
		subsAdsHandler.sendDeleteAd(id, button);
	},
	askDeleteAd : function (id, button) {
		var text =  'Вы действительно хотите удалить рекламу?';
		Charley.ask({
			text:text,
			yes:'- Да, Пожалуйста!',
			no:'Вы знаете, я передумал',
			password:true,
			onYes:function () {
				subsAdsHandler.sendDeleteAd(id, button);
			}
		});
	},
	sendDeleteAd : function (id, button) {
		if (!$(button).hasClass('js-loading')) {
			$(button).addClass('js-loading');
			var data = 'wtf=' + subsAdsHandler.wtf + '&delete=' + id;
			ajaxLoadPost('/adsctl/', data, function (ajaxObj) {
				$(button).removeClass('js-loading')
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					var ads_holder = $(button).getParent('.subs_ads');
					ads_holder.destroy();
				}
			});
		}
	},
	indexAd_all_length : 0,
	indexAd_filter_length : 0,
	indexAd_overflow_holder : false,
	indexAd_ad : false,
	indexAd_holder : false,
	toggleIndexHeaderAdInit : function () {
		subsAdsHandler.indexAd_overflow_holder = $('js-subs_ads_overflow_holder');
		subsAdsHandler.indexAd_ad = $('js-subs_ads_index');
		subsAdsHandler.indexAd_holder = $('js-index_navigation_holder');
		
		subsAdsHandler.indexAd_overflow_holder.set('morph', {duration:333});
		subsAdsHandler.indexAd_holder.set('morph', {duration:333, onComplete : function () {
			if (subsAdsHandler.indexAd_holder.hasClass('js-ad_open')) {
				subsAdsHandler.indexAd_holder.style.width = '100%';
				subsAdsHandler.indexAd_overflow_holder.setStyle('width', 'auto');
				subsAdsHandler.indexAd_ad.setStyle('width', 'auto');
			} else {
				subsAdsHandler.indexAd_overflow_holder.addClass('hidden');
			}
		}});
		if (!subsAdsHandler.indexAd_holder.hasClass('js-ad_open')) {
			subsAdsHandler.adSize();
			subsAdsHandler.indexAd_ad.setStyle('width', (subsAdsHandler.indexAd_all_length - subsAdsHandler.indexAd_filter_length - 40 + 'px'));
		}
	},
	adSize : function () {
		subsAdsHandler.indexAd_all_length = $('js-length_meter').getSize().x;
		subsAdsHandler.indexAd_filter_length = $('filter').getSize().x;
	},
	toggleIndexHeaderAdResize : function () {
		subsAdsHandler.adSize();
		subsAdsHandler.indexAd_ad.setStyle('width', (subsAdsHandler.indexAd_all_length - subsAdsHandler.indexAd_filter_length - 40 + 'px'));
		subsAdsHandler.indexAd_overflow_holder.setStyle('width', (subsAdsHandler.indexAd_all_length - subsAdsHandler.indexAd_filter_length - 20 + 'px'));
		subsAdsHandler.indexAd_holder.setStyle('width', (subsAdsHandler.indexAd_all_length + 'px'));
	},
	toggleIndexHeaderAd : function () {
		if (subsAdsHandler.indexAd_holder.hasClass('js-ad_open')) {
			subsAdsHandler.toggleIndexHeaderAdResize();
			subsAdsHandler.indexAd_overflow_holder.morph({'width':1});
			subsAdsHandler.indexAd_holder.morph({'width':subsAdsHandler.indexAd_filter_length + 1});
			subsAdsHandler.indexAd_holder.removeClass('js-ad_open');
			var data = 'wtf=' + settingsHandler.wtf + '&hide_subs_ad=1';
			ajaxLoadPost('/settingsctl/', data, function (ajaxObj) {
				var response = ajaxHandler.checkResponse(ajaxObj);
			});
		} else {
			subsAdsHandler.indexAd_overflow_holder.removeClass('hidden');
			subsAdsHandler.adSize();
			subsAdsHandler.indexAd_overflow_holder.morph({'width':subsAdsHandler.indexAd_all_length - subsAdsHandler.indexAd_filter_length - 20});
			subsAdsHandler.indexAd_holder.morph({'width':subsAdsHandler.indexAd_all_length});
			subsAdsHandler.indexAd_holder.addClass('js-ad_open');
			var data = 'wtf=' + settingsHandler.wtf + '&hide_subs_ad=0';
			ajaxLoadPost('/settingsctl/', data, function (ajaxObj) {
				var response = ajaxHandler.checkResponse(ajaxObj);
			});
		}
	}
};

settingsHandler = {
	wtf : ''
};

/* kgb handler */

kgbHandler = {
	parentSite : '',
	wtf : '',
	activePage : 0,
	plusArray: {0:[]},
	minusArray: {0:[]},
	overallPages : 1,
	button : null,
	opened : false,
	loading : false,
	closeDiv : function() {
		$('kgb').setStyle('display','none');
		$(kgbHandler.button).removeClass('js-kgb');
		$(kgbHandler.button).removeClass('js-kgb_waiting');
		kgbHandler.opened = false;
		
		if (Browser.Engine.trident && Browser.Engine.version < 5 && $('kgb_comments_trashholder_select')) {
			$('kgb_comments_trashholder_select').style.display = 'none';
		}
	},
	
	// button clicked!
	getInfo : function (params) {
		if ($('kgb')) { // else we would build it
			
			// if window is opened or ajax has been sent already, gtfo
			if ($(params.button).hasClass('js-kgb_loading')) {
				return false;
			}
			if ($(params.button).hasClass('js-kgb')) {
				kgbHandler.closeDiv();
				return false;
			}
			
			if (kgbHandler.loading) {
				kgbHandler.closeDiv();
			}
			if (kgbHandler.opened) {
				kgbHandler.closeDiv();
			}
			
			kgbHandler.loading = true;
			
			// our button
			// is in the globals too
			kgbHandler.button = params.button;
			
			// and our button deserves to know if it is loading any ajax
			$(params.button).addClass('js-kgb_loading');
			
			// AJAX
			if (params.type == 'karma') {
				var data = 'view=' + params.id;
				var url  = '/karmactl';
			}
			if (params.type == 'post') {
				var data = 'id=' + params.id + '&type=1';
				var url  = '/votesctl';
			}
			if (params.type == 'comment') {
				var data = 'id=' + params.id + '&type=0' + '&post_id=' + params.post_id;
				var url  = '/votesctl';
			}
			$(params.button).addClass('js-kgb_waiting');
			ajaxLoadPost(url, data, function (ajaxObj) {
				// we are not loading anymore
				$(params.button).removeClass('js-kgb_loading');
				if (!$(params.button).hasClass('js-kgb_waiting')) {
					return false;
				}
				kgbHandler.loading = false;
				$(params.button).removeClass('js-kgb_waiting');
				$(params.button).addClass('js-kgb');
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
				
					// build karma header
					if (params.type == 'karma') {
						$('kgb').getElement('.kgb_header').innerHTML = 'Карма, так привлекшая ваше внимание, в данный момент <em>'+response.karma+'</em>';
						$(params.button).getElement('em').innerHTML = response.karma;
					}
					if (params.type == 'post') {
						$('kgb').getElement('.kgb_header').innerHTML = 'Рейтинг поста в данный момент <em>'+response.rating+'</em>';
						$(params.button).getElement('em').innerHTML = response.rating;
					}
					if (params.type == 'comment') {
						$('kgb').getElement('.kgb_header').innerHTML = 'Рейтинг комментария в данный момент <em>'+response.rating+'</em>';
						$(params.button).getElement('em').innerHTML = response.rating;
					}
					
					
					
					// locals
					//var minusArray = {0:[]};
					//var plusArray = {0:[]};
					var minusArray = [[]];
					var plusArray = [[]];
					var minusPageCounter = 0;
					var plusPageCounter = 0;
					
					// divide bad and good people
					$A(response.votes).each(function (person) {
						if (person.attitude >= 0) {
							if (plusArray[plusPageCounter].length == 20) {
								plusArray[++plusPageCounter] = [];
							}
							plusArray[plusPageCounter].push(person);
						} else {
							if (minusArray[minusPageCounter].length == 20) {
								minusArray[++minusPageCounter] = [];
							}
							minusArray[minusPageCounter].push(person);
						}
					});
					
					// lets count them
					var minusCol = minusPageCounter*20 + minusArray[minusPageCounter].length;
					var plusCol = plusPageCounter*20 + plusArray[plusPageCounter].length;
					
					
					if (plusPageCounter >= minusPageCounter) {
						var overallPages = plusPageCounter + 1;
					} else {
						var overallPages = minusPageCounter + 1;
					}
					
					// set the globals
					kgbHandler.overallPages = overallPages;
					kgbHandler.plusArray = plusArray;
					kgbHandler.minusArray = minusArray;
					kgbHandler.activePage = 0;
					
					// build paginator
					if (plusPageCounter < 1 && minusPageCounter < 1) {
						$('kgb').getElements('.kgb_paginator, .kgb_users_prev, .kgb_users_next').setStyle('display','none');
					} else {
						$('kgb').getElements('.kgb_paginator, .kgb_users_next').setStyle('display','block');
						$('kgb').getElements('.kgb_users_prev').setStyle('display','none');
						var iHTMLpaginator = '';
						iHTMLpaginator += '<a href="#" onclick="kgbHandler.setPage(0); return false;" class="active"> </a>';
						for (var i = 1; i < overallPages; i++) {
							iHTMLpaginator += '<a href="#" onclick="kgbHandler.setPage('+ i +'); return false;"> </a>';
						}
						$('kgb').getElement('.kgb_pag_inner_2').innerHTML = iHTMLpaginator;
					}
					
					// build people lists
					if (plusCol == 0) {
						var iHTMLplus = '<ul class="kgb_users"></ul>';
					} else {
						var iHTMLplus = '<ul class="kgb_users">';
						iHTMLplus += kgbHandler.createUsersLi(plusArray[0]);
						iHTMLplus+='</ul>';
					}
					
					if (minusCol == 0) {
						var iHTMLminus = '<ul class="kgb_users"></ul>';
					} else {
						var iHTMLminus = '<ul class="kgb_users">';
						iHTMLminus += kgbHandler.createUsersLi(minusArray[0]);
						iHTMLminus+='</ul>';
					}
					
					iHTMLplus = '<h4>плюсов &#151; '+ plusCol +'</h4>' + iHTMLplus;
					iHTMLminus = '<h4>минусов &#151; '+ minusCol +'</h4>' + iHTMLminus;
					
					if (plusCol == 0 && minusCol == 0) {
						iHTMLplus = '';
						iHTMLminus = '';
						$('kgb').getElement('.kgb_header').innerHTML = $('kgb').getElement('.kgb_header').innerHTML + '<br />Никто не нажимал на эти веселенькие плюсики и минусики';
						$('kgb').getElement('.kgb_users_table').addClass('hidden');
					} else {
						$('kgb').getElement('.kgb_users_table').removeClass('hidden');
					}
					
					$('kgb').getElement('.kgb_plus_users').innerHTML = iHTMLplus;
					$('kgb').getElement('.kgb_minus_users').innerHTML = iHTMLminus;
					
					
					// lets show kgb window near our karma button for now
					if (params.type == 'karma') {
						$('kgb').set('styles', {
							'display':'block',
							'position':'absolute',
							'top':$('js-user_karma').getCoordinates().top + $(params.button).getCoordinates().height + 'px',
							'left':$('js-user_karma').getCoordinates().left - 239 + 'px'
						});
					}
					if (params.type == 'post') {
						$('kgb').set('styles', {
							'display':'block',
							'position':'absolute',
							'top':'-10000px',
							'left':'-10000px'
						});
						
						var y1 = params.button.getPosition().y - window.getScroll().y;
						var y2 = window.getSize().y - y1 - params.button.getSize().y;
						var win_height = $('kgb').getSize().y;
						
						if (y1 <= y2) {
							var putToBottom = true;
						} else {
							var putToBottom = false;
						}
						
						if (!putToBottom) {
							if (params.button.getPosition().y <= win_height) {
								putToBottom = true;
							}
						}
						
						if (Browser.Engine.trident && Browser.Engine.version < 5) {
							putToBottom = true;
						}
						
						if (putToBottom) {
							$('kgb').set('styles', {
								'top':params.button.getCoordinates().top + params.button.getSize().y + 'px',
								'left':params.button.getCoordinates().left - 313 + 'px'
							});
							$('kgb').getElement('.kgb_arrow_bubble_top').setStyle('display', 'block');
							$('kgb').getElement('.kgb_arrow_bubble_top').setStyle('background-position', '310px 0');
							$('kgb').getElement('.kgb_arrow_bubble_bottom').setStyle('display', 'none');
						} else {
							$('kgb').set('styles', {
								'top':params.button.getCoordinates().top - win_height - 3 + 'px',
								'left':params.button.getCoordinates().left - 313 + 'px'
							});
							$('kgb').getElement('.kgb_arrow_bubble_top').setStyle('display', 'none');
							$('kgb').getElement('.kgb_arrow_bubble_bottom').setStyle('display', 'block');
							$('kgb').getElement('.kgb_arrow_bubble_bottom').setStyle('background-position', '310px 0');
						}
						
						
						/*$('kgb').set('styles', {
							'display':'block',
							'position':'absolute',
							'top':params.button.getCoordinates().top + $(params.button).getCoordinates().height + 'px',
							'left':params.button.getCoordinates().left - 313 + 'px'
						});*/
						if (Browser.Engine.trident && Browser.Engine.version < 5 && $('kgb_comments_trashholder_select')) {
							$('kgb_comments_trashholder_select').style.display = 'block';
						}
					}
					if (params.type == 'comment') {
						$('kgb').set('styles', {
							'display':'block',
							'position':'absolute',
							'top':'-10000px',
							'left':'-10000px'
						});
						
						var y1 = params.button.getPosition().y - window.getScroll().y;
						var y2 = window.getSize().y - y1 - params.button.getSize().y;
						var win_height = $('kgb').getSize().y;
						
						if (y1 <= y2) {
							var putToBottom = true;
						} else {
							var putToBottom = false;
						}
						
						if (!putToBottom) {
							if (params.button.getPosition().y <= win_height) {
								putToBottom = true;
							}
						}
						
						if (putToBottom) {
							$('kgb').set('styles', {
								'top':params.button.getCoordinates().top + params.button.getSize().y + 3 + 'px',
								'left':params.button.getCoordinates().left - 107 + 'px'
							});
							$('kgb').getElement('.kgb_arrow_bubble_top').setStyle('display', 'block');
							$('kgb').getElement('.kgb_arrow_bubble_top').setStyle('background-position', '100px 0');
							$('kgb').getElement('.kgb_arrow_bubble_bottom').setStyle('display', 'none');
						} else {
							$('kgb').set('styles', {
								'top':params.button.getCoordinates().top - win_height - 3 + 'px',
								'left':params.button.getCoordinates().left - 107 + 'px'
							});
							$('kgb').getElement('.kgb_arrow_bubble_top').setStyle('display', 'none');
							$('kgb').getElement('.kgb_arrow_bubble_bottom').setStyle('background-position', '100px 0');
							$('kgb').getElement('.kgb_arrow_bubble_bottom').setStyle('display', 'block');
						}
					}
					
					// opening button definitely knows that kgb window is opened
					kgbHandler.opened = true;
					
					// and 
					if (params.type == 'karma') {
						$('kgb').getElement('.kgb_arrow_bubble_top').setStyle('display', 'block');
						$('kgb').getElement('.kgb_arrow_bubble_top').setStyle('background-position', '236px 0');
						$('kgb').getElement('.kgb_arrow_bubble_bottom').setStyle('display', 'none');
					}
				}
			});
			
		} else {
			kgbHandler.createDiv();
			kgbHandler.getInfo(params);
		}
	},
	prevPage : function () {
		kgbHandler.setPage(kgbHandler.activePage - 1);
	},
	nextPage : function () {
		kgbHandler.setPage(kgbHandler.activePage + 1);
	},
	setPage : function(num) {
		var iHTMLplus = '';
		
		if (num != kgbHandler.activePage) {
			kgbHandler.activePage = num;
			
			// show or hide left or right arrow if the page is first or last
			if (num == kgbHandler.overallPages - 1) {
				$('kgb').getElement('.kgb_users_next').setStyle('display','none');
			} else {
				$('kgb').getElement('.kgb_users_next').setStyle('display','block');
			}
			if (num == 0) {
				$('kgb').getElement('.kgb_users_prev').setStyle('display','none');
			} else {
				$('kgb').getElement('.kgb_users_prev').setStyle('display','block');
			}
			
			// set active page in paginator
			$('kgb').getElement('.kgb_paginator .active').removeClass('active');
			$('kgb').getElements('.kgb_paginator a')[num].addClass('active');
			
			// build new people lists
			var iHTMLplus = '';
			if (kgbHandler.plusArray[num]) {
				iHTMLplus += kgbHandler.createUsersLi(kgbHandler.plusArray[num]);
			}
			$('kgb').getElement('.kgb_plus_users .kgb_users').innerHTML = iHTMLplus;
			
			var iHTMLminus = '';
			if (kgbHandler.minusArray[num]) {
				iHTMLminus += kgbHandler.createUsersLi(kgbHandler.minusArray[num]);
			}
			$('kgb').getElement('.kgb_minus_users .kgb_users').innerHTML = iHTMLminus;
		}
	},
	createDiv : function(params) {
	
		// oh i know its awful, at least you dont load this in HTML ;)
		var kgbEl = new Element('div', {'id':'kgb',	'style':'display:none;', 'class':'kgb' });
		kgbEl.inject(document.body, 'bottom');
		
		iHTML = '<div class="kgb_arrow_bubble_top" style="display:none;"> </div>';
		iHTML += '<div class="round_2 bg"></div><div class="round_1 bg"></div>';
		iHTML += '<div class="bg">';
		iHTML += '<div class="kgb_close"><a href="#" onclick="kgbHandler.closeDiv(); return false">[x]</a></div>';
		
		iHTML += '<div class="kgb_header"></div>';
		iHTML += '<div class="kgb_users_table_holder">';
		iHTML += '<a href="#" onclick="kgbHandler.prevPage(); return false;" class="kgb_users_prev"> </a>';
		iHTML += '<table class="kgb_users_table">';
		iHTML += '<tbody>';
		iHTML += '<tr>';
		iHTML += '<td class="kgb_plus_users">';
		iHTML += '</td>';
		iHTML += '<td class="kgb_minus_users">';
		iHTML += '</td>';
		iHTML += '</tr>';
		iHTML += '</tbody>';
		iHTML += '</table>';
		iHTML += '<a href="#" onclick="kgbHandler.nextPage(); return false;" class="kgb_users_next"> </a>';
		iHTML += '</div>';
		iHTML += '</div>';
		iHTML += '<div class="kgb_paginator bg">';
		iHTML += '<div class="kgb_pag_inner_1">';
		iHTML += '<div class="kgb_pag_inner_2">';
		iHTML += '<a href="#" class="active"> </a>';
		iHTML += '<a href="#"> </a>';
		iHTML += '<div style="clear:both;"> </div>';
		iHTML += '</div>';
		iHTML += '</div>';
		iHTML += '<div style="clear:both;"> </div>';
		iHTML += '</div>';
		iHTML += '<div class="round_1 bg"></div>';
		iHTML += '<div class="round_2 bg"></div>';
		iHTML += '<div class="kgb_arrow_bubble_bottom"> </div>';
		iHTML += '</div>';
		kgbEl.innerHTML = iHTML;
	},
	createUsersLi : function(people) {
		var iHTML = '';
		$A(people).each(function (person) {
			iHTML += '<li>';
			iHTML += '<a href="'+kgbHandler.parentSite+'/users/'+person.login+'">'+person.login+'</a> ';
			iHTML += '<span>('+person.attitude+')</span>';
			iHTML += '</li>';
		});
		return iHTML;
	}
};

/* goodies */
animatePosts = { 
	animation : null,
	posts : false,
	loaded : false,
	run : function () {
		if ($$('.post').length > 1) {
			animatePosts.addEventListeners();
		}
	},
	// waiting for ctrl + up, down keypress
	addEventListeners : function () {
		animatePosts.animation = new Fx.Scroll(window);
		document.addEvent('keyup', function (event) {
			e = new Event(event);
			if ((e.key == 'up' || e.key == 'down') && e.control) {
				if (Browser.Engine.presto && !e.shift) {
					return false;
				}
				e.preventDefault();
				/*if (!animatePosts.posts) {
					animatePosts.posts = animatePosts.getPostsPositions();
				} else if (!animatePosts.loaded) {
					animatePosts.posts = animatePosts.getPostsPositions();
				}*/
				animatePosts.posts = animatePosts.getPostsPositions();
				var nearestPost = animatePosts.getNearestPost(animatePosts.posts, e);
				if (nearestPost) {
					animatePosts.animation.start($(window).getScroll().x, $(nearestPost).getPosition().y);
				}
			}
		});
		document.addEvent('keydown', function (event) {
			e = new Event(event);
			if ((e.key == 'up' || e.key == 'down') && e.control) {
				e.preventDefault();
			}
		});
	},
	
	getPostsPositions : function () {
		// post mode - new_comments
		if ($('content').className.lastIndexOf('highlight') >= 0) {
			var allPosts = $$('#navigation .post, #content .new');
			if (allPosts.length == 1 && !$('content').hasClass('new_only')) {
				allPosts = $$('.post');
			}
		} else {
			var allPosts = $$('.post');
		}
		allPosts.each(function (post, i) {
			allPosts[i].pos = allPosts[i].getPosition().y;
		});
		return allPosts;
	},
	
	getNearestPost : function (allPosts, e) {
		var myPosition = document.getScroll().y;
		for (var i = 0; i < allPosts.length; i++) {
			// searching the nearest post on the screen
			if (myPosition < allPosts[i].pos) {
				// if we clicked down we go to that post else we go the previous if it exists
				return (e.key == 'down' ) ? allPosts[i] : ((i == 0) ? false : allPosts[i-1]);
			// and if we are AT any post now
			} else if (myPosition == allPosts[i].pos) {
				// we go to the next or previous if they exist
				return (e.key == 'down' ) ? ((i == allPosts.length - 1) ? false : allPosts[i+1]) : ((i == 0) ? false : allPosts[i-1]);
			}
		}
		// but if all posts are higher we have to go to the last post if we clicked "up"
		return (e.key == 'up') ? allPosts[allPosts.length-1] : false;
	},
	
	scrollTo : function (nearestPost) {
		animatePosts.animation.toElement(nearestPost);
	}
};

/* rating table */
jjTableHandler = {
	animate : function (tbl) {
		tbl.getElements('.jj_row, .jj_row_last').each(function (row) {
			if (Browser.Engine.trident && Browser.Engine.version < 5) {
				row.addEvent('mouseenter', function () {
					row.addClass('jj_row_hovered');
				});
				row.addEvent('mouseleave', function () {
					row.removeClass('jj_row_hovered');
				});
			}
			row.addEvent('click', function () {
				row.toggleClass('jj_opened');
				if (Browser.Engine.trident && Browser.Engine.version < 6) {
					if (row.hasClass('jj_opened')) {
						row.getElement('.jj_set_form').style.display = 'block';
					} else {
						row.getElement('.jj_set_form').style.display = 'none';
					}
				}
			});
			row.getElements('a, input, label').each(function(link) {
				link.addEvent('click', function (e) {
					e = new Event(e);
					e.stopPropagation();
				});
			});
		});
		
	},
	toggle: function (button) {
		button.getParent('.jj_row').toggleClass('jj_opened');
		if (Browser.Engine.trident && Browser.Engine.version < 5) {
			if (button.getParent('.jj_row').hasClass('jj_opened')) {
				alert(button.getParent('.jj_row').getElement('.jj_set_form'));
				button.getParent('.jj_row').getElement('.jj_set_form').style.display = 'block';
			} else {
				button.getParent('.jj_row').getElement('.jj_set_form').style.display = 'none';
			}
		}
	},
	startSearch : function () {
		$('sublepro_rating').addClass('hidden');
		$('js-tmp_underground_search_table').removeClass('hidden');
		$('total_pages').addClass('hidden');
		$('paginator').addClass('hidden');
	},
	stopSearch : function () {
		$('sublepro_rating').removeClass('hidden');
		$('js-tmp_underground_search_table').addClass('hidden');
		$('total_pages').removeClass('hidden');
		$('paginator').removeClass('hidden');
	},
	searchInput : false,
	searchInputTimer : false,
	searchInit : function (inp_id) {
		jjTableHandler.searchInput = $(inp_id);
		jjTableHandler.searchInput.set('morph');
		jjTableHandler.searchInput.addEvents({
			'keyup':function(e) {
				e = new Event(e);
				if (e.key == 'enter') {
					jjTableHandler.searchAjax();
				} else if (e.key == 'esc') {
					jjTableHandler.searchInput.value = 'Поиск по списку';
					if (jjTableHandler.searchInputTimer) {
						clearInterval(jjTableHandler.searchInputTimer);
					}
					jjTableHandler.stopSearch();
					jjTableHandler.searchInput.blur();
				} else {
					jjTableHandler.searchInput.style.backgroundColor = '#e5e5e5';
					jjTableHandler.searchInput.morph({'background-color':'#FFFFFF'});
					if (jjTableHandler.searchInputTimer) {
						clearInterval(jjTableHandler.searchInputTimer);
					}
					jjTableHandler.searchInputTimer = window.setTimeout(jjTableHandler.searchAjax, 1000);
				}
			},
			'focus':function() {
				if (jjTableHandler.searchInput.value != 'Поиск по списку') {
					jjTableHandler.searchInput.select();
				} else {
					jjTableHandler.searchInput.value = '';
				}
			},
			'blur':function() {
				if (jjTableHandler.searchInput.value == '') {
					jjTableHandler.searchInput.value = 'Поиск по списку';
					jjTableHandler.stopSearch();
				}
			}
		});
	},
	getPluralResults : function (res) {
		var texts = ['подлепру', 'подлепры', 'подлепр'];
		var n = res % 100;
		var n1 = res % 10;
		if (n > 10 && n < 20) return texts[2];
		if (n1 > 1 && n1 < 5) return texts[1];
		if (n1 == 1) return texts[0];
		return texts[2];
	},
	searchAjax : function () {
		if (jjTableHandler.searchInputTimer) {
			clearInterval(jjTableHandler.searchInputTimer);
		}
		if (jjTableHandler.searchInput.value.length > 0) {
			jjTableHandler.searchInput.style.backgroundColor = '#e6b0b0';
			jjTableHandler.searchInput.morph({'background-color':'#FFFFFF'});
			var data = 'query=' + jjTableHandler.searchInput.value;
			ajaxLoadPost('/underground/search/', data, function (ajaxObj) {
				jjTableHandler.searchInput.style.backgroundColor = '#bbe5c3';
				jjTableHandler.searchInput.morph({'background-color':'#FFFFFF'});
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					if (response.query == jjTableHandler.searchInput.value) {
						var iHTML = '<table class="jj_table"><tbody>';
						iHTML += '<tr class="jj_header">';
						if (response.results.length > 0) {
							iHTML += '	<th class="col1" colspan="5"><div>ЭВМ нашла ' + response.results.length + ' ' + jjTableHandler.getPluralResults(response.results.length) + ' по запросу &laquo;<strong>' + response.query + '</strong>&raquo;</div></th>';
							iHTML += '</tr>';
							iHTML += '<tr class="jj_header">';
							iHTML += '	<th class="col1"></th>';
							iHTML += '	<th class="jj_header_menu_table" colspan="4">';
							iHTML += '	<table>';
							iHTML += '	<tbody>';
							iHTML += '	<tr>';
							iHTML += '	<td><div><span>посты</span></div></td>';
							iHTML += '	<td><div><span>комментарии</span></div></td>';
							iHTML += '	<td><div><span>подписчики</span></div></td>';
							iHTML += '	<td class="jj_right_col"></td>';
							iHTML += '	</tr>';
							iHTML += '	</tbody>';
							iHTML += '	</table>';
							iHTML += '	</th>';
							iHTML += '</tr>';
						} else {
							iHTML += '<th class="col1" colspan="5"><div>Мы&nbsp;не&nbsp;нашли совпадений в&nbsp;полях названия и&nbsp;описания подлепр по&nbsp;запросу&nbsp;&laquo;<strong>' + response.query + '</strong>&raquo; </div></th>';
							iHTML += '</tr>';
						}
						
						for (var i = 0; i < response.results.length; i++) {
							var tmpiHTML = '<tr class="jj_row{last_td} jj_opened">';
							tmpiHTML += '<td class="jj_general_info col1">';
							tmpiHTML +=	'<table class="jj_general">';
							tmpiHTML +=	'<tbody>';
							tmpiHTML +=	'<tr><td>';
							tmpiHTML +=	'	<strong class="jj_logo">';
							tmpiHTML +=	'	<a href="http://{url}/"><img src="{logo}" alt="{name}" /><span></span></a>';
							tmpiHTML +=	'	</strong>';
							tmpiHTML +=	'{lock}';
							tmpiHTML +=	'</td><td>';
							tmpiHTML +=	'<div class="jj_general_text">';
							tmpiHTML +=	'	<h5>{name}</h5>';
							tmpiHTML +=	'	<a href="http://{url}/" class="jj_link">{url}</a>';
							tmpiHTML +=	'	<div class="jj_creator">создатель &#151; <a href="/users/{login_owner}/">{login_owner}</a></div>';
							if (response.results[i].is_accessible) {
							tmpiHTML +='	<div class="block_semi">';
							tmpiHTML +='		<input type="checkbox" {is_in_index_checked} id="sub_lepro_nav_{id}" onclick="mythingsHandler.fav(\'{is_in_index_button}\', {id}, this);" />';
							tmpiHTML +='		<label for="sub_lepro_nav_{id}">выводить на главную</label>';
							tmpiHTML +='	</div>';
							tmpiHTML +='	<div class="jj_set_form">';
							tmpiHTML +='		<div class="block_semi">';
							tmpiHTML +='			<input type="checkbox" {is_in_socialism_checked} id="sub_lepro_my_{id}" onclick="mythingsHandler.fav(\'{is_in_socialism_button}\', {id}, this);" />';
							tmpiHTML +='			<label for="sub_lepro_my_{id}">показывать новое в моих вещах</label>';
							tmpiHTML +='		</div>';
							tmpiHTML +='		<div class="block_semi">';
							tmpiHTML +='			<input type="checkbox" {is_in_navthing_checked} id="sub_lepro_nav_{id}" onclick="navThingHandler.fav(\'{is_in_navthing_button}\', {id}, this);" />';
							tmpiHTML +='			<label for="sub_lepro_nav_{id}">добавить в навигационную штуку</label>';
							tmpiHTML +='		</div>';
							tmpiHTML +='	</div>';
							}
							tmpiHTML +=	'</div>';
							tmpiHTML +=	'</td></tr></tbody></table>';
							tmpiHTML +=	'</td>';
							tmpiHTML +=	'<td colspan="4">';
							tmpiHTML +=	'<table class="jj_stat_table">';
							tmpiHTML +=	'	<tbody>';
							tmpiHTML +=	'		<tr>';
							tmpiHTML +='			<td class="jj_num col2">';
							tmpiHTML +='				<div>{posts_count}</div>';
							tmpiHTML +='			</td>';
							tmpiHTML +='			<td class="jj_num col3">';
							tmpiHTML +='				<div>{comms_count}</div>';
							tmpiHTML +='			</td>';
							tmpiHTML +='			<td class="jj_num col4">';
							tmpiHTML +='				<div>{subscribers_count}</div>';
							tmpiHTML +='			</td>';
							tmpiHTML +='			<td class="jj_right_col">';
							tmpiHTML +='				<div class="jj_set_inner">';
							tmpiHTML +='					<a href="#" class="jj_set_arr" onclick="jjTableHandler.toggle(this); return false;"><span> </span></a>';
							tmpiHTML +='				</div>';
							tmpiHTML +='			</td>';
							tmpiHTML +='		</tr>';
							tmpiHTML +='	</tbody>';
							tmpiHTML +='</table>';
							tmpiHTML +=	'<div class="jj_desc">{desc}</div>';
							tmpiHTML +=	'</td>';
							tmpiHTML +='</tr>';
							var tmpiHTMLobj = {
								'id' : response.results[i].id,
								'last_td' : (i == response.results.length - 1) ? '_last' : '',
								'url' : response.results[i].url,
								'logo' : (response.results[i].settings_domain_logo_webpath == '') ? '/i/0.gif' : response.results[i].settings_domain_logo_webpath,
								'lock' : (response.results[i].settings_domain_exclusive_read == '1') ? '<span class="jj_lock"></span>' : '',
								'name' : response.results[i].settings_domain_name,
								'id_owner' : response.results[i].id_owner,
								'login_owner' : response.results[i].owner_login,
								'desc' : response.results[i].settings_domain_desc,
								'posts_count' : response.results[i].posts_count,
								'comms_count' : response.results[i].comms_count,
								'subscribers_count' : response.results[i].subscribers_count,
								'is_in_socialism_checked' : (response.results[i].is_in_socialism == '1') ? 'checked="checked"' : '',
								'is_in_socialism_button' : (response.results[i].is_in_socialism == '1') ? 'desocialize' : 'socialize',
								'is_in_navthing_checked' : (response.results[i].is_in_navthing == '1') ? 'checked="checked"' : '',
								'is_in_navthing_button' : (response.results[i].is_in_navthing == '1') ? 'del' : 'add',
								'is_in_index_checked' : (response.results[i].is_in_index == '1') ? 'checked="checked"' : '',
								'is_in_index_button' : (response.results[i].is_in_index == '1') ? 'noindex' : 'index'
							};
							tmpiHTML = tmpiHTML.substitute(tmpiHTMLobj);
							iHTML += tmpiHTML;
						}
						
						iHTML += '</tbody></table>';
						$('js-tmp_underground_search_table').innerHTML = iHTML;
						jjTableHandler.startSearch();
						jjTableHandler.animate($('js-tmp_underground_search_table'));
						
					}
				}
			});
		} else {
			jjTableHandler.stopSearch();
		}
	}
};


/* Charley */

Charley = {
	holder : '',
	bg : '',
	charlies : '',
	charley : '',
	make_holder : function () {
		Charley.holder = new Element('div', {'id':'charley_holder'});
		Charley.bg = new Element('div', {'class':'black'});
		Charley.charlies = new Element('div', {'class':'charlies'})
		Charley.bg.inject(Charley.holder);
		Charley.charlies.inject(Charley.holder);
		Charley.holder.inject(document.body);
	},
	make_new : function (params) {
		Charley.holder.addClass('active_charley');
		Charley.charley = new Element('div', {'class':'charley'});
		var inner = new Element('div', {'class':'charley_inner'});
		var close = new Element('a', {'class':'close', 'events':{'click':Charley.close}});
		var text = new Element('div', {'class':'text', 'html':params.text});
		text.inject(inner);
		if (params.password) {
			var password_holder = new Element('div', {'class':'password_holder', 'html':'окошко для пароля '});
			var password = new Element('input', {'type':'password', 'class':'password','name':'password', 'value':''});
			
			password.inject(password_holder);
			password_holder.inject(text);
			password.addEvent('keyup', function(e) {
				e = new Event(e);
				if (e.key == 'enter') {
					Charley.send(params, password);
				}
			});
		}
		if (params.yes) {
			var yes = new Element('a', {'class':'yes', 'html':params.yes, 'events':{'click':((function () {
					if (params.password) {
						Charley.send(params, password);
					} else {
						Charley.send(params);
					}
				})||$empty)}});
			yes.inject(inner);
		}
		if (params.no) {
			var no = new Element('a', {'class':'no', 'html':params.no, 'events':{'click':(params.onNo||Charley.close)}});
			no.inject(inner);
		}
		var clear = new Element('div', {'class':'clear'});
		clear.inject(inner);
		inner.inject(Charley.charley);
		close.inject(Charley.charley);
		Charley.bg.style.display = 'block';
		if (Browser.Engine.trident) {
			Charley.bg.style.height = document.getSize().y + 100 + 'px';
		}
		Charley.charley.inject(Charley.charlies);
		Charley.charley.set('morph', {duration: 999, transition:Fx.Transitions.Bounce.easeOut });
		Charley.charley.morph({'margin-top': '200'});
		if (params.password) {
			password.focus();
		}
		
	},
	ask : function (params) {
		if ($('charley_holder')) {
			if (!Charley.holder.hasClass('active_charley')) Charley.make_new(params);
			
		} else {
			Charley.make_holder();
			Charley.ask(params);
		}
	},
	close : function () {
		Charley.charley.set('morph', {duration: 666});
		Charley.charley.morph({'margin-top': '-200'});
		(function() {
			Charley.bg.style.display = 'none';
			Charley.charley.destroy();
			Charley.holder.removeClass('active_charley');
		}).delay(700);
	},
	send : function (params, password) {
		if (params.password) {
			if (password.value.length > 0) {
				if (params.onYes) {
					params.onYes();
				}
				if (params.form) {
					password.inject(params.form);
					params.form.submit();
				}
			} else {
				password.set('morph', {duration: 222});
				password.style.backgroundColor = '#FF0000';
				password.morph({'background-color':'#F6EFD2'})
			}
		} else {
			if (params.onYes) {
				params.onYes();
			}
			if (params.form) {
				params.form.submit();
			}
		}
	}
};


/* Empire blogs block */
empireBlogsHandler = {
	run : function () {
		if ($('domains_unread')) {
			$('domains_unread').getElements('p').each(function (domain) {
				domain.addEvent('mouseenter', function() {
					domain.addClass('over');
				});
				domain.addEvent('mouseleave', function() {
					domain.removeClass('over');
				});
			});
		}
	}
};


/* anchor menu */
anchorMenuHandler = {
	run: function () {
		var links = [];
		$('tabs-table').getElements('a').each(function (link) {
			var l = link.href.substr(link.href.indexOf('#') + 1);
			links.push(l);
		});
		$('tabs-table').getElements('a').each(function (link) {
			link.addEvent('click', function (e) {
				anchorMenuHandler.active(link.href.substr(link.href.indexOf('#') + 1), links);
			});
		});
		var isActive = false;
		$A(links).each(function(l) {
			if (window.location.href.substr(window.location.href.indexOf('#') + 1) == l) {
				anchorMenuHandler.active(l, links);
				isActive = true;
			}
		});
		if (!isActive) {
			anchorMenuHandler.active(links[0], links);
			isActive = true;
		}
	},
	active: function (l, links) {
		link =  $('js-tab-link-'+l);
		if (!link.hasClass('tab-link-active') && $('tabs-table').getElement('.tab-link-active')) {
			$('tabs-table').getElement('.tab-link-active').addClass('tab-link');
			$('tabs-table').getElement('.tab-link-active').removeClass('tab-link-active');
		}
		link.addClass('tab-link-active');
		link.removeClass('tab-link');
		$A(links).each(function(l) {
			$(l+'-tab').addClass('hidden');
			if (link.href.substr(link.href.indexOf('#') + 1) == l) {
				$(l+'-tab').removeClass('hidden');
			}
		});
	}
};

newsHandler = {
	activePage : 0,
	overallPages : 0,
	show : function () {
		$('js-news_kgb').removeClass('hidden');
		newsHandler.overallPages = $('js-news_kgb').getElements('.one_news').length;
		if (newsHandler.overallPages == 1) {
			$('js-news_kgb').getElements('.kgb_users_prev, .kgb_users_next, .kgb_paginator').set('styles', {'display':'none'});
		}
		$('js-news_kgb').getElements('.kgb_paginator .news_pag_page').each(function (link, i) {
			link.addEvent('click', function () {
				newsHandler.activePage = i;
			});
		});
		
		/* first time */
		if (!$('js-news_kgb').getElement('.kgb_paginator .active')) {
			$('js-news_kgb').getElement('.kgb_paginator .news_pag_page').addClass('active');
			var firstPage = $('js-news_kgb').getElement('.one_news');
			firstPage.removeClass('hidden');
			newsHandler.sendPageRead(firstPage);
		}
	},
	hide : function () {
		$('js-news_kgb').addClass('hidden');
	},
	prevPage : function () {
		if (newsHandler.activePage > 0) {
			var active_page = $('js-news_kgb').getElement('.kgb_paginator .active');
			if (active_page.getPrevious('a')) {
				var next_active_page = active_page.getPrevious('.news_pag_page');
				next_active_page.addClass('active');
				active_page.removeClass('active');
			}
			newsHandler.activePage--;
			newsHandler.setPage();
		}
		
	},
	nextPage : function () {
		if (newsHandler.activePage < newsHandler.overallPages - 1) {
			var active_page = $('js-news_kgb').getElement('.kgb_paginator .active');
			if (active_page.getNext('a')) {
				var next_active_page = active_page.getNext('.news_pag_page');
				next_active_page.addClass('active');
				active_page.removeClass('active');
			}
			newsHandler.activePage++;
			newsHandler.setPage();
		}
	},
	setPage : function (target_id, button) {
		var active_page = false;
		if (!target_id) {
			$('js-news_kgb').getElements('.one_news').each(function (one_news, i) {
				if (i == newsHandler.activePage) {
					one_news.removeClass('hidden');
					active_page = one_news;
				} else {
					one_news.addClass('hidden');
				}
			});
		}
		if (target_id) {
			$('js-news_kgb').getElements('.one_news').each(function (one_news, i) {
				if (one_news.id == 'news'+target_id) {
					one_news.removeClass('hidden');
					active_page = one_news;
				} else {
					one_news.addClass('hidden');
				}
			});
			if (button) {
				if ($('js-news_kgb').getElement('.kgb_paginator .active')) {
					$('js-news_kgb').getElement('.kgb_paginator .active').removeClass('active');
				}
				button.addClass('active');
			}
		}
		if (active_page) {
			newsHandler.sendPageRead(active_page);
		}
	},
	sendPageRead : function (active_page) {
		if (!active_page.hasClass('js-news_read_already')) {
			active_page.addClass('js-news_read_already')
			var data ='read=' + active_page.id.substr(4) + '&wtf=' + newsHandler.wtf;
			ajaxLoadPost('/annctl', data, function (ajaxObj) {
				var response = ajaxHandler.checkResponse(ajaxObj);
			});
		}
	},
	readAll : function () {
		$('js-news_kgb').getElements('.one_news').each(function (one_news) {
			newsHandler.sendPageRead(one_news);
		});
		$('js-news_link').addClass('hidden');
	}
};

chatHandler = {
	size : 400,
	opened : false,
	loading : false,
	loadingInterval : null,
	sending : false,
	sendingInterval : null,
	chatHolderFx : false,
	chatMessageFx : false,
	chatResizerDrag : false,
	waitToSend : false,
	firstOpening : true,
	open : function ()  {
		if (Browser.Engine.trident && Browser.Engine.version < 5) {
			if ($('post_status')) {
				$('post_status').setStyle('visibility','hidden');
			}
		}
		$('chat').set('morph', {'duration':300});
		$('chat').removeClass('hidden');
		$('chat').morph({'margin-top':0});
		$('js-chat_send_message_holder').set('morph', {'duration':300});
		chatHandler.opened = true;
		$('js-chat_input').focus();
		chatHandler.load();
		if (!chatHandler.chatResizerDrag) {
			chatHandler.chatResizerDrag = new Drag($('js-chat_resizer'), {'style':true, onDrag:function () {
				$('js-chat_messages_overflow_holder').style.height = chatHandler.size - this.mouse.start.y + this.mouse.now.y + 'px';
			}, onComplete:function() {
				chatHandler.size = chatHandler.size - this.mouse.start.y + this.mouse.now.y;
			}});
		}
	},
	close : function () {
		$('chat').set('morph', {'duration':300, onComplete: function () {
			$('chat').addClass('hidden');
			chatHandler.opened = false;
			if (Browser.Engine.trident && Browser.Engine.version < 5) {
				if ($('post_status')) {
					$('post_status').setStyle('visibility','visible');
				}
			}
		}});
		$('chat').morph({'margin-top':-chatHandler.size - 32});
		$clear(chatHandler.loadingInterval);
		chatHandler.firstOpening = true;
	},
	draw : function (response) {
		if ($('js-chat_messages_overflow_holder').getScrollSize().y - chatHandler.size - $('js-chat_messages_overflow_holder').getScroll().y > 10) {
			var scroll = false;
		} else {
			var scroll = true;
		}
		var messages = new Hash(response.messages);
		for (var i = 0; i < messages.getLength(); i++){
			var message = messages.get(i);
			if (message.body.lastIndexOf(chatHandler.username + ':') == 0) {
				if (chatHandler.username == 'artimage') {
					var newMessage = new Element('div', {'class':'message message_to_artimage', 'id':'chat_message_'+message.id});
				} else {
					var newMessage = new Element('div', {'class':'message message_to_me', 'id':'chat_message_'+message.id});
				}
				
			} else {
				var newMessage = new Element('div', {'class':'message', 'id':'chat_message_'+message.id});
			}
			
			var iHTML = '';
			
			if (message.user_login == chatHandler.username) {
				newMessage.style.color = '#FFF';
				var color = '#FFFFFF';
				iHTML += '[' + message.createdate + '] <span class="user_name" style="color:'+ color +';">';
				iHTML += '<a style="color:'+ color +';" href="' + kgbHandler.parentSite + '/users/'+ message.user_login +'" onclick="chatHandler.answerName(this); return false;">'+ message.user_login +'</a>';
			} else {
				iHTML += '[' + message.createdate + '] <span class="user_name">';
				iHTML += '<a href="' + kgbHandler.parentSite + '/users/'+ message.user_login +'" onclick="chatHandler.answerName(this); return false;">'+ message.user_login +'</a>';
			}
			iHTML += '&gt;</span>&nbsp;' + message.body;
			newMessage.innerHTML = iHTML;
			newMessage.inject($('js-chat_messages_holder'));
			if (i == messages.getLength() - 1) {
				$('js-chat_last').value = message.id;
			}
			
		}
		if (scroll || chatHandler.firstOpening) {
			//$('js-chat_messages_overflow_holder').scrollTo(0, $('js-chat_messages_overflow_holder').getScrollSize().y - chatHandler.size);
			var myChatScrollFx = new Fx.Scroll($('js-chat_messages_overflow_holder')).toBottom();
		}
		chatHandler.firstOpening = false;
	},
	load : function () {
		if (!chatHandler.loading) {
			chatHandler.loading = true;
			//$('js-chat_messages_overflow_holder').addClass('loading_messages');
			var data = 'last=' + $('js-chat_last').value + '&wtf=' + chatHandler.wtf + '&key=' + window.location.href.substr(7);
			ajaxLoadPost('/chatctl/', data, function (ajaxObj) {
				chatHandler.loading = false;
				//$('js-chat_messages_overflow_holder').removeClass('loading_messages');
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					chatHandler.draw(response);
				}
				if (!chatHandler.waitToSend) {
					chatHandler.loadingInterval = (function () {chatHandler.load()}).delay(10000);
				} else {
					chatHandler.send();
				}
			});
		}
	},
	send : function () {
		if (!chatHandler.sending) {
			if (!chatHandler.waitToSend) {
				$clear(chatHandler.loadingInterval);
				$('js-chat_send_message_holder').morph({'height':0});
				$('js-chat_input').addClass('sending_message');
				$('js-chat_input').set({'readonly':'readonly'});
			}
			var data = $('js-chat_send_message_form').toQueryString() + '&wtf=' + chatHandler.wtf + '&key=' + window.location.href.substr(7);
			if (!chatHandler.loading) {
				chatHandler.sending = true;
				chatHandler.loading = true;
				ajaxLoadPost('/chatctl/', data, function (ajaxObj) {
					chatHandler.waitToSend = false;
					chatHandler.sending = false;
					chatHandler.loading = false;
					$('js-chat_send_message_holder').morph({'height':32});
					$('js-chat_input').removeClass('sending_message');
					$('js-chat_input').set({'readonly':''});
					$('js-chat_input').value = '';
					var response = ajaxHandler.checkResponse(ajaxObj);
					if (response) {
						chatHandler.draw(response);
					}
					chatHandler.loadingInterval = (function () {chatHandler.load()}).delay(10000);
				});
			} else {
				chatHandler.waitToSend = true;
				chatHandler.sending = false;
			}
		} else {
			
		}
	},
	answerName : function (button) {
		$('js-chat_input').value = button.innerHTML + ': ' + $('js-chat_input').value;
		$('js-chat_input').focus();
	}
};

/* index subs slider */
var indexSwitcherHandler = {
	current : 0,
	currentText : '',
	indexSwitcherInit : function (current) {
		if (!current || current == 0) {
			indexSwitcherHandler.current = 1;
			$('js-index_slider').getElement('.slider_scale_icon_2').addClass('active');
		} else if (current == 1) {
			indexSwitcherHandler.current = 0;
			$('js-index_slider').getElement('.slider_scale_icon_1').addClass('active');
		} else if (current == 2) {
			indexSwitcherHandler.current = 2;
			$('js-index_slider').getElement('.slider_scale_icon_3').addClass('active');
		}
		indexSwitcherHandler.setText(indexSwitcherHandler.current);
	},
	setText : function (current) {
		if (current == 1) {
			indexSwitcherHandler.currentText = 'заглавная и <a href="/underground/">подсайты</a>';
		} else if (current == 0) {
			indexSwitcherHandler.currentText = 'только заглавная';
		} else if (current == 2) {
			indexSwitcherHandler.currentText = 'только <a href="/underground/">подсайты</a>';
		}
		$('js-index_view_about').innerHTML = indexSwitcherHandler.currentText;
	},
	setView : function (pos) {
		if (indexSwitcherHandler.current != pos) {
			indexSwitcherHandler.current = pos;
			$('js-index_slider').getElement('.active').removeClass('active');
			if (pos == 1) {
				$('js-index_slider').getElement('.slider_scale_icon_2').addClass('active');
				$('js-showonindex').value = '0';
			} else if (pos == 2) {
				$('js-index_slider').getElement('.slider_scale_icon_3').addClass('active');
				$('js-showonindex').value = '2';
			} else if (pos == 0) {
				$('js-index_slider').getElement('.slider_scale_icon_1').addClass('active');
				$('js-showonindex').value = '1';
			}
			indexSwitcherHandler.setText(indexSwitcherHandler.current);
			$('posts-threshold').submit();
		}
	},
	overView : function (pos) {
		if (pos == 1) {
			$('js-index_view_about').innerHTML = 'заглавная и <a href="/underground/">подсайты</a>';
		} else if (pos == 2) {
			$('js-index_view_about').innerHTML = 'только <a href="/underground/">подсайты</a>';
		} else if (pos == 0) {
			$('js-index_view_about').innerHTML = 'только заглавная';
		}
	},
	outView : function () {
		$('js-index_view_about').innerHTML = indexSwitcherHandler.currentText;
	}
}


/* elections bets */
betsHandler = {
	validateForm : function () {
		if ($('js-bets_username').value.trim().length < 1) {
			ajaxHandler.highlightField($('js-bets_username'));
			return false;
		}
		if ($('js-bets_amount').value.trim().length < 1) {
			ajaxHandler.highlightField($('js-bets_amount'));
			return false;
		}
		return true;
	}
};

/* live */

liveHandler = {
	loading : false,
	paused : false,
	loadingInterval : null,
	drawingInterval : null,
	drawingIntervalDuration : 1000,
	loadingIntervalDuration : 1000,
	firstOpening : false,
	messagesArr : [],
	token : '',
	close : function () {
		$clear(liveHandler.loadingInterval);
		$clear(liveHandler.drawingInterval);
	},
	prepareDraw : function (response) {
		var messages = new Hash(response.live);
		for (var i = 0; i < messages.getLength(); i++){
			var message = messages.get(i);
		
			var target_link = '/';
			if (message.domain_url == '') { 
				target_link = '';
			} else {
				target_link += '/' + message.domain_url;
			}
			
			
			if (message.type == 0) {
				target_link += '/comments/' + message.postid + '/#' + message.id;
			} else {
				target_link += '/comments/' + message.id;
			}
			
		
			var newMessage = new Element('div', {'id':('p' + message.id), 'class':'post ord'});
			var iHTML = '<div>';
			iHTML += '<div class="dt">' + message.body + '</div>';
			iHTML += '<div class="dd">';
			iHTML += '<div class="p">';
			var female = (message.gender == '0') ? 'а' : '';
			iHTML += 'Написал' + female + ' ';
			if (message.type == 0) {
				iHTML += '<a href="' + target_link + '" target="_blank">комментарий</a>';
			} else {
				iHTML += '<a href="' + target_link + '" target="_blank">пост</a>';
			}
			if (message.user_rank != '') {
				iHTML += ' ' + message.user_rank + ' ';
			}
			iHTML += ' <a href="/users/' + message.login + '">' + message.login + '</a>';
			if (message.domain_url != '') { 
				iHTML += ' в <a href="http://' + message.domain_url + '">' + message.domain_url + '</a>'; 
			}
			iHTML += ' в ' + message.time;
			
			if (message.type == 0) {
				iHTML += ' <span>| <a class="reply_link" onclick="liveHandler.showCommentsForm(this, \'' + message.login + '\', \'' + message.postid + '\', \'' + message.id + '\'); return false;" href="">ответить</a></span>';
			} else {
				iHTML += ' <span>| <a class="reply_link" onclick="liveHandler.showCommentsForm(this, false, \'' + message.id + '\'); return false;" href="">ответить</a></span>';
			}
			iHTML += '</div>';
			iHTML += '</div>';
			iHTML += '</div>';
			newMessage.innerHTML = iHTML;
			liveHandler.messagesArr.push(newMessage);
			$('js-liveQueueNum').innerHTML = liveHandler.messagesArr.length;
		}
		if (liveHandler.firstOpening) {
			liveHandler.drawAll();
			liveHandler.firstOpening = false;
		}
	},
	init : function () {
		liveHandler.load();
		liveHandler.draw();
		liveHandler.scrollPause();
		liveHandler.pPause();
	},
	load : function () {
		if (!liveHandler.loading) {
			liveHandler.loading = true;
			if (liveHandler.token) {
				var data = 'token=' + liveHandler.token;
			} else {
				var data = '';
			}
			ajaxLoadPost('/livectl/', data, function (ajaxObj) {
				liveHandler.loading = false;
				var val = ajaxObj.responseText;
				//val = val.replace(/\\\\"/g,'\\"');
				//val = val.replace(/%/g,'\%');
				var response = ajaxHandler.checkResponse(val, true);
				if (response) {
					liveHandler.prepareDraw(response);
					if (response.token != '') {
						liveHandler.token = response.token;
					}
					if (response.rate != '') {
						$('js-comments_rate').innerHTML = response.rate;
					}
				}
				liveHandler.loadingInterval = (function () {liveHandler.load()}).delay(liveHandler.loadingIntervalDuration);
			});
		}
	},
	scrollPause : function () {
		window.addEvent('scroll', function () {
			if (!liveHandler.paused) {
				$clear(liveHandler.drawingInterval);
				liveHandler.drawingInterval = (function () {liveHandler.draw();}).delay(liveHandler.drawingIntervalDuration);
			}
		});
	},
	pPause : function () {
		document.addEvent('keydown', function (e) {
			var e = new Event(e);
			if (e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA') {
				if (e.code == 80) { 
					liveHandler.pause();
				}
			}
		});
	},
	draw : function (next_button) {
		$clear(liveHandler.drawingInterval);
		var newMessage = liveHandler.messagesArr.shift();
		$('js-liveQueueNum').innerHTML = liveHandler.messagesArr.length;
		if (newMessage) {
			$('js-templiveHolder').empty();
			newMessage.inject($('js-templiveHolder'));
			var messageHeight = newMessage.getSize().y;
			var post = newMessage.getElement('.dt');
			post.set('morph', {'duration':300, onComplete : function () {
				post.style.marginTop = 0;
				newMessage.style.overflow = 'visible';
			}});
			post.style.marginTop = - messageHeight + 'px';
			newMessage.style.overflow = 'hidden';
			newMessage.inject($('js-liveHolder'), 'top');
			post.morph({'margin-top':0});
			
		}
		if (!liveHandler.paused) {
			liveHandler.drawingInterval = (function () {liveHandler.draw()}).delay(liveHandler.drawingIntervalDuration);
		}
	},
	pause : function () {
		if (liveHandler.paused) {
			liveHandler.unPauseStupid();
		} else {
			liveHandler.pauseStupid();
		}
	},
	pauseStupid : function () {
		liveHandler.paused = true;
		$('js-live_pause_button').addClass('hidden');
		$('js-live_play_button').removeClass('hidden');
		$clear(liveHandler.drawingInterval);
	},
	unPauseStupid : function () {
		liveHandler.paused = false;
		$('js-live_pause_button').removeClass('hidden');
		$('js-live_play_button').addClass('hidden');
		liveHandler.draw();
	},
	changeSpeed : function (sec) {
		$clear(liveHandler.drawingInterval);
		liveHandler.drawingIntervalDuration = sec*1000;
		if (!liveHandler.paused) {
			liveHandler.drawingInterval = (function () {liveHandler.draw()}).delay(liveHandler.drawingIntervalDuration);
		}
		$('js-live_speed_text').innerHTML = sec + ' ' + liveHandler.getPluralSeconds(sec);
	},
	drawAll : function () {
		liveHandler.pauseStupid();
		
		for (var i = 0; i < liveHandler.messagesArr.length; i++){
			var newMessage = liveHandler.messagesArr[i];
			newMessage.inject($('js-liveHolder'), 'top');
		}
		$('js-liveQueueNum').innerHTML = '0';
		liveHandler.messagesArr = [];
	},
	getPluralSeconds : function (sec) {
		var texts = ['секунда', 'секунды', 'секунд'];
		var n = sec % 100;
		var n1 = sec % 10;
		if (n > 10 && n < 20) return texts[2];
		if (n1 > 1 && n1 < 5) return texts[1];
		if (n1 == 1) return texts[0];
		return texts[2];
	},
	showCommentsForm : function (button, login, post_id, comment_id) {
		if (!button.getParent('.dd').getElement('#reply_form')) {
			$('reply_form').inject(button.getParent('.dd'));
			$('reply_form').removeClass('hidden')
			if (comment_id) {
				$('replyto').value = comment_id;
			} else {
				$('replyto').value = '';
			}
			$('js-comments_form_post_id').value = post_id;
			
			if (login) {
				$('comment_textarea').value = login + ': ' + $('comment_textarea').value;
			}
			liveHandler.pauseStupid();
			$('comment_textarea').focus();
		} else {
			if ($('reply_form').hasClass('hidden')) {
				$('reply_form').removeClass('hidden')
				liveHandler.pauseStupid();
				$('comment_textarea').focus();
			} else {
				$('reply_form').addClass('hidden')
				liveHandler.unPauseStupid();
			}
		}
	},
	
	sendComment : function () {
		
		if ($('js-post-yarrr').hasClass('js-loading')) {
			return false;
		} else {
			$('js-post-yarrr').addClass('js-loading');
		}
		commentsHandler.prepareToSendCommentForm();
		
		if ($('js-post_pic_file').value.length > 0) {
			$('js-post_iframe_check').value = '1';
			$('comments-form').submit();
		} else {
			$('js-post_iframe_check').value = '0';
			var data = $('comments-form').toQueryString();
			ajaxLoadPost('/commctl/', data, function (ajaxObj) {
				$('js-post-yarrr').removeClass('js-loading');
				var val = ajaxObj.responseText;
				var response = ajaxHandler.checkResponse(val, true);
				if (response) {
					liveHandler.clearCommentForm();
					liveHandler.unPauseStupid();
				} else {
					commentsHandler.clearCommentFormAfterError();
				}
			});
		}
	},
	
	iframeOnload : function () {
		doc = window.frames['post_add_iframe'].document;
		$('js-post_pic_file').destroy();
		$('reply_form_pic_hide').getElement('p').innerHTML = '<input type="file" id="js-post_pic_file" name="file"/>';
		if (doc && doc.getElementById('comments')) {
			$('js-post-yarrr').removeClass('js-loading');
			var val = new String(doc.getElementById('comments').value);
			val = val.replace(/%/g,'\%');
			val = val.replace(/…/g,'\…');
			var response = ajaxHandler.checkResponse(val, true);
			if (response) {
				liveHandler.clearCommentForm();
				liveHandler.unPauseStupid();
			} else {
				commentsHandler.clearCommentFormAfterError();
			}
		}
	},
	
	clearCommentForm : function (){
		$('reply_form').getElement('.comments_form_loading').addClass('hidden');
		$('reply_form').addClass('hidden');
		$('comments-form').elements['i'].value = '0';
		$('comment_textarea').value = '';
		if ($('reply_link_default')) {
			$('reply_link_default').style.display = 'block';
		}
		$('comment_textarea').set({'readonly':''});
	}
	
};

/* user profile notes */
userProfileHandler = {
	userNotes : {
		wtf : '',
		init : function (user_id) {
			document.addEvent('click', function (e) {
				if ($('js-usernote').hasClass('js-note_adding')) {
					if (!$('js-usernote').hasClass('js-loading')) {
						var data = 'wtf=' + userProfileHandler.userNotes.wtf + '&user=' + user_id + '&note=' + $('js-usernote_input').value;
						$('js-usernote').addClass('js-loading');
						ajaxLoadPost('/usernotectl/', data, function (ajaxObj) {
							$('js-usernote').removeClass('js-loading');
							$('js-usernote').removeClass('js-note_adding');
							var response = ajaxHandler.checkResponse(ajaxObj);
							if (response) {
								if (response.note && response.note != '') {
									$('js-usernote_inner').innerHTML = response.note;
								} else {
									$('js-usernote_inner').innerHTML = 'Место для заметок. Заметки видны только Вам.';
								}
							} else {
								
							}
						});
					}
				}
			});
			$('js-usernote').addEvent('click', function (e) {
				e = new Event(e);
				e.stopPropagation();
				if (!$('js-usernote').hasClass('js-note_adding')) {
					$('js-usernote').addClass('js-note_adding');
					if ($('js-usernote_input')) {
						var text = $('js-usernote_input').value;
					} else {
						var text = $('js-usernote_inner').innerHTML;
						if (text == 'Место для заметок. Заметки видны только Вам.') {
							text = '';
						}
						$('js-usernote_inner').innerHTML = '<input type="text" class="usernote_input" value="" id="js-usernote_input" />';
					}
					
					$('js-usernote_inner').getElement('.usernote_input').value = text;
					$('js-usernote_input').addEvent('keydown', function (e) {
						e = new Event(e);
						if (e.key == 'enter') {
							if (!$('js-usernote').hasClass('js-loading')) {
								var data = 'wtf=' + userProfileHandler.userNotes.wtf + '&user=' + user_id + '&note=' + $('js-usernote_input').value;
								$('js-usernote').addClass('js-loading');
								ajaxLoadPost('/usernotectl/', data, function (ajaxObj) {
									$('js-usernote').removeClass('js-loading');
									$('js-usernote').removeClass('js-note_adding');
									var response = ajaxHandler.checkResponse(ajaxObj);
									if (response) {
										if (response.note && response.note != '') {
											$('js-usernote_inner').innerHTML = response.note;
										} else {
											$('js-usernote_inner').innerHTML = 'Место для заметок. Заметки видны только Вам.';
										}
									}
								});
							}
							
						} else if (e.key == 'esc') {
							if (text == '') {
								text = 'Место для заметок. Заметки видны только Вам.';
							}
							$('js-usernote_inner').innerHTML = text;
							$('js-usernote').removeClass('js-note_adding');
						}
					});
					$('js-usernote_input').focus();
				}
				
			});
		}
	}
}

/* pro account hiding posts */
hidePostsHandler = {
	wtf : '',
	init : function () {
		document.addEvent('click', function (e) {
			if (!$('js-pro_hide_post').hasClass('hidden')) {
				$('js-pro_hide_post').addClass('hidden');
			}
		});
	},
	hide : function (what, target_id, button, donthide, x_button) {
		var button = $(button);
		if (!button.hasClass('js-loading')) {
			button.addClass('js-loading');
			var data = 'wtf=' + hidePostsHandler.wtf + '&' + what + '=' + target_id;
			ajaxLoadPost('/hidectl/', data, function (ajaxObj) {
				button.removeClass('js-loading');
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					if (!donthide) {
						if (what == 'ignore') {
							$('content').getElements('.js-user_login').each(function (login) {
								if (login.getParent('.post').hasClass('u' + target_id)) {
									login.getParent('.post').addClass('hidden_post');
								}
							});
						} else {
							if ($('p' + target_id)) {
								$('p' + target_id).addClass('hidden_post');
							}
						}
					} else {
						if (what != 'unhide') {
							x_button.getParent('.pro_hide_post_button').innerHTML = 'пост убран';
							$('js-pro_hide_post').addClass('hidden');
						} else {
							button.getParent('.js-unhide_post_comments').addClass('hidden');
						}
					}
				}
			});
		}
	},
	show_block : function (e, button, post_id, author_id, donthide) {
		e = new Event(e);
		e.stopPropagation();
		var button = $(button);
		
		block_holder = button.getParent('.dd');
		
		if (block_holder.getElement('#js-pro_hide_post')) {
			if ($('js-pro_hide_post').hasClass('hidden')) {
				$('js-pro_hide_post').removeClass('hidden');
				$('js-pro_hide_post').style.left = button.getCoordinates(block_holder).left - 82 + 'px';

			} else {
				$('js-pro_hide_post').addClass('hidden');
			}
		} else {
			if ($('js-pro_hide_post').getElement('.js-pro_hide_post')) {
				$('js-pro_hide_post').getElement('.js-pro_hide_post').removeEvents('click');
				$('js-pro_hide_post').getElement('.js-pro_ignore_author').removeEvents('click');
			}
			$('js-pro_hide_post').inject(block_holder);
			$('js-pro_hide_post').removeClass('hidden');
			$('js-pro_hide_post').style.left = button.getCoordinates(block_holder).left - 82 + 'px';
			
			$('js-pro_hide_post').addEvent('click', function (e) {
				e = new Event(e);
				e.stopPropagation();
			});
			if ($('js-pro_hide_post').getElement('.js-pro_hide_post')) {
				$('js-pro_hide_post').getElement('.js-pro_hide_post').addEvent('click', function (e) {
					e = new Event(e);
					e.preventDefault();
					if (!donthide) {
						hidePostsHandler.hide('hide', post_id, this);
					} else {
						hidePostsHandler.hide('hide', post_id, this, true, button);
					}
				});
				$('js-pro_hide_post').getElement('.js-pro_ignore_author').addEvent('click', function (e) {
					e = new Event(e);
					e.preventDefault();
					if (!donthide) {
						hidePostsHandler.hide('ignore', author_id, this);
					} else {
						hidePostsHandler.hide('ignore', author_id, this, true, button);
					}
				});
			}
		}
	}
};


/* more posts */
morePostsHandler = {
	pro_account : false,
	from : false,
	load : function (button, tag) {
		button = $(button);
		if (!button.hasClass('js-loading')) {
			button.addClass('js-loading');
			button.getElement('span').innerHTML = 'Загружаем';
			if (!morePostsHandler.from) {
				morePostsHandler.from = $('js-posts_holder').getChildren('.post').length;
			}
			if (tag) {
				var data = 'from=' + morePostsHandler.from + '&tag=' + encodeURIComponent(tag);
			} else {
				var data = 'from=' + morePostsHandler.from;
			}
			ajaxLoadPost('/idxctl/', data, function (ajaxObj) {
				button.removeClass('js-loading');
				button.getElement('span').innerHTML = 'Ещё? Ещё!';
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					if (response.count == '0') {
						button.addClass('hidden');
					}
					
					if ($('paginator')) {
						$('paginator').addClass('hidden');
					}
					if ($('total_pages')) {
						$('total_pages').addClass('hidden');
					}
					
					morePostsHandler.from = Number(morePostsHandler.from) + Number(response.count);
					
					var hash_posts = new Hash(response.posts);
					
					for (var i = 0; i < hash_posts.getLength(); i++) {
						var data = hash_posts.get(i);
						if (!$('p' + data.id) && data.hidden_post == 'false') {
							var newPost = new Element('div', {
								'class' : 'post ord {show_stars} {hidden_post} u{user_id}'.substitute({
									'show_stars' : (data.show_stars != 'false') ? 'golden' : '',
									'hidden_post' : (data.hidden_post != 'false') ? 'hidden_post' : '',
									'user_id' : data.user_id
								}),
								'id' : 'p' + data.id
							});
							var iHTML = '<div class="dt">{body}</div>';
							iHTML += '<div class="dd">';
							iHTML += '<div class="p">';
							iHTML += 'Написал{gender} {rank} <a href="{parent_site}/users/{user_login}" class="js-user_login">{user_login}</a>{domain_url}, {post_date} в {post_time}';
							
							iHTML += ' <span>| <a href="{domain_url_comments}/comments/{post_id}">{comments_count}</a>';
							if (data.unread > 0) {
								iHTML += ' / <a href="{domain_url_comments}/comments/{post_id}#new"><strong>{new_comments} {new_comments_word}</strong></a>';
							}
							
							if (data.show_stars != 'false') {
								iHTML += '<span class="{starsclass}" title="{votes} {votes_word}, рейтинг - {stars_rating}%">&nbsp;</span>';
							}
							
							if (data.editable == '1') {
								iHTML += ' <span>| [<a href="#" onclick="javascript:openpostmodwin({post_id}); return false;">я - у руля!</a>]</span>';
							}
							
							if (morePostsHandler.pro_account) {
								iHTML += ' | <strong class="pro_hide_post_button"><a href="#" onclick="hidePostsHandler.show_block(event, this, \'{post_id}\', \'{user_id}\'); return false;" title="я не хочу это больше видеть">x</a></strong>';
							}
							
							iHTML += '</div>';
							
							if (response.oldschool != '1') {
								iHTML += '<div class="vote">';
								iHTML += '<div>';
								iHTML += '<span class="rating" onclick="kgbHandler.getInfo({type:\'post\', button:this, id:{post_id}});"><em>{rating}</em></span>';
								iHTML += '<a href="" onclick="return votePost(this);" class="plus {plus_voted}"><em>+</em></a>';
								iHTML += '<a href="" onclick="return votePost(this);" class="minus {minus_voted}"><em>&mdash;</em></a>';
								iHTML += '</div>';
								iHTML += '</div>';
							}
							
							iHTML += '</div>';
							
							var iHTML_sub = iHTML.substitute({
								'parent_site' : kgbHandler.parentSite,
								'post_id' : data.id,
								'body' : data.body,
								'gender' : (data.gender == '1') ? '' : 'а',
								'rank' : data.user_rank,
								'user_login' : data.login,
								'user_id' : data.user_id,
								'domain_url' : (data.domain_url != '') ? ' в <a href="http://{domain_url}" class="sub_domain_url">{domain_url}</a>'.substitute({'domain_url' : data.domain_url}) : '',
								'post_date' : data.textdate,
								'post_time' : data.posttime,
								'rating' : data.rating,
								'domain_url_comments' : (data.domain_url != '') ? 'http://{domain_url}'.substitute({'domain_url' : data.domain_url}) : '',
								'comments_count' : (data.comm_count != '0') ? '{comments_count} {comments_word}'.substitute({'comments_count' : data.comm_count, 'comments_word' : morePostsHandler.getPluralComments(data.comm_count)}) : 'комментировать',
								'new_comments' : data.unread,
								'new_comments_word' : morePostsHandler.getPluralNewComments(data.unread),
								'starsclass' : (data.was_gold != '0') ? 'stars' : 'wasstars',
								'votes' : data.votes,
								'votes_word' : morePostsHandler.getPluralVotes(data.votes),
								'stars_rating' : data.stars,
								'plus_voted' : (data.user_vote > 0) ? 'voted' : '',
								'minus_voted' : (data.user_vote < 0) ? 'voted' : ''
							});
							newPost.innerHTML = iHTML_sub;
							newPost.inject('js-posts_holder');
						}
					}
				}
			});
		}
	},
	
	getPluralComments : function (sec) {
		var texts = ['комментарий', 'комментария', 'комментариев'];
		var n = sec % 100;
		var n1 = sec % 10;
		if (n > 10 && n < 20) return texts[2];
		if (n1 > 1 && n1 < 5) return texts[1];
		if (n1 == 1) return texts[0];
		return texts[2];
	},
	
	getPluralNewComments : function (sec) {
		var texts = ['новый', 'новых', 'новых'];
		var n = sec % 100;
		var n1 = sec % 10;
		if (n > 10 && n < 20) return texts[2];
		if (n1 > 1 && n1 < 5) return texts[1];
		if (n1 == 1) return texts[0];
		return texts[2];
	},
	
	getPluralVotes : function (sec) {
		var texts = ['голос', 'голоса', 'голосов'];
		var n = sec % 100;
		var n1 = sec % 10;
		if (n > 10 && n < 20) return texts[2];
		if (n1 > 1 && n1 < 5) return texts[1];
		if (n1 == 1) return texts[0];
		return texts[2];
	},
	
	hover_button : function (button) {
		var button = $(button);
		button.addClass('load_more_posts_hover');
	},
	
	unhover_button : function (button) {
		var button = $(button);
		button.removeClass('load_more_posts_hover');
	}
	
};


/* global domready */

window.addEvent('domready', function() {
	var newSafari4 = false;
	if (Browser.Engine.webkit) {
		if (navigator.appVersion.indexOf('526') > 0) {
			newSafari4 = true;
		}
	}
	if (!newSafari4) {
		animatePosts.run();
	}
	empireBlogsHandler.run();
	if ($('chat')) {
		document.addEvent('keydown', function (e) {
			e = new Event(e);
			//if ((e.control || e.metaKey) && (e.code == 192 || e.code == 221)) {
			if ((e.control || e.metaKey) && (e.code == 192)) {
				if (chatHandler.opened) {
					chatHandler.close();
				} else {
					chatHandler.open();
				}
			}
		});
	}
});
window.addEvent('load', function() {
	animatePosts.loaded = true;
});

