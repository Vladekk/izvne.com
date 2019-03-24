
function initVoting(type, parentElementId){
	var voteBlocks = getElementsByClassName($(parentElementId), 'div', 'vote');
	if(voteBlocks.length == 0) return;

	switch (type){
		case "posts":
			VoteBlock.type = VoteBlock.typePost;
			VoteBlock.theChoiceElement = $('vote_choice');
			VoteBlock.initChoiceElements();
			for (var i=0; i<voteBlocks.length; i++){
				new VoteBlock(voteBlocks[i]);
			}			
			break;
		case "comments":
			VoteBlock.type = VoteBlock.typeComment;
			for (var i=0; i<voteBlocks.length; i++){
				new VoteBlockComments(voteBlocks[i]);
				//initShrink(voteBlocks[i].parentNode);
			}			
			break;
		case "lepraposts":
			VoteBlock.type = VoteBlock.typePost;
			for (var i=0; i<voteBlocks.length; i++){
				new VoteBlockComments(voteBlocks[i]);
			}
			break;
		default:
			break;
	}
}


function initShrink(parent){
	if(getElementsByClassName(parent, 'a', 'show_link').length == 0) return;

	var showLink = getElementsByClassName(parent, 'a', 'show_link')[0];
	showLink.onclick = function (){
		removeClass(this.parentNode.parentNode.parentNode, 'shrinked');
		return false;
	}
}


/* ����� VoteBlock (��� ����������� � ������ � �������)
***************************************************************/
function VoteBlock(htmlObj){
	this.htmlObj = htmlObj; // ���������, ���������� ��� �������� �����������
	if (getElementsByClassName(this.htmlObj, 'a', 'plus').length == 0){
		return;
	}
	this.htmlObjChildren = this.htmlObj.getElementsByTagName('*');

	this.htmlGlobalParent = htmlObj.parentNode.parentNode;  // ������������ ��������� ����� �����
	//this.htmlGlobalParent = htmlObj.parentNode;  // ������������ ���������
	this.plusBtn = getElementsByClassName(this.htmlObj, 'a', 'plus')[0];  // ��������� � ������� +
	this.minusBtn = getElementsByClassName(this.htmlObj, 'a', 'minus')[0]; // ��������� � ������� -
	this.rating = getElementsByClassName(this.htmlObj, 'span', 'rating')[0].firstChild; // ��������� � ���������


	this.htmlObj.obj = this;
	this.plusBtn.obj = this;
	this.minusBtn.obj = this;
	this.rating.obj = this;

	this.voteType = VoteBlock.type;

	this.initChoiceEvents();

}

// ����������� �������� VoteBlock.theChoiceElement
VoteBlock.theChoiceElement = {}; // html ��������� � ���������� ������, ������������ �� ������ ��������� (������ ����� ��������� this.htmlGlobalParent)
VoteBlock.theChoiceElement.elements = []; // ������ ���� ��������� ������ VoteBlock.theChoiceElement
VoteBlock.theChoiceElement.currentObj = {}; // ������ �� ������ ������ VoteBlock, ������ �������� ������ ��������� VoteBlock.theChoiceElement
VoteBlock.urlVoting = "/rate/?"; // url ��� ����������� + -
VoteBlock.type = "";
VoteBlock.typeComment = 0;  // ��� ��������, ��� �������� �� ���������
VoteBlock.typePost = 1; // ��� ��������, ��� �������� �� ������
VoteBlock.wtf = ""; //

