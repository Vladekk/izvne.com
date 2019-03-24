addEvent(window, 'load', initImages);

function initImages(){
	
	if(typeof document.body.style.maxWidth == 'undefined'){
		return;
		//imageController = new ImageController('content_left', 'dt');
		imageController = new ImageController('navigation', 'dt');
		winWidth = null;
		winWidthOld = null;
		addEvent(window, 'resize', resizeImgs);
		resizeImgs(true);
	} else {
		//imageController = new ImageController('content_left', 'dt');
		imageController = new ImageController('navigation', 'dt');
		addEvent(window, 'resize', clearZoom);
	}
}

function ImageController(contentId, imgHolderClassName){
	this.allImgs = [];
	this.imgMaxWidth = 600;
	this.measure = $('measure');
	this.init(contentId, imgHolderClassName);
}

ImageController.prototype.init = function (contentId, imgHolderClassName){
	var parent = $(contentId);
	if(!parent) return;
	this.blocksWithImgs = getElementsByClassName(parent, 'div', imgHolderClassName);
	
	//alert(this.blocksWithImgs.length);
	for (var i=0; i<this.blocksWithImgs.length; i++){
		var imgs = this.blocksWithImgs[i].getElementsByTagName('img');

		for(var j=0; j<imgs.length; j++){
			var imgParent = imgs[j].parentNode;
			if (imgParent.tagName.toLowerCase() == 'p' || imgParent.tagName.toLowerCase() == 'a'){
				this.allImgs[this.allImgs.length] = imgs[j];
				this.setRestrictProps(imgs[j], this.allImgs.length);
				this.setCursor(imgs[j]);
				this.setEvent(imgs[j]);
			}
		}		
	}
}

ImageController.prototype.setRestrictProps = function (img, index){
	img.originalWidth = img.offsetWidth;
	if(img.originalWidth > this.imgMaxWidth){ // если картинка больше макимально возможной, навешиваем стандартный рестриктор
		img.parentNode.className = "restrict_box";
	} else { // если картинка меньше максимально возможной, навешиваем на нее уникальный рестриктор
		img.parentNode.id = "img" + index;

		var cssStr = "#" + img.parentNode.id + " {max-width:" + img.originalWidth + "px;} ";
		addStyleProperty (cssStr);

		img.parentNode.className = "img_box";
	}
}

ImageController.prototype.setEvent = function (img){
	if(img.parentNode.tagName.toLowerCase() != 'a'){ // если это не картинка-ссылка
		img.zoom = "out";
		img.onclick = function(){
			if (this.zoom == "out"){
				this.zoom = "in";
				addClass(this.parentNode, 'zoomed');
				this.parentNode.style.height = this.offsetHeight + "px";
			} else {
				this.zoom = "out";
				removeClass(this.parentNode, 'zoomed');
				this.parentNode.style.height = "auto";
			}
		}
	}	
}

ImageController.prototype.setCursor = function (img){
	if (img.parentNode.tagName.toLowerCase() != 'a'){ // если это не картинка-ссылка
		if (img.originalWidth > img.offsetWidth){
			img.style.cursor = 'crosshair';
		} else {
			img.style.cursor = 'default';
		}		
	}
}


function clearZoom(){ // при ресайзе окна сбрасываем все зумы с картинок
	for (var i=0; i<imageController.allImgs.length; i++){
		var img = imageController.allImgs[i];
		if (matchClass(img.parentNode, 'zoomed')){
			img.onclick();
		}
		imageController.setCursor(img);
	}
}


function resizeImgs(flag){

	if(flag != true){
		if(!checkWinWidthChange()) return;
	}

	var measureWidth = this.measure.offsetWidth;
	for(var i=0; i<imageController.allImgs.length; i++){
		var img = imageController.allImgs[i];

		if (matchClass(img.parentNode, 'zoomed')){
			img.onclick();
		}
		imageController.setCursor(img);

		if (measureWidth > imageController.imgMaxWidth){
			if (img.originalWidth > imageController.imgMaxWidth){
				img.parentNode.style.width = imageController.imgMaxWidth + "px";
			} else {
				img.parentNode.style.width = img.originalWidth + "px";
			}
		} else {
			
			if (img.originalWidth > measureWidth){
				img.parentNode.style.width = measureWidth + "px";
			} else {
				img.parentNode.style.width = img.originalWidth + "px";
			}

		}
	}
}


function checkWinWidthChange(){
	winWidthOld = winWidth;
	winWidth = (document.documentElement.clientWidth || document.body.clientWidth);
	
	if(winWidthOld == winWidth){
		return false;
	} else {
		return true;
	}
}

// Запись css правил в head документа
function addStyleProperty(cssStr){
	var head = document.getElementsByTagName('head')[0];
	var styleSheets = head.getElementsByTagName('style');
	var styleSheet; 

	if(styleSheets.length) { // если уже есть контейнер <style> берем его для вставки
		styleSheet = styleSheets[styleSheets.length-1];	
	} else {  // если нет ни одного контейнера <style> сами создаем его
		styleSheet = document.createElement("style");
		styleSheet.setAttribute("type", "text/css");
		head.appendChild(styleSheet);
	}
	
	if(styleSheet.styleSheet){ // IE
		styleSheet.styleSheet.cssText = cssStr;
	} else { // w3c
		styleSheet.appendChild(document.createTextNode(cssStr));
	}
}