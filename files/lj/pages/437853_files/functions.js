function favctl(act,num){
	if (act=='sort') {
		document.favform.srt.value = num
	} else if (act=='kill') {
		document.favform.kill.value = num
	}
	document.favform.submit();
}



function kick(id) {
	if (id < 1) return;
	document.kick.kick.value = id;
	document.kick.run.value = 1;
	document.kick.submit();
}

function resubmit(form){
	form.run.value = 1;
	form.submit();
}

function intrs(id) {
	if (id < 1) return;
	document.intrs.add.value = id;
	document.intrs.run.value = 1;
	document.intrs.submit();
}


//Динамическое поле ввода 
function initInputWithDynamicValue(inputId){
	var input = $(inputId);
	if(!input) return;
	input.value = input.getAttribute('defaultValue');
	input.onfocus = function(){
		testInputValueFocus(this, this.getAttribute('defaultValue'));	
	}
	input.onblur = function(){
		testInputValueBlur(this, this.getAttribute('defaultValue'));	
	}		
}

function testInputValueFocus(oInputField, sDefaultValue){ // вызывается на событие onfocus поля ввода
	var newName = oInputField.value;
	if (newName == sDefaultValue){ // если строе значение (т.е. пользователь пока ничего не ввел)
		oInputField.value = ""; //  стираем значение по умолчанию	
		addClass (oInputField, "changed");
		if(matchClass(oInputField, 'password_alias')){
			//oInputField.setAttribute('type', 'password');

			var password = getElementsByClassName(oInputField.parentNode, 'input', 'password')[0];
			password.style.display = "inline";
			oInputField.style.display = "none";
			password.focus();
		}
	}
}

function testInputValueBlur(oInputField, sDefaultValue){ // вызывается на событие onblur поля ввода
	var newName = oInputField.value;
	if (!newName.match(/[^\s]+/g) || newName == sDefaultValue){ // если пустая строка или старое значение - вставляем значение по умолчанию
		oInputField.value = sDefaultValue;	
		removeClass (oInputField, "changed");
		if(oInputField.getAttribute('type') == 'password'){
			//oInputField.setAttribute('type', 'text');

			var password_alias = getElementsByClassName(oInputField.parentNode, 'input', 'password_alias')[0];
			password_alias.style.display = "inline";
			oInputField.style.display = "none";
		}
	}
}


/* Комментарий
******************************/
addEvent(window, 'load', displayReplyForm);
//addEvent(document, 'dblclick', displayDefaultReplyForm);

// инициализация формы (вызывается сразу после html самой формы)
function initReplyForm(){
	replyForm = $('reply_form');	
	if(!replyForm) return;

	replyForm.replyto = $('replyto');
	replyForm.comment = $('comment_textarea');
	replyForm.style.display = 'none';

	replyForm.onclick = function(e){
		if(!e) e=window.event;	
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();	
	}
} 

// обработчик кнопки 'ответить'
function commentIt(e, reply_link, user_link){
	if(!e) e = window.event;	
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();	

	if(typeof replyForm == 'undefined') {
		return false;
	} else {
		return displayInPlaceReplyForm(reply_link, user_link);		
	}
}

function commentPost(userlink){
	if(typeof replyForm == 'undefined') {
		return false;
	} else {
		replyForm.comment.value = userlink + ': ' + replyForm.comment.value;
		displayDefaultReplyForm();
	}
}

function displayReplyForm(){
	if(typeof replyForm != 'undefined'){
		if(replyForm.style.display == 'none'){
			displayDefaultReplyForm();
			replyForm.style.display = 'block';
		}
	}
}

function displayInPlaceReplyForm(replyLink, userlink){
	replyLink.blur();
	whereShowBox = replyLink.parentNode.parentNode.parentNode;
	whereShowBox.appendChild (replyForm);
	replyForm.replyto.value = whereShowBox.parentNode.getAttribute('id');
	//replyForm.comment.value = '';
	if(userlink){
		replyForm.comment.value = userlink + ': ' + replyForm.comment.value;
	}
	$('reply_link_default').style.display = 'block';
	replyForm.style.display = "block";
	replyForm.comment.focus();
	
	return false;
}

