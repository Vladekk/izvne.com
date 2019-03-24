fraudHandler = {
	putMoney : {
		countLV : function () {
			if ($type(Number($('js-fraud_money').value)) == 'number') {
				if (Number($('js-fraud_money').value) > 0) {
					$('js-fraud_money_counted').value = $('js-fraud_money').value*ers[$('js-fraud_currency').value];
					$('js-fraud_money_error').addClass('hidden');
					return true;
				} else {
					$('js-fraud_money_error').removeClass('hidden');
					return false;
				}
				
			} else {
				fraudHandler.putMoney.errorInType();
				return false;
			}
		},
		sendMoney : function () {
			if (fraudHandler.putMoney.countLV()) {
				$('js-LMI_PAYEE_PURSE').value = $('js-fraud_currency').value;
				$('js-LMI_PAYMENT_AMOUNT').value = $('js-fraud_money_counted').value;
				$('js-fraud_money_form').submit();
			}
		},
		errorInType : function () {
			$('js-fraud_money_error').removeClass('hidden');
		},
		checkCol : function (obj) {
			if (Number($(obj).value) > 0) {
				return true;
			} else {
				return false;
			}
		},
		sendForm : function () {
			if (!fraudHandler.putMoney.checkCol('js-refuel_col')) {
				$('js-refuel_col').set('morph', {duration:333});
				$('js-refuel_col').style.backgroundColor = '#FF0000';
				$('js-refuel_col').morph({'background-color':'#F6EFD2'});
				return false;
			}
			if ($('refuel_moneymail')) {
				if ($('js-moneymail_mail')) {
					if ($('refuel_moneymail').checked) {
						if ($('refuel_moneymail').checked) {
							if ($('js-moneymail_mail').getElement('input').value.length < 1) {
								var moneymail_mail = $('js-moneymail_mail').getElement('input');
								moneymail_mail.set('morph', {duration:333});
								moneymail_mail.style.backgroundColor = '#FF0000';
								moneymail_mail.morph({'background-color':'#F6EFD2'});
								return false;
							}
						}
					}
				}
			}
			$('js-fraud_money_form').submit();
		},
		paySystem : function (sys_name, refuel_col_name, form_action) {
			var form = $('js-refuel_systems_form');
			var hidden = $('js-refuel_systems');
			
			form.getElements('.js-refuel_systems_hidden').inject(hidden);
			if ($('js-'+ sys_name +'_hidden')) {
				$('js-'+ sys_name +'_hidden').inject(form);
			}
			if (refuel_col_name) {
				$('js-refuel_col').name = refuel_col_name;
			}
			if (form_action) {
				$('js-fraud_money_form').action = form_action;
			}
		}
	},
	
	greetings : {
		editGreeting : function (button) {
			var parent = $(button).getParent('.js-greeting');
			$(button).addClass('hidden');
			parent.getElement('.js-edit_greeting').removeClass('hidden');
			parent.getElement('textarea').focus();
		}
	},
	
	username : {
		checkForm : function () {
			if ($('js-fraud_new_username').value.length < 1 || $('js-fraud_new_username').value.length > 16 || !$('js-fraud_new_username').value.test(/^[0-9a-zA-Z][0-9a-zA-Z-_]*$/)) {
				$('js-fraud_new_username').set('morph', {duration:333});
				$('js-fraud_new_username').style.backgroundColor = '#FF0000';
				$('js-fraud_new_username').morph({'background-color':'#F6EFD2'});
				return false;
			} else {
				return true;
			}
		}
	}
};

