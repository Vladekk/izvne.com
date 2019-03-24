/*
/tagit/?pid=<����� �����>&new=<��, ��� ����� � ������� ��� �����>&wtf=<wtf> - ����� �����?
/tagit/?pid=<����� �����>&del=<��� �����, � ������� ������ �������>&wtf=<wtf> - �������� �����
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
	
	// ������ �������� ���
	TagsControl.submitBtn.onclick = function (){
		TagsControl.addTag(TagsControl.input.value);
		return false;	
	}

	// ���������� ������� Enter
	TagsControl.form.onsubmit = function(){
		var tag = TagsControl.input.value;
		TagsControl.addTag(tag);
		return false;
	}

	TagsControl.input.disabled = false; // ���������
}


TagsControl.addTag = function(tag){
	if(tag == TagsControl.input.getAttribute('defaultValue') || tag == '') {
		return; // ���� ������� ������ ������ ��� �� ��������� �������� �� ���������
	} else {
		TagsControl.input.disabled = 'true'; // ���������

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
		//TagsControlObject = new TagsControl(); // ������ ����������� ������
		initInputWithDynamicValue('tags_input'); // �������������� ������������ ���� �����
		initTags();
	}
}

/* �������������� ������� */
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