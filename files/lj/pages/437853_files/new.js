/* AJAX handlers */
ajaxHandler = {
	alertError : function (message) {
		if (message && message != '') {
			showGenericWarning('<p>&mdash; ' + message + '</p>');
		} else {
			showGenericWarning('<p>&mdash; Ошибка без названия.</p>');
		}
	},
	checkResponse : function (ajaxObj) {
		var response = JSON.decode(ajaxObj.responseText);
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
			return response;
		} else {
			ajaxHandler.alertError('Сервер не сообщил об ошибке, но и не подтвердил, что всё прошло хорошо.');
			return response;
		}
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
	fav : function (what, id, button) {
		if (id < 1) return;
		if ($(button).hasClass('js-loading')) return false;
		button.addClass('js-loading');
		
		var data = what + '=' + id + '&wtf=' + mythingsHandler.wtf;
		
		ajaxLoadPost('/myctl', data, function (ajaxObj) {
			var response = ajaxHandler.checkResponse(ajaxObj);
			if (response) {
				if (what == 'add') {
					var favs_button_slash = $(button).getParent().getParent().getElement('.js-addToFavsSlash') || null;
					if (favs_button_slash && favs_button_slash.innerHTML == '/') {
						favs_button_slash.innerHTML = '|';
					}
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


/* Inbox handlers */
inboxHandler = {
	wtf : '',
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
							iHTMLnewPers += '&nbsp;<a href="/users/'+response.added[i].uid+'" class="js-inboxPerson-name"><span><i>'+response.added[i].login+'</i></span></a>&nbsp;';
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
		
	}
};

/* Comments handlers */
commentsHandler = {
	wtf : '',
	refresh : function (text_json) {
		oj = JSON.decode(text_json);
		
		if (oj.comments) {
			var comments = oj.comments;
			var firstNewComment = false;
			$H(comments).each(function (data, key) {
				if (!$(data.comment_id)) {
					
					var shrinked = (data.shrinked == 'true') ? 'shrinked' : '';
					var new_comment = (data.new_comment == 'true') ? 'new' : '';
					var mine = (data.mine == 'true') ? 'mine': '';
					
					if (!firstNewComment && data.new_comment) {
						var new_comment_anchor = new Element('a', {'name':'new'});
					}
					
					var comment_div = new Element('div', {
						'class':"post tree indent_{indent} {shrinked} {new_comment} {mine} u{user}".substitute({indent:data.reply_offset, user:data.user_id, shrinked:shrinked, new_comment:new_comment, mine:mine}),
						'id':data.comment_id 
					});
					
					
					var comment_text_div = new Element('div', {'class':'dt'});
					comment_text_div.innerHTML = '<table style="width:100%; border:none;"><tbody><tr><td style="width:50%; vertical-align:top;padding:10px;">'+data.body+'</td><td style="width:50%;padding:10px;"><textarea style="width:90%; height:100px;">'+data.body+'</textarea></td></tr></tbody></table>';
					
					var comment_other_div = new Element('div', {'class':'dd'});
					
					var iHTML = '<div class="p">';
					var exceedLimitHTML = (data._exceedlimit == 'false') ? 'onclick="return commentIt(event, this, \''+data.user_login+'\');"' : '';
					var gender = (data.gender == 'f') ? 'а' : ''
					iHTML += '<span><a class="login" href="/comments/{post_id}#{comment_id}" {exceedLimitHTML}>&nbsp;</a></span> '.substitute({post_id:oj.id, comment_id:data.comment_id, exceedLimitHTML:exceedLimitHTML});
					iHTML += 'Написал{gender} <a href="/users/{user_id}">{user_login}</a>, {date} в {time} '.substitute({gender:gender, user_id:data.user_id, user_login:data.user_login, date:data.date, time:data.time});
					iHTML += (data._exceedlimit == 'false') ? '<span>| <a href="" onclick="return commentIt(event, this, \'{user_login}\';);" class="reply_link">ответить</a></span> '.substitute({user_login:data.user_login}) : '';
					iHTML += '<a href="" class="show_link" onclick="return noShrink(this);">что он{gender} написал{gender}?</a> '.substitute({gender:gender});
					iHTML += (data.replyto_id != 'false') ? '<a href="#{replyto_id}" class="show_parent" replyto="{replyto_id}" onclick="return showParent(this);">&uarr;</a> '.substitute({replyto_id:data.replyto_id}) : '';
					iHTML += (data.president == 'true') ? '<a href="" class="u" onclick="return allUserPosts(\'u{user_id}\');">.</a>'.substitute({user_id:data.user_id}) : '';
					iHTML += '</div>';
					iHTML += '<div class="vote" onmouseout="hideChoice(event, this);">';
					iHTML += '<div>';
					
					if (data.vote_enabled) {
						var positive_voted = (data.voted > 0) ? ' voted' : '';
						var negative_voted = (data.voted < 0) ? ' voted' : '';
						iHTML += '<span onmouseover="showChoice(this);" class="rating"><em>{rating}</em></span>'.substitute({rating:data.rating});
						iHTML += '<a href="#" onclick="return vote(this);" class="plus{positive_voted}"><em>+</em></a>'.substitute({positive_voted:positive_voted});
						iHTML += '<a href="#" onclick="return vote(this);" class="minus{negative_voted}"><em>&mdash;</em></a>'.substitute({negative_voted:negative_voted});
					}
					
					
					iHTML += '</div>';
					iHTML += '</div>';
					comment_other_div.innerHTML = iHTML;
					
					comment_text_div.inject(comment_div);
					comment_other_div.inject(comment_div);
					
					if ($(data.prev_comment_id)) {
						comment_div.inject($(data.prev_comment_id), 'after');
					} else {
						comment_div.inject($('js-commentsHolder'));
					}
				}
			});
		}
		

	}
	
};

/* kgb handler */

kgbHandler = {
	wtf : '',
	activePage : 0,
	plusArray: {0:[]},
	minusArray: {0:[]},
	overallPages : 1,
	button : null,
	closeDiv : function() {
		$('kgb').setStyle('display','none');
		$(kgbHandler.button).removeClass('js-kgb');
	},
	getInfo : function (params) {
		if ($('kgb')) {
			if ($(params.button).hasClass('js-kgb')) {
				kgbHandler.closeDiv();
				return false;
			}
			if ($(params.button).hasClass('js-kgb_loading')) {
				return false;
			}
			kgbHandler.button = params.button;
			$(params.button).addClass('js-kgb_loading');
			var data = 'view=' + params.id;
			ajaxLoadPost('/karmactl', data, function (ajaxObj) {
				$(params.button).removeClass('js-kgb_loading');
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					$('kgb').getElement('.kgb_header').innerHTML = 'Карма, так привлекшая ваше внимание, в данный момент <em>'+response.karma+'</em>';
					var minusArray = {0:[]};
					var plusArray = {0:[]};
					var minusPage = 0;
					var plusPage = 0;
					
					$A(response.votes).each(function (person) {
						if (person.attitude >= 0) {
							if (plusArray[plusPage].length == 20) {
								plusPage++;
								plusArray[plusPage] = [];
							}
							plusArray[plusPage].push(person);
						} else {
							if (minusArray[minusPage].length == 20) {
								minusPage++;
								minusArray[minusPage] = [];
							}
							minusArray[minusPage].push(person);
						}
					});
					
					kgbHandler.plusArray = plusArray;
					kgbHandler.minusArray = minusArray;
					
					var minusCol = minusPage*20 + minusArray[minusPage].length;
					var plusCol = plusPage*20 + plusArray[plusPage].length;
					
					if (plusPage >= minusPage) {
						var overallPages = plusPage + 1;
					} else {
						var overallPages = minusPage + 1;
					}
					
					kgbHandler.overallPages = overallPages;
					
					kgbHandler.activePage = 0;
					
					if (plusPage < 1 && minusPage < 1) {
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
					
					var iHTMLplus = '<ul class="kgb_users">';
					iHTMLplus += kgbHandler.createUsersLi(plusArray[0]);
					iHTMLplus+='</ul>';
					
					var iHTMLminus = '<ul class="kgb_users">';
					iHTMLminus += kgbHandler.createUsersLi(minusArray[0]);
					iHTMLminus+='</ul>';
					
					if (plusCol == 0) {
						iHTMLplus4 = '';
					}
					iHTMLplus = '<h4>плюсов &#151; '+ plusCol +'</h4>' + iHTMLplus;
					
					iHTMLminus = '<h4>минусов &#151; '+ minusCol +'</h4>' + iHTMLminus;
					
					if (plusCol == 0 && minusCol == 0) {
						iHTMLplus = 'никто не нажимал эти веселенькие плюсики и минусики';
						iHTMLminus = '';
					}
					
					$('kgb').getElement('.kgb_plus_users').innerHTML = iHTMLplus;
					$('kgb').getElement('.kgb_minus_users').innerHTML = iHTMLminus;
					
					$(params.button).addClass('js-kgb');
					
					$('kgb').set('styles', {
						'display':'block',
						'position':'absolute',
						'top':$('usernick').getCoordinates().top + $(params.button).getCoordinates().height + 'px',
						'left':'100px'
					});
					
					if (params.type == 'karma') {
						$('kgb').getElement('.kgb_arrow_bubble_top').setStyle('display', 'block');
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
			
			$('kgb').getElement('.kgb_paginator .active').removeClass('active');
			$('kgb').getElements('.kgb_paginator a')[num].addClass('active');
			
			
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
		var kgbEl = new Element('div', {'id':'kgb',	'style':'display:none;'	});
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
			iHTML += '<a href="/users/'+person.uid+'">'+person.login+'</a> ';
			iHTML += '<span>('+person.attitude+')</span>';
			iHTML += '</li>';
		});
		return iHTML;
	}
};