// ����������� �����, ���������������� ������ VoteBlock.theChoiceElement � ��� ��� ��������
VoteBlock.initChoiceElements = function(){
	VoteBlock.theChoiceElement.elements = VoteBlock.theChoiceElement.getElementsByTagName('a');
	for (var i=0; i<VoteBlock.theChoiceElement.elements.length; i++){
		VoteBlock.theChoiceElement.elements[i].onclick = function(){
			if(matchClass(this, 'voted')){
				return false;
			} else {
				var currentObj = VoteBlock.theChoiceElement.currentObj; 
				var postId = currentObj.htmlGlobalParent.getAttribute('id').substring(1);
				var choiceValue = this.getAttribute('choiceValue'); 
				var url = VoteBlock.urlVoting + "wtf=" + VoteBlock.wtf + "&type=" + this.obj.voteType + "&id=" + postId + "&value=" + choiceValue;

				currentObj.setChoiceVoted(choiceValue); // ������������ ��������� �������
				addClass(currentObj.htmlGlobalParent, 'loading'); // ������ ���������
				ajaxLoad(url, currentObj.onLoad, currentObj); // ����������/�������� ������
				return false;	
			}
		}
	}
}

VoteBlock.prototype.initChoiceEvents = function (){
	this.htmlObj.onmouseout = function(e){
		if(!e) e = window.event;
		this.obj.hideChoice(e);
	}

	// ������ +
	this.plusBtn.onmouseover = function(e){
		if(!e) e = window.event;
		this.obj.hideChoice(e, this);
	}

	this.plusBtn.onclick = function(){
		this.blur();
		if(matchClass(this, 'voted')){
			return false;
		} else {
			var postId = this.obj.htmlGlobalParent.getAttribute('id').substring(1);
			var choiceValue = 1; 
			var url = VoteBlock.urlVoting + "wtf=" + VoteBlock.wtf + "&type=" + this.obj.voteType + "&id=" + postId + "&value=" + choiceValue;

			this.obj.setChoiceVoted(null);
			addClass(this, 'voted'); // �������� ��������� �����
			addClass(this.obj.htmlGlobalParent, 'loading'); // ������ ���������
			ajaxLoad(url, this.obj.onLoad, this.obj); // ����������/�������� ������
			return false;
		}
	}

	// ������ -
	this.minusBtn.onmouseover = function(){
		this.obj.showChoice();

		// �������������� ��� ������ IE6- (���������� �� ������� ������ �������)
		if(typeof document.body.style.maxWidth == 'undefined' && $('content_right_inner')){
			$('content_right_inner').style.display = "none";
			$('content_right_inner').style.display = "block";
		}
	}

	this.minusBtn.onclick = function(){
		this.blur();
		return false;
	}
}

// ��������� ����� VoteBlock.theChoiceElement
VoteBlock.prototype.showChoice = function(){
	if (typeof VoteBlock.theChoiceElement == 'undefined') return;
	
	VoteBlock.theChoiceElement.currentObj = this; // ������� ������ �� ����� ������������ ������ � VoteBlock.theChoiceElement
	addClass(VoteBlock.theChoiceElement.currentObj.htmlGlobalParent, 'inuse'); // ����������� htmlGlobalParent ������ ���������
	
	this.showChoiceVoted(); // ������������ ������� ������������ �������

	this.htmlObj.appendChild(VoteBlock.theChoiceElement);
	VoteBlock.theChoiceElement.style.display = 'block';
}

VoteBlock.prototype.hideChoice = function(e, obj){
	if (typeof VoteBlock.theChoiceElement == 'undefined') return;

	// ���� mouseover �� ������ "����", �������� ���� ����
	if(obj && matchClass(obj, "plus")){
		addClass(this.htmlGlobalParent, 'inuse'); // ����������� htmlGlobalParent ������ ���������
		VoteBlock.theChoiceElement.style.display = 'none';
		return;
	}

	// ���� �������, �� ������� ����������� ����, ����� ������ ���� �����, �������
	if (e.relatedTarget) {
		var where = e.relatedTarget;
		if (where == this.htmlObj) return;
		if (where.nodeType == 3) where = where.parentNode;
		for(var i=0; i<this.htmlObjChildren.length; i++){
			if (where == this.htmlObjChildren[i]) {
				return;
			}
		}
	} else if (e.toElement && this.htmlObj.contains(e.toElement)) {
		return;
	}

	removeClass(this.htmlGlobalParent, 'inuse'); // ������� �������� � htmlGlobalParent ������ ������ ���������
	VoteBlock.theChoiceElement.style.display = 'none';
} 

