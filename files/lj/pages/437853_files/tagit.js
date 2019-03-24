/*
/tagit/?pid=<номер поста>&new=<то, что вбили в коробку для меток>&wtf=<wtf> - новые метки?
/tagit/?pid=<номер поста>&del=<имя метки, у которой нажали крестик>&wtf=<wtf> - удаление метки
*/

TagsControl = new Object();
function initTags(){

//TagsControl = function (){
	TagsControl.tagsNewField = {};
	TagsControl.tagsPrivate = [];
	TagsControl.form = $('tags_new').getElementsByTagName('form')[0];
	TagsControl.submitBtn = TagsControl.form.getElementsByTagName('a')[0];
	TagsControl.input = TagsControl.form.getElementsByTagName('input')[0];
	TagsControl.postId = $('tags_add').getAttribute('postId');
	TagsControl.wtf = "";

	if($('tags_private')){
		TagsControl.tagsPrivate = $('tags_private').getElementsByTagName('span');
		for (var i=0; i<TagsControl.tagsPrivate.length; i++){
			TagsControl.tagsPrivate[i].tag = getElementsByClassName(TagsControl.tagsPrivate[i], 'a', 'tag')[0];
			TagsControl.tagsPrivate[i].tag.value = TagsControl.tagsPrivate[i].tag.innerHTML;
			TagsControl.tagsPrivate[i].deleteBtn = getElementsByClassName(TagsControl.tagsPrivate[i], 'a', 'del')[0];
			TagsControl.tagsPrivate[i].deleteBtn.obj = TagsControl.tagsPrivate[i];

			TagsControl.tagsPrivate[i].deleteBtn.onclick = function (){
				// var tagValue = encodeURIComponent(this.obj.tag.value);
				var tagValue = escape(this.obj.tag.value);
				//var url = "/tagit/?pid=" + TagsControl.postId + "&del=" + tagValue + "&wtf=" + TagsControl.wtf;
				var url = "/tagit/del/" + TagsControl.postId + "/" + tagValue + "/?&wtf=" + TagsControl.wtf;
				ajaxLoad(url, TagsControlOnLoad);
			}
		}
	}
	
	// кнопка добавитт тег
	TagsControl.submitBtn.onclick = function (){
		TagsControl.addTag(TagsControl.input.value);
		return false;	
	}

	// обработчик нажатие Enter
	TagsControl.form.onsubmit = function(){
		var tag = TagsControl.input.value;
		TagsControl.addTag(tag);
		return false;
	}

	TagsControl.input.disabled = false; // прелоадер
}


TagsControl.addTag = function(tag){
	if(tag == TagsControl.input.getAttribute('defaultValue') || tag == '') {
		return; // если введена пустая строка или же оставлено значение по умолчанию
	} else {
		TagsControl.input.disabled = 'true'; // прелоадер

		//var tagValue = encodeURIComponent(tag);
		var tagValue = escape(tag);
		
		//var url = "/tagit/?pid=" + TagsControl.postId + "&new=" + tagValue + "&wtf=" + TagsControl.wtf;
		var url = "/tagit/new/" + TagsControl.postId + "/" + tagValue + "/?&wtf=" + TagsControl.wtf;
		ajaxLoad(url, TagsControlOnLoad);
		//TagsControlOnLoad();
	}
}

TagsControlOnLoad = function(ajaxObj){
	if(ajaxObj.responseText != 'err'){
		//alert(ajaxObj.responseText);
		$('tags_add').innerHTML = "";
		$('tags_add').innerHTML = ajaxObj.responseText;
		//alert($('tags_add').innerHTML);
		//$('tags_add').innerHTML = $('tags_add').innerHTML;
		//alert(ajaxObj.responseText);
		//TagsControlObject = new TagsControl(); // заново пересоздаем объект
		initInputWithDynamicValue('tags_input'); // инициализируем динамические поля ввода
		initTags();
	}
}

/* Альтернативные функции */
var wtf_tag = null;
function addTag(tag){
	if(tag == '' || tag == $('tags_input').getAttribute('defaultValue')) return false;
	var postId = $('tags_add').getAttribute('postId');
	var tagValue = escape(tag);
	var url = "/tagit/new/" + postId + "/" + tagValue + "/?&wtf=" + wtf_tag;
	$('tags_input').disabled = 'true';
	ajaxLoad(url, tagsOnLoad);
	return false;
}

function delTag(tag){
	var postId = $('tags_add').getAttribute('postId');
	var tagValue = escape(tag);
	var url = "/tagit/del/" + postId + "/" + tagValue + "/?&wtf=" + wtf_tag;
	$('tags_input').disabled = 'true';
	ajaxLoad(url, tagsOnLoad);
	return false;
}

function tagsOnLoad(ajaxObj){
	if(ajaxObj.responseText != 'err'){
		$('tags_add').innerHTML = ajaxObj.responseText;
	}
	initInputWithDynamicValue('tags_input');
}