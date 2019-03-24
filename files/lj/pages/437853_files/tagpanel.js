//addEvent(window, 'load', initTagPanel);
function initTagPanel(){
	t = new TagPanel();

	function TagPanel(){
		this.contentBox = $('content');

		this.leftColumn = $('content_left');
		this.leftColumnWidth = 0;

		this.rightColumn = $('content_right');
		this.rightColumnWidth = 0;

		this.cloud = $('cloud');
		this.cloudInner = $('cloud_inner');
	
		this.tagTab = $('tag_tab');
		this.tagTab.style.display = 'block'; // ��������� ����� ��������

		this.step = 0;
		this.startStep = 10;
		this.deltaStep = 2.3;
		this.timer = null;
		this.speed = 50;

		this.mode = null;
		
		// IE6-
		this.rightColumnInner = $('content_right_inner');
		this.rightColumnInnerMarginLeft = 0;
		this.winWidth = null; 
		this.winWidthOld = null;
	}

	TagPanel.prototype.changeTagView = function(){
		this.step = this.startStep;
		//this.rightColumn.style.minWidth = 0; // �������� min-width ������ �������

		if (matchClass(this.tagTab.parentNode, 'tags_shrinked')){
			this.leftColumnWidth = 99; // ��������� ������ �������
			this.rightColumnWidth = 1;

			//this.tagTab.style.left = "-25px"; // �������� ������ ���������� � �������� �������

			this.mode = 'openTags';
			this.makeEasing();

			removeClass(this.tagTab.parentNode, 'tags_shrinked');
			
		} else {
			this.leftColumnWidth = 69; // ��������� ������ �������  
			this.rightColumnWidth = 31;

			//this.cloudInner.style.minWidth = this.cloud.offsetWidth + "px"; // ������ min-width ���������� � ������ ("���������" ������� ������)
			this.cloudInner.style.width = this.cloud.offsetWidth + "px";

			this.mode = 'closeTags';
			this.makeEasing();

			addClass(this.tagTab.parentNode, 'tags_shrinked');
		}	
	}

	TagPanel.prototype.makeEasing = function(){
		switch (this.mode){
			case "openTags":
				this.leftColumnWidth -= this.step;
				this.rightColumnWidth += this.step;

				if (this.leftColumnWidth > 69){
					//this.leftColumn.style.width = this.leftColumnWidth + "%";
					this.rightColumn.style.width = this.rightColumnWidth + "%";

				} else {
					//this.leftColumn.style.width = "69%";
					this.rightColumn.style.width = "31%";

					//this.rightColumn.style.minWidth = "13em"; // ���������� min-width ������ �������
					//this.cloudInner.style.minWidth = 0; // �������� min-width ���������� � ������ (������� "���������" ������)
					this.cloudInner.style.width = "auto";

					this.mode = null;
					
					if (typeof imageController != 'undefined'){
						if(typeof document.body.style.minWidth == 'undefined') {
							resizeImgs(true);
						}
						clearZoom(); // for imgresize.js
					}
					if(typeof pag != 'undefined'){
						setTimeout("resizePaginator()", 300); // for pagination.js
					}
					return;
				}

				break;

			case "closeTags":
				this.leftColumnWidth += this.step;
				this.rightColumnWidth -= this.step;

				if (this.leftColumnWidth < 99){
					//this.leftColumn.style.width = this.leftColumnWidth + "%";
					this.rightColumn.style.width = this.rightColumnWidth + "%";

				} else {
					//this.leftColumn.style.width = "99%";
					//this.rightColumn.style.width = "1%";
					this.rightColumn.style.width = "0";

					//this.tagTab.style.left = "-17px"; // �������� ������ ���������� ������ � ������� ������

					this.mode = null;

					if (typeof imageController != 'undefined'){
						if(typeof document.body.style.minWidth == 'undefined') {
							resizeImgs(true);
						}
						clearZoom(); // for imgresize.js
					}
					if(typeof pag != 'undefined'){
						setTimeout("resizePaginator()", 300); // for pagination.js
					}
					return;
				}

				break;
		}

		(this.step > 2) ? this.step -= this.deltaStep : this.step = 2; // ������� ���������� ��������

		var _this = this; 
		this.timer = setTimeout(function(){_this.makeEasing();}, this.speed);
	}

	/* IE6- [b] */
	/*
	if(typeof document.body.style.minWidth == 'undefined') {

		// �������������� ������� ������ ��� IE6- (���������� ��� � ���� ������������ �������!)
		TagPanel.prototype.changeTagView = function(){
			this.step = this.startStep;

			if (matchClass(this.contentBox, 'tags_shrinked')){
				this.leftColumnWidth = 100; // ��������� ������ �������
				this.rightColumnInnerMarginLeft = 100;

				this.tagTab.style.left = "-25px"; // �������� ������ ���������� � �������� �������

				this.mode = 'openTags';
				this.makeEasing();

				removeClass(this.contentBox, 'tags_shrinked');
				
			} else {
				this.leftColumnWidth = 69; // ��������� ������ �������
				this.rightColumnInnerMarginLeft = 69;

				this.cloudInner.style.width = this.cloud.offsetWidth + "px"; // ������ min-width ���������� � ������ ("���������" ������� ������)

				this.leftColumn.style.marginRight = "-100%"; // ������ ��������� layout �� "����������� �����" (sic!)
				this.rightColumn.style.width = "100%";

				this.mode = 'closeTags';
				this.makeEasing();

				addClass(this.contentBox, 'tags_shrinked');
			}	
		}

		TagPanel.prototype.makeEasing = function(){
			
			switch (this.mode){
				case "openTags":
					this.leftColumnWidth -= this.step;
					this.rightColumnInnerMarginLeft -= this.step;

					if (this.leftColumnWidth > 69){
						this.leftColumn.style.width = this.leftColumnWidth + "%";
						this.rightColumnInner.style.marginLeft = this.rightColumnInnerMarginLeft + "%";

					} else {
						this.leftColumn.style.width = "69%";
						this.rightColumnInner.style.marginLeft = "69%";

						this.cloudInner.style.width = 'auto'; // �������� min-width ���������� � ������ (������� "���������" ������)

						setLayout(true);
						return;
					}

					break;

				case "closeTags":
					this.leftColumnWidth += this.step;
					this.rightColumnInnerMarginLeft += this.step;

					if (this.leftColumnWidth < 99 && this.rightColumnInnerMarginLeft < 99){
						this.leftColumn.style.width = this.leftColumnWidth + "%";
						this.rightColumnInner.style.marginLeft = this.rightColumnInnerMarginLeft + "%";

					} else {
						this.leftColumn.style.width = "100%";
						this.rightColumnInner.style.marginLeft = "100%";

						this.tagTab.style.left = "-17px";  // �������� ������ ���������� ������ � ������� ������
						
						return;
					}

					break;
			}


			(this.step > 2) ? this.step -= this.deltaStep : this.step = 2; // ������� ���������� ��������

			
			var _this = this; 
			this.timer = setTimeout(function(){_this.makeEasing();}, this.speed);
		}

		addEvent(window, 'resize', setLayout);
		setLayout(true);

	}
	*/
	/* IE6- [e] */
}

// �������, ������� �� ���� ����������� expression �� CSS (�������� min-width IE6-)
// t - ����������, ������� �������� ������ TagPanel
function setLayout(flag){
	
	t.winWidthOld = t.winWidth;
	t.winWidth = (document.documentElement.clientWidth || document.body.clientWidth);
	if(flag != true){
		if(t.winWidthOld == t.winWidth || matchClass(t.contentBox, 'tags_shrinked')) return;
	} else {
		if(matchClass(t.contentBox, 'tags_shrinked')) return;
	}

	// min-width ����� �������
	if (t.winWidth > 680){
		t.leftColumn.style.width = "69%";
	} else {
		t.leftColumn.style.width = "300px";
	}

	// ������������ ��������� layout
	if (t.winWidth > 762){ // "����������� �����"
		t.leftColumn.style.marginRight = "-100%";
		t.rightColumn.style.width = "100%";
		t.rightColumnInner.style.marginLeft = "69%";
	} else { // "��������� �����"
		t.leftColumn.style.marginRight = "0";
		t.rightColumn.style.width = "13em";
		t.rightColumnInner.style.marginLeft = "0";
	}	
}