// ��������� ������, �� ������� �������������, � ������ ��������� VoteBlock.theChoiceElement
VoteBlock.prototype.showChoiceVoted = function (){
	var currentChoiceValue = this.minusBtn.getAttribute('choiceValue');
	for (var i=0; i<VoteBlock.theChoiceElement.elements.length; i++){
		var currentElement = VoteBlock.theChoiceElement.elements[i]; 
		if (currentElement.getAttribute('choiceValue') == currentChoiceValue){
			addClass(currentElement, 'voted');	
		} else {
			removeClass(currentElement, 'voted');
		}
	}
}

// ��������� ������ ���������� �������� � ������ ��������� VoteBlock.theChoiceElement
VoteBlock.prototype.setChoiceVoted = function(choiceMinusValue){
	this.minusBtn.setAttribute('choiceValue', choiceMinusValue);
	if(matchClass(this.plusBtn, 'voted')) {
		removeClass(this.plusBtn, 'voted');
	}
	this.showChoiceVoted();
}

VoteBlock.prototype.onLoad = function (ajaxObj){
	var newRating = ajaxObj.responseText;
	this.rating.innerHTML = newRating; 
	removeClass(this.htmlGlobalParent, 'loading'); // ������� ���������
}




/* �������� VoteBlockComments (��� ����������� � ������ � �������)
*************************************************************************/
function VoteBlockComments (htmlObj){
	VoteBlockComments.baseConstructor.call(this, htmlObj);
}
VoteBlockComments.inheritFrom(VoteBlock);

VoteBlockComments.prototype.initChoiceEvents = function (){

	this.htmlObj.onmouseout = function(e){
		if(!e) e = window.event;
		this.obj.hideChoice(e);
	}

	// ������ +
	this.plusBtn.onmouseover = function(e){
		return false;
	}

	this.plusBtn.onclick = function(){
		this.blur();
		if(matchClass(this, 'voted')){
			return false;
		} else {
			var postId = this.obj.htmlGlobalParent.getAttribute('id');
			var choiceValue = 1; 
			var url = VoteBlock.urlVoting + "wtf=" + VoteBlock.wtf + "&type=" + this.obj.voteType + "&id=" + postId + "&value=" + choiceValue;

			addClass(this, 'voted'); // �������� ��������� �����
			removeClass(this.obj.minusBtn, 'voted') // ������� ������� � ��������������� ����������� 
			addClass(this.obj.htmlGlobalParent, 'loading'); // ������ ���������

			ajaxLoad(url, this.obj.onLoad, this.obj); // ����������/�������� ������

			return false;
		}
	}

	// ������ -
	this.minusBtn.onmouseover = function(){
		return false;
	}

	this.minusBtn.onclick = function(){
		this.blur();
		if(matchClass(this, 'voted')){
			return false;
		} else {
			var postId = this.obj.htmlGlobalParent.getAttribute('id');
			var choiceValue = -1; 
			var url = VoteBlock.urlVoting + "wtf=" + VoteBlock.wtf + "&type=" + this.obj.voteType + "&id=" + postId + "&value=" + choiceValue;

			addClass(this, 'voted'); // �������� ��������� �����
			removeClass(this.obj.plusBtn, 'voted') // ������� ������� � ��������������� ����������� 
			addClass(this.obj.htmlGlobalParent, 'loading'); // ������ ���������
			addClass(this.obj.htmlGlobalParent, 'shrinked');

			ajaxLoad(url, this.obj.onLoad, this.obj); // ����������/�������� ������
			return false;
		}
		return false;
	}

	this.rating.onmouseover = function(){
		this.obj.showChoice();
	}
}

VoteBlockComments.prototype.showChoice = function(){
	addClass(this.htmlGlobalParent, 'inuse');
}