function displayDefaultReplyForm(){
	if (typeof replyForm == 'undefined') return;
	replyForm.replyto.value = '';
	//replyForm.comment.value = '';
	$('reply_link_default').style.display = 'none';
	$('content_left_inner').appendChild(replyForm);
	replyForm.style.display = 'block';
	return false;
}






/* Выбор категорий поста*/
function initCategorySelector(){
	var selector = $('category_selector');
	if(!selector) return;

	var cats = selector.getElementsByTagName('a');
	for (var i=0; i<cats.length; i++){
		new CatSelector(cats[i]);
		if(matchClass(cats[i].parentNode, 'selected')){
			CatSelector.selectedElement = cats[i].parentNode;
		}
	}
}

function CatSelector(ahref){
	this.htmlObj = ahref;
	this.ul = this.htmlObj.parentNode.getElementsByTagName('ul')[0];
	this.htmlObj.obj = this;
	this.initEvents();
}

CatSelector.selectedElement = null;
CatSelector.prototype.initEvents = function(){
	this.htmlObj.onclick = function (){
		this.blur();
		if(CatSelector.selectedElement){
			removeClass(CatSelector.selectedElement, 'selected');
		}
		CatSelector.selectedElement = this.obj.htmlObj.parentNode;
		addClass(CatSelector.selectedElement, 'selected');
		//this.obj.setGlobalHeight();
		return false;
	}

}

CatSelector.prototype.setGlobalHeight = function (){
	$('category_selector').style.height = this.ul.offsetHeight/9 + "em";
}


/* Приложить картинку */
function picShow(){
	$('reply_form_pic_show').style.display = "none";
	$('reply_form_pic_hide').style.display = "block";
}
function picHide(){
	$('reply_form_pic_show').style.display = "block";
	$('reply_form_pic_hide').style.display = "none";
}


/* Переключалка правой колонки (теги/категории) */
function showTags(){
	$('categories').style.display = "none";
	removeClass($('cat_tab'), 'selected');

	$('tags').style.display = "block";
	addClass($('tag_tab'), 'selected');
}

function showCats(){
	$('tags').style.display = "none";
	removeClass($('tag_tab'), 'selected');

	$('categories').style.display = "block";
	addClass($('cat_tab'), 'selected');					
}


/* красивый ALERT */
function showGenericWarning(invalid) {
	$("warning-generic-errors").innerHTML = invalid;
	warning = $("warning-generic");
	if (warning.currentStyle) {
		if (warning.currentStyle["position"] == "absolute") {
			if (document.documentElement && document.documentElement.clientHeight) 
				doc = document.documentElement;
			else doc = document.body;
			doc.onscroll=warningIeFix;
			doc.onresize=warningIeFix;
			warningIeFix();
		}
	}
	warning.style.display = "block";
	var timeout = setTimeout("warning.style.display = 'none'", 4000);
	return false;
}

function warningIeFix() {
	warning.style.top = doc.scrollTop + (doc.clientHeight / 2) - 100 + 'px';
	warning.style.left = doc.scrollLeft + (doc.clientWidth / 2) - 200 + 'px';
}


/* Работа с отображением новых комментов */
function checkShowComments(){
	var content = $('content');
	var showDefault = content.getAttribute('showDefault');
	var hashNew = window.location.href.match('#new');
	if(showDefault == 'new' && hashNew != null){
		addClass(content, 'new_only');
	}
}

function showNew(){
	var content = $('content');
	if(matchClass(content, 'new_only')){
		removeClass(content, 'new_only');
	} else {
		addClass(content, 'new_only');
	}
	return false;
}

function showParent(link){
	//var parentId = link.getAttribute('replyto');
	var parentId = link.href.split('#')[1];
	var parent = $(parentId); 
	if(parent){
		addClass(parent, 'show');
		//link.style.display = 'none';
	}
	//return false;
}

