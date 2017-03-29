// JavaScript Document
function hasClass(el, cls) {
	if (el && el.className) {
		return el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	}
}
function addClass(el, cls) {
	if (el) {
		if (el[0] && el.tagName != 'SELECT') {
			for (var i = 0; i < el.length; i++) {
				addClass(el[i], cls);
			}
		} else {
			if (!hasClass(el, cls)) el.className += " " + cls;
		}
	}
}
function removeClass(el, cls) {
	if (el) {
		if (el[0] && el.tagName != 'SELECT') {
			for (var i = 0; i < el.length; i++) {
				removeClass(el[i], cls);
			}
		} else {
			if (hasClass(el, cls)) {
				var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
				el.className = el.className.replace(reg, ' ');
			}
		}
	}
}
function replaceClass(el, oldcls, newcls) {
	if (el) {
		if (hasClass(el, oldcls)) {
			var reg = new RegExp('(\\s|^)' + oldcls + '(\\s|$)');
			el.className = el.className.replace(reg, " " + newcls);
		}
	}
}
function getElementsByClassName(cls, tag, elm) {
	tag = tag || "*";
	elm = elm || document;
	var els = (tag == "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag);
	var returnEls = [];
	for (var i = 0; i < els.length; i++) {
		if (hasClass(els[i], cls)) {
			returnEls.push(els[i]);
		}
	}
	return returnEls;
}
function trim(str) {
	return (str.length > 0) ? str.replace(/^\s*|\s*$/g, "") : str;
}
function inputDefaultToggle(el, defaultVal, defaultClass) {
	if (el) {
		el.onfocus = function () {
								if (this.value == defaultVal) {
									this.value = '';
									removeClass(this, defaultClass);
								}
					 };
		el.onblur = function () { 
								if (trim(this.value) == '') {
									this.value = defaultVal;
									addClass(this, defaultClass);
								} 
					};
		el.onchange = function () {
								if (this.value != defaultVal) {
									removeClass(this, defaultClass);
								} else if (trim(this.value) == '') {
									this.value = defaultVal;
									addClass(this, defaultClass);
								}
					};
		if (el.value == defaultVal || trim(el.value) == '') {
			addClass(el, defaultClass);
			el.value = defaultVal;
		}
	}
}
function disableFields(el, bool, except) {
    bool = (bool == undefined) ? true : bool;
    var $el = $(el),
        $except = $(except);
    
    $el.find(':input').not($except).each(function () {
        this.disabled = bool;
    });
}
function numbersOnly(field, e, dec) {
	var key;
	var keychar;
	
	if (window.event) key = window.event.keyCode;
	else if (e) key = e.which;
	else return true;
	keychar = String.fromCharCode(key);
	
	// control keys
	if ((key===null) || (key==0) || (key==8) || (key==9) || (key==27)) return true;
	
	// numbers
	else if ((("0123456789").indexOf(keychar) > -1)) return true;
	
	//decimal (internationalize?)
	else if (dec && (keychar == ".") && (field.value.indexOf(".") < 0)) return true;

    else return false;
}
function getNextElement(field) {
  var fieldFound = false;
  if (field.form) {
	  var form = field.form;
	  for (var e = 0; e < form.elements.length; e++) {
		if (fieldFound && form.elements[e].type != 'hidden') break;
		if (field == form.elements[e]) fieldFound = true;
	  }
	  return form.elements[e % form.elements.length];
  } else return false;
}
function tabOnEnter(field, e) {
  var keyCode = document.layers ? e.which : document.all ? e.keyCode : e.keyCode;
  if (keyCode != 13) return true;
  else {
    var nextElement = getNextElement(field);
	if (nextElement) {
		nextElement.focus();
		if (nextElement.type == 'text' || nextElement.type == 'file' || nextElement.type == 'password') nextElement.select();
		return false;
	} else return false;
  }
}
Array.prototype.inArray = function (val) {
	for (var i = 0; i < this.length; i++) {
		if (this[i].toLowerCase() == val.toLowerCase()) {
			return true;
		}
	}
	return false;
};
function isInt(val) {
     return isNaN(parseInt(val)) ? false : true;
}
function isNumeric(val) {
     return isNaN(parseFloat(val)) ? false : true;
}
function makeInt(val) {
	return isNaN(parseInt(val)) ? 0 : parseInt(val);
}
function makeNumeric(val) {
	return isNaN(parseFloat(val)) ? 0 : parseFloat(val);
}
function isASCIIPrintable(str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) < 32 || str.charCodeAt(i) > 126) {
            return false;
        }
    }
    return true;
}

function in_array(needle, haystack, strict) {
    strict = !!strict;
    for (var i in haystack) {
        if ((strict && haystack[i] === needle) || (!strict && haystack[i] == needle)) return true;
    }
    return false;
}