fraudWords = {
	autoSlider : false, 
	initSlider : function (nums) {
		$('fraud_words_days_slider').style.width = 37*nums + 12 + 'px';
		$('fraud_words_days_slider').getElement('.slider_scale_line').style.width = 37*nums + 1 + 'px';
		if (nums == 6) {
			$('fraud_words_days_slider').getElements('.slider_captions td').set('styles', {'width': '12%'});
		}
		if (nums == 5) {
			$('fraud_words_days_slider').getElements('.slider_captions td').set('styles', {'width': '14%'});
		}
		if (nums == 4) {
			$('fraud_words_days_slider').getElements('.slider_captions td').set('styles', {'width': '14%'});
		}
		var fraud_words_slider = new Slider('fraud_words_days_slider', 'fraud_words_days_slider_knob', {
			range : [0,nums],
			snap: false,
			onTick: function(pos){
				fraud_words_slider.drag.element.style.left = fraud_words_slider.step * 37 + 'px'
			},
			onChange : function (pos) {
				if (fraudWords.autoSlider) {
					fraud_words_slider.drag.element.style.left = pos * 37 + 'px';
					fraudWords.autoSlider = false;
				}
				
				if ($('js-fraud_words_days_text')) {
					$('js-fraud_words_days_text').innerHTML = fwt[pos].text;
				}
				textomateCurrentPrice = fwt[pos].price;
				
				if ($('js-textomateHours')) {
					$('js-textomateHours').value = fwt[pos].hours;
				}
				if (fwt[pos].enough) {
					$('js-fraud_words_not_enough_money').addClass('hidden');
					$('js-fraud_words_not_enough_money').addClass('hidden');
				} else {
					$('js-fraud_words_not_enough_money').removeClass('hidden');
				}
			}
		});

		fraud_words_slider.drag.addEvent('drag', function () {
			for (var i = 0, l = nums; i <= l; i++) {
				var now = fraud_words_slider.drag.value.now[fraud_words_slider.axis];
				var nnow = i * 37;
				if (((now + 10) >= nnow) && ((now - 10) <= nnow)) {
					fraud_words_slider.drag.element.style.left = i * 37 + 'px'
				}
			}
			
		});
		fraud_words_slider.drag.addEvent('complete', function () {
			fraud_words_slider.drag.element.style.left = fraud_words_slider.step * 37 + 'px'
		});
	},
	
	checkForm : function () {
		if ($('js-textomateHours').value*textomatePrice > textomatePrice) {
			textomateCurrentPrice = textomatePrice*Math.ceil($('js-textomateHours').value);
		} else {
			textomateCurrentPrice = textomatePrice;
		}
		if ($('js-textomate_target').value.length < 5) {
			$('js-textomate_target').set('morph', {duration:333});
			$('js-textomate_target').style.backgroundColor = '#FF0000';
			$('js-textomate_target').morph({'background-color':'#FFFFFF'});
			return false;
		}
		if ($('js-textomate_body').value.length < 1 || $('js-textomate_body').value.length > $('js-textomate_target').value.length*3) {
			$('js-textomate_body').set('morph', {duration:333});
			$('js-textomate_body').style.backgroundColor = '#FF0000';
			$('js-textomate_body').morph({'background-color':'#FFFFFF'});
			return false;
		}
		if ($('js-fraud_words_not_enough_money')) {
			if (!$('js-fraud_words_not_enough_money').hasClass('hidden')) {
				return false;
			}
		}
		return true;
	}
};

fraudTimer = {
	secsLeft : -1,
	secsDelta : -1,
	active : false,
	startTimer : function (secsLeft) {
		fraudTimer.secsLeft = secsLeft;
		fraudTimer.active = true;
		fraudTimer.countTime(secsLeft);
		
	},
	countTime : function (secsLeft) {
		if (secsLeft < 0) {
			$('textomateTimeLeft').innerHTML = 'Замены больше не работают.';
			return;
		}
		$('textomateTimeLeft').innerHTML = fraudTimer.calc(secsLeft,3600,100) + ':' + fraudTimer.calc(secsLeft,60,60) + ':' + fraudTimer.calc(secsLeft,1,60);
		if (fraudTimer.active) {
			setTimeout("fraudTimer.countTime(" + (secsLeft + fraudTimer.secsDelta) + ")", 990);
		}
	},
	calc : function (secs, num1, num2) {
		s = ((Math.floor(secs/num1))%num2).toString();
		if (s.length < 2) {
			s = '0' + s;
		}
		return s;
	}


};

