/*****************************
**   Misc functions
******************************/
function $(id){
	return document.getElementById(id);	
}
function addStyleProperties(cssStr){
	var head = document.getElementsByTagName('head')[0];
	var styleSheets = head.getElementsByTagName('style');
	var styleSheet = null;
	if (styleSheets.length){
		styleSheet = styleSheets[styleSheets.length-1];
	} else {
		styleSheet = document.createElement("style");
		styleSheet.setAttribute("type", "text/css");
		head.appendChild(styleSheet);	
	}
	
	if(styleSheet.styleSheet){ // IE
		styleSheet.styleSheet.cssText += cssStr;
	} else { // w3c
		styleSheet.appendChild(document.createTextNode(cssStr));
	}
}	
/*****************************
**   Event listeners
******************************/

function checkEvent(oEvt){
	oEvt=(oEvt) ? oEvt : ( (window.event) ? window.event : null );
	if(oEvt && oEvt.srcElement && !window.opera)
		oEvt.target=oEvt.srcElement;
	return oEvt;
}

function addEvent(objElement, strEventType, ptrEventFunc) {
	if (objElement.addEventListener)
		objElement.addEventListener(strEventType, ptrEventFunc, false);
	else if (objElement.attachEvent)
		objElement.attachEvent('on' + strEventType, ptrEventFunc);
}

function removeEvent(objElement, strEventType, ptrEventFunc) {
	if (objElement.removeEventListener) objElement.removeEventListener(strEventType, ptrEventFunc, false);
		else if (objElement.detachEvent) objElement.detachEvent('on' + strEventType, ptrEventFunc);
}

/*****************************
**   Common class methods
******************************/

function switchClass( objNode, strCurrClass, strNewClass ) {
	if ( matchClass( objNode, strNewClass ) ) replaceClass( objNode, strCurrClass, strNewClass );
		else replaceClass( objNode, strNewClass, strCurrClass );
}

function removeClass( objNode, strCurrClass ) {
	replaceClass( objNode, '', strCurrClass );
}

function addClass( objNode, strNewClass ) {
	replaceClass( objNode, strNewClass, '' );
}

function replaceClass( objNode, strNewClass, strCurrClass ) {
	var strOldClass = strNewClass;
	if ( strCurrClass && strCurrClass.length ){
		strCurrClass = strCurrClass.replace( /\s+(\S)/g, '|$1' );
		if ( strOldClass.length ) strOldClass += '|';
		strOldClass += strCurrClass;
	}
	objNode.className = objNode.className.replace( new RegExp('(^|\\s+)(' + strOldClass + ')($|\\s+)', 'g'), '$1' );
	objNode.className += ( (objNode.className.length)? ' ' : '' ) + strNewClass;
}

function matchClass( objNode, strCurrClass ) {
	return ( objNode && objNode.className.length && objNode.className.match( new RegExp('(^|\\s+)(' + strCurrClass + ')($|\\s+)') ) );
}

function getAncestorByClassName( oCurrentElement, sClassName, sTagName ) {
	var oCurrent = oCurrentElement.parentNode;
	while ( oCurrent.parentNode ) {
		if ( matchClass( oCurrent, sClassName ) && ( !sTagName || oCurrent.tagName.toLowerCase() == sTagName.toLowerCase() ) ) return oCurrent;
		oCurrent = oCurrent.parentNode;
	}
}

function getElementsByClassName(objParentNode, strNodeName, strClassName){
	var nodes = objParentNode.getElementsByTagName(strNodeName);
	if(!strClassName){
		return nodes;	
	}
	var nodesWithClassName = [];
	for(var i=0; i<nodes.length; i++){
		if(matchClass( nodes[i], strClassName )){
			//nodesWithClassName.push(nodes[i]);
			nodesWithClassName[nodesWithClassName.length] = nodes[i];
		}	
	}
	return nodesWithClassName;
}

function getElementsByClassNameFirstLevel(objParentNode, strNodeName, strClassName){
	var nodes = objParentNode.getElementsByTagName(strNodeName);

	if(!strClassName){
		nodesFirstLevel = [];
		for(var i=0; i<nodes.length; i++){
			if(nodes[i].parentNode.parentNode == objParentNode){
				nodesFirstLevel.push(nodes[i]);
			}	
		}
		return nodesFirstLevel;	
	}
	var nodesWithClassNameFirstLevel = [];
	for(var i=0; i<nodes.length; i++){
		if(matchClass(nodes[i], strClassName) && nodes[i].parentNode.parentNode == objParentNode){
			nodesWithClassNameFirstLevel.push(nodes[i]);
		}	
	}
	return nodesWithClassNameFirstLevel;
}

/*****************************
**   Some other methods
******************************/