function noShrink(link){
	var parent = link.parentNode.parentNode.parentNode;
	if(matchClass(parent, 'shrinked')){
		removeClass(parent, 'shrinked');
		addClass(parent, 'was_shrinked');
		link.oldHTML = link.innerHTML;
		link.innerHTML = 'отвратительно!';
		link.blur();
	} else {
		removeClass(parent, 'was_shrinked');
		addClass(parent, 'shrinked');
		if(link.oldHTML){
			link.innerHTML = link.oldHTML;
		}
		link.blur();
	}
	return false;	
}

function allUserPosts(className){
	if(matchClass($('content'), className)){
		removeClass($('content'), className);
		return false;
	}
	var css = "" 
	css += "." + className + " ." + className + " .dt {border:1px solid #ccc; border-width:1px 1px 0 1px; padding:5px 5px 0.5em 5px;} ";
	css += "." + className + " ." + className + " .dd .p {border:1px solid #ccc; border-width:0 1px 1px 1px; padding:0 5px 5px 5px;} ";
	css += "." + className + " .shrinked" + " .dd .p {border-width:1px;} ";
	addStyleProperties(css);
	addClass($('content'), className);
	return false;
}

/* Социализм */
function socialAdd() {
	var parent = $("social-add-user");
	if (parent.working) return;
	var userInput = $("social-add-user-input");
	var user = userInput.value;
	if (user == "") return;
	parent.working = 1;
	var popupId = "pUser";
	var popup = createPopup(parent, popupId);
	var action = "add";
	var parameters = "user=" + user + "&wtf=" + social_wtf + "&action=" + action;
	parent.request = createXMLHttpRequest();
	if(!parent.request) {
		closePopup(parent, popup, 1);
		return;
	}
	parent.request.open("POST", "/socialism/", true);
	requestHeader(parent.request, parameters);
	parent.request.onreadystatechange = function() {
		if (parent.request.readyState == 4) {
			if (parent.request.status == 200) {
				var responce = parent.request.responseText;
				 // от сервера приходит либо -1 (user не существует), либо 0(если юзер уже был добавлен)
				if (responce != -1 && responce != 0) {
					responce = responce.split(", ");
					var list = $("social-you-watch");
					var newUser = $("social-watch-template").cloneNode(true);
					newUser.id = "u" + responce[0];
					var links = newUser.getElementsByTagName('a');
//					links[0].href = links[1].href = "/users/" + userNumber;
					links[0].href = "/users/" + responce[0];
					links[0].innerHTML = responce[1];
					newUser.getElementsByTagName('span')[0].innerHTML = responce[2];
					list.insertBefore(newUser, list.firstChild);
					socialNumber("+1");
					userInput.value="";
					closePopup(parent, popup, 0);
					return;
				}
				else {
					closePopup(parent, popup, 1);
					return;	
				}
			}
			else {
				closePopup(parent, popup, 1);
				return;
			}
		}
	}
	try{parent.request.send(parameters);}
	catch (err) {
		closePopup(parent, popup, 1);
		return;
	}
}

function socialOptions(target, option) {
	var parent = getParentByTag(target, "LI");
	if (parent.working) return;
	parent.working = 1;
	var user = parent.id.substr(1);
	var popupId = "p" + user;
	var popup = createPopup(parent, popupId);
	var initialChecked = (target.checked ? false : true);
	if (option == "p") var action = (initialChecked ? "noposts" : "posts");
	else if (option == "c") var action = (initialChecked ? "nocomms" : "comms");
	var parameters = "&user=" + user + "&wtf=" + social_wtf + "&action=" + action;
	parent.request = createXMLHttpRequest();
	if(!parent.request) {
		target.checked = initialChecked;
		closePopup(parent, popup, 1);
		return;
	}
	parent.request.open("POST", "/socialism/", true);
	requestHeader(parent.request, parameters);
	parent.request.onreadystatechange = function() {
		if (parent.request.readyState == 4) {
			if (parent.request.status == 200) {
				var responce = parent.request.responseText;
				if (responce == "1") {
					closePopup(parent, popup, 0);
					return;
				}
				else {
					closePopup(parent, popup, 1);
					return;
				}
			}
			else {
				target.checked = initialChecked;
				closePopup(parent, popup, 1);
				return;
			}
		}
	}
	try{parent.request.send(parameters);}
	catch (err) {
		target.checked = initialChecked;
		closePopup(parent, popup, 1);
		return;
	}
}