pandaHandler = {
	toggleAddTagForm : function () {
		if ($('js-fraud_words_add_form').hasClass('js-panda_prolong_form_active')) {
			$('js-fraud_words_add_form').removeClass('pos_hidden'); 
			$('js-fraud_words_add_form').removeClass('js-panda_prolong_form_active');
			$('js-panda_form_menu').removeClass('hidden');
			$('js-panda_preview_price_holder').removeClass('hidden');
			pandaHandler.setMenu('pic');
			$('js-panda_body_pic').value = '';
			$('js-panda_body_line').value = '';
			$('js-panda_body_text').value = '';
			$('js-panda_extend_tag_id').value = '';
			$('js-panda_target').value = '';
			$('js-panda_body_text').set({'readonly':''});
			$('js-panda_target').set({'readonly':''});
			$('js-panda_duration_holder').inject($('js-panda_add_data_holder'));
			$('js-panda_form_holder').removeClass('hidden');
			$('js-fraud_words_add_form').style.top = '100px';
			pandaHandler.activeProlongButton = false;
		} else {
			$('js-fraud_words_add_form').toggleClass('pos_hidden'); 
		}
	},
	closeAddForm : function () {
		pandaHandler.activeProlongButton = false;
		$('js-fraud_words_add_form').addClass('pos_hidden'); 
	},
	setMenu : function (menu_type) {
		$('js-panda_preview').addClass('hidden');
		$('js-panda_error').addClass('hidden');
		$('js-panda_form').className = 'panda_form_'+menu_type;
		if (menu_type == 'pic') {
			$('js-panda_body_line').inject('js-panda_not_used_inputs');
			$('js-panda_body_text').inject('js-panda_not_used_inputs');
			$('js-panda_body_pic_holder').inject('js-panda_used_inputs');
			$('js-panda_body_pic_holder').getElement('.description').addClass('hidden');
		}
		if (menu_type == 'line') {
			$('js-panda_body_line').inject('js-panda_used_inputs');
			$('js-panda_body_text').inject('js-panda_not_used_inputs');
			$('js-panda_body_pic_holder').inject('js-panda_not_used_inputs');
		}
		if (menu_type == 'text') {
			$('js-panda_body_line').inject('js-panda_not_used_inputs');
			$('js-panda_body_text').inject('js-panda_used_inputs');
			$('js-panda_body_pic_holder').inject('js-panda_used_inputs');
			$('js-panda_body_pic_holder').getElement('.description').removeClass('hidden');
		}
	},
	validateForm : function () {
		var inputs = $$('#js-panda_form input, #js-panda_form textarea');
		var its_ok = true;
		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].id == 'js-panda_target') {
				if (!inputs[i].value.test('[a-zA-Z][a-zA-Z0-9_-]+')) {
					$(inputs[i]).set('morph', {duration:333});
					$(inputs[i]).style.backgroundColor = '#FF0000';
					$(inputs[i]).morph({'background-color':'#FFFFFF'});
					return false;
				}
			}
			if (inputs[i].id == 'js-panda_body_pic' && $('js-panda_form').hasClass('panda_form_pic')) {
				if (inputs[i].value.length < 1) {
					var par = $(inputs[i]).getParent('.panda_form_body');
					$(par).set('morph', {duration:333});
					$(par).style.backgroundColor = '#FF0000';
					$(par).morph({'background-color':'#FFFFFF'});
					return false;
				}
			}
			if (inputs[i].id == 'js-panda_body_line') {
				if (inputs[i].value.length < 1) {
					$(inputs[i]).set('morph', {duration:333});
					$(inputs[i]).style.backgroundColor = '#FF0000';
					$(inputs[i]).morph({'background-color':'#FFFFFF'});
					return false;
				}
			}
			if (inputs[i].id == 'js-panda_body_text') {
				if (inputs[i].value.length < 1) {
					$(inputs[i]).set('morph', {duration:333});
					$(inputs[i]).style.backgroundColor = '#FF0000';
					$(inputs[i]).morph({'background-color':'#FFFFFF'});
					return false;
				}
			}
		}
		$('js-panda_error').addClass('hidden');
		return true;
	},
	previewLoaded : function(ifr) {
		doc = window.frames['panda_add_tag_iframe'].document;
		if (doc.getElementById('preview')) {
			$('js-panda_preview').removeClass('hidden');
			$('js-panda_error').addClass('hidden');
			$('js-panda_preview_body').innerHTML = doc.getElementById('preview').innerHTML;
			$('js-panda_preview_target').innerHTML = doc.getElementById('preview_tag').innerHTML;
			$('js-panda_preview_price').innerHTML = doc.getElementById('price').innerHTML;
		}
		if (doc.getElementById('error')) {
			$('js-panda_preview').addClass('hidden');
			$('js-panda_error').removeClass('hidden');
			$('js-panda_error').innerHTML =  doc.getElementById('error').innerHTML;
		}
	},
	previewSubmitPrepare : function () {
		$('js-panda_form').target = 'panda_add_tag_iframe';
		$('js-panda_form').action = '/fraud/panda/preview/';
	},
	sendTag : function() {
		$('js-panda_form').target = '_self';
		$('js-panda_form').action = '/fraud/panda/add/';
		$('js-panda_duration_holder').inject($('js-panda_add_data_holder'));
		if ($('js-panda_duration').value*10 == 0) {
			var price = 10;
		} else {
			var price = $('js-panda_duration').value*10;
		}
		Charley.ask({
			form:$('js-panda_form'),
			text:'Вы хотите потратить на теги&nbsp;' + price + '&nbsp;ЛВ.',
			yes:'- Да, Пожалуйста!',
			no:'Вы знаете, я передумал',
			password:true
		});
	},
	activeProlongButton : false,
	prolongTag : function (button, tagId) {
		button = $(button);
		if (pandaHandler.activeProlongButton != button) {
			pandaHandler.activeProlongButton = button;
			$('js-fraud_words_add_form').addClass('pos_hidden');
			
			var holder = $(button).getParent('.fraud_one_word_holder');
			var target = holder.getElement('.panda_one_word_target').innerHTML;
			var body = holder.getElement('.panda_one_tag_real_body').value;
			$('js-panda_error').addClass('hidden');
			
			$('js-fraud_words_add_form').addClass('js-panda_prolong_form_active');
			
			$('js-panda_form_menu').addClass('hidden');
			pandaHandler.setMenu('text');
			$('js-panda_body_pic_holder').inject('js-panda_not_used_inputs');
			$('js-panda_body_pic').value = '';
			$('js-panda_body_text').value = body;
			$('js-panda_target').value = target;
			$('js-panda_extend_tag_id').value = tagId;
			$('js-panda_duration_holder').inject($('js-panda_preview_price_holder'), 'after');
			$('js-panda_form_holder').addClass('hidden');
			
			$('js-panda_body_text').set({'readonly':'readonly'});
			$('js-panda_target').set({'readonly':'readonly'});
			
			$('js-panda_preview').removeClass('hidden');
			$('js-panda_preview_body').innerHTML = body;
			$('js-panda_preview_target').innerHTML = target;
			
			$('js-panda_preview_price_holder').addClass('hidden');
			var y1 = button.getPosition().y - window.getScroll().y;
			var y2 = window.getSize().y - y1 - button.getSize().y;
			var win_height = $('js-fraud_words_add_form').getSize().y;
			if (y1 <= y2) {
				var putToBottom = true;
			} else {
				var putToBottom = false;
			}
			if (!putToBottom) {
				if (button.getPosition().y <= win_height) {
					putToBottom = true;
				}
			}
			if (putToBottom) {
				var delta = 120;
				if ((Browser.Engine.trident && Browser.Engine.version < 5) || Browser.Engine.webkit) {
					var delta = 130;
				}
				$('js-fraud_words_add_form').style.top = button.getPosition().y + button.getSize().y - delta + 'px';
			} else {
				var delta = 140;
				if ((Browser.Engine.trident && Browser.Engine.version < 5) || Browser.Engine.webkit) {
					var delta = 150;
				}
				$('js-fraud_words_add_form').style.top = button.getPosition().y - win_height - delta + 'px';
			}
			$('js-fraud_words_add_form').removeClass('pos_hidden');
		} else {
			pandaHandler.activeProlongButton = false;
			$('js-fraud_words_add_form').addClass('pos_hidden');
		}
		
		
	}
};