function getPageY( oElement ) {
	var iPosY = oElement.offsetTop;
	while ( oElement.offsetParent != null ) {
		oElement = oElement.offsetParent;
		iPosY += oElement.offsetTop;
		if (oElement.tagName == 'BODY') break;
	}
	return iPosY;
}

function getPageX( oElement ) {
	var iPosX = oElement.offsetLeft;
	while ( oElement.offsetParent != null ) {
		oElement = oElement.offsetParent;
		iPosX += oElement.offsetLeft;
		if (oElement.tagName == 'BODY') break;
	}
	return iPosX;
}

function getMousePosition(e) {
	if (e.pageX || e.pageY){
		var posX = e.pageX;
		var posY = e.pageY;
	}else if (e.clientX || e.clientY) 	{
		var posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		var posY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	return {x:posX, y:posY}	
}



/*****************************
**   AJAX
******************************/

/*
	url - откуда загружаем
	ajaxCallBackFunction - что вызываем по завершении загрузки
	callObject - методом какого объекта является ajaxCallBackFunction (если это метод, а не глобальная фунция)
	params - параметры в виде объекта или массива
	ajaxCallBackErrorFunction - необязательная функция, обрабатывающая ошибки соединения
*/

function ajaxLoad(url, ajaxCallBackFunction, callObject, params, ajaxCallBackErrorFunction) {
	// branch for native XMLHttpRequest object
	if (window.XMLHttpRequest) {
		var ajaxObject = new XMLHttpRequest();
		ajaxObject.onreadystatechange = function(){
			ajaxLoadHandler(ajaxObject, ajaxCallBackFunction, callObject, params, ajaxCallBackErrorFunction);
		}
		ajaxObject.open("GET", url, true);
		ajaxObject.send(null);
	// branch for IE/Windows ActiveX version
	} else if (window.ActiveXObject) {
		var ajaxObject = new ActiveXObject("Microsoft.XMLHTTP");
		if (ajaxObject) {
			ajaxObject.onreadystatechange = function(){
				ajaxLoadHandler(ajaxObject, ajaxCallBackFunction, callObject, params, ajaxCallBackErrorFunction);
			}
			ajaxObject.open("GET", url, true);
			ajaxObject.send();
		}
	}
}

function ajaxLoadHandler(ajaxObject, ajaxCallBackFunction, callObject, params, ajaxCallBackErrorFunction){
	// only if req shows "complete"
	if (ajaxObject.readyState == 4) {
		// only if "OK"
		if (ajaxObject.status == 200) {
			// ...processing statements go here...
			ajaxCallBackFunction.call(callObject, ajaxObject, params);
		} else {
			if(ajaxCallBackErrorFunction){
				ajaxCallBackErrorFunction.call(callObject, ajaxObject);	
			} else {
				alert("There was a problem retrieving the XML data:\n" + ajaxObject.statusText);
			}
		}
	}
}

function ajaxLoadPost(url, data, ajaxCallBackFunction, callObject, params, ajaxCallBackErrorFunction) {
	var ajaxObject = null;
	
	if (window.XMLHttpRequest) { // branch for native XMLHttpRequest object
		ajaxObject = new XMLHttpRequest();
	} else if (window.ActiveXObject) { // branch for IE/Windows ActiveX version
		var ajaxObject = new ActiveXObject("Microsoft.XMLHTTP");
	}
	if(ajaxObject){
		ajaxObject.onreadystatechange = function(){
			ajaxLoadHandler(ajaxObject, ajaxCallBackFunction, callObject, params, ajaxCallBackErrorFunction);
		}
		ajaxObject.open("POST", url, true);
		ajaxObject.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=windows-1251");
		ajaxObject.setRequestHeader("Content-length", data.length);
		ajaxObject.setRequestHeader("Connection", "close");
		ajaxObject.send(data);	
	}
}


/* Class inheritance */
Function.prototype.inheritFrom = function(BaseClass) { // thanks to Kevin Lindsey for this idea
  var Inheritance = function() {};
  Inheritance.prototype = BaseClass.prototype;

  this.prototype = new Inheritance();
  this.prototype.constructor = this;
  this.baseConstructor = BaseClass;
  this.superClass = BaseClass.prototype;
}


if(!Function.prototype.call) { // emulating 'call' function for browsers not supporting it (IE5)
	Function.prototype.call = function() {
		var oObject = arguments[0];
		var aArguments = [];
		var oResult;       
		oObject.fFunction = this;
		for (var i = 1; i < arguments.length; i++) {
			aArguments[aArguments.length] = 'arguments[' + i + ']';         
		}
		eval('oResult = oObject.fFunction(' + aArguments.join(',') + ')');
		oObject.fFunction = null;
		return oResult;
	}
};