VoteBlockComments.prototype.hideChoice = function(e, obj){

	// ���� �������, �� ������� ����������� ����, ����� ������ ���� �����, �������
	if (e.relatedTarget) {
		var where = e.relatedTarget;
		if (where == this.htmlObj) return;
		if (where.nodeType == 3) where = where.parentNode;
		for(var i=0; i<this.htmlObjChildren.length; i++){
			if (where == this.htmlObjChildren[i]) {
				return;
			}
		}
		//e.relatedTarget.style.border = "none"; // �������, �� ��� �������� ��� � Opere :/
	} else if (e.toElement && this.htmlObj.contains(e.toElement)) {
		return;
	}

	removeClass(this.htmlGlobalParent, 'inuse');
} 



/* ����� VoteBlockUser (��� ����������� � 2 ������� � 2 �������� �� �����)
*************************************************************************/
function initVotingUser (parentObjId){
	var parentObj = $(parentObjId);
	var voteBlocks = parentObj.getElementsByTagName('strong');
	if(voteBlocks.length == 0) return;
	
	var ratingBlock = getElementsByClassName(parentObj, 'span', 'rating')[0].firstChild; // ��������� � ���������

	for (var i=0; i<voteBlocks.length; i++){
		new VoteBlockUser(voteBlocks[i], ratingBlock);
	}
}


function VoteBlockUser(htmlObj, ratingBlock){
	this.htmlObj = htmlObj;

	this.htmlGlobalParent = htmlObj.parentNode.parentNode;  // ������������ ��������� ����� �����
	this.plusBtn = getElementsByClassName(this.htmlObj, 'a', 'plus')[0];  // ��������� � ������� +
	this.minusBtn = getElementsByClassName(this.htmlObj, 'a', 'minus')[0]; // ��������� � ������� -
	this.rating = ratingBlock;

	this.htmlObj.obj = this;
	this.plusBtn.obj = this;
	this.minusBtn.obj = this;
	this.rating.obj = this;

	this.initChoiceEvents();
}

VoteBlockUser.urlVoting = "/karma/"; // url ��� ����������� + -
VoteBlockUser.wtf = ""; //

VoteBlockUser.prototype.initChoiceEvents = function (){
	this.plusBtn.onclick = function(){
		this.blur();
		if(matchClass(this, 'voted')){
			return false;
		} else {
			var userId = this.obj.htmlGlobalParent.getAttribute('uid');
			var choiceValue = this.getAttribute('choiceValue'); 
			var url = VoteBlockUser.urlVoting;
			var data = "wtf=" + VoteBlockUser.wtf + "&u_id=" + userId + "&value=" + choiceValue;

			addClass(this, 'voted'); // �������� ��������� �����
			removeClass(this.obj.minusBtn, 'voted') // ������� ������� � ��������������� ����������� 
			addClass(this.obj.htmlGlobalParent, 'loading'); // ������ ���������

			ajaxLoadPost(url, data, this.obj.onLoad, this.obj); // ����������/�������� ������
			return false;
		}
	}

	this.minusBtn.onclick = function(){
		this.blur();
		if(matchClass(this, 'voted')){
			return false;
		} else {
			var userId = this.obj.htmlGlobalParent.getAttribute('uid');
			var choiceValue = this.getAttribute('choiceValue'); 
			var url = VoteBlockUser.urlVoting;
			var data = "wtf=" + VoteBlockUser.wtf + "&u_id=" + userId + "&value=" + choiceValue;
			
			addClass(this, 'voted'); // �������� ��������� �����
			removeClass(this.obj.plusBtn, 'voted') // ������� ������� � ��������������� ����������� 
			addClass(this.obj.htmlGlobalParent, 'loading'); // ������ ���������

			ajaxLoadPost(url, data, this.obj.onLoad, this.obj); // ����������/�������� ������
			return false;
		}
		return false;
	}
	
}

VoteBlockUser.prototype.onLoad = function (ajaxObj){
	var newRating = ajaxObj.responseText;
	this.rating.innerHTML = newRating; 
	removeClass(this.htmlGlobalParent, 'loading'); // ������� ���������
}



/* �������������� ������� */
var wtf_vote = null;