/* ranks */
ranksHandler = {
	wtf : '',
	sendRank : function (my_username) {
		if (ranksHandler.checkRank()) {
			if (my_username == $('js-ranks_input_username').value) {
				var text = 'Вы хотите приобрести себе звание &laquo;'+ $('js-ranks_input_rank').value +'&raquo; за ' + $('js-ranks_input_value').value + '&nbsp;ЛВ?'
			} else {
				var text = 'Вы хотите приобрести пользователю ' + $('js-ranks_input_username').value + ' звание &laquo;'+ $('js-ranks_input_rank').value +'&raquo; за ' + $('js-ranks_input_value').value + '&nbsp;ЛВ?'
			}
			Charley.ask({
				text:text,
				yes:'- Да, Пожалуйста!',
				no:'Вы знаете, я передумал',
				password:true,
				onYes:function () {
					ranksHandler.sendRankAjax(my_username);
				}
			});
			
		}
	},
	sendRankAjax : function (my_username) {
		if (!$('js-ranks_add_form').hasClass('js-loading')) {
			$('js-ranks_add_form').addClass('js-loading');
			var data = $('js-ranks_add_form').toQueryString() + '&password=' + encodeURIComponent($('charley_holder').getElement('.password').value) + '&wtf=' + ranksHandler.wtf;
			var rank = $('js-ranks_input_rank').value;
			Charley.close();
			ajaxLoadPost('/ranksctl/', data, function (ajaxObj) {
				$('js-ranks_add_form').removeClass('js-loading');
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					if (response.minimal_value) {
						var iHTML = 'Должность &laquo;' + $('js-ranks_input_rank').value + '&raquo; уже занята пользователем <a href="/users/'+ response.user_login +'">'+ response.user_login +'</a>, вы можете <span class="js-ranks_new_price_holder"><a href="#" onclick="ranksHandler.rebuyRank(this, \'' + rank + '\', \'' + response.minimal_value + '\', \'' + $('js-ranks_input_username').value + '\', \'' + response.user_login + '\', \'' + my_username+ '\'); return false;">перекупить ее</a> за '+ response.minimal_value +'&nbsp;ЛВ</span>';
						$('js-ranks_error_message').removeClass('hidden');
						$('js-ranks_error_message').innerHTML = iHTML;
					} else {
						if (response.created) {
						
							// table
							var iHTML = '<table><tbody><tr class="ranks_table_stat_my">';
							iHTML += 		'<td class="ranks_table_rank">' + response.created.rank + '</td>';
							iHTML += 		'<td class="ranks_table_username"><a href="/users/' + response.created.user_login + '/">' + response.created.user_login + '</a></td>';
							
							if (response.created.deals < 1) {
								iHTML += '<td class="ranks_table_history">с&nbsp;' + response.created.createdate + '</td>';
							} else {
								iHTML += '<td class="ranks_table_history">с&nbsp;' + response.created.createdate + '&nbsp;перекупалась ' + response.created.deals + '&nbsp;раз' + response.created.deals_end + '</td>';
							}
							
							iHTML += 		'<td class="ranks_table_price">' + response.created.value + '&nbsp;ЛВ</td>';
							
							iHTML += '</tr></tbody></table>';
							
							$('js-temp_stat_table').innerHTML = iHTML;
							
							var new_tr = $('js-temp_stat_table').getElement('tr');
							new_tr.inject($('ranks_table_stats').getElement('tr'), 'after');
							if ($('js-ranks_table_stat_' + response.created.id)) {
								$('js-ranks_table_stat_' + response.created.id).destroy();
							}
							new_tr.id = 'js-ranks_table_stat_' + response.created.id;
							
							// current
							
							if (my_username == response.created.user_login) {
								$('js-ranks_current').innerHTML = 'Ваша нынешняя должность&nbsp;&#8212; <strong class="rank_current_name">' + response.created.rank + '&nbsp;<a href="/users/' + my_username + '/">' + my_username + '</a></strong>, <a href="#" class="ranks_go_away" onclick="ranksHandler.fire(\'' + response.created.rank + '\'); return false;">уволиться</a>?';
							}
							
							$('js-ranks_error_message').addClass('hidden');
							$('js-ranks_error_message').innerHTML = '';
						}
					}
				}
			});
		}
	},
	checkRank : function () {
		if ($('js-ranks_input_rank').value.length < 1 || $('js-ranks_input_rank').value.length > 16) {
			ajaxHandler.highlightField ($('js-ranks_input_rank'), '#F6EFD2');
			return false;
		}
		if ($('js-ranks_input_username').value.length < 1) {
			ajaxHandler.highlightField ($('js-ranks_input_username'), '#F6EFD2');
			return false;
		}
		if ($('js-ranks_input_value').value < 10) {
			ajaxHandler.highlightField ($('js-ranks_input_value'), '#F6EFD2');
			return false;
		}
		return true;
	},		
	rebuyRank : function (button, rank, price, username, from_username, my_username) {
		
		var new_price_holder = $(button).getParent('.js-ranks_new_price_holder');
		if (new_price_holder.hasClass('js-ranks_new_price_holder_table')) {
			new_price_holder.innerHTML = '<input type="text" value="' + price + '">&nbsp;ЛВ';
		} else {
			new_price_holder.innerHTML = 'перекупить ее за <input type="text" value="' + price + '">&nbsp;ЛВ';
		}
		
		var price_input = new_price_holder.getElement('input');
		price_input.addEvent('keydown', function (e) {
			e = new Event(e);
			if (e.key == 'enter') {
				if (my_username == username) {
					var text = 'Вы хотите перекупить звание &laquo;'+ rank +'&raquo; у ' + from_username + ' за ' + price_input.value + '&nbsp;ЛВ?'
				} else {
					var text = 'Вы хотите перекупить звание &laquo;'+ rank +'&raquo; у ' + from_username + ' для ' + username + ' за ' + price_input.value + '&nbsp;ЛВ?'
				}
				Charley.ask({
					text:text,
					yes:'- Да, Пожалуйста!',
					no:'Вы знаете, я передумал',
					password:true,
					onYes:function () {
						ranksHandler.sendRebuyRankAjax(rank, price_input, username, my_username, from_username);
					}
				});		
			}
		});
		price_input.focus();
	},
	sendRebuyRankAjax : function (rank, price_input, username, my_username, from_username) {
		var data = 'add=' + encodeURIComponent(rank) + '&value=' + price_input.value + '&username=' + encodeURIComponent(username) + '&wtf=' + ranksHandler.wtf + '&password=' + encodeURIComponent($('charley_holder').getElement('.password').value);
		Charley.close();
		ajaxLoadPost('/ranksctl/', data, function (ajaxObj) {
			var response = ajaxHandler.checkResponse(ajaxObj);
			
			if (response) {
				if (response.minimal_value) {
					var iHTML = 'Должность &laquo;' + $('js-ranks_input_rank').value + '&raquo; уже занята пользователем <a href="/users/'+ response.user_login +'">'+ response.user_login +'</a>, вы можете <span class="js-ranks_new_price_holder"><a href="#" onclick="ranksHandler.rebuyRank(this, \'' + rank + '\', \'' + response.minimal_value + '\', \'' + username + '\'); return false;">перекупить ее</a> за '+ response.minimal_value +'&nbsp;ЛВ</span>';
					$('js-ranks_error_message').removeClass('hidden');
					$('js-ranks_error_message').innerHTML = iHTML;
				} else {
					if (response.created) {
					
						// table
						var iHTML = '<table><tbody><tr class="ranks_table_stat_my">';
						iHTML += 		'<td class="ranks_table_rank">' + response.created.rank + '</td>';
						iHTML += 		'<td class="ranks_table_username"><a href="/users/' + response.created.user_login + '/">' + response.created.user_login + '</a></td>';
						
						if (response.created.deals < 1) {
							iHTML += '<td class="ranks_table_history">с&nbsp;' + response.created.createdate + '</td>';
						} else {
							iHTML += '<td class="ranks_table_history">с&nbsp;' + response.created.createdate + '&nbsp;перекупалась ' + response.created.deals + '&nbsp;раз' + response.created.deals_end + '</td>';
						}
						
						iHTML += 		'<td class="ranks_table_price">' + response.created.value + '&nbsp;ЛВ</td>';
						
						iHTML += '</tr></tbody></table>';
						
						$('js-temp_stat_table').innerHTML = iHTML;
						
						var new_tr = $('js-temp_stat_table').getElement('tr');
						new_tr.inject($('ranks_table_stats').getElement('tr'), 'after');
						if ($('js-ranks_table_stat_' + response.created.id)) {
							$('js-ranks_table_stat_' + response.created.id).destroy();
						}
						new_tr.id = 'js-ranks_table_stat_' + response.created.id;
						
						// current
						
						if (my_username == response.created.user_login) {
							$('js-ranks_current').innerHTML = 'Ваша нынешняя должность&nbsp;&#8212; <strong class="rank_current_name">' + response.created.rank + '&nbsp;<a href="/users/' + username + '/">' + username + '</a></strong>, <a href="#" class="ranks_go_away" onclick="ranksHandler.fire(\'' + response.created.rank + '\'); return false;">уволиться</a>?';
						} else if (my_username == from_username) {
							$('js-ranks_current').innerHTML = 'В данный момент у вас нет никакой должности.';
						}
						
						$('js-ranks_error_message').addClass('hidden');
						$('js-ranks_error_message').innerHTML = '';
					}
				}
			}
			
			
		});
	},
	pageCounter : 0,
	loadMore : function (my_username) {
		if (!$('js-ranks_table_more').hasClass('js-loading')) {
			$('js-ranks_table_more').addClass('js-loading');
			$('js-ranks_table_more').innerHTML = 'Загружаем';
			var last_id = $('ranks_table_stats').getElement('.ranks_table_stat:last-child').id.substr(20);
			ranksHandler.pageCounter++;
			var data = '&list=' + ranksHandler.pageCounter + '&wtf=' + ranksHandler.wtf;
			ajaxLoadPost('/ranksctl/', data, function (ajaxObj) {
				$('js-ranks_table_more').removeClass('js-loading');
				$('js-ranks_table_more').innerHTML = 'Ещё';
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					if (response.last_rank_displayed == '1') {
						$('js-ranks_table_more').addClass('hidden');
					}
					var ranks = new Hash(response.ranks);
					if (ranks.getLength() > 0) {
						for (var i = 0; i < ranks.getLength(); i++) {
							var rank = ranks.get(i);
							
							var iHTML = '<table><tbody><tr class="ranks_table_stat" >';
							iHTML += 		'<td class="ranks_table_rank">' + rank.rank + '</td>';
							iHTML += 		'<td class="ranks_table_username"><a href="/users/' + rank.user_login + '/">' + rank.user_login + '</a></td>';
							
							if (rank.deals < 1) {
								iHTML += '<td class="ranks_table_history">с&nbsp;' + rank.createdate + '</td>';
							} else {
								iHTML += '<td class="ranks_table_history">с&nbsp;' + rank.createdate + '&nbsp;перекупалась ' + rank.deals + '&nbsp;раз' + rank.deals_end + '</td>';
							}
							
							if (rank.affordable == '1') {
								iHTML += 		'<td class="ranks_table_price"><span class="js-ranks_new_price_holder js-ranks_new_price_holder_table"><a href="#" onclick="ranksHandler.rebuyRank(this, \'' + rank.rank + '\', \'' + rank.minimal_value + '\', \'' + my_username + '\', \'' + rank.user_login + '\', \'' + my_username + '\'); return false;">' + rank.value + '&nbsp;ЛВ</a></span></td>';
							} else {
								iHTML += 		'<td class="ranks_table_price">' + rank.value + '&nbsp;ЛВ</td>';
							}
							
							iHTML += '</tr></tbody></table>';
							
							$('js-temp_stat_table').innerHTML = iHTML;
							
							var new_tr = $('js-temp_stat_table').getElement('tr');
							new_tr.inject($('ranks_table_stats'));
							new_tr.id = 'js-ranks_table_stat_' + rank.id;
						}
					} else {
						$('js-ranks_table_more').addClass('hidden');
					}
				}
			});
		}
	},
	fire : function (rank) {
		Charley.ask({
			text:'Вы хотите отказаться от звания &laquo;'+ rank +'&raquo;? Это бесплатно.',
			yes:'- Да, Пожалуйста!',
			no:'Вы знаете, я передумал',
			password:true,
			onYes:function () {
				ranksHandler.sendfireAjax(rank);
			}
		});
	},
	sendfireAjax : function (rank) {
		if (!$('js-ranks_current').hasClass('js-loading')) {
			$('js-ranks_current').addClass('js-loading');
			var data = 'cancel=' + encodeURIComponent(rank) + '&wtf=' + ranksHandler.wtf + '&password=' + encodeURIComponent($('charley_holder').getElement('.password').value);
			Charley.close();
			ajaxLoadPost('/ranksctl/', data, function (ajaxObj) {
				$('js-ranks_current').removeClass('js-loading');
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					$('js-ranks_current').innerHTML = 'В данный момент у вас нет никакой должности.';
					if ($('js-ranks_table_stat_' + response.canceled)) {
						$('js-ranks_table_stat_' + response.canceled).destroy();
					}
				}
			});
		}
	},
	settingsWtf : '',
	blockExternal : function (button) {
		if (!$(button).hasClass('js-loading')) {
			$(button).addClass('js-loading');
			if ($(button).checked) {
				var data = 'block_external_ranks=1&wtf=' + ranksHandler.settingsWtf;
			} else {
				var data = 'block_external_ranks=0&wtf=' + ranksHandler.settingsWtf;
			}
			ajaxLoadPost('/settingsctl/', data, function (ajaxObj) {
				$(button).removeClass('js-loading');
				var response = ajaxHandler.checkResponse(ajaxObj);
				if (response) {
					
				}
			});
		}
	}
}
