var wtf_zodiak = null;
function initZodiacBox(){
	zodiacBox = $('zodiac');
	if(!zodiacBox) return;
	
	zodiacBox.elements = zodiacBox.getElementsByTagName('a');
	for (var i=0; i<zodiacBox.elements.length; i++){
		zodiacBox.elements[i].onclick = function(){
			if(matchClass(this, 'voted')){
				return false;
			} else {
				var currentObj = zodiacBox.currentObj; 
				var id = currentObj.getAttribute('id').substring(1);
				var value = this.getAttribute('choiceValue'); 
				var url = "/zodiac/?&wtf=" + wtf_zodiak + "&id=" + id + "&value=" + value;
				var rating = getElementsByClassName(zodiacBox.parent, 'span', 'rating')[0].firstChild;
				var params = {r:rating, gp:currentObj};

				setZodiac(value); // отрисовываем выбранный элемент
				addClass(currentObj, 'loading'); // ставим прелоадер
				ajaxLoad(url, votePostOnLoad, window, params); // отправляем/получаем данные
				return false;	
			}
		}
	}
}

function showZodiacBox(link){
	
	if (typeof zodiacBox == 'undefined') return;
	
	zodiacBox.parent = link.parentNode;
	zodiacBox.parent.appendChild(zodiacBox);
	zodiacBox.rating = getElementsByClassName(zodiacBox.parent, 'span', 'rating')[0];
	zodiacBox.currentObj = zodiacBox.parentNode.parentNode.parentNode;

	addClass(zodiacBox.currentObj, 'inuse'); // располагаем htmlGlobalParent поверх отсальных

	drawZodiacBox(); // отрисовываем текущий голосованный элемент

	zodiacBox.style.display = 'block';
	
	
}

function hideZodiacBox(e, obj){
	if (typeof zodiacBox == 'undefined') return;

	var objChildren = obj.getElementsByTagName('*');
	var objGlobalParent = obj.parentNode;

	// если элемент, на который передвигаем мышь, лежит внутри чойс блока, выходим
	if (e.relatedTarget) {
		var where = e.relatedTarget;
		if (where == obj) return;
		if (where.nodeType == 3) where = where.parentNode;
		for(var i=0; i<objChildren.length; i++){
			if (where == objChildren[i]) {
				return;
			}
		}
	} else if (e.toElement && obj.contains(e.toElement)) {
		return;
	}

	removeClass(objGlobalParent, 'inuse'); // снимаем свойство с htmlGlobalParent лежать поверх отсальных
	zodiacBox.style.display = 'none';	
}


function drawZodiacBox(){
	var currentChoiceValue = zodiacBox.rating.getAttribute('choiceValue');
	for (var i=0; i<zodiacBox.elements.length; i++){
		var currentElement = zodiacBox.elements[i]; 
		if (currentElement.getAttribute('choiceValue') == currentChoiceValue){
			addClass(currentElement, 'voted');	
		} else {
			removeClass(currentElement, 'voted');
		}
	}
} 

function setZodiac (choiceValue){
	zodiacBox.rating.setAttribute('choiceValue', choiceValue);
	drawZodiacBox();
}