function vote (linkBtn){
	linkBtn.blur();
	if(matchClass(linkBtn, 'voted')) return false;

	var linkGlobalParent = linkBtn.parentNode.parentNode.parentNode.parentNode;
	var id = linkGlobalParent.id;
	var linkParent = linkBtn.parentNode;
	var rating = getElementsByClassName(linkParent, 'span', 'rating')[0].firstChild; // ��������� � ���������
	var value;
	var oppositeBtn;
	var showLink = getElementsByClassName(linkGlobalParent, 'a', 'show_link')[0]; 

	if (matchClass(linkBtn, 'plus')){
		value = 1;
		oppositeBtn = getElementsByClassName(linkParent, 'a', 'minus')[0];		
	} else {
		value = -1;
		oppositeBtn = getElementsByClassName(linkParent, 'a', 'plus')[0];

		if(typeof noShrink != 'undefined'){
			noShrink(showLink);
		}
		//addClass(linkGlobalParent, 'shrinked');		
	}

	addClass(linkBtn, 'voted'); // �������� ��������� �����
	removeClass(oppositeBtn, 'voted') // ������� ������� � ��������������� ����������� 
	addClass(linkGlobalParent, 'loading'); // ������ ���������

	var url = "/rate/";
	var data = "type=0&wtf=" + wtf_vote + "&id=" + id + "&value=" + value;
	var params = {r:rating, gp:linkGlobalParent};
	
	ajaxLoadPost(url, data, voteOnLoad, window, params); // ����������/�������� ������
	return false;
}

function voteOnLoad(ajaxObj, params){
	var rating = params.r;
	var linkGlobalParent = params.gp; 
	var newRating = ajaxObj.responseText;

	rating.innerHTML = newRating; 
	removeClass(linkGlobalParent, 'loading'); // ������� ���������
}

function showChoice(link){
	var linkGlobalParent = link.parentNode.parentNode.parentNode.parentNode;
	addClass(linkGlobalParent, 'inuse');
}

function hideChoice(e, obj){
	var objChildren = obj.getElementsByTagName('*');
	var objGlobalParent = obj.parentNode.parentNode;

	// ���� �������, �� ������� ����������� ����, ����� ������ ���� �����, �������
	if (e.relatedTarget) {
		var where = e.relatedTarget;
		if (where == obj) return;
		if (where.nodeType == 3) where = where.parentNode;
		for(var i=0; i<objChildren.length; i++){
			if (where == objChildren[i]) {
				return;
			}
		}

		//e.relatedTarget.style.border = "none"; // �������, �� ��� �������� ��� � Opere :/
	} else if (e.toElement && obj.contains(e.toElement)) {
		return;
	}

	removeClass(objGlobalParent, 'inuse');
}

function votePost(linkBtn){
	linkBtn.blur();
	if(matchClass(linkBtn, 'voted')) return false;

	var linkGlobalParent = linkBtn.parentNode.parentNode.parentNode.parentNode;
	var id = linkGlobalParent.id;
	var linkParent = linkBtn.parentNode;
	var rating = getElementsByClassName(linkParent, 'span', 'rating')[0].firstChild; // ��������� � ���������


	if (matchClass(linkBtn, 'plus')){
		value = 1;
		oppositeBtn = getElementsByClassName(linkParent, 'a', 'minus')[0];		
	} else {
		value = -1;
		oppositeBtn = getElementsByClassName(linkParent, 'a', 'plus')[0];
	}

	addClass(linkBtn, 'voted'); // �������� ��������� �����
	removeClass(oppositeBtn, 'voted');
	addClass(linkGlobalParent, 'loading'); // ������ ���������

	var url = "/rate/";
	var data = "type=1&wtf=" + wtf_vote + "&id=" + id + "&value=" + value;
	var params = {r:rating, gp:linkGlobalParent};

	ajaxLoadPost(url, data, votePostOnLoad, window, params); // ����������/�������� ������
	return false;	
}

function votePostOnLoad(ajaxObj, params){
	var rating = params.r;
	var linkGlobalParent = params.gp; 
	var newRating = ajaxObj.responseText;

	rating.innerHTML = newRating; 
	removeClass(linkGlobalParent, 'loading'); // ������� ���������
}