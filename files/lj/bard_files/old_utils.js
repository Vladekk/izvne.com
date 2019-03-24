function ve(e){
ind=e.indexOf('\@');return (ind>0 && ind<s.length-1?true:false);
}
function tr(obj){
s=obj.value;
re=/^\s+/;s=s.replace(re, '');
re=/\s+$/;s=s.replace(re, '');
obj.value=s;return s;
}
function techHelp()
{
width=417;height=350;
if (parseInt (navigator.appVersion) >= 4 ) {
X=(screen.width  - width )/2;
Y=(screen.height - height)/2;
}
var extra='width='+width+',height='+height+',top='+Y+',left='+X+',resizable=0,scrollbars=1,location=no,directories=no,status=no,menubar=no,toolbar=no';
window.open('http://dirty.ru/help/pop.htm','dhelp',extra);
}
function show(wha) {
	wha = getElement(wha);
	if (wha.className=="active")
		wha.className="";
	else
		wha.className="active";
	if (wha.parentNode.className == "")
		wha.parentNode.className="dropdown";
	else
		wha.parentNode.className = "";
}

function getElement(el) {
	if (document.getElementById) {
		return document.getElementById(el);
	}
	else if (document.all) {
		return document.all(el);
	}
	else return false;
}

function showpicfield() {
	pf2 = getElement('picform');
	inoattach2 = getElement('inoattach');
	iattach2 = getElement('iattach');
	if (pf2.style.display == 'none') {
		pf2.style.display = 'block';
		iattach2.style.display = 'none';
		inoattach2.style.display = 'inline';
	}
	else {
		pf2.style.display = 'none';
		inoattach2.style.display = 'none';
		iattach2.style.display = 'inline';
	}
}

var ks = new Array(4);
var i = 0;
var ctrlenter;
function register(e)
{
	if (!e) e = window.event;
	if (e['keyCode'] == 17 || e['keyCode'] == 13)
	{
		push(e['keyCode'] + '_' + e.type);
	}
	else
	{
		push('');
	}
	check();
}

function push (e)
{
	if (i < 4) ks[i++] = e;
	else 
	{
		for (var j = 0; j < 3; j++) ks[j] = ks[j + 1];
		ks[3] = e;
	}	
}

function check ()
{
	if (i == 4)
	{
		if (ks[0] == '17_keydown' && ks[1] == '13_keydown' &&
			(ks[2] == '17_keyup' && ks[3] == '13_keyup' ||
			 ks[2] == '13_keyup' && ks[3] == '17_keyup')
		)
		ctrlenter();
	}
}