function getParentByTagName(el, tag) {
	var parent = el.parentNode;
	while (parent && parent.tagName.toLowerCase() != tag.toLowerCase()) {
		parent = parent.parentNode;
	}
	if (parent && parent.tagName.toLowerCase() == tag.toLowerCase()) return parent;
	else return false;

}
function createAltRemoveBoxes(el) {
	// Hide original checkbox
	el.style.display = 'none';
	// create new alternate checkbox
	var altEl = document.createElement('div');
	if (el.checked === true) altEl.className = el.className + '-checked';
	else altEl.className = el.className;
	el.parentNode.appendChild(altEl);
	// Handle onclick event
	var onclickFunc = el.onclick;
	altEl.onclick = function () {
		// Get row element
		var row = getParentByTagName(el, 'tr');
		if (el.checked !== true) {
			altEl.className = el.className + '-checked';
			el.checked = true;
			if (row) {
				addClass(row, 'dt-disabled');
				var fields = row.getElementsByTagName('input');
				removeClass(row.getElementsByTagName('input'), 'fldError');
				fields = row.getElementsByTagName('select');
				removeClass(row.getElementsByTagName('select'), 'fldError');
				fields = row.getElementsByTagName('textarea');
				removeClass(row.getElementsByTagName('textarea'), 'fldError');
				disableFields(row, true, el);
			}
		} else {
			altEl.className = el.className;
			el.checked = false;
			if (row) {
				removeClass(row, 'dt-disabled');
				disableFields(row, false);
			}
		}
		if (onclickFunc) onclickFunc();
	};
}
function styleRemoveBoxes() {
	var els = document.getElementsByTagName('input');
	for (var i = 0; i < els.length; i++) {
		if (els[i].type == 'checkbox' && els[i].className == 'removebox') {
			createAltRemoveBoxes(els[i]);
		}
	}
}
function getAbsPos(el) {
	var result = [];
	result.X = 0;
	result.Y = 0;
	while (el !== null) {
		result.X += el.offsetLeft;
		result.Y += el.offsetTop;
		el = el.offsetParent;
	}
	return result;
}
function isUnsaved(elm) {
	elm = elm || document;
	var fields = elm.getElementsByTagName('input');
	var textFieldTypes = ['text', 'file', 'password'];
	var checkFieldTypes = ['radio', 'checkbox'];
	for (var i = 0; i < fields.length; i++) {
		if (!fields[i].disabled && textFieldTypes.inArray(fields[i].type)) {
			if (fields[i].value != fields[i].defaultValue) return true;
		} else if (checkFieldTypes.inArray(fields[i].type)) {
			if (fields[i].checked != fields[i].defaultChecked) return true;
		}
	}
	fields = elm.getElementsByTagName('textarea');
	for (i = 0; i < fields.length; i++) {
		if (fields[i].value != fields[i].defaultValue) return true;
	}
	fields = elm.getElementsByTagName('select');
	for (i = 0; i < fields.length; i++) {
		for (var o = 0; o < fields[i].options.length; o++) {
			if (fields[i].options[o].selected != fields[i].options[o].defaultSelected) return true;
		}
	}
	return false;
}
function fillValues(str) {
  var vals = arguments[1] || [], passthru = arguments[2] || false;
  str = str.replace(/\{([^\}]+)\}/g, function () { return vals[arguments[1]] !== false ? vals[arguments[1]] : passthru ? arguments[0] : ''; });
  return str;
}
function prepFields() {
	var fields = document.getElementsByTagName('input');
	for (var i = 0; i < fields.length; i++) {
		if (fields[i].type == 'checkbox' && fields[i].className == 'removebox') {
			// Get row element
			var row = getParentByTagName(fields[i], 'tr');
			if (row) {
				if (fields[i].checked === true) {
					addClass(row, 'dt-disabled');
					disableFields(row, true);
				} else {
					removeClass(row, 'dt-disabled');
					disableFields(row, false);
				}
			}
		} else if (fields[i].type == 'text') {
			// Restrict input formats
			if (hasClass(fields[i], 'numeric')) {
				fields[i].onkeypress = function (event) { return numbersOnly(this, event, true); };
			} else if (hasClass(fields[i], 'integer')) {
				fields[i].onkeypress = function (event) { return numbersOnly(this, event, false); };
			}
		}
	}
}

function jqescape(str) { 
	return str.replace(/[#;&,\.\+\*~':"!\^\$\[\]\(\)=>|\/\\]/g, '\\$&');
}

var fbaJSonloadFunc = window.onload;
window.onload = function () {
	if (fbaJSonloadFunc) fbaJSonloadFunc();

	prepFields();
	styleRemoveBoxes();
};

var FBAUtil = {
    inViewport: function (offsetX, offsetY) {
        var win = $(window);
        return (offsetX >= win.scrollLeft() && 
            offsetX <= win.scrollLeft() + win.width() && 
            offsetY >= win.scrollTop() && 
            offsetY <= win.scrollTop() + win.height());
    }
};