function socialDel(target) {
	var parent = getParentByTag(target, "LI");
	if (parent.working) return;
	parent.working = 1;
	var user = parent.id.substr(1);
	var popupId = "p" + user;
	var popup = createPopup(parent, popupId);
	var action = "remove";
	var parameters = "user=" + user + "&wtf=" + social_wtf + "&action=" + action;
	parent.request = createXMLHttpRequest();
	if(!parent.request) {
		closePopup(parent, popup, 1);
		return;
	}
	parent.request.open("POST", "/socialism/", true);
	requestHeader(parent.request, parameters);
	parent.request.onreadystatechange = function() {
		if (parent.request.readyState == 4) {
			
			if (parent.request.status == 200) {
				
				var responce = parent.request.responseText;
				if (responce == 1) {
					parent.parentNode.removeChild(parent);
					socialNumber("-1");
					closePopup(parent, popup, 0);
					return;
				}
				else {
					closePopup(parent, popup, 1);
					return;
				}
			}
			else {
				closePopup(parent, popup, 1);
				return;
			}
		}
	}
	try{parent.request.send(parameters);}
	catch (err) {
		closePopup(parent, popup, 1);
		return;
	}
}

function socialNumber(action) {
	var container = $("social-interested-number");
	var newNumber = Number(container.innerHTML);
	newNumber = (action == "+1" ? newNumber + 1 : newNumber - 1);
	container.innerHTML = newNumber;
}


function createXMLHttpRequest() {
	if (window.XMLHttpRequest) {
		var XMLHttp = new XMLHttpRequest();
	}
	else {
		try {
			var XMLHttp = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (err) {
			try {
				var XMLHttp = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (err2) {
				var XMLHttp = false;
			}
		}
	}
	return XMLHttp;
}

function requestHeader(request, parameters) {
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.setRequestHeader("Content-length", parameters.length);
	request.setRequestHeader("Connection", "close");
}

function getParentByTag(element, tag) {
	while (element.parentNode) {
		if (element.parentNode.tagName == tag) {
			return element.parentNode;
		}
		element=element.parentNode;
	}
	return false;
}





/* AJAX POPUP */
function createPopup(parent, popupId) {
	if (!parent.popup) {
		var template = $('popup-template');
		parent.popup = template.cloneNode(true);
		parent.popup.id = popupId;
		document.body.appendChild(parent.popup);
		parent.popup.text = parent.popup.getElementsByTagName('td')[0];
	}
	var popup = parent.popup;
	popup.text.innerHTML = 'Работаем';
	var correctionsLeft = 0;
	if (parent.tagName == "LI") var correctionsLeft = -35;
	correctionsWidth = correctionsLeft * -1;
	var realPosition = findPosition(parent);
	popup.style.left = realPosition[0] + correctionsLeft + 'px';
	popup.style.top = realPosition[1] + 'px';
	popup.style.width = parent.offsetWidth + correctionsWidth + 'px';
	popup.style.height = parent.offsetHeight + 'px';
	try {popup.style.display = "table";}
	catch(err) {popup.style.display = "block";}
	return popup;
}

function closePopup(parent, popup, error) {
	if (!error) {
		popup.style.display = "none";
		popup.text.innerHTML = 'Работаем';
	}
	else {
		popup.text.innerHTML = 'Kernel panic!';
		popup.style.display = "none";
		//popup.timeout = setTimeout("$('" + popup.id +"').style.display='none'", 2000);
	}
	parent.working = 0;
}

function findPosition(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return [curleft, curtop];
}


