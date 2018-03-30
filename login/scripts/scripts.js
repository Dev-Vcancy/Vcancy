/* ===========================================================
 * Bootstrap: fileinput.js v3.1.3
 * http://jasny.github.com/bootstrap/javascript/#fileinput
 * ===========================================================
 * Copyright 2012-2014 Arnold Daniels
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

+function ($) { "use strict";

  var isIE = window.navigator.appName == 'Microsoft Internet Explorer'

  // FILEUPLOAD PUBLIC CLASS DEFINITION
  // =================================

  var Fileinput = function (element, options) {
    this.$element = $(element)
    
    this.$input = this.$element.find(':file')
    if (this.$input.length === 0) return

    this.name = this.$input.attr('name') || options.name
	
	
    this.$hidden = this.$element.find('input[type=hidden][name="' + this.name + '"]')
    if (this.$hidden.length === 0) {
      this.$hidden = $('<input type="hidden">').insertBefore(this.$input)
    }

    this.$preview = this.$element.find('.fileinput-preview')
    var height = this.$preview.css('height')
    if (this.$preview.css('display') !== 'inline' && height !== '0px' && height !== 'none') {
      this.$preview.css('line-height', height)
    }
        
    this.original = {
      exists: this.$element.hasClass('fileinput-exists'),
      preview: this.$preview.html(),
      hiddenVal: this.$hidden.val()
    }
    
    this.listen()
  }
  
  Fileinput.prototype.listen = function() {
    this.$input.on('change.bs.fileinput', $.proxy(this.change, this))
    $(this.$input[0].form).on('reset.bs.fileinput', $.proxy(this.reset, this))
    
    this.$element.find('[data-trigger="fileinput"]').on('click.bs.fileinput', $.proxy(this.trigger, this))
    this.$element.find('[data-dismiss="fileinput"]').on('click.bs.fileinput', $.proxy(this.clear, this))
  },

  Fileinput.prototype.change = function(e) {
    var files = e.target.files === undefined ? (e.target && e.target.value ? [{ name: e.target.value.replace(/^.+\\/, '')}] : []) : e.target.files
    
    e.stopPropagation()

    if (files.length === 0) {
      this.clear()
      return
    }

    this.$hidden.val('')
    this.$hidden.attr('name', '')
    this.$input.attr('name', this.name)

    var file = files[0]

    if (this.$preview.length > 0 && (typeof file.type !== "undefined" ? file.type.match(/^image\/(gif|png|jpeg|)$/) : file.name.match(/\.(gif|png|jpe?g)$/i)) && typeof FileReader !== "undefined") {
		// console.log(file.name);
      var reader = new FileReader()
      var preview = this.$preview
      var element = this.$element

      reader.onload = function(re) {
        var $img = $('<img>')
        $img[0].src = re.target.result
        files[0].result = re.target.result
		element.find('#filename').val(file.name);
        element.find('#propimg').val(re.target.result);
		element.find('#appfiles').val(re.target.result);
        element.find('.fileinput-filename').text(file.name)
        
        // if parent has max-height, using `(max-)height: 100%` on child doesn't take padding and border into account
        if (preview.css('max-height') != 'none') $img.css('max-height', parseInt(preview.css('max-height'), 10) - parseInt(preview.css('padding-top'), 10) - parseInt(preview.css('padding-bottom'), 10)  - parseInt(preview.css('border-top'), 10) - parseInt(preview.css('border-bottom'), 10))
        
        preview.html($img)
        element.addClass('fileinput-exists').removeClass('fileinput-new')

        element.trigger('change.bs.fileinput', files)
      }

      reader.readAsDataURL(file)
    } else {
      this.$element.find('.fileinput-filename').text(file.name)
      this.$preview.text(file.name)
	  
	  this.$element.find('#filename').val(file.name);	
      var element = this.$element  
      var reader = new FileReader()
	  reader.onload = function(re) {
		 element.find('#appfiles').val(re.target.result);
	  }
	  reader.readAsDataURL(file)
	  
      this.$element.addClass('fileinput-exists').removeClass('fileinput-new')
      
      this.$element.trigger('change.bs.fileinput')
    }
  },

  Fileinput.prototype.clear = function(e) {
    if (e) e.preventDefault()
    
    this.$hidden.val('')
    this.$hidden.attr('name', this.name)
    this.$input.attr('name', '')
	
    //ie8+ doesn't support changing the value of input with type=file so clone instead
    if (isIE) { 
      var inputClone = this.$input.clone(true);
      this.$input.after(inputClone);
      this.$input.remove();
      this.$input = inputClone;
    } else {
      this.$input.val('')
    }

    this.$preview.html('')
    this.$element.find('.fileinput-filename').text('')
    this.$element.addClass('fileinput-new').removeClass('fileinput-exists')
	this.$element.find('#propimg').val('');
	this.$element.find('#appfiles').val('');
    
    if (e !== undefined) {
      this.$input.trigger('change')
      this.$element.trigger('clear.bs.fileinput')
    }
  },

  Fileinput.prototype.reset = function() {
    this.clear()

    this.$hidden.val(this.original.hiddenVal)
    this.$preview.html(this.original.preview)
    this.$element.find('.fileinput-filename').text('')

    if (this.original.exists) this.$element.addClass('fileinput-exists').removeClass('fileinput-new')
     else this.$element.addClass('fileinput-new').removeClass('fileinput-exists')
    
    this.$element.trigger('reset.bs.fileinput')
  },

  Fileinput.prototype.trigger = function(e) {
    this.$input.trigger('click')
    e.preventDefault()
  }

  
  // FILEUPLOAD PLUGIN DEFINITION
  // ===========================

  var old = $.fn.fileinput
  
  $.fn.fileinput = function (options) {
    return this.each(function () {
      var $this = $(this),
          data = $this.data('bs.fileinput')
      if (!data) $this.data('bs.fileinput', (data = new Fileinput(this, options)))
      if (typeof options == 'string') data[options]()
    })
  }

  $.fn.fileinput.Constructor = Fileinput


  // FILEINPUT NO CONFLICT
  // ====================

  $.fn.fileinput.noConflict = function () {
    $.fn.fileinput = old
    return this
  }


  // FILEUPLOAD DATA-API
  // ==================

  $(document).on('click.fileinput.data-api', '[data-provides="fileinput"]', function (e) {
    var $this = $(this)
    if ($this.data('bs.fileinput')) return
    $this.fileinput($this.data())
      
    var $target = $(e.target).closest('[data-dismiss="fileinput"],[data-trigger="fileinput"]');
    if ($target.length > 0) {
      e.preventDefault()
      $target.trigger('click.bs.fileinput')
    }
  })

}(window.jQuery);


/*!
 * jQuery Browser Plugin v0.0.6
 * https://github.com/gabceb/jquery-browser-plugin
 *
 * Original jquery-browser code Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * http://jquery.org/license
 
 * Modifications Copyright 2013 Gabriel Cebrian
 * https://github.com/gabceb
 *
 * Released under the MIT license
 *
 * Date: 2013-07-29T17:23:27-07:00
 
 https://github.com/gabceb/jquery-browser-plugin/blob/master/dist/jquery.browser.js
 */

(function( jQuery, window, undefined ) {
  "use strict";

  var matched, browser;

  jQuery.uaMatch = function( ua ) {
    ua = ua.toLowerCase();

  	var match = /(opr)[\/]([\w.]+)/.exec( ua ) ||
  		/(chrome)[ \/]([\w.]+)/.exec( ua ) ||
  		/(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) ||
  		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
  		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
  		/(msie) ([\w.]+)/.exec( ua ) ||
  		ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
  		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
  		[];

  	var platform_match = /(ipad)/.exec( ua ) ||
  		/(iphone)/.exec( ua ) ||
  		/(android)/.exec( ua ) ||
  		/(windows phone)/.exec( ua ) ||
  		/(win)/.exec( ua ) ||
  		/(mac)/.exec( ua ) ||
  		/(linux)/.exec( ua ) ||
  		/(cros)/i.exec( ua ) ||
  		[];

  	return {
  		browser: match[ 3 ] || match[ 1 ] || "",
  		version: match[ 2 ] || "0",
  		platform: platform_match[ 0 ] || ""
  	};
  };

  matched = jQuery.uaMatch( window.navigator.userAgent );
  browser = {};

  if ( matched.browser ) {
  	browser[ matched.browser ] = true;
  	browser.version = matched.version;
  	browser.versionNumber = parseInt(matched.version);
  }

  if ( matched.platform ) {
  	browser[ matched.platform ] = true;
  }

  // These are all considered mobile platforms, meaning they run a mobile browser
  if ( browser.android || browser.ipad || browser.iphone || browser[ "windows phone" ] ) {
  	browser.mobile = true;
  }

  // These are all considered desktop platforms, meaning they run a desktop browser
  if ( browser.cros || browser.mac || browser.linux || browser.win ) {
  	browser.desktop = true;
  }

  // Chrome, Opera 15+ and Safari are webkit based browsers
  if ( browser.chrome || browser.opr || browser.safari ) {
  	browser.webkit = true;
  }

  // IE11 has a new token so we will assign it msie to avoid breaking changes
  if ( browser.rv )
  {
  	var ie = "msie";

  	matched.browser = ie;
  	browser[ie] = true;
  }

  // Opera 15+ are identified as opr
  if ( browser.opr )
  {
  	var opera = "opera";

  	matched.browser = opera;
  	browser[opera] = true;
  }

  // Stock Android browsers are marked as Safari on Android.
  if ( browser.safari && browser.android )
  {
  	var android = "android";

  	matched.browser = android;
  	browser[android] = true;
  }

  // Assign the name and platform variable
  browser.name = matched.browser;
  browser.platform = matched.platform;


  jQuery.browser = browser;
})( jQuery, window );

/*
	Masked Input plugin for jQuery
	Copyright (c) 2007-2011 Josh Bush (digitalbush.com)
	Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license) 
	Version: 1.3
  https://cloud.github.com/downloads/digitalBush/jquery.maskedinput/jquery.maskedinput-1.3.min.js
*/
(function(a){var b=(a.browser.msie?"paste":"input")+".mask",c=window.orientation!=undefined;a.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},dataName:"rawMaskFn"},a.fn.extend({caret:function(a,b){if(this.length!=0){if(typeof a=="number"){b=typeof b=="number"?b:a;return this.each(function(){if(this.setSelectionRange)this.setSelectionRange(a,b);else if(this.createTextRange){var c=this.createTextRange();c.collapse(!0),c.moveEnd("character",b),c.moveStart("character",a),c.select()}})}if(this[0].setSelectionRange)a=this[0].selectionStart,b=this[0].selectionEnd;else if(document.selection&&document.selection.createRange){var c=document.selection.createRange();a=0-c.duplicate().moveStart("character",-1e5),b=a+c.text.length}return{begin:a,end:b}}},unmask:function(){return this.trigger("unmask")},mask:function(d,e){if(!d&&this.length>0){var f=a(this[0]);return f.data(a.mask.dataName)()}e=a.extend({placeholder:"_",completed:null},e);var g=a.mask.definitions,h=[],i=d.length,j=null,k=d.length;a.each(d.split(""),function(a,b){b=="?"?(k--,i=a):g[b]?(h.push(new RegExp(g[b])),j==null&&(j=h.length-1)):h.push(null)});return this.trigger("unmask").each(function(){function v(a){var b=f.val(),c=-1;for(var d=0,g=0;d<k;d++)if(h[d]){l[d]=e.placeholder;while(g++<b.length){var m=b.charAt(g-1);if(h[d].test(m)){l[d]=m,c=d;break}}if(g>b.length)break}else l[d]==b.charAt(g)&&d!=i&&(g++,c=d);if(!a&&c+1<i)f.val(""),t(0,k);else if(a||c+1>=i)u(),a||f.val(f.val().substring(0,c+1));return i?d:j}function u(){return f.val(l.join("")).val()}function t(a,b){for(var c=a;c<b&&c<k;c++)h[c]&&(l[c]=e.placeholder)}function s(a){var b=a.which,c=f.caret();if(a.ctrlKey||a.altKey||a.metaKey||b<32)return!0;if(b){c.end-c.begin!=0&&(t(c.begin,c.end),p(c.begin,c.end-1));var d=n(c.begin-1);if(d<k){var g=String.fromCharCode(b);if(h[d].test(g)){q(d),l[d]=g,u();var i=n(d);f.caret(i),e.completed&&i>=k&&e.completed.call(f)}}return!1}}function r(a){var b=a.which;if(b==8||b==46||c&&b==127){var d=f.caret(),e=d.begin,g=d.end;g-e==0&&(e=b!=46?o(e):g=n(e-1),g=b==46?n(g):g),t(e,g),p(e,g-1);return!1}if(b==27){f.val(m),f.caret(0,v());return!1}}function q(a){for(var b=a,c=e.placeholder;b<k;b++)if(h[b]){var d=n(b),f=l[b];l[b]=c;if(d<k&&h[d].test(f))c=f;else break}}function p(a,b){if(!(a<0)){for(var c=a,d=n(b);c<k;c++)if(h[c]){if(d<k&&h[c].test(l[d]))l[c]=l[d],l[d]=e.placeholder;else break;d=n(d)}u(),f.caret(Math.max(j,a))}}function o(a){while(--a>=0&&!h[a]);return a}function n(a){while(++a<=k&&!h[a]);return a}var f=a(this),l=a.map(d.split(""),function(a,b){if(a!="?")return g[a]?e.placeholder:a}),m=f.val();f.data(a.mask.dataName,function(){return a.map(l,function(a,b){return h[b]&&a!=e.placeholder?a:null}).join("")}),f.attr("readonly")||f.one("unmask",function(){f.unbind(".mask").removeData(a.mask.dataName)}).bind("focus.mask",function(){m=f.val();var b=v();u();var c=function(){b==d.length?f.caret(0,b):f.caret(b)};(a.browser.msie?c:function(){setTimeout(c,0)})()}).bind("blur.mask",function(){v(),f.val()!=m&&f.change()}).bind("keydown.mask",r).bind("keypress.mask",s).bind(b,function(){setTimeout(function(){f.caret(v(!0))},0)}),v()})}})})(jQuery);
/**
* @license Input Mask plugin for jquery
* http://github.com/RobinHerbots/jquery.inputmask
* Copyright (c) 2010 - 2014 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 2.4.30
*/

(function ($) {
    if ($.fn.inputmask === undefined) {
        //helper functions    
        function isInputEventSupported(eventName) {
            var el = document.createElement('input'),
            eventName = 'on' + eventName,
            isSupported = (eventName in el);
            if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] == 'function';
            }
            el = null;
            return isSupported;
        }
        function resolveAlias(aliasStr, options, opts) {
            var aliasDefinition = opts.aliases[aliasStr];
            if (aliasDefinition) {
                if (aliasDefinition.alias) resolveAlias(aliasDefinition.alias, undefined, opts); //alias is another alias
                $.extend(true, opts, aliasDefinition);  //merge alias definition in the options
                $.extend(true, opts, options);  //reapply extra given options
                return true;
            }
            return false;
        }
        function generateMaskSets(opts) {
            var ms = [];
            var genmasks = []; //used to keep track of the masks that where processed, to avoid duplicates
            function getMaskTemplate(mask) {
                if (opts.numericInput) {
                    mask = mask.split('').reverse().join('');
                }
                var escaped = false, outCount = 0, greedy = opts.greedy, repeat = opts.repeat;
                if (repeat == "*") greedy = false;
                //if (greedy == true && opts.placeholder == "") opts.placeholder = " ";
                if (mask.length == 1 && greedy == false && repeat != 0) { opts.placeholder = ""; } //hide placeholder with single non-greedy mask
                var singleMask = $.map(mask.split(""), function (element, index) {
                    var outElem = [];
                    if (element == opts.escapeChar) {
                        escaped = true;
                    }
                    else if ((element != opts.optionalmarker.start && element != opts.optionalmarker.end) || escaped) {
                        var maskdef = opts.definitions[element];
                        if (maskdef && !escaped) {
                            for (var i = 0; i < maskdef.cardinality; i++) {
                                outElem.push(opts.placeholder.charAt((outCount + i) % opts.placeholder.length));
                            }
                        } else {
                            outElem.push(element);
                            escaped = false;
                        }
                        outCount += outElem.length;
                        return outElem;
                    }
                });

                //allocate repetitions
                var repeatedMask = singleMask.slice();
                for (var i = 1; i < repeat && greedy; i++) {
                    repeatedMask = repeatedMask.concat(singleMask.slice());
                }

                return { "mask": repeatedMask, "repeat": repeat, "greedy": greedy };
            }
            //test definition => {fn: RegExp/function, cardinality: int, optionality: bool, newBlockMarker: bool, offset: int, casing: null/upper/lower, def: definitionSymbol}
            function getTestingChain(mask) {
                if (opts.numericInput) {
                    mask = mask.split('').reverse().join('');
                }
                var isOptional = false, escaped = false;
                var newBlockMarker = false; //indicates wheter the begin/ending of a block should be indicated

                return $.map(mask.split(""), function (element, index) {
                    var outElem = [];

                    if (element == opts.escapeChar) {
                        escaped = true;
                    } else if (element == opts.optionalmarker.start && !escaped) {
                        isOptional = true;
                        newBlockMarker = true;
                    }
                    else if (element == opts.optionalmarker.end && !escaped) {
                        isOptional = false;
                        newBlockMarker = true;
                    }
                    else {
                        var maskdef = opts.definitions[element];
                        if (maskdef && !escaped) {
                            var prevalidators = maskdef["prevalidator"], prevalidatorsL = prevalidators ? prevalidators.length : 0;
                            for (var i = 1; i < maskdef.cardinality; i++) {
                                var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator["validator"], cardinality = prevalidator["cardinality"];
                                outElem.push({ fn: validator ? typeof validator == 'string' ? new RegExp(validator) : new function () { this.test = validator; } : new RegExp("."), cardinality: cardinality ? cardinality : 1, optionality: isOptional, newBlockMarker: isOptional == true ? newBlockMarker : false, offset: 0, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element });
                                if (isOptional == true) //reset newBlockMarker
                                    newBlockMarker = false;
                            }
                            outElem.push({ fn: maskdef.validator ? typeof maskdef.validator == 'string' ? new RegExp(maskdef.validator) : new function () { this.test = maskdef.validator; } : new RegExp("."), cardinality: maskdef.cardinality, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element });
                        } else {
                            outElem.push({ fn: null, cardinality: 0, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: null, def: element });
                            escaped = false;
                        }
                        //reset newBlockMarker
                        newBlockMarker = false;
                        return outElem;
                    }
                });
            }
            function markOptional(maskPart) { //needed for the clearOptionalTail functionality
                return opts.optionalmarker.start + maskPart + opts.optionalmarker.end;
            }
            function splitFirstOptionalEndPart(maskPart) {
                var optionalStartMarkers = 0, optionalEndMarkers = 0, mpl = maskPart.length;
                for (var i = 0; i < mpl; i++) {
                    if (maskPart.charAt(i) == opts.optionalmarker.start) {
                        optionalStartMarkers++;
                    }
                    if (maskPart.charAt(i) == opts.optionalmarker.end) {
                        optionalEndMarkers++;
                    }
                    if (optionalStartMarkers > 0 && optionalStartMarkers == optionalEndMarkers)
                        break;
                }
                var maskParts = [maskPart.substring(0, i)];
                if (i < mpl) {
                    maskParts.push(maskPart.substring(i + 1, mpl));
                }
                return maskParts;
            }
            function splitFirstOptionalStartPart(maskPart) {
                var mpl = maskPart.length;
                for (var i = 0; i < mpl; i++) {
                    if (maskPart.charAt(i) == opts.optionalmarker.start) {
                        break;
                    }
                }
                var maskParts = [maskPart.substring(0, i)];
                if (i < mpl) {
                    maskParts.push(maskPart.substring(i + 1, mpl));
                }
                return maskParts;
            }
            function generateMask(maskPrefix, maskPart, metadata) {
                var maskParts = splitFirstOptionalEndPart(maskPart);
                var newMask, maskTemplate;

                var masks = splitFirstOptionalStartPart(maskParts[0]);
                if (masks.length > 1) {
                    newMask = maskPrefix + masks[0] + markOptional(masks[1]) + (maskParts.length > 1 ? maskParts[1] : "");
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                    newMask = maskPrefix + masks[0] + (maskParts.length > 1 ? maskParts[1] : "");
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                    if (splitFirstOptionalStartPart(masks[1]).length > 1) { //optional contains another optional
                        generateMask(maskPrefix + masks[0], masks[1] + maskParts[1], metadata);
                    }
                    if (maskParts.length > 1 && splitFirstOptionalStartPart(maskParts[1]).length > 1) {
                        generateMask(maskPrefix + masks[0] + markOptional(masks[1]), maskParts[1], metadata);
                        generateMask(maskPrefix + masks[0], maskParts[1], metadata);
                    }
                }
                else {
                    newMask = maskPrefix + maskParts;
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                }

            }

            if ($.isFunction(opts.mask)) { //allow mask to be a preprocessing fn - should return a valid mask
                opts.mask = opts.mask.call(this, opts);
            }
            if ($.isArray(opts.mask)) {
                $.each(opts.mask, function (ndx, msk) {
                    if (msk["mask"] != undefined) {
                        generateMask("", msk["mask"].toString(), msk);
                    } else
                        generateMask("", msk.toString());
                });
            } else generateMask("", opts.mask.toString());

            return opts.greedy ? ms : ms.sort(function (a, b) { return a["mask"].length - b["mask"].length; });
        }

        var msie1x = typeof ScriptEngineMajorVersion === "function"
                        ? ScriptEngineMajorVersion() //IE11 detection
                        : new Function("/*@cc_on return @_jscript_version; @*/")() >= 10, //conditional compilation from mickeysoft trick
            iphone = navigator.userAgent.match(new RegExp("iphone", "i")) !== null,
            android = navigator.userAgent.match(new RegExp("android.*safari.*", "i")) !== null,
            androidchrome = navigator.userAgent.match(new RegExp("android.*chrome.*", "i")) !== null,
            androidfirefox = navigator.userAgent.match(new RegExp("android.*firefox.*", "i")) !== null,
            PasteEventType = isInputEventSupported('paste') ? 'paste' : isInputEventSupported('input') ? 'input' : "propertychange";

        //if (androidchrome) {
        //    var browser = navigator.userAgent.match(new RegExp("chrome.*", "i")),
        //        version = parseInt(new RegExp(/[0-9]+/).exec(browser));
        //    androidchrome32 = (version == 32);
        //}

        //masking scope
        //actionObj definition see below
        function maskScope(masksets, activeMasksetIndex, opts, actionObj) {
            var isRTL = false,
                valueOnFocus = getActiveBuffer().join(''),
                $el,
                skipKeyPressEvent = false, //Safari 5.1.x - modal dialog fires keypress twice workaround
                skipInputEvent = false, //skip when triggered from within inputmask
                ignorable = false;


            //maskset helperfunctions

            function getActiveMaskSet() {
                return masksets[activeMasksetIndex];
            }

            function getActiveTests() {
                return getActiveMaskSet()['tests'];
            }

            function getActiveBufferTemplate() {
                return getActiveMaskSet()['_buffer'];
            }

            function getActiveBuffer() {
                return getActiveMaskSet()['buffer'];
            }

            function isValid(pos, c, strict) { //strict true ~ no correction or autofill
                strict = strict === true; //always set a value to strict to prevent possible strange behavior in the extensions 

                function _isValid(position, activeMaskset, c, strict) {
                    var testPos = determineTestPosition(position), loopend = c ? 1 : 0, chrs = '', buffer = activeMaskset["buffer"];
                    for (var i = activeMaskset['tests'][testPos].cardinality; i > loopend; i--) {
                        chrs += getBufferElement(buffer, testPos - (i - 1));
                    }

                    if (c) {
                        chrs += c;
                    }

                    //return is false or a json object => { pos: ??, c: ??} or true
                    return activeMaskset['tests'][testPos].fn != null ?
                        activeMaskset['tests'][testPos].fn.test(chrs, buffer, position, strict, opts)
                        : (c == getBufferElement(activeMaskset['_buffer'].slice(), position, true) || c == opts.skipOptionalPartCharacter) ?
                            { "refresh": true, c: getBufferElement(activeMaskset['_buffer'].slice(), position, true), pos: position }
                            : false;
                }

                function PostProcessResults(maskForwards, results) {
                    var hasValidActual = false;
                    $.each(results, function (ndx, rslt) {
                        hasValidActual = $.inArray(rslt["activeMasksetIndex"], maskForwards) == -1 && rslt["result"] !== false;
                        if (hasValidActual) return false;
                    });
                    if (hasValidActual) { //strip maskforwards
                        results = $.map(results, function (rslt, ndx) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) == -1) {
                                return rslt;
                            } else {
                                masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = actualLVP;
                            }
                        });
                    } else { //keep maskforwards with the least forward
                        var lowestPos = -1, lowestIndex = -1, rsltValid;
                        $.each(results, function (ndx, rslt) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) != -1 && rslt["result"] !== false & (lowestPos == -1 || lowestPos > rslt["result"]["pos"])) {
                                lowestPos = rslt["result"]["pos"];
                                lowestIndex = rslt["activeMasksetIndex"];
                            }
                        });
                        results = $.map(results, function (rslt, ndx) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) != -1) {
                                if (rslt["result"]["pos"] == lowestPos) {
                                    return rslt;
                                } else if (rslt["result"] !== false) {
                                    for (var i = pos; i < lowestPos; i++) {
                                        rsltValid = _isValid(i, masksets[rslt["activeMasksetIndex"]], masksets[lowestIndex]["buffer"][i], true);
                                        if (rsltValid === false) {
                                            masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = lowestPos - 1;
                                            break;
                                        } else {
                                            setBufferElement(masksets[rslt["activeMasksetIndex"]]["buffer"], i, masksets[lowestIndex]["buffer"][i], true);
                                            masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = i;
                                        }
                                    }
                                    //also check check for the lowestpos with the new input
                                    rsltValid = _isValid(lowestPos, masksets[rslt["activeMasksetIndex"]], c, true);
                                    if (rsltValid !== false) {
                                        setBufferElement(masksets[rslt["activeMasksetIndex"]]["buffer"], lowestPos, c, true);
                                        masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = lowestPos;
                                    }
                                    //console.log("ndx " + rslt["activeMasksetIndex"] + " validate " + masksets[rslt["activeMasksetIndex"]]["buffer"].join('') + " lv " + masksets[rslt["activeMasksetIndex"]]['lastValidPosition']);
                                    return rslt;
                                }
                            }
                        });
                    }
                    return results;
                }

                if (strict) {
                    var result = _isValid(pos, getActiveMaskSet(), c, strict); //only check validity in current mask when validating strict
                    if (result === true) {
                        result = { "pos": pos }; //always take a possible corrected maskposition into account
                    }
                    return result;
                }

                var results = [], result = false, currentActiveMasksetIndex = activeMasksetIndex,
                    actualBuffer = getActiveBuffer().slice(), actualLVP = getActiveMaskSet()["lastValidPosition"],
                    actualPrevious = seekPrevious(pos),
                    maskForwards = [];
                $.each(masksets, function (index, value) {
                    if (typeof (value) == "object") {
                        activeMasksetIndex = index;

                        var maskPos = pos;
                        var lvp = getActiveMaskSet()['lastValidPosition'],
                            rsltValid;
                        if (lvp == actualLVP) {
                            if ((maskPos - actualLVP) > 1) {
                                for (var i = lvp == -1 ? 0 : lvp; i < maskPos; i++) {
                                    rsltValid = _isValid(i, getActiveMaskSet(), actualBuffer[i], true);
                                    if (rsltValid === false) {
                                        break;
                                    } else {
                                        setBufferElement(getActiveBuffer(), i, actualBuffer[i], true);
                                        if (rsltValid === true) {
                                            rsltValid = { "pos": i }; //always take a possible corrected maskposition into account
                                        }
                                        var newValidPosition = rsltValid.pos || i;
                                        if (getActiveMaskSet()['lastValidPosition'] < newValidPosition)
                                            getActiveMaskSet()['lastValidPosition'] = newValidPosition; //set new position from isValid
                                    }
                                }
                            }
                            //does the input match on a further position?
                            if (!isMask(maskPos) && !_isValid(maskPos, getActiveMaskSet(), c, strict)) {
                                var maxForward = seekNext(maskPos) - maskPos;
                                for (var fw = 0; fw < maxForward; fw++) {
                                    if (_isValid(++maskPos, getActiveMaskSet(), c, strict) !== false)
                                        break;
                                }
                                maskForwards.push(activeMasksetIndex);
                                //console.log('maskforward ' + activeMasksetIndex + " pos " + pos + " maskPos " + maskPos);
                            }
                        }

                        if (getActiveMaskSet()['lastValidPosition'] >= actualLVP || activeMasksetIndex == currentActiveMasksetIndex) {
                            if (maskPos >= 0 && maskPos < getMaskLength()) {
                                result = _isValid(maskPos, getActiveMaskSet(), c, strict);
                                if (result !== false) {
                                    if (result === true) {
                                        result = { "pos": maskPos }; //always take a possible corrected maskposition into account
                                    }
                                    var newValidPosition = result.pos || maskPos;
                                    if (getActiveMaskSet()['lastValidPosition'] < newValidPosition)
                                        getActiveMaskSet()['lastValidPosition'] = newValidPosition; //set new position from isValid
                                }
                                //console.log("pos " + pos + " ndx " + activeMasksetIndex + " validate " + getActiveBuffer().join('') + " lv " + getActiveMaskSet()['lastValidPosition']);
                                results.push({ "activeMasksetIndex": index, "result": result });
                            }
                        }
                    }
                });
                activeMasksetIndex = currentActiveMasksetIndex; //reset activeMasksetIndex

                return PostProcessResults(maskForwards, results); //return results of the multiple mask validations
            }

            function determineActiveMasksetIndex() {
                var currentMasksetIndex = activeMasksetIndex,
                    highestValid = { "activeMasksetIndex": 0, "lastValidPosition": -1, "next": -1 };
                $.each(masksets, function (index, value) {
                    if (typeof (value) == "object") {
                        activeMasksetIndex = index;
                        if (getActiveMaskSet()['lastValidPosition'] > highestValid['lastValidPosition']) {
                            highestValid["activeMasksetIndex"] = index;
                            highestValid["lastValidPosition"] = getActiveMaskSet()['lastValidPosition'];
                            highestValid["next"] = seekNext(getActiveMaskSet()['lastValidPosition']);
                        } else if (getActiveMaskSet()['lastValidPosition'] == highestValid['lastValidPosition'] &&
                            (highestValid['next'] == -1 || highestValid['next'] > seekNext(getActiveMaskSet()['lastValidPosition']))) {
                            highestValid["activeMasksetIndex"] = index;
                            highestValid["lastValidPosition"] = getActiveMaskSet()['lastValidPosition'];
                            highestValid["next"] = seekNext(getActiveMaskSet()['lastValidPosition']);
                        }
                    }
                });

                activeMasksetIndex = highestValid["lastValidPosition"] != -1 && masksets[currentMasksetIndex]["lastValidPosition"] == highestValid["lastValidPosition"] ? currentMasksetIndex : highestValid["activeMasksetIndex"];
                if (currentMasksetIndex != activeMasksetIndex) {
                    clearBuffer(getActiveBuffer(), seekNext(highestValid["lastValidPosition"]), getMaskLength());
                    getActiveMaskSet()["writeOutBuffer"] = true;
                }
                $el.data('_inputmask')['activeMasksetIndex'] = activeMasksetIndex; //store the activeMasksetIndex
            }

            function isMask(pos) {
                var testPos = determineTestPosition(pos);
                var test = getActiveTests()[testPos];

                return test != undefined ? test.fn : false;
            }

            function determineTestPosition(pos) {
                return pos % getActiveTests().length;
            }

            function getMaskLength() {
                return opts.getMaskLength(getActiveBufferTemplate(), getActiveMaskSet()['greedy'], getActiveMaskSet()['repeat'], getActiveBuffer(), opts);
            }

            //pos: from position

            function seekNext(pos) {
                var maskL = getMaskLength();
                if (pos >= maskL) return maskL;
                var position = pos;
                while (++position < maskL && !isMask(position)) {
                }
                return position;
            }

            //pos: from position

            function seekPrevious(pos) {
                var position = pos;
                if (position <= 0) return 0;

                while (--position > 0 && !isMask(position)) {
                }
                ;
                return position;
            }

            function setBufferElement(buffer, position, element, autoPrepare) {
                if (autoPrepare) position = prepareBuffer(buffer, position);

                var test = getActiveTests()[determineTestPosition(position)];
                var elem = element;
                if (elem != undefined && test != undefined) {
                    switch (test.casing) {
                        case "upper":
                            elem = element.toUpperCase();
                            break;
                        case "lower":
                            elem = element.toLowerCase();
                            break;
                    }
                }

                buffer[position] = elem;
            }

            function getBufferElement(buffer, position, autoPrepare) {
                if (autoPrepare) position = prepareBuffer(buffer, position);
                return buffer[position];
            }

            //needed to handle the non-greedy mask repetitions

            function prepareBuffer(buffer, position) {
                var j;
                while (buffer[position] == undefined && buffer.length < getMaskLength()) {
                    j = 0;
                    while (getActiveBufferTemplate()[j] !== undefined) { //add a new buffer
                        buffer.push(getActiveBufferTemplate()[j++]);
                    }
                }

                return position;
            }

            function writeBuffer(input, buffer, caretPos) {
                input._valueSet(buffer.join(''));
                if (caretPos != undefined) {
                    caret(input, caretPos);
                }
            }

            function clearBuffer(buffer, start, end, stripNomasks) {
                for (var i = start, maskL = getMaskLength() ; i < end && i < maskL; i++) {
                    if (stripNomasks === true) {
                        if (!isMask(i))
                            setBufferElement(buffer, i, "");
                    } else
                        setBufferElement(buffer, i, getBufferElement(getActiveBufferTemplate().slice(), i, true));
                }
            }

            function setReTargetPlaceHolder(buffer, pos) {
                var testPos = determineTestPosition(pos);
                setBufferElement(buffer, pos, getBufferElement(getActiveBufferTemplate(), testPos));
            }

            function getPlaceHolder(pos) {
                return opts.placeholder.charAt(pos % opts.placeholder.length);
            }

            function checkVal(input, writeOut, strict, nptvl, intelliCheck) {
                var inputValue = nptvl != undefined ? nptvl.slice() : truncateInput(input._valueGet()).split('');

                $.each(masksets, function (ndx, ms) {
                    if (typeof (ms) == "object") {
                        ms["buffer"] = ms["_buffer"].slice();
                        ms["lastValidPosition"] = -1;
                        ms["p"] = -1;
                    }
                });
                if (strict !== true) activeMasksetIndex = 0;
                if (writeOut) input._valueSet(""); //initial clear
                var ml = getMaskLength();
                $.each(inputValue, function (ndx, charCode) {
                    if (intelliCheck === true) {
                        var p = getActiveMaskSet()["p"], lvp = p == -1 ? p : seekPrevious(p),
                            pos = lvp == -1 ? ndx : seekNext(lvp);
                        if ($.inArray(charCode, getActiveBufferTemplate().slice(lvp + 1, pos)) == -1) {
                            keypressEvent.call(input, undefined, true, charCode.charCodeAt(0), writeOut, strict, ndx);
                        }
                    } else {
                        keypressEvent.call(input, undefined, true, charCode.charCodeAt(0), writeOut, strict, ndx);
                        strict = strict || (ndx > 0 && ndx > getActiveMaskSet()["p"]);
                    }
                });

                if (strict === true && getActiveMaskSet()["p"] != -1) {
                    getActiveMaskSet()["lastValidPosition"] = seekPrevious(getActiveMaskSet()["p"]);
                }
            }

            function escapeRegex(str) {
                return $.inputmask.escapeRegex.call(this, str);
            }

            function truncateInput(inputValue) {
                return inputValue.replace(new RegExp("(" + escapeRegex(getActiveBufferTemplate().join('')) + ")*$"), "");
            }

            function clearOptionalTail(input) {
                var buffer = getActiveBuffer(), tmpBuffer = buffer.slice(), testPos, pos;
                for (var pos = tmpBuffer.length - 1; pos >= 0; pos--) {
                    var testPos = determineTestPosition(pos);
                    if (getActiveTests()[testPos].optionality) {
                        if (!isMask(pos) || !isValid(pos, buffer[pos], true))
                            tmpBuffer.pop();
                        else break;
                    } else break;
                }
                writeBuffer(input, tmpBuffer);
            }

            function unmaskedvalue($input, skipDatepickerCheck) {
                if (getActiveTests() && (skipDatepickerCheck === true || !$input.hasClass('hasDatepicker'))) {
                    //checkVal(input, false, true);
                    var umValue = $.map(getActiveBuffer(), function (element, index) {
                        return isMask(index) && isValid(index, element, true) ? element : null;
                    });
                    var unmaskedValue = (isRTL ? umValue.reverse() : umValue).join('');
                    return opts.onUnMask != undefined ? opts.onUnMask.call(this, getActiveBuffer().join(''), unmaskedValue) : unmaskedValue;
                } else {
                    return $input[0]._valueGet();
                }
            }

            function TranslatePosition(pos) {
                if (isRTL && typeof pos == 'number' && (!opts.greedy || opts.placeholder != "")) {
                    var bffrLght = getActiveBuffer().length;
                    pos = bffrLght - pos;
                }
                return pos;
            }

            function caret(input, begin, end) {
                var npt = input.jquery && input.length > 0 ? input[0] : input, range;
                if (typeof begin == 'number') {
                    begin = TranslatePosition(begin);
                    end = TranslatePosition(end);
                    if (!$(npt).is(':visible')) {
                        return;
                    }
                    end = (typeof end == 'number') ? end : begin;
                    npt.scrollLeft = npt.scrollWidth;
                    if (opts.insertMode == false && begin == end) end++; //set visualization for insert/overwrite mode
                    if (npt.setSelectionRange) {
                        npt.selectionStart = begin;
                        npt.selectionEnd = android ? begin : end;

                    } else if (npt.createTextRange) {
                        range = npt.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', begin);
                        range.select();
                    }
                } else {
                    if (!$(input).is(':visible')) {
                        return { "begin": 0, "end": 0 };
                    }
                    if (npt.setSelectionRange) {
                        begin = npt.selectionStart;
                        end = npt.selectionEnd;
                    } else if (document.selection && document.selection.createRange) {
                        range = document.selection.createRange();
                        begin = 0 - range.duplicate().moveStart('character', -100000);
                        end = begin + range.text.length;
                    }
                    begin = TranslatePosition(begin);
                    end = TranslatePosition(end);
                    return { "begin": begin, "end": end };
                }
            }

            function isComplete(buffer) { //return true / false / undefined (repeat *)
                if (opts.repeat == "*") return undefined;
                var complete = false, highestValidPosition = 0, currentActiveMasksetIndex = activeMasksetIndex;
                $.each(masksets, function (ndx, ms) {
                    if (typeof (ms) == "object") {
                        activeMasksetIndex = ndx;
                        var aml = seekPrevious(getMaskLength());
                        if (ms["lastValidPosition"] >= highestValidPosition && ms["lastValidPosition"] == aml) {
                            var msComplete = true;
                            for (var i = 0; i <= aml; i++) {
                                var mask = isMask(i), testPos = determineTestPosition(i);
                                if ((mask && (buffer[i] == undefined || buffer[i] == getPlaceHolder(i))) || (!mask && buffer[i] != getActiveBufferTemplate()[testPos])) {
                                    msComplete = false;
                                    break;
                                }
                            }
                            complete = complete || msComplete;
                            if (complete) //break loop
                                return false;
                        }
                        highestValidPosition = ms["lastValidPosition"];
                    }
                });
                activeMasksetIndex = currentActiveMasksetIndex; //reset activeMaskset
                return complete;
            }

            function isSelection(begin, end) {
                return isRTL ? (begin - end) > 1 || ((begin - end) == 1 && opts.insertMode) :
                    (end - begin) > 1 || ((end - begin) == 1 && opts.insertMode);
            }


            //private functions
            function installEventRuler(npt) {
                var events = $._data(npt).events;

                $.each(events, function (eventType, eventHandlers) {
                    $.each(eventHandlers, function (ndx, eventHandler) {
                        if (eventHandler.namespace == "inputmask") {
                            if (eventHandler.type != "setvalue") {
                                var handler = eventHandler.handler;
                                eventHandler.handler = function (e) {
                                    if (this.readOnly || this.disabled)
                                        e.preventDefault;
                                    else
                                        return handler.apply(this, arguments);
                                };
                            }
                        }
                    });
                });
            }

            function patchValueProperty(npt) {
                function PatchValhook(type) {
                    if ($.valHooks[type] == undefined || $.valHooks[type].inputmaskpatch != true) {
                        var valueGet = $.valHooks[type] && $.valHooks[type].get ? $.valHooks[type].get : function (elem) { return elem.value; };
                        var valueSet = $.valHooks[type] && $.valHooks[type].set ? $.valHooks[type].set : function (elem, value) {
                            elem.value = value;
                            return elem;
                        };

                        $.valHooks[type] = {
                            get: function (elem) {
                                var $elem = $(elem);
                                if ($elem.data('_inputmask')) {
                                    if ($elem.data('_inputmask')['opts'].autoUnmask)
                                        return $elem.inputmask('unmaskedvalue');
                                    else {
                                        var result = valueGet(elem),
                                            inputData = $elem.data('_inputmask'), masksets = inputData['masksets'],
                                            activeMasksetIndex = inputData['activeMasksetIndex'];
                                        return result != masksets[activeMasksetIndex]['_buffer'].join('') ? result : '';
                                    }
                                } else return valueGet(elem);
                            },
                            set: function (elem, value) {
                                var $elem = $(elem);
                                var result = valueSet(elem, value);
                                if ($elem.data('_inputmask')) $elem.triggerHandler('setvalue.inputmask');
                                return result;
                            },
                            inputmaskpatch: true
                        };
                    }
                }
                var valueProperty;
                if (Object.getOwnPropertyDescriptor)
                    valueProperty = Object.getOwnPropertyDescriptor(npt, "value");
                if (valueProperty && valueProperty.get) {
                    if (!npt._valueGet) {
                        var valueGet = valueProperty.get;
                        var valueSet = valueProperty.set;
                        npt._valueGet = function () {
                            return isRTL ? valueGet.call(this).split('').reverse().join('') : valueGet.call(this);
                        };
                        npt._valueSet = function (value) {
                            valueSet.call(this, isRTL ? value.split('').reverse().join('') : value);
                        };

                        Object.defineProperty(npt, "value", {
                            get: function () {
                                var $self = $(this), inputData = $(this).data('_inputmask'), masksets = inputData['masksets'],
                                    activeMasksetIndex = inputData['activeMasksetIndex'];
                                return inputData && inputData['opts'].autoUnmask ? $self.inputmask('unmaskedvalue') : valueGet.call(this) != masksets[activeMasksetIndex]['_buffer'].join('') ? valueGet.call(this) : '';
                            },
                            set: function (value) {
                                valueSet.call(this, value);
                                $(this).triggerHandler('setvalue.inputmask');
                            }
                        });
                    }
                } else if (document.__lookupGetter__ && npt.__lookupGetter__("value")) {
                    if (!npt._valueGet) {
                        var valueGet = npt.__lookupGetter__("value");
                        var valueSet = npt.__lookupSetter__("value");
                        npt._valueGet = function () {
                            return isRTL ? valueGet.call(this).split('').reverse().join('') : valueGet.call(this);
                        };
                        npt._valueSet = function (value) {
                            valueSet.call(this, isRTL ? value.split('').reverse().join('') : value);
                        };

                        npt.__defineGetter__("value", function () {
                            var $self = $(this), inputData = $(this).data('_inputmask'), masksets = inputData['masksets'],
                                activeMasksetIndex = inputData['activeMasksetIndex'];
                            return inputData && inputData['opts'].autoUnmask ? $self.inputmask('unmaskedvalue') : valueGet.call(this) != masksets[activeMasksetIndex]['_buffer'].join('') ? valueGet.call(this) : '';
                        });
                        npt.__defineSetter__("value", function (value) {
                            valueSet.call(this, value);
                            $(this).triggerHandler('setvalue.inputmask');
                        });
                    }
                } else {
                    if (!npt._valueGet) {
                        npt._valueGet = function () { return isRTL ? this.value.split('').reverse().join('') : this.value; };
                        npt._valueSet = function (value) { this.value = isRTL ? value.split('').reverse().join('') : value; };
                    }
                    PatchValhook(npt.type);
                }
            }

            //shift chars to left from start to end and put c at end position if defined
            function shiftL(start, end, c, maskJumps) {
                var buffer = getActiveBuffer();
                if (maskJumps !== false) //jumping over nonmask position
                    while (!isMask(start) && start - 1 >= 0) start--;
                for (var i = start; i < end && i < getMaskLength() ; i++) {
                    if (isMask(i)) {
                        setReTargetPlaceHolder(buffer, i);
                        var j = seekNext(i);
                        var p = getBufferElement(buffer, j);
                        if (p != getPlaceHolder(j)) {
                            if (j < getMaskLength() && isValid(i, p, true) !== false && getActiveTests()[determineTestPosition(i)].def == getActiveTests()[determineTestPosition(j)].def) {
                                setBufferElement(buffer, i, p, true);
                            } else {
                                if (isMask(i))
                                    break;
                            }
                        }
                    } else {
                        setReTargetPlaceHolder(buffer, i);
                    }
                }
                if (c != undefined)
                    setBufferElement(buffer, seekPrevious(end), c);

                if (getActiveMaskSet()["greedy"] == false) {
                    var trbuffer = truncateInput(buffer.join('')).split('');
                    buffer.length = trbuffer.length;
                    for (var i = 0, bl = buffer.length; i < bl; i++) {
                        buffer[i] = trbuffer[i];
                    }
                    if (buffer.length == 0) getActiveMaskSet()["buffer"] = getActiveBufferTemplate().slice();
                }
                return start; //return the used start position
            }

            function shiftR(start, end, c) {
                var buffer = getActiveBuffer();
                if (getBufferElement(buffer, start, true) != getPlaceHolder(start)) {
                    for (var i = seekPrevious(end) ; i > start && i >= 0; i--) {
                        if (isMask(i)) {
                            var j = seekPrevious(i);
                            var t = getBufferElement(buffer, j);
                            if (t != getPlaceHolder(j)) {
                                if (isValid(j, t, true) !== false && getActiveTests()[determineTestPosition(i)].def == getActiveTests()[determineTestPosition(j)].def) {
                                    setBufferElement(buffer, i, t, true);
                                    setReTargetPlaceHolder(buffer, j);
                                } //else break;
                            }
                        } else
                            setReTargetPlaceHolder(buffer, i);
                    }
                }
                if (c != undefined && getBufferElement(buffer, start) == getPlaceHolder(start))
                    setBufferElement(buffer, start, c);
                var lengthBefore = buffer.length;
                if (getActiveMaskSet()["greedy"] == false) {
                    var trbuffer = truncateInput(buffer.join('')).split('');
                    buffer.length = trbuffer.length;
                    for (var i = 0, bl = buffer.length; i < bl; i++) {
                        buffer[i] = trbuffer[i];
                    }
                    if (buffer.length == 0) getActiveMaskSet()["buffer"] = getActiveBufferTemplate().slice();
                }
                return end - (lengthBefore - buffer.length); //return new start position
            }

            ;


            function HandleRemove(input, k, pos) {
                if (opts.numericInput || isRTL) {
                    switch (k) {
                        case opts.keyCode.BACKSPACE:
                            k = opts.keyCode.DELETE;
                            break;
                        case opts.keyCode.DELETE:
                            k = opts.keyCode.BACKSPACE;
                            break;
                    }
                    if (isRTL) {
                        var pend = pos.end;
                        pos.end = pos.begin;
                        pos.begin = pend;
                    }
                }

                var isSelection = true;
                if (pos.begin == pos.end) {
                    var posBegin = k == opts.keyCode.BACKSPACE ? pos.begin - 1 : pos.begin;
                    if (opts.isNumeric && opts.radixPoint != "" && getActiveBuffer()[posBegin] == opts.radixPoint) {
                        pos.begin = (getActiveBuffer().length - 1 == posBegin) /* radixPoint is latest? delete it */ ? pos.begin : k == opts.keyCode.BACKSPACE ? posBegin : seekNext(posBegin);
                        pos.end = pos.begin;
                    }
                    isSelection = false;
                    if (k == opts.keyCode.BACKSPACE)
                        pos.begin--;
                    else if (k == opts.keyCode.DELETE)
                        pos.end++;
                } else if (pos.end - pos.begin == 1 && !opts.insertMode) {
                    isSelection = false;
                    if (k == opts.keyCode.BACKSPACE)
                        pos.begin--;
                }

                clearBuffer(getActiveBuffer(), pos.begin, pos.end);

                var ml = getMaskLength();
                if (opts.greedy == false) {
                    shiftL(pos.begin, ml, undefined, !isRTL && (k == opts.keyCode.BACKSPACE && !isSelection));
                } else {
                    var newpos = pos.begin;
                    for (var i = pos.begin; i < pos.end; i++) { //seeknext to skip placeholders at start in selection
                        if (isMask(i) || !isSelection)
                            newpos = shiftL(pos.begin, ml, undefined, !isRTL && (k == opts.keyCode.BACKSPACE && !isSelection));
                    }
                    if (!isSelection) pos.begin = newpos;
                }
                var firstMaskPos = seekNext(-1);
                clearBuffer(getActiveBuffer(), pos.begin, pos.end, true);
                checkVal(input, false, masksets[1] == undefined || firstMaskPos >= pos.end, getActiveBuffer());
                if (getActiveMaskSet()['lastValidPosition'] < firstMaskPos) {
                    getActiveMaskSet()["lastValidPosition"] = -1;
                    getActiveMaskSet()["p"] = firstMaskPos;
                } else {
                    getActiveMaskSet()["p"] = pos.begin;
                }
            }

            function keydownEvent(e) {
                //Safari 5.1.x - modal dialog fires keypress twice workaround
                skipKeyPressEvent = false;
                var input = this, $input = $(input), k = e.keyCode, pos = caret(input);

                //backspace, delete, and escape get special treatment
                if (k == opts.keyCode.BACKSPACE || k == opts.keyCode.DELETE || (iphone && k == 127) || e.ctrlKey && k == 88) { //backspace/delete
                    e.preventDefault(); //stop default action but allow propagation
                    if (k == 88) valueOnFocus = getActiveBuffer().join('');
                    HandleRemove(input, k, pos);
                    determineActiveMasksetIndex();
                    writeBuffer(input, getActiveBuffer(), getActiveMaskSet()["p"]);
                    if (input._valueGet() == getActiveBufferTemplate().join(''))
                        $input.trigger('cleared');

                    if (opts.showTooltip) { //update tooltip
                        $input.prop("title", getActiveMaskSet()["mask"]);
                    }
                } else if (k == opts.keyCode.END || k == opts.keyCode.PAGE_DOWN) { //when END or PAGE_DOWN pressed set position at lastmatch
                    setTimeout(function () {
                        var caretPos = seekNext(getActiveMaskSet()["lastValidPosition"]);
                        if (!opts.insertMode && caretPos == getMaskLength() && !e.shiftKey) caretPos--;
                        caret(input, e.shiftKey ? pos.begin : caretPos, caretPos);
                    }, 0);
                } else if ((k == opts.keyCode.HOME && !e.shiftKey) || k == opts.keyCode.PAGE_UP) { //Home or page_up
                    caret(input, 0, e.shiftKey ? pos.begin : 0);
                } else if (k == opts.keyCode.ESCAPE || (k == 90 && e.ctrlKey)) { //escape && undo
                    checkVal(input, true, false, valueOnFocus.split(''));
                    $input.click();
                } else if (k == opts.keyCode.INSERT && !(e.shiftKey || e.ctrlKey)) { //insert
                    opts.insertMode = !opts.insertMode;
                    caret(input, !opts.insertMode && pos.begin == getMaskLength() ? pos.begin - 1 : pos.begin);
                } else if (opts.insertMode == false && !e.shiftKey) {
                    if (k == opts.keyCode.RIGHT) {
                        setTimeout(function () {
                            var caretPos = caret(input);
                            caret(input, caretPos.begin);
                        }, 0);
                    } else if (k == opts.keyCode.LEFT) {
                        setTimeout(function () {
                            var caretPos = caret(input);
                            caret(input, caretPos.begin - 1);
                        }, 0);
                    }
                }

                var currentCaretPos = caret(input);
                if (opts.onKeyDown.call(this, e, getActiveBuffer(), opts) === true) //extra stuff to execute on keydown
                    caret(input, currentCaretPos.begin, currentCaretPos.end);
                ignorable = $.inArray(k, opts.ignorables) != -1;
            }


            function keypressEvent(e, checkval, k, writeOut, strict, ndx) {
                //Safari 5.1.x - modal dialog fires keypress twice workaround
                if (k == undefined && skipKeyPressEvent) return false;
                skipKeyPressEvent = true;

                var input = this, $input = $(input);

                e = e || window.event;
                var k = checkval ? k : (e.which || e.charCode || e.keyCode);

                if (checkval !== true && (!(e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable))) {
                    return true;
                } else {
                    if (k) {
                        //special treat the decimal separator
                        if (checkval !== true && k == 46 && e.shiftKey == false && opts.radixPoint == ",") k = 44;

                        var pos, results, result, c = String.fromCharCode(k);
                        if (checkval) {
                            var pcaret = strict ? ndx : getActiveMaskSet()["lastValidPosition"] + 1;
                            pos = { begin: pcaret, end: pcaret };
                        } else {
                            pos = caret(input);
                        }

                        //should we clear a possible selection??
                        var isSlctn = isSelection(pos.begin, pos.end),
                            initialIndex = activeMasksetIndex;
                        if (isSlctn) {
                            $.each(masksets, function (ndx, lmnt) { //init undobuffer for recovery when not valid
                                if (typeof (lmnt) == "object") {
                                    activeMasksetIndex = ndx;
                                    getActiveMaskSet()["undoBuffer"] = getActiveBuffer().join('');
                                }
                            });
                            activeMasksetIndex = initialIndex; //restore index
                            HandleRemove(input, opts.keyCode.DELETE, pos);
                            if (!opts.insertMode) { //preserve some space
                                $.each(masksets, function (ndx, lmnt) {
                                    if (typeof (lmnt) == "object") {
                                        activeMasksetIndex = ndx;
                                        shiftR(pos.begin, getMaskLength());
                                        getActiveMaskSet()["lastValidPosition"] = seekNext(getActiveMaskSet()["lastValidPosition"]);
                                    }
                                });
                            }
                            activeMasksetIndex = initialIndex; //restore index
                        }

                        var radixPosition = getActiveBuffer().join('').indexOf(opts.radixPoint);
                        if (opts.isNumeric && checkval !== true && radixPosition != -1) {
                            if (opts.greedy && pos.begin <= radixPosition) {
                                pos.begin = seekPrevious(pos.begin);
                                pos.end = pos.begin;
                            } else if (c == opts.radixPoint) {
                                pos.begin = radixPosition;
                                pos.end = pos.begin;
                            }
                        }


                        var p = pos.begin;
                        results = isValid(p, c, strict);
                        if (strict === true) results = [{ "activeMasksetIndex": activeMasksetIndex, "result": results }];
                        var minimalForwardPosition = -1;
                        $.each(results, function (index, result) {
                            activeMasksetIndex = result["activeMasksetIndex"];
                            getActiveMaskSet()["writeOutBuffer"] = true;
                            var np = result["result"];
                            if (np !== false) {
                                var refresh = false, buffer = getActiveBuffer();
                                if (np !== true) {
                                    refresh = np["refresh"]; //only rewrite buffer from isValid
                                    p = np.pos != undefined ? np.pos : p; //set new position from isValid
                                    c = np.c != undefined ? np.c : c; //set new char from isValid
                                }
                                if (refresh !== true) {
                                    if (opts.insertMode == true) {
                                        var lastUnmaskedPosition = getMaskLength();
                                        var bfrClone = buffer.slice();
                                        while (getBufferElement(bfrClone, lastUnmaskedPosition, true) != getPlaceHolder(lastUnmaskedPosition) && lastUnmaskedPosition >= p) {
                                            lastUnmaskedPosition = lastUnmaskedPosition == 0 ? -1 : seekPrevious(lastUnmaskedPosition);
                                        }
                                        if (lastUnmaskedPosition >= p) {
                                            shiftR(p, getMaskLength(), c);
                                            //shift the lvp if needed
                                            var lvp = getActiveMaskSet()["lastValidPosition"], nlvp = seekNext(lvp);
                                            if (nlvp != getMaskLength() && lvp >= p && (getBufferElement(getActiveBuffer().slice(), nlvp, true) != getPlaceHolder(nlvp))) {
                                                getActiveMaskSet()["lastValidPosition"] = nlvp;
                                            }
                                        } else getActiveMaskSet()["writeOutBuffer"] = false;
                                    } else setBufferElement(buffer, p, c, true);
                                    if (minimalForwardPosition == -1 || minimalForwardPosition > seekNext(p)) {
                                        minimalForwardPosition = seekNext(p);
                                    }
                                } else if (!strict) {
                                    var nextPos = p < getMaskLength() ? p + 1 : p;
                                    if (minimalForwardPosition == -1 || minimalForwardPosition > nextPos) {
                                        minimalForwardPosition = nextPos;
                                    }
                                }
                                if (minimalForwardPosition > getActiveMaskSet()["p"])
                                    getActiveMaskSet()["p"] = minimalForwardPosition; //needed for checkval strict 
                            }
                        });

                        if (strict !== true) {
                            activeMasksetIndex = initialIndex;
                            determineActiveMasksetIndex();
                        }
                        if (writeOut !== false) {
                            $.each(results, function (ndx, rslt) {
                                if (rslt["activeMasksetIndex"] == activeMasksetIndex) {
                                    result = rslt;
                                    return false;
                                }
                            });
                            if (result != undefined) {
                                var self = this;
                                setTimeout(function () { opts.onKeyValidation.call(self, result["result"], opts); }, 0);
                                if (getActiveMaskSet()["writeOutBuffer"] && result["result"] !== false) {
                                    var buffer = getActiveBuffer();

                                    var newCaretPosition;
                                    if (checkval) {
                                        newCaretPosition = undefined;
                                    } else if (opts.numericInput) {
                                        if (p > radixPosition) {
                                            newCaretPosition = seekPrevious(minimalForwardPosition);
                                        } else if (c == opts.radixPoint) {
                                            newCaretPosition = minimalForwardPosition - 1;
                                        } else newCaretPosition = seekPrevious(minimalForwardPosition - 1);
                                    } else {
                                        newCaretPosition = minimalForwardPosition;
                                    }

                                    writeBuffer(input, buffer, newCaretPosition);
                                    if (checkval !== true) {
                                        setTimeout(function () { //timeout needed for IE
                                            if (isComplete(buffer) === true)
                                                $input.trigger("complete");
                                            skipInputEvent = true;
                                            $input.trigger("input");
                                        }, 0);
                                    }
                                } else if (isSlctn) {
                                    getActiveMaskSet()["buffer"] = getActiveMaskSet()["undoBuffer"].split('');
                                }
                            }
                        }

                        if (opts.showTooltip) { //update tooltip
                            $input.prop("title", getActiveMaskSet()["mask"]);
                        }

                        //needed for IE8 and below
                        if (e) e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    }
                }
            }

            function keyupEvent(e) {
                var $input = $(this), input = this, k = e.keyCode, buffer = getActiveBuffer();

                opts.onKeyUp.call(this, e, buffer, opts); //extra stuff to execute on keyup
                if (k == opts.keyCode.TAB && opts.showMaskOnFocus) {
                    if ($input.hasClass('focus.inputmask') && input._valueGet().length == 0) {
                        buffer = getActiveBufferTemplate().slice();
                        writeBuffer(input, buffer);
                        caret(input, 0);
                        valueOnFocus = getActiveBuffer().join('');
                    } else {
                        writeBuffer(input, buffer);
                        if (buffer.join('') == getActiveBufferTemplate().join('') && $.inArray(opts.radixPoint, buffer) != -1) {
                            caret(input, TranslatePosition(0));
                            $input.click();
                        } else
                            caret(input, TranslatePosition(0), TranslatePosition(getMaskLength()));
                    }
                }
            }

            function pasteEvent(e) {
                if (skipInputEvent === true && e.type == "input") {
                    skipInputEvent = false;
                    return true;
                }

                var input = this, $input = $(input);
                //paste event for IE8 and lower I guess ;-)
                if (e.type == "propertychange" && input._valueGet().length <= getMaskLength()) {
                    return true;
                }
                setTimeout(function () {
                    var pasteValue = opts.onBeforePaste != undefined ? opts.onBeforePaste.call(this, input._valueGet()) : input._valueGet();
                    checkVal(input, false, false, pasteValue.split(''), true);
                    writeBuffer(input, getActiveBuffer());
                    if (isComplete(getActiveBuffer()) === true)
                        $input.trigger("complete");
                    $input.click();
                }, 0);
            }

            function mobileInputEvent(e) {
                if (skipInputEvent === true) {
                    skipInputEvent = false;
                    return true;
                }
                var input = this, $input = $(input);

                //backspace in chrome32 only fires input event - detect & treat
                var caretPos = caret(input),
                    currentValue = input._valueGet();

                if (currentValue.charAt(caretPos.begin) != getActiveBuffer()[caretPos.begin]
                    && currentValue.charAt(caretPos.begin + 1) != getActiveBuffer()[caretPos.begin]
                    && !isMask(caretPos.begin)) {
                    e.keyCode = opts.keyCode.BACKSPACE;
                    keydownEvent.call(input, e);
                } else { //nonnumerics don't fire keypress 
                    checkVal(input, false, false);
                    writeBuffer(input, getActiveBuffer());
                    if (isComplete(getActiveBuffer()) === true)
                        $input.trigger("complete");
                    $input.click();
                }
                e.preventDefault();
            }

            function mask(el) {
                $el = $(el);
                if ($el.is(":input")) {
                    //store tests & original buffer in the input element - used to get the unmasked value
                    $el.data('_inputmask', {
                        'masksets': masksets,
                        'activeMasksetIndex': activeMasksetIndex,
                        'opts': opts,
                        'isRTL': false
                    });

                    //show tooltip
                    if (opts.showTooltip) {
                        $el.prop("title", getActiveMaskSet()["mask"]);
                    }

                    //correct greedy setting if needed
                    getActiveMaskSet()['greedy'] = getActiveMaskSet()['greedy'] ? getActiveMaskSet()['greedy'] : getActiveMaskSet()['repeat'] == 0;

                    //handle maxlength attribute
                    if ($el.attr("maxLength") != null) //only when the attribute is set
                    {
                        var maxLength = $el.prop('maxLength');
                        if (maxLength > -1) { //handle *-repeat
                            $.each(masksets, function (ndx, ms) {
                                if (typeof (ms) == "object") {
                                    if (ms["repeat"] == "*") {
                                        ms["repeat"] = maxLength;
                                    }
                                }
                            });
                        }
                        if (getMaskLength() >= maxLength && maxLength > -1) { //FF sets no defined max length to -1 
                            if (maxLength < getActiveBufferTemplate().length) getActiveBufferTemplate().length = maxLength;
                            if (getActiveMaskSet()['greedy'] == false) {
                                getActiveMaskSet()['repeat'] = Math.round(maxLength / getActiveBufferTemplate().length);
                            }
                            $el.prop('maxLength', getMaskLength() * 2);
                        }
                    }

                    patchValueProperty(el);

                    if (opts.numericInput) opts.isNumeric = opts.numericInput;
                    if (el.dir == "rtl" || (opts.numericInput && opts.rightAlignNumerics) || (opts.isNumeric && opts.rightAlignNumerics))
                        $el.css("text-align", "right");

                    if (el.dir == "rtl" || opts.numericInput) {
                        el.dir = "ltr";
                        $el.removeAttr("dir");
                        var inputData = $el.data('_inputmask');
                        inputData['isRTL'] = true;
                        $el.data('_inputmask', inputData);
                        isRTL = true;
                    }

                    //unbind all events - to make sure that no other mask will interfere when re-masking
                    $el.unbind(".inputmask");
                    $el.removeClass('focus.inputmask');
                    //bind events
                    $el.closest('form').bind("submit", function () { //trigger change on submit if any
                        if (valueOnFocus != getActiveBuffer().join('')) {
                            $el.change();
                        }
                    }).bind('reset', function () {
                        setTimeout(function () {
                            $el.trigger("setvalue");
                        }, 0);
                    });
                    $el.bind("mouseenter.inputmask", function () {
                        var $input = $(this), input = this;
                        if (!$input.hasClass('focus.inputmask') && opts.showMaskOnHover) {
                            if (input._valueGet() != getActiveBuffer().join('')) {
                                writeBuffer(input, getActiveBuffer());
                            }
                        }
                    }).bind("blur.inputmask", function () {
                        var $input = $(this), input = this, nptValue = input._valueGet(), buffer = getActiveBuffer();
                        $input.removeClass('focus.inputmask');
                        if (valueOnFocus != getActiveBuffer().join('')) {
                            $input.change();
                        }
                        if (opts.clearMaskOnLostFocus && nptValue != '') {
                            if (nptValue == getActiveBufferTemplate().join(''))
                                input._valueSet('');
                            else { //clearout optional tail of the mask
                                clearOptionalTail(input);
                            }
                        }
                        if (isComplete(buffer) === false) {
                            $input.trigger("incomplete");
                            if (opts.clearIncomplete) {
                                $.each(masksets, function (ndx, ms) {
                                    if (typeof (ms) == "object") {
                                        ms["buffer"] = ms["_buffer"].slice();
                                        ms["lastValidPosition"] = -1;
                                    }
                                });
                                activeMasksetIndex = 0;
                                if (opts.clearMaskOnLostFocus)
                                    input._valueSet('');
                                else {
                                    buffer = getActiveBufferTemplate().slice();
                                    writeBuffer(input, buffer);
                                }
                            }
                        }
                    }).bind("focus.inputmask", function () {
                        var $input = $(this), input = this, nptValue = input._valueGet();
                        if (opts.showMaskOnFocus && !$input.hasClass('focus.inputmask') && (!opts.showMaskOnHover || (opts.showMaskOnHover && nptValue == ''))) {
                            if (input._valueGet() != getActiveBuffer().join('')) {
                                writeBuffer(input, getActiveBuffer(), seekNext(getActiveMaskSet()["lastValidPosition"]));
                            }
                        }
                        $input.addClass('focus.inputmask');
                        valueOnFocus = getActiveBuffer().join('');
                    }).bind("mouseleave.inputmask", function () {
                        var $input = $(this), input = this;
                        if (opts.clearMaskOnLostFocus) {
                            if (!$input.hasClass('focus.inputmask') && input._valueGet() != $input.attr("placeholder")) {
                                if (input._valueGet() == getActiveBufferTemplate().join('') || input._valueGet() == '')
                                    input._valueSet('');
                                else { //clearout optional tail of the mask
                                    clearOptionalTail(input);
                                }
                            }
                        }
                    }).bind("click.inputmask", function () {
                        var input = this;
                        setTimeout(function () {
                            var selectedCaret = caret(input), buffer = getActiveBuffer();
                            if (selectedCaret.begin == selectedCaret.end) {
                                var clickPosition = isRTL ? TranslatePosition(selectedCaret.begin) : selectedCaret.begin,
                                    lvp = getActiveMaskSet()["lastValidPosition"],
                                    lastPosition;
                                if (opts.isNumeric) {
                                    lastPosition = opts.skipRadixDance === false && opts.radixPoint != "" && $.inArray(opts.radixPoint, buffer) != -1 ?
                                        (opts.numericInput ? seekNext($.inArray(opts.radixPoint, buffer)) : $.inArray(opts.radixPoint, buffer)) :
                                        seekNext(lvp);
                                } else {
                                    lastPosition = seekNext(lvp);
                                }
                                if (clickPosition < lastPosition) {
                                    if (isMask(clickPosition))
                                        caret(input, clickPosition);
                                    else caret(input, seekNext(clickPosition));
                                } else
                                    caret(input, lastPosition);
                            }
                        }, 0);
                    }).bind('dblclick.inputmask', function () {
                        var input = this;
                        setTimeout(function () {
                            caret(input, 0, seekNext(getActiveMaskSet()["lastValidPosition"]));
                        }, 0);
                    }).bind(PasteEventType + ".inputmask dragdrop.inputmask drop.inputmask", pasteEvent
                    ).bind('setvalue.inputmask', function () {
                        var input = this;
                        checkVal(input, true);
                        valueOnFocus = getActiveBuffer().join('');
                        if (input._valueGet() == getActiveBufferTemplate().join(''))
                            input._valueSet('');
                    }).bind('complete.inputmask', opts.oncomplete
                    ).bind('incomplete.inputmask', opts.onincomplete
                    ).bind('cleared.inputmask', opts.oncleared);

                    $el.bind("keydown.inputmask", keydownEvent
                         ).bind("keypress.inputmask", keypressEvent
                         ).bind("keyup.inputmask", keyupEvent);

                    if (android) {
                        if (androidchrome) {
                            $el.bind("input.inputmask", mobileInputEvent);
                        } else if (PasteEventType != "input") {
                            $el.bind("input.inputmask", pasteEvent);
                        }
                    }
                    if (androidfirefox) {
                        if (PasteEventType == "input") {
                            $el.unbind(PasteEventType + ".inputmask");
                        }
                        $el.bind("input.inputmask", mobileInputEvent);
                    }

                    if (msie1x)
                        $el.bind("input.inputmask", pasteEvent);

                    //apply mask
                    var initialValue = opts.onBeforeMask != undefined ? opts.onBeforeMask.call(this, el._valueGet()) : el._valueGet();
                    checkVal(el, true, false, initialValue.split(''));
                    valueOnFocus = getActiveBuffer().join('');
                    // Wrap document.activeElement in a try/catch block since IE9 throw "Unspecified error" if document.activeElement is undefined when we are in an IFrame.
                    var activeElement;
                    try {
                        activeElement = document.activeElement;
                    } catch (e) {
                    }
                    if (activeElement === el) { //position the caret when in focus
                        $el.addClass('focus.inputmask');
                        caret(el, seekNext(getActiveMaskSet()["lastValidPosition"]));
                    } else if (opts.clearMaskOnLostFocus) {
                        if (getActiveBuffer().join('') == getActiveBufferTemplate().join('')) {
                            el._valueSet('');
                        } else {
                            clearOptionalTail(el);
                        }
                    } else {
                        writeBuffer(el, getActiveBuffer());
                    }

                    installEventRuler(el);
                }
            }

            //action object
            if (actionObj != undefined) {
                switch (actionObj["action"]) {
                    case "isComplete":
                        return isComplete(actionObj["buffer"]);
                    case "unmaskedvalue":
                        isRTL = actionObj["$input"].data('_inputmask')['isRTL'];
                        return unmaskedvalue(actionObj["$input"], actionObj["skipDatepickerCheck"]);
                    case "mask":
                        mask(actionObj["el"]);
                        break;
                    case "format":
                        $el = $({});
                        $el.data('_inputmask', {
                            'masksets': masksets,
                            'activeMasksetIndex': activeMasksetIndex,
                            'opts': opts,
                            'isRTL': opts.numericInput
                        });
                        if (opts.numericInput) {
                            opts.isNumeric = opts.numericInput;
                            isRTL = true;
                        }

                        checkVal($el, false, false, actionObj["value"].split(''), true);
                        return getActiveBuffer().join('');
                    case "isValid":
                        $el = $({});
                        $el.data('_inputmask', {
                            'masksets': masksets,
                            'activeMasksetIndex': activeMasksetIndex,
                            'opts': opts,
                            'isRTL': opts.numericInput
                        });
                        if (opts.numericInput) {
                            opts.isNumeric = opts.numericInput;
                            isRTL = true;
                        }

                        checkVal($el, false, true, actionObj["value"].split(''));
                        return isComplete(getActiveBuffer());
                }
            }
        };

        $.inputmask = {
            //options default
            defaults: {
                placeholder: "_",
                optionalmarker: { start: "[", end: "]" },
                quantifiermarker: { start: "{", end: "}" },
                groupmarker: { start: "(", end: ")" },
                escapeChar: "\\",
                mask: null,
                oncomplete: $.noop, //executes when the mask is complete
                onincomplete: $.noop, //executes when the mask is incomplete and focus is lost
                oncleared: $.noop, //executes when the mask is cleared
                repeat: 0, //repetitions of the mask: * ~ forever, otherwise specify an integer
                greedy: true, //true: allocated buffer for the mask and repetitions - false: allocate only if needed
                autoUnmask: false, //automatically unmask when retrieving the value with $.fn.val or value if the browser supports __lookupGetter__ or getOwnPropertyDescriptor
                clearMaskOnLostFocus: true,
                insertMode: true, //insert the input or overwrite the input
                clearIncomplete: false, //clear the incomplete input on blur
                aliases: {}, //aliases definitions => see jquery.inputmask.extensions.js
                onKeyUp: $.noop, //override to implement autocomplete on certain keys for example
                onKeyDown: $.noop, //override to implement autocomplete on certain keys for example
                onBeforeMask: undefined, //executes before masking the initial value to allow preprocessing of the initial value.  args => initialValue => return processedValue
                onBeforePaste: undefined, //executes before masking the pasted value to allow preprocessing of the pasted value.  args => pastedValue => return processedValue
                onUnMask: undefined, //executes after unmasking to allow postprocessing of the unmaskedvalue.  args => maskedValue, unmaskedValue
                showMaskOnFocus: true, //show the mask-placeholder when the input has focus
                showMaskOnHover: true, //show the mask-placeholder when hovering the empty input
                onKeyValidation: $.noop, //executes on every key-press with the result of isValid. Params: result, opts
                skipOptionalPartCharacter: " ", //a character which can be used to skip an optional part of a mask
                showTooltip: false, //show the activemask as tooltip
                numericInput: false, //numericInput input direction style (input shifts to the left while holding the caret position)
                //numeric basic properties
                isNumeric: false, //enable numeric features
                radixPoint: "", //".", // | ","
                skipRadixDance: false, //disable radixpoint caret positioning
                rightAlignNumerics: true, //align numerics to the right
                //numeric basic properties
                definitions: {
                    '9': {
                        validator: "[0-9]",
                        cardinality: 1,
                        definitionSymbol: "*"
                    },
                    'a': {
                        validator: "[A-Za-z\u0410-\u044F\u0401\u0451]",
                        cardinality: 1,
                        definitionSymbol: "*"
                    },
                    '*': {
                        validator: "[A-Za-z\u0410-\u044F\u0401\u04510-9]",
                        cardinality: 1
                    }
                },
                keyCode: {
                    ALT: 18, BACKSPACE: 8, CAPS_LOCK: 20, COMMA: 188, COMMAND: 91, COMMAND_LEFT: 91, COMMAND_RIGHT: 93, CONTROL: 17, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, INSERT: 45, LEFT: 37, MENU: 93, NUMPAD_ADD: 107, NUMPAD_DECIMAL: 110, NUMPAD_DIVIDE: 111, NUMPAD_ENTER: 108,
                    NUMPAD_MULTIPLY: 106, NUMPAD_SUBTRACT: 109, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SHIFT: 16, SPACE: 32, TAB: 9, UP: 38, WINDOWS: 91
                },
                //specify keycodes which should not be considered in the keypress event, otherwise the preventDefault will stop their default behavior especially in FF
                ignorables: [8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
                getMaskLength: function (buffer, greedy, repeat, currentBuffer, opts) {
                    var calculatedLength = buffer.length;
                    if (!greedy) {
                        if (repeat == "*") {
                            calculatedLength = currentBuffer.length + 1;
                        } else if (repeat > 1) {
                            calculatedLength += (buffer.length * (repeat - 1));
                        }
                    }
                    return calculatedLength;
                }
            },
            escapeRegex: function (str) {
                var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
                return str.replace(new RegExp('(\\' + specials.join('|\\') + ')', 'gim'), '\\$1');
            },
            format: function (value, options) {
                var opts = $.extend(true, {}, $.inputmask.defaults, options);
                resolveAlias(opts.alias, options, opts);
                return maskScope(generateMaskSets(opts), 0, opts, { "action": "format", "value": value });
            },
            isValid: function (value, options) {
                var opts = $.extend(true, {}, $.inputmask.defaults, options);
                resolveAlias(opts.alias, options, opts);
                return maskScope(generateMaskSets(opts), 0, opts, { "action": "isValid", "value": value });
            }
        };

        $.fn.inputmask = function (fn, options) {
            var opts = $.extend(true, {}, $.inputmask.defaults, options),
                masksets,
                activeMasksetIndex = 0;

            if (typeof fn === "string") {
                switch (fn) {
                    case "mask":
                        //resolve possible aliases given by options
                        resolveAlias(opts.alias, options, opts);
                        masksets = generateMaskSets(opts);
                        if (masksets.length == 0) { return this; }

                        return this.each(function () {
                            maskScope($.extend(true, {}, masksets), 0, opts, { "action": "mask", "el": this });
                        });
                    case "unmaskedvalue":
                        var $input = $(this), input = this;
                        if ($input.data('_inputmask')) {
                            masksets = $input.data('_inputmask')['masksets'];
                            activeMasksetIndex = $input.data('_inputmask')['activeMasksetIndex'];
                            opts = $input.data('_inputmask')['opts'];
                            return maskScope(masksets, activeMasksetIndex, opts, { "action": "unmaskedvalue", "$input": $input });
                        } else return $input.val();
                    case "remove":
                        return this.each(function () {
                            var $input = $(this), input = this;
                            if ($input.data('_inputmask')) {
                                masksets = $input.data('_inputmask')['masksets'];
                                activeMasksetIndex = $input.data('_inputmask')['activeMasksetIndex'];
                                opts = $input.data('_inputmask')['opts'];
                                //writeout the unmaskedvalue
                                input._valueSet(maskScope(masksets, activeMasksetIndex, opts, { "action": "unmaskedvalue", "$input": $input, "skipDatepickerCheck": true }));
                                //clear data
                                $input.removeData('_inputmask');
                                //unbind all events
                                $input.unbind(".inputmask");
                                $input.removeClass('focus.inputmask');
                                //restore the value property
                                var valueProperty;
                                if (Object.getOwnPropertyDescriptor)
                                    valueProperty = Object.getOwnPropertyDescriptor(input, "value");
                                if (valueProperty && valueProperty.get) {
                                    if (input._valueGet) {
                                        Object.defineProperty(input, "value", {
                                            get: input._valueGet,
                                            set: input._valueSet
                                        });
                                    }
                                } else if (document.__lookupGetter__ && input.__lookupGetter__("value")) {
                                    if (input._valueGet) {
                                        input.__defineGetter__("value", input._valueGet);
                                        input.__defineSetter__("value", input._valueSet);
                                    }
                                }
                                try { //try catch needed for IE7 as it does not supports deleting fns
                                    delete input._valueGet;
                                    delete input._valueSet;
                                } catch (e) {
                                    input._valueGet = undefined;
                                    input._valueSet = undefined;

                                }
                            }
                        });
                        break;
                    case "getemptymask": //return the default (empty) mask value, usefull for setting the default value in validation
                        if (this.data('_inputmask')) {
                            masksets = this.data('_inputmask')['masksets'];
                            activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                            return masksets[activeMasksetIndex]['_buffer'].join('');
                        }
                        else return "";
                    case "hasMaskedValue": //check wheter the returned value is masked or not; currently only works reliable when using jquery.val fn to retrieve the value 
                        return this.data('_inputmask') ? !this.data('_inputmask')['opts'].autoUnmask : false;
                    case "isComplete":
                        masksets = this.data('_inputmask')['masksets'];
                        activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                        opts = this.data('_inputmask')['opts'];
                        return maskScope(masksets, activeMasksetIndex, opts, { "action": "isComplete", "buffer": this[0]._valueGet().split('') });
                    case "getmetadata": //return mask metadata if exists
                        if (this.data('_inputmask')) {
                            masksets = this.data('_inputmask')['masksets'];
                            activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                            return masksets[activeMasksetIndex]['metadata'];
                        }
                        else return undefined;
                    default:
                        //check if the fn is an alias
                        if (!resolveAlias(fn, options, opts)) {
                            //maybe fn is a mask so we try
                            //set mask
                            opts.mask = fn;
                        }
                        masksets = generateMaskSets(opts);
                        if (masksets.length == 0) { return this; }
                        return this.each(function () {
                            maskScope($.extend(true, {}, masksets), activeMasksetIndex, opts, { "action": "mask", "el": this });
                        });

                        break;
                }
            } else if (typeof fn == "object") {
                opts = $.extend(true, {}, $.inputmask.defaults, fn);

                resolveAlias(opts.alias, fn, opts); //resolve aliases
                masksets = generateMaskSets(opts);
                if (masksets.length == 0) { return this; }
                return this.each(function () {
                    maskScope($.extend(true, {}, masksets), activeMasksetIndex, opts, { "action": "mask", "el": this });
                });
            } else if (fn == undefined) {
                //look for data-inputmask atribute - the attribute should only contain optipns
                return this.each(function () {
                    var attrOptions = $(this).attr("data-inputmask");
                    if (attrOptions && attrOptions != "") {
                        try {
                            attrOptions = attrOptions.replace(new RegExp("'", "g"), '"');
                            var dataoptions = $.parseJSON("{" + attrOptions + "}");
                            $.extend(true, dataoptions, options);
                            opts = $.extend(true, {}, $.inputmask.defaults, dataoptions);
                            resolveAlias(opts.alias, dataoptions, opts);
                            opts.alias = undefined;
                            $(this).inputmask(opts);
                        } catch (ex) { } //need a more relax parseJSON
                    }
                });
            }
        };
    }
})(jQuery);

'use strict';

/**
 * General-purpose jQuery wrapper. Simply pass the plugin name as the expression.
 *
 * It is possible to specify a default set of parameters for each jQuery plugin.
 * Under the jq key, namespace each plugin by that which will be passed to ui-jq.
 * Unfortunately, at this time you can only pre-define the first parameter.
 * @example { jq : { datepicker : { showOn:'click' } } }
 *
 * @param ui-jq {string} The $elm.[pluginName]() to call.
 * @param [ui-options] {mixed} Expression to be evaluated and passed as options to the function
 *     Multiple parameters can be separated by commas
 * @param [ui-refresh] {expression} Watch expression and refire plugin on changes
 *
 * @example <input ui-jq="datepicker" ui-options="{showOn:'click'},secondParameter,thirdParameter" ui-refresh="iChange">
 */
angular.module('ui.jq',[]).
  value('uiJqConfig',{}).
  directive('uiJq', ['uiJqConfig', '$timeout', function uiJqInjectingFunction(uiJqConfig, $timeout) {

  return {
    restrict: 'A',
    compile: function uiJqCompilingFunction(tElm, tAttrs) {

      if (!angular.isFunction(tElm[tAttrs.uiJq])) {
        throw new Error('ui-jq: The "' + tAttrs.uiJq + '" function does not exist');
      }
      var options = uiJqConfig && uiJqConfig[tAttrs.uiJq];

      return function uiJqLinkingFunction(scope, elm, attrs) {

        var linkOptions = [];

        // If ui-options are passed, merge (or override) them onto global defaults and pass to the jQuery method
        if (attrs.uiOptions) {
          linkOptions = scope.$eval('[' + attrs.uiOptions + ']');
          if (angular.isObject(options) && angular.isObject(linkOptions[0])) {
            linkOptions[0] = angular.extend({}, options, linkOptions[0]);
          }
        } else if (options) {
          linkOptions = [options];
        }
        // If change compatibility is enabled, the form input's "change" event will trigger an "input" event
        if (attrs.ngModel && elm.is('select,input,textarea')) {
          elm.bind('change', function() {
            elm.trigger('input');
          });
        }

        // Call jQuery method and pass relevant options
        function callPlugin() {
          $timeout(function() {
            elm[attrs.uiJq].apply(elm, linkOptions);
          }, 0, false);
        }

        // If ui-refresh is used, re-fire the the method upon every change
        if (attrs.uiRefresh) {
          scope.$watch(attrs.uiRefresh, function() {
            callPlugin();
          });
        }
        callPlugin();
      };
    }
  };
}]);
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("angular")):"function"==typeof define&&define.amd?define(["angular"],e):"object"==typeof exports?exports["ng-table"]=e(require("angular")):t["ng-table"]=e(t.angular)}(this,function(t){return function(t){function e(r){if(n[r])return n[r].exports;var a=n[r]={i:r,l:!1,exports:{}};return t[r].call(a.exports,a,a.exports,e),a.l=!0,a.exports}var n={};return e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,e,n){Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=33)}(function(t){for(var e in t)if(Object.prototype.hasOwnProperty.call(t,e))switch(typeof t[e]){case"function":break;case"object":t[e]=function(e){var n=e.slice(1),r=t[e[0]];return function(t,e,a){r.apply(this,[t,e,a].concat(n))}}(t[e]);break;default:t[e]=t[t[e]]}return t}([function(e,n){e.exports=t},function(t,e,n){"use strict";function r(t){for(var n in t)e.hasOwnProperty(n)||(e[n]=t[n])}var a=n(0),i=n(4),o=n(5),l=n(6),s=n(7),u=n(8),c=n(9),p=n(10),f=n(11),g=n(12),d=n(13),h=n(14),m=n(15),b=n(16),v=n(17);n(25),n(27),n(26),n(28),n(31),n(30),Object.defineProperty(e,"__esModule",{value:!0}),e.default=a.module("ngTable-browser",[]).directive("ngTable",i.ngTable).factory("ngTableColumn",o.ngTableColumn).directive("ngTableColumnsBinding",l.ngTableColumnsBinding).controller("ngTableController",s.ngTableController).directive("ngTableDynamic",u.ngTableDynamic).provider("ngTableFilterConfig",c.ngTableFilterConfigProvider).directive("ngTableFilterRow",p.ngTableFilterRow).controller("ngTableFilterRowController",f.ngTableFilterRowController).directive("ngTableGroupRow",g.ngTableGroupRow).controller("ngTableGroupRowController",d.ngTableGroupRowController).directive("ngTablePagination",h.ngTablePagination).directive("ngTableSelectFilterDs",m.ngTableSelectFilterDs).directive("ngTableSorterRow",b.ngTableSorterRow).controller("ngTableSorterRowController",v.ngTableSorterRowController),r(n(18))},function(t,e,n){"use strict";function r(t){for(var n in t)e.hasOwnProperty(n)||(e[n]=t[n])}var a=n(0),i=n(19),o=n(20),l=n(22),s=n(21);Object.defineProperty(e,"__esModule",{value:!0}),e.default=a.module("ngTable-core",[]).provider("ngTableDefaultGetData",i.ngTableDefaultGetDataProvider).value("ngTableDefaults",o.ngTableDefaults).factory("NgTableParams",l.ngTableParamsFactory).factory("ngTableEventsChannel",s.ngTableEventsChannel),r(n(23))},,function(t,e,n){"use strict";function r(t,e){return{restrict:"A",priority:1001,scope:!0,controller:"ngTableController",compile:function(t){var n,r,i=[],o=0,l=[];if(a.forEach(t.find("tr"),function(t){l.push(a.element(t))}),n=l.filter(function(t){return!t.hasClass("ng-table-group")})[0],r=l.filter(function(t){return t.hasClass("ng-table-group")})[0],n)return a.forEach(n.find("td"),function(t){var n=a.element(t);if(!n.attr("ignore-cell")||"true"!==n.attr("ignore-cell")){var l=function(t){return n.attr("x-data-"+t)||n.attr("data-"+t)||n.attr(t)},s=function(t,e){n.attr("x-data-"+t)?n.attr("x-data-"+t,e):n.attr("data"+t)?n.attr("data"+t,e):n.attr(t,e)},u=function(t){var n=l(t);if(n){var r,a=function(t){return void 0!==r?r:e(n)(t)};return a.assign=function(t,a){var i=e(n);i.assign?i.assign(t.$parent,a):r=a},a}},c=l("title-alt")||l("title");c&&n.attr("data-title-text","{{"+c+"}}"),i.push({id:o++,title:u("title"),titleAlt:u("title-alt"),headerTitle:u("header-title"),sortable:u("sortable"),"class":u("header-class"),filter:u("filter"),groupable:u("groupable"),headerTemplateURL:u("header"),filterData:u("filter-data"),show:n.attr("ng-if")?u("ng-if"):void 0}),(r||n.attr("ng-if"))&&s("ng-if","$columns["+(i.length-1)+"].show(this)")}}),function(t,e,n,r){t.$columns=i=r.buildColumns(i),r.setupBindingsToInternalScope(n.ngTable),r.loadFilterData(i),r.compileDirectiveTemplates()}}}}var a=n(0);r.$inject=["$q","$parse"],e.ngTable=r},function(t,e,n){"use strict";function r(){function t(t,n,i){var o=Object.create(t),l=e();for(var s in l)void 0===o[s]&&(o[s]=l[s]),a.isFunction(o[s])||!function(e){var n=function a(){return 1!==arguments.length||r(arguments[0])?t[e]:void a.assign(null,arguments[0])};n.assign=function(n,r){t[e]=r},o[e]=n}(s),function(e){var l=o[e];o[e]=function(){if(1!==arguments.length||r(arguments[0])){var e=arguments[0]||n,s=Object.create(e);return a.extend(s,{$column:o,$columns:i}),l.call(t,s)}l.assign(null,arguments[0])},l.assign&&(o[e].assign=l.assign)}(s);return o}function e(){return{"class":n(""),filter:n(!1),groupable:n(!1),filterData:a.noop,headerTemplateURL:n(!1),headerTitle:n(""),sortable:n(!1),show:n(!0),title:n(""),titleAlt:n("")}}function n(t){var e=t,n=function a(){return 1!==arguments.length||r(arguments[0])?e:void a.assign(null,arguments[0])};return n.assign=function(t,n){e=n},n}function r(t){return null!=t&&a.isFunction(t.$new)}return{buildColumn:t}}var a=n(0);r.$inject=[],e.ngTableColumn=r},function(t,e){"use strict";function n(t){function e(e,n,r){var a=t(r.ngTableColumnsBinding).assign;a&&e.$watch("$columns",function(t){var n=(t||[]).slice(0);a(e,n)})}var n={restrict:"A",require:"ngTable",link:e};return n}n.$inject=["$parse"],e.ngTableColumnsBinding=n},function(t,e,n){"use strict";function r(t,e,n,r,i,o,l,s,u,c){function p(e){if(e&&!t.params.hasErrorState()){var n=t.params,r=n.settings().filterOptions;if(n.hasFilterChanges()){var a=function(){n.page(1),n.reload()};r.filterDelay?v(a,r.filterDelay):a()}else n.reload()}}function f(){o.showFilter?t.$parent.$watch(o.showFilter,function(e){t.show_filter=e}):t.$watch(h,function(e){t.show_filter=e}),o.disableFilter&&t.$parent.$watch(o.disableFilter,function(e){t.$filterRow.disabled=e})}function g(){if(t.$groupRow={show:!1},o.showGroup){var e=r(o.showGroup);t.$parent.$watch(e,function(e){t.$groupRow.show=e}),e.assign&&t.$watch("$groupRow.show",function(n){e.assign(t.$parent,n)})}else t.$watch("params.hasGroup()",function(e){t.$groupRow.show=e})}function d(){return(t.$columns||[]).filter(function(e){return e.show(t)})}function h(){return!!t.$columns&&m(t.$columns,function(e){return e.show(t)&&!!e.filter(t)})}function m(t,e){for(var n=!1,r=0;r<t.length;r++){var a=t[r];if(e(a)){n=!0;break}}return n}function b(){c.onAfterReloadData(function(e,n){var r=d();e.hasGroup()?(t.$groups=n||[],t.$groups.visibleColumnCount=r.length):(t.$data=n||[],t.$data.visibleColumnCount=r.length)},t,function(e){return t.params===e}),c.onPagesChanged(function(e,n){t.pages=n},t,function(e){return t.params===e})}t.$filterRow={disabled:!1},t.$loading=!1,t.hasOwnProperty("params")||(t.params=new e((!0)));var v=function(){var t;return function(e,r){n.cancel(t),t=n(e,r)}}();t.$watch("params",function(t,e){t!==e&&t&&t.reload()},!1),t.$watch("params.isDataReloadRequired()",p),this.compileDirectiveTemplates=function(){if(!l.hasClass("ng-table")){t.templates={header:o.templateHeader?o.templateHeader:"ng-table/header.html",pagination:o.templatePagination?o.templatePagination:"ng-table/pager.html"},l.addClass("ng-table");var e=null,n=!1;a.forEach(l.children(),function(t){"THEAD"===t.tagName&&(n=!0)}),n||(e=a.element('<thead ng-include="templates.header"></thead>',s),l.prepend(e));var r=a.element('<div ng-table-pagination="params" template-url="templates.pagination"></div>',s);l.after(r),e&&i(e)(t),i(r)(t)}},this.loadFilterData=function(e){function n(t){return t&&"object"==typeof t&&"function"==typeof t.then}a.forEach(e,function(e){var r=e.filterData(t);return r?n(r)?(delete e.filterData,r.then(function(t){a.isArray(t)||a.isFunction(t)||a.isObject(t)||(t=[]),e.data=t})):e.data=r:void delete e.filterData})},this.buildColumns=function(e){var n=[];return(e||[]).forEach(function(e){n.push(u.buildColumn(e,t,n))}),n},this.parseNgTableDynamicExpr=function(t){if(!t||t.indexOf(" with ")>-1){var e=t.split(/\s+with\s+/);return{tableParams:e[0],columns:e[1]}}throw new Error("Parse error (expected example: ng-table-dynamic='tableParams with cols')")},this.setupBindingsToInternalScope=function(e){t.$watch(e,function(e){void 0!==e&&(t.params=e)},!1),f(),g()},b()}var a=n(0);r.$inject=["$scope","NgTableParams","$timeout","$parse","$compile","$attrs","$element","$document","ngTableColumn","ngTableEventsChannel"],e.ngTableController=r},function(t,e,n){"use strict";function r(){return{restrict:"A",priority:1001,scope:!0,controller:"ngTableController",compile:function(t){var e;if(a.forEach(t.find("tr"),function(t){t=a.element(t),t.hasClass("ng-table-group")||e||(e=t)}),e)return a.forEach(e.find("td"),function(t){var e=a.element(t),n=function(t){return e.attr("x-data-"+t)||e.attr("data-"+t)||e.attr(t)},r=n("title");r||e.attr("data-title-text","{{$columns[$index].titleAlt(this) || $columns[$index].title(this)}}");var i=e.attr("ng-if");i||e.attr("ng-if","$columns[$index].show(this)")}),function(t,e,n,r){var a=r.parseNgTableDynamicExpr(n.ngTableDynamic);r.setupBindingsToInternalScope(a.tableParams),r.compileDirectiveTemplates(),t.$watchCollection(a.columns,function(e){t.$columns=r.buildColumns(e),r.loadFilterData(t.$columns)})}}}}var a=n(0);r.$inject=[],e.ngTableDynamic=r},function(t,e,n){"use strict";function r(){function t(){e()}function e(){i=o}function n(t){var e=a.extend({},i,t);e.aliasUrls=a.extend({},i.aliasUrls,t.aliasUrls),i=e}function r(){function t(t,e){var n;return n="string"!=typeof t?t.id:t,n.indexOf("/")!==-1?n:r.getUrlForAlias(n,e)}function e(t,e){return i.aliasUrls[t]||i.defaultBaseUrl+t+i.defaultExt}var n,r={config:n,getTemplateUrl:t,getUrlForAlias:e};return Object.defineProperty(r,"config",{get:function(){return n=n||a.copy(i)},enumerable:!0}),r}var i,o={defaultBaseUrl:"ng-table/filters/",defaultExt:".html",aliasUrls:{}};this.$get=r,this.resetConfigs=e,this.setConfig=n,t(),r.$inject=[]}var a=n(0);r.$inject=[],e.ngTableFilterConfigProvider=r},function(t,e,n){"use strict";function r(){var t={restrict:"E",replace:!0,templateUrl:a,scope:!0,controller:"ngTableFilterRowController"};return t}var a=n(24);r.$inject=[],e.ngTableFilterRow=r},function(t,e){"use strict";function n(t,e){t.config=e,t.getFilterCellCss=function(t,e){if("horizontal"!==e)return"s12";var n=Object.keys(t).length,r=parseInt((12/n).toString(),10);return"s"+r},t.getFilterPlaceholderValue=function(t,e){return"string"==typeof t?"":t.placeholder}}n.$inject=["$scope","ngTableFilterConfig"],e.ngTableFilterRowController=n},function(t,e,n){"use strict";function r(){var t={restrict:"E",replace:!0,templateUrl:a,scope:!0,controller:"ngTableGroupRowController",controllerAs:"dctrl"};return t}var a=n(29);r.$inject=[],e.ngTableGroupRow=r},function(t,e){"use strict";function n(t){function e(){t.getGroupables=i,t.getGroupTitle=a,t.getVisibleColumns=o,t.groupBy=l,t.isSelectedGroup=u,t.toggleDetail=p,t.$watch("params.group()",c,!0)}function n(){var e;e=t.params.hasGroup(t.$selGroup,"asc")?"desc":t.params.hasGroup(t.$selGroup,"desc")?"":"asc",t.params.group(t.$selGroup,e)}function r(e){return t.$columns.filter(function(n){return n.groupable(t)===e})[0]}function a(e){return s(e)?e.title:e.title(t)}function i(){var e=t.$columns.filter(function(e){return!!e.groupable(t)});return f.concat(e)}function o(){return t.$columns.filter(function(e){return e.show(t)})}function l(e){u(e)?n():s(e)?t.params.group(e):t.params.group(e.groupable(t))}function s(t){return"function"==typeof t}function u(e){return s(e)?e===t.$selGroup:e.groupable(t)===t.$selGroup}function c(e){var n=r(t.$selGroup);if(n&&n.show.assign&&n.show.assign(t,!0),s(e))f=[e],t.$selGroup=e,t.$selGroupTitle=e.title;else{var a=Object.keys(e||{})[0],i=r(a);i&&(t.$selGroupTitle=i.title(t),t.$selGroup=a,i.show.assign&&i.show.assign(t,!1))}}function p(){return t.params.settings().groupOptions.isExpanded=!t.params.settings().groupOptions.isExpanded,t.params.reload()}var f=[];e()}n.$inject=["$scope"],e.ngTableGroupRowController=n},function(t,e,n){"use strict";function r(t,e,n){return{restrict:"A",scope:{params:"=ngTablePagination",templateUrl:"="},replace:!1,link:function(r,i){n.onAfterReloadData(function(t){r.pages=t.generatePagesArray()},r,function(t){return t===r.params}),r.$watch("templateUrl",function(n){if(void 0!==n){var o=a.element('<div ng-include="templateUrl"></div>',e);i.append(o),t(o)(r)}})}}}var a=n(0);r.$inject=["$compile","$document","ngTableEventsChannel"],e.ngTablePagination=r},function(t,e){"use strict";function n(){var t={restrict:"A",controller:r};return t}function r(t,e,n,r){function a(){s=e(n.ngTableSelectFilterDs)(t),t.$watch(function(){return s&&s.data},i)}function i(){l(s).then(function(e){e&&!o(e)&&e.unshift({id:"",title:""}),e=e||[],t.$selectData=e})}function o(t){for(var e,n=0;n<t.length;n++){var r=t[n];if(r&&""===r.id){e=!0;break}}return e}function l(t){var e=t.data;return e instanceof Array?r.when(e):r.when(e&&e())}var s;a()}n.$inject=[],e.ngTableSelectFilterDs=n,r.$inject=["$scope","$parse","$attrs","$q"]},function(t,e,n){"use strict";function r(){var t={restrict:"E",replace:!0,templateUrl:a,scope:!0,controller:"ngTableSorterRowController"};return t}var a=n(32);r.$inject=[],e.ngTableSorterRow=r},function(t,e){"use strict";function n(t){function e(e,n){var r=e.sortable&&e.sortable();if(r&&"string"==typeof r){var a=t.params.settings().defaultSort,i="asc"===a?"desc":"asc",o=t.params.sorting()&&t.params.sorting()[r]&&t.params.sorting()[r]===a,l=n.ctrlKey||n.metaKey?t.params.sorting():{};l[r]=o?i:a,t.params.parameters({sorting:l})}}t.sortBy=e}n.$inject=["$scope"],e.ngTableSorterRowController=n},function(t,e){"use strict"},function(t,e,n){"use strict";var r=n(0),a=function(){function t(){function t(t){function n(n){var a=n.settings().filterOptions;return r.isFunction(a.filterFn)?a.filterFn:t(a.filterFilterName||e.filterFilterName)}function a(n){return t(e.sortingFilterName)}function i(t,e){if(!e.hasFilter())return t;var r=e.filter(!0),a=Object.keys(r),i=a.reduce(function(t,e){return t=u(t,r[e],e)},{}),o=n(e);return o.call(e,t,i,e.settings().filterOptions.filterComparator)}function o(t,e){var n=t.slice((e.page()-1)*e.count(),e.page()*e.count());return e.total(t.length),n}function l(t,e){var n=e.orderBy(),r=a(e);return n.length?r(t,n):t}function s(t,e){if(null==t)return[];var n=r.extend({},c,e.settings().dataOptions),a=n.applyFilter?i(t,e):t,s=n.applySort?l(a,e):a;return n.applyPaging?o(s,e):s}function u(t,e,n){var r=n.split("."),a=t,i=r[r.length-1],o=a,l=r.slice(0,r.length-1);return l.forEach(function(t){o.hasOwnProperty(t)||(o[t]={}),o=o[t]}),o[i]=e,a}var c={applyFilter:!0,applySort:!0,applyPaging:!0};return s.applyPaging=o,s.getFilterFn=n,s.getOrderByFn=a,s}this.filterFilterName="filter",this.sortingFilterName="orderBy";var e=this;this.$get=t,t.$inject=["$filter"]}return t}();e.ngTableDefaultGetDataProvider=a},function(t,e){"use strict";e.ngTableDefaults={params:{},settings:{}}},function(t,e,n){"use strict";function r(t){function e(t,e){var i=t.charAt(0).toUpperCase()+t.substring(1),o=(l={},l["on"+i]=n(t),l["publish"+i]=r(t),l);return a.extend(e,o);var l}function n(e){function n(t){return t?r(t)?t:function(e){return e===t}:function(t){return!0}}function r(t){return"function"==typeof t}function a(t){return t&&"function"==typeof t.$new}return function(r,i,o){var l,s=t;return a(i)?(s=i,l=n(o)):l=n(i),s.$on("ngTable:"+e,function(t,e){for(var n=[],a=2;a<arguments.length;a++)n[a-2]=arguments[a];if(!e.isNullInstance){var i=[e].concat(n);l.apply(this,i)&&r.apply(this,i)}})}}function r(e){return function(){for(var n=[],r=0;r<arguments.length;r++)n[r-0]=arguments[r];t.$broadcast.apply(t,["ngTable:"+e].concat(n))}}var i={};return i=e("afterCreated",i),i=e("afterReloadData",i),i=e("datasetChanged",i),i=e("pagesChanged",i)}var a=n(0);r.$inject=["$rootScope"],e.ngTableEventsChannel=r},function(t,e,n){"use strict";function r(t,e,n,r,i,o){function l(n,l){function s(t){return!isNaN(parseFloat(t))&&isFinite(t)}function u(t){var e=F.groupOptions&&F.groupOptions.defaultSort;if(t){if(f(t))return null==t.sortDirection&&(t.sortDirection=e),t;if("object"==typeof t){for(var n in t)null==t[n]&&(t[n]=e);return t}return r={},r[t]=e,r}return t;var r}function c(t){var e=[];for(var n in t)e.push(("asc"===t[n]?"+":"-")+n);return e}function p(){var t=O.group;return{params:O,groupSortDirection:f(t)?t.sortDirection:void 0}}function f(t){return"function"==typeof t}function g(){var t=O.filter&&O.filter.$,e=b&&b.params.filter&&b.params.filter.$;return!a.equals(t,e)}function d(){F.filterOptions.filterDelay===C.filterDelay&&F.total<=F.filterOptions.filterDelayThreshold&&F.getData===x.getData&&(F.filterOptions.filterDelay=0)}function h(e){var n=F.interceptors||[];return n.reduce(function(e,n){var r=n.response&&n.response.bind(n)||t.when,a=n.responseError&&n.responseError.bind(n)||t.reject;return e.then(function(t){return r(t,$)},function(t){return a(t,$)})},e)}function m(){function e(t){return i(t.settings().dataset,t)}function n(e){var n,o=e.group(),l=void 0;if(f(o))n=o,l=o.sortDirection;else{var s=Object.keys(o)[0];l=o[s],n=function(t){return r(t,s)}}var u=e.settings(),p=u.dataOptions;u.dataOptions={applyPaging:!1};var g=u.getData,d=t.when(g(e));return d.then(function(t){var r={};a.forEach(t,function(t){var e=n(t);r[e]=r[e]||{data:[],$hideRows:!u.groupOptions.isExpanded,value:e},r[e].data.push(t)});var o=[];for(var s in r)o.push(r[s]);if(l){var p=i.getOrderByFn(),f=c({value:l});o=p(o,f)}return i.applyPaging(o,e)}).finally(function(){u.dataOptions=p})}function r(t,e){var n;if(n="string"==typeof e?e.split("."):e,void 0!==t){if(0===n.length)return t;if(null!==t)return r(t[n[0]],n.slice(1))}}return{getData:e,getGroups:n}}"boolean"==typeof n&&(this.isNullInstance=!0);var b,v,$=this,y=!1,w=[],T=function(){for(var t=[],n=0;n<arguments.length;n++)t[n-0]=arguments[n];F.debugMode&&e.debug&&e.debug.apply(e,t)},C={filterComparator:void 0,filterDelay:500,filterDelayThreshold:1e4,filterFilterName:void 0,filterFn:void 0,filterLayout:"stack"},D={defaultSort:"asc",isExpanded:!0},x=m();this.data=[],this.parameters=function(t,e){if(e=e||!1,void 0!==typeof t){for(var n in t){var r=t[n];if(e&&n.indexOf("[")>=0){for(var i=n.split(/\[(.*)\]/).reverse(),o="",l=0,c=i.length;l<c;l++){var p=i[l];if(""!==p){var f=r;r={},r[o=p]=s(f)?parseFloat(f):f}}"sorting"===o&&(O[o]={}),O[o]=a.extend(O[o]||{},r[o])}else"group"===n?O[n]=u(t[n]):O[n]=s(t[n])?parseFloat(t[n]):t[n]}return T("ngTable: set parameters",O),this}return O},this.settings=function(t){if(a.isDefined(t)){t.filterOptions&&(t.filterOptions=a.extend({},F.filterOptions,t.filterOptions)),t.groupOptions&&(t.groupOptions=a.extend({},F.groupOptions,t.groupOptions)),a.isArray(t.dataset)&&(t.total=t.dataset.length);var e=F.dataset;F=a.extend(F,t),a.isArray(t.dataset)&&d();var n=t.hasOwnProperty("dataset")&&t.dataset!=e;if(n){y&&this.page(1),y=!1;var r=function(){o.publishDatasetChanged($,t.dataset,e)};w?w.push(r):r()}return T("ngTable: set settings",F),this}return F},this.page=function(t){return void 0!==t?this.parameters({page:t}):O.page},this.total=function(t){return void 0!==t?this.settings({total:t}):F.total},this.count=function(t){return void 0!==t?this.parameters({count:t,page:1}):O.count},this.filter=function(t){if(null!=t&&"object"==typeof t)return this.parameters({filter:t,page:1});if(t===!0){for(var e=Object.keys(O.filter),n={},r=0;r<e.length;r++){var a=O.filter[e[r]];null!=a&&""!==a&&(n[e[r]]=a)}return n}return O.filter},this.group=function(t,e){if(void 0===t)return O.group;var n={page:1};return f(t)&&void 0!==e?(t.sortDirection=e,n.group=t):"string"==typeof t&&void 0!==e?n.group=(r={},r[t]=e,r):n.group=t,this.parameters(n),this;var r},this.sorting=function(t,e){return"string"==typeof t&&void 0!==e?(this.parameters({sorting:(n={},n[t]=e,n)}),this):void 0!==t?this.parameters({sorting:t}):O.sorting;var n},this.isSortBy=function(t,e){return void 0!==e?void 0!==O.sorting[t]&&O.sorting[t]==e:void 0!==O.sorting[t]},this.orderBy=function(){return c(O.sorting)},this.generatePagesArray=function(t,e,n,r){arguments.length||(t=this.page(),e=this.total(),n=this.count());var a,i,o,l;r=r&&r<6?6:r;var s=[];if(l=Math.ceil(e/n),l>1){s.push({type:"prev",number:Math.max(1,t-1),active:t>1}),s.push({type:"first",number:1,active:t>1,current:1===t}),i=Math.round((F.paginationMaxBlocks-F.paginationMinBlocks)/2),o=Math.max(2,t-i),a=Math.min(l-1,t+2*i-(t-o)),o=Math.max(2,o-(2*i-(a-o)));for(var u=o;u<=a;)u===o&&2!==u||u===a&&u!==l-1?s.push({type:"more",active:!1}):s.push({type:"page",number:u,active:t!==u,current:t===u}),u++;s.push({type:"last",number:l,active:t!==l,current:t===l}),s.push({type:"next",number:Math.min(l,t+1),active:t<l})}return s},this.isDataReloadRequired=function(){return!y||!a.equals(p(),b)||g()},this.hasFilter=function(){return Object.keys(this.filter(!0)).length>0},this.hasGroup=function(t,e){return null==t?f(O.group)||Object.keys(O.group).length>0:f(t)?null==e?O.group===t:O.group===t&&t.sortDirection===e:null==e?Object.keys(O.group).indexOf(t)!==-1:O.group[t]===e},this.hasFilterChanges=function(){var t=b&&b.params.filter;return!a.equals(O.filter,t)||g()},this.url=function(t){function e(t,e){n(i)?i.push(e+"="+encodeURIComponent(t)):i[e]=encodeURIComponent(t)}function n(e){return t}function r(t,e){return"group"===e||void 0!==typeof t&&""!==t}t=t||!1;var i=t?[]:{};for(var o in O)if(O.hasOwnProperty(o)){var l=O[o],s=encodeURIComponent(o);if("object"==typeof l){for(var u in l)if(r(l[u],o)){var c=s+"["+encodeURIComponent(u)+"]";e(l[u],c)}}else!a.isFunction(l)&&r(l,o)&&e(l,s)}return i},this.reload=function(){var e=this,n=null;if(F.$loading=!0,b=a.copy(p()),y=!0,e.hasGroup())n=h(t.when(F.getGroups(e)));else{var r=F.getData;n=h(t.when(r(e)))}T("ngTable: reload data");var i=e.data;return n.then(function(t){return F.$loading=!1,v=null,e.data=t,o.publishAfterReloadData(e,t,i),e.reloadPages(),t}).catch(function(e){return v=b,t.reject(e)})},this.hasErrorState=function(){return!(!v||!a.equals(v,p()))},this.reloadPages=function(){var t;return function(){var e=t,n=$.generatePagesArray($.page(),$.total(),$.count());a.equals(e,n)||(t=n,o.publishPagesChanged(this,n,e))}}();var O={page:1,count:10,filter:{},sorting:{},group:{}};a.extend(O,r.params);var F={$loading:!1,dataset:null,total:0,defaultSort:"desc",filterOptions:a.copy(C),groupOptions:a.copy(D),counts:[10,25,50,100],interceptors:[],paginationMaxBlocks:11,paginationMinBlocks:5,sortingIndicator:"span"};return this.settings(x),this.settings(r.settings),this.settings(l),this.parameters(n,!0),o.publishAfterCreated(this),a.forEach(w,function(t){t()}),w=null,this}return l}var a=n(0);r.$inject=["$q","$log","$filter","ngTableDefaults","ngTableDefaultGetData","ngTableEventsChannel"],e.ngTableParamsFactory=r},18,function(t,e,n){var r="ng-table/filterRow.html",a='<tr ng-show=show_filter class=ng-table-filters> <th data-title-text="{{$column.titleAlt(this) || $column.title(this)}}" ng-repeat="$column in $columns" ng-if=$column.show(this) class="filter {{$column.class(this)}}" ng-class="params.settings().filterOptions.filterLayout === \'horizontal\' ? \'filter-horizontal\' : \'\'"> <div ng-repeat="(name, filter) in $column.filter(this)" ng-include=config.getTemplateUrl(filter) class=filter-cell ng-class="[getFilterCellCss($column.filter(this), params.settings().filterOptions.filterLayout), $last ? \'last\' : \'\']"> </div> </th> </tr> ',i=n(0);i.module("ng").run(["$templateCache",function(t){t.put(r,a)}]),t.exports=r},function(t,e,n){var r="ng-table/filters/number.html",a='<input type=number name={{name}} ng-disabled=$filterRow.disabled ng-model=params.filter()[name] class="input-filter form-control" placeholder="{{getFilterPlaceholderValue(filter, name)}}"/> ',i=n(0);i.module("ng").run(["$templateCache",function(t){t.put(r,a)}]),t.exports=r},function(t,e,n){var r="ng-table/filters/select-multiple.html",a='<select ng-options="data.id as data.title for data in $column.data" ng-disabled=$filterRow.disabled multiple=multiple ng-multiple=true ng-model=params.filter()[name] class="filter filter-select-multiple form-control" name={{name}}> </select> ',i=n(0);i.module("ng").run(["$templateCache",function(t){t.put(r,a)}]),t.exports=r},function(t,e,n){var r="ng-table/filters/select.html",a='<select ng-options="data.id as data.title for data in $selectData" ng-table-select-filter-ds=$column ng-disabled=$filterRow.disabled ng-model=params.filter()[name] class="filter filter-select form-control" name={{name}}> <option style=display:none value=""></option> </select> ',i=n(0);i.module("ng").run(["$templateCache",function(t){t.put(r,a)}]),t.exports=r},function(t,e,n){var r="ng-table/filters/text.html",a='<input type=text name={{name}} ng-disabled=$filterRow.disabled ng-model=params.filter()[name] class="input-filter form-control" placeholder="{{getFilterPlaceholderValue(filter, name)}}"/> ',i=n(0);i.module("ng").run(["$templateCache",function(t){t.put(r,a)}]),t.exports=r},function(t,e,n){var r="ng-table/groupRow.html",a='<tr ng-if=params.hasGroup() ng-show=$groupRow.show class=ng-table-group-header> <th colspan={{getVisibleColumns().length}} class=sortable ng-class="{\n                    \'sort-asc\': params.hasGroup($selGroup, \'asc\'),\n                    \'sort-desc\':params.hasGroup($selGroup, \'desc\')\n                  }"> <a href="" ng-click="isSelectorOpen = !isSelectorOpen" class=ng-table-group-selector> <strong class=sort-indicator>{{$selGroupTitle}}</strong> <button class="btn btn-default btn-xs ng-table-group-close" ng-click="$groupRow.show = false; $event.preventDefault(); $event.stopPropagation();"> <span class="glyphicon glyphicon-remove"></span> </button> <button class="btn btn-default btn-xs ng-table-group-toggle" ng-click="toggleDetail(); $event.preventDefault(); $event.stopPropagation();"> <span class=glyphicon ng-class="{\n                    \'glyphicon-resize-small\': params.settings().groupOptions.isExpanded,\n                    \'glyphicon-resize-full\': !params.settings().groupOptions.isExpanded\n                }"></span> </button> </a> <div class=list-group ng-if=isSelectorOpen> <a href="" class=list-group-item ng-repeat="group in getGroupables()" ng-click=groupBy(group)> <strong>{{ getGroupTitle(group)}}</strong> <strong ng-class="isSelectedGroup(group) && \'sort-indicator\'"></strong> </a> </div> </th> </tr> ',i=n(0);i.module("ng").run(["$templateCache",function(t){t.put(r,a)}]),t.exports=r},function(t,e,n){var r="ng-table/header.html",a="<ng-table-group-row></ng-table-group-row> <ng-table-sorter-row></ng-table-sorter-row> <ng-table-filter-row></ng-table-filter-row> ",i=n(0);i.module("ng").run(["$templateCache",function(t){t.put(r,a)}]),t.exports=r},function(t,e,n){var r="ng-table/pager.html",a='<div class="ng-cloak ng-table-pager" ng-if=params.data.length> <div ng-if=params.settings().counts.length class="ng-table-counts btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type=button ng-class="{\'active\':params.count() == count}" ng-click=params.count(count) class="btn btn-default"> <span ng-bind=count></span> </button> </div> <ul ng-if=pages.length class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active && !page.current, \'active\': page.current}" ng-repeat="page in pages" ng-switch=page.type> <a ng-switch-when=prev ng-click=params.page(page.number) href="">&laquo;</a> <a ng-switch-when=first ng-click=params.page(page.number) href=""><span ng-bind=page.number></span></a> <a ng-switch-when=page ng-click=params.page(page.number) href=""><span ng-bind=page.number></span></a> <a ng-switch-when=more ng-click=params.page(page.number) href="">&#8230;</a> <a ng-switch-when=last ng-click=params.page(page.number) href=""><span ng-bind=page.number></span></a> <a ng-switch-when=next ng-click=params.page(page.number) href="">&raquo;</a> </li> </ul> </div> ',i=n(0);i.module("ng").run(["$templateCache",function(t){t.put(r,a)}]),t.exports=r},function(t,e,n){var r="ng-table/sorterRow.html",a="<tr class=ng-table-sort-header> <th title={{$column.headerTitle(this)}} ng-repeat=\"$column in $columns\" ng-class=\"{\n                    'sortable': $column.sortable(this),\n                    'sort-asc': params.sorting()[$column.sortable(this)]=='asc',\n                    'sort-desc': params.sorting()[$column.sortable(this)]=='desc'\n                  }\" ng-click=\"sortBy($column, $event)\" ng-if=$column.show(this) ng-init=\"template = $column.headerTemplateURL(this)\" class=\"header {{$column.class(this)}}\"> <div ng-if=!template class=ng-table-header ng-class=\"{'sort-indicator': params.settings().sortingIndicator == 'div'}\"> <span ng-bind=$column.title(this) ng-class=\"{'sort-indicator': params.settings().sortingIndicator == 'span'}\"></span> </div> <div ng-if=template ng-include=template></div> </th> </tr> ",i=n(0);i.module("ng").run(["$templateCache",function(t){t.put(r,a)}]),t.exports=r},function(t,e,n){"use strict";function r(t){for(var n in t)e.hasOwnProperty(n)||(e[n]=t[n])}var a=n(0),i=n(2),o=n(1),l=a.module("ngTable",[i.default.name,o.default.name]);e.ngTable=l,r(n(2)),r(n(1))}]))});
//# sourceMappingURL=ng-table.min.js.map
(function(window, document) {

// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
angular.module('gm.config', [])
    .value('gm.config', {
        debug: true,
        placess: {
            autocomplete: {}
        }
    })
    .run(['$window', function($window){

        // Check for dependencies
        if(
            angular.isUndefined($window.google) ||
            angular.isUndefined($window.google.maps)
            ){
            throw new Error('Google Maps API not available, please make sure the Google Maps library is loaded before the AngularJS Google Maps library is loaded');
        }
    }]);

// Places modules
angular.module('gm.places.directives', []);
angular.module('gm.places', [
    'gm.places.directives'
])
    .run(['$window', function($window){

        // Check for dependencies
        if(
            angular.isUndefined($window.google) ||
            angular.isUndefined($window.google.maps) ||
            angular.isUndefined($window.google.maps.places) ||
            angular.isUndefined($window.google.maps.places.Autocomplete)
            ){
            throw new Error('Google Maps API not available, please make sure the Google Maps library is loaded before the AngularJS Google Maps library is loaded');
        }
    }]);

// Modules
angular.module('gm.directives', []);
angular.module('gm.filters', []);
angular.module('gm.services', []);
angular.module('gm', [
    'gm.config',
    'gm.directives',
    'gm.filters',
    'gm.services',
    'gm.places'
]);
/**
 * Logger service
 */
angular.module('gm.services')
    .factory('logger', ['$log', '$window', function ($log, $window) {

        // Create service
        var service = {};

        // Proxy regular methods to $log
        angular.forEach(['log', 'info', 'warn', 'error'], function(method){
            service[method] = function(){
                return $log[method](arguments);
            };
        });


        // Add dir method to hierarchically display objects
        service.dir = function (obj, title) {
            if ($window.console) {
                if (angular.isDefined(title)) {
                    $log.info(title + ':');
                }
                $window.console.dir(obj);
            }
        };

        return service;
    }]);angular.module('gm.places')
    .directive('gmPlacesAutocomplete', ['$rootScope', 'gm.config', 'logger', function($rootScope, gmConfig, logger){

        var configOptions = (gmConfig.places && gmConfig.places.autocomplete) || {};

        return {
            restrict: 'AEC',
            require : ['gmPlacesAutocomplete', '?ngModel'],
            controller: ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude){

                this._options = angular.extend({}, configOptions, $scope.$eval($attrs.gmOptions));
                this._element = $element[0];
                this._api = undefined;

                // Define properties
                Object.defineProperties(this, {
                    element: {
                        get: function(){
                            return this._element;
                        },
                        configurable: false
                    },
                    api: {
                        get: function(){
                            return this._api;
                        },
                        configurable: false
                    }
                });

                try {
                    this._api = new google.maps.places.Autocomplete(this._element, this._options);
                }
                catch (err)
                {
                    if(gmConfig.debug) logger.log('Could not instantiate gmPlacesAutocomplete directive: ' + err.message);
                }

            }],
            link: function(scope, iElement, iAttrs, controllers){

                // Define controllers
                var gmPlacesAutocompleteController = controllers[0];
                var ngModelController = controllers[1];

                // Set initial model value if a model is defined
                if (ngModelController) {
                    ngModelController.$setViewValue(gmPlacesAutocompleteController.api);
                }

                // Listen to place_changed event
                google.maps.event.addListener(gmPlacesAutocompleteController.api, 'place_changed',
                    (function(scope, iElement, iAttrs, gmPlacesAutocompleteController, ngModelController, $rootScope){
                        return function(){

                            // Update model if there is one
                            if (ngModelController) {
                                ngModelController.$setViewValue(gmPlacesAutocompleteController.api);
                            }

                            // Broadcast event
                            $rootScope.$broadcast('gmPlacesAutocomplete::placeChanged', gmPlacesAutocompleteController);
                        };
                    })(scope, iElement, iAttrs, gmPlacesAutocompleteController, ngModelController, $rootScope)
                );

            }
        };

    }]);})(window, document);
/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under the MIT license
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1||b[0]>3)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4")}(jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){if(a(b.target).is(this))return b.handleObj.handler.apply(this,arguments)}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.7",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a("#"===f?[]:f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.7",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c).prop(c,!0)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c).prop(c,!1))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")?(c.prop("checked")&&(a=!1),b.find(".active").removeClass("active"),this.$element.addClass("active")):"checkbox"==c.prop("type")&&(c.prop("checked")!==this.$element.hasClass("active")&&(a=!1),this.$element.toggleClass("active")),c.prop("checked",this.$element.hasClass("active")),a&&c.trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active")),this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target).closest(".btn");b.call(d,"toggle"),a(c.target).is('input[type="radio"], input[type="checkbox"]')||(c.preventDefault(),d.is("input,button")?d.trigger("focus"):d.find("input:visible,button:visible").first().trigger("focus"))}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(b.type))})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=null,this.sliding=null,this.interval=null,this.$active=null,this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.7",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){if(!/input|textarea/i.test(a.target.tagName)){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()}},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c=this.getItemIndex(b),d="prev"==a&&0===c||"next"==a&&c==this.$items.length-1;if(d&&!this.options.wrap)return b;var e="prev"==a?-1:1,f=(c+e)%this.$items.length;return this.$items.eq(f)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));if(!(a>this.$items.length-1||a<0))return this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){if(!this.sliding)return this.slide("next")},c.prototype.prev=function(){if(!this.sliding)return this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i=this;if(f.hasClass("active"))return this.sliding=!1;var j=f[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:h});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(f)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(m)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&/show|hide/.test(b)&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a('[data-toggle="collapse"][href="#'+b.id+'"],[data-toggle="collapse"][data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.7",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":e.data();c.call(f,h)})}(jQuery),+function(a){"use strict";function b(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function c(c){c&&3===c.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=b(d),f={relatedTarget:this};e.hasClass("open")&&(c&&"click"==c.type&&/input|textarea/i.test(c.target.tagName)&&a.contains(e[0],c.target)||(e.trigger(c=a.Event("hide.bs.dropdown",f)),c.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger(a.Event("hidden.bs.dropdown",f)))))}))}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.7",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=b(e),g=f.hasClass("open");if(c(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(a(this)).on("click",c);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger(a.Event("shown.bs.dropdown",h))}return!1}},g.prototype.keydown=function(c){if(/(38|40|27|32)/.test(c.which)&&!/input|textarea/i.test(c.target.tagName)){var d=a(this);if(c.preventDefault(),c.stopPropagation(),!d.is(".disabled, :disabled")){var e=b(d),g=e.hasClass("open");if(!g&&27!=c.which||g&&27==c.which)return 27==c.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.disabled):visible a",i=e.find(".dropdown-menu"+h);if(i.length){var j=i.index(c.target);38==c.which&&j>0&&j--,40==c.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",c).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$dialog=this.$element.find(".modal-dialog"),this.$backdrop=null,this.isShown=null,this.originalBodyPad=null,this.scrollbarWidth=0,this.ignoreBackdropClick=!1,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.7",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.$dialog.on("mousedown.dismiss.bs.modal",function(){d.$element.one("mouseup.dismiss.bs.modal",function(b){a(b.target).is(d.$element)&&(d.ignoreBackdropClick=!0)})}),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),d.adjustDialog(),e&&d.$element[0].offsetWidth,d.$element.addClass("in"),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$dialog.one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"),this.$dialog.off("mousedown.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){document===a.target||this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.resize=function(){this.isShown?a(window).on("resize.bs.modal",a.proxy(this.handleUpdate,this)):a(window).off("resize.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetAdjustments(),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a(document.createElement("div")).addClass("modal-backdrop "+e).appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){return this.ignoreBackdropClick?void(this.ignoreBackdropClick=!1):void(a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus():this.hide()))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.handleUpdate=function(){this.adjustDialog()},c.prototype.adjustDialog=function(){var a=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&a?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!a?this.scrollbarWidth:""})},c.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},c.prototype.checkScrollbar=function(){var a=window.innerWidth;if(!a){var b=document.documentElement.getBoundingClientRect();a=b.right-Math.abs(b.left)}this.bodyIsOverflowing=document.body.clientWidth<a,this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.originalBodyPad=document.body.style.paddingRight||"",this.bodyIsOverflowing&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right",this.originalBodyPad)},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;!e&&/destroy|hide/.test(b)||(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",a,b)};c.VERSION="3.3.7",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){if(this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(a.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusin"==b.type?"focus":"hover"]=!0),c.tip().hasClass("in")||"in"==c.hoverState?void(c.hoverState="in"):(clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.isInStateTrue=function(){for(var a in this.inState)if(this.inState[a])return!0;return!1},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);if(c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusout"==b.type?"focus":"hover"]=!1),!c.isInStateTrue())return clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.getPosition(this.$viewport);h="bottom"==h&&k.bottom+m>o.bottom?"top":"top"==h&&k.top-m<o.top?"bottom":"right"==h&&k.right+l>o.width?"left":"left"==h&&k.left-l<o.left?"right":h,f.removeClass(n).addClass(h)}var p=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(p,h);var q=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",q).emulateTransitionEnd(c.TRANSITION_DURATION):q()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top+=g,b.left+=h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element&&e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=a(this.$tip),g=a.Event("hide.bs."+this.type);if(this.$element.trigger(g),!g.isDefaultPrevented())return f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=window.SVGElement&&c instanceof window.SVGElement,g=d?{top:0,left:0}:f?null:b.offset(),h={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},i=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,h,i,g)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.right&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){if(!this.$tip&&(this.$tip=a(this.options.template),1!=this.$tip.length))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),b?(c.inState.click=!c.inState.click,c.isInStateTrue()?c.enter(c):c.leave(c)):c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type),a.$tip&&a.$tip.detach(),a.$tip=null,a.$arrow=null,a.$viewport=null,a.$element=null})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;!e&&/destroy|hide/.test(b)||(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.7",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){this.$body=a(document.body),this.$scrollElement=a(a(c).is(document.body)?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",a.proxy(this.process,this)),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.7",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b=this,c="offset",d=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),a.isWindow(this.$scrollElement[0])||(c="position",d=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var b=a(this),e=b.data("target")||b.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[c]().top+d,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){b.offsets.push(this[0]),b.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(void 0===e[a+1]||b<e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){
this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.7",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu").length&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.7",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return e<c&&"top";if("bottom"==this.affixed)return null!=c?!(e+this.unpin<=f.top)&&"bottom":!(e+g<=a-d)&&"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&e<=c?"top":null!=d&&i+j>=a-d&&"bottom"},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=Math.max(a(document).height(),a(document.body).height());"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);
/*!
 * JavaScript Cookie v2.0.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
!function(e){if("function"==typeof define&&define.amd)define(e);else if("object"==typeof exports)module.exports=e();else{var n=window.Cookies,t=window.Cookies=e();t.noConflict=function(){return window.Cookies=n,t}}}(function(){function e(){for(var e=0,n={};e<arguments.length;e++){var t=arguments[e];for(var o in t)n[o]=t[o]}return n}function n(t){function o(n,r,i){var c;if(arguments.length>1){if(i=e({path:"/"},o.defaults,i),"number"==typeof i.expires){var s=new Date;s.setMilliseconds(s.getMilliseconds()+864e5*i.expires),i.expires=s}try{c=JSON.stringify(r),/^[\{\[]/.test(c)&&(r=c)}catch(a){}return r=encodeURIComponent(String(r)),r=r.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),n=encodeURIComponent(String(n)),n=n.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),n=n.replace(/[\(\)]/g,escape),document.cookie=[n,"=",r,i.expires&&"; expires="+i.expires.toUTCString(),i.path&&"; path="+i.path,i.domain&&"; domain="+i.domain,i.secure?"; secure":""].join("")}n||(c={});for(var p=document.cookie?document.cookie.split("; "):[],u=/(%[0-9A-Z]{2})+/g,d=0;d<p.length;d++){var f=p[d].split("="),l=f[0].replace(u,decodeURIComponent),m=f.slice(1).join("=");'"'===m.charAt(0)&&(m=m.slice(1,-1));try{if(m=t&&t(m,l)||m.replace(u,decodeURIComponent),this.json)try{m=JSON.parse(m)}catch(a){}if(n===l){c=m;break}n||(c[l]=m)}catch(a){}}return c}return o.get=o.set=o,o.getJSON=function(){return o.apply({json:!0},[].slice.call(arguments))},o.defaults={},o.remove=function(n,t){o(n,"",e(t,{expires:-1}))},o.withConverter=n,o}return n()});
/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Improved by keenthemes for Metronic Theme
 * Version: 1.3.2
 *
 */
!function(e){jQuery.fn.extend({slimScroll:function(i){var o={width:"auto",height:"250px",size:"7px",color:"#000",position:"right",distance:"1px",start:"top",opacity:.4,alwaysVisible:!1,disableFadeOut:!1,railVisible:!1,railColor:"#333",railOpacity:.2,railDraggable:!0,railClass:"slimScrollRail",barClass:"slimScrollBar",wrapperClass:"slimScrollDiv",allowPageScroll:!1,wheelStep:20,touchScrollStep:200,borderRadius:"7px",railBorderRadius:"7px",animate:!0},a=e.extend(o,i);return this.each(function(){function o(t){if(u){var t=t||window.event,i=0;t.wheelDelta&&(i=-t.wheelDelta/120),t.detail&&(i=t.detail/3);var o=t.target||t.srcTarget||t.srcElement;e(o).closest("."+a.wrapperClass).is(S.parent())&&r(i,!0),t.preventDefault&&!y&&t.preventDefault(),y||(t.returnValue=!1)}}function r(e,t,i){y=!1;var o=e,r=S.outerHeight()-M.outerHeight();if(t&&(o=parseInt(M.css("top"))+e*parseInt(a.wheelStep)/100*M.outerHeight(),o=Math.min(Math.max(o,0),r),o=e>0?Math.ceil(o):Math.floor(o),M.css({top:o+"px"})),v=parseInt(M.css("top"))/(S.outerHeight()-M.outerHeight()),o=v*(S[0].scrollHeight-S.outerHeight()),i){o=e;var s=o/S[0].scrollHeight*S.outerHeight();s=Math.min(Math.max(s,0),r),M.css({top:s+"px"})}"scrollTo"in a&&a.animate?S.animate({scrollTop:o}):S.scrollTop(o),S.trigger("slimscrolling",~~o),l(),c()}function s(){window.addEventListener?(this.addEventListener("DOMMouseScroll",o,!1),this.addEventListener("mousewheel",o,!1)):document.attachEvent("onmousewheel",o)}function n(){f=Math.max(S.outerHeight()/S[0].scrollHeight*S.outerHeight(),m),M.css({height:f+"px"});var e=f==S.outerHeight()?"none":"block";M.css({display:e})}function l(){if(n(),clearTimeout(p),v==~~v){if(y=a.allowPageScroll,b!=v){var e=0==~~v?"top":"bottom";S.trigger("slimscroll",e)}}else y=!1;return b=v,f>=S.outerHeight()?void(y=!0):(M.stop(!0,!0).fadeIn("fast"),void(a.railVisible&&H.stop(!0,!0).fadeIn("fast")))}function c(){a.alwaysVisible||(p=setTimeout(function(){a.disableFadeOut&&u||h||d||(M.fadeOut("slow"),H.fadeOut("slow"))},1e3))}var u,h,d,p,g,f,v,b,w="<div></div>",m=30,y=!1,S=e(this);if("ontouchstart"in window&&window.navigator.msPointerEnabled&&S.css("-ms-touch-action","none"),S.parent().hasClass(a.wrapperClass)){var E=S.scrollTop();if(M=S.parent().find("."+a.barClass),H=S.parent().find("."+a.railClass),n(),e.isPlainObject(i)){if("height"in i&&"auto"==i.height){S.parent().css("height","auto"),S.css("height","auto");var x=S.parent().parent().height();S.parent().css("height",x),S.css("height",x)}if("scrollTo"in i)E=parseInt(a.scrollTo);else if("scrollBy"in i)E+=parseInt(a.scrollBy);else if("destroy"in i)return M.remove(),H.remove(),void S.unwrap();r(E,!1,!0)}}else{a.height="auto"==i.height?S.parent().height():i.height;var C=e(w).addClass(a.wrapperClass).css({position:"relative",overflow:"hidden",width:a.width,height:a.height});S.css({overflow:"hidden",width:a.width,height:a.height});var H=e(w).addClass(a.railClass).css({width:a.size,height:"100%",position:"absolute",top:0,display:a.alwaysVisible&&a.railVisible?"block":"none","border-radius":a.railBorderRadius,background:a.railColor,opacity:a.railOpacity,zIndex:90}),M=e(w).addClass(a.barClass).css({background:a.color,width:a.size,position:"absolute",top:0,opacity:a.opacity,display:a.alwaysVisible?"block":"none","border-radius":a.borderRadius,BorderRadius:a.borderRadius,MozBorderRadius:a.borderRadius,WebkitBorderRadius:a.borderRadius,zIndex:99}),D="right"==a.position?{right:a.distance}:{left:a.distance};H.css(D),M.css(D),S.wrap(C),S.parent().append(M),S.parent().append(H),a.railDraggable&&M.bind("mousedown",function(i){var o=e(document);return d=!0,t=parseFloat(M.css("top")),pageY=i.pageY,o.bind("mousemove.slimscroll",function(e){currTop=t+e.pageY-pageY,M.css("top",currTop),r(0,M.position().top,!1)}),o.bind("mouseup.slimscroll",function(){d=!1,c(),o.unbind(".slimscroll")}),!1}).bind("selectstart.slimscroll",function(e){return e.stopPropagation(),e.preventDefault(),!1}),"ontouchstart"in window&&window.navigator.msPointerEnabled&&(S.bind("MSPointerDown",function(e){g=e.originalEvent.pageY}),S.bind("MSPointerMove",function(e){e.originalEvent.preventDefault();var t=(g-e.originalEvent.pageY)/a.touchScrollStep;r(t,!0),g=e.originalEvent.pageY})),H.hover(function(){l()},function(){c()}),M.hover(function(){h=!0},function(){h=!1}),S.hover(function(){u=!0,l(),c()},function(){u=!1,c()}),S.bind("touchstart",function(e){e.originalEvent.touches.length&&(g=e.originalEvent.touches[0].pageY)}),S.bind("touchmove",function(e){if(y||e.originalEvent.preventDefault(),e.originalEvent.touches.length){var t=(g-e.originalEvent.touches[0].pageY)/a.touchScrollStep;r(t,!0),g=e.originalEvent.touches[0].pageY}}),n(),"bottom"===a.start?(M.css({top:S.outerHeight()-M.outerHeight()}),r(0,!0)):"top"!==a.start&&(r(e(a.start).position().top,null,!0),a.alwaysVisible||M.hide()),s()}}),this}}),jQuery.fn.extend({slimscroll:jQuery.fn.slimScroll})}(jQuery);
/*!
 * jQuery blockUI plugin
 * Version 2.70.0-2014.11.23
 * Requires jQuery v1.7 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2013 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */
 !function(){"use strict";function e(e){function t(t,n){var s,h,k=t==window,y=n&&void 0!==n.message?n.message:void 0;if(n=e.extend({},e.blockUI.defaults,n||{}),!n.ignoreIfBlocked||!e(t).data("blockUI.isBlocked")){if(n.overlayCSS=e.extend({},e.blockUI.defaults.overlayCSS,n.overlayCSS||{}),s=e.extend({},e.blockUI.defaults.css,n.css||{}),n.onOverlayClick&&(n.overlayCSS.cursor="pointer"),h=e.extend({},e.blockUI.defaults.themedCSS,n.themedCSS||{}),y=void 0===y?n.message:y,k&&p&&o(window,{fadeOut:0}),y&&"string"!=typeof y&&(y.parentNode||y.jquery)){var m=y.jquery?y[0]:y,v={};e(t).data("blockUI.history",v),v.el=m,v.parent=m.parentNode,v.display=m.style.display,v.position=m.style.position,v.parent&&v.parent.removeChild(m)}e(t).data("blockUI.onUnblock",n.onUnblock);var g,I,w,U,x=n.baseZ;g=e(r||n.forceIframe?'<iframe class="blockUI" style="z-index:'+x++ +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+n.iframeSrc+'"></iframe>':'<div class="blockUI" style="display:none"></div>'),I=e(n.theme?'<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:'+x++ +';display:none"></div>':'<div class="blockUI blockOverlay" style="z-index:'+x++ +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>'),n.theme&&k?(U='<div class="blockUI '+n.blockMsgClass+' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(x+10)+';display:none;position:fixed">',n.title&&(U+='<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(n.title||"&nbsp;")+"</div>"),U+='<div class="ui-widget-content ui-dialog-content"></div>',U+="</div>"):n.theme?(U='<div class="blockUI '+n.blockMsgClass+' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(x+10)+';display:none;position:absolute">',n.title&&(U+='<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(n.title||"&nbsp;")+"</div>"),U+='<div class="ui-widget-content ui-dialog-content"></div>',U+="</div>"):U=k?'<div class="blockUI '+n.blockMsgClass+' blockPage" style="z-index:'+(x+10)+';display:none;position:fixed"></div>':'<div class="blockUI '+n.blockMsgClass+' blockElement" style="z-index:'+(x+10)+';display:none;position:absolute"></div>',w=e(U),y&&(n.theme?(w.css(h),w.addClass("ui-widget-content")):w.css(s)),n.theme||I.css(n.overlayCSS),I.css("position",k?"fixed":"absolute"),(r||n.forceIframe)&&g.css("opacity",0);var C=[g,I,w],S=e(k?"body":t);e.each(C,function(){this.appendTo(S)}),n.theme&&n.draggable&&e.fn.draggable&&w.draggable({handle:".ui-dialog-titlebar",cancel:"li"});var O=f&&(!e.support.boxModel||e("object,embed",k?null:t).length>0);if(u||O){if(k&&n.allowBodyStretch&&e.support.boxModel&&e("html,body").css("height","100%"),(u||!e.support.boxModel)&&!k)var E=d(t,"borderTopWidth"),T=d(t,"borderLeftWidth"),M=E?"(0 - "+E+")":0,B=T?"(0 - "+T+")":0;e.each(C,function(e,t){var o=t[0].style;if(o.position="absolute",2>e)k?o.setExpression("height","Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:"+n.quirksmodeOffsetHack+') + "px"'):o.setExpression("height",'this.parentNode.offsetHeight + "px"'),k?o.setExpression("width",'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"'):o.setExpression("width",'this.parentNode.offsetWidth + "px"'),B&&o.setExpression("left",B),M&&o.setExpression("top",M);else if(n.centerY)k&&o.setExpression("top",'(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"'),o.marginTop=0;else if(!n.centerY&&k){var i=n.css&&n.css.top?parseInt(n.css.top,10):0,s="((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "+i+') + "px"';o.setExpression("top",s)}})}if(y&&(n.theme?w.find(".ui-widget-content").append(y):w.append(y),(y.jquery||y.nodeType)&&e(y).show()),(r||n.forceIframe)&&n.showOverlay&&g.show(),n.fadeIn){var j=n.onBlock?n.onBlock:c,H=n.showOverlay&&!y?j:c,z=y?j:c;n.showOverlay&&I._fadeIn(n.fadeIn,H),y&&w._fadeIn(n.fadeIn,z)}else n.showOverlay&&I.show(),y&&w.show(),n.onBlock&&n.onBlock.bind(w)();if(i(1,t,n),k?(p=w[0],b=e(n.focusableElements,p),n.focusInput&&setTimeout(l,20)):a(w[0],n.centerX,n.centerY),n.timeout){var W=setTimeout(function(){k?e.unblockUI(n):e(t).unblock(n)},n.timeout);e(t).data("blockUI.timeout",W)}}}function o(t,o){var s,l=t==window,a=e(t),d=a.data("blockUI.history"),c=a.data("blockUI.timeout");c&&(clearTimeout(c),a.removeData("blockUI.timeout")),o=e.extend({},e.blockUI.defaults,o||{}),i(0,t,o),null===o.onUnblock&&(o.onUnblock=a.data("blockUI.onUnblock"),a.removeData("blockUI.onUnblock"));var r;r=l?e("body").children().filter(".blockUI").add("body > .blockUI"):a.find(">.blockUI"),o.cursorReset&&(r.length>1&&(r[1].style.cursor=o.cursorReset),r.length>2&&(r[2].style.cursor=o.cursorReset)),l&&(p=b=null),o.fadeOut?(s=r.length,r.stop().fadeOut(o.fadeOut,function(){0===--s&&n(r,d,o,t)})):n(r,d,o,t)}function n(t,o,n,i){var s=e(i);if(!s.data("blockUI.isBlocked")){t.each(function(){this.parentNode&&this.parentNode.removeChild(this)}),o&&o.el&&(o.el.style.display=o.display,o.el.style.position=o.position,o.el.style.cursor="default",o.parent&&o.parent.appendChild(o.el),s.removeData("blockUI.history")),s.data("blockUI.static")&&s.css("position","static"),"function"==typeof n.onUnblock&&n.onUnblock(i,n);var l=e(document.body),a=l.width(),d=l[0].style.width;l.width(a-1).width(a),l[0].style.width=d}}function i(t,o,n){var i=o==window,l=e(o);if((t||(!i||p)&&(i||l.data("blockUI.isBlocked")))&&(l.data("blockUI.isBlocked",t),i&&n.bindEvents&&(!t||n.showOverlay))){var a="mousedown mouseup keydown keypress keyup touchstart touchend touchmove";t?e(document).bind(a,n,s):e(document).unbind(a,s)}}function s(t){if("keydown"===t.type&&t.keyCode&&9==t.keyCode&&p&&t.data.constrainTabKey){var o=b,n=!t.shiftKey&&t.target===o[o.length-1],i=t.shiftKey&&t.target===o[0];if(n||i)return setTimeout(function(){l(i)},10),!1}var s=t.data,a=e(t.target);return a.hasClass("blockOverlay")&&s.onOverlayClick&&s.onOverlayClick(t),a.parents("div."+s.blockMsgClass).length>0?!0:0===a.parents().children().filter("div.blockUI").length}function l(e){if(b){var t=b[e===!0?b.length-1:0];t&&t.focus()}}function a(e,t,o){var n=e.parentNode,i=e.style,s=(n.offsetWidth-e.offsetWidth)/2-d(n,"borderLeftWidth"),l=(n.offsetHeight-e.offsetHeight)/2-d(n,"borderTopWidth");t&&(i.left=s>0?s+"px":"0"),o&&(i.top=l>0?l+"px":"0")}function d(t,o){return parseInt(e.css(t,o),10)||0}e.fn._fadeIn=e.fn.fadeIn;var c=e.noop||function(){},r=/MSIE/.test(navigator.userAgent),u=/MSIE 6.0/.test(navigator.userAgent)&&!/MSIE 8.0/.test(navigator.userAgent),f=(document.documentMode||0,e.isFunction(document.createElement("div").style.setExpression));e.blockUI=function(e){t(window,e)},e.unblockUI=function(e){o(window,e)},e.growlUI=function(t,o,n,i){var s=e('<div class="growlUI"></div>');t&&s.append("<h1>"+t+"</h1>"),o&&s.append("<h2>"+o+"</h2>"),void 0===n&&(n=3e3);var l=function(t){t=t||{},e.blockUI({message:s,fadeIn:"undefined"!=typeof t.fadeIn?t.fadeIn:700,fadeOut:"undefined"!=typeof t.fadeOut?t.fadeOut:1e3,timeout:"undefined"!=typeof t.timeout?t.timeout:n,centerY:!1,showOverlay:!1,onUnblock:i,css:e.blockUI.defaults.growlCSS})};l();s.css("opacity");s.mouseover(function(){l({fadeIn:0,timeout:3e4});var t=e(".blockMsg");t.stop(),t.fadeTo(300,1)}).mouseout(function(){e(".blockMsg").fadeOut(1e3)})},e.fn.block=function(o){if(this[0]===window)return e.blockUI(o),this;var n=e.extend({},e.blockUI.defaults,o||{});return this.each(function(){var t=e(this);n.ignoreIfBlocked&&t.data("blockUI.isBlocked")||t.unblock({fadeOut:0})}),this.each(function(){"static"==e.css(this,"position")&&(this.style.position="relative",e(this).data("blockUI.static",!0)),this.style.zoom=1,t(this,o)})},e.fn.unblock=function(t){return this[0]===window?(e.unblockUI(t),this):this.each(function(){o(this,t)})},e.blockUI.version=2.7,e.blockUI.defaults={message:"<h1>Please wait...</h1>",title:null,draggable:!0,theme:!1,css:{padding:0,margin:0,width:"30%",top:"40%",left:"35%",textAlign:"center",color:"#000",border:"3px solid #aaa",backgroundColor:"#fff",cursor:"wait"},themedCSS:{width:"30%",top:"40%",left:"35%"},overlayCSS:{backgroundColor:"#000",opacity:.6,cursor:"wait"},cursorReset:"default",growlCSS:{width:"350px",top:"10px",left:"",right:"10px",border:"none",padding:"5px",opacity:.6,cursor:"default",color:"#fff",backgroundColor:"#000","-webkit-border-radius":"10px","-moz-border-radius":"10px","border-radius":"10px"},iframeSrc:/^https/i.test(window.location.href||"")?"javascript:false":"about:blank",forceIframe:!1,baseZ:1e3,centerX:!0,centerY:!0,allowBodyStretch:!0,bindEvents:!0,constrainTabKey:!0,fadeIn:200,fadeOut:400,timeout:0,showOverlay:!0,focusInput:!0,focusableElements:":input:enabled:visible",onBlock:null,onUnblock:null,onOverlayClick:null,quirksmodeOffsetHack:4,blockMsgClass:"blockMsg",ignoreIfBlocked:!1};var p=null,b=[]}"function"==typeof define&&define.amd&&define.amd.jQuery?define(["jquery"],e):e(jQuery)}();
/* ========================================================================
 * bootstrap-switch - v3.3.2
 * http://www.bootstrap-switch.org
 * ========================================================================
 * Copyright 2012-2013 Mattia Larentis
 *
 * ========================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================================
 */

(function(){var t=[].slice;!function(e,i){"use strict";var n;return n=function(){function t(t,i){null==i&&(i={}),this.$element=e(t),this.options=e.extend({},e.fn.bootstrapSwitch.defaults,{state:this.$element.is(":checked"),size:this.$element.data("size"),animate:this.$element.data("animate"),disabled:this.$element.is(":disabled"),readonly:this.$element.is("[readonly]"),indeterminate:this.$element.data("indeterminate"),inverse:this.$element.data("inverse"),radioAllOff:this.$element.data("radio-all-off"),onColor:this.$element.data("on-color"),offColor:this.$element.data("off-color"),onText:this.$element.data("on-text"),offText:this.$element.data("off-text"),labelText:this.$element.data("label-text"),handleWidth:this.$element.data("handle-width"),labelWidth:this.$element.data("label-width"),baseClass:this.$element.data("base-class"),wrapperClass:this.$element.data("wrapper-class")},i),this.$wrapper=e("<div>",{"class":function(t){return function(){var e;return e=[""+t.options.baseClass].concat(t._getClasses(t.options.wrapperClass)),e.push(t.options.state?""+t.options.baseClass+"-on":""+t.options.baseClass+"-off"),null!=t.options.size&&e.push(""+t.options.baseClass+"-"+t.options.size),t.options.disabled&&e.push(""+t.options.baseClass+"-disabled"),t.options.readonly&&e.push(""+t.options.baseClass+"-readonly"),t.options.indeterminate&&e.push(""+t.options.baseClass+"-indeterminate"),t.options.inverse&&e.push(""+t.options.baseClass+"-inverse"),t.$element.attr("id")&&e.push(""+t.options.baseClass+"-id-"+t.$element.attr("id")),e.join(" ")}}(this)()}),this.$container=e("<div>",{"class":""+this.options.baseClass+"-container"}),this.$on=e("<span>",{html:this.options.onText,"class":""+this.options.baseClass+"-handle-on "+this.options.baseClass+"-"+this.options.onColor}),this.$off=e("<span>",{html:this.options.offText,"class":""+this.options.baseClass+"-handle-off "+this.options.baseClass+"-"+this.options.offColor}),this.$label=e("<span>",{html:this.options.labelText,"class":""+this.options.baseClass+"-label"}),this.$element.on("init.bootstrapSwitch",function(e){return function(){return e.options.onInit.apply(t,arguments)}}(this)),this.$element.on("switchChange.bootstrapSwitch",function(e){return function(){return e.options.onSwitchChange.apply(t,arguments)}}(this)),this.$container=this.$element.wrap(this.$container).parent(),this.$wrapper=this.$container.wrap(this.$wrapper).parent(),this.$element.before(this.options.inverse?this.$off:this.$on).before(this.$label).before(this.options.inverse?this.$on:this.$off),this.options.indeterminate&&this.$element.prop("indeterminate",!0),this._init(),this._elementHandlers(),this._handleHandlers(),this._labelHandlers(),this._formHandler(),this._externalLabelHandler(),this.$element.trigger("init.bootstrapSwitch")}return t.prototype._constructor=t,t.prototype.state=function(t,e){return"undefined"==typeof t?this.options.state:this.options.disabled||this.options.readonly?this.$element:this.options.state&&!this.options.radioAllOff&&this.$element.is(":radio")?this.$element:(this.options.indeterminate&&this.indeterminate(!1),t=!!t,this.$element.prop("checked",t).trigger("change.bootstrapSwitch",e),this.$element)},t.prototype.toggleState=function(t){return this.options.disabled||this.options.readonly?this.$element:this.options.indeterminate?(this.indeterminate(!1),this.state(!0)):this.$element.prop("checked",!this.options.state).trigger("change.bootstrapSwitch",t)},t.prototype.size=function(t){return"undefined"==typeof t?this.options.size:(null!=this.options.size&&this.$wrapper.removeClass(""+this.options.baseClass+"-"+this.options.size),t&&this.$wrapper.addClass(""+this.options.baseClass+"-"+t),this._width(),this._containerPosition(),this.options.size=t,this.$element)},t.prototype.animate=function(t){return"undefined"==typeof t?this.options.animate:(t=!!t,t===this.options.animate?this.$element:this.toggleAnimate())},t.prototype.toggleAnimate=function(){return this.options.animate=!this.options.animate,this.$wrapper.toggleClass(""+this.options.baseClass+"-animate"),this.$element},t.prototype.disabled=function(t){return"undefined"==typeof t?this.options.disabled:(t=!!t,t===this.options.disabled?this.$element:this.toggleDisabled())},t.prototype.toggleDisabled=function(){return this.options.disabled=!this.options.disabled,this.$element.prop("disabled",this.options.disabled),this.$wrapper.toggleClass(""+this.options.baseClass+"-disabled"),this.$element},t.prototype.readonly=function(t){return"undefined"==typeof t?this.options.readonly:(t=!!t,t===this.options.readonly?this.$element:this.toggleReadonly())},t.prototype.toggleReadonly=function(){return this.options.readonly=!this.options.readonly,this.$element.prop("readonly",this.options.readonly),this.$wrapper.toggleClass(""+this.options.baseClass+"-readonly"),this.$element},t.prototype.indeterminate=function(t){return"undefined"==typeof t?this.options.indeterminate:(t=!!t,t===this.options.indeterminate?this.$element:this.toggleIndeterminate())},t.prototype.toggleIndeterminate=function(){return this.options.indeterminate=!this.options.indeterminate,this.$element.prop("indeterminate",this.options.indeterminate),this.$wrapper.toggleClass(""+this.options.baseClass+"-indeterminate"),this._containerPosition(),this.$element},t.prototype.inverse=function(t){return"undefined"==typeof t?this.options.inverse:(t=!!t,t===this.options.inverse?this.$element:this.toggleInverse())},t.prototype.toggleInverse=function(){var t,e;return this.$wrapper.toggleClass(""+this.options.baseClass+"-inverse"),e=this.$on.clone(!0),t=this.$off.clone(!0),this.$on.replaceWith(t),this.$off.replaceWith(e),this.$on=t,this.$off=e,this.options.inverse=!this.options.inverse,this.$element},t.prototype.onColor=function(t){var e;return e=this.options.onColor,"undefined"==typeof t?e:(null!=e&&this.$on.removeClass(""+this.options.baseClass+"-"+e),this.$on.addClass(""+this.options.baseClass+"-"+t),this.options.onColor=t,this.$element)},t.prototype.offColor=function(t){var e;return e=this.options.offColor,"undefined"==typeof t?e:(null!=e&&this.$off.removeClass(""+this.options.baseClass+"-"+e),this.$off.addClass(""+this.options.baseClass+"-"+t),this.options.offColor=t,this.$element)},t.prototype.onText=function(t){return"undefined"==typeof t?this.options.onText:(this.$on.html(t),this._width(),this._containerPosition(),this.options.onText=t,this.$element)},t.prototype.offText=function(t){return"undefined"==typeof t?this.options.offText:(this.$off.html(t),this._width(),this._containerPosition(),this.options.offText=t,this.$element)},t.prototype.labelText=function(t){return"undefined"==typeof t?this.options.labelText:(this.$label.html(t),this._width(),this.options.labelText=t,this.$element)},t.prototype.handleWidth=function(t){return"undefined"==typeof t?this.options.handleWidth:(this.options.handleWidth=t,this._width(),this._containerPosition(),this.$element)},t.prototype.labelWidth=function(t){return"undefined"==typeof t?this.options.labelWidth:(this.options.labelWidth=t,this._width(),this._containerPosition(),this.$element)},t.prototype.baseClass=function(){return this.options.baseClass},t.prototype.wrapperClass=function(t){return"undefined"==typeof t?this.options.wrapperClass:(t||(t=e.fn.bootstrapSwitch.defaults.wrapperClass),this.$wrapper.removeClass(this._getClasses(this.options.wrapperClass).join(" ")),this.$wrapper.addClass(this._getClasses(t).join(" ")),this.options.wrapperClass=t,this.$element)},t.prototype.radioAllOff=function(t){return"undefined"==typeof t?this.options.radioAllOff:(t=!!t,t===this.options.radioAllOff?this.$element:(this.options.radioAllOff=t,this.$element))},t.prototype.onInit=function(t){return"undefined"==typeof t?this.options.onInit:(t||(t=e.fn.bootstrapSwitch.defaults.onInit),this.options.onInit=t,this.$element)},t.prototype.onSwitchChange=function(t){return"undefined"==typeof t?this.options.onSwitchChange:(t||(t=e.fn.bootstrapSwitch.defaults.onSwitchChange),this.options.onSwitchChange=t,this.$element)},t.prototype.destroy=function(){var t;return t=this.$element.closest("form"),t.length&&t.off("reset.bootstrapSwitch").removeData("bootstrap-switch"),this.$container.children().not(this.$element).remove(),this.$element.unwrap().unwrap().off(".bootstrapSwitch").removeData("bootstrap-switch"),this.$element},t.prototype._width=function(){var t,e;return t=this.$on.add(this.$off),t.add(this.$label).css("width",""),e="auto"===this.options.handleWidth?Math.max(this.$on.width(),this.$off.width()):this.options.handleWidth,t.width(e),this.$label.width(function(t){return function(i,n){return"auto"!==t.options.labelWidth?t.options.labelWidth:e>n?e:n}}(this)),this._handleWidth=this.$on.outerWidth(),this._labelWidth=this.$label.outerWidth(),this.$container.width(2*this._handleWidth+this._labelWidth),this.$wrapper.width(this._handleWidth+this._labelWidth)},t.prototype._containerPosition=function(t,e){return null==t&&(t=this.options.state),this.$container.css("margin-left",function(e){return function(){var i;return i=[0,"-"+e._handleWidth+"px"],e.options.indeterminate?"-"+e._handleWidth/2+"px":t?e.options.inverse?i[1]:i[0]:e.options.inverse?i[0]:i[1]}}(this)),e?setTimeout(function(){return e()},50):void 0},t.prototype._init=function(){var t,e;return t=function(t){return function(){return t._width(),t._containerPosition(null,function(){return t.options.animate?t.$wrapper.addClass(""+t.options.baseClass+"-animate"):void 0})}}(this),this.$wrapper.is(":visible")?t():e=i.setInterval(function(n){return function(){return n.$wrapper.is(":visible")?(t(),i.clearInterval(e)):void 0}}(this),50)},t.prototype._elementHandlers=function(){return this.$element.on({"change.bootstrapSwitch":function(t){return function(i,n){var o;return i.preventDefault(),i.stopImmediatePropagation(),o=t.$element.is(":checked"),t._containerPosition(o),o!==t.options.state?(t.options.state=o,t.$wrapper.toggleClass(""+t.options.baseClass+"-off").toggleClass(""+t.options.baseClass+"-on"),n?void 0:(t.$element.is(":radio")&&e("[name='"+t.$element.attr("name")+"']").not(t.$element).prop("checked",!1).trigger("change.bootstrapSwitch",!0),t.$element.trigger("switchChange.bootstrapSwitch",[o]))):void 0}}(this),"focus.bootstrapSwitch":function(t){return function(e){return e.preventDefault(),t.$wrapper.addClass(""+t.options.baseClass+"-focused")}}(this),"blur.bootstrapSwitch":function(t){return function(e){return e.preventDefault(),t.$wrapper.removeClass(""+t.options.baseClass+"-focused")}}(this),"keydown.bootstrapSwitch":function(t){return function(e){if(e.which&&!t.options.disabled&&!t.options.readonly)switch(e.which){case 37:return e.preventDefault(),e.stopImmediatePropagation(),t.state(!1);case 39:return e.preventDefault(),e.stopImmediatePropagation(),t.state(!0)}}}(this)})},t.prototype._handleHandlers=function(){return this.$on.on("click.bootstrapSwitch",function(t){return function(e){return e.preventDefault(),e.stopPropagation(),t.state(!1),t.$element.trigger("focus.bootstrapSwitch")}}(this)),this.$off.on("click.bootstrapSwitch",function(t){return function(e){return e.preventDefault(),e.stopPropagation(),t.state(!0),t.$element.trigger("focus.bootstrapSwitch")}}(this))},t.prototype._labelHandlers=function(){return this.$label.on({"mousedown.bootstrapSwitch touchstart.bootstrapSwitch":function(t){return function(e){return t._dragStart||t.options.disabled||t.options.readonly?void 0:(e.preventDefault(),e.stopPropagation(),t._dragStart=(e.pageX||e.originalEvent.touches[0].pageX)-parseInt(t.$container.css("margin-left"),10),t.options.animate&&t.$wrapper.removeClass(""+t.options.baseClass+"-animate"),t.$element.trigger("focus.bootstrapSwitch"))}}(this),"mousemove.bootstrapSwitch touchmove.bootstrapSwitch":function(t){return function(e){var i;if(null!=t._dragStart&&(e.preventDefault(),i=(e.pageX||e.originalEvent.touches[0].pageX)-t._dragStart,!(i<-t._handleWidth||i>0)))return t._dragEnd=i,t.$container.css("margin-left",""+t._dragEnd+"px")}}(this),"mouseup.bootstrapSwitch touchend.bootstrapSwitch":function(t){return function(e){var i;if(t._dragStart)return e.preventDefault(),t.options.animate&&t.$wrapper.addClass(""+t.options.baseClass+"-animate"),t._dragEnd?(i=t._dragEnd>-(t._handleWidth/2),t._dragEnd=!1,t.state(t.options.inverse?!i:i)):t.state(!t.options.state),t._dragStart=!1}}(this),"mouseleave.bootstrapSwitch":function(t){return function(){return t.$label.trigger("mouseup.bootstrapSwitch")}}(this)})},t.prototype._externalLabelHandler=function(){var t;return t=this.$element.closest("label"),t.on("click",function(e){return function(i){return i.preventDefault(),i.stopImmediatePropagation(),i.target===t[0]?e.toggleState():void 0}}(this))},t.prototype._formHandler=function(){var t;return t=this.$element.closest("form"),t.data("bootstrap-switch")?void 0:t.on("reset.bootstrapSwitch",function(){return i.setTimeout(function(){return t.find("input").filter(function(){return e(this).data("bootstrap-switch")}).each(function(){return e(this).bootstrapSwitch("state",this.checked)})},1)}).data("bootstrap-switch",!0)},t.prototype._getClasses=function(t){var i,n,o,s;if(!e.isArray(t))return[""+this.options.baseClass+"-"+t];for(n=[],o=0,s=t.length;s>o;o++)i=t[o],n.push(""+this.options.baseClass+"-"+i);return n},t}(),e.fn.bootstrapSwitch=function(){var i,o,s;return o=arguments[0],i=2<=arguments.length?t.call(arguments,1):[],s=this,this.each(function(){var t,a;return t=e(this),a=t.data("bootstrap-switch"),a||t.data("bootstrap-switch",a=new n(this,o)),"string"==typeof o?s=a[o].apply(a,i):void 0}),s},e.fn.bootstrapSwitch.Constructor=n,e.fn.bootstrapSwitch.defaults={state:!0,size:null,animate:!0,disabled:!1,readonly:!1,indeterminate:!1,inverse:!1,radioAllOff:!1,onColor:"primary",offColor:"default",onText:"ON",offText:"OFF",labelText:"&nbsp;",handleWidth:"auto",labelWidth:"auto",baseClass:"bootstrap-switch",wrapperClass:"wrapper",onInit:function(){},onSwitchChange:function(){}}}(window.jQuery,window)}).call(this);
/*! jQuery Validation Plugin - v1.14.0 - 6/30/2015
 * http://jqueryvalidation.org/
 * Copyright (c) 2015 Jörn Zaefferer; Licensed MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a(jQuery)}(function(a){a.extend(a.fn,{validate:function(b){if(!this.length)return void(b&&b.debug&&window.console&&console.warn("Nothing selected, can't validate, returning nothing."));var c=a.data(this[0],"validator");return c?c:(this.attr("novalidate","novalidate"),c=new a.validator(b,this[0]),a.data(this[0],"validator",c),c.settings.onsubmit&&(this.on("click.validate",":submit",function(b){c.settings.submitHandler&&(c.submitButton=b.target),a(this).hasClass("cancel")&&(c.cancelSubmit=!0),void 0!==a(this).attr("formnovalidate")&&(c.cancelSubmit=!0)}),this.on("submit.validate",function(b){function d(){var d,e;return c.settings.submitHandler?(c.submitButton&&(d=a("<input type='hidden'/>").attr("name",c.submitButton.name).val(a(c.submitButton).val()).appendTo(c.currentForm)),e=c.settings.submitHandler.call(c,c.currentForm,b),c.submitButton&&d.remove(),void 0!==e?e:!1):!0}return c.settings.debug&&b.preventDefault(),c.cancelSubmit?(c.cancelSubmit=!1,d()):c.form()?c.pendingRequest?(c.formSubmitted=!0,!1):d():(c.focusInvalid(),!1)})),c)},valid:function(){var b,c,d;return a(this[0]).is("form")?b=this.validate().form():(d=[],b=!0,c=a(this[0].form).validate(),this.each(function(){b=c.element(this)&&b,d=d.concat(c.errorList)}),c.errorList=d),b},rules:function(b,c){var d,e,f,g,h,i,j=this[0];if(b)switch(d=a.data(j.form,"validator").settings,e=d.rules,f=a.validator.staticRules(j),b){case"add":a.extend(f,a.validator.normalizeRule(c)),delete f.messages,e[j.name]=f,c.messages&&(d.messages[j.name]=a.extend(d.messages[j.name],c.messages));break;case"remove":return c?(i={},a.each(c.split(/\s/),function(b,c){i[c]=f[c],delete f[c],"required"===c&&a(j).removeAttr("aria-required")}),i):(delete e[j.name],f)}return g=a.validator.normalizeRules(a.extend({},a.validator.classRules(j),a.validator.attributeRules(j),a.validator.dataRules(j),a.validator.staticRules(j)),j),g.required&&(h=g.required,delete g.required,g=a.extend({required:h},g),a(j).attr("aria-required","true")),g.remote&&(h=g.remote,delete g.remote,g=a.extend(g,{remote:h})),g}}),a.extend(a.expr[":"],{blank:function(b){return!a.trim(""+a(b).val())},filled:function(b){return!!a.trim(""+a(b).val())},unchecked:function(b){return!a(b).prop("checked")}}),a.validator=function(b,c){this.settings=a.extend(!0,{},a.validator.defaults,b),this.currentForm=c,this.init()},a.validator.format=function(b,c){return 1===arguments.length?function(){var c=a.makeArray(arguments);return c.unshift(b),a.validator.format.apply(this,c)}:(arguments.length>2&&c.constructor!==Array&&(c=a.makeArray(arguments).slice(1)),c.constructor!==Array&&(c=[c]),a.each(c,function(a,c){b=b.replace(new RegExp("\\{"+a+"\\}","g"),function(){return c})}),b)},a.extend(a.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",validClass:"valid",errorElement:"label",focusCleanup:!1,focusInvalid:!0,errorContainer:a([]),errorLabelContainer:a([]),onsubmit:!0,ignore:":hidden",ignoreTitle:!1,onfocusin:function(a){this.lastActive=a,this.settings.focusCleanup&&(this.settings.unhighlight&&this.settings.unhighlight.call(this,a,this.settings.errorClass,this.settings.validClass),this.hideThese(this.errorsFor(a)))},onfocusout:function(a){this.checkable(a)||!(a.name in this.submitted)&&this.optional(a)||this.element(a)},onkeyup:function(b,c){var d=[16,17,18,20,35,36,37,38,39,40,45,144,225];9===c.which&&""===this.elementValue(b)||-1!==a.inArray(c.keyCode,d)||(b.name in this.submitted||b===this.lastElement)&&this.element(b)},onclick:function(a){a.name in this.submitted?this.element(a):a.parentNode.name in this.submitted&&this.element(a.parentNode)},highlight:function(b,c,d){"radio"===b.type?this.findByName(b.name).addClass(c).removeClass(d):a(b).addClass(c).removeClass(d)},unhighlight:function(b,c,d){"radio"===b.type?this.findByName(b.name).removeClass(c).addClass(d):a(b).removeClass(c).addClass(d)}},setDefaults:function(b){a.extend(a.validator.defaults,b)},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date ( ISO ).",number:"Please enter a valid number.",digits:"Please enter only digits.",creditcard:"Please enter a valid credit card number.",equalTo:"Please enter the same value again.",maxlength:a.validator.format("Please enter no more than {0} characters."),minlength:a.validator.format("Please enter at least {0} characters."),rangelength:a.validator.format("Please enter a value between {0} and {1} characters long."),range:a.validator.format("Please enter a value between {0} and {1}."),max:a.validator.format("Please enter a value less than or equal to {0}."),min:a.validator.format("Please enter a value greater than or equal to {0}.")},autoCreateRanges:!1,prototype:{init:function(){function b(b){var c=a.data(this.form,"validator"),d="on"+b.type.replace(/^validate/,""),e=c.settings;e[d]&&!a(this).is(e.ignore)&&e[d].call(c,this,b)}this.labelContainer=a(this.settings.errorLabelContainer),this.errorContext=this.labelContainer.length&&this.labelContainer||a(this.currentForm),this.containers=a(this.settings.errorContainer).add(this.settings.errorLabelContainer),this.submitted={},this.valueCache={},this.pendingRequest=0,this.pending={},this.invalid={},this.reset();var c,d=this.groups={};a.each(this.settings.groups,function(b,c){"string"==typeof c&&(c=c.split(/\s/)),a.each(c,function(a,c){d[c]=b})}),c=this.settings.rules,a.each(c,function(b,d){c[b]=a.validator.normalizeRule(d)}),a(this.currentForm).on("focusin.validate focusout.validate keyup.validate",":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], [type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], [type='radio'], [type='checkbox']",b).on("click.validate","select, option, [type='radio'], [type='checkbox']",b),this.settings.invalidHandler&&a(this.currentForm).on("invalid-form.validate",this.settings.invalidHandler),a(this.currentForm).find("[required], [data-rule-required], .required").attr("aria-required","true")},form:function(){return this.checkForm(),a.extend(this.submitted,this.errorMap),this.invalid=a.extend({},this.errorMap),this.valid()||a(this.currentForm).triggerHandler("invalid-form",[this]),this.showErrors(),this.valid()},checkForm:function(){this.prepareForm();for(var a=0,b=this.currentElements=this.elements();b[a];a++)this.check(b[a]);return this.valid()},element:function(b){var c=this.clean(b),d=this.validationTargetFor(c),e=!0;return this.lastElement=d,void 0===d?delete this.invalid[c.name]:(this.prepareElement(d),this.currentElements=a(d),e=this.check(d)!==!1,e?delete this.invalid[d.name]:this.invalid[d.name]=!0),a(b).attr("aria-invalid",!e),this.numberOfInvalids()||(this.toHide=this.toHide.add(this.containers)),this.showErrors(),e},showErrors:function(b){if(b){a.extend(this.errorMap,b),this.errorList=[];for(var c in b)this.errorList.push({message:b[c],element:this.findByName(c)[0]});this.successList=a.grep(this.successList,function(a){return!(a.name in b)})}this.settings.showErrors?this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors()},resetForm:function(){a.fn.resetForm&&a(this.currentForm).resetForm(),this.submitted={},this.lastElement=null,this.prepareForm(),this.hideErrors();var b,c=this.elements().removeData("previousValue").removeAttr("aria-invalid");if(this.settings.unhighlight)for(b=0;c[b];b++)this.settings.unhighlight.call(this,c[b],this.settings.errorClass,"");else c.removeClass(this.settings.errorClass)},numberOfInvalids:function(){return this.objectLength(this.invalid)},objectLength:function(a){var b,c=0;for(b in a)c++;return c},hideErrors:function(){this.hideThese(this.toHide)},hideThese:function(a){a.not(this.containers).text(""),this.addWrapper(a).hide()},valid:function(){return 0===this.size()},size:function(){return this.errorList.length},focusInvalid:function(){if(this.settings.focusInvalid)try{a(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin")}catch(b){}},findLastActive:function(){var b=this.lastActive;return b&&1===a.grep(this.errorList,function(a){return a.element.name===b.name}).length&&b},elements:function(){var b=this,c={};return a(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, :disabled").not(this.settings.ignore).filter(function(){return!this.name&&b.settings.debug&&window.console&&console.error("%o has no name assigned",this),this.name in c||!b.objectLength(a(this).rules())?!1:(c[this.name]=!0,!0)})},clean:function(b){return a(b)[0]},errors:function(){var b=this.settings.errorClass.split(" ").join(".");return a(this.settings.errorElement+"."+b,this.errorContext)},reset:function(){this.successList=[],this.errorList=[],this.errorMap={},this.toShow=a([]),this.toHide=a([]),this.currentElements=a([])},prepareForm:function(){this.reset(),this.toHide=this.errors().add(this.containers)},prepareElement:function(a){this.reset(),this.toHide=this.errorsFor(a)},elementValue:function(b){var c,d=a(b),e=b.type;return"radio"===e||"checkbox"===e?this.findByName(b.name).filter(":checked").val():"number"===e&&"undefined"!=typeof b.validity?b.validity.badInput?!1:d.val():(c=d.val(),"string"==typeof c?c.replace(/\r/g,""):c)},check:function(b){b=this.validationTargetFor(this.clean(b));var c,d,e,f=a(b).rules(),g=a.map(f,function(a,b){return b}).length,h=!1,i=this.elementValue(b);for(d in f){e={method:d,parameters:f[d]};try{if(c=a.validator.methods[d].call(this,i,b,e.parameters),"dependency-mismatch"===c&&1===g){h=!0;continue}if(h=!1,"pending"===c)return void(this.toHide=this.toHide.not(this.errorsFor(b)));if(!c)return this.formatAndAdd(b,e),!1}catch(j){throw this.settings.debug&&window.console&&console.log("Exception occurred when checking element "+b.id+", check the '"+e.method+"' method.",j),j instanceof TypeError&&(j.message+=".  Exception occurred when checking element "+b.id+", check the '"+e.method+"' method."),j}}if(!h)return this.objectLength(f)&&this.successList.push(b),!0},customDataMessage:function(b,c){return a(b).data("msg"+c.charAt(0).toUpperCase()+c.substring(1).toLowerCase())||a(b).data("msg")},customMessage:function(a,b){var c=this.settings.messages[a];return c&&(c.constructor===String?c:c[b])},findDefined:function(){for(var a=0;a<arguments.length;a++)if(void 0!==arguments[a])return arguments[a];return void 0},defaultMessage:function(b,c){return this.findDefined(this.customMessage(b.name,c),this.customDataMessage(b,c),!this.settings.ignoreTitle&&b.title||void 0,a.validator.messages[c],"<strong>Warning: No message defined for "+b.name+"</strong>")},formatAndAdd:function(b,c){var d=this.defaultMessage(b,c.method),e=/\$?\{(\d+)\}/g;"function"==typeof d?d=d.call(this,c.parameters,b):e.test(d)&&(d=a.validator.format(d.replace(e,"{$1}"),c.parameters)),this.errorList.push({message:d,element:b,method:c.method}),this.errorMap[b.name]=d,this.submitted[b.name]=d},addWrapper:function(a){return this.settings.wrapper&&(a=a.add(a.parent(this.settings.wrapper))),a},defaultShowErrors:function(){var a,b,c;for(a=0;this.errorList[a];a++)c=this.errorList[a],this.settings.highlight&&this.settings.highlight.call(this,c.element,this.settings.errorClass,this.settings.validClass),this.showLabel(c.element,c.message);if(this.errorList.length&&(this.toShow=this.toShow.add(this.containers)),this.settings.success)for(a=0;this.successList[a];a++)this.showLabel(this.successList[a]);if(this.settings.unhighlight)for(a=0,b=this.validElements();b[a];a++)this.settings.unhighlight.call(this,b[a],this.settings.errorClass,this.settings.validClass);this.toHide=this.toHide.not(this.toShow),this.hideErrors(),this.addWrapper(this.toShow).show()},validElements:function(){return this.currentElements.not(this.invalidElements())},invalidElements:function(){return a(this.errorList).map(function(){return this.element})},showLabel:function(b,c){var d,e,f,g=this.errorsFor(b),h=this.idOrName(b),i=a(b).attr("aria-describedby");g.length?(g.removeClass(this.settings.validClass).addClass(this.settings.errorClass),g.html(c)):(g=a("<"+this.settings.errorElement+">").attr("id",h+"-error").addClass(this.settings.errorClass).html(c||""),d=g,this.settings.wrapper&&(d=g.hide().show().wrap("<"+this.settings.wrapper+"/>").parent()),this.labelContainer.length?this.labelContainer.append(d):this.settings.errorPlacement?this.settings.errorPlacement(d,a(b)):d.insertAfter(b),g.is("label")?g.attr("for",h):0===g.parents("label[for='"+h+"']").length&&(f=g.attr("id").replace(/(:|\.|\[|\]|\$)/g,"\\$1"),i?i.match(new RegExp("\\b"+f+"\\b"))||(i+=" "+f):i=f,a(b).attr("aria-describedby",i),e=this.groups[b.name],e&&a.each(this.groups,function(b,c){c===e&&a("[name='"+b+"']",this.currentForm).attr("aria-describedby",g.attr("id"))}))),!c&&this.settings.success&&(g.text(""),"string"==typeof this.settings.success?g.addClass(this.settings.success):this.settings.success(g,b)),this.toShow=this.toShow.add(g)},errorsFor:function(b){var c=this.idOrName(b),d=a(b).attr("aria-describedby"),e="label[for='"+c+"'], label[for='"+c+"'] *";return d&&(e=e+", #"+d.replace(/\s+/g,", #")),this.errors().filter(e)},idOrName:function(a){return this.groups[a.name]||(this.checkable(a)?a.name:a.id||a.name)},validationTargetFor:function(b){return this.checkable(b)&&(b=this.findByName(b.name)),a(b).not(this.settings.ignore)[0]},checkable:function(a){return/radio|checkbox/i.test(a.type)},findByName:function(b){return a(this.currentForm).find("[name='"+b+"']")},getLength:function(b,c){switch(c.nodeName.toLowerCase()){case"select":return a("option:selected",c).length;case"input":if(this.checkable(c))return this.findByName(c.name).filter(":checked").length}return b.length},depend:function(a,b){return this.dependTypes[typeof a]?this.dependTypes[typeof a](a,b):!0},dependTypes:{"boolean":function(a){return a},string:function(b,c){return!!a(b,c.form).length},"function":function(a,b){return a(b)}},optional:function(b){var c=this.elementValue(b);return!a.validator.methods.required.call(this,c,b)&&"dependency-mismatch"},startRequest:function(a){this.pending[a.name]||(this.pendingRequest++,this.pending[a.name]=!0)},stopRequest:function(b,c){this.pendingRequest--,this.pendingRequest<0&&(this.pendingRequest=0),delete this.pending[b.name],c&&0===this.pendingRequest&&this.formSubmitted&&this.form()?(a(this.currentForm).submit(),this.formSubmitted=!1):!c&&0===this.pendingRequest&&this.formSubmitted&&(a(this.currentForm).triggerHandler("invalid-form",[this]),this.formSubmitted=!1)},previousValue:function(b){return a.data(b,"previousValue")||a.data(b,"previousValue",{old:null,valid:!0,message:this.defaultMessage(b,"remote")})},destroy:function(){this.resetForm(),a(this.currentForm).off(".validate").removeData("validator")}},classRuleSettings:{required:{required:!0},email:{email:!0},url:{url:!0},date:{date:!0},dateISO:{dateISO:!0},number:{number:!0},digits:{digits:!0},creditcard:{creditcard:!0}},addClassRules:function(b,c){b.constructor===String?this.classRuleSettings[b]=c:a.extend(this.classRuleSettings,b)},classRules:function(b){var c={},d=a(b).attr("class");return d&&a.each(d.split(" "),function(){this in a.validator.classRuleSettings&&a.extend(c,a.validator.classRuleSettings[this])}),c},normalizeAttributeRule:function(a,b,c,d){/min|max/.test(c)&&(null===b||/number|range|text/.test(b))&&(d=Number(d),isNaN(d)&&(d=void 0)),d||0===d?a[c]=d:b===c&&"range"!==b&&(a[c]=!0)},attributeRules:function(b){var c,d,e={},f=a(b),g=b.getAttribute("type");for(c in a.validator.methods)"required"===c?(d=b.getAttribute(c),""===d&&(d=!0),d=!!d):d=f.attr(c),this.normalizeAttributeRule(e,g,c,d);return e.maxlength&&/-1|2147483647|524288/.test(e.maxlength)&&delete e.maxlength,e},dataRules:function(b){var c,d,e={},f=a(b),g=b.getAttribute("type");for(c in a.validator.methods)d=f.data("rule"+c.charAt(0).toUpperCase()+c.substring(1).toLowerCase()),this.normalizeAttributeRule(e,g,c,d);return e},staticRules:function(b){var c={},d=a.data(b.form,"validator");return d.settings.rules&&(c=a.validator.normalizeRule(d.settings.rules[b.name])||{}),c},normalizeRules:function(b,c){return a.each(b,function(d,e){if(e===!1)return void delete b[d];if(e.param||e.depends){var f=!0;switch(typeof e.depends){case"string":f=!!a(e.depends,c.form).length;break;case"function":f=e.depends.call(c,c)}f?b[d]=void 0!==e.param?e.param:!0:delete b[d]}}),a.each(b,function(d,e){b[d]=a.isFunction(e)?e(c):e}),a.each(["minlength","maxlength"],function(){b[this]&&(b[this]=Number(b[this]))}),a.each(["rangelength","range"],function(){var c;b[this]&&(a.isArray(b[this])?b[this]=[Number(b[this][0]),Number(b[this][1])]:"string"==typeof b[this]&&(c=b[this].replace(/[\[\]]/g,"").split(/[\s,]+/),b[this]=[Number(c[0]),Number(c[1])]))}),a.validator.autoCreateRanges&&(null!=b.min&&null!=b.max&&(b.range=[b.min,b.max],delete b.min,delete b.max),null!=b.minlength&&null!=b.maxlength&&(b.rangelength=[b.minlength,b.maxlength],delete b.minlength,delete b.maxlength)),b},normalizeRule:function(b){if("string"==typeof b){var c={};a.each(b.split(/\s/),function(){c[this]=!0}),b=c}return b},addMethod:function(b,c,d){a.validator.methods[b]=c,a.validator.messages[b]=void 0!==d?d:a.validator.messages[b],c.length<3&&a.validator.addClassRules(b,a.validator.normalizeRule(b))},methods:{required:function(b,c,d){if(!this.depend(d,c))return"dependency-mismatch";if("select"===c.nodeName.toLowerCase()){var e=a(c).val();return e&&e.length>0}return this.checkable(c)?this.getLength(b,c)>0:b.length>0},email:function(a,b){return this.optional(b)||/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(a)},url:function(a,b){return this.optional(b)||/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(a)},date:function(a,b){return this.optional(b)||!/Invalid|NaN/.test(new Date(a).toString())},dateISO:function(a,b){return this.optional(b)||/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(a)},number:function(a,b){return this.optional(b)||/^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(a)},digits:function(a,b){return this.optional(b)||/^\d+$/.test(a)},creditcard:function(a,b){if(this.optional(b))return"dependency-mismatch";if(/[^0-9 \-]+/.test(a))return!1;var c,d,e=0,f=0,g=!1;if(a=a.replace(/\D/g,""),a.length<13||a.length>19)return!1;for(c=a.length-1;c>=0;c--)d=a.charAt(c),f=parseInt(d,10),g&&(f*=2)>9&&(f-=9),e+=f,g=!g;return e%10===0},minlength:function(b,c,d){var e=a.isArray(b)?b.length:this.getLength(b,c);return this.optional(c)||e>=d},maxlength:function(b,c,d){var e=a.isArray(b)?b.length:this.getLength(b,c);return this.optional(c)||d>=e},rangelength:function(b,c,d){var e=a.isArray(b)?b.length:this.getLength(b,c);return this.optional(c)||e>=d[0]&&e<=d[1]},min:function(a,b,c){return this.optional(b)||a>=c},max:function(a,b,c){return this.optional(b)||c>=a},range:function(a,b,c){return this.optional(b)||a>=c[0]&&a<=c[1]},equalTo:function(b,c,d){var e=a(d);return this.settings.onfocusout&&e.off(".validate-equalTo").on("blur.validate-equalTo",function(){a(c).valid()}),b===e.val()},remote:function(b,c,d){if(this.optional(c))return"dependency-mismatch";var e,f,g=this.previousValue(c);return this.settings.messages[c.name]||(this.settings.messages[c.name]={}),g.originalMessage=this.settings.messages[c.name].remote,this.settings.messages[c.name].remote=g.message,d="string"==typeof d&&{url:d}||d,g.old===b?g.valid:(g.old=b,e=this,this.startRequest(c),f={},f[c.name]=b,a.ajax(a.extend(!0,{mode:"abort",port:"validate"+c.name,dataType:"json",data:f,context:e.currentForm,success:function(d){var f,h,i,j=d===!0||"true"===d;e.settings.messages[c.name].remote=g.originalMessage,j?(i=e.formSubmitted,e.prepareElement(c),e.formSubmitted=i,e.successList.push(c),delete e.invalid[c.name],e.showErrors()):(f={},h=d||e.defaultMessage(c,"remote"),f[c.name]=g.message=a.isFunction(h)?h(b):h,e.invalid[c.name]=!0,e.showErrors(f)),g.valid=j,e.stopRequest(c,j)}},d)),"pending")}}});var b,c={};a.ajaxPrefilter?a.ajaxPrefilter(function(a,b,d){var e=a.port;"abort"===a.mode&&(c[e]&&c[e].abort(),c[e]=d)}):(b=a.ajax,a.ajax=function(d){var e=("mode"in d?d:a.ajaxSettings).mode,f=("port"in d?d:a.ajaxSettings).port;return"abort"===e?(c[f]&&c[f].abort(),c[f]=b.apply(this,arguments),c[f]):b.apply(this,arguments)})});
/*! jQuery Validation Plugin - v1.14.0 - 6/30/2015
 * http://jqueryvalidation.org/
 * Copyright (c) 2015 Jörn Zaefferer; Licensed MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery","./jquery.validate.min"],a):a(jQuery)}(function(a){!function(){function b(a){return a.replace(/<.[^<>]*?>/g," ").replace(/&nbsp;|&#160;/gi," ").replace(/[.(),;:!?%#$'\"_+=\/\-“”’]*/g,"")}a.validator.addMethod("maxWords",function(a,c,d){return this.optional(c)||b(a).match(/\b\w+\b/g).length<=d},a.validator.format("Please enter {0} words or less.")),a.validator.addMethod("minWords",function(a,c,d){return this.optional(c)||b(a).match(/\b\w+\b/g).length>=d},a.validator.format("Please enter at least {0} words.")),a.validator.addMethod("rangeWords",function(a,c,d){var e=b(a),f=/\b\w+\b/g;return this.optional(c)||e.match(f).length>=d[0]&&e.match(f).length<=d[1]},a.validator.format("Please enter between {0} and {1} words."))}(),a.validator.addMethod("accept",function(b,c,d){var e,f,g="string"==typeof d?d.replace(/\s/g,"").replace(/,/g,"|"):"image/*",h=this.optional(c);if(h)return h;if("file"===a(c).attr("type")&&(g=g.replace(/\*/g,".*"),c.files&&c.files.length))for(e=0;e<c.files.length;e++)if(f=c.files[e],!f.type.match(new RegExp("\\.?("+g+")$","i")))return!1;return!0},a.validator.format("Please enter a value with a valid mimetype.")),a.validator.addMethod("alphanumeric",function(a,b){return this.optional(b)||/^\w+$/i.test(a)},"Letters, numbers, and underscores only please"),a.validator.addMethod("bankaccountNL",function(a,b){if(this.optional(b))return!0;if(!/^[0-9]{9}|([0-9]{2} ){3}[0-9]{3}$/.test(a))return!1;var c,d,e,f=a.replace(/ /g,""),g=0,h=f.length;for(c=0;h>c;c++)d=h-c,e=f.substring(c,c+1),g+=d*e;return g%11===0},"Please specify a valid bank account number"),a.validator.addMethod("bankorgiroaccountNL",function(b,c){return this.optional(c)||a.validator.methods.bankaccountNL.call(this,b,c)||a.validator.methods.giroaccountNL.call(this,b,c)},"Please specify a valid bank or giro account number"),a.validator.addMethod("bic",function(a,b){return this.optional(b)||/^([A-Z]{6}[A-Z2-9][A-NP-Z1-2])(X{3}|[A-WY-Z0-9][A-Z0-9]{2})?$/.test(a)},"Please specify a valid BIC code"),a.validator.addMethod("cifES",function(a){"use strict";var b,c,d,e,f,g,h=[];if(a=a.toUpperCase(),!a.match("((^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$|^[T]{1}[A-Z0-9]{8}$)|^[0-9]{8}[A-Z]{1}$)"))return!1;for(d=0;9>d;d++)h[d]=parseInt(a.charAt(d),10);for(c=h[2]+h[4]+h[6],e=1;8>e;e+=2)f=(2*h[e]).toString(),g=f.charAt(1),c+=parseInt(f.charAt(0),10)+(""===g?0:parseInt(g,10));return/^[ABCDEFGHJNPQRSUVW]{1}/.test(a)?(c+="",b=10-parseInt(c.charAt(c.length-1),10),a+=b,h[8].toString()===String.fromCharCode(64+b)||h[8].toString()===a.charAt(a.length-1)):!1},"Please specify a valid CIF number."),a.validator.addMethod("cpfBR",function(a){if(a=a.replace(/([~!@#$%^&*()_+=`{}\[\]\-|\\:;'<>,.\/? ])+/g,""),11!==a.length)return!1;var b,c,d,e,f=0;if(b=parseInt(a.substring(9,10),10),c=parseInt(a.substring(10,11),10),d=function(a,b){var c=10*a%11;return(10===c||11===c)&&(c=0),c===b},""===a||"00000000000"===a||"11111111111"===a||"22222222222"===a||"33333333333"===a||"44444444444"===a||"55555555555"===a||"66666666666"===a||"77777777777"===a||"88888888888"===a||"99999999999"===a)return!1;for(e=1;9>=e;e++)f+=parseInt(a.substring(e-1,e),10)*(11-e);if(d(f,b)){for(f=0,e=1;10>=e;e++)f+=parseInt(a.substring(e-1,e),10)*(12-e);return d(f,c)}return!1},"Please specify a valid CPF number"),a.validator.addMethod("creditcardtypes",function(a,b,c){if(/[^0-9\-]+/.test(a))return!1;a=a.replace(/\D/g,"");var d=0;return c.mastercard&&(d|=1),c.visa&&(d|=2),c.amex&&(d|=4),c.dinersclub&&(d|=8),c.enroute&&(d|=16),c.discover&&(d|=32),c.jcb&&(d|=64),c.unknown&&(d|=128),c.all&&(d=255),1&d&&/^(5[12345])/.test(a)?16===a.length:2&d&&/^(4)/.test(a)?16===a.length:4&d&&/^(3[47])/.test(a)?15===a.length:8&d&&/^(3(0[012345]|[68]))/.test(a)?14===a.length:16&d&&/^(2(014|149))/.test(a)?15===a.length:32&d&&/^(6011)/.test(a)?16===a.length:64&d&&/^(3)/.test(a)?16===a.length:64&d&&/^(2131|1800)/.test(a)?15===a.length:128&d?!0:!1},"Please enter a valid credit card number."),a.validator.addMethod("currency",function(a,b,c){var d,e="string"==typeof c,f=e?c:c[0],g=e?!0:c[1];return f=f.replace(/,/g,""),f=g?f+"]":f+"]?",d="^["+f+"([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$",d=new RegExp(d),this.optional(b)||d.test(a)},"Please specify a valid currency"),a.validator.addMethod("dateFA",function(a,b){return this.optional(b)||/^[1-4]\d{3}\/((0?[1-6]\/((3[0-1])|([1-2][0-9])|(0?[1-9])))|((1[0-2]|(0?[7-9]))\/(30|([1-2][0-9])|(0?[1-9]))))$/.test(a)},a.validator.messages.date),a.validator.addMethod("dateITA",function(a,b){var c,d,e,f,g,h=!1,i=/^\d{1,2}\/\d{1,2}\/\d{4}$/;return i.test(a)?(c=a.split("/"),d=parseInt(c[0],10),e=parseInt(c[1],10),f=parseInt(c[2],10),g=new Date(Date.UTC(f,e-1,d,12,0,0,0)),h=g.getUTCFullYear()===f&&g.getUTCMonth()===e-1&&g.getUTCDate()===d?!0:!1):h=!1,this.optional(b)||h},a.validator.messages.date),a.validator.addMethod("dateNL",function(a,b){return this.optional(b)||/^(0?[1-9]|[12]\d|3[01])[\.\/\-](0?[1-9]|1[012])[\.\/\-]([12]\d)?(\d\d)$/.test(a)},a.validator.messages.date),a.validator.addMethod("extension",function(a,b,c){return c="string"==typeof c?c.replace(/,/g,"|"):"png|jpe?g|gif",this.optional(b)||a.match(new RegExp("\\.("+c+")$","i"))},a.validator.format("Please enter a value with a valid extension.")),a.validator.addMethod("giroaccountNL",function(a,b){return this.optional(b)||/^[0-9]{1,7}$/.test(a)},"Please specify a valid giro account number"),a.validator.addMethod("iban",function(a,b){if(this.optional(b))return!0;var c,d,e,f,g,h,i,j,k,l=a.replace(/ /g,"").toUpperCase(),m="",n=!0,o="",p="";if(c=l.substring(0,2),h={AL:"\\d{8}[\\dA-Z]{16}",AD:"\\d{8}[\\dA-Z]{12}",AT:"\\d{16}",AZ:"[\\dA-Z]{4}\\d{20}",BE:"\\d{12}",BH:"[A-Z]{4}[\\dA-Z]{14}",BA:"\\d{16}",BR:"\\d{23}[A-Z][\\dA-Z]",BG:"[A-Z]{4}\\d{6}[\\dA-Z]{8}",CR:"\\d{17}",HR:"\\d{17}",CY:"\\d{8}[\\dA-Z]{16}",CZ:"\\d{20}",DK:"\\d{14}",DO:"[A-Z]{4}\\d{20}",EE:"\\d{16}",FO:"\\d{14}",FI:"\\d{14}",FR:"\\d{10}[\\dA-Z]{11}\\d{2}",GE:"[\\dA-Z]{2}\\d{16}",DE:"\\d{18}",GI:"[A-Z]{4}[\\dA-Z]{15}",GR:"\\d{7}[\\dA-Z]{16}",GL:"\\d{14}",GT:"[\\dA-Z]{4}[\\dA-Z]{20}",HU:"\\d{24}",IS:"\\d{22}",IE:"[\\dA-Z]{4}\\d{14}",IL:"\\d{19}",IT:"[A-Z]\\d{10}[\\dA-Z]{12}",KZ:"\\d{3}[\\dA-Z]{13}",KW:"[A-Z]{4}[\\dA-Z]{22}",LV:"[A-Z]{4}[\\dA-Z]{13}",LB:"\\d{4}[\\dA-Z]{20}",LI:"\\d{5}[\\dA-Z]{12}",LT:"\\d{16}",LU:"\\d{3}[\\dA-Z]{13}",MK:"\\d{3}[\\dA-Z]{10}\\d{2}",MT:"[A-Z]{4}\\d{5}[\\dA-Z]{18}",MR:"\\d{23}",MU:"[A-Z]{4}\\d{19}[A-Z]{3}",MC:"\\d{10}[\\dA-Z]{11}\\d{2}",MD:"[\\dA-Z]{2}\\d{18}",ME:"\\d{18}",NL:"[A-Z]{4}\\d{10}",NO:"\\d{11}",PK:"[\\dA-Z]{4}\\d{16}",PS:"[\\dA-Z]{4}\\d{21}",PL:"\\d{24}",PT:"\\d{21}",RO:"[A-Z]{4}[\\dA-Z]{16}",SM:"[A-Z]\\d{10}[\\dA-Z]{12}",SA:"\\d{2}[\\dA-Z]{18}",RS:"\\d{18}",SK:"\\d{20}",SI:"\\d{15}",ES:"\\d{20}",SE:"\\d{20}",CH:"\\d{5}[\\dA-Z]{12}",TN:"\\d{20}",TR:"\\d{5}[\\dA-Z]{17}",AE:"\\d{3}\\d{16}",GB:"[A-Z]{4}\\d{14}",VG:"[\\dA-Z]{4}\\d{16}"},g=h[c],"undefined"!=typeof g&&(i=new RegExp("^[A-Z]{2}\\d{2}"+g+"$",""),!i.test(l)))return!1;for(d=l.substring(4,l.length)+l.substring(0,4),j=0;j<d.length;j++)e=d.charAt(j),"0"!==e&&(n=!1),n||(m+="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(e));for(k=0;k<m.length;k++)f=m.charAt(k),p=""+o+f,o=p%97;return 1===o},"Please specify a valid IBAN"),a.validator.addMethod("integer",function(a,b){return this.optional(b)||/^-?\d+$/.test(a)},"A positive or negative non-decimal number please"),a.validator.addMethod("ipv4",function(a,b){return this.optional(b)||/^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(a)},"Please enter a valid IP v4 address."),a.validator.addMethod("ipv6",function(a,b){return this.optional(b)||/^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(a)},"Please enter a valid IP v6 address."),a.validator.addMethod("lettersonly",function(a,b){return this.optional(b)||/^[a-z]+$/i.test(a)},"Letters only please"),a.validator.addMethod("letterswithbasicpunc",function(a,b){return this.optional(b)||/^[a-z\-.,()'"\s]+$/i.test(a)},"Letters or punctuation only please"),a.validator.addMethod("mobileNL",function(a,b){return this.optional(b)||/^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)6((\s|\s?\-\s?)?[0-9]){8}$/.test(a)},"Please specify a valid mobile number"),a.validator.addMethod("mobileUK",function(a,b){return a=a.replace(/\(|\)|\s+|-/g,""),this.optional(b)||a.length>9&&a.match(/^(?:(?:(?:00\s?|\+)44\s?|0)7(?:[1345789]\d{2}|624)\s?\d{3}\s?\d{3})$/)},"Please specify a valid mobile number"),a.validator.addMethod("nieES",function(a){"use strict";return a=a.toUpperCase(),a.match("((^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$|^[T]{1}[A-Z0-9]{8}$)|^[0-9]{8}[A-Z]{1}$)")?/^[T]{1}/.test(a)?a[8]===/^[T]{1}[A-Z0-9]{8}$/.test(a):/^[XYZ]{1}/.test(a)?a[8]==="TRWAGMYFPDXBNJZSQVHLCKE".charAt(a.replace("X","0").replace("Y","1").replace("Z","2").substring(0,8)%23):!1:!1},"Please specify a valid NIE number."),a.validator.addMethod("nifES",function(a){"use strict";return a=a.toUpperCase(),a.match("((^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$|^[T]{1}[A-Z0-9]{8}$)|^[0-9]{8}[A-Z]{1}$)")?/^[0-9]{8}[A-Z]{1}$/.test(a)?"TRWAGMYFPDXBNJZSQVHLCKE".charAt(a.substring(8,0)%23)===a.charAt(8):/^[KLM]{1}/.test(a)?a[8]===String.fromCharCode(64):!1:!1},"Please specify a valid NIF number."),jQuery.validator.addMethod("notEqualTo",function(b,c,d){return this.optional(c)||!a.validator.methods.equalTo.call(this,b,c,d)},"Please enter a different value, values must not be the same."),a.validator.addMethod("nowhitespace",function(a,b){return this.optional(b)||/^\S+$/i.test(a)},"No white space please"),a.validator.addMethod("pattern",function(a,b,c){return this.optional(b)?!0:("string"==typeof c&&(c=new RegExp("^(?:"+c+")$")),c.test(a))},"Invalid format."),a.validator.addMethod("phoneNL",function(a,b){return this.optional(b)||/^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test(a)},"Please specify a valid phone number."),a.validator.addMethod("phoneUK",function(a,b){return a=a.replace(/\(|\)|\s+|-/g,""),this.optional(b)||a.length>9&&a.match(/^(?:(?:(?:00\s?|\+)44\s?)|(?:\(?0))(?:\d{2}\)?\s?\d{4}\s?\d{4}|\d{3}\)?\s?\d{3}\s?\d{3,4}|\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3})|\d{5}\)?\s?\d{4,5})$/)},"Please specify a valid phone number"),a.validator.addMethod("phoneUS",function(a,b){return a=a.replace(/\s+/g,""),this.optional(b)||a.length>9&&a.match(/^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]([02-9]\d|1[02-9])-?\d{4}$/)},"Please specify a valid phone number"),a.validator.addMethod("phonesUK",function(a,b){return a=a.replace(/\(|\)|\s+|-/g,""),this.optional(b)||a.length>9&&a.match(/^(?:(?:(?:00\s?|\+)44\s?|0)(?:1\d{8,9}|[23]\d{9}|7(?:[1345789]\d{8}|624\d{6})))$/)},"Please specify a valid uk phone number"),a.validator.addMethod("postalCodeCA",function(a,b){return this.optional(b)||/^[ABCEGHJKLMNPRSTVXY]\d[A-Z] \d[A-Z]\d$/.test(a)},"Please specify a valid postal code"),a.validator.addMethod("postalcodeBR",function(a,b){return this.optional(b)||/^\d{2}.\d{3}-\d{3}?$|^\d{5}-?\d{3}?$/.test(a)},"Informe um CEP válido."),a.validator.addMethod("postalcodeIT",function(a,b){return this.optional(b)||/^\d{5}$/.test(a)},"Please specify a valid postal code"),a.validator.addMethod("postalcodeNL",function(a,b){return this.optional(b)||/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(a)},"Please specify a valid postal code"),a.validator.addMethod("postcodeUK",function(a,b){return this.optional(b)||/^((([A-PR-UWYZ][0-9])|([A-PR-UWYZ][0-9][0-9])|([A-PR-UWYZ][A-HK-Y][0-9])|([A-PR-UWYZ][A-HK-Y][0-9][0-9])|([A-PR-UWYZ][0-9][A-HJKSTUW])|([A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRVWXY]))\s?([0-9][ABD-HJLNP-UW-Z]{2})|(GIR)\s?(0AA))$/i.test(a)},"Please specify a valid UK postcode"),a.validator.addMethod("require_from_group",function(b,c,d){var e=a(d[1],c.form),f=e.eq(0),g=f.data("valid_req_grp")?f.data("valid_req_grp"):a.extend({},this),h=e.filter(function(){return g.elementValue(this)}).length>=d[0];return f.data("valid_req_grp",g),a(c).data("being_validated")||(e.data("being_validated",!0),e.each(function(){g.element(this)}),e.data("being_validated",!1)),h},a.validator.format("Please fill at least {0} of these fields.")),a.validator.addMethod("skip_or_fill_minimum",function(b,c,d){var e=a(d[1],c.form),f=e.eq(0),g=f.data("valid_skip")?f.data("valid_skip"):a.extend({},this),h=e.filter(function(){return g.elementValue(this)}).length,i=0===h||h>=d[0];return f.data("valid_skip",g),a(c).data("being_validated")||(e.data("being_validated",!0),e.each(function(){g.element(this)}),e.data("being_validated",!1)),i},a.validator.format("Please either skip these fields or fill at least {0} of them.")),a.validator.addMethod("stateUS",function(a,b,c){var d,e="undefined"==typeof c,f=e||"undefined"==typeof c.caseSensitive?!1:c.caseSensitive,g=e||"undefined"==typeof c.includeTerritories?!1:c.includeTerritories,h=e||"undefined"==typeof c.includeMilitary?!1:c.includeMilitary;return d=g||h?g&&h?"^(A[AEKLPRSZ]|C[AOT]|D[CE]|FL|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEINOPST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$":g?"^(A[KLRSZ]|C[AOT]|D[CE]|FL|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEINOPST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$":"^(A[AEKLPRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])$":"^(A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])$",d=f?new RegExp(d):new RegExp(d,"i"),this.optional(b)||d.test(a)},"Please specify a valid state"),a.validator.addMethod("strippedminlength",function(b,c,d){return a(b).text().length>=d},a.validator.format("Please enter at least {0} characters")),a.validator.addMethod("time",function(a,b){return this.optional(b)||/^([01]\d|2[0-3]|[0-9])(:[0-5]\d){1,2}$/.test(a)},"Please enter a valid time, between 00:00 and 23:59"),a.validator.addMethod("time12h",function(a,b){return this.optional(b)||/^((0?[1-9]|1[012])(:[0-5]\d){1,2}(\ ?[AP]M))$/i.test(a)},"Please enter a valid time in 12-hour am/pm format"),a.validator.addMethod("url2",function(a,b){return this.optional(b)||/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(a)},a.validator.messages.url),a.validator.addMethod("vinUS",function(a){if(17!==a.length)return!1;var b,c,d,e,f,g,h=["A","B","C","D","E","F","G","H","J","K","L","M","N","P","R","S","T","U","V","W","X","Y","Z"],i=[1,2,3,4,5,6,7,8,1,2,3,4,5,7,9,2,3,4,5,6,7,8,9],j=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2],k=0;for(b=0;17>b;b++){if(e=j[b],d=a.slice(b,b+1),8===b&&(g=d),isNaN(d)){for(c=0;c<h.length;c++)if(d.toUpperCase()===h[c]){d=i[c],d*=e,isNaN(g)&&8===c&&(g=h[c]);break}}else d*=e;k+=d}return f=k%11,10===f&&(f="X"),f===g?!0:!1},"The specified vehicle identification number (VIN) is invalid."),a.validator.addMethod("zipcodeUS",function(a,b){return this.optional(b)||/^\d{5}(-\d{4})?$/.test(a)},"The specified US ZIP Code is invalid"),a.validator.addMethod("ziprange",function(a,b){return this.optional(b)||/^90[2-5]\d\{2\}-\d{4}$/.test(a)},"Your ZIP-code must be in the range 902xx-xxxx to 905xx-xxxx")});
/*! Select2 4.0.3 | https://github.com/select2/select2/blob/master/LICENSE.md */!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b=function(){if(a&&a.fn&&a.fn.select2&&a.fn.select2.amd)var b=a.fn.select2.amd;var b;return function(){if(!b||!b.requirejs){b?c=b:b={};var a,c,d;!function(b){function e(a,b){return u.call(a,b)}function f(a,b){var c,d,e,f,g,h,i,j,k,l,m,n=b&&b.split("/"),o=s.map,p=o&&o["*"]||{};if(a&&"."===a.charAt(0))if(b){for(a=a.split("/"),g=a.length-1,s.nodeIdCompat&&w.test(a[g])&&(a[g]=a[g].replace(w,"")),a=n.slice(0,n.length-1).concat(a),k=0;k<a.length;k+=1)if(m=a[k],"."===m)a.splice(k,1),k-=1;else if(".."===m){if(1===k&&(".."===a[2]||".."===a[0]))break;k>0&&(a.splice(k-1,2),k-=2)}a=a.join("/")}else 0===a.indexOf("./")&&(a=a.substring(2));if((n||p)&&o){for(c=a.split("/"),k=c.length;k>0;k-=1){if(d=c.slice(0,k).join("/"),n)for(l=n.length;l>0;l-=1)if(e=o[n.slice(0,l).join("/")],e&&(e=e[d])){f=e,h=k;break}if(f)break;!i&&p&&p[d]&&(i=p[d],j=k)}!f&&i&&(f=i,h=j),f&&(c.splice(0,h,f),a=c.join("/"))}return a}function g(a,c){return function(){var d=v.call(arguments,0);return"string"!=typeof d[0]&&1===d.length&&d.push(null),n.apply(b,d.concat([a,c]))}}function h(a){return function(b){return f(b,a)}}function i(a){return function(b){q[a]=b}}function j(a){if(e(r,a)){var c=r[a];delete r[a],t[a]=!0,m.apply(b,c)}if(!e(q,a)&&!e(t,a))throw new Error("No "+a);return q[a]}function k(a){var b,c=a?a.indexOf("!"):-1;return c>-1&&(b=a.substring(0,c),a=a.substring(c+1,a.length)),[b,a]}function l(a){return function(){return s&&s.config&&s.config[a]||{}}}var m,n,o,p,q={},r={},s={},t={},u=Object.prototype.hasOwnProperty,v=[].slice,w=/\.js$/;o=function(a,b){var c,d=k(a),e=d[0];return a=d[1],e&&(e=f(e,b),c=j(e)),e?a=c&&c.normalize?c.normalize(a,h(b)):f(a,b):(a=f(a,b),d=k(a),e=d[0],a=d[1],e&&(c=j(e))),{f:e?e+"!"+a:a,n:a,pr:e,p:c}},p={require:function(a){return g(a)},exports:function(a){var b=q[a];return"undefined"!=typeof b?b:q[a]={}},module:function(a){return{id:a,uri:"",exports:q[a],config:l(a)}}},m=function(a,c,d,f){var h,k,l,m,n,s,u=[],v=typeof d;if(f=f||a,"undefined"===v||"function"===v){for(c=!c.length&&d.length?["require","exports","module"]:c,n=0;n<c.length;n+=1)if(m=o(c[n],f),k=m.f,"require"===k)u[n]=p.require(a);else if("exports"===k)u[n]=p.exports(a),s=!0;else if("module"===k)h=u[n]=p.module(a);else if(e(q,k)||e(r,k)||e(t,k))u[n]=j(k);else{if(!m.p)throw new Error(a+" missing "+k);m.p.load(m.n,g(f,!0),i(k),{}),u[n]=q[k]}l=d?d.apply(q[a],u):void 0,a&&(h&&h.exports!==b&&h.exports!==q[a]?q[a]=h.exports:l===b&&s||(q[a]=l))}else a&&(q[a]=d)},a=c=n=function(a,c,d,e,f){if("string"==typeof a)return p[a]?p[a](c):j(o(a,c).f);if(!a.splice){if(s=a,s.deps&&n(s.deps,s.callback),!c)return;c.splice?(a=c,c=d,d=null):a=b}return c=c||function(){},"function"==typeof d&&(d=e,e=f),e?m(b,a,c,d):setTimeout(function(){m(b,a,c,d)},4),n},n.config=function(a){return n(a)},a._defined=q,d=function(a,b,c){if("string"!=typeof a)throw new Error("See almond README: incorrect module build, no module name");b.splice||(c=b,b=[]),e(q,a)||e(r,a)||(r[a]=[a,b,c])},d.amd={jQuery:!0}}(),b.requirejs=a,b.require=c,b.define=d}}(),b.define("almond",function(){}),b.define("jquery",[],function(){var b=a||$;return null==b&&console&&console.error&&console.error("Select2: An instance of jQuery or a jQuery-compatible library was not found. Make sure that you are including jQuery before Select2 on your web page."),b}),b.define("select2/utils",["jquery"],function(a){function b(a){var b=a.prototype,c=[];for(var d in b){var e=b[d];"function"==typeof e&&"constructor"!==d&&c.push(d)}return c}var c={};c.Extend=function(a,b){function c(){this.constructor=a}var d={}.hasOwnProperty;for(var e in b)d.call(b,e)&&(a[e]=b[e]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},c.Decorate=function(a,c){function d(){var b=Array.prototype.unshift,d=c.prototype.constructor.length,e=a.prototype.constructor;d>0&&(b.call(arguments,a.prototype.constructor),e=c.prototype.constructor),e.apply(this,arguments)}function e(){this.constructor=d}var f=b(c),g=b(a);c.displayName=a.displayName,d.prototype=new e;for(var h=0;h<g.length;h++){var i=g[h];d.prototype[i]=a.prototype[i]}for(var j=(function(a){var b=function(){};a in d.prototype&&(b=d.prototype[a]);var e=c.prototype[a];return function(){var a=Array.prototype.unshift;return a.call(arguments,b),e.apply(this,arguments)}}),k=0;k<f.length;k++){var l=f[k];d.prototype[l]=j(l)}return d};var d=function(){this.listeners={}};return d.prototype.on=function(a,b){this.listeners=this.listeners||{},a in this.listeners?this.listeners[a].push(b):this.listeners[a]=[b]},d.prototype.trigger=function(a){var b=Array.prototype.slice,c=b.call(arguments,1);this.listeners=this.listeners||{},null==c&&(c=[]),0===c.length&&c.push({}),c[0]._type=a,a in this.listeners&&this.invoke(this.listeners[a],b.call(arguments,1)),"*"in this.listeners&&this.invoke(this.listeners["*"],arguments)},d.prototype.invoke=function(a,b){for(var c=0,d=a.length;d>c;c++)a[c].apply(this,b)},c.Observable=d,c.generateChars=function(a){for(var b="",c=0;a>c;c++){var d=Math.floor(36*Math.random());b+=d.toString(36)}return b},c.bind=function(a,b){return function(){a.apply(b,arguments)}},c._convertData=function(a){for(var b in a){var c=b.split("-"),d=a;if(1!==c.length){for(var e=0;e<c.length;e++){var f=c[e];f=f.substring(0,1).toLowerCase()+f.substring(1),f in d||(d[f]={}),e==c.length-1&&(d[f]=a[b]),d=d[f]}delete a[b]}}return a},c.hasScroll=function(b,c){var d=a(c),e=c.style.overflowX,f=c.style.overflowY;return e!==f||"hidden"!==f&&"visible"!==f?"scroll"===e||"scroll"===f?!0:d.innerHeight()<c.scrollHeight||d.innerWidth()<c.scrollWidth:!1},c.escapeMarkup=function(a){var b={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;"};return"string"!=typeof a?a:String(a).replace(/[&<>"'\/\\]/g,function(a){return b[a]})},c.appendMany=function(b,c){if("1.7"===a.fn.jquery.substr(0,3)){var d=a();a.map(c,function(a){d=d.add(a)}),c=d}b.append(c)},c}),b.define("select2/results",["jquery","./utils"],function(a,b){function c(a,b,d){this.$element=a,this.data=d,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<ul class="select2-results__options" role="tree"></ul>');return this.options.get("multiple")&&b.attr("aria-multiselectable","true"),this.$results=b,b},c.prototype.clear=function(){this.$results.empty()},c.prototype.displayMessage=function(b){var c=this.options.get("escapeMarkup");this.clear(),this.hideLoading();var d=a('<li role="treeitem" aria-live="assertive" class="select2-results__option"></li>'),e=this.options.get("translations").get(b.message);d.append(c(e(b.args))),d[0].className+=" select2-results__message",this.$results.append(d)},c.prototype.hideMessages=function(){this.$results.find(".select2-results__message").remove()},c.prototype.append=function(a){this.hideLoading();var b=[];if(null==a.results||0===a.results.length)return void(0===this.$results.children().length&&this.trigger("results:message",{message:"noResults"}));a.results=this.sort(a.results);for(var c=0;c<a.results.length;c++){var d=a.results[c],e=this.option(d);b.push(e)}this.$results.append(b)},c.prototype.position=function(a,b){var c=b.find(".select2-results");c.append(a)},c.prototype.sort=function(a){var b=this.options.get("sorter");return b(a)},c.prototype.highlightFirstItem=function(){var a=this.$results.find(".select2-results__option[aria-selected]"),b=a.filter("[aria-selected=true]");b.length>0?b.first().trigger("mouseenter"):a.first().trigger("mouseenter"),this.ensureHighlightVisible()},c.prototype.setClasses=function(){var b=this;this.data.current(function(c){var d=a.map(c,function(a){return a.id.toString()}),e=b.$results.find(".select2-results__option[aria-selected]");e.each(function(){var b=a(this),c=a.data(this,"data"),e=""+c.id;null!=c.element&&c.element.selected||null==c.element&&a.inArray(e,d)>-1?b.attr("aria-selected","true"):b.attr("aria-selected","false")})})},c.prototype.showLoading=function(a){this.hideLoading();var b=this.options.get("translations").get("searching"),c={disabled:!0,loading:!0,text:b(a)},d=this.option(c);d.className+=" loading-results",this.$results.prepend(d)},c.prototype.hideLoading=function(){this.$results.find(".loading-results").remove()},c.prototype.option=function(b){var c=document.createElement("li");c.className="select2-results__option";var d={role:"treeitem","aria-selected":"false"};b.disabled&&(delete d["aria-selected"],d["aria-disabled"]="true"),null==b.id&&delete d["aria-selected"],null!=b._resultId&&(c.id=b._resultId),b.title&&(c.title=b.title),b.children&&(d.role="group",d["aria-label"]=b.text,delete d["aria-selected"]);for(var e in d){var f=d[e];c.setAttribute(e,f)}if(b.children){var g=a(c),h=document.createElement("strong");h.className="select2-results__group";a(h);this.template(b,h);for(var i=[],j=0;j<b.children.length;j++){var k=b.children[j],l=this.option(k);i.push(l)}var m=a("<ul></ul>",{"class":"select2-results__options select2-results__options--nested"});m.append(i),g.append(h),g.append(m)}else this.template(b,c);return a.data(c,"data",b),c},c.prototype.bind=function(b,c){var d=this,e=b.id+"-results";this.$results.attr("id",e),b.on("results:all",function(a){d.clear(),d.append(a.data),b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("results:append",function(a){d.append(a.data),b.isOpen()&&d.setClasses()}),b.on("query",function(a){d.hideMessages(),d.showLoading(a)}),b.on("select",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("unselect",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("open",function(){d.$results.attr("aria-expanded","true"),d.$results.attr("aria-hidden","false"),d.setClasses(),d.ensureHighlightVisible()}),b.on("close",function(){d.$results.attr("aria-expanded","false"),d.$results.attr("aria-hidden","true"),d.$results.removeAttr("aria-activedescendant")}),b.on("results:toggle",function(){var a=d.getHighlightedResults();0!==a.length&&a.trigger("mouseup")}),b.on("results:select",function(){var a=d.getHighlightedResults();if(0!==a.length){var b=a.data("data");"true"==a.attr("aria-selected")?d.trigger("close",{}):d.trigger("select",{data:b})}}),b.on("results:previous",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a);if(0!==c){var e=c-1;0===a.length&&(e=0);var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top,h=f.offset().top,i=d.$results.scrollTop()+(h-g);0===e?d.$results.scrollTop(0):0>h-g&&d.$results.scrollTop(i)}}),b.on("results:next",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a),e=c+1;if(!(e>=b.length)){var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top+d.$results.outerHeight(!1),h=f.offset().top+f.outerHeight(!1),i=d.$results.scrollTop()+h-g;0===e?d.$results.scrollTop(0):h>g&&d.$results.scrollTop(i)}}),b.on("results:focus",function(a){a.element.addClass("select2-results__option--highlighted")}),b.on("results:message",function(a){d.displayMessage(a)}),a.fn.mousewheel&&this.$results.on("mousewheel",function(a){var b=d.$results.scrollTop(),c=d.$results.get(0).scrollHeight-b+a.deltaY,e=a.deltaY>0&&b-a.deltaY<=0,f=a.deltaY<0&&c<=d.$results.height();e?(d.$results.scrollTop(0),a.preventDefault(),a.stopPropagation()):f&&(d.$results.scrollTop(d.$results.get(0).scrollHeight-d.$results.height()),a.preventDefault(),a.stopPropagation())}),this.$results.on("mouseup",".select2-results__option[aria-selected]",function(b){var c=a(this),e=c.data("data");return"true"===c.attr("aria-selected")?void(d.options.get("multiple")?d.trigger("unselect",{originalEvent:b,data:e}):d.trigger("close",{})):void d.trigger("select",{originalEvent:b,data:e})}),this.$results.on("mouseenter",".select2-results__option[aria-selected]",function(b){var c=a(this).data("data");d.getHighlightedResults().removeClass("select2-results__option--highlighted"),d.trigger("results:focus",{data:c,element:a(this)})})},c.prototype.getHighlightedResults=function(){var a=this.$results.find(".select2-results__option--highlighted");return a},c.prototype.destroy=function(){this.$results.remove()},c.prototype.ensureHighlightVisible=function(){var a=this.getHighlightedResults();if(0!==a.length){var b=this.$results.find("[aria-selected]"),c=b.index(a),d=this.$results.offset().top,e=a.offset().top,f=this.$results.scrollTop()+(e-d),g=e-d;f-=2*a.outerHeight(!1),2>=c?this.$results.scrollTop(0):(g>this.$results.outerHeight()||0>g)&&this.$results.scrollTop(f)}},c.prototype.template=function(b,c){var d=this.options.get("templateResult"),e=this.options.get("escapeMarkup"),f=d(b,c);null==f?c.style.display="none":"string"==typeof f?c.innerHTML=e(f):a(c).append(f)},c}),b.define("select2/keys",[],function(){var a={BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,CTRL:17,ALT:18,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46};return a}),b.define("select2/selection/base",["jquery","../utils","../keys"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,b.Observable),d.prototype.render=function(){var b=a('<span class="select2-selection" role="combobox"  aria-haspopup="true" aria-expanded="false"></span>');return this._tabindex=0,null!=this.$element.data("old-tabindex")?this._tabindex=this.$element.data("old-tabindex"):null!=this.$element.attr("tabindex")&&(this._tabindex=this.$element.attr("tabindex")),b.attr("title",this.$element.attr("title")),b.attr("tabindex",this._tabindex),this.$selection=b,b},d.prototype.bind=function(a,b){var d=this,e=(a.id+"-container",a.id+"-results");this.container=a,this.$selection.on("focus",function(a){d.trigger("focus",a)}),this.$selection.on("blur",function(a){d._handleBlur(a)}),this.$selection.on("keydown",function(a){d.trigger("keypress",a),a.which===c.SPACE&&a.preventDefault()}),a.on("results:focus",function(a){d.$selection.attr("aria-activedescendant",a.data._resultId)}),a.on("selection:update",function(a){d.update(a.data)}),a.on("open",function(){d.$selection.attr("aria-expanded","true"),d.$selection.attr("aria-owns",e),d._attachCloseHandler(a)}),a.on("close",function(){d.$selection.attr("aria-expanded","false"),d.$selection.removeAttr("aria-activedescendant"),d.$selection.removeAttr("aria-owns"),d.$selection.focus(),d._detachCloseHandler(a)}),a.on("enable",function(){d.$selection.attr("tabindex",d._tabindex)}),a.on("disable",function(){d.$selection.attr("tabindex","-1")})},d.prototype._handleBlur=function(b){var c=this;window.setTimeout(function(){document.activeElement==c.$selection[0]||a.contains(c.$selection[0],document.activeElement)||c.trigger("blur",b)},1)},d.prototype._attachCloseHandler=function(b){a(document.body).on("mousedown.select2."+b.id,function(b){var c=a(b.target),d=c.closest(".select2"),e=a(".select2.select2-container--open");e.each(function(){var b=a(this);if(this!=d[0]){var c=b.data("element");c.select2("close")}})})},d.prototype._detachCloseHandler=function(b){a(document.body).off("mousedown.select2."+b.id)},d.prototype.position=function(a,b){var c=b.find(".selection");c.append(a)},d.prototype.destroy=function(){this._detachCloseHandler(this.container)},d.prototype.update=function(a){throw new Error("The `update` method must be defined in child classes.")},d}),b.define("select2/selection/single",["jquery","./base","../utils","../keys"],function(a,b,c,d){function e(){e.__super__.constructor.apply(this,arguments)}return c.Extend(e,b),e.prototype.render=function(){var a=e.__super__.render.call(this);return a.addClass("select2-selection--single"),a.html('<span class="select2-selection__rendered"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'),a},e.prototype.bind=function(a,b){var c=this;e.__super__.bind.apply(this,arguments);var d=a.id+"-container";this.$selection.find(".select2-selection__rendered").attr("id",d),this.$selection.attr("aria-labelledby",d),this.$selection.on("mousedown",function(a){1===a.which&&c.trigger("toggle",{originalEvent:a})}),this.$selection.on("focus",function(a){}),this.$selection.on("blur",function(a){}),a.on("focus",function(b){a.isOpen()||c.$selection.focus()}),a.on("selection:update",function(a){c.update(a.data)})},e.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},e.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},e.prototype.selectionContainer=function(){return a("<span></span>")},e.prototype.update=function(a){if(0===a.length)return void this.clear();var b=a[0],c=this.$selection.find(".select2-selection__rendered"),d=this.display(b,c);c.empty().append(d),c.prop("title",b.title||b.text)},e}),b.define("select2/selection/multiple",["jquery","./base","../utils"],function(a,b,c){function d(a,b){d.__super__.constructor.apply(this,arguments)}return c.Extend(d,b),d.prototype.render=function(){var a=d.__super__.render.call(this);return a.addClass("select2-selection--multiple"),a.html('<ul class="select2-selection__rendered"></ul>'),a},d.prototype.bind=function(b,c){var e=this;d.__super__.bind.apply(this,arguments),this.$selection.on("click",function(a){e.trigger("toggle",{originalEvent:a})}),this.$selection.on("click",".select2-selection__choice__remove",function(b){if(!e.options.get("disabled")){var c=a(this),d=c.parent(),f=d.data("data");e.trigger("unselect",{originalEvent:b,data:f})}})},d.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},d.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},d.prototype.selectionContainer=function(){var b=a('<li class="select2-selection__choice"><span class="select2-selection__choice__remove" role="presentation">&times;</span></li>');return b},d.prototype.update=function(a){if(this.clear(),0!==a.length){for(var b=[],d=0;d<a.length;d++){var e=a[d],f=this.selectionContainer(),g=this.display(e,f);f.append(g),f.prop("title",e.title||e.text),f.data("data",e),b.push(f)}var h=this.$selection.find(".select2-selection__rendered");c.appendMany(h,b)}},d}),b.define("select2/selection/placeholder",["../utils"],function(a){function b(a,b,c){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c)}return b.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},b.prototype.createPlaceholder=function(a,b){var c=this.selectionContainer();return c.html(this.display(b)),c.addClass("select2-selection__placeholder").removeClass("select2-selection__choice"),c},b.prototype.update=function(a,b){var c=1==b.length&&b[0].id!=this.placeholder.id,d=b.length>1;if(d||c)return a.call(this,b);this.clear();var e=this.createPlaceholder(this.placeholder);this.$selection.find(".select2-selection__rendered").append(e)},b}),b.define("select2/selection/allowClear",["jquery","../keys"],function(a,b){function c(){}return c.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),null==this.placeholder&&this.options.get("debug")&&window.console&&console.error&&console.error("Select2: The `allowClear` option should be used in combination with the `placeholder` option."),this.$selection.on("mousedown",".select2-selection__clear",function(a){d._handleClear(a)}),b.on("keypress",function(a){d._handleKeyboardClear(a,b)})},c.prototype._handleClear=function(a,b){if(!this.options.get("disabled")){var c=this.$selection.find(".select2-selection__clear");if(0!==c.length){b.stopPropagation();for(var d=c.data("data"),e=0;e<d.length;e++){var f={data:d[e]};if(this.trigger("unselect",f),f.prevented)return}this.$element.val(this.placeholder.id).trigger("change"),this.trigger("toggle",{})}}},c.prototype._handleKeyboardClear=function(a,c,d){d.isOpen()||(c.which==b.DELETE||c.which==b.BACKSPACE)&&this._handleClear(c)},c.prototype.update=function(b,c){if(b.call(this,c),!(this.$selection.find(".select2-selection__placeholder").length>0||0===c.length)){var d=a('<span class="select2-selection__clear">&times;</span>');d.data("data",c),this.$selection.find(".select2-selection__rendered").prepend(d)}},c}),b.define("select2/selection/search",["jquery","../utils","../keys"],function(a,b,c){function d(a,b,c){a.call(this,b,c)}return d.prototype.render=function(b){var c=a('<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" aria-autocomplete="list" /></li>');this.$searchContainer=c,this.$search=c.find("input");var d=b.call(this);return this._transferTabIndex(),d},d.prototype.bind=function(a,b,d){var e=this;a.call(this,b,d),b.on("open",function(){e.$search.trigger("focus")}),b.on("close",function(){e.$search.val(""),e.$search.removeAttr("aria-activedescendant"),e.$search.trigger("focus")}),b.on("enable",function(){e.$search.prop("disabled",!1),e._transferTabIndex()}),b.on("disable",function(){e.$search.prop("disabled",!0)}),b.on("focus",function(a){e.$search.trigger("focus")}),b.on("results:focus",function(a){e.$search.attr("aria-activedescendant",a.id)}),this.$selection.on("focusin",".select2-search--inline",function(a){e.trigger("focus",a)}),this.$selection.on("focusout",".select2-search--inline",function(a){e._handleBlur(a)}),this.$selection.on("keydown",".select2-search--inline",function(a){a.stopPropagation(),e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented();var b=a.which;if(b===c.BACKSPACE&&""===e.$search.val()){var d=e.$searchContainer.prev(".select2-selection__choice");if(d.length>0){var f=d.data("data");e.searchRemoveChoice(f),a.preventDefault()}}});var f=document.documentMode,g=f&&11>=f;this.$selection.on("input.searchcheck",".select2-search--inline",function(a){return g?void e.$selection.off("input.search input.searchcheck"):void e.$selection.off("keyup.search")}),this.$selection.on("keyup.search input.search",".select2-search--inline",function(a){if(g&&"input"===a.type)return void e.$selection.off("input.search input.searchcheck");var b=a.which;b!=c.SHIFT&&b!=c.CTRL&&b!=c.ALT&&b!=c.TAB&&e.handleSearch(a)})},d.prototype._transferTabIndex=function(a){this.$search.attr("tabindex",this.$selection.attr("tabindex")),this.$selection.attr("tabindex","-1")},d.prototype.createPlaceholder=function(a,b){this.$search.attr("placeholder",b.text)},d.prototype.update=function(a,b){var c=this.$search[0]==document.activeElement;this.$search.attr("placeholder",""),a.call(this,b),this.$selection.find(".select2-selection__rendered").append(this.$searchContainer),this.resizeSearch(),c&&this.$search.focus()},d.prototype.handleSearch=function(){if(this.resizeSearch(),!this._keyUpPrevented){var a=this.$search.val();this.trigger("query",{term:a})}this._keyUpPrevented=!1},d.prototype.searchRemoveChoice=function(a,b){this.trigger("unselect",{data:b}),this.$search.val(b.text),this.handleSearch()},d.prototype.resizeSearch=function(){this.$search.css("width","25px");var a="";if(""!==this.$search.attr("placeholder"))a=this.$selection.find(".select2-selection__rendered").innerWidth();else{var b=this.$search.val().length+1;a=.75*b+"em"}this.$search.css("width",a)},d}),b.define("select2/selection/eventRelay",["jquery"],function(a){function b(){}return b.prototype.bind=function(b,c,d){var e=this,f=["open","opening","close","closing","select","selecting","unselect","unselecting"],g=["opening","closing","selecting","unselecting"];b.call(this,c,d),c.on("*",function(b,c){if(-1!==a.inArray(b,f)){c=c||{};var d=a.Event("select2:"+b,{params:c});e.$element.trigger(d),-1!==a.inArray(b,g)&&(c.prevented=d.isDefaultPrevented())}})},b}),b.define("select2/translation",["jquery","require"],function(a,b){function c(a){this.dict=a||{}}return c.prototype.all=function(){return this.dict},c.prototype.get=function(a){return this.dict[a]},c.prototype.extend=function(b){this.dict=a.extend({},b.all(),this.dict)},c._cache={},c.loadPath=function(a){if(!(a in c._cache)){var d=b(a);c._cache[a]=d}return new c(c._cache[a])},c}),b.define("select2/diacritics",[],function(){var a={"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"};return a}),b.define("select2/data/base",["../utils"],function(a){function b(a,c){b.__super__.constructor.call(this)}return a.Extend(b,a.Observable),b.prototype.current=function(a){throw new Error("The `current` method must be defined in child classes.")},b.prototype.query=function(a,b){throw new Error("The `query` method must be defined in child classes.")},b.prototype.bind=function(a,b){},b.prototype.destroy=function(){},b.prototype.generateResultId=function(b,c){var d=b.id+"-result-";return d+=a.generateChars(4),d+=null!=c.id?"-"+c.id.toString():"-"+a.generateChars(4)},b}),b.define("select2/data/select",["./base","../utils","jquery"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,a),d.prototype.current=function(a){var b=[],d=this;this.$element.find(":selected").each(function(){var a=c(this),e=d.item(a);b.push(e)}),a(b)},d.prototype.select=function(a){var b=this;if(a.selected=!0,c(a.element).is("option"))return a.element.selected=!0,void this.$element.trigger("change");
if(this.$element.prop("multiple"))this.current(function(d){var e=[];a=[a],a.push.apply(a,d);for(var f=0;f<a.length;f++){var g=a[f].id;-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")});else{var d=a.id;this.$element.val(d),this.$element.trigger("change")}},d.prototype.unselect=function(a){var b=this;if(this.$element.prop("multiple"))return a.selected=!1,c(a.element).is("option")?(a.element.selected=!1,void this.$element.trigger("change")):void this.current(function(d){for(var e=[],f=0;f<d.length;f++){var g=d[f].id;g!==a.id&&-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")})},d.prototype.bind=function(a,b){var c=this;this.container=a,a.on("select",function(a){c.select(a.data)}),a.on("unselect",function(a){c.unselect(a.data)})},d.prototype.destroy=function(){this.$element.find("*").each(function(){c.removeData(this,"data")})},d.prototype.query=function(a,b){var d=[],e=this,f=this.$element.children();f.each(function(){var b=c(this);if(b.is("option")||b.is("optgroup")){var f=e.item(b),g=e.matches(a,f);null!==g&&d.push(g)}}),b({results:d})},d.prototype.addOptions=function(a){b.appendMany(this.$element,a)},d.prototype.option=function(a){var b;a.children?(b=document.createElement("optgroup"),b.label=a.text):(b=document.createElement("option"),void 0!==b.textContent?b.textContent=a.text:b.innerText=a.text),a.id&&(b.value=a.id),a.disabled&&(b.disabled=!0),a.selected&&(b.selected=!0),a.title&&(b.title=a.title);var d=c(b),e=this._normalizeItem(a);return e.element=b,c.data(b,"data",e),d},d.prototype.item=function(a){var b={};if(b=c.data(a[0],"data"),null!=b)return b;if(a.is("option"))b={id:a.val(),text:a.text(),disabled:a.prop("disabled"),selected:a.prop("selected"),title:a.prop("title")};else if(a.is("optgroup")){b={text:a.prop("label"),children:[],title:a.prop("title")};for(var d=a.children("option"),e=[],f=0;f<d.length;f++){var g=c(d[f]),h=this.item(g);e.push(h)}b.children=e}return b=this._normalizeItem(b),b.element=a[0],c.data(a[0],"data",b),b},d.prototype._normalizeItem=function(a){c.isPlainObject(a)||(a={id:a,text:a}),a=c.extend({},{text:""},a);var b={selected:!1,disabled:!1};return null!=a.id&&(a.id=a.id.toString()),null!=a.text&&(a.text=a.text.toString()),null==a._resultId&&a.id&&null!=this.container&&(a._resultId=this.generateResultId(this.container,a)),c.extend({},b,a)},d.prototype.matches=function(a,b){var c=this.options.get("matcher");return c(a,b)},d}),b.define("select2/data/array",["./select","../utils","jquery"],function(a,b,c){function d(a,b){var c=b.get("data")||[];d.__super__.constructor.call(this,a,b),this.addOptions(this.convertToOptions(c))}return b.Extend(d,a),d.prototype.select=function(a){var b=this.$element.find("option").filter(function(b,c){return c.value==a.id.toString()});0===b.length&&(b=this.option(a),this.addOptions(b)),d.__super__.select.call(this,a)},d.prototype.convertToOptions=function(a){function d(a){return function(){return c(this).val()==a.id}}for(var e=this,f=this.$element.find("option"),g=f.map(function(){return e.item(c(this)).id}).get(),h=[],i=0;i<a.length;i++){var j=this._normalizeItem(a[i]);if(c.inArray(j.id,g)>=0){var k=f.filter(d(j)),l=this.item(k),m=c.extend(!0,{},j,l),n=this.option(m);k.replaceWith(n)}else{var o=this.option(j);if(j.children){var p=this.convertToOptions(j.children);b.appendMany(o,p)}h.push(o)}}return h},d}),b.define("select2/data/ajax",["./array","../utils","jquery"],function(a,b,c){function d(a,b){this.ajaxOptions=this._applyDefaults(b.get("ajax")),null!=this.ajaxOptions.processResults&&(this.processResults=this.ajaxOptions.processResults),d.__super__.constructor.call(this,a,b)}return b.Extend(d,a),d.prototype._applyDefaults=function(a){var b={data:function(a){return c.extend({},a,{q:a.term})},transport:function(a,b,d){var e=c.ajax(a);return e.then(b),e.fail(d),e}};return c.extend({},b,a,!0)},d.prototype.processResults=function(a){return a},d.prototype.query=function(a,b){function d(){var d=f.transport(f,function(d){var f=e.processResults(d,a);e.options.get("debug")&&window.console&&console.error&&(f&&f.results&&c.isArray(f.results)||console.error("Select2: The AJAX results did not return an array in the `results` key of the response.")),b(f)},function(){d.status&&"0"===d.status||e.trigger("results:message",{message:"errorLoading"})});e._request=d}var e=this;null!=this._request&&(c.isFunction(this._request.abort)&&this._request.abort(),this._request=null);var f=c.extend({type:"GET"},this.ajaxOptions);"function"==typeof f.url&&(f.url=f.url.call(this.$element,a)),"function"==typeof f.data&&(f.data=f.data.call(this.$element,a)),this.ajaxOptions.delay&&null!=a.term?(this._queryTimeout&&window.clearTimeout(this._queryTimeout),this._queryTimeout=window.setTimeout(d,this.ajaxOptions.delay)):d()},d}),b.define("select2/data/tags",["jquery"],function(a){function b(b,c,d){var e=d.get("tags"),f=d.get("createTag");void 0!==f&&(this.createTag=f);var g=d.get("insertTag");if(void 0!==g&&(this.insertTag=g),b.call(this,c,d),a.isArray(e))for(var h=0;h<e.length;h++){var i=e[h],j=this._normalizeItem(i),k=this.option(j);this.$element.append(k)}}return b.prototype.query=function(a,b,c){function d(a,f){for(var g=a.results,h=0;h<g.length;h++){var i=g[h],j=null!=i.children&&!d({results:i.children},!0),k=i.text===b.term;if(k||j)return f?!1:(a.data=g,void c(a))}if(f)return!0;var l=e.createTag(b);if(null!=l){var m=e.option(l);m.attr("data-select2-tag",!0),e.addOptions([m]),e.insertTag(g,l)}a.results=g,c(a)}var e=this;return this._removeOldTags(),null==b.term||null!=b.page?void a.call(this,b,c):void a.call(this,b,d)},b.prototype.createTag=function(b,c){var d=a.trim(c.term);return""===d?null:{id:d,text:d}},b.prototype.insertTag=function(a,b,c){b.unshift(c)},b.prototype._removeOldTags=function(b){var c=(this._lastTag,this.$element.find("option[data-select2-tag]"));c.each(function(){this.selected||a(this).remove()})},b}),b.define("select2/data/tokenizer",["jquery"],function(a){function b(a,b,c){var d=c.get("tokenizer");void 0!==d&&(this.tokenizer=d),a.call(this,b,c)}return b.prototype.bind=function(a,b,c){a.call(this,b,c),this.$search=b.dropdown.$search||b.selection.$search||c.find(".select2-search__field")},b.prototype.query=function(b,c,d){function e(b){var c=g._normalizeItem(b),d=g.$element.find("option").filter(function(){return a(this).val()===c.id});if(!d.length){var e=g.option(c);e.attr("data-select2-tag",!0),g._removeOldTags(),g.addOptions([e])}f(c)}function f(a){g.trigger("select",{data:a})}var g=this;c.term=c.term||"";var h=this.tokenizer(c,this.options,e);h.term!==c.term&&(this.$search.length&&(this.$search.val(h.term),this.$search.focus()),c.term=h.term),b.call(this,c,d)},b.prototype.tokenizer=function(b,c,d,e){for(var f=d.get("tokenSeparators")||[],g=c.term,h=0,i=this.createTag||function(a){return{id:a.term,text:a.term}};h<g.length;){var j=g[h];if(-1!==a.inArray(j,f)){var k=g.substr(0,h),l=a.extend({},c,{term:k}),m=i(l);null!=m?(e(m),g=g.substr(h+1)||"",h=0):h++}else h++}return{term:g}},b}),b.define("select2/data/minimumInputLength",[],function(){function a(a,b,c){this.minimumInputLength=c.get("minimumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",b.term.length<this.minimumInputLength?void this.trigger("results:message",{message:"inputTooShort",args:{minimum:this.minimumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumInputLength",[],function(){function a(a,b,c){this.maximumInputLength=c.get("maximumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",this.maximumInputLength>0&&b.term.length>this.maximumInputLength?void this.trigger("results:message",{message:"inputTooLong",args:{maximum:this.maximumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumSelectionLength",[],function(){function a(a,b,c){this.maximumSelectionLength=c.get("maximumSelectionLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){var d=this;this.current(function(e){var f=null!=e?e.length:0;return d.maximumSelectionLength>0&&f>=d.maximumSelectionLength?void d.trigger("results:message",{message:"maximumSelected",args:{maximum:d.maximumSelectionLength}}):void a.call(d,b,c)})},a}),b.define("select2/dropdown",["jquery","./utils"],function(a,b){function c(a,b){this.$element=a,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<span class="select2-dropdown"><span class="select2-results"></span></span>');return b.attr("dir",this.options.get("dir")),this.$dropdown=b,b},c.prototype.bind=function(){},c.prototype.position=function(a,b){},c.prototype.destroy=function(){this.$dropdown.remove()},c}),b.define("select2/dropdown/search",["jquery","../utils"],function(a,b){function c(){}return c.prototype.render=function(b){var c=b.call(this),d=a('<span class="select2-search select2-search--dropdown"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" /></span>');return this.$searchContainer=d,this.$search=d.find("input"),c.prepend(d),c},c.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),this.$search.on("keydown",function(a){e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented()}),this.$search.on("input",function(b){a(this).off("keyup")}),this.$search.on("keyup input",function(a){e.handleSearch(a)}),c.on("open",function(){e.$search.attr("tabindex",0),e.$search.focus(),window.setTimeout(function(){e.$search.focus()},0)}),c.on("close",function(){e.$search.attr("tabindex",-1),e.$search.val("")}),c.on("focus",function(){c.isOpen()&&e.$search.focus()}),c.on("results:all",function(a){if(null==a.query.term||""===a.query.term){var b=e.showSearch(a);b?e.$searchContainer.removeClass("select2-search--hide"):e.$searchContainer.addClass("select2-search--hide")}})},c.prototype.handleSearch=function(a){if(!this._keyUpPrevented){var b=this.$search.val();this.trigger("query",{term:b})}this._keyUpPrevented=!1},c.prototype.showSearch=function(a,b){return!0},c}),b.define("select2/dropdown/hidePlaceholder",[],function(){function a(a,b,c,d){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c,d)}return a.prototype.append=function(a,b){b.results=this.removePlaceholder(b.results),a.call(this,b)},a.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},a.prototype.removePlaceholder=function(a,b){for(var c=b.slice(0),d=b.length-1;d>=0;d--){var e=b[d];this.placeholder.id===e.id&&c.splice(d,1)}return c},a}),b.define("select2/dropdown/infiniteScroll",["jquery"],function(a){function b(a,b,c,d){this.lastParams={},a.call(this,b,c,d),this.$loadingMore=this.createLoadingMore(),this.loading=!1}return b.prototype.append=function(a,b){this.$loadingMore.remove(),this.loading=!1,a.call(this,b),this.showLoadingMore(b)&&this.$results.append(this.$loadingMore)},b.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),c.on("query",function(a){e.lastParams=a,e.loading=!0}),c.on("query:append",function(a){e.lastParams=a,e.loading=!0}),this.$results.on("scroll",function(){var b=a.contains(document.documentElement,e.$loadingMore[0]);if(!e.loading&&b){var c=e.$results.offset().top+e.$results.outerHeight(!1),d=e.$loadingMore.offset().top+e.$loadingMore.outerHeight(!1);c+50>=d&&e.loadMore()}})},b.prototype.loadMore=function(){this.loading=!0;var b=a.extend({},{page:1},this.lastParams);b.page++,this.trigger("query:append",b)},b.prototype.showLoadingMore=function(a,b){return b.pagination&&b.pagination.more},b.prototype.createLoadingMore=function(){var b=a('<li class="select2-results__option select2-results__option--load-more"role="treeitem" aria-disabled="true"></li>'),c=this.options.get("translations").get("loadingMore");return b.html(c(this.lastParams)),b},b}),b.define("select2/dropdown/attachBody",["jquery","../utils"],function(a,b){function c(b,c,d){this.$dropdownParent=d.get("dropdownParent")||a(document.body),b.call(this,c,d)}return c.prototype.bind=function(a,b,c){var d=this,e=!1;a.call(this,b,c),b.on("open",function(){d._showDropdown(),d._attachPositioningHandler(b),e||(e=!0,b.on("results:all",function(){d._positionDropdown(),d._resizeDropdown()}),b.on("results:append",function(){d._positionDropdown(),d._resizeDropdown()}))}),b.on("close",function(){d._hideDropdown(),d._detachPositioningHandler(b)}),this.$dropdownContainer.on("mousedown",function(a){a.stopPropagation()})},c.prototype.destroy=function(a){a.call(this),this.$dropdownContainer.remove()},c.prototype.position=function(a,b,c){b.attr("class",c.attr("class")),b.removeClass("select2"),b.addClass("select2-container--open"),b.css({position:"absolute",top:-999999}),this.$container=c},c.prototype.render=function(b){var c=a("<span></span>"),d=b.call(this);return c.append(d),this.$dropdownContainer=c,c},c.prototype._hideDropdown=function(a){this.$dropdownContainer.detach()},c.prototype._attachPositioningHandler=function(c,d){var e=this,f="scroll.select2."+d.id,g="resize.select2."+d.id,h="orientationchange.select2."+d.id,i=this.$container.parents().filter(b.hasScroll);i.each(function(){a(this).data("select2-scroll-position",{x:a(this).scrollLeft(),y:a(this).scrollTop()})}),i.on(f,function(b){var c=a(this).data("select2-scroll-position");a(this).scrollTop(c.y)}),a(window).on(f+" "+g+" "+h,function(a){e._positionDropdown(),e._resizeDropdown()})},c.prototype._detachPositioningHandler=function(c,d){var e="scroll.select2."+d.id,f="resize.select2."+d.id,g="orientationchange.select2."+d.id,h=this.$container.parents().filter(b.hasScroll);h.off(e),a(window).off(e+" "+f+" "+g)},c.prototype._positionDropdown=function(){var b=a(window),c=this.$dropdown.hasClass("select2-dropdown--above"),d=this.$dropdown.hasClass("select2-dropdown--below"),e=null,f=this.$container.offset();f.bottom=f.top+this.$container.outerHeight(!1);var g={height:this.$container.outerHeight(!1)};g.top=f.top,g.bottom=f.top+g.height;var h={height:this.$dropdown.outerHeight(!1)},i={top:b.scrollTop(),bottom:b.scrollTop()+b.height()},j=i.top<f.top-h.height,k=i.bottom>f.bottom+h.height,l={left:f.left,top:g.bottom},m=this.$dropdownParent;"static"===m.css("position")&&(m=m.offsetParent());var n=m.offset();l.top-=n.top,l.left-=n.left,c||d||(e="below"),k||!j||c?!j&&k&&c&&(e="below"):e="above",("above"==e||c&&"below"!==e)&&(l.top=g.top-n.top-h.height),null!=e&&(this.$dropdown.removeClass("select2-dropdown--below select2-dropdown--above").addClass("select2-dropdown--"+e),this.$container.removeClass("select2-container--below select2-container--above").addClass("select2-container--"+e)),this.$dropdownContainer.css(l)},c.prototype._resizeDropdown=function(){var a={width:this.$container.outerWidth(!1)+"px"};this.options.get("dropdownAutoWidth")&&(a.minWidth=a.width,a.position="relative",a.width="auto"),this.$dropdown.css(a)},c.prototype._showDropdown=function(a){this.$dropdownContainer.appendTo(this.$dropdownParent),this._positionDropdown(),this._resizeDropdown()},c}),b.define("select2/dropdown/minimumResultsForSearch",[],function(){function a(b){for(var c=0,d=0;d<b.length;d++){var e=b[d];e.children?c+=a(e.children):c++}return c}function b(a,b,c,d){this.minimumResultsForSearch=c.get("minimumResultsForSearch"),this.minimumResultsForSearch<0&&(this.minimumResultsForSearch=1/0),a.call(this,b,c,d)}return b.prototype.showSearch=function(b,c){return a(c.data.results)<this.minimumResultsForSearch?!1:b.call(this,c)},b}),b.define("select2/dropdown/selectOnClose",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("close",function(a){d._handleSelectOnClose(a)})},a.prototype._handleSelectOnClose=function(a,b){if(b&&null!=b.originalSelect2Event){var c=b.originalSelect2Event;if("select"===c._type||"unselect"===c._type)return}var d=this.getHighlightedResults();if(!(d.length<1)){var e=d.data("data");null!=e.element&&e.element.selected||null==e.element&&e.selected||this.trigger("select",{data:e})}},a}),b.define("select2/dropdown/closeOnSelect",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("select",function(a){d._selectTriggered(a)}),b.on("unselect",function(a){d._selectTriggered(a)})},a.prototype._selectTriggered=function(a,b){var c=b.originalEvent;c&&c.ctrlKey||this.trigger("close",{originalEvent:c,originalSelect2Event:b})},a}),b.define("select2/i18n/en",[],function(){return{errorLoading:function(){return"The results could not be loaded."},inputTooLong:function(a){var b=a.input.length-a.maximum,c="Please delete "+b+" character";return 1!=b&&(c+="s"),c},inputTooShort:function(a){var b=a.minimum-a.input.length,c="Please enter "+b+" or more characters";return c},loadingMore:function(){return"Loading more results…"},maximumSelected:function(a){var b="You can only select "+a.maximum+" item";return 1!=a.maximum&&(b+="s"),b},noResults:function(){return"No results found"},searching:function(){return"Searching…"}}}),b.define("select2/defaults",["jquery","require","./results","./selection/single","./selection/multiple","./selection/placeholder","./selection/allowClear","./selection/search","./selection/eventRelay","./utils","./translation","./diacritics","./data/select","./data/array","./data/ajax","./data/tags","./data/tokenizer","./data/minimumInputLength","./data/maximumInputLength","./data/maximumSelectionLength","./dropdown","./dropdown/search","./dropdown/hidePlaceholder","./dropdown/infiniteScroll","./dropdown/attachBody","./dropdown/minimumResultsForSearch","./dropdown/selectOnClose","./dropdown/closeOnSelect","./i18n/en"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C){function D(){this.reset()}D.prototype.apply=function(l){if(l=a.extend(!0,{},this.defaults,l),null==l.dataAdapter){if(null!=l.ajax?l.dataAdapter=o:null!=l.data?l.dataAdapter=n:l.dataAdapter=m,l.minimumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,r)),l.maximumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,s)),l.maximumSelectionLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,t)),l.tags&&(l.dataAdapter=j.Decorate(l.dataAdapter,p)),(null!=l.tokenSeparators||null!=l.tokenizer)&&(l.dataAdapter=j.Decorate(l.dataAdapter,q)),null!=l.query){var C=b(l.amdBase+"compat/query");l.dataAdapter=j.Decorate(l.dataAdapter,C)}if(null!=l.initSelection){var D=b(l.amdBase+"compat/initSelection");l.dataAdapter=j.Decorate(l.dataAdapter,D)}}if(null==l.resultsAdapter&&(l.resultsAdapter=c,null!=l.ajax&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,x)),null!=l.placeholder&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,w)),l.selectOnClose&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,A))),null==l.dropdownAdapter){if(l.multiple)l.dropdownAdapter=u;else{var E=j.Decorate(u,v);l.dropdownAdapter=E}if(0!==l.minimumResultsForSearch&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,z)),l.closeOnSelect&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,B)),null!=l.dropdownCssClass||null!=l.dropdownCss||null!=l.adaptDropdownCssClass){var F=b(l.amdBase+"compat/dropdownCss");l.dropdownAdapter=j.Decorate(l.dropdownAdapter,F)}l.dropdownAdapter=j.Decorate(l.dropdownAdapter,y)}if(null==l.selectionAdapter){if(l.multiple?l.selectionAdapter=e:l.selectionAdapter=d,null!=l.placeholder&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,f)),l.allowClear&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,g)),l.multiple&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,h)),null!=l.containerCssClass||null!=l.containerCss||null!=l.adaptContainerCssClass){var G=b(l.amdBase+"compat/containerCss");l.selectionAdapter=j.Decorate(l.selectionAdapter,G)}l.selectionAdapter=j.Decorate(l.selectionAdapter,i)}if("string"==typeof l.language)if(l.language.indexOf("-")>0){var H=l.language.split("-"),I=H[0];l.language=[l.language,I]}else l.language=[l.language];if(a.isArray(l.language)){var J=new k;l.language.push("en");for(var K=l.language,L=0;L<K.length;L++){var M=K[L],N={};try{N=k.loadPath(M)}catch(O){try{M=this.defaults.amdLanguageBase+M,N=k.loadPath(M)}catch(P){l.debug&&window.console&&console.warn&&console.warn('Select2: The language file for "'+M+'" could not be automatically loaded. A fallback will be used instead.');continue}}J.extend(N)}l.translations=J}else{var Q=k.loadPath(this.defaults.amdLanguageBase+"en"),R=new k(l.language);R.extend(Q),l.translations=R}return l},D.prototype.reset=function(){function b(a){function b(a){return l[a]||a}return a.replace(/[^\u0000-\u007E]/g,b)}function c(d,e){if(""===a.trim(d.term))return e;if(e.children&&e.children.length>0){for(var f=a.extend(!0,{},e),g=e.children.length-1;g>=0;g--){var h=e.children[g],i=c(d,h);null==i&&f.children.splice(g,1)}return f.children.length>0?f:c(d,f)}var j=b(e.text).toUpperCase(),k=b(d.term).toUpperCase();return j.indexOf(k)>-1?e:null}this.defaults={amdBase:"./",amdLanguageBase:"./i18n/",closeOnSelect:!0,debug:!1,dropdownAutoWidth:!1,escapeMarkup:j.escapeMarkup,language:C,matcher:c,minimumInputLength:0,maximumInputLength:0,maximumSelectionLength:0,minimumResultsForSearch:0,selectOnClose:!1,sorter:function(a){return a},templateResult:function(a){return a.text},templateSelection:function(a){return a.text},theme:"default",width:"resolve"}},D.prototype.set=function(b,c){var d=a.camelCase(b),e={};e[d]=c;var f=j._convertData(e);a.extend(this.defaults,f)};var E=new D;return E}),b.define("select2/options",["require","jquery","./defaults","./utils"],function(a,b,c,d){function e(b,e){if(this.options=b,null!=e&&this.fromElement(e),this.options=c.apply(this.options),e&&e.is("input")){var f=a(this.get("amdBase")+"compat/inputData");this.options.dataAdapter=d.Decorate(this.options.dataAdapter,f)}}return e.prototype.fromElement=function(a){var c=["select2"];null==this.options.multiple&&(this.options.multiple=a.prop("multiple")),null==this.options.disabled&&(this.options.disabled=a.prop("disabled")),null==this.options.language&&(a.prop("lang")?this.options.language=a.prop("lang").toLowerCase():a.closest("[lang]").prop("lang")&&(this.options.language=a.closest("[lang]").prop("lang"))),null==this.options.dir&&(a.prop("dir")?this.options.dir=a.prop("dir"):a.closest("[dir]").prop("dir")?this.options.dir=a.closest("[dir]").prop("dir"):this.options.dir="ltr"),a.prop("disabled",this.options.disabled),a.prop("multiple",this.options.multiple),a.data("select2Tags")&&(this.options.debug&&window.console&&console.warn&&console.warn('Select2: The `data-select2-tags` attribute has been changed to use the `data-data` and `data-tags="true"` attributes and will be removed in future versions of Select2.'),a.data("data",a.data("select2Tags")),a.data("tags",!0)),a.data("ajaxUrl")&&(this.options.debug&&window.console&&console.warn&&console.warn("Select2: The `data-ajax-url` attribute has been changed to `data-ajax--url` and support for the old attribute will be removed in future versions of Select2."),a.attr("ajax--url",a.data("ajaxUrl")),a.data("ajax--url",a.data("ajaxUrl")));var e={};e=b.fn.jquery&&"1."==b.fn.jquery.substr(0,2)&&a[0].dataset?b.extend(!0,{},a[0].dataset,a.data()):a.data();var f=b.extend(!0,{},e);f=d._convertData(f);for(var g in f)b.inArray(g,c)>-1||(b.isPlainObject(this.options[g])?b.extend(this.options[g],f[g]):this.options[g]=f[g]);return this},e.prototype.get=function(a){return this.options[a]},e.prototype.set=function(a,b){this.options[a]=b},e}),b.define("select2/core",["jquery","./options","./utils","./keys"],function(a,b,c,d){var e=function(a,c){null!=a.data("select2")&&a.data("select2").destroy(),this.$element=a,this.id=this._generateId(a),c=c||{},this.options=new b(c,a),e.__super__.constructor.call(this);var d=a.attr("tabindex")||0;a.data("old-tabindex",d),a.attr("tabindex","-1");var f=this.options.get("dataAdapter");this.dataAdapter=new f(a,this.options);var g=this.render();this._placeContainer(g);var h=this.options.get("selectionAdapter");this.selection=new h(a,this.options),this.$selection=this.selection.render(),this.selection.position(this.$selection,g);var i=this.options.get("dropdownAdapter");this.dropdown=new i(a,this.options),this.$dropdown=this.dropdown.render(),this.dropdown.position(this.$dropdown,g);var j=this.options.get("resultsAdapter");this.results=new j(a,this.options,this.dataAdapter),this.$results=this.results.render(),this.results.position(this.$results,this.$dropdown);var k=this;this._bindAdapters(),this._registerDomEvents(),this._registerDataEvents(),this._registerSelectionEvents(),this._registerDropdownEvents(),this._registerResultsEvents(),this._registerEvents(),this.dataAdapter.current(function(a){k.trigger("selection:update",{data:a})}),a.addClass("select2-hidden-accessible"),a.attr("aria-hidden","true"),this._syncAttributes(),a.data("select2",this)};return c.Extend(e,c.Observable),e.prototype._generateId=function(a){var b="";return b=null!=a.attr("id")?a.attr("id"):null!=a.attr("name")?a.attr("name")+"-"+c.generateChars(2):c.generateChars(4),b=b.replace(/(:|\.|\[|\]|,)/g,""),b="select2-"+b},e.prototype._placeContainer=function(a){a.insertAfter(this.$element);var b=this._resolveWidth(this.$element,this.options.get("width"));null!=b&&a.css("width",b)},e.prototype._resolveWidth=function(a,b){var c=/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;if("resolve"==b){var d=this._resolveWidth(a,"style");return null!=d?d:this._resolveWidth(a,"element")}if("element"==b){var e=a.outerWidth(!1);return 0>=e?"auto":e+"px"}if("style"==b){var f=a.attr("style");if("string"!=typeof f)return null;for(var g=f.split(";"),h=0,i=g.length;i>h;h+=1){var j=g[h].replace(/\s/g,""),k=j.match(c);if(null!==k&&k.length>=1)return k[1]}return null}return b},e.prototype._bindAdapters=function(){this.dataAdapter.bind(this,this.$container),this.selection.bind(this,this.$container),this.dropdown.bind(this,this.$container),this.results.bind(this,this.$container)},e.prototype._registerDomEvents=function(){var b=this;this.$element.on("change.select2",function(){b.dataAdapter.current(function(a){b.trigger("selection:update",{data:a})})}),this.$element.on("focus.select2",function(a){b.trigger("focus",a)}),this._syncA=c.bind(this._syncAttributes,this),this._syncS=c.bind(this._syncSubtree,this),this.$element[0].attachEvent&&this.$element[0].attachEvent("onpropertychange",this._syncA);var d=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver;null!=d?(this._observer=new d(function(c){a.each(c,b._syncA),a.each(c,b._syncS)}),this._observer.observe(this.$element[0],{attributes:!0,childList:!0,subtree:!1})):this.$element[0].addEventListener&&(this.$element[0].addEventListener("DOMAttrModified",b._syncA,!1),this.$element[0].addEventListener("DOMNodeInserted",b._syncS,!1),this.$element[0].addEventListener("DOMNodeRemoved",b._syncS,!1))},e.prototype._registerDataEvents=function(){var a=this;this.dataAdapter.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerSelectionEvents=function(){var b=this,c=["toggle","focus"];this.selection.on("toggle",function(){b.toggleDropdown()}),this.selection.on("focus",function(a){b.focus(a)}),this.selection.on("*",function(d,e){-1===a.inArray(d,c)&&b.trigger(d,e)})},e.prototype._registerDropdownEvents=function(){var a=this;this.dropdown.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerResultsEvents=function(){var a=this;this.results.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerEvents=function(){var a=this;this.on("open",function(){a.$container.addClass("select2-container--open")}),this.on("close",function(){a.$container.removeClass("select2-container--open")}),this.on("enable",function(){a.$container.removeClass("select2-container--disabled")}),this.on("disable",function(){a.$container.addClass("select2-container--disabled")}),this.on("blur",function(){a.$container.removeClass("select2-container--focus")}),this.on("query",function(b){a.isOpen()||a.trigger("open",{}),this.dataAdapter.query(b,function(c){a.trigger("results:all",{data:c,query:b})})}),this.on("query:append",function(b){this.dataAdapter.query(b,function(c){a.trigger("results:append",{data:c,query:b})})}),this.on("keypress",function(b){var c=b.which;a.isOpen()?c===d.ESC||c===d.TAB||c===d.UP&&b.altKey?(a.close(),b.preventDefault()):c===d.ENTER?(a.trigger("results:select",{}),b.preventDefault()):c===d.SPACE&&b.ctrlKey?(a.trigger("results:toggle",{}),b.preventDefault()):c===d.UP?(a.trigger("results:previous",{}),b.preventDefault()):c===d.DOWN&&(a.trigger("results:next",{}),b.preventDefault()):(c===d.ENTER||c===d.SPACE||c===d.DOWN&&b.altKey)&&(a.open(),b.preventDefault())})},e.prototype._syncAttributes=function(){this.options.set("disabled",this.$element.prop("disabled")),this.options.get("disabled")?(this.isOpen()&&this.close(),this.trigger("disable",{})):this.trigger("enable",{})},e.prototype._syncSubtree=function(a,b){var c=!1,d=this;if(!a||!a.target||"OPTION"===a.target.nodeName||"OPTGROUP"===a.target.nodeName){if(b)if(b.addedNodes&&b.addedNodes.length>0)for(var e=0;e<b.addedNodes.length;e++){var f=b.addedNodes[e];f.selected&&(c=!0)}else b.removedNodes&&b.removedNodes.length>0&&(c=!0);else c=!0;c&&this.dataAdapter.current(function(a){d.trigger("selection:update",{data:a})})}},e.prototype.trigger=function(a,b){var c=e.__super__.trigger,d={open:"opening",close:"closing",select:"selecting",unselect:"unselecting"};if(void 0===b&&(b={}),a in d){var f=d[a],g={prevented:!1,name:a,args:b};if(c.call(this,f,g),g.prevented)return void(b.prevented=!0)}c.call(this,a,b)},e.prototype.toggleDropdown=function(){this.options.get("disabled")||(this.isOpen()?this.close():this.open())},e.prototype.open=function(){this.isOpen()||this.trigger("query",{})},e.prototype.close=function(){this.isOpen()&&this.trigger("close",{})},e.prototype.isOpen=function(){return this.$container.hasClass("select2-container--open")},e.prototype.hasFocus=function(){return this.$container.hasClass("select2-container--focus")},e.prototype.focus=function(a){this.hasFocus()||(this.$container.addClass("select2-container--focus"),this.trigger("focus",{}))},e.prototype.enable=function(a){this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("enable")` method has been deprecated and will be removed in later Select2 versions. Use $element.prop("disabled") instead.'),(null==a||0===a.length)&&(a=[!0]);var b=!a[0];this.$element.prop("disabled",b)},e.prototype.data=function(){this.options.get("debug")&&arguments.length>0&&window.console&&console.warn&&console.warn('Select2: Data can no longer be set using `select2("data")`. You should consider setting the value instead using `$element.val()`.');var a=[];return this.dataAdapter.current(function(b){a=b}),a},e.prototype.val=function(b){if(this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("val")` method has been deprecated and will be removed in later Select2 versions. Use $element.val() instead.'),null==b||0===b.length)return this.$element.val();var c=b[0];a.isArray(c)&&(c=a.map(c,function(a){return a.toString()})),this.$element.val(c).trigger("change")},e.prototype.destroy=function(){this.$container.remove(),this.$element[0].detachEvent&&this.$element[0].detachEvent("onpropertychange",this._syncA),null!=this._observer?(this._observer.disconnect(),this._observer=null):this.$element[0].removeEventListener&&(this.$element[0].removeEventListener("DOMAttrModified",this._syncA,!1),this.$element[0].removeEventListener("DOMNodeInserted",this._syncS,!1),this.$element[0].removeEventListener("DOMNodeRemoved",this._syncS,!1)),this._syncA=null,this._syncS=null,this.$element.off(".select2"),this.$element.attr("tabindex",this.$element.data("old-tabindex")),this.$element.removeClass("select2-hidden-accessible"),this.$element.attr("aria-hidden","false"),this.$element.removeData("select2"),this.dataAdapter.destroy(),this.selection.destroy(),this.dropdown.destroy(),this.results.destroy(),this.dataAdapter=null,this.selection=null,this.dropdown=null,this.results=null;
},e.prototype.render=function(){var b=a('<span class="select2 select2-container"><span class="selection"></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>');return b.attr("dir",this.options.get("dir")),this.$container=b,this.$container.addClass("select2-container--"+this.options.get("theme")),b.data("element",this.$element),b},e}),b.define("select2/compat/utils",["jquery"],function(a){function b(b,c,d){var e,f,g=[];e=a.trim(b.attr("class")),e&&(e=""+e,a(e.split(/\s+/)).each(function(){0===this.indexOf("select2-")&&g.push(this)})),e=a.trim(c.attr("class")),e&&(e=""+e,a(e.split(/\s+/)).each(function(){0!==this.indexOf("select2-")&&(f=d(this),null!=f&&g.push(f))})),b.attr("class",g.join(" "))}return{syncCssClasses:b}}),b.define("select2/compat/containerCss",["jquery","./utils"],function(a,b){function c(a){return null}function d(){}return d.prototype.render=function(d){var e=d.call(this),f=this.options.get("containerCssClass")||"";a.isFunction(f)&&(f=f(this.$element));var g=this.options.get("adaptContainerCssClass");if(g=g||c,-1!==f.indexOf(":all:")){f=f.replace(":all:","");var h=g;g=function(a){var b=h(a);return null!=b?b+" "+a:a}}var i=this.options.get("containerCss")||{};return a.isFunction(i)&&(i=i(this.$element)),b.syncCssClasses(e,this.$element,g),e.css(i),e.addClass(f),e},d}),b.define("select2/compat/dropdownCss",["jquery","./utils"],function(a,b){function c(a){return null}function d(){}return d.prototype.render=function(d){var e=d.call(this),f=this.options.get("dropdownCssClass")||"";a.isFunction(f)&&(f=f(this.$element));var g=this.options.get("adaptDropdownCssClass");if(g=g||c,-1!==f.indexOf(":all:")){f=f.replace(":all:","");var h=g;g=function(a){var b=h(a);return null!=b?b+" "+a:a}}var i=this.options.get("dropdownCss")||{};return a.isFunction(i)&&(i=i(this.$element)),b.syncCssClasses(e,this.$element,g),e.css(i),e.addClass(f),e},d}),b.define("select2/compat/initSelection",["jquery"],function(a){function b(a,b,c){c.get("debug")&&window.console&&console.warn&&console.warn("Select2: The `initSelection` option has been deprecated in favor of a custom data adapter that overrides the `current` method. This method is now called multiple times instead of a single time when the instance is initialized. Support will be removed for the `initSelection` option in future versions of Select2"),this.initSelection=c.get("initSelection"),this._isInitialized=!1,a.call(this,b,c)}return b.prototype.current=function(b,c){var d=this;return this._isInitialized?void b.call(this,c):void this.initSelection.call(null,this.$element,function(b){d._isInitialized=!0,a.isArray(b)||(b=[b]),c(b)})},b}),b.define("select2/compat/inputData",["jquery"],function(a){function b(a,b,c){this._currentData=[],this._valueSeparator=c.get("valueSeparator")||",","hidden"===b.prop("type")&&c.get("debug")&&console&&console.warn&&console.warn("Select2: Using a hidden input with Select2 is no longer supported and may stop working in the future. It is recommended to use a `<select>` element instead."),a.call(this,b,c)}return b.prototype.current=function(b,c){function d(b,c){var e=[];return b.selected||-1!==a.inArray(b.id,c)?(b.selected=!0,e.push(b)):b.selected=!1,b.children&&e.push.apply(e,d(b.children,c)),e}for(var e=[],f=0;f<this._currentData.length;f++){var g=this._currentData[f];e.push.apply(e,d(g,this.$element.val().split(this._valueSeparator)))}c(e)},b.prototype.select=function(b,c){if(this.options.get("multiple")){var d=this.$element.val();d+=this._valueSeparator+c.id,this.$element.val(d),this.$element.trigger("change")}else this.current(function(b){a.map(b,function(a){a.selected=!1})}),this.$element.val(c.id),this.$element.trigger("change")},b.prototype.unselect=function(a,b){var c=this;b.selected=!1,this.current(function(a){for(var d=[],e=0;e<a.length;e++){var f=a[e];b.id!=f.id&&d.push(f.id)}c.$element.val(d.join(c._valueSeparator)),c.$element.trigger("change")})},b.prototype.query=function(a,b,c){for(var d=[],e=0;e<this._currentData.length;e++){var f=this._currentData[e],g=this.matches(b,f);null!==g&&d.push(g)}c({results:d})},b.prototype.addOptions=function(b,c){var d=a.map(c,function(b){return a.data(b[0],"data")});this._currentData.push.apply(this._currentData,d)},b}),b.define("select2/compat/matcher",["jquery"],function(a){function b(b){function c(c,d){var e=a.extend(!0,{},d);if(null==c.term||""===a.trim(c.term))return e;if(d.children){for(var f=d.children.length-1;f>=0;f--){var g=d.children[f],h=b(c.term,g.text,g);h||e.children.splice(f,1)}if(e.children.length>0)return e}return b(c.term,d.text,d)?e:null}return c}return b}),b.define("select2/compat/query",[],function(){function a(a,b,c){c.get("debug")&&window.console&&console.warn&&console.warn("Select2: The `query` option has been deprecated in favor of a custom data adapter that overrides the `query` method. Support will be removed for the `query` option in future versions of Select2."),a.call(this,b,c)}return a.prototype.query=function(a,b,c){b.callback=c;var d=this.options.get("query");d.call(null,b)},a}),b.define("select2/dropdown/attachContainer",[],function(){function a(a,b,c){a.call(this,b,c)}return a.prototype.position=function(a,b,c){var d=c.find(".dropdown-wrapper");d.append(b),b.addClass("select2-dropdown--below"),c.addClass("select2-container--below")},a}),b.define("select2/dropdown/stopPropagation",[],function(){function a(){}return a.prototype.bind=function(a,b,c){a.call(this,b,c);var d=["blur","change","click","dblclick","focus","focusin","focusout","input","keydown","keyup","keypress","mousedown","mouseenter","mouseleave","mousemove","mouseover","mouseup","search","touchend","touchstart"];this.$dropdown.on(d.join(" "),function(a){a.stopPropagation()})},a}),b.define("select2/selection/stopPropagation",[],function(){function a(){}return a.prototype.bind=function(a,b,c){a.call(this,b,c);var d=["blur","change","click","dblclick","focus","focusin","focusout","input","keydown","keyup","keypress","mousedown","mouseenter","mouseleave","mousemove","mouseover","mouseup","search","touchend","touchstart"];this.$selection.on(d.join(" "),function(a){a.stopPropagation()})},a}),function(c){"function"==typeof b.define&&b.define.amd?b.define("jquery-mousewheel",["jquery"],c):"object"==typeof exports?module.exports=c:c(a)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})}),b.define("jquery.select2",["jquery","jquery-mousewheel","./select2/core","./select2/defaults"],function(a,b,c,d){if(null==a.fn.select2){var e=["open","close","destroy"];a.fn.select2=function(b){if(b=b||{},"object"==typeof b)return this.each(function(){var d=a.extend(!0,{},b);new c(a(this),d)}),this;if("string"==typeof b){var d,f=Array.prototype.slice.call(arguments,1);return this.each(function(){var c=a(this).data("select2");null==c&&window.console&&console.error&&console.error("The select2('"+b+"') method was called on an element that is not using Select2."),d=c[b].apply(c,f)}),a.inArray(b,e)>-1?this:d}throw new Error("Invalid arguments for Select2: "+b)}}return null==a.fn.select2.defaults&&(a.fn.select2.defaults=d),c}),{define:b.define,require:b.require}}(),c=b.require("jquery.select2");return a.fn.select2.amd=b,c});
var App=function(){var t,e=!1,o=!1,a=!1,i=!1,n=[],l="../assets/",s="global/img/",r="global/plugins/",c="global/css/",d={blue:"#89C4F4",red:"#F3565D",green:"#1bbc9b",purple:"#9b59b6",grey:"#95a5a6",yellow:"#F8CB00"},p=function(){"rtl"===$("body").css("direction")&&(e=!0),o=!!navigator.userAgent.match(/MSIE 8.0/),a=!!navigator.userAgent.match(/MSIE 9.0/),i=!!navigator.userAgent.match(/MSIE 10.0/),i&&$("html").addClass("ie10"),(i||a||o)&&$("html").addClass("ie")},h=function(){for(var t=0;t<n.length;t++){var e=n[t];e.call()}},u=function(){var t,e=$(window).width();if(o){var a;$(window).resize(function(){a!=document.documentElement.clientHeight&&(t&&clearTimeout(t),t=setTimeout(function(){h()},50),a=document.documentElement.clientHeight)})}else $(window).resize(function(){$(window).width()!=e&&(e=$(window).width(),t&&clearTimeout(t),t=setTimeout(function(){h()},50))})},f=function(){$("body").on("click",".portlet > .portlet-title > .tools > a.remove",function(t){t.preventDefault();var e=$(this).closest(".portlet");$("body").hasClass("page-portlet-fullscreen")&&$("body").removeClass("page-portlet-fullscreen"),e.find(".portlet-title .fullscreen").tooltip("destroy"),e.find(".portlet-title > .tools > .reload").tooltip("destroy"),e.find(".portlet-title > .tools > .remove").tooltip("destroy"),e.find(".portlet-title > .tools > .config").tooltip("destroy"),e.find(".portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand").tooltip("destroy"),e.remove()}),$("body").on("click",".portlet > .portlet-title .fullscreen",function(t){t.preventDefault();var e=$(this).closest(".portlet");if(e.hasClass("portlet-fullscreen"))$(this).removeClass("on"),e.removeClass("portlet-fullscreen"),$("body").removeClass("page-portlet-fullscreen"),e.children(".portlet-body").css("height","auto");else{var o=App.getViewPort().height-e.children(".portlet-title").outerHeight()-parseInt(e.children(".portlet-body").css("padding-top"))-parseInt(e.children(".portlet-body").css("padding-bottom"));$(this).addClass("on"),e.addClass("portlet-fullscreen"),$("body").addClass("page-portlet-fullscreen"),e.children(".portlet-body").css("height",o)}}),$("body").on("click",".portlet > .portlet-title > .tools > a.reload",function(t){t.preventDefault();var e=$(this).closest(".portlet").children(".portlet-body"),o=$(this).attr("data-url"),a=$(this).attr("data-error-display");o?(App.blockUI({target:e,animate:!0,overlayColor:"none"}),$.ajax({type:"GET",cache:!1,url:o,dataType:"html",success:function(t){App.unblockUI(e),e.html(t),App.initAjax()},error:function(t,o,i){App.unblockUI(e);var n="Error on reloading the content. Please check your connection and try again.";"toastr"==a&&toastr?toastr.error(n):"notific8"==a&&$.notific8?($.notific8("zindex",11500),$.notific8(n,{theme:"ruby",life:3e3})):alert(n)}})):(App.blockUI({target:e,animate:!0,overlayColor:"none"}),window.setTimeout(function(){App.unblockUI(e)},1e3))}),$('.portlet .portlet-title a.reload[data-load="true"]').click(),$("body").on("click",".portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools > .expand",function(t){t.preventDefault();var e=$(this).closest(".portlet").children(".portlet-body");$(this).hasClass("collapse")?($(this).removeClass("collapse").addClass("expand"),e.slideUp(200)):($(this).removeClass("expand").addClass("collapse"),e.slideDown(200))})},b=function(){if($("body").on("click",".md-checkbox > label, .md-radio > label",function(){var t=$(this),e=$(this).children("span:first-child");e.addClass("inc");var o=e.clone(!0);e.before(o),$("."+e.attr("class")+":last",t).remove()}),$("body").hasClass("page-md")){var t,e,o,a,i;$("body").on("click","a.btn, button.btn, input.btn, label.btn",function(n){t=$(this),0==t.find(".md-click-circle").length&&t.prepend("<span class='md-click-circle'></span>"),e=t.find(".md-click-circle"),e.removeClass("md-click-animate"),e.height()||e.width()||(o=Math.max(t.outerWidth(),t.outerHeight()),e.css({height:o,width:o})),a=n.pageX-t.offset().left-e.width()/2,i=n.pageY-t.offset().top-e.height()/2,e.css({top:i+"px",left:a+"px"}).addClass("md-click-animate"),setTimeout(function(){e.remove()},1e3)})}var n=function(t){""!=t.val()?t.addClass("edited"):t.removeClass("edited")};$("body").on("keydown",".form-md-floating-label .form-control",function(t){n($(this))}),$("body").on("blur",".form-md-floating-label .form-control",function(t){n($(this))}),$(".form-md-floating-label .form-control").each(function(){$(this).val().length>0&&$(this).addClass("edited")})},g=function(){$().iCheck&&$(".icheck").each(function(){var t=$(this).attr("data-checkbox")?$(this).attr("data-checkbox"):"icheckbox_minimal-grey",e=$(this).attr("data-radio")?$(this).attr("data-radio"):"iradio_minimal-grey";t.indexOf("_line")>-1||e.indexOf("_line")>-1?$(this).iCheck({checkboxClass:t,radioClass:e,insert:'<div class="icheck_line-icon"></div>'+$(this).attr("data-label")}):$(this).iCheck({checkboxClass:t,radioClass:e})})},m=function(){$().bootstrapSwitch&&$(".make-switch").bootstrapSwitch()},v=function(){$().confirmation&&$("[data-toggle=confirmation]").confirmation({btnOkClass:"btn btn-sm btn-success",btnCancelClass:"btn btn-sm btn-danger"})},y=function(){$("body").on("shown.bs.collapse",".accordion.scrollable",function(t){App.scrollTo($(t.target))})},C=function(){if(encodeURI(location.hash)){var t=encodeURI(location.hash.substr(1));$('a[href="#'+t+'"]').parents(".tab-pane:hidden").each(function(){var t=$(this).attr("id");$('a[href="#'+t+'"]').click()}),$('a[href="#'+t+'"]').click()}$().tabdrop&&$(".tabbable-tabdrop .nav-pills, .tabbable-tabdrop .nav-tabs").tabdrop({text:'<i class="fa fa-ellipsis-v"></i>&nbsp;<i class="fa fa-angle-down"></i>'})},w=function(){$("body").on("hide.bs.modal",function(){$(".modal:visible").size()>1&&$("html").hasClass("modal-open")===!1?$("html").addClass("modal-open"):$(".modal:visible").size()<=1&&$("html").removeClass("modal-open")}),$("body").on("show.bs.modal",".modal",function(){$(this).hasClass("modal-scroll")&&$("body").addClass("modal-open-noscroll")}),$("body").on("hidden.bs.modal",".modal",function(){$("body").removeClass("modal-open-noscroll")}),$("body").on("hidden.bs.modal",".modal:not(.modal-cached)",function(){$(this).removeData("bs.modal")})},x=function(){$(".tooltips").tooltip(),$(".portlet > .portlet-title .fullscreen").tooltip({trigger:"hover",container:"body",title:"Fullscreen"}),$(".portlet > .portlet-title > .tools > .reload").tooltip({trigger:"hover",container:"body",title:"Reload"}),$(".portlet > .portlet-title > .tools > .remove").tooltip({trigger:"hover",container:"body",title:"Remove"}),$(".portlet > .portlet-title > .tools > .config").tooltip({trigger:"hover",container:"body",title:"Settings"}),$(".portlet > .portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand").tooltip({trigger:"hover",container:"body",title:"Collapse/Expand"})},k=function(){$("body").on("click",".dropdown-menu.hold-on-click",function(t){t.stopPropagation()})},I=function(){$("body").on("click",'[data-close="alert"]',function(t){$(this).parent(".alert").hide(),$(this).closest(".note").hide(),t.preventDefault()}),$("body").on("click",'[data-close="note"]',function(t){$(this).closest(".note").hide(),t.preventDefault()}),$("body").on("click",'[data-remove="note"]',function(t){$(this).closest(".note").remove(),t.preventDefault()})},A=function(){"function"==typeof autosize&&autosize(document.querySelectorAll("textarea.autosizeme"))},S=function(){$(".popovers").popover(),$(document).on("click.bs.popover.data-api",function(e){t&&t.popover("hide")})},z=function(){App.initSlimScroll(".scroller")},P=function(){jQuery.fancybox&&$(".fancybox-button").size()>0&&$(".fancybox-button").fancybox({groupAttr:"data-rel",prevEffect:"none",nextEffect:"none",closeBtn:!0,helpers:{title:{type:"inside"}}})},T=function(){$().counterUp&&$("[data-counter='counterup']").counterUp({delay:10,time:1e3})},D=function(){(o||a)&&$("input[placeholder]:not(.placeholder-no-fix), textarea[placeholder]:not(.placeholder-no-fix)").each(function(){var t=$(this);""===t.val()&&""!==t.attr("placeholder")&&t.addClass("placeholder").val(t.attr("placeholder")),t.focus(function(){t.val()==t.attr("placeholder")&&t.val("")}),t.blur(function(){""!==t.val()&&t.val()!=t.attr("placeholder")||t.val(t.attr("placeholder"))})})},U=function(){$().select2&&($.fn.select2.defaults.set("theme","bootstrap"),$(".select2me").select2({placeholder:"Select",width:"auto",allowClear:!0}))},E=function(){$("[data-auto-height]").each(function(){var t=$(this),e=$("[data-height]",t),o=0,a=t.attr("data-mode"),i=parseInt(t.attr("data-offset")?t.attr("data-offset"):0);e.each(function(){"height"==$(this).attr("data-height")?$(this).css("height",""):$(this).css("min-height","");var t="base-height"==a?$(this).outerHeight():$(this).outerHeight(!0);t>o&&(o=t)}),o+=i,e.each(function(){"height"==$(this).attr("data-height")?$(this).css("height",o):$(this).css("min-height",o)}),t.attr("data-related")&&$(t.attr("data-related")).css("height",t.height())})};return{init:function(){p(),u(),b(),g(),m(),z(),P(),U(),f(),I(),k(),C(),x(),S(),y(),w(),v(),A(),T(),this.addResizeHandler(E),D()},initAjax:function(){g(),m(),z(),U(),P(),k(),x(),S(),y(),v()},initComponents:function(){this.initAjax()},setLastPopedPopover:function(e){t=e},addResizeHandler:function(t){n.push(t)},runResizeHandlers:function(){h()},scrollTo:function(t,e){var o=t&&t.size()>0?t.offset().top:0;t&&($("body").hasClass("page-header-fixed")?o-=$(".page-header").height():$("body").hasClass("page-header-top-fixed")?o-=$(".page-header-top").height():$("body").hasClass("page-header-menu-fixed")&&(o-=$(".page-header-menu").height()),o+=e?e:-1*t.height()),$("html,body").animate({scrollTop:o},"slow")},initSlimScroll:function(t){$().slimScroll&&$(t).each(function(){if(!$(this).attr("data-initialized")){var t;t=$(this).attr("data-height")?$(this).attr("data-height"):$(this).css("height"),$(this).slimScroll({allowPageScroll:!0,size:"7px",color:$(this).attr("data-handle-color")?$(this).attr("data-handle-color"):"#bbb",wrapperClass:$(this).attr("data-wrapper-class")?$(this).attr("data-wrapper-class"):"slimScrollDiv",railColor:$(this).attr("data-rail-color")?$(this).attr("data-rail-color"):"#eaeaea",position:e?"left":"right",height:t,alwaysVisible:"1"==$(this).attr("data-always-visible"),railVisible:"1"==$(this).attr("data-rail-visible"),disableFadeOut:!0}),$(this).attr("data-initialized","1")}})},destroySlimScroll:function(t){$().slimScroll&&$(t).each(function(){if("1"===$(this).attr("data-initialized")){$(this).removeAttr("data-initialized"),$(this).removeAttr("style");var t={};$(this).attr("data-handle-color")&&(t["data-handle-color"]=$(this).attr("data-handle-color")),$(this).attr("data-wrapper-class")&&(t["data-wrapper-class"]=$(this).attr("data-wrapper-class")),$(this).attr("data-rail-color")&&(t["data-rail-color"]=$(this).attr("data-rail-color")),$(this).attr("data-always-visible")&&(t["data-always-visible"]=$(this).attr("data-always-visible")),$(this).attr("data-rail-visible")&&(t["data-rail-visible"]=$(this).attr("data-rail-visible")),$(this).slimScroll({wrapperClass:$(this).attr("data-wrapper-class")?$(this).attr("data-wrapper-class"):"slimScrollDiv",destroy:!0});var e=$(this);$.each(t,function(t,o){e.attr(t,o)})}})},scrollTop:function(){App.scrollTo()},blockUI:function(t){t=$.extend(!0,{},t);var e="";if(e=t.animate?'<div class="loading-message '+(t.boxed?"loading-message-boxed":"")+'"><div class="block-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>':t.iconOnly?'<div class="loading-message '+(t.boxed?"loading-message-boxed":"")+'"><img src="'+this.getGlobalImgPath()+'loading-spinner-grey.gif" align=""></div>':t.textOnly?'<div class="loading-message '+(t.boxed?"loading-message-boxed":"")+'"><span>&nbsp;&nbsp;'+(t.message?t.message:"LOADING...")+"</span></div>":'<div class="loading-message '+(t.boxed?"loading-message-boxed":"")+'"><img src="'+this.getGlobalImgPath()+'loading-spinner-grey.gif" align=""><span>&nbsp;&nbsp;'+(t.message?t.message:"LOADING...")+"</span></div>",t.target){var o=$(t.target);o.height()<=$(window).height()&&(t.cenrerY=!0),o.block({message:e,baseZ:t.zIndex?t.zIndex:1e3,centerY:void 0!==t.cenrerY&&t.cenrerY,css:{top:"10%",border:"0",padding:"0",backgroundColor:"none"},overlayCSS:{backgroundColor:t.overlayColor?t.overlayColor:"#555",opacity:t.boxed?.05:.1,cursor:"wait"}})}else $.blockUI({message:e,baseZ:t.zIndex?t.zIndex:1e3,css:{border:"0",padding:"0",backgroundColor:"none"},overlayCSS:{backgroundColor:t.overlayColor?t.overlayColor:"#555",opacity:t.boxed?.05:.1,cursor:"wait"}})},unblockUI:function(t){t?$(t).unblock({onUnblock:function(){$(t).css("position",""),$(t).css("zoom","")}}):$.unblockUI()},startPageLoading:function(t){t&&t.animate?($(".page-spinner-bar").remove(),$("body").append('<div class="page-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>')):($(".page-loading").remove(),$("body").append('<div class="page-loading"><img src="'+this.getGlobalImgPath()+'loading-spinner-grey.gif"/>&nbsp;&nbsp;<span>'+(t&&t.message?t.message:"Loading...")+"</span></div>"))},stopPageLoading:function(){$(".page-loading, .page-spinner-bar").remove()},alert:function(t){t=$.extend(!0,{container:"",place:"append",type:"success",message:"",close:!0,reset:!0,focus:!0,closeInSeconds:0,icon:""},t);var e=App.getUniqueID("App_alert"),o='<div id="'+e+'" class="custom-alerts alert alert-'+t.type+' fade in">'+(t.close?'<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>':"")+(""!==t.icon?'<i class="fa-lg fa fa-'+t.icon+'"></i>  ':"")+t.message+"</div>";return t.reset&&$(".custom-alerts").remove(),t.container?"append"==t.place?$(t.container).append(o):$(t.container).prepend(o):1===$(".page-fixed-main-content").size()?$(".page-fixed-main-content").prepend(o):($("body").hasClass("page-container-bg-solid")||$("body").hasClass("page-content-white"))&&0===$(".page-head").size()?$(".page-title").after(o):$(".page-bar").size()>0?$(".page-bar").after(o):$(".page-breadcrumb, .breadcrumbs").after(o),t.focus&&App.scrollTo($("#"+e)),t.closeInSeconds>0&&setTimeout(function(){$("#"+e).remove()},1e3*t.closeInSeconds),e},initFancybox:function(){P()},getActualVal:function(t){return t=$(t),t.val()===t.attr("placeholder")?"":t.val()},getURLParameter:function(t){var e,o,a=window.location.search.substring(1),i=a.split("&");for(e=0;e<i.length;e++)if(o=i[e].split("="),o[0]==t)return unescape(o[1]);return null},isTouchDevice:function(){try{return document.createEvent("TouchEvent"),!0}catch(t){return!1}},getViewPort:function(){var t=window,e="inner";return"innerWidth"in window||(e="client",t=document.documentElement||document.body),{width:t[e+"Width"],height:t[e+"Height"]}},getUniqueID:function(t){return"prefix_"+Math.floor(Math.random()*(new Date).getTime())},isIE8:function(){return o},isIE9:function(){return a},isRTL:function(){return e},isAngularJsApp:function(){return"undefined"!=typeof angular},getAssetsPath:function(){return l},setAssetsPath:function(t){l=t},setGlobalImgPath:function(t){s=t},getGlobalImgPath:function(){return l+s},setGlobalPluginsPath:function(t){r=t},getGlobalPluginsPath:function(){return l+r},getGlobalCssPath:function(){return l+c},getBrandColor:function(t){return d[t]?d[t]:""},getResponsiveBreakpoint:function(t){var e={xs:480,sm:768,md:992,lg:1200};return e[t]?e[t]:0}}}();jQuery(document).ready(function(){App.init()});
'use strict';

/**
 * @ngdoc overview
 * @name vcancyApp
 * @description
 * # vcancyApp
 *
 * Main module of the application.
 */
var vcancyApp = angular
	.module('vcancyApp', [
		//'ngRoute'
		'ngResource',
		'ui.router',
		'ui.bootstrap',
		'angular-loading-bar',
		'oc.lazyLoad',
		'nouislider',
		'ngTable',
		// 'ngTableDemos',
		'firebase',
		'ng-clipboard',
		'angularMoment',
		'gm',
		'AngularPrint',
		'ngFileUpload',
		'ui.jq',
		'ui.bootstrap',
		'socialLogin',
		'angularjs-dropdown-multiselect',
		'ngSanitize',
		'ui.calendar'
	]);

vcancyApp.constant('_', window._);

vcancyApp.constant('config', {
	"sailsBaseUrl": 'https://www.vcancy.com/nodeapi/api/v1/',
});

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
vcancyApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
	$ocLazyLoadProvider.config({
		// global configs go here
	});
}]);

vcancyApp.config(function (socialProvider) {
	//socialProvider.setGoogleKey("YOUR GOOGLE CLIENT ID");
	socialProvider.setLinkedInKey("78blzjlmkk6jbl");
	//socialProvider.setFbKey({appId: "YOUR FACEBOOK APP ID", apiVersion: "API VERSION"});
});

vcancyApp.service('emailSendingService', function ($http, config) {
	this.sendEmailViaNodeMailer = function (to, subject, mode, emailData) {
		// var url = 'https://vcancy.com/login/#/applyproperty/'
		// if (window.location.host.startsWith('localhost')) {
		// 	url = 'http://localhost:9000/#/applyproperty/'
		// }
		var host = window.location.origin;
		var url = '';
		if (host.indexOf('localhost') > -1) {
			url = 'http://localhost:1337/email/sendemail';
		} else {
			url = host + '/nodeapi/api/v1/email/sendemail';
		}
		console.log('URL', url);
		var req = {
			method: 'POST',
			// url: 'http://localhost:1337/email/sendemail',
			// url: config.sailsBaseUrl + 'email/sendemail',
			url: url,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				"Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
			},
			data: {
				to: to,
				subject: subject,
				mode: mode,
				emailData: emailData
			}
		}

		$http(req).then(function successCallback(response) {
			console.log("Done");
		}, function errorCallback(response) {
			console.log("Fail");
		});
	}
});

vcancyApp
	.service('slotsBuildService', function () {
		this.maketimeslots = function (date, ftime, totime, limit, multiple) {

			var slots = [];

			angular.forEach(date, function (value, key) {
				var fromtime = new Date(ftime[key]);
				var to = new Date(totime[key]);

				var minutestimediff = (to - fromtime) / 60000;
				var subslots = Math.floor(Math.ceil(minutestimediff) / 30);

				var temp = 0;
				for (var i = 0; i < subslots; i++) {
					if (temp == 0) {
						temp = fromtime;
					}
					var f = temp;
					var t = new Date(f.getTime() + (30 * 60 * 1000)); // 30 minutes add to from time 
					var temp = t;
					slots.push({ date: value, fromtime: f, to: t, person: limit[key], multiple: multiple[key], dateslotindex: key });

					// temp = new Date(t.getTime() + (1 * 60 * 1000)); // 1 minute add to TO time
				}
			});

			// console.log(slots);
			return slots;
		}
	});


vcancyApp
	.directive('loginHeader', function () {
		return {
			controller: 'headerCtrl',
			controllerAs: 'hctrl',
			templateUrl: 'views/template/header-top.html',
		};
	});

vcancyApp
	.directive('loginSidebar', function () {
		return {
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/template/sidebar-left.html',
		};
	});

vcancyApp
	.directive('autoSize', function () {
		return {
			restrict: 'A',
			link: function (scope, element) {
				if (element[0]) {
					autosize(element);
				}
			}
		}
	})

vcancyApp.directive('integer', function () {
	return {
		require: 'ngModel',
		link: function (scope, ele, attr, ctrl) {
			ctrl.$parsers.unshift(function (viewValue) {
				return parseInt(viewValue, 10);
			});
		}
	};
});
vcancyApp.directive("disableLink", function () {
	return {
		restrict: "A",
		link: function (scope, elem, attrs) {
			$(elem).click(function () {
				$().JqueryFunction();
			});
		}
	}
});
vcancyApp.directive("disableLink1", function () {
	return {
		restrict: "A",
		link: function (scope, elem, attrs) {
			$(elem).click(function () {
				var test = $(this).find("input").attr('id');
				$().JqueryFunction1(scope, elem, test);
			});
		}
	}
});
vcancyApp.directive("disableLink12", function () {
	return {
		restrict: "A",
		link: function (scope, elem, attrs) {
			$(elem).click(function () {
				var test = $(this).find("input").attr('id');
				$().JqueryFunction12(scope, elem, test);
			});
		}
	}
});
vcancyApp.directive("disableLink123", function () {
	return {
		restrict: "A",
		link: function (scope, elem, attrs) {
			$(elem).click(function () {
				$().JqueryFunction123();
			});
		}
	}
});

vcancyApp.directive("disableLink21", function () {
	return {
		restrict: "A",
		link: function (scope, elem, attrs) {
			$(elem).click(function () {
				var test = $(this).find("input").attr('id');
				$().JqueryFunctionprop(scope, elem, test);
			});
		}
	}
});


$(document).ready(function () {
	(function ($) {
		$.fn.JqueryFunction = function () {
			//alert("Come Here");
			$("#datepicker-13").datepicker({ format: 'dd-MM-yyyy', autoclose: true });
			$("#datepicker-13").datepicker("show");

		};
	})(jQuery);

});
$(document).ready(function () {
	(function ($) {
		$.fn.JqueryFunction1 = function (scope, elem, test) {

			//event.preventDefault();
			$("#" + test).datepicker({ format: 'dd-MM-yyyy', autoclose: true });
			$("#" + test).datepicker("show");

		};
	})(jQuery);

});
$(document).ready(function () {
	(function ($) {
		$.fn.JqueryFunction12 = function (scope, elem, test) {
			$("#" + test).datepicker({ format: 'dd-MM-yyyy', autoclose: true });
			$("#" + test).datepicker("show");

		};
	})(jQuery);

});
$(document).ready(function () {
	(function ($) {
		$.fn.JqueryFunction123 = function () {

			$("#datepicker123-13").datepicker({ format: 'dd-MM-yyyy', autoclose: true });
			$("#datepicker123-13").datepicker("show");

		};
	})(jQuery);

});
$(document).ready(function () {
	(function ($) {
		$.fn.JqueryFunctionprop = function (scope, elem, test) {

			$("#" + test).datepicker({ format: 'dd-MM-yyyy', autoclose: true });
			$("#" + test).datepicker("show");

		};
	})(jQuery);

});



vcancyApp
	.directive('fullCalendar', function () {
		return {
			restrict: 'A',
			scope: {
				calendardata: '=' //Two-way data binding
			},
			link: function (scope, element) {
				console.log(scope.calendardata);
				element.fullCalendar({
					contentHeight: 'auto',
					theme: true,
					header: {
						right: '',
						center: 'prev, title, next',
						left: ''
					},
					defaultDate: new Date(),
					editable: true,

					events: scope.calendardata
				});
			}
		}
	})


vcancyApp
	.config(function ($stateProvider, $urlRouterProvider) {
		// Initialize Firebase
		var config = {
			apiKey: "AIzaSyCR720Fl1Q6UIuvyy_0U980Z8y1mLschsI",
			authDomain: "vcancy-5e3b4.firebaseapp.com",
			databaseURL: "https://vcancy-5e3b4.firebaseio.com",
			projectId: "vcancy-5e3b4",
			storageBucket: "vcancy-5e3b4.appspot.com",
			messagingSenderId: "330892868858"
		};
		var app = firebase.initializeApp(config);

		// var sailsBaseUrl = 'http://www.vcancy.com/api/v1/';

		$urlRouterProvider.otherwise("/");
		$stateProvider
			// Public Routes
			/*.state ('login', {
				 url: '/',
				 controller: 'loginCtrl',
				 controllerAs: 'lctrl',
				 templateUrl: 'views/login.html',	
			 }) */
			.state('login', {
				url: '/',
				controller: 'loginCtrl',
				controllerAs: 'lctrl',
				templateUrl: 'views/login.html',
				resolve: {
					deps: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'vcancyApp',
							insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
							files: [
								'../assets/pages/css/login-2.min.css',
								'../styles/cmsdev.css',
								'../assets/pages/scripts/login.min.js',
							]
						});
					}]
				}
			})
			.state('register', {
				url: '/register',
				controller: 'loginCtrl',
				controllerAs: 'lctrl',
				templateUrl: 'views/register.html',
				resolve: {
					deps: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'vcancyApp',
							insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
							files: [
								'../assets/pages/css/login-5.min.css',
								'../assets/global/plugins/backstretch/jquery.backstretch.min.js',
								'../assets/pages/scripts/login-5.min.js',
							]
						});
					}]
				}
			})

			.state('termsofuse', {
				url: '/termsofuse',
				templateUrl: 'views/termspublic.html',
			})

			.state('viewexternalapplication', {
				url: '/viewexternalapp/{appID}',
				controller: 'viewappCtrl',
				controllerAs: 'vappctrl',
				templateUrl: 'views/view_rental_app_form.html',
			})

			// Landlord Routes
			/*.state ('landlorddashboard', {
				url: '/landlorddboard',
				controller: 'landlorddboardlCtrl',
				controllerAs: 'ldboardctrl',
				templateUrl: 'views/landlord.html',
				resolve: { authenticate: authenticate }
			})  */
			.state('landlorddashboard', {
				url: '/landlorddboard',
				controller: 'landlorddboardlCtrl',
				controllerAs: 'ldboardctrl',
				templateUrl: 'views/landlord.html',
				resolve: {
					authenticate: authenticate,
					deps: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'vcancyApp',
							files: [
								'../assets/layouts/layout2/css/layout.min.css',
								'../assets/layouts/layout2/css/themes/blue.min.css',
								'../assets/layouts/layout2/css/custom.min.css',
								'../assets/global/plugins/moment.min.js',
								'../assets/global/plugins/fullcalendar/fullcalendar.min.js',
								'../assets/pages/scripts/dashboard.min.js',
							]
						});
					}]
				}
			})
			/*.state('landordprofile', {
				url: '/landordprofile',
				controller: 'landlordProfilelCtrl',
				controllerAs: 'ldProfilectrl',
				templateUrl: 'views/landloardProfile.html',
				resolve: { authenticate: authenticate }
			})*/
			.state('landordprofile', {
				url: '/landordprofile',
				controller: 'landlordProfilelCtrl',
				controllerAs: 'ldProfilectrl',
				templateUrl: 'views/landloardProfile.html',
				resolve: {
					authenticate: authenticate,
					deps: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'vcancyApp',
							files: [
								'../assets/pages/css/profile-2.min.css',
								'../assets/layouts/layout2/css/layout.min.css',
								'../assets/layouts/layout2/css/themes/blue.min.css',
								'../assets/layouts/layout2/css/custom.min.css',
								'../assets/layouts/layout2/scripts/layout.min.js',
								'../assets/layouts/global/scripts/quick-nav.min.js',
								'../styles/cmsdev.css',
							]
						});
					}]

				}
			})

			.state('viewprop', {
				url: '/myprop',
				controller: 'propertyCtrl',
				controllerAs: 'propctrl',
				templateUrl: 'views/viewproperties.html',
				resolve: { authenticate: authenticate }
			})
			.state('addunits', {
				url: '/addunits/{propId}',
				templateUrl: 'views/units.html',
				controller: 'propertyCtrl',
				controllerAs: 'propctrl',

			})
			.state('viewunits', {
				url: '/viewunits/{propId}',
				templateUrl: 'views/viewunits.html',
				controller: 'propertyCtrl',
				controllerAs: 'propctrl',

			})
			/*.state ('editprop', {
				url: '/editprop/{propId}',
				controller: 'propertyCtrl',
				controllerAs: 'propctrl',
				templateUrl: 'views/editproperty.html',
				resolve: { authenticate: authenticate }
			})*/
			.state('editprop', {
				url: '/editprop/{propId}',
				controller: 'propertyCtrl',
				controllerAs: 'propctrl',
				templateUrl: 'views/editproperty.html',
				resolve: { authenticate: authenticate }
			})

			.state('customemailhandler', {
				url: '/auth?{mode}&{oobCode}&{apiKey}',
				controller: 'emailhandlerCtrl',
				controllerAs: 'ehandlectrl',
				templateUrl: 'views/customhandler.html',
			})

			/* .state ('addprop', {
				url: '/addprop',
				controller: 'propertyCtrl',
				controllerAs: 'propctrl',
				templateUrl: 'views/addproperties.html',
				resolve: { authenticate: authenticate }
			})*/
			/*.state ('addprop', {
			   url: '/addprop',
			   controller: 'propertyCtrl',
			   controllerAs: 'propctrl',
			   templateUrl: 'views/addproperties.html',
			   resolve: { authenticate: authenticate }
		   })*/
			.state('addprop', {
				url: '/addprop',
				controller: 'propertyCtrl',
				controllerAs: 'propctrl',
				templateUrl: 'views/addproperties.html',
				resolve: { authenticate: authenticate }
			})

			// .state ('schedule', {
			// 	url: '/schedule',
			// 	controller: 'scheduleCtrl',
			// 	controllerAs: 'schedulectrl',
			// 	templateUrl: 'views/schedule.html',
			// 	resolve: { authenticate: authenticate }
			// })

			.state('schedule', {
				url: '/schedule',
				controller: 'newscheduleCtrl',
				controllerAs: 'newschedulectrl',
				templateUrl: 'views/newschedule.html',
				resolve: {
					authenticate: authenticate,
					deps: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'vcancyApp',
							files: [
								'../assets/layouts/layout2/css/layout.min.css',
								'../assets/layouts/layout2/css/themes/blue.min.css',
								'../assets/layouts/layout2/css/custom.min.css',
								'../assets/global/plugins/moment.min.js',
								'../assets/global/plugins/fullcalendar/fullcalendar.min.js',
								'../assets/pages/scripts/dashboard.min.js',
							]
						});
					}]
				}
			})

			.state('app', {
				url: '/app',
				controller: 'landlordappCtrl',
				controllerAs: 'lappctrl',
				templateUrl: 'views/peoples.html',
				resolve: { authenticate: authenticate }
			})

			.state('faq', {
				url: '/faq',
				controller: 'maCtrl',
				controllerAs: 'mactrl',
				templateUrl: 'views/faq.html',
				resolve: { authenticate: authenticate }
			})

			.state('contact', {
				url: '/contact',
				controller: 'maCtrl',
				controllerAs: 'mactrl',
				templateUrl: 'views/contact.html',
				resolve: { authenticate: authenticate }
			})

			.state('security', {
				url: '/security',
				controller: 'maCtrl',
				controllerAs: 'mactrl',
				templateUrl: 'views/security.html',
				resolve: { authenticate: authenticate }
			})

			.state('terms', {
				url: '/terms',
				controller: 'maCtrl',
				controllerAs: 'mactrl',
				templateUrl: 'views/terms.html',
				resolve: { authenticate: authenticate }
			})

			.state('viewtenantapplication', {
				url: '/viewapplication/{appID}',
				controller: 'viewappCtrl',
				controllerAs: 'vappctrl',
				templateUrl: 'views/view_rental_app_form.html',
				resolve: { authenticate: authenticate }
			})

			// Tenant Routes
			.state('tenantdashboard', {
				url: '/tenantdashboard',
				controller: 'tenantdboardlCtrl',
				controllerAs: 'tdboardctrl',
				templateUrl: 'views/tenant.html',
				resolve: {
					tenantauthenticate: tenantauthenticate,
					deps: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'vcancyApp',
							files: [
								'../assets/layouts/layout2/css/layout.min.css',
								'../assets/layouts/layout2/css/themes/blue.min.css',
								'../assets/layouts/layout2/css/custom.min.css',
								'../assets/global/plugins/moment.min.js',
								'../assets/global/plugins/fullcalendar/fullcalendar.min.js',
								'../assets/pages/scripts/dashboard.min.js',
							]
						});
					}]
				}
			})
			// .state('tenantprofile', {
			//     url: '/tenantprofile',
			//     controller: 'tenantProfilelCtrl',
			//     controllerAs: 'tdProfilectrl',
			//     templateUrl: 'views/tenantProfile.html',
			//     resolve: { tenantauthenticate: tenantauthenticate }
			// })
			.state('tenantprofile', {
				url: '/tenantprofile',
				controller: 'tenantProfilelCtrl',
				controllerAs: 'tdProfilectrl',
				templateUrl: 'views/tenantProfile.html',
				resolve: {
					tenantauthenticate: tenantauthenticate,
					deps: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'vcancyApp',
							files: [
								'../assets/pages/css/profile-2.min.css',
								'../assets/layouts/layout2/css/layout.min.css',
								'../assets/layouts/layout2/css/themes/blue.min.css',
								'../assets/layouts/layout2/css/custom.min.css',
								'../assets/layouts/layout2/scripts/layout.min.js',
								'../assets/layouts/global/scripts/quick-nav.min.js',
								'../styles/cmsdev.css',
							]
						});
					}]

				}
			})
			.state('tenantapply', {
				url: '/applyproperty/{propId}',
				controller: 'applypropCtrl',
				controllerAs: 'applyctrl',
				templateUrl: 'views/applyproperty.html',
			})

			.state('applicationThanks', {
				url: '/applicationThanks',
				templateUrl: 'views/applypropsuccess.html',
				resolve: { tenantauthenticate: tenantauthenticate }
			})

			.state('tenantschedule', {
				url: '/tenantschedule',
				controller: 'tenantscheduleCtrl',
				controllerAs: 'tschedulectrl',
				templateUrl: 'views/tenant_schedule.html',
				resolve: { tenantauthenticate: tenantauthenticate }
			})

			.state('tenantapplications', {
				url: '/tenantapplications',
				controller: 'tenantappCtrl',
				controllerAs: 'tappctrl',
				templateUrl: 'views/tenant_app.html',
				resolve: { tenantauthenticate: tenantauthenticate }
			})


			.state('rentalform', {
				url: '/rentalform/{scheduleId}/{applicationId}',
				controller: 'rentalformCtrl',
				controllerAs: 'rctrl',
				templateUrl: 'views/rental_app_form.html',
				resolve: { tenantauthenticate: tenantauthenticate }
			})

			

			.state('viewapplication1', {
				url: '/viewapp/{appID}',
				controller: 'viewappCtrl',
				controllerAs: 'vappctrl',
				templateUrl: 'views/view_rental_app_form.html',
				resolve: { tenantauthenticate: tenantauthenticate }
			})


			.state('admindashboard', {
				url: '/admin/dashboard',
				controller: 'adminDashbordCtrl',
				controllerAs: 'adashbord',
				templateUrl: 'views/admin/dashbord.html',
				resolve: {
					adminauthenticate: adminauthenticate,
					deps: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'vcancyApp',
							files: [
								'../assets/layouts/layout2/css/layout.min.css',
								'../assets/layouts/layout2/css/themes/blue.min.css',
								'../assets/layouts/layout2/css/custom.min.css',
								'../assets/global/plugins/moment.min.js',
								'../assets/global/plugins/fullcalendar/fullcalendar.min.js',
								'../assets/pages/scripts/dashboard.min.js',
							]
						});
					}]
				}
			})
			.state('adminrentalform', {
				url: '/adminrentalform/{tenantID}/{scheduleId}/{applicationId}',
				controller: 'adminrentalformCtrl',
				controllerAs: 'arctrl',
				templateUrl: 'views/admin/adminrental_app_form.html',
				resolve: { adminauthenticate: adminauthenticate }
			}) 

			.state('adminviewapplication', {
				url: '/adminviewapp/{appID}',
				controller: 'adminviewappCtrl',
				controllerAs: 'avappctrl',
				templateUrl: 'views/admin/adminview_rental_app_form.html',
				resolve: { adminauthenticate: adminauthenticate }
			})

			.state('adminapplication', {
				url: '/admin/application',
				controller: 'adminApplicationCtrl',
				controllerAs: 'aapplication',
				templateUrl: 'views/admin/application.html',
				resolve: {
					adminauthenticate: adminauthenticate,
				}
			})
			.state('adminbilling', {
				url: '/admin/billing',
				controller: 'adminBillingCtrl',
				controllerAs: 'abilling',
				templateUrl: 'views/admin/billing.html',
				resolve: {
					adminauthenticate: adminauthenticate,
				}
			})

			.state('admineditprop', {
				url: '/admin/editprop/{propId}',
				controller: 'adminPropertyCtrl',
				controllerAs: 'apropctrl',
				templateUrl: 'views/admin/editproperty.html',
				resolve: { adminauthenticate: adminauthenticate }
			})

			.state('adminaddprop', {
				url: '/admin/addprop',
				controller: 'adminPropertyCtrl',
				controllerAs: 'apropctrl',
				templateUrl: 'views/admin/addproperties.html',
				resolve: { adminauthenticate: adminauthenticate }
			})
		
			.state('adminpeoples', {
				url: '/admin/peoples',
				controller: 'adminPeoplesCtrl',
				controllerAs: 'apeoples',
				templateUrl: 'views/admin/peoples.html',
				resolve: {
					adminauthenticate: adminauthenticate,
				}
			})
			.state('adminproperty', {
				url: '/admin/property',
				controller: 'adminPropertyCtrl',
				controllerAs: 'aproperty',
				templateUrl: 'views/admin/property.html',
				resolve: {
					adminauthenticate: adminauthenticate,
				}
			})
			.state('adminschedule', {
				url: '/admin/schedule',
				controller: 'adminScheduleCtrl',
				controllerAs: 'aschedule',
				templateUrl: 'views/admin/schedule.html',
				resolve: {
					adminauthenticate: adminauthenticate,
				}
			})
			.state('adminprofile', {
				url: '/admin/profile',
				controller: 'adminProfileCtrl',
				controllerAs: 'aprofile',
				templateUrl: 'views/admin/profile.html',
				resolve: {
					adminauthenticate: adminauthenticate,
				}
			});


		function authenticate($q, $state, $timeout, $rootScope) {
			// console.log($rootScope.user.emailVerified);

			if (localStorage.getItem('userID') !== "null" && localStorage.getItem('userEmailVerified') !== "null" && localStorage.getItem('usertype') != "null") {
				$rootScope.uid = localStorage.getItem('userID');
				$rootScope.emailVerified = localStorage.getItem('userEmailVerified');
				$rootScope.usertype = localStorage.getItem('usertype');
			}

			if ($rootScope.uid && $rootScope.emailVerified && $rootScope.usertype == "1") {
				// Resolve the promise successfully
				return $q.when()

			} else {
				// The next bit of code is asynchronously tricky.

				$timeout(function () {
					// This code runs after the authentication promise has been rejected.
					// Go to the log-in page
					$state.go('login')
				})

				// Reject the authentication promise to prevent the state from loading
				return $q.reject()
			}
		}

		function tenantauthenticate($q, $state, $timeout, $rootScope) {
			// console.log($rootScope.user.emailVerified);

			if (localStorage.getItem('userID') !== "null" && localStorage.getItem('userEmailVerified') !== "null" && localStorage.getItem('usertype') != "null") {
				$rootScope.uid = localStorage.getItem('userID');
				$rootScope.emailVerified = localStorage.getItem('userEmailVerified');
				$rootScope.usertype = localStorage.getItem('usertype');
			}

			if ($rootScope.uid && $rootScope.emailVerified && $rootScope.usertype == "0") {
				// Resolve the promise successfully
				return $q.when()

			} else {
				// The next bit of code is asynchronously tricky.

				console.log(window.location);
				// $rootScope.applyhiturl = window.location.href;
				localStorage.setItem('applyhiturl', window.location.href)


				$timeout(function () {
					// This code runs after the authentication promise has been rejected.
					// Go to the log-in page
					$state.go('login')
				})


				// Reject the authentication promise to prevent the state from loading
				return $q.reject()
			}
		}

		function adminauthenticate($q, $state, $timeout, $rootScope) {
			// console.log($rootScope.user.emailVerified);

			if (localStorage.getItem('userID') !== "null" && localStorage.getItem('userEmailVerified') !== "null" && localStorage.getItem('usertype') != "null") {
				$rootScope.uid = localStorage.getItem('userID');
				$rootScope.emailVerified = localStorage.getItem('userEmailVerified');
				$rootScope.usertype = localStorage.getItem('usertype');
			}

			if ($rootScope.uid && $rootScope.emailVerified && $rootScope.usertype == 3) {
				// Resolve the promise successfully
				return $q.when()

			} else {
				// The next bit of code is asynchronously tricky.

				console.log(window.location);
				// $rootScope.applyhiturl = window.location.href;
				localStorage.setItem('applyhiturl', window.location.href)


				$timeout(function () {
					// This code runs after the authentication promise has been rejected.
					// Go to the log-in page
					$state.go('login')
				})


				// Reject the authentication promise to prevent the state from loading
				return $q.reject()
			}
		}
	})
	.run(['$rootScope', function ($rootScope) {
		$rootScope.$on('$stateChangeSuccess', function (event, to, toParams, from, fromParams) {
			$rootScope.$previousState = from;
		});
	}]);

vcancyApp.run(['$templateCache', function ($templateCache) {
  'use strict';

  $templateCache.put('template/chat.html',
    "<div class=\"chat-search\"><div class=\"fg-line\"><input type=\"text\" class=\"form-control\" placeholder=\"Search People\"></div></div><div class=\"listview\"><a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left p-relative\"><img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\"> <i class=\"chat-status-busy\"></i></div><div class=\"media-body\"><div class=\"lv-title\">Jonathan Morris</div><small class=\"lv-small\">Available</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">David Belle</div><small class=\"lv-small\">Last seen 3 hours ago</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left p-relative\"><img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\"> <i class=\"chat-status-online\"></i></div><div class=\"media-body\"><div class=\"lv-title\">Fredric Mitchell Jr.</div><small class=\"lv-small\">Availble</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left p-relative\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"> <i class=\"chat-status-online\"></i></div><div class=\"media-body\"><div class=\"lv-title\">Glenn Jecobs</div><small class=\"lv-small\">Availble</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/5.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Bill Phillips</div><small class=\"lv-small\">Last seen 3 days ago</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/6.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Wendy Mitchell</div><small class=\"lv-small\">Last seen 2 minutes ago</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left p-relative\"><img class=\"lv-img-sm\" src=\"img/profile-pics/7.jpg\" alt=\"\"> <i class=\"chat-status-busy\"></i></div><div class=\"media-body\"><div class=\"lv-title\">Teena Bell Ann</div><small class=\"lv-small\">Busy</small></div></div></a></div>"
  );


  $templateCache.put('template/footer.html',
    "Copyright &copy; 2015 Material Admin<ul class=\"f-menu\"><li><a href=\"\">Home</a></li><li><a href=\"\">Dashboard</a></li><li><a href=\"\">Reports</a></li><li><a href=\"\">Support</a></li><li><a href=\"\">Contact</a></li></ul>"
  );


  $templateCache.put('template/header-image-logo.html',
    "<ul class=\"header-inner clearfix\"><li id=\"menu-trigger\" data-target=\"mainmenu\" data-toggle-sidebar data-model-left=\"mactrl.sidebarToggle.left\" data-ng-class=\"{ 'open': mactrl.sidebarToggle.left === true }\"><div class=\"line-wrap\"><div class=\"line top\"></div><div class=\"line center\"></div><div class=\"line bottom\"></div></div></li><li class=\"hidden-xs\"><a href=\"index.html\" class=\"m-l-10\" data-ng-click=\"mactrl.sidebarStat($event)\"><img src=\"img/demo/logo.png\" alt=\"\"></a></li><li class=\"pull-right\"><ul class=\"top-menu\"><li id=\"top-search\" data-ng-click=\"hctrl.openSearch()\"><a href=\"\"><span class=\"tm-label\">Search</span></a></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><span class=\"tm-label\">Messages</span></a><div class=\"dropdown-menu dropdown-menu-lg pull-right\"><div class=\"listview\"><div class=\"lv-header\">Messages</div><div class=\"lv-body\"><a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">David Belle</div><small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Jonathan Morris</div><small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Fredric Mitchell Jr.</div><small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Glenn Jecobs</div><small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Bill Phillips</div><small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small></div></div></a></div><a class=\"lv-footer\" href=\"\">View All</a></div></div></li><li class=\"dropdown hidden-xs\" uib-dropdown><a uib-dropdown-toggle href=\"\"><span class=\"tm-label\">Notification</span></a><div class=\"dropdown-menu dropdown-menu-lg pull-right\"><div class=\"listview\" id=\"notifications\"><div class=\"lv-header\">Notification<ul class=\"actions\"><li class=\"dropdown\"><a href=\"\" data-clear=\"notification\"><i class=\"zmdi zmdi-check-all\"></i></a></li></ul></div><div class=\"lv-body\"><a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">David Belle</div><small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Jonathan Morris</div><small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Fredric Mitchell Jr.</div><small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Glenn Jecobs</div><small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Bill Phillips</div><small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small></div></div></a></div><a class=\"lv-footer\" href=\"\">View Previous</a></div></div></li><li class=\"hidden-xs\"><a target=\"_blank\" href=\"https://wrapbootstrap.com/theme/superflat-simple-responsive-admin-theme-WB082P91H\"><span class=\"tm-label\">Link</span></a></li></ul></li></ul><!-- Top Search Content --><div id=\"top-search-wrap\"><div class=\"tsw-inner\"><i id=\"top-search-close\" data-ng-click=\"hctrl.closeSearch()\" class=\"zmdi zmdi-arrow-left\"></i> <input type=\"text\"></div></div>"
  );


  $templateCache.put('template/header-textual-menu.html',
    "<ul class=\"header-inner clearfix\"><li id=\"menu-trigger\" data-target=\"mainmenu\" data-toggle-sidebar data-model-left=\"mactrl.sidebarToggle.left\" data-ng-class=\"{ 'open': mactrl.sidebarToggle.left === true }\"><div class=\"line-wrap\"><div class=\"line top\"></div><div class=\"line center\"></div><div class=\"line bottom\"></div></div></li><li class=\"logo hidden-xs\"><a data-ui-sref=\"home\" data-ng-click=\"mactrl.sidebarStat($event)\">Material Admin</a></li><li class=\"pull-right\"><ul class=\"top-menu\"><li id=\"top-search\" data-ng-click=\"hctrl.openSearch()\"><a href=\"\"><span class=\"tm-label\">Search</span></a></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><span class=\"tm-label\">Messages</span></a><div class=\"dropdown-menu dropdown-menu-lg pull-right\"><div class=\"listview\"><div class=\"lv-header\">Messages</div><div class=\"lv-body\"><a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">David Belle</div><small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Jonathan Morris</div><small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Fredric Mitchell Jr.</div><small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Glenn Jecobs</div><small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Bill Phillips</div><small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small></div></div></a></div><a class=\"lv-footer\" href=\"\">View All</a></div></div></li><li class=\"dropdown hidden-xs\" uib-dropdown><a uib-dropdown-toggle href=\"\"><span class=\"tm-label\">Notification</span></a><div class=\"dropdown-menu dropdown-menu-lg pull-right\"><div class=\"listview\" id=\"notifications\"><div class=\"lv-header\">Notification<ul class=\"actions\"><li class=\"dropdown\"><a href=\"\" data-clear=\"notification\"><i class=\"zmdi zmdi-check-all\"></i></a></li></ul></div><div class=\"lv-body\"><a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">David Belle</div><small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Jonathan Morris</div><small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Fredric Mitchell Jr.</div><small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Glenn Jecobs</div><small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Bill Phillips</div><small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small></div></div></a></div><a class=\"lv-footer\" href=\"\">View Previous</a></div></div></li><li class=\"hidden-xs\"><a target=\"_blank\" href=\"https://wrapbootstrap.com/theme/superflat-simple-responsive-admin-theme-WB082P91H\"><span class=\"tm-label\">Link</span></a></li></ul></li></ul><!-- Top Search Content --><div id=\"top-search-wrap\"><div class=\"tsw-inner\"><i id=\"top-search-close\" data-ng-click=\"hctrl.closeSearch()\" class=\"zmdi zmdi-arrow-left\"></i> <input type=\"text\"></div></div>"
  );


  $templateCache.put('template/header-top-menu.html',
    "<ul class=\"header-inner clearfix\"><li id=\"menu-trigger\" data-trigger=\".ha-menu\" class=\"visible-xs\"><div class=\"line-wrap\"><div class=\"line top\"></div><div class=\"line center\"></div><div class=\"line bottom\"></div></div></li><li class=\"logo hidden-xs\"><a data-ui-sref=\"home\">Material Admin</a></li><li class=\"pull-right\"><ul class=\"top-menu\"><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tmn-counts\">6</i> <i class=\"tm-icon zmdi zmdi-email\"></i></a><div class=\"dropdown-menu dropdown-menu-lg pull-right\"><div class=\"listview\"><div class=\"lv-header\">Messages</div><div class=\"lv-body\"><a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">David Belle</div><small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Jonathan Morris</div><small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Fredric Mitchell Jr.</div><small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Glenn Jecobs</div><small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Bill Phillips</div><small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small></div></div></a></div><a class=\"lv-footer\" href=\"\">View All</a></div></div></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle><i class=\"tmn-counts\">9</i> <i class=\"tm-icon zmdi zmdi-notifications\"></i></a><div class=\"dropdown-menu dropdown-menu-lg pull-right\"><div class=\"listview\" id=\"notifications\"><div class=\"lv-header\">Notification<ul class=\"actions\"><li class=\"dropdown\"><a href=\"\" data-clear=\"notification\"><i class=\"zmdi zmdi-check-all\"></i></a></li></ul></div><div class=\"lv-body\"><a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/1.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">David Belle</div><small class=\"lv-small\">Cum sociis natoque penatibus et magnis dis parturient montes</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/2.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Jonathan Morris</div><small class=\"lv-small\">Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/3.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Fredric Mitchell Jr.</div><small class=\"lv-small\">Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Glenn Jecobs</div><small class=\"lv-small\">Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</small></div></div></a> <a class=\"lv-item\" href=\"\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" src=\"img/profile-pics/4.jpg\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">Bill Phillips</div><small class=\"lv-small\">Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</small></div></div></a></div><a class=\"lv-footer\" href=\"\">View Previous</a></div></div></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tmn-counts\">2</i> <i class=\"tm-icon zmdi zmdi-view-list-alt\"></i></a><div class=\"dropdown-menu pull-right dropdown-menu-lg\"><div class=\"listview\"><div class=\"lv-header\">Tasks</div><div class=\"lv-body\"><div class=\"lv-item\"><div class=\"lv-title m-b-5\">HTML5 Validation Report</div><div class=\"progress\"><div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"95\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 95%\"><span class=\"sr-only\">95% Complete (success)</span></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Google Chrome Extension</div><div class=\"progress\"><div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\"><span class=\"sr-only\">80% Complete (success)</span></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Social Intranet Projects</div><div class=\"progress\"><div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\"><span class=\"sr-only\">20% Complete</span></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Bootstrap Admin Template</div><div class=\"progress\"><div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\"><span class=\"sr-only\">60% Complete (warning)</span></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Youtube Client App</div><div class=\"progress\"><div class=\"progress-bar progress-bar-danger\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\"><span class=\"sr-only\">80% Complete (danger)</span></div></div></div></div><a class=\"lv-footer\" href=\"\">View All</a></div></div></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-more-vert\"></i></a><ul class=\"dropdown-menu dm-icon pull-right\"><li class=\"hidden-xs\"><a data-ng-click=\"hctrl.fullScreen()\" href=\"\"><i class=\"zmdi zmdi-fullscreen\"></i> Toggle Fullscreen</a></li><li><a data-ng-click=\"hctrl.clearLocalStorage()\" href=\"\"><i class=\"zmdi zmdi-delete\"></i> Clear Local Storage</a></li><li><a href=\"\"><i class=\"zmdi zmdi-face\"></i> Privacy Settings</a></li><li><a href=\"\"><i class=\"zmdi zmdi-settings\"></i> Other Settings</a></li></ul></li></ul></li></ul><div class=\"search\"><div class=\"fg-line\"><input type=\"text\" class=\"form-control\" placeholder=\"Search...\"></div></div><nav class=\"ha-menu\"><ul><li class=\"waves-effect\" data-ui-sref-active=\"active\"><a data-ui-sref=\"home\" data-ng-click=\"mactrl.sidebarStat($event)\">Home</a></li><li class=\"dropdown\" uib-dropdown data-ng-class=\"{ 'active': mactrl.$state.includes('headers') }\"><div class=\"waves-effect\" uib-dropdown-toggle>Headers</div><ul class=\"dropdown-menu\"><li data-ui-sref-active=\"active\"><a data-ui-sref=\"headers.textual-menu\">Textual menu</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"headers.image-logo\">Image logo</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"headers.mainmenu-on-top\">Mainmenu on top</a></li></ul></li><li class=\"waves-effect\" data-ui-sref-active=\"active\"><a data-ui-sref=\"typography\">Typography</a></li><li class=\"dropdown\" uib-dropdown><div class=\"waves-effect\" uib-dropdown-toggle>Widgets</div><ul class=\"dropdown-menu\"><li data-ui-sref-active=\"active\"><a data-ui-sref=\"widgets.widget-templates\">Templates</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"widgets.widgets\">Widgets</a></li></ul></li><li class=\"dropdown\" uib-dropdown><div class=\"waves-effect\" uib-dropdown-toggle>Tables</div><ul class=\"dropdown-menu\"><li data-ui-sref-active=\"active\"><a data-ui-sref=\"tables.tables\">Normal Tables</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"tables.data-table\">Data Tables</a></li></ul></li><li class=\"dropdown\" uib-dropdown><div class=\"waves-effect\" uib-dropdown-toggle>Forms</div><ul class=\"dropdown-menu\"><li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.basic-form-elements\">Basic Form Elements</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.form-components\">Form Components</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.form-examples\">Form Examples</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"form.form-validations\">Form Validation</a></li></ul></li><li class=\"dropdown\" uib-dropdown><div class=\"waves-effect\" uib-dropdown-toggle>User Interface</div><ul class=\"dropdown-menu\"><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.ui-bootstrap\">UI Bootstrap</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.colors\">Colors</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.animations\">Animations</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.box-shadow\">Box Shadow</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.buttons\">Buttons</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.icons\">Icons</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.alerts\">Alerts</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.preloaders\">Preloaders</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.notifications-dialogs\">Notifications & Dialogs</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.media\">Media</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"user-interface.other-components\">Others</a></li></ul></li><li class=\"dropdown\" uib-dropdown><div class=\"waves-effect\" uib-dropdown-toggle>Charts</div><ul class=\"dropdown-menu\"><li data-ui-sref-active=\"active\"><a data-ui-sref=\"charts.flot-charts\">Flot Charts</a></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"charts.other-charts\">Other Charts</a></li></ul></li><li class=\"waves-effect\" data-ui-sref-active=\"active\"><a data-ui-sref=\"calendar\">Calendar</a></li></ul></nav><div class=\"skin-switch dropdown hidden-xs\" uib-dropdown><button uib-dropdown-toggle class=\"btn ss-icon\"><i class=\"zmdi zmdi-palette\"></i></button><div class=\"dropdown-menu\"><span ng-repeat=\"w in mactrl.skinList\" class=\"ss-skin bgm-{{ w }}\" data-ng-click=\"mactrl.skinSwitch(w)\"></span></div></div>"
  );


  $templateCache.put('template/header.html',
    "<ul class=\"header-inner clearfix\"><li id=\"menu-trigger\" data-target=\"mainmenu\" data-toggle-sidebar data-model-left=\"mactrl.sidebarToggle.left\" data-ng-class=\"{ 'open': mactrl.sidebarToggle.left === true }\"><div class=\"line-wrap\"><div class=\"line top\"></div><div class=\"line center\"></div><div class=\"line bottom\"></div></div></li><li class=\"logo hidden-xs\"><a data-ui-sref=\"home\" data-ng-click=\"mactrl.sidebarStat($event)\">Material Admin</a></li><li class=\"pull-right\"><ul class=\"top-menu\"><li id=\"toggle-width\"><div class=\"toggle-switch\"><input id=\"tw-switch\" type=\"checkbox\" hidden data-change-layout=\"mactrl.layoutType\"><label for=\"tw-switch\" class=\"ts-helper\"></label></div></li><li id=\"top-search\"><a href=\"\" data-ng-click=\"hctrl.openSearch()\"><i class=\"tm-icon zmdi zmdi-search\"></i></a></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-email\"></i> <i class=\"tmn-counts\">6</i></a><div class=\"dropdown-menu dropdown-menu-lg stop-propagate pull-right\"><div class=\"listview\"><div class=\"lv-header\">Messages</div><div class=\"lv-body\"><a class=\"lv-item\" ng-href=\"\" ng-repeat=\"w in hctrl.messageResult.list\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" ng-src=\"img/profile-pics/{{ w.img }}\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">{{ w.user }}</div><small class=\"lv-small\">{{ w.text }}</small></div></div></a></div><div class=\"clearfix\"></div><a class=\"lv-footer\" href=\"\">View All</a></div></div></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-notifications\"></i> <i class=\"tmn-counts\">9</i></a><div class=\"dropdown-menu dropdown-menu-lg stop-propagate pull-right\"><div class=\"listview\" id=\"notifications\"><div class=\"lv-header\">Notification<ul class=\"actions\"><li><a href=\"\" data-ng-click=\"hctrl.clearNotification($event)\"><i class=\"zmdi zmdi-check-all\"></i></a></li></ul></div><div class=\"lv-body\"><a class=\"lv-item\" ng-href=\"\" ng-repeat=\"w in hctrl.messageResult.list\"><div class=\"media\"><div class=\"pull-left\"><img class=\"lv-img-sm\" ng-src=\"img/profile-pics/{{ w.img }}\" alt=\"\"></div><div class=\"media-body\"><div class=\"lv-title\">{{ w.user }}</div><small class=\"lv-small\">{{ w.text }}</small></div></div></a></div><div class=\"clearfix\"></div><a class=\"lv-footer\" href=\"\">View Previous</a></div></div></li><li class=\"dropdown hidden-xs\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-view-list-alt\"></i> <i class=\"tmn-counts\">2</i></a><div class=\"dropdown-menu pull-right dropdown-menu-lg\"><div class=\"listview\"><div class=\"lv-header\">Tasks</div><div class=\"lv-body\"><div class=\"lv-item\"><div class=\"lv-title m-b-5\">HTML5 Validation Report</div><div class=\"progress\"><div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"95\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 95%\"><span class=\"sr-only\">95% Complete (success)</span></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Google Chrome Extension</div><div class=\"progress\"><div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\"><span class=\"sr-only\">80% Complete (success)</span></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Social Intranet Projects</div><div class=\"progress\"><div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\"><span class=\"sr-only\">20% Complete</span></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Bootstrap Admin Template</div><div class=\"progress\"><div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\"><span class=\"sr-only\">60% Complete (warning)</span></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Youtube Client App</div><div class=\"progress\"><div class=\"progress-bar progress-bar-danger\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\"><span class=\"sr-only\">80% Complete (danger)</span></div></div></div></div><div class=\"clearfix\"></div><a class=\"lv-footer\" href=\"\">View All</a></div></div></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-more-vert\"></i></a><ul class=\"dropdown-menu dm-icon pull-right\"><li class=\"skin-switch hidden-xs\"><span ng-repeat=\"w in mactrl.skinList | limitTo : 6\" class=\"ss-skin bgm-{{ w }}\" data-ng-click=\"mactrl.skinSwitch(w)\"></span></li><li class=\"divider hidden-xs\"></li><li class=\"hidden-xs\"><a data-ng-click=\"hctrl.fullScreen()\" href=\"\"><i class=\"zmdi zmdi-fullscreen\"></i> Toggle Fullscreen</a></li><li><a data-ng-click=\"hctrl.clearLocalStorage()\" href=\"\"><i class=\"zmdi zmdi-delete\"></i> Clear Local Storage</a></li><li><a href=\"\"><i class=\"zmdi zmdi-face\"></i> Privacy Settings</a></li><li><a href=\"\"><i class=\"zmdi zmdi-settings\"></i> Other Settings</a></li></ul></li><li class=\"hidden-xs\" data-target=\"chat\" data-toggle-sidebar data-model-right=\"mactrl.sidebarToggle.right\" data-ng-class=\"{ 'open': mactrl.sidebarToggle.right === true }\"><a href=\"\"><i class=\"tm-icon zmdi zmdi-comment-alt-text\"></i></a></li></ul></li></ul><!-- Top Search Content --><div id=\"top-search-wrap\"><div class=\"tsw-inner\"><i id=\"top-search-close\" class=\"zmdi zmdi-arrow-left\" data-ng-click=\"hctrl.closeSearch()\"></i> <input type=\"text\"></div></div>"
  );


  $templateCache.put('template/profile-menu.html',
    "<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-about\">About</a></li><li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-timeline\">Timeline</a></li><li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-photos\">Photos</a></li><li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"pages.profile.profile-connections\">Connections</a></li>"
  );


  $templateCache.put('template/sidebar-left.html',
    "<div class=\"sidebar-inner c-overflow\"><div class=\"profile-menu\"><a href=\"\" toggle-submenu><div class=\"profile-pic\"><img src=\"img/profile-pics/1.jpg\" alt=\"\"></div><div class=\"profile-info\">Malinda Hollaway <i class=\"zmdi zmdi-caret-down\"></i></div></a><ul class=\"main-menu\"><li><a data-ui-sref=\"pages.profile.profile-about\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-account\"></i> View Profile</a></li><li><a href=\"\"><i class=\"zmdi zmdi-input-antenna\"></i> Privacy Settings</a></li><li><a href=\"\"><i class=\"zmdi zmdi-settings\"></i> Settings</a></li><li><a href=\"\"><i class=\"zmdi zmdi-time-restore\"></i> Logout</a></li></ul></div><ul class=\"main-menu\"><li data-ui-sref-active=\"active\"><a data-ui-sref=\"home\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-home\"></i> Home</a></li><li class=\"sub-menu\" data-ng-class=\"{ 'active toggled': mactrl.$state.includes('headers') }\"><a href=\"\" toggle-submenu><i class=\"zmdi zmdi-view-compact\"></i> Headers</a><ul><li><a data-ui-sref-active=\"active\" data-ui-sref=\"headers.textual-menu\" data-ng-click=\"mactrl.sidebarStat($event)\">Textual menu</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"headers.image-logo\" data-ng-click=\"mactrl.sidebarStat($event)\">Image logo</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"headers.mainmenu-on-top\" data-ng-click=\"mactrl.sidebarStat($event)\">Mainmenu on top</a></li></ul></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"typography\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-format-underlined\"></i> Typography</a></li><li class=\"sub-menu\" data-ng-class=\"{ 'active toggled': mactrl.$state.includes('widgets') }\"><a href=\"\" toggle-submenu><i class=\"zmdi zmdi-widgets\"></i> Widgets</a><ul><li><a data-ui-sref-active=\"active\" data-ui-sref=\"widgets.widget-templates\" data-ng-click=\"mactrl.sidebarStat($event)\">Templates</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"widgets.widgets\" data-ng-click=\"mactrl.sidebarStat($event)\">Widgets</a></li></ul></li><li class=\"sub-menu\" data-ng-class=\"{ 'active toggled': mactrl.$state.includes('tables') }\"><a href=\"\" toggle-submenu><i class=\"zmdi zmdi-view-list\"></i> Tables</a><ul><li><a data-ui-sref-active=\"active\" data-ui-sref=\"tables.tables\" data-ng-click=\"mactrl.sidebarStat($event)\">Tables</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"tables.data-table\" data-ng-click=\"mactrl.sidebarStat($event)\">Data Tables</a></li></ul></li><li class=\"sub-menu\" data-ng-class=\"{ 'active toggled': mactrl.$state.includes('form') }\"><a href=\"\" toggle-submenu><i class=\"zmdi zmdi-collection-text\"></i> Forms</a><ul><li><a data-ui-sref-active=\"active\" data-ui-sref=\"form.basic-form-elements\" data-ng-click=\"mactrl.sidebarStat($event)\">Basic Form Elements</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"form.form-components\" data-ng-click=\"mactrl.sidebarStat($event)\">Form Components</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"form.form-examples\" data-ng-click=\"mactrl.sidebarStat($event)\">Form Examples</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"form.form-validations\" data-ng-click=\"mactrl.sidebarStat($event)\">Form Validation</a></li></ul></li><li class=\"sub-menu\" data-ng-class=\"{ 'active toggled': mactrl.$state.includes('user-interface') }\"><a href=\"\" toggle-submenu><i class=\"zmdi zmdi-swap-alt\"></i>User Interface</a><ul><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.ui-bootstrap\" data-ng-click=\"mactrl.sidebarStat($event)\">UI Bootstrap</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.colors\" data-ng-click=\"mactrl.sidebarStat($event)\">Colors</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.animations\" data-ng-click=\"mactrl.sidebarStat($event)\">Animations</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.box-shadow\" data-ng-click=\"mactrl.sidebarStat($event)\">Box Shadow</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.buttons\" data-ng-click=\"mactrl.sidebarStat($event)\">Buttons</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.icons\" data-ng-click=\"mactrl.sidebarStat($event)\">Icons</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.alerts\" data-ng-click=\"mactrl.sidebarStat($event)\">Alerts</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.preloaders\" data-ng-click=\"mactrl.sidebarStat($event)\">Preloaders</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.notifications-dialogs\" data-ng-click=\"mactrl.sidebarStat($event)\">Notifications & Dialogs</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.media\" data-ng-click=\"mactrl.sidebarStat($event)\">Media</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"user-interface.other-components\" data-ng-click=\"mactrl.sidebarStat($event)\">Others</a></li></ul></li><li class=\"sub-menu\" data-ng-class=\"{ 'active toggled': mactrl.$state.includes('charts') }\"><a href=\"\" toggle-submenu><i class=\"zmdi zmdi-trending-up\"></i>Charts</a><ul><li><a data-ui-sref-active=\"active\" data-ui-sref=\"charts.flot-charts\" data-ng-click=\"mactrl.sidebarStat($event)\">Flot Charts</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"charts.other-charts\" data-ng-click=\"mactrl.sidebarStat($event)\">Other Charts</a></li></ul></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"calendar\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-calendar\"></i> Calendar</a></li><li class=\"sub-menu\" data-ng-class=\"{ 'active toggled': mactrl.$state.includes('photo-gallery') }\"><a href=\"\" toggle-submenu><i class=\"zmdi zmdi-image\"></i>Photo Gallery</a><ul><li><a data-ui-sref-active=\"active\" data-ui-sref=\"photo-gallery.photos\" data-ng-click=\"mactrl.sidebarStat($event)\">Default</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"photo-gallery.timeline\" data-ng-click=\"mactrl.sidebarStat($event)\">Timeline</a></li></ul></li><li data-ui-sref-active=\"active\"><a data-ui-sref=\"generic-classes\" data-ng-click=\"mactrl.sidebarStat($event)\"><i class=\"zmdi zmdi-layers\"></i> Generic Classes</a></li><li class=\"sub-menu\" data-ng-class=\"{ 'active toggled': mactrl.$state.includes('pages') }\"><a href=\"\" toggle-submenu><i class=\"zmdi zmdi-collection-item\"></i> Sample Pages</a><ul><li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.profile.profile-about\" data-ng-click=\"mactrl.sidebarStat($event)\">Profile</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.listview\" data-ng-click=\"mactrl.sidebarStat($event)\">List View</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.messages\" data-ng-click=\"mactrl.sidebarStat($event)\">Messages</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.pricing-table\" data-ng-click=\"mactrl.sidebarStat($event)\">Pricing Table</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.contacts\" data-ng-click=\"mactrl.sidebarStat($event)\">Contacts</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.invoice\" data-ng-click=\"mactrl.sidebarStat($event)\">Invoice</a></li><li><a data-ui-sref-active=\"active\" data-ui-sref=\"pages.wall\" data-ng-click=\"mactrl.sidebarStat($event)\">Wall</a></li><li><a href=\"login.html\">Login and Sign Up</a></li><li><a href=\"lockscreen.html\">Lockscreen</a></li><li><a href=\"404.html\">Error 404</a></li></ul></li><li class=\"sub-menu\"><a href=\"\" toggle-submenu><i class=\"zmdi zmdi-menu\"></i> 3 Level Menu</a><ul><li><a href=\"\">Level 2 link</a></li><li><a href=\"\">Another level 2 Link</a></li><li class=\"sub-menu\"><a href=\"\" toggle-submenu>I have children too</a><ul><li><a href=\"\">Level 3 link</a></li><li><a href=\"\">Another Level 3 link</a></li><li><a href=\"\">Third one</a></li></ul></li><li><a href=\"\">One more 2</a></li></ul></li><li><a href=\"https://wrapbootstrap.com/theme/material-admin-responsive-angularjs-WB011H985\"><i class=\"zmdi zmdi-money\"></i> Buy this template</a></li></ul></div>"
  );


  $templateCache.put('template/carousel/carousel.html',
    "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\" ng-swipe-right=\"prev()\" ng-swipe-left=\"next()\"><ol class=\"carousel-indicators\" ng-show=\"slides.length > 1\"><li ng-repeat=\"slide in slides | orderBy:'index' track by $index\" ng-class=\"{active: isActive(slide)}\" ng-click=\"select(slide)\"></li></ol><div class=\"carousel-inner\" ng-transclude></div><a class=\"left carousel-control\" ng-click=\"prev()\" ng-show=\"slides.length > 1\"><span class=\"zmdi zmdi-chevron-left\"></span></a> <a class=\"right carousel-control\" ng-click=\"next()\" ng-show=\"slides.length > 1\"><span class=\"zmdi zmdi-chevron-right\"></span></a></div>"
  );


  $templateCache.put('template/datepicker/day.html',
    "<table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\" class=\"dp-table dpt-day\"><thead><tr class=\"tr-dpnav\"><th><button type=\"button\" class=\"pull-left btn-dp\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"zmdi zmdi-long-arrow-left\"></i></button></th><th colspan=\"{{::5 + showWeeks}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" class=\"w-100 btn-dp\"><div class=\"dp-title\">{{title}}</div></button></th><th><button type=\"button\" class=\"pull-right btn-dp\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"zmdi zmdi-long-arrow-right\"></i></button></th></tr><tr class=\"tr-dpday\"><th ng-if=\"showWeeks\" class=\"text-center\"></th><th ng-repeat=\"label in ::labels track by $index\" class=\"text-center\"><small aria-label=\"{{::label.full}}\">{{::label.abbr}}</small></th></tr></thead><tbody><tr ng-repeat=\"row in rows track by $index\"><td ng-if=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td><td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{::dt.uid}}\" ng-class=\"::dt.customClass\"><button type=\"button\" class=\"w-100 btn-dp btn-dpday btn-dpbody\" ng-class=\"{'dp-today': dt.current, 'dp-selected': dt.selected, 'dp-active': isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"::{'dp-day-muted': dt.secondary, 'dp-day-today': dt.current}\">{{::dt.label}}</span></button></td></tr></tbody></table>"
  );


  $templateCache.put('template/datepicker/month.html',
    "<table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\" class=\"dp-table\"><thead><tr class=\"tr-dpnav\"><th><button type=\"button\" class=\"pull-left btn-dp\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"zmdi zmdi-long-arrow-left\"></i></button></th><th><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" class=\"w-100 btn-dp\"><div class=\"dp-title\">{{title}}</div></button></th><th><button type=\"button\" class=\"pull-right btn-dp\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"zmdi zmdi-long-arrow-right\"></i></button></th></tr></thead><tbody><tr ng-repeat=\"row in rows track by $index\"><td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{::dt.uid}}\" ng-class=\"::dt.customClass\"><button type=\"button\" class=\"w-100 btn-dp btn-dpbody\" ng-class=\"{'dp-selected': dt.selected, 'dp-active': isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"::{'dp-day-today': dt.current}\">{{::dt.label}}</span></button></td></tr></tbody></table>"
  );


  $templateCache.put('template/datepicker/popup.html',
    "<ul class=\"dropdown-menu\" ng-keydown=\"keydown($event)\"><li ng-transclude></li><li ng-if=\"showButtonBar\" class=\"dp-actions clearfix\"><button type=\"button\" class=\"btn btn-link\" ng-click=\"select('today')\">{{ getText('current') }}</button> <button type=\"button\" class=\"btn btn-link\" ng-click=\"close()\">{{ getText('close') }}</button></li></ul>"
  );


  $templateCache.put('template/datepicker/year.html',
    "<table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\" class=\"dp-table\"><thead><tr class=\"tr-dpnav\"><th><button type=\"button\" class=\"pull-left btn-dp\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"zmdi zmdi-long-arrow-left\"></i></button></th><th colspan=\"3\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"w-100 btn-dp\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><div class=\"dp-title\">{{title}}</div></button></th><th><button type=\"button\" class=\"pull-right btn-dp\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"zmdi zmdi-long-arrow-right\"></i></button></th></tr></thead><tbody><tr ng-repeat=\"row in rows track by $index\"><td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{::dt.uid}}\"><button type=\"button\" class=\"w-100 btn-dp btn-dpbody\" ng-class=\"{'dp-selected': dt.selected, 'dp-active': isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"::{'dp-day-today': dt.current}\">{{::dt.label}}</span></button></td></tr></tbody></table>"
  );


  $templateCache.put('template/pagination/pager.html',
    "<ul class=\"pager\"><li ng-class=\"{disabled: noPrevious(), previous: align}\"><a href ng-click=\"selectPage(page - 1, $event)\">Previous</a></li><li ng-class=\"{disabled: noNext(), next: align}\"><a href ng-click=\"selectPage(page + 1, $event)\">Next</a></li></ul>"
  );


  $templateCache.put('template/pagination/pagination.html',
    "<ul class=\"pagination\"><li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noPrevious()}\"><a href ng-click=\"selectPage(1, $event)\"><i class=\"zmdi zmdi-more-horiz\"><i></i></i></a></li><li ng-if=\"directionLinks\" ng-class=\"{disabled: noPrevious()}\"><a href ng-click=\"selectPage(page - 1, $event)\"><i class=\"zmdi zmdi-chevron-left\"></i></a></li><li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active}\"><a href ng-click=\"selectPage(page.number, $event)\">{{page.text}}</a></li><li ng-if=\"directionLinks\" ng-class=\"{disabled: noNext()}\"><a href ng-click=\"selectPage(page + 1, $event)\"><i class=\"zmdi zmdi-chevron-right\"></i></a></li><li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noNext()}\"><a href ng-click=\"selectPage(totalPages, $event)\"><i class=\"zmdi zmdi-more-horiz\"><i></i></i></a></li></ul>"
  );


  $templateCache.put('template/tabs/tabset.html',
    "<div class=\"clearfix\"><ul class=\"tab-nav\" ng-class=\"{'tn-vertical': vertical, 'tn-justified': justified, 'tab-nav-right': right}\" ng-transclude></ul><div class=\"tab-content\"><div class=\"tab-pane\" ng-repeat=\"tab in tabs\" ng-class=\"{active: tab.active}\" tab-content-transclude=\"tab\"></div></div></div>"
  );

}]);

'use strict';

vcancyApp
    .controller('adminDashbordCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_',
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _) {

            var vm = this;
            vm.totalUsers = 0;
            vm.totalProperty = 0;
            vm.totalUnit = 0;
            vm.totalVacant = 0;
            vm.totalApplication = 0;
            vm.totalShowingScheduled = 0;

            firebase.database().ref('users/').once("value", function (snapvalue) {
                var users = snapvalue.val();
                $scope.$apply(function () {
                    vm.totalUsers = _.size(users);
                });
            });

            firebase.database().ref('properties/').once("value", function (snapvalue) {
                var properties = snapvalue.val();
                $scope.$apply(function () {
                    vm.totalProperty = _.size(properties);

                    vm.totalUnit = _.reduce(properties, function (previousValue, currentValue, currentIndex) {
                        previousValue += _.size(currentValue.unitlists);
                        return previousValue;
                    }, 0);

                    vm.totalVacant = _.reduce(properties, function (previousValue, currentValue, currentIndex) {
                        previousValue += _.reduce(currentValue.unitlists, function (pv, cv, ci) {
                            if (cv.status === 'available' || cv.status === 'availablesoon') {
                                pv += 1;
                            }
                            return pv;
                        }, 0);
                        return previousValue;
                    }, 0);
                });

            });

            firebase.database().ref('submitapps/').once("value", function (snapvalue) {
                var application = snapvalue.val();
                $scope.$apply(function () {
                    vm.totalApplication = _.size(application);
                });
            });

            firebase.database().ref('applyprop/').once("value", function (snapvalue) {
                var scheduled = snapvalue.val();
                console.log(scheduled)
                $scope.$apply(function () {
                    vm.totalShowingScheduled = _.reduce(scheduled, function (pv, cv, ci) {
                        if (cv.schedulestatus == "scheduled" || cv.schedulestatus == "submitted") {
                            pv += 1;
                        }
                        return pv;
                    }, 0);
                });
            });

        }]);

'use strict';

vcancyApp 
    .controller('adminApplicationCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_', 'NgTableParams',
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _, NgTableParams) {

            var vm = this;
            var tenantID = '';
            var userData = {};
            var userEmail = '';

            var vm = this;
            vm.selectedUser = '';
            vm.statusChange = {};
            vm.usersList = [];
            vm.tenantID = '';
            vm.allUsers = {};

            firebase.database().ref('users/').once("value", function (snapvalue) {

                var users = snapvalue.val();
                vm.allUsers = users;
                //  console.log('users', users, Object.keys(users).length);
                users = _.filter(users, function (user, key) {
                    if (user.usertype == 0) {
                        user.key = key;
                        return true;
                    }
                });
                $scope.$apply(function () {
                    vm.usersList = users;
                });
            });

            vm.submittedappsavail = 0;
            $scope.reverseSort = false;
            vm.submitappsdata = [];

            vm.getPendingApplications = function () {
                firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function (snapshot) {
                    // console.log(snapshot.val())
                    $scope.$apply(function () {
                        if (snapshot.val() != null) {
                            vm.pendingappsavail = 0;
                            if ($rootScope.$previousState.name == "rentalform") {
                                $state.reload();
                            }
                            vm.tabledata = $.map(snapshot.val(), function (value, index) {
                                if (value.schedulestatus == "scheduled") { // && moment(value.dateslot).isBefore(new Date())
                                    vm.pendingappsavail = 1;
                                    var units = '';
                                    if (value.unitID === ' ' || !value.unitID) {
                                        units = '';
                                    } else {
                                        units = value.unitID + " - ";
                                    }
                                    return [{ applicationID: 0, scheduleID: index, address: units + value.address, dateslot: value.dateSlot, timerange: value.timeRange, schedulestatus: value.schedulestatus }];
                                }
                            });

                            // console.log(vm.tabledata);
                            angular.forEach(vm.tabledata, function (schedule, key) {
                                firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function (snap) {
                                    // console.log(snap.val());
                                    $scope.$apply(function () {
                                        if (snap.val() != null) {
                                            $.map(snap.val(), function (val, k) {
                                                vm.tabledata[key].applicationID = k;
                                            });
                                        }
                                    });
                                });
                            });

                            // console.log(vm.tabledata);

                            vm.extracols = [
                                { field: "scheduleID", title: "", show: true }
                            ];


                            vm.cols = [
                                { field: "address", title: "Address", sortable: "address", show: true },
                                { field: "dateslot", title: "Viewed On", sortable: "dateslot", show: true }
                            ];

                            vm.loader = 0;

                            //Sorting
                            vm.tableSorting = new NgTableParams({
                                sorting: { address: 'asc' }
                            },

                                {
                                    dataset: vm.tabledata
                                })
                        }


                        if (snapshot.val() != null) {
                            $.map(snapshot.val(), function (val, key) {
                                firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(key).once("value", function (snap) {
                                    $scope.$apply(function () {
                                        if (snap.val() !== null) {
                                            //to map the object to array
                                            $.map(snap.val(), function (value, index) {
                                                if (val.externalappStatus == "submit") {
                                                    vm.submittedappsavail = 1;
                                                    vm.submitappsdata.push({ appID: index, address: value.address, dated: moment(value.dated).format("DD-MMMM-YYYY"), rentalstatus: value.rentalstatus });
                                                }
                                            });
                                        }
                                    });
                                });
                            });

                            vm.submitappsextracols = [
                                { field: "appID", title: "", show: true }
                            ];

                            vm.submitappscols = [
                                { field: "address", title: "Address", sortable: "address", show: true },
                                { field: "dated", title: "Submitted On", sortable: "dated", show: true },
                            ];

                            //Sorting
                            vm.submitappsSorting = new NgTableParams({
                                sorting: { address: 'asc' },
                                count: vm.submitappsdata.length
                            },

                                {
                                    dataset: vm.submitappsdata
                                });
                        }

                    });
                });
            }

            vm.getSubmitedApps = function () {
                firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).once("value", function (snapshot) {
                    $scope.$apply(function () {
                        if (snapshot.val() != null) {
                            $.map(snapshot.val(), function (value, key) {
                                if (value.scheduleID != 0 && value.externalappStatus == "submit") {
                                    vm.submittedappsavail = 1;
                                    vm.submitappsdata.push({ appID: key, address: value.address, dated: moment(value.dated).format("DD-MMMM-YYYY"), rentalstatus: value.rentalstatus });
                                }
                            });
                            vm.submitappsextracols = [
                                { field: "appID", title: "", show: true }
                            ];

                            vm.submitappscols = [
                                { field: "address", title: "Address", sortable: "address", show: true },
                                { field: "dated", title: "Submitted On", sortable: "dated", show: true },
                            ];

                            //Sorting
                            vm.submitappsSorting = new NgTableParams({
                                sorting: { address: 'asc' },
                                count: vm.submitappsdata.length
                            },

                                {
                                    dataset: vm.submitappsdata
                                })
                        }

                    });
                });

                if (vm.submittedappsavail == 0) {
                    // vm.submitappsdata.push({scheduleID:'', name:'', age: '', profession: '',salary: '', pets: '', maritalstatus:'', appno:'',  schedulestatus: ''});
                } else {
                    vm.loader = 0;
                }

                if (vm.pendingappsavail == 0) {
                    // vm.tabledata.push({scheduleID:'', address:'', dateslot: '', timerange: '',  schedulestatus: ''});
                } else {
                    vm.loader = 0;
                }
            }

            vm.selectUser = function () {
                vm.loader = 1;
                tenantID = vm.selectedUser;
                userData = vm.allUsers[tenantID];
                userEmail = userData.email;
                vm.getPendingApplications();
                vm.getSubmitedApps();
            };

            vm.email = '';
            vm.disablebutton = 1;
            vm.emailrequired = function (event) {
                if (vm.email == '' || !vm.email.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/)) {
                    vm.disablebutton = 1;
                } else {
                    vm.disablebutton = 0;
                }
            }

            vm.openRentalForm = function () {
                $rootScope.isFormOpenToSaveInDraft = true;

                window.location.href = "#/adminrentalform/"+vm.selectedUser+"/0/0";
            }

            vm.requestCreditReport = function () {
                swal({
                    title: "",
                    text: "We will send you an email with instructions on how to get your credit report.\n Are you sure you want to submit this request?",
                    type: "info",
                    showCancelButton: true,
                    confirmButtonClass: "bgm-teal",
                    confirmButtonText: "Yes",
                    closeOnConfirm: false
                }, function () {
                    // swal("Deleted!", "Your imaginary file has been deleted.", "success");
                    var userName = '';
                    if (userData) {
                        userName = userData.firstname + ' ' + (userData.lastname || '');
                    }
                    var emailData = '<p>Hello, </p><p>' + userName + '- ' + userEmail + ' has requested for credit report from the tenant portal';
                    var toEmail = 'creditrequest@vcancy.com';
                    emailSendingService.sendEmailViaNodeMailer(toEmail, 'Tenant Request for Credit Report', 'Request Credit Report', emailData);
                    swal("", "Your request has been submitted successfully, you will soon receive an email.", "success");
                });

            }

            vm.gotoRental = function (event) {
                if (vm.disablebutton == 0) {
                    $rootScope.renterExternalEmail = vm.email;
                    window.location.href = "#/adminrentalform/0/0";
                }
            }


        }]);

'use strict';

vcancyApp
    .controller('adminBillingCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_',
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _) {

            var vm = this;
            var landlordID = localStorage.getItem('userID');
            vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;

        }]);

'use strict';

vcancyApp
    .controller('adminPeoplesCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', 'emailSendingService', '$stateParams', '$window', '_', '$q', '$uibModal',
        function ($scope, $firebaseAuth, $state, $rootScope, emailSendingService, $stateParams, $window, _, $q, $uibModal) {

            var vm = this;
            // var landlordID = localStorage.getItem('userID');
            vm.selectedUser = '';
            vm.usersList = {};
            vm.userData = {};
            $scope.loader = 0;

            firebase.database().ref('users/').once("value", function (snapvalue) {

                var users = snapvalue.val();
                //  console.log(users);
                //  console.log('users', users, Object.keys(users).length);
                vm.allUsers = snapvalue.val();
                //  console.log( vm.allUsers);
                users = _.filter(users, function (user, key) {
                    if (user.usertype == 1 || user.usertype == 3) {
                        user.key = key;
                        return true;
                    }
                });
                $scope.$apply(function () {
                    vm.usersList = users;
                    //      console.log(users);
                });
            });

            vm.getScheduleListing = function () {
                vm.userData = vm.allUsers[vm.selectedUser];
                //    console.log(vm.userData)
                vm.landlordID = vm.selectedUser;
                vm.init(vm.selectedUser);
            }

            vm.propcheck = [];
            vm.applyPropUsers = {};
            vm.applyPropSubmittedUsers = {};
            vm.apppropaddress = [];
            vm.apppropaddressAppl = {};
            vm.submittedAppl = [];
            vm.submittedApplUsers = [];

            vm.originalPropAddress = [];
            vm.loader = 0;
            vm.creditCheck = {
                reportType: "Both of the above $45/Report",
                forTenant: ''
            }
            vm.customRentalApplicationCheck = {};
            vm.customRentalApplicationCheck.TCData = 'You are authorized to obtaining credit checks & verifying details contained in this Application.' +

                'This unit/s is strictly NON SMOKING. This offer is subject to acceptance by the landlord/property' +
                'management company that listed the property.This application is made on the understanding that no ' +
                'betterments will be provided to the Rental Unit except those which may be specifically requested in' +
                'this Application and agreed to in writing by the Landlord and specified in a tenancy agreement.' +

                'It is understood that this application will not be processed unless fully completed.' +

                'If the landlord/property management company accepts this Application, we will sign a Fixed ' +
                'Term Tenancy Agreement at the offices of the property management company or in person with' +
                'the landlord and pay the security deposit. The Rental Unit will not be considered rented' +
                'until the Fixed Term Tenancy Agreement is signed by the Tenant and the Landlord.' +

                'We will ensure that the collection, use, disclosure and retention of information will comply with ' +
                'the provisions of the Freedom of information and Protection of Privacy Act. ' +
                'Information will be collected and used only as necessary and for the intended purpose and will ' +
                'not be disclosed as required by law.' +

                'I hereby state that the information contained herein is true and I authorize my References' +
                'as listed above to release information regarding my employment and/or past/current tenancies.' +

                'Tenants are not chosen on a first come – first served basis. We choose the most suitable ' +
                'application for the unit at our sole discretion. This application form is to be used only' +
                'in the interested of the owner of the rental unit.';
            // Function to generate Random Id
            function generateToken() {
                var result = '',
                    length = 6,
                    chars = 'ABCEDFGHIJKLMNOPQRSTUVWXYZ0123456789';

                for (var i = 0; i < length; i++)
                    result += chars[Math.floor(Math.random() * chars.length)];

                return result;
            }
            vm.selectedApplication = '';
            vm.uploadCreditCheckReportModal = function (key) {
                vm.selectedApplication = key;
            };


            $scope.uploadDetailsImages = function (event) {

                var filesToUpload = event.target.files;
                var file = filesToUpload[0];
                $scope.$apply(function () {
                    $scope.loader = 1;
                })

                if (file) {
                    var filename = moment().format('YYYYMMDDHHmmss') + file.name;
                    filename = filename.replace(/\s/g, '');
                    AWS.config.update({
                        accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
                        secretAccessKey: 'xnuyOZTMm9HgORhcvg2YTILIZVD6kHsjLL6TIkLi'
                    });
                    AWS.config.region = 'ca-central-1';

                    var bucket = new AWS.S3({
                        params: {
                            Bucket: 'vcancy-final'
                        }
                    });

                    var params = {
                        Key: 'property-images/' + filename,
                        ContentType: file.type,
                        Body: file,
                        StorageClass: "STANDARD_IA",
                        ACL: 'public-read'
                    };
                    bucket.upload(params).on('httpUploadProgress', function (evt) {

                    })
                        .send(function (err, data) {
                            // console.log(vm.selectedApplication);
                            firebase.database().ref('applyprop/' + vm.selectedApplication).update({
                                creditCheckLink: data.Location
                            }).then(function () {
                                // vm.getApplyProp(vm.landlordID);
                                $scope.loader = 0;
                                vm.apppropaddress[vm.selectedApplication].creditCheckLink = data.Location;
                                var emailData = '<p>Hello, </p><p>A credit/criminal check report for user <b>' + vm.userData.name + ' (' + vm.userData.email + ')</b> is available now, please <a href="https://vcancy.com/login" target="_blank">log in</a> to your dashboard and go to the "People" menu.</p><p>Thanks,</p><p>Team Vcancy</p>';
                                // console.log(emailData);
                                // Send Email
                                emailSendingService.sendEmailViaNodeMailer(vm.userData.email, 'Creditcheck request', 'Creditcheck request', emailData);
                            })
                                .catch(function (err) {
                                    // console.error('ERROR', err);
                                    swal("", "There was error deleteing the schedule.", "error");
                                });
                        })
                }
            };

            vm.removeCreditCheckReport = function (key) {
                firebase.database().ref('applyprop/' + key).update({
                    creditCheckLink: ''
                }, function () {
                    $scope.$apply(function () {
                        vm.apppropaddress[key].creditCheckLink = '';
                    })
                });
            };

            vm.questionDropDown = [
                { id: 'WKRX6Q', label: 'What is your profession?', isChecked: true },
                { id: 'MV5SML', label: 'Do you have Pets? Provide details', isChecked: true },
                { id: 'N1F5MO', label: 'Are you able to provide references?', isChecked: false },
                { id: 'OU489L', label: 'Why are you moving?', isChecked: false },
                { id: 'U0G6V8', label: 'Tell me a bit about yourself', isChecked: true },
                { id: 'A9OG32', label: 'No. of Applicants', isChecked: true },
                { id: 'UH7JZS', label: 'Do you smoke?', isChecked: true },
                { id: 'ZGJQ60', label: 'Move-in date', isChecked: true },
            ];

            vm.filters = {
                options: [],
            };

            vm.defaultRentalApplicationCheck = {
                'PAPPD': true,
                'CADDR': true,
                'PADDR': false,
                'AAPPD': false,
                'AAPP1': false,
                'AAPP2': false,
                'ESIV': true,
                'ESIV1': true,
                'V1': false,
                'EC': false,
                'EC1': false,
                'REF': true,
                'REF1': true,
                'REF2': false,
                'UD': true,
                'UDAAPP': false,
                'TC': true,
                'TCData': vm.customRentalApplicationCheck.TCData
            }

            function refreshCustomRentalApplicationCheck() {
                var userData = vm.userData;
                if (userData && userData.customRentalApplicationCheck) {
                    if (userData.customRentalApplicationCheck && !userData.customRentalApplicationCheck.TCData) {
                        userData.customRentalApplicationCheck.TCData = vm.customRentalApplicationCheck.TCData;
                    }
                    vm.customRentalApplicationCheck = userData.customRentalApplicationCheck;
                } else {
                    vm.customRentalApplicationCheck = angular.copy(vm.defaultRentalApplicationCheck);
                }
            }
            refreshCustomRentalApplicationCheck();

            function refreshScreeningQuestions() {
                var userData = vm.userData;
                if (userData && userData.screeningQuestions && userData.screeningQuestions.length !== 0) {
                    vm.screeningQuestions = userData.screeningQuestions;
                } else {
                    vm.screeningQuestions = angular.copy(vm.questionDropDown);
                }
            }

            vm.getUsers = function () {
                if (vm.apppropaddressList) {
                    vm.loader = 1;
                    var promises = [];
                    _.map(vm.apppropaddressList, function (value, key) {
                        var promiseObj = firebase.database().ref('users/' + value.tenantID).once("value");
                        promises.push(promiseObj);
                    });
                    $q.all(promises).then(function (data) {
                        var usersData = {};
                        data.forEach(function (dataObj) {
                            usersData[dataObj.key] = dataObj.val();
                        });
                        vm.applyPropUsers = usersData;
                        _.forEach(vm.submittedApplUsers, function (value, index) {
                            if (usersData[value]) {
                                vm.applyPropSubmittedUsers[value] = usersData[value];
                            }
                        });
                        vm.apppropaddress = vm.apppropaddressList;
                        vm.loader = 0;
                    });
                }
            }

            vm.getProperty = function (selectedUser) {
                vm.loader = 1;
                var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(selectedUser).once("value", function (snapshot) {
                    if (snapshot.val()) {
                        vm.properties = snapshot.val();
                    }
                    vm.loader = 0;
                });
            };

            vm.getApplyProp = function (selectedUser) {
                vm.loader = 1;
                vm.apppropaddress = {};
                var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(selectedUser).once("value", function (snapshot) {
                    if (snapshot.val()) {
                        $scope.$apply(function () {
                            vm.apppropaddressList = snapshot.val();
                            // vm.getUsers();
                            vm.originalPropAddress = angular.copy(snapshot.val());
                            vm.loader = 1;
                            var promises = [];
                            _.map(vm.apppropaddressList, function (value, key) {
                                if (value.schedulestatus == 'submitted') {
                                    vm.submittedApplUsers.push(value.tenantID);
                                    var promiseObj = firebase.database().ref('submitapps/').limitToLast(1).orderByChild("scheduleID").equalTo(key).once("value");
                                    promises.push(promiseObj);
                                }
                            });
                            vm.submittedApplUsers = _.uniq(vm.submittedApplUsers);

                            $q.all(promises).then(function (data) {
                                var usersData = {};
                                data.forEach(function (dataObj) {
                                    if (dataObj.val()) {
                                        _.forEach(dataObj.val(), function (_value, _key) {
                                            vm.apppropaddressAppl[_key] = _value;
                                            vm.submittedAppl.push(_value)
                                        })
                                    }
                                });
                                //vm.getUsers();
                                vm.loader = 0;
                            });
                            // console.log(vm.apppropaddressList);
                        });
                    }
                    $scope.$apply(function () {
                        vm.loader = 0;
                    });
                });
            };

            vm.companyDetail = function () {
                return vm.userData.companyname + ' ' + (',' + vm.userData.contact || '')
            }

            vm.getUserName = function (id, value) {
                if (!vm.applyPropUsers[id]) {
                    return value.name || '-';
                }
                return ((vm.applyPropUsers[id].firstname || '') + ' ' + (vm.applyPropUsers[id].lastname || '')) || '-';
            }

            vm.changeSort = function (key) {
                // $scope.$apply(function() {
                // $timeout	
                vm.sortType = key;
                vm.sortReverse = !vm.sortReverse;
                // });
            }

            $scope.formatDay = function (key) {
                return moment(key, 'MM/DD/YYYY').format('ddd')
            };

            $scope.formatDate = function (key) {
                return moment(key, 'MM/DD/YYYY').format('MMM DD')
            };

            vm.init = function (selectedUser) {
                vm.landlordID = selectedUser;
                vm.getProperty(selectedUser);
                vm.getApplyProp(selectedUser);
                // console.log(selectedUser)
                refreshScreeningQuestions();
            };

            // vm.init();

            vm.openPrescremingQuestions = function () {
                vm.prescremingQuestion = $uibModal.open({
                    templateUrl: 'prescremingquestions.html',
                    backdrop: 'static',
                    size: 'lg',
                    scope: $scope
                });
            };
            vm.filterData = function (forProperty) {
                var properties = angular.copy(vm.originalPropAddress);
                vm.apppropaddress = properties;
                if (vm.filters.property) {
                    var obj = {};
                    _.filter(properties, function (value, key) {
                        if (value.propID == vm.filters.property) {
                            obj[key] = value;
                        }
                    });
                    vm.apppropaddress = obj;
                }
                if (forProperty) {
                    vm.filters.unit = [];
                }
                if (vm.filters.unit && vm.filters.unit.length > 0) {
                    var unitItems = {};
                    var unitIds = _.reduce(vm.filters.unit, function (previousValue, currentValue, key) {
                        if (currentValue.unit) {
                            previousValue.push(parseInt(currentValue.unit));
                        }
                        return previousValue;
                    }, []);
                    _.filter(properties, function (value, key) {
                        if (value.propID == vm.filters.property && unitIds.includes(parseInt(value.unitID))) {
                            unitItems[key] = value;
                        }
                    });
                    vm.apppropaddress = unitItems;
                    return
                }

                vm.apppropaddress = obj;
            }

            vm.getApplicationLink = function (key) {
                var data;
                _.forEach(vm.apppropaddressAppl, function (_value, _key) {
                    if (_value.scheduleID == key) {
                        data = _key;
                        return false;
                    }
                });
                if (data) {
                    var host = window.location.origin;
                    if (host.indexOf('localhost') > -1) {
                        host = host + '/#/viewapplication/' + data;
                    } else {
                        host = host + '/login/#/viewapplication/' + data;
                    }
                    return host;
                }
                return false;
            }

            vm.getRentalField = function (key, field) {
                let data;
                _.forEach(vm.apppropaddressAppl, function (_value, _key) {
                    if (_value.scheduleID == key) {
                        data = _value;
                        return false;
                    }
                });
                if (data) {
                    return data[field]
                } else {
                    return '-'
                }
            }
            vm.customQuestion = null;
            vm.addCustomQuestion = function () {
                if (!vm.customQuestion) {
                    return;
                }
                var data = {
                    label: vm.customQuestion,
                    id: generateToken(),
                    isChecked: false
                }

                vm.screeningQuestions.push(data);
                vm.customQuestion = null;
            }

            vm.saveScreeningQuestions = function () {
                vm.loader = 1;
                var ques = angular.copy(vm.screeningQuestions);
                _.omit(ques, '$$hashKey');
                firebase.database().ref('users/' + vm.selectedUser).update({
                    screeningQuestions: ques
                }).then(function () {
                    // userData.screeningQuestions = ques;
                    ///localStorage.setItem('userData', JSON.stringify(userData));
                    refreshScreeningQuestions();
                    vm.loader = 0;
                    vm.prescremingQuestion.close();
                }, function (error) {
                    vm.loader = 0;
                    return false;
                });
            }

            vm.saveCustomRentalApplicationCheck = function () {
                vm.loader = 1;
                var customChecks = angular.copy(vm.customRentalApplicationCheck);
                _.omit(customChecks, '$$hashKey');
                firebase.database().ref('users/' + vm.selectedUser).update({
                    customRentalApplicationCheck: customChecks
                }).then(function () {
                    //vauserData.customRentalApplicationCheck = customChecks;
                    //localStorage.setItem('userData', JSON.stringify(userData));
                    refreshCustomRentalApplicationCheck();
                    vm.loader = 0;
                    vm.customrentalapp.close();
                }, function (error) {
                    vm.loader = 0;
                    return false;
                });
            }

            vm.opencustomrentalapp = function () {
                vm.customrentalapp = $uibModal.open({
                    templateUrl: 'customrentalapp.html',
                    backdrop: 'static',
                    size: 'lg',
                    scope: $scope
                });
            };

            vm.deleteQuestionById = function (id) {
                var index = vm.screeningQuestions.findIndex(function (ques) {
                    if (ques.id == id) return true;
                });
                vm.screeningQuestions.splice(index, 1);
            };


            vm.openruncreditcriminalcheck = function () {
                vm.runcreditcriminalcheck = $uibModal.open({
                    templateUrl: 'runcreditcriminalcheck.html',
                    backdrop: 'static',
                    size: 'lg',
                    scope: $scope
                });
            };

            $scope.closePrescreeningModal = function () {
                vm.prescremingQuestion.close();
            }

            $scope.closecustomrentalappModal = function () {
                vm.customrentalapp.close();
            }

            $scope.closeruncreditcriminalcheckModal = function () {
                vm.runcreditcriminalcheck.close();
                vm.creditCheck = {
                    reportType: "Both of the above $45/Report",
                    forTenant: ''
                }
            }

            $scope.submitCreditCheck = function () {
                var tenantData = vm.applyPropUsers[vm.creditCheck.forTenant];
                if (!tenantData) {
                    return;
                }
                swal({
                    title: "Are you sure?",
                    text: "Your account will be charged with the amount specified.",
                    type: "info",
                    showCancelButton: true,
                    confirmButtonClass: "bgm-teal",
                    confirmButtonText: "Yes",
                    closeOnConfirm: false
                },
                    function () {
                        var userName = '';
                        if (userData) {
                            userName = userData.firstname + ' ' + (userData.lastname || '');
                        }
                        var tenantUserName = tenantData.firstname + ' ' + (tenantData.lastname || '');
                        var emailData = '<p>Hello, </p><p>Landlord - ' + userName + ' (' + userEmail + ') has requested credit report of tenant - ' + tenantUserName + ' (' + tenantData.email + ') for type - ' + vm.creditCheck.reportType + '</p>';
                        var toEmail = 'creditrequest@vcancy.com';
                        emailSendingService.sendEmailViaNodeMailer(toEmail, 'Landlord request for Credit/Criminal Report', 'Request Credit?criminal Check Report', emailData);
                        swal("", "Your request has been submitted successfully!", "success");
                        var requestData = {
                            tenantID: vm.creditCheck.forTenant,
                            tenantEmail: tenantData.email,
                            landlordID: landlordID,
                            landlordEmail: userEmail,
                            requestType: vm.creditCheck.reportType,
                            requestedOn: moment().format('x'),
                            status: 'PENDING'
                        }
                        firebase.database().ref('credit_report_request/').push().set(requestData);
                        $scope.closeruncreditcriminalcheckModal();
                    });

            }

            vm.tablefilterdata = function (propID = '') {
                if (propID != '') {
                    vm.propcheck[propID] = !vm.propcheck[propID];
                }
                vm.loader = 1;
                firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
                    // console.log(snapshot.val())
                    $scope.$apply(function () {
                        if (snapshot.val() != null) {
                            $.map(snapshot.val(), function (value, index) {
                                if (vm.apppropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus == "submitted") {
                                    vm.apppropaddress.push({ propID: value.propID, address: value.address, units: value.units });
                                    vm.propcheck[value.propID] = true;
                                }
                            });
                        }
                        vm.submitappsdata = [];

                        if (snapshot.val() != null) {
                            vm.submittedappsavail = 0;
                            //to map the object to array
                            vm.submitappsdata = $.map(snapshot.val(), function (value, index) {
                                if (vm.propcheck[value.propID] == true || propID == '') {
                                    if (value.schedulestatus == "submitted") {
                                        vm.submittedappsavail = 1;
                                        return [{ scheduleID: index, name: value.name, age: value.age, profession: value.jobtitle, schedulestatus: value.schedulestatus }];
                                    }
                                }
                            });

                            angular.forEach(vm.submitappsdata, function (schedule, key) {
                                firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function (snapshot) {
                                    $scope.$apply(function () {
                                        if (snapshot.val()) {
                                            $.map(snapshot.val(), function (value, index) {
                                                vm.submitappsdata[key].applicationID = index;
                                                vm.submitappsdata[key].pets = value.pets;
                                                vm.submitappsdata[key].maritalstatus = value.maritalstatus;
                                                vm.submitappsdata[key].appno = value.applicantsno;
                                                firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(index).once("value", function (snap) {
                                                    $scope.$apply(function () {
                                                        if (snap.val()) {
                                                            $.map(snap.val(), function (v, k) {
                                                                // console.log(v);
                                                                vm.submitappsdata[key].salary = v.mainapplicant.appgrossmonthlyincome;
                                                            });
                                                        }
                                                    });
                                                });
                                            });
                                        }
                                    });
                                });
                            });

                            vm.submitappsextracols = [
                                { field: "applicationID", title: "Credit Score", show: true }
                            ];


                        } else {
                            vm.submitappsdata = [{ scheduleID: '', name: '', age: '', profession: '', salary: '', pets: '', maritalstatus: '', appno: '', schedulestatus: '' }];

                            vm.submittedappsavail = 0;
                        }

                        //  console.log(vm.submittedappsavail);
                        vm.submitappscols = [
                            { field: "name", title: "Name", sortable: "name", show: true },
                            { field: "age", title: "Age", sortable: "age", show: true },
                            { field: "profession", title: "Job Title", sortable: "profession", show: true },
                            { field: "salary", title: "Salary", sortable: "salary", show: true },
                            { field: "pets", title: "Pets", sortable: "pets", show: true },
                            { field: "maritalstatus", title: "Marital Status", sortable: "maritalstatus", show: true },
                            { field: "appno", title: "No of Applicants", sortable: "appno", show: true },
                        ];

                        vm.loader = 0;

                        //Sorting
                        vm.submitappsSorting = new NgTableParams({
                            sorting: { name: 'asc' }
                        },

                            {
                                dataset: vm.submitappsdata
								/*}, {
									total: vm.submitappsdata.length, // length of data
									getData: function($defer, params) {
										// console.log(params);
										// use build-in angular filter
										var orderedData = params.sorting() ? $filter('orderBy')(vm.submitappsdata, params.orderBy()) : vm.submitappsdata;
							
										$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
									}*/
                                // dataset: vm.submitappsdata
                            })
                    });
                });

            }
            // vm.tablefilterdata();

            vm.deleteApplyProp = function (key) {
                swal({
                    title: "Are you sure?",
                    text: "This will delete the schedule from the system.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "Delete",
                    closeOnConfirm: true
                }, function () {
                    firebase.database().ref('applyprop/' + key).update({
                        schedulestatus: "cancelled"
                    }).then(function () {
                        vm.getApplyProp(vm.landlordID);
                    })
                        .catch(function (err) {
                            //   console.error('ERROR', err);
                            swal("", "There was error deleteing the schedule.", "error");
                        });

                });
            }

        }]);

'use strict';

vcancyApp.controller('adminPropertyCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'slotsBuildService', 'emailSendingService', '$http', '$location', '$log', '$uibModal', '$q'
    , function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, slotsBuildService, emailSendingService, $http, $location, $log, $uibModal, $q) {

        var vm = this;
        var landlordID = '';
        vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;

        var vm = this;
        vm.selectedUser = '';
        vm.statusChange = {};
        vm.usersList = [];
        vm.mode = 'Add';
        firebase.database().ref('users/').once("value", function (snapvalue) {

            var users = snapvalue.val();
            //  console.log('users', users, Object.keys(users).length);
            users = _.filter(users, function (user, key) {
                if (user.usertype == 1 || user.usertype == 3) {
                    user.key = key;
                    return true;
                }
            });
            $scope.$apply(function () {
                vm.usersList = users;
            });
        });



        $rootScope.invalid = '';
        $rootScope.success = '';
        $rootScope.error = '';
        $rootScope.message = '';

        var todaydate = new Date();
        var dateconfig = new Date(new Date().setMinutes(0));
        var url = $location.absUrl();
        var oldtimeSlotLen = 0;

        var swal = window.swal;

        var vm = this;
        vm.propsavail = 1;
        vm.timeslotmodified = "false";
        vm.isDisabled = false;
        vm.googleAddress = 0;
        vm.more = '';
        vm.city = '';
        vm.province = '';
        vm.postcode = '';
        vm.country = '';
        vm.noofunits = 0;
        vm.checkedRow = {};
        $scope.imageCount = 0;
        $scope.loader = 0;
        // $scope.unitVacant = [];

        vm.table = 1;
        vm.csv = 0;
        vm.localpropID = '';

        // View Property
        vm.getProperties = function (landlordID) {
            var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
                $scope.$apply(function () {
                    vm.success = 0;
                    if (snapshot.val()) {
                        var props = angular.copy(snapshot.val());
                        var vacantSums = {};
                        _.forEach(props, function (prop, key) {
                            vacantSums[key] = _.sumBy(prop.unitlists, function (o) {
                                if (!o.status || o.status == 'available') {
                                    return 1;
                                }
                            });
                        })
                        vm.vacantSums = vacantSums;
                        vm.viewprops = snapshot.val();

                        vm.propsavail = 1;
                        vm.propsuccess = localStorage.getItem('propertysuccessmsg');
                    } else {
                        vm.propsavail = 0;
                        vm.propsuccess = localStorage.getItem('propertysuccessmsg');
                    }
                    $scope.loader = 0;
                    // console.log($rootScope.$previousState.name);
                    if (($rootScope.$previousState.name == "admineditprop" || $rootScope.$previousState.name == "addprop") && vm.propsuccess != '') {
                        vm.success = 1;
                    }
                    localStorage.setItem('propertysuccessmsg', '')
                });

            });
        }
        vm.getPropertiesListing = function () {
            landlordID = vm.selectedUser;
            localStorage.setItem('adminLandlordId', landlordID);
            vm.getProperties(vm.selectedUser);
        }
        vm.getarray = function (num) {
            var data = [];
            for (var i = 0; i <= num - 1; i++) {
                data.push(i);
            }
            return data;
        }

        vm.addresschange = function () {
            /*  console.log(vm.prop.address);*/
            if (vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)) {
                vm.isDisabled = false;
            } else {
                vm.isDisabled = true;
            }
        }
        this.unitsOptional = function (proptype) {
            console.log(vm.prop.units);
            if (vm.prop.proptype == proptype && (vm.prop.units == '' || vm.prop.units == undefined)) {
                vm.prop.units = ' ';
            } else if (vm.prop.proptype != proptype && (vm.prop.units == '' || vm.prop.units == undefined)) {
                vm.prop.units = '';
            }
        };

        vm.getListings = function (landlordId) {
            vm.loader = 1;
            if (!landlordId) {
                landlordId = vm.selectedUser;
            }
            if (!landlordId) return;

            var propdbObj = firebase.database().ref('propertiesSchedule/').orderByChild("landlordID").equalTo(landlordId).once("value", function (snapshot) {
                vm.getProperties(landlordId);
                // console.log('propertyschedule', snapshot.val())
                $scope.$apply(function () {
                    vm.success = 0;
                    if (snapshot.val()) {
                        vm.listings = snapshot.val();
                        vm.generateMergeListing();
                        vm.listingsAvailable = 1;
                    } else {
                        vm.listingsAvailable = 0;
                    }
                    vm.loader = 0;
                });
            });
        }

        var landlordID = ''
        landlordID = localStorage.getItem('adminLandlordId')
        if (!landlordID) return;

        firebase.database().ref('users/' + landlordID).once("value", function (snap) {
            vm.landlordname = snap.val().firstname + " " + snap.val().lastname;
        });

        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
            var address = vm.prop.address.getPlace();
            var arrAddress = address.address_components;
            vm.googleAddress = 1;
            vm.prop.address = address.formatted_address;

            var itemRoute = '';
            var itemLocality = '';
            var itemCountry = '';
            var itemPc = '';
            var itemSnumber = '';
            var street_number = '';

            $.each(arrAddress, function (i, address_component) {
                if (address_component.types[0] == "street_number") {
                    itemSnumber = address_component.long_name;
                    street_number += address_component.long_name + " ";
                }

                if (address_component.types[0] == "route") {
                    itemRoute = address_component.long_name;
                    var route = address_component.long_name;
                    vm.prop.address = street_number + address_component.long_name;
                }

                if (address_component.types[0] == "administrative_area_level_1") {
                    itemRoute = address_component.short_name;
                    vm.prop.province = address_component.short_name;
                }

                if (address_component.types[0] == "locality") {
                    itemLocality = address_component.long_name;
                    vm.prop.city = address_component.long_name;
                }

                if (address_component.types[0] == "country") {
                    itemCountry = address_component.long_name;
                    vm.prop.country = address_component.long_name;
                }

                if (address_component.types[0] == "postal_code_prefix") {
                    itemPc = address_component.long_name;
                }


                if (address_component.types[0] == "postal_code") {
                    itemSnumber = address_component.long_name;

                    vm.prop.postcode = address_component.long_name;
                }

                if (address_component.types[0] == "sublocality_level_1") {
                    itemRoute = address_component.long_name;
                    vm.prop.address = address_component.long_name;

                }

            });


            vm.addresschange();
            $scope.$apply();
        });

        vm.copy = "Copy Link";
        $scope.copySuccess = function (e) {
            vm.copy = "Copied";
            $scope.$apply();
        };

        vm.csvform = function () {
            vm.table = 0;
            vm.csv = 1;

        }

        vm.doSomething = function () {
            console.log("Form Edit changes something");
        }
        // timeSlot for Date and Timepicker
        vm.addTimeSlot = function (slotlen) {

            for (var i = 0; i < slotlen; i++) {
                vm.newTime = false;
            }

            vm.timeSlot.push({
                date: dateconfig
            });
            vm.prop.multiple[slotlen] = true;
            vm.newTime = true;

        }

        // to remove timeslots
        vm.removeTimeSlot = function (slotindex) {
            if (vm.timeSlot.length == 1) {

            } else {
                if ($state.current.name == 'admineditprop') {
                    if ($window.confirm("Are you sure you want to delete this viewing slot? ")) {
                        if (slotindex < oldtimeSlotLen) {
                            vm.timeslotmodified = "true";
                        }
                        vm.timeSlot.splice(slotindex, 1);
                        vm.prop.date.splice(slotindex, 1);
                        vm.prop.fromtime.splice(slotindex, 1);
                        vm.prop.to.splice(slotindex, 1);
                        vm.prop.limit.splice(slotindex, 1);
                        vm.prop.multiple.splice(slotindex, 1);
                    }
                } else {
                    vm.timeSlot.splice(slotindex, 1);
                    vm.prop.date.splice(slotindex, 1);
                    vm.prop.fromtime.splice(slotindex, 1);
                    vm.prop.to.splice(slotindex, 1);
                    vm.prop.limit.splice(slotindex, 1);
                    vm.prop.multiple.splice(slotindex, 1);
                }
            }

        }
        // DATEPICKER
        vm.today = function () {
            vm.dt = new Date();
        };
        vm.today();

        vm.toggleMin = function () {
            vm.minDate = vm.minDate ? null : new Date();
        };
        vm.toggleMin();

        vm.open = function ($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            angular.forEach(vm.timeSlot, function (value, key) {
                value.opened = false;
            });
            opened.opened = true;
        };

        vm.units = function (value) {

            if (value != '' && value != null) {
                $window.location.href = '#/addunits/' + value;
            }
        };

        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        vm.format = vm.formats[0];

        vm.timeopen = function ($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            angular.forEach(vm.timeSlot, function (value, key) {
                value.opened = false;
            });
            vm.opened = true;
        };

        //  TIMEPICKER
        vm.mytime = new Date();
        vm.ck = [];
        vm.getNumber = function (num) {
            vm.ck = new Array(num);
            console.log(vm.ck);
            return vm.ck;
        }

        vm.arraytest = function () {

            var listToDelete = ['abc', 'efg'];

            var arrayOfObjects = [{ id: 'abc', name: 'oh' }, // delete me
            { id: 'efg', name: 'em' }, // delete me
            { id: 'hij', name: 'ge' }] // all that should remain
            console.log(arrayOfObjects);
            //var animals = [{"status":"Available"},{"status":"Available"},{"status":"Available"},{"status":"Available"}];
            var test = [];
            for (var i = 0; i < arrayOfObjects.length; i++) {
                var obj = arrayOfObjects[i];

                if (i != 0) {
                    test.push(obj)
                }
                console.log(arrayOfObjects);
            }

            console.log(test);

        }

        vm.hstep = 1;
        vm.mstep = 5;

        vm.options = {
            hstep: [1, 2, 3],
            mstep: [1, 5, 10, 15, 25, 30]
        };

        vm.minDate = new Date();

        vm.newTime = false;

        vm.ismeridian = true;

        vm.toggleMode = function () {
            vm.ismeridian = !vm.ismeridian;
        };

        vm.update = function () {
            var d = new Date();
            d.setHours(14);
            d.setMinutes(0);
            vm.mytime = d;
        };




        vm.datetimeslotchanged = function (key) {
            if (key < oldtimeSlotLen) {
                vm.timeslotmodified = "true";
            }
            if (vm.prop.fromtime[key] === undefined) {
                var fromtime = dateconfig;
            } else {
                var fromtime = vm.prop.fromtime[key];
            }

            if (vm.prop.to[key] === undefined) {
                var to = dateconfig;
            } else {
                var to = vm.prop.to[key];
            }

            vm.overlap = 0;

            for (var i = 0; i < vm.prop.date.length; i++) {
                if (i != key) {
                    if (vm.prop.fromtime[i] === undefined) {
                        var ftime = dateconfig;
                    } else {
                        var ftime = vm.prop.fromtime[i];
                    }

                    if (vm.prop.to[i] === undefined) {
                        var totime = dateconfig;
                    } else {
                        var totime = vm.prop.to[i];
                    }

                    console.log(fromtime > ftime, to > ftime, fromtime > totime, to > totime);

                    if ((moment(fromtime).format('HH:mm') <= moment(ftime).format('HH:mm') && moment(to).format('HH:mm') <= moment(ftime).format('HH:mm') && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) || (moment(fromtime).format('HH:mm') >= moment(totime).format('HH:mm') && moment(to).format('HH:mm') >= moment(totime).format('HH:mm') && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) || moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isBefore(moment(vm.prop.date[i]).format('DD-MMMM-YYYY')) || moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isAfter(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) {

                    } else {
                        vm.overlap = 1;
                    }
                }
            }

            if (vm.overlap == 1) {
                vm.prop.timeoverlapinvalid[key] = 1;
                vm.isDisabled = true;
            } else {
                vm.prop.timeoverlapinvalid[key] = 0;
            }

            var temp = new Date(fromtime.getTime() + 30 * 60000)
            if (moment(to).format('HH:mm') < moment(temp).format('HH:mm') && vm.prop.timeoverlapinvalid[key] == 0) {
                vm.prop.timeinvalid[key] = 1;
                vm.isDisabled = true;
            } else {
                vm.prop.timeinvalid[key] = 0;
            }

            if ((vm.prop.multiple[key] === false || vm.prop.multiple[key] === undefined) && vm.prop.timeinvalid[key] == 0) {
                var minutestimediff = (to - fromtime) / 60000;
                var subslots = Math.floor(Math.ceil(minutestimediff) / 30);

                if (vm.prop.limit[key] > subslots) {
                    vm.prop.invalid[key] = 1;
                    vm.isDisabled = true;
                } else {
                    vm.prop.invalid[key] = 0;
                    if (vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)) {
                        vm.isDisabled = false;
                    } else {
                        vm.isDisabled = true;
                    }
                }
            } else if ((vm.prop.multiple[key] === true) && vm.prop.timeinvalid[key] == 0) {
                vm.prop.invalid[key] = 0;
                vm.isDisabled = false;
            }
        }

        vm.clear = function () {
            vm.mytime = null;
        };

        // Go Back To View Property
        vm.backtoviewprop = function (value = '') {
            if (value != '') {
                if (confirm('If you go back without updating values, your changes will be lost!')) {
                    $state.go('adminproperty');
                } else {
                    return false;
                }
            } else {
                $state.go('adminproperty');
            }

        }

        vm.selectCheckbox = function (value, index) {
            if (!vm.prop.unitlists[index].Aminities || !(vm.prop.unitlists[index].Aminities instanceof Array)) {
                vm.prop.unitlists[index].Aminities = [];
            }
            if (vm.prop.unitlists[index].Aminities.includes(value)) {
                vm.prop.unitlists[index].Aminities.splice(vm.prop.unitlists[index].Aminities.indexOf(value), 1);
            } else {
                vm.prop.unitlists[index].Aminities.push(value);
            }
        }

        // Add/Edit Property       
        vm.submitProp = function (property) {

            AWS.config.update({
                accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
                secretAccessKey: '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'
            });
            AWS.config.region = 'ca-central-1';

            var bucket = new AWS.S3({
                params: {
                    Bucket: 'vcancy-final'
                }
            });
            var fileChooser = document.getElementById('file');
            var file = fileChooser.files[0];
            var propimg = '';


            var propertyObj = $firebaseAuth();

            var propdbObj = firebase.database();

            var propID = property.propID;
            var propstatus = property.propstatus == '' ? false : property.propstatus;
            var proptype = property.proptype;
            var units = property.units;
            var multiple = property.noofunits;
            var shared = property.shared == '' ? false : property.shared;
            var address = property.address;
            var city = property.city;
            var province = property.province;
            var country = property.country;
            var postcode = property.postcode;
            var name = property.name;
            var landlordID = ''
            landlordID = localStorage.getItem('adminLandlordId')
            if (!landlordID) {
                return;
            }

            if (file != undefined) {
                var filename = moment().format('YYYYMMDDHHmmss') + file.name;
                filename = filename.replace(/\s/g, '');

                if (file.size > 3145728) {
                    swal({
                        title: "Error!",
                        text: 'File size should be 3 MB or less.',
                        type: "error",
                    });
                    return false;
                } else if (
                    file.type != 'image/png' &&
                    file.type != 'image/jpeg' &&
                    file.type != 'image/jpg') {
                    swal({
                        title: "Error!",
                        text: 'Invalid file type.',
                        type: "error",
                    });
                    return false;
                }



                var params = {
                    Key: 'property-images/' + filename,
                    ContentType: file.type,
                    Body: file,
                    StorageClass: "STANDARD_IA",
                    ACL: 'public-read'
                };

                bucket.upload(params).on('httpUploadProgress', function (evt) {
                    //  console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total)+'%');
                    $rootScope.$apply(function () {
                        $rootScope.success = "Please Wait.. !";
                    });
                }).send(function (err, data) {
                    if (data.Location != '') {
                        propimg = data.Location;
                        // Start Of property Add
                        var unitlists = vm.createNewPropertyWithUnits(property)
                        if (propID == '') {
                            propdbObj.ref('properties/').push().set({
                                landlordID: landlordID,
                                propimg: propimg,
                                propstatus: propstatus,
                                proptype: proptype,
                                unitlists: unitlists,
                                units: units,
                                shared: shared,
                                address: address,
                                city: city,
                                province: province,
                                noofunits: multiple,
                                country: country,
                                postcode: postcode,
                                date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                                multiple: multiple,
                                name: name
                            }).then(function (data) {
                                console.log(data)
                                console.log("Insert Data successfully!");

                                propdbObj.ref('properties/').limitToLast(1).once("child_added", function (snapshot) {
                                    //localStorage.setItem("propID", snapshot.key);
                                    vm.opensuccesssweet(snapshot.key);
                                    $state.go('admineditprop', { propId: snapshot.key }) //unitlist
                                    // $rootScope.$apply(function () {
                                    //     console.log(units);
                                    //     $rootScope.units = units;
                                    //     $rootScope.message = units;
                                    //     $rootScope.success = "Property added successfully!";
                                    //     $rootScope.propID = snapshot.key;
                                    // });


                                });

                            });
                        } else {

                            propdbObj.ref('properties/' + propID).update({
                                landlordID: landlordID,
                                propimg: propimg,
                                propstatus: propstatus,
                                proptype: proptype,
                                units: units,
                                shared: shared,
                                address: address,
                                city: city,
                                province: province,
                                country: country,
                                postcode: postcode,
                                noofunits: multiple,
                                date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                                multiple: multiple,
                                name: name

                            }).then(function () {
                                vm.opensuccesssweet(snapshot.key);
                                $rootScope.$apply(function () {

                                    // $rootScope.units = units;
                                    //$rootScope.message = units;
                                    $rootScope.success = "Property Updated!";
                                    // $rootScope.propID = propID;


                                });
                            });
                        } // End OF property Add - Edit

                        /* localStorage.setItem('propertysuccessmsg','Property updated successfully.');
                                 angular.forEach(vm.scheduleIDs, function(value, key) {
                                     firebase.database().ref('applyprop/'+value).update({    
                                         schedulestatus: "cancelled"
                                     })
                                     // console.log(value);
                                 });     
    
                                 if(propstatus === false){
                                     var emailData = '<p>Hello, </p><p>'+address+' been successfully <strong>deactivated</strong>.</p><p>You will no longer receive viewing requests and rental applications.</p><p>To make changes or reactivate, please log in at http://vcancy.com/login/ and go to “My Properties”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                                         
                                     // Send Email
                                     emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), address+' has been deactivated', 'deactivateproperty', emailData);
                              
                                     angular.forEach(vm.tenants, function(tenantID, key) {
                                         firebase.database().ref('users/'+tenantID).once("value", function(snap) {
                                             var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has deactivated this property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                                         
                                             // Send Email
                                             emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'delproperty', emailData);
                                         });
                                     });
                                 } else {
                                     var emailData = '<p>Hello, </p><p>Your property <em>'+address+'</em>   has been successfully updated and all your property viewings affected by the updated time slots are cancelled. </p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                                             
                                     // Send Email
                                     emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Property Time Slots updated on Vcancy', 'updateproperty', emailData);
                              
                                     angular.forEach(vm.tenants, function(tenantID, key) {
                                         firebase.database().ref('users/'+tenantID).once("value", function(snap) {
                                             var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has made some changes in time slots for this property.</p><p>To reschedule the viewing and book some another available time, please log in at http://vcancy.com/login/ and use the link initially provided to schedule the viewing or follow the link http://www.vcancy.com/login/#/applyproperty/'+$stateParams.propId+'.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                                         
                                             // Send Email
                                             emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'updateproperty', emailData);
                                         });
                                     });
                                 } */
                    }
                });

            } else {

                // Start Of property Add
                if (propID == '') {
                    var unitlists = vm.createNewPropertyWithUnits(property)
                    propdbObj.ref('properties/').push().set({
                        landlordID: landlordID,
                        propimg: propimg,
                        unitlists: unitlists,
                        propstatus: propstatus,
                        proptype: proptype,
                        units: units,
                        shared: shared,
                        address: address,
                        city: city,
                        province: province,
                        country: country,
                        noofunits: multiple,
                        postcode: postcode,
                        date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                        multiple: multiple,
                        name: name
                    }).then(function (data) {
                        console.log(data)
                        console.log("Data added successfully!");
                        propdbObj.ref('properties/').limitToLast(1).once("child_added", function (snapshot) {
                            vm.opensuccesssweet(snapshot.key);
                            $state.go('admineditprop', { propId: snapshot.key })
                            // $rootScope.$apply(function () {
                            //     console.log(units);
                            //     $rootScope.units = units;
                            //     $rootScope.message = units;
                            //     $rootScope.success = "Property Added successfully!";
                            //     $rootScope.propID = snapshot.key;


                            //                        });
                        });

                    });
                } else {
                    if ($('#propimg').val() != '') {
                        propimg = $('#propimg').val();
                    }

                    propdbObj.ref('properties/' + propID).update({
                        landlordID: landlordID,
                        propstatus: propstatus,
                        proptype: proptype,
                        units: units,
                        propimg: propimg,
                        shared: shared,
                        address: address,
                        city: city,
                        province: province,
                        country: country,
                        noofunits: multiple,
                        postcode: postcode,
                        date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                        multiple: multiple,
                        name: name
                    }).then(function () {
                        vm.opensuccesssweet();
                        $rootScope.$apply(function () {
                            console.log(units);
                            // $rootScope.units = units;
                            // $rootScope.message = units;
                            // $rootScope.success = "Property Updated!";
                            // $rootScope.propID = propID;


                        });

                    });
                } // End OF property Add-edit
            }
        }

        vm.createNewPropertyWithUnits = function (property) {
            var unitlists = [];
            for (var i = 0; i < property.noofunits; i++) {
                unitlists.push({
                    "Aminities": [],
                    "address": property.address,
                    "bathroom": "",
                    "bedroom": "",
                    "cats": "",
                    "city": property.city,
                    "description": "",
                    "dogs": "",
                    "epirydate": "",
                    "location": property.city,
                    "name": property.name,
                    "postalcode": property.postcode,
                    "rent": "",
                    "smoking": "",
                    "sqft": "",
                    "country": property.country,
                    "state": property.province,
                    "status": "",
                    "type": property.proptype,
                    "unit": '',
                    isIncomplete: true,
                });
            }
            return unitlists;
        }

        vm.csvsubmitdata = function (prop) {

            var propID = prop.propID;
            var unitlists = prop.unitlists;
            var totalunits = prop.totalunits;
            var noofunits = prop.noofunits;
            var name = prop.name;
            var address = prop.address;
            var city = prop.city;
            var country = prop.country;
            var proptype = prop.proptype;
            var postcode = prop.postcode;
            var province = prop.province;


            var fileUpload = document.getElementById("file123");
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
            if (regex.test(fileUpload.value.toLowerCase())) {
                if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var rows = e.target.result.split("\n");
                        var result = [];
                        var units = [];
                        var headers = rows[0].split(",");
                        var totalrowunits = 0;
                        for (var i = 1; i < parseInt(rows.length - 1); i++) {

                            var obj = {};
                            var currentline = rows[i].split(",");

                            for (var j = 0; j < headers.length; j++) {

                                var headerkey = headers[j];
                                headerkey = headerkey.replace(/[^a-zA-Z ]/g, "")

                                headerkey = headerkey.toLowerCase();
                                if (headerkey == 'unit') {
                                    units.push(currentline[j]);
                                }

                                if (headerkey == 'unit' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Unit number must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }
                                if (headerkey == 'rent' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Rent must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }
                                if (headerkey == 'sqft' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Sqft must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }

                                if (headerkey == 'status' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Status must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }
                                if (headerkey == 'amenities' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Amenities must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }


                                if (headerkey == 'amenities' && currentline[j] != '') {
                                    var amenities = currentline[j];
                                    var str_array = amenities.split('|');
                                    obj['Aminities'] = str_array;
                                } else {
                                    obj[headerkey] = currentline[j];
                                }

                                obj['name'] = name;
                                obj['type'] = proptype;
                                obj['address'] = address;
                                obj['location'] = address;
                                obj['city'] = city;
                                obj['state'] = province;
                                obj['postcode'] = postcode;
                            }
                            result.push(obj);
                            totalrowunits++;
                        }

                        for (var i = 0; i < totalrowunits; i++) {
                            var objres = result[i];
                            unitlists.push(objres);
                        }

                        /*console.log(totalrowunits);
                        console.log(unitlists);*/



                        if (vm.duplication(units) == true) {
                            swal({
                                title: "Error!",
                                text: "Duplicate unit numbers found in the file. Please check duplicate values.",
                                type: "error",
                            });
                            return false;
                        }

                        noofunits = parseInt(totalrowunits + noofunits);
                        firebase.database().ref('properties/' + propID).update({
                            unitlists: unitlists,
                            totalunits: noofunits, noofunits: noofunits
                        }).then(function () {

                            if (confirm("Units added successfully!")) {
                                $state.go('viewprop');
                            }
                            $rootScope.success = "Units added successfully!";
                            //setTimeout(function(){ $state.go('viewprop'); }, 2000);
                        }, function (error) {
                            $rootScope.error = "Please check your file. Multiple errors found with the data.";
                        });
                    }

                    reader.readAsText(fileUpload.files[0]);



                } else {
                    swal({
                        title: "Error!",
                        text: "This browser does not support HTML5.",
                        type: "error",
                    });
                }
            } else {
                swal({
                    title: "Error!",
                    text: "Please upload a valid CSV file.",
                    type: "error",
                });
            }

        }

        vm.csvadd = function () {
            var fileUpload = document.getElementById("file");
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
            if (regex.test(fileUpload.value.toLowerCase())) {
                if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var rows = e.target.result.split("\n");
                        var result = [];
                        var units = [];
                        var headers = rows[0].split(",");
                        var totalunits = 0;
                        for (var i = 1; i < parseInt(rows.length - 1); i++) {
                            totalunits = i;
                            var obj = {};
                            var currentline = rows[i].split(",");

                            for (var j = 0; j < headers.length; j++) {

                                var headerkey = headers[j];
                                headerkey = headerkey.replace(/[^a-zA-Z ]/g, "")
                                if (headerkey == 'unit') {
                                    units.push(currentline[j]);
                                }
                                obj[headerkey] = currentline[j];
                            }
                            result.push(obj);
                        }

                        if (vm.duplication(units) == true) {
                            swal({
                                title: "Error!",
                                text: "Duplicate unit numbers found in the file. Please check duplicate values.",
                                type: "error",
                            });
                            return false;
                        }

                        //   console.log(result);
                        firebase.database().ref('properties/' + vm.localpropID).update({
                            unitlists: result,
                            totalunits: totalunits
                        }).then(function () {
                            $rootScope.success = "Units added successfully!";
                            setTimeout(function () { $state.go('viewprop'); }, 2000);
                        }, function (error) {
                            $rootScope.error = "Please check your file. Multiple errors found with the data.";
                        });
                    }

                    reader.readAsText(fileUpload.files[0]);



                } else {
                    swal({
                        title: "Error!",
                        text: "This browser does not support HTML5.",
                        type: "error",
                    });
                }
            } else {
                swal({
                    title: "Error!",
                    text: "Please upload a valid CSV file.",
                    type: "error",
                });
            }

        }



        vm.duplication = function (data) {

            var sorted_arr = data.slice().sort(); // You can define the comparing function here. 
            // JS by default uses a crappy string compare.
            // (we use slice to clone the array so the
            // original array won't be modified)
            var results = [];
            for (var i = 0; i < sorted_arr.length - 1; i++) {
                if (sorted_arr[i + 1] == sorted_arr[i]) {
                    results.push(sorted_arr[i]);
                }
            }

            if (results.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        if ($state.current.name == 'viewunits') {

            var ref = firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function (snapshot) {
                var propertiesData = snapshot.val();
                $scope.$apply(function () {
                    vm.units = {
                        mode: 'View',
                        propID: snapshot.key,
                        address: propertiesData.address,
                        city: propertiesData.city,
                        country: propertiesData.country,
                        date: propertiesData.date,
                        landlordID: propertiesData.landlordID,
                        name: propertiesData.name,
                        postcode: propertiesData.postcode,
                        propimg: propertiesData.propimg,
                        propstatus: propertiesData.propstatus,
                        proptype: propertiesData.proptype,
                        province: propertiesData.province,
                        shared: propertiesData.shared,
                        totalunits: propertiesData.totalunits,
                        units: propertiesData.units,
                        unitlists: propertiesData.unitlists,
                    }
                });
            });

        }




        // Edit Property
        if ($state.current.name == 'admineditprop') {
            vm.mode = 'Edit';
            vm.submitaction = "Update";
            vm.otheraction = "Delete";
            $scope.loader = 1;
            var ref = firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function (snapshot) {

                var propData = snapshot.val();
                console.log(propData);

                vm.timeSlot = [];
                $scope.$apply(function () {
                    vm.prop = vm.units = {
                        propID: snapshot.key,
                        landlordID: propData.landlordID,
                        propimg: propData.propimg,
                        propstatus: propData.propstatus,
                        proptype: propData.proptype,
                        units: propData.units,
                        rent: propData.rent,
                        shared: propData.shared,
                        address: propData.address,
                        noofunits: propData.totalunits,
                        city: propData.city,
                        province: propData.province,
                        postcode: propData.postcode,
                        country: propData.country,
                        propimage: propData.propimg,
                        unitlists: propData.unitlists,
                        noofunits: propData.noofunits,
                        name: propData.name,
                        multiple: [],
                        mode: 'Edit',
                        date: [],
                        fromtime: [],
                        to: [],
                        limit: [],
                        propertylink: propData.propertylink,
                        invalid: [0],
                        timeinvalid: [0],
                        timeoverlapinvalid: [0]
                    }
                    $scope.loader = 0;
                    /*   angular.forEach(propData.date, function(value, key) {
                           vm.timeSlot.push({
                               date: new Date(value)
                           });
                           vm.prop.date.push(new Date(value));
                           vm.prop.fromtime.push(new Date(propData.fromtime[key]));
                           vm.prop.to.push(new Date(propData.to[key]));
                           vm.prop.limit.push(propData.limit[key]);
                           vm.prop.multiple.push(propData.multiple[key]);
                       });*/
                    vm.addresschange();
                    oldtimeSlotLen = vm.timeSlot.length;
                    vm.unitsOptional();
                });
            });
        } else if ($state.current.name == 'adminaddprop') {
            vm.mode = 'Add';
            vm.submitaction = "Save";
            vm.otheraction = "Cancel";
            vm.timeSlot = [{
                date: dateconfig
            }];
            vm.prop = vm.units = {
                propID: '',
                landlordID: '',
                propimg: '',
                propstatus: true,
                proptype: '',
                units: '',
                multiple: [true],
                rent: '',
                shared: '',
                address: 'dgdfgdf',
                noofunits: 0,
                city: '',
                province: '',
                postcode: '',
                country: '',
                propimage: '',
                unitlists: [],
                noofunits: 0,
                name: name,
                noofunitsarray: vm.getarray(0),
                mode: 'Add',
                date: [],
                fromtime: [],
                to: [],
                limit: [],
                propertylink: '',
                invalid: [0],
                timeinvalid: [0],
                timeoverlapinvalid: [0]
            }
        }
        //noofunitsarray Return array value
        vm.noofunitsarray = function () {

            return vm.getarray(vm.prop.noofunits);

        }

        vm.onChangeCheckBox = function (index, value) {
            var isValueIncluded = vm.prop.unitlists[index].Aminities.includes(value);
            if (isValueIncluded) {
                vm.prop.unitlists[index].Aminities.splice(vm.prop.unitlists[index].Aminities.indexOf(value), 1);
            } else {
                vm.prop.unitlists[index].Aminities.push(value);
            }
            // $(event.target).toggleClass('selected');
        }
        vm.deleteproperty = function (propID, page) {
            var propID = propID;
            var propertyObj = $firebaseAuth();
            var propdbObj = firebase.database();
            firebase.database().ref('properties/' + propID).once("value", function (snap) {

                vm.property_address = snap.val().address;
                swal({
                    title: 'Warning!',
                    text: "Are you sure you want to delete this property? All details and units will be deleted!",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "Yes",
                    closeOnConfirm: false
                }, function () {
                    propdbObj.ref('properties/' + propID).remove();
                    firebase.database().ref('applyprop/').orderByChild("propID").equalTo(propID).once("value", function (snapshot) {
                        $scope.$apply(function () {
                            vm.scheduleIDs = [];
                            vm.tenants = [];

                            if (snapshot.val() != null) {
                                $.map(snapshot.val(), function (value, index) {
                                    vm.scheduleIDs.push(index);
                                    vm.tenants.push(value.tenantID);
                                });
                            }
                            angular.forEach(vm.scheduleIDs, function (value, key) {
                                firebase.database().ref('applyprop/' + value).update({
                                    schedulestatus: "removed"
                                })
                            });

                            var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + vm.landlordname + ',</h2><br> Your property <em>' + vm.property_address + '</em> has been successfully deleted and all viewings related to this property are also removed.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                            // Send Email
                            emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address + ' has been deleted', 'delproperty', emailData);

                            angular.forEach(vm.tenants, function (tenantID, key) {
                                firebase.database().ref('users/' + tenantID).once("value", function (snap) {
                                    var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + snap.val().firstname + ' ' + snap.val().lastname + ',</h2><br> Your viewing request on property <em>' + vm.property_address + '</em> has been removed as landlord has deleted his property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                                    // Send Email
                                    emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your viewing request has been removed from Vcancy', 'delproperty', emailData);
                                });
                            });
                        })

                        swal({
                            title: 'Success!',
                            text: 'Property deleted successfully',
                            type: 'success'
                        }, function () {
                            if (page === 'innerpage') {
                                $state.go('viewprop');
                            } else {
                                $state.reload();
                            }
                        });

                    });

                    if (page === 'innerpage') {
                        $state.go('viewprop');
                    } else {
                        $state.reload();
                    }
                });
            });
        }

        vm.stringModel = [];
        vm.stringData = ['David', 'Jhon', 'Danny',];
        vm.stringSettings = { template: '{{option}}', smartButtonTextConverter(skip, option) { return option; }, };

        // Delete Property Permanently
        this.delprop = function (propID) {
            var propertyObj = $firebaseAuth();
            var propdbObj = firebase.database();

            firebase.database().ref('properties/' + propID).once("value", function (snap) {
                vm.property_address = snap.val().address;

                if ($window.confirm("Do you want to continue?")) {
                    propdbObj.ref('properties/' + propID).remove();

                    firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function (snapshot) {
                        $scope.$apply(function () {
                            vm.scheduleIDs = [];
                            vm.tenants = [];

                            if (snapshot.val() != null) {
                                $.map(snapshot.val(), function (value, index) {
                                    vm.scheduleIDs.push(index);
                                    vm.tenants.push(value.tenantID);
                                });
                            }
                            angular.forEach(vm.scheduleIDs, function (value, key) {
                                firebase.database().ref('applyprop/' + value).update({
                                    schedulestatus: "removed"
                                })
                            });

                            var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + vm.landlordname + ',</h2><br> Your property <em>' + vm.property_address + '</em> has been successfully deleted and all viewings related to this property are also removed.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                            // Send Email
                            emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address + ' has been deleted', 'delproperty', emailData);

                            angular.forEach(vm.tenants, function (tenantID, key) {
                                firebase.database().ref('users/' + tenantID).once("value", function (snap) {
                                    var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + snap.val().firstname + ' ' + snap.val().lastname + ',</h2><br> Your viewing request on property <em>' + vm.property_address + '</em> has been removed as landlord has deleted his property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                                    // Send Email
                                    emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your viewing request is removed from Vcancy', 'delproperty', emailData);
                                });
                            });
                        })
                        $state.go('viewprop');
                    })
                }
            });
        }

        // Units to be optional when house is selected


        this.unitsClear = function (proptype) {
            console.log(vm.prop.units);
            if (vm.prop.proptype == proptype && (vm.prop.units == '' || vm.prop.units == undefined)) {
                vm.prop.units = ' ';
            }
        }

        vm.checkAll = function () {
            if (vm.selectedAll) {
                for (var i = 0; i < vm.prop.unitlists.length; i++) {
                    vm.checkedRow[i] = true;
                }
            } else {
                vm.checkedRow = {};
            }
            // var datalen = vm.noofunitsarray();

            // for (var i = 0; i <= datalen.length - 1; i++) {
            //     vm.prop.noofunitsarray[i] = $scope.selectedAll;
            // }
        }
        vm.moreaction = function (action) {

            if (Object.keys(vm.checkedRow).length > 0) {

                for (var index in vm.checkedRow) {
                    if (vm.checkedRow[index] && action) {
                        vm.prop.unitlists[index].status = action;
                    }
                }
                // $("#ts_checkbox:checked").each(function (index) {
                //     selectedvalue.push($(this).val());
                // });


                // var rowlength = selectedvalue.length;
                // //var tablerowlength = vm.prop.noofunitsarray;
                // var tablerowlength = vm.noofunitsarray();

                // if (val === 'DAll') {
                //     if (vm.units.unitlists !== undefined) {
                //         for (var i = 0; i < rowlength; i++) {
                //             delete vm.units.unitlists[parseInt(selectedvalue[i])];
                //         }
                //     }
                //     for (var i = 0; i < rowlength; i++) {
                //         vm.units.noofunits = parseInt(vm.units.noofunits - 1);
                //         vm.prop.noofunits = vm.units.noofunits
                //         //vm.prop.noofunitsarray = vm.getarray(vm.units.noofunits);
                //         // vm.units.noofunitsarray = vm.getarray(vm.units.noofunits);
                //     }
                //     var list = [];
                //     for (var i = 0; i < vm.units.unitlists.length; i++) {
                //         if (typeof vm.units.unitlists[i] !== 'undefined') {
                //             list.push(vm.units.unitlists[i]);
                //         }
                //     }

                //     vm.units.unitlists = list;
                //     $scope.selectedAll = false;
                //     var datalen = vm.noofunitsarray();

                //     for (var i = 0; i <= datalen.length - 1; i++) {
                //         vm.prop.noofunitsarray[i] = $scope.selectedAll;
                //     }
                // }

                // if (val === 'Mavailable') {

                //     if (vm.units.unitlists !== undefined && vm.prop.unitlists !== undefined) {
                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             console.log(vm.units.unitlists[index]);
                //             if (vm.units.unitlists[index] !== undefined) {
                //                 vm.units.unitlists[index]['status'] = 'Available';
                //             } else {
                //                 vm.units.unitlists.push({ status: 'Available' });
                //             }

                //         }
                //     } else {
                //         vm.units.unitlists = [];
                //         for (var i = 0; i < tablerowlength.length; i++) {

                //         }

                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             vm.units.unitlists[index]['status'] = 'Available';
                //         }

                //     }

                //     $scope.selectedAll = false;
                //     var datalen = vm.noofunitsarray();

                //     for (var i = 0; i <= datalen.length - 1; i++) {
                //         vm.prop.noofunitsarray[i] = $scope.selectedAll;
                //     }
                // }

                // if (val === 'Mranted') {
                //     if (vm.units.unitlists !== undefined && vm.prop.unitlists !== undefined) {
                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             if (vm.units.unitlists[index] !== undefined) {
                //                 vm.units.unitlists[index]['status'] = 'rented';
                //             } else {
                //                 vm.units.unitlists.push({ status: 'rented' });
                //             }
                //         }
                //     } else {
                //         vm.units.unitlists = [];
                //         for (var i = 0; i < tablerowlength.length; i++) {
                //             vm.units.unitlists.push({ status: '' });
                //         }

                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             vm.units.unitlists[index]['status'] = 'rented';
                //         }

                //     }

                //     $scope.selectedAll = false;
                //     var datalen = vm.noofunitsarray();

                //     for (var i = 0; i <= datalen.length - 1; i++) {
                //         vm.prop.noofunitsarray[i] = $scope.selectedAll;
                //     }
                // }


                // if (val === 'Msold') {
                //     if (vm.units.unitlists !== undefined && vm.prop.unitlists !== undefined) {

                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             if (vm.units.unitlists[index] !== undefined) {
                //                 vm.units.unitlists[index]['status'] = 'sold';
                //             } else {
                //                 vm.units.unitlists.push({ status: 'sold' });
                //             }
                //         }
                //     } else {
                //         vm.units.unitlists = [];
                //         for (var i = 0; i < tablerowlength.length; i++) {
                //             vm.units.unitlists.push({ status: '' });
                //         }

                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             vm.units.unitlists[index]['status'] = 'sold';
                //         }

                //     }

                //     $scope.selectedAll = false;
                //     var datalen = vm.noofunitsarray();

                //     for (var i = 0; i <= datalen.length - 1; i++) {
                //         vm.prop.noofunitsarray[i] = $scope.selectedAll;
                //     }
                // }
            } else {
                swal({
                    title: "Error!",
                    text: "Please select row for apply your selected action",
                    type: "error",
                });
                vm.more = '';
            }
        }

        vm.addNewUnit = function () {
            var newUnit = {
                "Aminities": [],
                "address": vm.prop.address,
                "bathroom": "",
                "bedroom": "",
                "cats": "",
                "city": vm.prop.city,
                "description": "",
                "dogs": "",
                "epirydate": "",
                "location": vm.prop.address,
                "name": vm.prop.name,
                "postalcode": vm.prop.postcode,
                "country": vm.prop.country,
                "rent": "",
                "smoking": "",
                "sqft": "",
                "state": vm.prop.province || vm.prop.city,
                "status": "available",
                "type": "",
                "unit": '',
                isIncomplete: true,
            }
            if (!vm.prop.unitlists) vm.prop.unitlists = [];
            vm.prop.unitlists.push(newUnit);
        }

        vm.deleteSelected = function () {
            if (Object.keys(vm.checkedRow) && Object.keys(vm.checkedRow).length > 0) {

                vm.prop.unitlists = vm.prop.unitlists.filter(function (unit, key) {
                    if (!vm.checkedRow[key]) return true;
                })
                vm.submiteditunits(vm.prop.unitlists, vm.prop, true);
                vm.checkedRow = {};
            } else {
                swal({
                    title: "Alert!",
                    text: "Please select any unit from row",
                    type: "warning",
                });
            }
        }

        vm.addmorerow = function (val1) {
            var val = val1;
            if (isNaN(val)) {
                val = 0;
            }

            vm.units.noofunits = parseInt(val + 1);
            vm.prop.noofunits = parseInt(val + 1);
            $scope.selectedAll = false;
            //vm.prop.noofunitsarray = vm.getarray(vm.units.noofunits)
        }
        vm.filesArray = [];
        $scope.uploadDetailsImages = function (event) {
            var filesToUpload = event.target.files;
            var alreadyAddedImages = $scope.selectedUnitDetail.data.images ? $scope.selectedUnitDetail.data.images.length : 0
            if (filesToUpload.length + alreadyAddedImages > 24) {
                swal({
                    title: "Warning!",
                    text: "Images uploading is limited to 24 images only.",
                    type: "warning",
                });
                return
            }
            // swal({
            //     title: 'Alert',
            //     text: "Please wait photos are uploading",
            //     icon: "info",
            // });
            $scope.loader = 1;
            for (var i = 0; i < filesToUpload.length; i++) {
                var file = filesToUpload[i];
                vm.filesArray.push(vm.singleFileUpload(file));
            }

            $q
                .all(vm.filesArray)
                .then((data) => {
                    swal.close();
                    if (!$scope.selectedUnitDetail.data.images) $scope.selectedUnitDetail.data.images = [];
                    $scope.selectedUnitDetail.data.images = $scope.selectedUnitDetail.data.images.concat(data);
                    setTimeout(function () {
                        swal({
                            title: "Success!",
                            text: "Photos uploaded successfully!",
                            type: "success",
                        });
                    }, 100)
                    $scope.loader = 0;
                })
        }

        $scope.copyUnitDetails = function (from, to) {
            var datatoCopy = vm.prop.unitlists.find(function (unit) {
                return unit.unit == from;
            })
            for (var i in datatoCopy) {
                if (i != 'unit') {
                    $scope.selectedUnitDetail.data[i] = datatoCopy[i]
                }
            }
        }

        vm.singleFileUpload = function (file) {
            var fileUploadDefer = $q.defer();
            if (file) {
                AWS.config.update({
                    accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
                    secretAccessKey: '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'
                });
                AWS.config.region = 'ca-central-1';

                var bucket = new AWS.S3({
                    params: {
                        Bucket: 'vcancy-final'
                    }
                });
                var filename = moment().format('YYYYMMDDHHmmss') + file.name;
                filename = filename.replace(/\s/g, '');

                if (file.size > 3145728) {
                    swal({
                        title: "Error!",
                        text: 'File size should be 3 MB or less.',
                        type: "error",
                    });
                    return false;
                } else if (file.type.indexOf('image') === -1) {
                    swal({
                        title: "Error!",
                        text: 'Only files are accepted.',
                        type: "error",
                    });
                    return false;
                }



                var params = {
                    Key: 'property-images/' + filename,
                    ContentType: file.type,
                    Body: file,
                    StorageClass: "STANDARD_IA",
                    ACL: 'public-read'
                };

                bucket.upload(params).on('httpUploadProgress', function (evt) {

                })
                    .send(function (err, data) {
                        if (err) {
                            return fileUploadDefer.reject(data);
                        }
                        return fileUploadDefer.resolve(data);
                    });

                return fileUploadDefer.promise;
            }
        }

        vm.copyrowofunits = function () {

            var arr = [];
            var selectedvalue = new Array();
            var n = $("#ts_checkbox:checked").length;
            var tempArray = vm.prop.unitlists;
            var b = [];
            if (n > 0) {

                $("#ts_checkbox:checked").each(function (index) {
                    selectedvalue.push($(this).val());
                });

                for (var i = 0; i < selectedvalue.length; i++) {
                    //console.log(vm.prop.unitlists[i]);
                    units = parseInt(vm.prop.unitlists[i]['unit']) + parseInt(vm.prop.unitlists.length);

                    b.push({
                        unit: units,
                        name: vm.prop.unitlists[i]['name'],
                        type: vm.prop.unitlists[i]['type'],
                        address: vm.prop.unitlists[i]['address'],
                        city: vm.prop.unitlists[i]['city'],
                        state: vm.prop.unitlists[i]['state'],
                        postalcode: vm.prop.unitlists[i]['postalcode'],
                        location: vm.prop.unitlists[i]['location'],
                        sqft: vm.prop.unitlists[i]['sqft'],
                        bedroom: vm.prop.unitlists[i]['bedroom'],
                        bathroom: vm.prop.unitlists[i]['bathroom'],
                        rent: vm.prop.unitlists[i]['rent'],
                        description: vm.prop.unitlists[i]['description'],
                        status: vm.prop.unitlists[i]['status'],
                        epirydate: vm.prop.unitlists[i]['epirydate'],
                        Aminities: vm.prop.unitlists[i]['Aminities'],
                        cats: vm.prop.unitlists[i]['cats'],
                        dogs: vm.prop.unitlists[i]['dogs'],
                        smoking: vm.prop.unitlists[i]['smoking']

                    });
                    vm.prop.noofunits = parseInt(vm.prop.noofunits + 1);
                }


                for (var i = 0; i < b.length; i++) {
                    vm.prop.unitlists.push(b[i]);
                }
            } else {
                vm.prop.noofunits = parseInt(vm.prop.noofunits + vm.prop.unitlists.length);

                for (var i = 0; i < vm.prop.unitlists.length; i++) {
                    var units = parseInt(vm.prop.unitlists[i]['unit']) + parseInt(vm.prop.unitlists.length);
                    b.push({
                        unit: units,
                        name: vm.prop.unitlists[i]['name'],
                        type: vm.prop.unitlists[i]['type'],
                        address: vm.prop.unitlists[i]['address'],
                        city: vm.prop.unitlists[i]['city'],
                        state: vm.prop.unitlists[i]['state'],
                        postalcode: vm.prop.unitlists[i]['postalcode'],
                        location: vm.prop.unitlists[i]['location'],
                        sqft: vm.prop.unitlists[i]['sqft'],
                        bedroom: vm.prop.unitlists[i]['bedroom'],
                        bathroom: vm.prop.unitlists[i]['bathroom'],
                        rent: vm.prop.unitlists[i]['rent'],
                        description: vm.prop.unitlists[i]['description'],
                        status: vm.prop.unitlists[i]['status'],
                        epirydate: vm.prop.unitlists[i]['epirydate'],
                        Aminities: vm.prop.unitlists[i]['Aminities'],
                        cats: vm.prop.unitlists[i]['cats'],
                        dogs: vm.prop.unitlists[i]['dogs'],
                        smoking: vm.prop.unitlists[i]['smoking']

                    });
                }

                for (var i = 0; i < b.length; i++) {
                    console.log(b[i]);
                    vm.prop.unitlists.push(b[i]);
                }
            }
        }

        vm.addmorerowedit = function (val) {
            vm.prop.noofunits = parseInt(val + 1);
        }

        vm.submiteditunits = function (unitlists, prop, isDeleted, isFromSchedule) {
            let unitIds = [];
            unitlists.forEach((unit) => {
                unitIds.push(unit.unit);
                delete unit.$$hashKey;
            });
            var hasDuplicateIds = vm.duplication(unitIds);
            if (hasDuplicateIds) {
                swal({
                    title: "Error!",
                    text: "Duplicate unit number/s added, please check Unit # column",
                    type: "error",
                });
                return;
            }
            return firebase.database().ref('properties/' + prop.propID).update({
                unitlists: unitlists,
                totalunits: unitlists.length,
                noofunits: unitlists.length
            }).then(function () {
                if (isDeleted) {
                    swal({
                        title: "Success!",
                        text: "Unit deleted successfully.",
                        type: "success",
                    });
                } else {
                    vm.prop.noofunits = unitlists.length;
                    vm.prop.totalunits = unitlists.length;
                    swal({
                        title: "Success!",
                        text: "Unit/s saved successfully.",
                        type: "success",
                    }, function (value) {
                        if (isFromSchedule) {
                            window.location.reload();
                        }
                    })

                }
            }, function (error) {
                if (confirm("Units not added, please try again!") == true) {
                    return false;
                }
            });
        }

        vm.submitunits = function (units) {

            var num = units.number;
            var rent = units.rent;
            var sqft = units.sqft;
            var status = units.status;
            var bath = units.bath;
            var bed = units.bed;
            var aminities1 = units.Aminities;
            var fullformarary = [];


            var address = units.address;
            var name = units.name;
            var type = units.proptype;
            var city = units.city;
            var state = units.province;
            var postalcode = units.postcode;
            var location = units.address;
            var bedroom = [];
            var bathroom = [];
            var description = [];
            var status = units.status;
            var epirydate = [];
            var cats = [];
            var dogs = [];
            var smoking = [];
            var furnished = [];
            var wheelchair = [];


            var number = [];
            var rentarray = [];
            var sqftarray = [];
            var statusarray = [];
            var textarray = [];
            var batharray = [];
            var bedarray = [];
            var Aminitiesarray = [];



            for (var prop in num) {
                if (num.hasOwnProperty(prop)) {
                    number.push(num[prop]);
                }
            }

            if (vm.duplication(number) == true) {
                swal({
                    title: "Error!",
                    text: "Duplicate unit numbers found in the file. Please check duplicate values.",
                    type: "error",
                });
                /*$rootScope.$apply(function() {
                         $rootScope.error = "Please check your unit number are duplicate.. !";
                     });*/
                return false;
            }

            for (var prop in rent) {
                if (rent.hasOwnProperty(prop)) {
                    rentarray.push(rent[prop]);
                }
            }

            for (var prop in sqft) {
                if (sqft.hasOwnProperty(prop)) {
                    sqftarray.push(sqft[prop]);
                }
            }

            for (var prop in status) {
                if (status.hasOwnProperty(prop)) {
                    statusarray.push(status[prop]);
                }
            }

            for (var prop in bath) {
                if (bath.hasOwnProperty(prop)) {
                    batharray.push(bath[prop]);
                }
            }

            for (var prop in bed) {
                if (bed.hasOwnProperty(prop)) {
                    bedarray.push(bed[prop]);
                }
            }

            for (var prop in aminities1) {
                if (aminities1.hasOwnProperty(prop)) {
                    Aminitiesarray.push(aminities1[prop]);
                }
            }

            var totalunits = 0;
            for (var i = 0; i < number.length; i++) {

                fullformarary.push({
                    unit: number[i],
                    name: name,
                    type: type,
                    address: units.address,
                    city: city,
                    state: state,
                    postalcode: postalcode,
                    location: address,
                    sqft: sqftarray[i],
                    bedroom: bedarray[i],
                    bathroom: batharray[i],
                    rent: rentarray[i],
                    description: '',
                    status: statusarray[i],
                    epirydate: '',
                    Aminities: Aminitiesarray[i],
                    cats: '',
                    dogs: '',
                    smoking: '',
                    furnished: '',
                    wheelchair: ''
                });
                totalunits++;
            }



            firebase.database().ref('properties/' + units.propID).update({
                unitlists: fullformarary,
                totalunits: totalunits,
                noofunits: totalunits
            }).then(function () {
                if (confirm("Units added successfully!") == true) {
                    localStorage.removeItem('propID');
                    localStorage.removeItem('units');
                    localStorage.removeItem('propName');
                    $state.go('viewprop');
                } else {
                    return false;
                }
            }, function (error) {
                if (confirm("Units not added, please try again!") == true) {
                    return false;
                }
            });

        }


        $scope.items = [
            'The first choice!',
            'And another choice for you.',
            'but wait! A third!'
        ];

        $scope.status = {
            isopen: false
        };

        $scope.toggled = function (open) {
            $log.log('Dropdown is now: ', open);
        };

        $scope.toggleDropdown = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };

        $scope.appendToEl = angular.element(document.querySelector('#dropdown-long-content'));

        vm.opensuccesssweet = function (value) {
            swal({
                title: "Property added successfully, please add units",
                text: "Click on the Units tab",
                type: "success",
            });
            // alert('Property Created successfully!');
            //swal("Your Property Created successfully!", "You clicked the button And add units!", "success")
        }

        vm.openmodel = function (size) {
            $scope.items1 = [];
            var modalInstance = $uibModal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl9',
                backdrop: 'static',
                size: size,
                resolve: {
                    items1: function () {
                        return $scope.items1;
                    }
                }

            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openImageModal = function () {
            $scope.imageModal = $uibModal.open({
                templateUrl: 'viewimages.html',
                controller: 'adminPropertyCtrl',
                backdrop: 'static',
                size: 'lg',
                windowClass: 'zIndex',
                scope: $scope
            });
        }

        $scope.closeImageModal = function () {
            $scope.imageModal.dismiss('cancel');
        }

        vm.openDetailModel = function (prop, index) {
            $scope.selectedUnitDetail = {};
            $scope.selectedUnitDetail.data = vm.prop.unitlists[index];
            $scope.selectedUnitDetail.data.email = localStorage.getItem('userEmail');
            $scope.selectedUnitDetail.index = index;
            $scope.items1 = prop;
            $scope.items1.indexofDetails = index;
            $scope.modalInstance = $uibModal.open({
                templateUrl: 'myModalDetailsContent.html',
                controller: 'adminPropertyCtrl',
                backdrop: 'static',
                size: 'lg',
                windowClass: 'detailmodalcss',
                scope: $scope
            });
        };
        vm.duplication = function (data) {

            var sorted_arr = data.slice().sort(); // You can define the comparing function here. 
            // JS by default uses a crappy string compare.
            // (we use slice to clone the array so the
            // original array won't be modified)
            var results = [];
            for (var i = 0; i < sorted_arr.length - 1; i++) {
                if (sorted_arr[i + 1] == sorted_arr[i]) {
                    results.push(sorted_arr[i]);
                    break;
                }
            }

            if (results.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        vm.opencsvmodel = function (prop) {

            $scope.items1 = prop;
            var modalInstance = $uibModal.open({
                templateUrl: 'myModalContent1.html',
                controller: 'ModalInstanceCtrl9',
                backdrop: 'static',
                resolve: {
                    items1: function () {
                        return $scope.items1;
                    }
                }

            });

            modalInstance.result.then(function () {

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.cancel = function () {
            $scope.modalInstance.dismiss('cancel');
        };
        vm.checkIfDetailIsIncomplete = function (value) {

            var keyToCheck = [
                "address",
                "city",
                "postalcode",
                "country",
                "rent",
                "sqft",
                "status",
                "unit",
                "type",
                "title",
                "description"
            ]

            for (var i = 0; i < keyToCheck.length; i++) {
                if (!value[keyToCheck[i]]) {
                    return true;
                }
            }

            if (!value.images) {
                return true;
            }
            if (value.images.length <= 0) {
                return true;
            }
            return false;
        }
        $scope.submitDetails = function (isFromSchedule) {
            var index = $scope.selectedUnitDetail.index;
            if (!vm.prop.unitlists) {
                vm.prop.unitlists = [];
            }
            // if (!vm.prop.unitlists[index]) {
            //     vm.prop = angular.copy($scope.prop);
            // }
            vm.prop.unitlists[index] = angular.copy($scope.selectedUnitDetail.data);
            vm.prop.unitlists[index].isIncomplete = vm.checkIfDetailIsIncomplete(angular.copy($scope.selectedUnitDetail.data));
            vm.submiteditunits(vm.prop.unitlists, vm.prop, '', isFromSchedule)
                .then(function () {
                    $scope.cancel();
                });
        };

        $scope.deleteImageFromDetail = function (index) {
            $scope.selectedUnitDetail.data.images.splice(index, 1);
        }

        $scope.onChangeCheckbox = function (type) {
            if ($scope.selectedUnitDetail.data.Aminities && $scope.selectedUnitDetail.data.Aminities.includes(type)) {
                $scope.selectedUnitDetail.data.Aminities.splice($scope.selectedUnitDetail.data.Aminities.indexOf(type), 1);
            } else {
                if (!$scope.selectedUnitDetail.data.Aminities) $scope.selectedUnitDetail.data.Aminities = [];
                $scope.selectedUnitDetail.data.Aminities.push(type);
            }
        }



    }]);



vcancyApp.controller('ModalInstanceCtrl9', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'Upload', 'config', '$http', '$uibModal', '$uibModalInstance', '$location', 'items1', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, Upload, config, $http, $uibModal, $uibModalInstance, $location, items1) {
    var vm = this;
    vm.prop = items1;
    $scope.items1 = items1;
    $scope.ok = function (value) {
        if (value === 'viewproperty') {
            $uibModalInstance.close();
            $state.go('viewprop');
        }
    };

    $scope.submit = function () {

        $scope.loader = 1;
        var propID = $scope.items1.propID;
        var unitlists = $scope.items1.unitlists;
        var totalunits = $scope.items1.totalunits;
        var noofunits = $scope.items1.noofunits;
        var name = $scope.items1.name;
        var address = $scope.items1.address;
        var city = $scope.items1.city;
        var country = $scope.items1.country;
        var proptype = $scope.items1.proptype;
        var postcode = $scope.items1.postcode;
        var province = $scope.items1.province;


        var fileUpload = document.getElementById("file123");
        if (fileUpload.value.indexOf('.csv') > -1) {
            if (typeof (FileReader) != "undefined") {
                var unitsImported = [];
                var reader = new FileReader();

                reader.onload = function (e) {
                    var rows = e.target.result.split("\n");
                    var units = [];
                    var headers = rows[0].split(",");
                    var totalrowunits = 0;
                    for (var i = 1; i < rows.length; i++) {

                        var obj = {};
                        var currentline = rows[i].split(",");
                        if (currentline[0].indexOf('DELETE THE EXAMPLE') > -1) {
                            continue;
                        }
                        if (currentline.length < 2) {
                            continue;
                        }

                        for (var j = 0; j < headers.length; j++) {

                            var headerkey = headers[j];
                            headerkey = headerkey.replace(/[^a-zA-Z]/g, "")

                            headerkey = headerkey.toLowerCase();
                            if (headerkey == 'unit') {
                                units.push(currentline[j]);
                            }

                            if (headerkey == 'unit' && currentline[j] == '') {
                                swal({
                                    title: "Error!",
                                    text: "Unit must be a value. Please follow instructions in the spreadsheet",
                                    type: "error",
                                });
                                return false;
                            }
                            if (headerkey == 'rent' && currentline[j] == '') {
                                swal({
                                    title: "Error!",
                                    text: "Rent must be a value. Please follow instructions in the spreadsheet",
                                    type: "error",
                                });
                                return false;
                            }
                            if (headerkey == 'sqft' && currentline[j] == '') {
                                swal({
                                    title: "Error!",
                                    text: "Sqft must be a value. Please follow instructions in the spreadsheet",
                                    type: "error",
                                });
                                return false;
                            }

                            if (headerkey == 'status' && currentline[j] == '') {
                                swal({
                                    title: "Error!",
                                    text: "status must be a value. Please follow instructions in the spreadsheet",
                                    type: "error",
                                });
                                return false;
                            }

                            var actualHeaderKey = '';
                            var aminitiesHeaderKeys = [
                                'amenitiesfurnished',
                                'amenitieslaundry',
                                'amenitiesparking',
                                'amenitieswheelchairaccess'
                            ]
                            var ignorKeys = [
                                'propertyaddressoptional',
                            ]
                            if (ignorKeys.includes(headerkey)) {
                                continue;
                            }
                            if (aminitiesHeaderKeys.includes(headerkey)) {
                                actualHeaderKey = 'Aminities';
                            } else if (headerkey === 'catsok') {
                                actualHeaderKey = 'cats';
                            } else if (headerkey === 'dogsok') {
                                actualHeaderKey = 'dogs';
                            } else {
                                actualHeaderKey = headerkey.trim();
                            }

                            if (headerkey === 'amenitiesfurnished') {
                                if (currentline[j].toLowerCase().trim() === 'yes') {
                                    if (!obj[actualHeaderKey] || !(obj[actualHeaderKey] instanceof Array)) obj[actualHeaderKey] = [];
                                    obj[actualHeaderKey].push('furnished')
                                }
                            } else if (headerkey === 'amenitieslaundry') {
                                if (currentline[j].toLowerCase().trim() === 'yes') {
                                    if (!obj[actualHeaderKey] || !(obj[actualHeaderKey] instanceof Array)) obj[actualHeaderKey] = [];
                                    obj[actualHeaderKey].push('laundry')
                                }
                            } else if (headerkey === 'amenitiesparking') {
                                if (currentline[j].toLowerCase().trim() === 'yes') {
                                    if (!obj[actualHeaderKey] || !(obj[actualHeaderKey] instanceof Array)) obj[actualHeaderKey] = [];
                                    obj[actualHeaderKey].push('parking')
                                }
                            } else if (headerkey === "amenitieswheelchairaccess") {
                                if (currentline[j].toLowerCase().trim() === 'yes') {
                                    if (!obj[actualHeaderKey] || !(obj[actualHeaderKey] instanceof Array)) obj[actualHeaderKey] = [];
                                    obj[actualHeaderKey].push('wheelchair')
                                }
                            } else if (headerkey === 'catsok' || headerkey === 'dogsok' || headerkey === 'smoking') {
                                obj[actualHeaderKey] = currentline[j].toLowerCase() == 'yes' ? true : false
                            } else if (headerkey === 'status') {
                                if (currentline[j] && currentline[j].toLowerCase() === "available soon") {
                                    obj['status'] = 'availablesoon';
                                }
                                else {
                                    obj['status'] = currentline[j] ? currentline[j].toLowerCase() : 'status';
                                }
                            } else if (headerkey === 'descriptionoptional') {
                                obj['description'] = currentline[j];
                            } else if (headerkey === 'leaseexpiryoptional') {
                                obj['leaseExpiry'] = new Date(currentline[j]);
                            } else {
                                obj[actualHeaderKey] = currentline[j];
                            }
                        }

                        obj['name'] = name;
                        obj['type'] = proptype;
                        obj['address'] = address;
                        obj['location'] = address;
                        obj['city'] = city;
                        obj['state'] = province;
                        obj['postcode'] = postcode;
                        unitsImported.push(obj);
                        totalrowunits++;
                    }
                    var hasDuplicateId = vm.duplication(units);
                    if (hasDuplicateId) {
                        swal({
                            title: 'Error',
                            text: 'File has duplicate unit IDs.',
                            type: 'error'
                        })
                        return;
                    }
                    if (!vm.prop.unitlists) vm.prop.unitlists = [];
                    vm.prop.unitlists = vm.prop.unitlists.concat(unitsImported);
                    vm.prop.totalunits = vm.prop.unitlists.length;
                    vm.prop.noofunits = vm.prop.unitlists.length;
                    setTimeout(function () {
                        $uibModalInstance.close();
                        swal({
                            title: 'Alert',
                            text: 'File imported successfully. You need to SAVE units otherwise changes will be lost.',
                            type: 'success'
                        })
                        $scope.loader = 0;
                    }, 1000);
                }

                reader.readAsText(fileUpload.files[0]);



            } else {
                swal({
                    title: "Error!",
                    text: "This browser does not support HTML5.",
                    type: "error",
                });
            }
        } else {
            swal({
                title: "Error!",
                text: "Please upload a valid CSV file.",
                type: "error",
            });
        }

    }

    $scope.units = function (value) {
        if (value != '' && value != null) {
            //  $location.absUrl() = '#/addunits/'+value;
            $uibModalInstance.close();
            $window.location.href = '#/addunits/' + value;
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.duplication = function (data) {

        var sorted_arr = data.slice().sort(); // You can define the comparing function here. 
        // JS by default uses a crappy string compare.
        // (we use slice to clone the array so the
        // original array won't be modified)
        var results = [];
        for (var i = 0; i < sorted_arr.length - 1; i++) {
            if (sorted_arr[i + 1] == sorted_arr[i]) {
                results.push(sorted_arr[i]);
            }
        }

        if (results.length > 0) {
            return true;
        } else {
            return false;
        }
    }

}]);



'use strict';

vcancyApp
    .controller('adminScheduleCtrl', ['$scope', '$firebaseAuth','emailSendingService', '$state', '$rootScope', '$stateParams', '$window', '_', '$uibModal',
        function ($scope, $firebaseAuth, emailSendingService,$state, $rootScope, $stateParams, $window, _, $uibModal) {

            var vm = this;
            var landlordID = localStorage.getItem('userID');

            //vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
            vm.userData = {};

            var vm = this;
            vm.selectedUser = '';
            vm.statusChange = {};
            vm.usersList = [];
            firebase.database().ref('users/').once("value", function (snapvalue) {

                var users = snapvalue.val();
                vm.allUsers = snapvalue.val();
               //   console.log( vm.allUsers);
               // console.log('users', users, Object.keys(users).length);
                users = _.filter(users, function (user, key) {
                    if (user.usertype == 1 || user.usertype == 3) {
                        user.key = key;
                        return true;
                    }
                });
                $scope.$apply(function () {
                    vm.usersList = users;
                });
            });

            vm.getScheduleListing = function () {
                vm.userData = vm.allUsers[vm.selectedUser];
               //  console.log(vm.userData);
                vm.getListings(vm.selectedUser);
            }

            vm.propertySelected = '';
            vm.unitSelected = '';
            vm.selectedUnitId = '';
            vm.units = [];
            vm.fromDate = '';
            vm.toDate = '';
            vm.fromTime = '';
            vm.toTime = '';
            vm.properties = [];
            vm.listings = [];
            vm.mergeListing = {};
            vm.selectedListings = [];

            vm.getListings = function (landlordId) {
                vm.loader = 1;
                if (!landlordId) {
                    landlordId = vm.selectedUser;
                }
                if (!landlordId) return;

                var propdbObj = firebase.database().ref('propertiesSchedule/').orderByChild("landlordID").equalTo(landlordId).once("value", function (snapshot) {
                    vm.getProperties(landlordId);
                    //console.log('propertyschedule', snapshot.val())
                    $scope.$apply(function () {
                        vm.success = 0;
                        if (snapshot.val()) {
                            vm.listings = snapshot.val();
                            vm.generateMergeListing();
                            vm.listingsAvailable = 1;
                        } else {
                            vm.listingsAvailable = 0;
                        }
                        vm.loader = 0;
                    });
                });
            }

            $scope.openImageModal = function () {
                vm.loader = 1;
                $scope.imageModal = $uibModal.open({
                    
                    templateUrl: 'viewimages.html',
                    controller: 'propertyCtrl',
                    backdrop: 'static',
                    size: 'lg',
                    windowClass: 'zIndex',
                    scope: $scope
                });
            }

            $scope.closeImageModal = function () {
                $scope.imageModal.dismiss('cancel');
            }

            vm.getProperties = function (landlordID, propertyID) {
                var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
                    $scope.$apply(function () {
                        vm.success = 0;
                        if (snapshot.val()) {
                            vm.properties = snapshot.val();
                            vm.propertiesAvailable = 1;
                        } else {
                            vm.propertiesAvailable = 0;
                        }
                        vm.loader = 0;
                    });
                });
            }

            vm.generateMergeListing = function () {
                vm.mergeListing = {};
                _.forEach(vm.listings, function (list, key) {
                    if (!vm.mergeListing[list.link]) {
                        vm.mergeListing[list.link] = angular.copy(vm.listings[key]);
                        vm.mergeListing[list.link].fromToDate = [];
                        var date = '';
                        if (moment(vm.listings[key].fromDate).format('DD MMM') == moment(vm.listings[key].toDate).format('DD MMM')) {
                            date = moment(vm.listings[key].fromDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
                        }
                        else {
                            date = moment(vm.listings[key].fromDate).format('DD') + ' to ' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
                        }
                        vm.mergeListing[list.link].fromToDate.push(date);
                        vm.mergeListing[list.link].keys = [key];
                    } else {
                        var date = '';
                        if (moment(vm.listings[key].fromDate).format('DD MMM') == moment(vm.listings[key].toDate).format('DD MMM')) {
                            date = moment(vm.listings[key].fromDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
                        }
                        else {
                            date = moment(vm.listings[key].fromDate).format('DD') + ' to ' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
                        }
                        vm.mergeListing[list.link].fromToDate.push(date);
                        vm.mergeListing[list.link].keys.push(key);
                    }
                });
         //       console.log(vm.mergeListing)
            };

            vm.clearAll = function ($event) {
                vm.propertySelected = '';
                vm.unitSelected = '';
                vm.selectedUnitId = '';
                vm.units = [];
                vm.fromDate = '';
                vm.toDate = '';
                vm.fromTime = '';
                vm.toTime = '';
                $event.preventDefault();
            }

            vm.checkAllListing = function () {
                $.map(vm.listings, function (value, key) {
                    value.inputCheck = vm.selectedAllListing;
                });
                vm.generateMergeListing();
            };

            vm.statusChangeHandler = function (propertyId, unitId) {
               // console.log(vm.statusChange)
            }

            vm.checkForDuplicate = function (currentUnit) {
                for (var i in vm.listings) {
                    var value = vm.listings[i];
                    if (value.propertyId == currentUnit.propertyId && value.unitID == currentUnit.unitID
                        && value.fromDate == currentUnit.fromDate && value.fromTime == currentUnit.fromTime
                        && value.toDate == currentUnit.toDate && value.toTime == currentUnit.toTime) {
                        return true;
                    }
                }
            };

            vm.addAvailability = function ($event) {
                $event.preventDefault();
                if (!vm.propertySelected || !vm.fromDate || !vm.toDate || !vm.fromTime || !vm.toTime) {
                    return;
                }
                var availabilities = [];
                var url = 'https://vcancy.com/login/#/applyproperty/'
                // if (window.location.host.startsWith('localhost')) {
                // 	url = 'http://localhost:9000/#/applyproperty/'
                // }
                var host = window.location.origin;
                if (host.indexOf('localhost') > -1) {
                    url = host + '/#/applyproperty/';
                } else {
                    url = host + '/login/#/applyproperty/';
                }
                var availability = {
                    propertyId: vm.propertySelected,
                    fromDate: moment(vm.fromDate.toString()).toDate().toString(),
                    fromTime: vm.fromTime,
                    toDate: moment(vm.toDate.toString()).toDate().toString(),
                    toTime: vm.toTime,
                    landlordID: landlordID,
                    userID: userID,
                    link: url + vm.propertySelected,
                    status: 'Not Listed',
                    listOnCraigslist: false
                }
                vm.units = _.map(vm.selectedUnitId, 'unit');
                if (vm.units.length == 0) {
                    return;
                }
                var errorText = ''
                if (vm.units.length > 0) {
                    vm.units.forEach(function (unit) {
                        var data = {
                            unitID: unit
                        };
                        var _unitAvailability = Object.assign(data, availability);
                        _unitAvailability.link = _unitAvailability.link + '?unitId=' + unit;
                        var isDuplicateEntry = vm.checkForDuplicate(_unitAvailability);
                        if (!isDuplicateEntry) {
                            availabilities.push(_unitAvailability);
                        } else {
                            errorText += 'Duplicate entry found for ' + unit + ', ';
                        }
                    });
                    if (errorText != '') {
                        swal({
                            title: 'Some units cannot be saved',
                            text: errorText,
                            type: 'error'
                        });
                    }
                } else {
                    availabilities.push(availability);
                }
                var promises = [];
                var fbObj = firebase.database();
                availabilities.forEach(function (availability) {
                    var promiseObj = fbObj.ref('propertiesSchedule/').push().set(availability)
                    promises.push(promiseObj);
                });
                vm.loader = 1;
                $q.all(promises).then(function () {
                    vm.loader = 0;
                    vm.propertySelected = '';
                    vm.units = [];
                    vm.unitSelected = '';
                    vm.selectedUnitId = '';
                    vm.fromDate = '';
                    vm.toDate = '';
                    vm.fromTime = '';
                    vm.toTime = '';
                    vm.getListings();
                });
            };

            $scope.craigslistopen = function (isOpen) {
                if (isOpen) {
                    var userData = vm.userData;
                    $scope.craigslist = {
                        username: userData.craigslistUserID || '',
                        password: userData.craigslistpassword || '',
                        renewAds: userData.craigslistRenewAds || false,
                        removeAds: userData.craigslistRemoveAds || false
                    }
                    vm.Craigslistopenapp = $uibModal.open({
                        templateUrl: 'craigslist.html',
                        backdrop: 'static',
                        size: 'lg',
                        scope: $scope
                    });
                }
                else {
                    vm.Craigslistopenapp.close();
                }
            };

            $scope.saveCraigslistDetails = function () {
                var fbObj = firebase.database();
                var promiseObj = fbObj.ref('users/' + landlordID).update({
                    craigslistUserID: $scope.craigslist.username,
                    craigslistpassword: $scope.craigslist.password,
                    craigslistRenewAds: $scope.craigslist.renewAds,
                    craigslistRemoveAds: $scope.craigslist.removeAds
                }).then(function () {
                    userData = JSON.parse(localStorage.getItem('userData')) || {};

                    userData['craigslistUserID'] = $scope.craigslist.username,
                        userData['craigslistpassword'] = $scope.craigslist.password,
                        userData['craigslistRenewAds'] = $scope.craigslist.renewAds,
                        userData['craigslistRemoveAds'] = $scope.craigslist.removeAds,
                        localStorage.setItem('userData', JSON.stringify(userData));
                })
                vm.Craigslistopenapp.close();
            }

            vm.deleteListings = function ($event) {
                var selectedListings = [];
                $.map(vm.mergeListing, function (value, key) {
                    if (value.inputCheck) {
                        selectedListings = _.concat(selectedListings, value.keys);
                    }
                });
                if (selectedListings.length == 0) {
                    return;
                }
                var promises = [];
                vm.loader = 1;
                var fbObj = firebase.database();
                selectedListings.forEach(function (listing) {
                    var promiseObj = fbObj.ref('propertiesSchedule/' + listing).remove();
                    promises.push(promiseObj);
                });
                $q.all(promises).then(function () {
                    vm.loader = 0;
                    vm.selectedListings = [];
                    vm.listings = [];
                    vm.selectedAllListing = false;
                    vm.mergeListing = {};
                    vm.getListings();
                }); 
            };
            
            vm.saveaction =function (keys, link, status,key){
  
                 keys.forEach(function (listingId) {
                    var fbObj = firebase.database();
                    fbObj.ref('propertiesSchedule/' + listingId).update({
                        craglistLink: link,
                        status: status
                    }).then(function () {
                        vm.getListings();
                       // console.log()
                    });
                });
                           
                var emailData = '<p>Hello, </p><p>Your request for posting Unit '+vm.mergeListing[key].unitID +' for property address "'+vm.properties[vm.mergeListing[key].propertyId].address+'" has been posted to craglist</p><p>Thanks,</p><p>Team Vcancy</p>';
         
                // Send Email
                emailSendingService.sendEmailViaNodeMailer(vm.userData.email, 'Property Listed on Creaglist', 'Listed', emailData);
                swal({
                    title: 'Success',
                    text: 'Action Save Successfully',
                    type: 'success'
                });

            };

            vm.insertCraglistLink = function (keys, link) {
                keys.forEach(function (listingId) {
                    var fbObj = firebase.database();
                    fbObj.ref('propertiesSchedule/' + listingId).update({
                        craglistLink: link
                    }).then(function () {
                        vm.getListings();
                    });
                });
            };

            vm.toggleStatus = function (keys, status) {
                let toggle = false;
                keys.forEach(function (key) {
                    if (vm.listings[key].listOnCraigslist) {
                        vm.listings[key].listOnCraigslist = !vm.listings[key].listOnCraigslist;
                    }
                    else {
                        vm.listings[key].listOnCraigslist = true;
                    }
                    if (vm.listings[key].listOnCraigslist) {
                        toggle = true;
                    }
                    vm.toggleCraigsList(key, status);
                });
                if (toggle) {
                    swal({
                        title: 'Success',
                        text: 'Your unit will now be listed on Craigslist in 12-24 hours.You will get a notification email when your listing is active.',
                        type: "success",
                    });
                }
            };

            vm.toggleCraigsList = function (listingId, value, $event) {
                vm.loader = 1;
                var fbObj = firebase.database();
                var promiseObj = fbObj.ref('propertiesSchedule/' + listingId).update({
                    status: value
                })
                promiseObj
                    .then(function () {
                        vm.loader = 0;
                        vm.getListings();
                    })
                    .catch(function () {
                        vm.loader = 0;
                    });
            }

            vm.openDetailModel = function (propId, unitId) {
                var index = _.findIndex(vm.properties[propId].unitlists, ['unit', unitId]);
                var prop = vm.properties[propId];
                $scope.selectedUnitDetail = {};
                $scope.selectedUnitDetail.data = vm.properties[propId].unitlists[index];
                $scope.selectedUnitDetail.data.email = localStorage.getItem('userEmail');
                $scope.selectedUnitDetail.index = index;
                $scope.items1 = prop;
                $scope.items1.indexofDetails = index;
                $scope.prop = angular.copy(prop);
                $scope.prop.propID = propId;
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'myModalDetailsContent.html',
                    controller: 'propertyCtrl',
                    backdrop: 'static',
                    size: 'lg',
                    windowClass: '',
                    scope: $scope
                });
            };

            vm.checkIsIncomplete = function (propId, unitId) {
                if (!unitId) {
                    return false;
                }
                if (!vm.properties[propId]) return;
                var unit = _.find(vm.properties[propId].unitlists, ['unit', unitId]);
                var prop = vm.properties[propId];
                return unit.isIncomplete == false ? false : true;
            }




        }]);


'use strict';

vcancyApp
    .controller('adminProfileCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_', 'emailSendingService',
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _, emailSendingService) {

            var vm = this;
            var landlordID = localStorage.getItem('userID');
            vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
            var password = localStorage.getItem('password');
            vm.updatePassword = {};

            vm.changePassword = function () {
                if (vm.updatePassword.newPwd != vm.updatePassword.conPwd) {
                    swal({
                        title: 'Error',
                        text: 'New password should match with confirm password',
                        type: 'error'
                    });
                }
                else if (password != vm.updatePassword.oldPwd) {
                    swal({
                        title: 'Error',
                        text: 'Old password dont match',
                        type: 'error'
                    });
                }
                else if (vm.updatePassword.newPwd == vm.updatePassword.conPwd && vm.userData.email && password == vm.updatePassword.oldPwd) {
                    var user = firebase.auth().currentUser;
                    var newPassword = vm.updatePassword.newPwd;
                    user.updatePassword(newPassword).then(function () {
                        vm.updatePassword = {};
                        swal({
                            title: 'Success',
                            text: 'Password updated',
                            type: 'success'
                        });
                        localStorage.setItem('password', newPassword);
                        var emailData = '<p>Hello, </p><p>Your password has been changed. If you didn’t change the password then please contact  support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                        emailSendingService.sendEmailViaNodeMailer(vm.userData.email, 'Password changed', 'changepassword', emailData);
                    });
                }
            };

            vm.createUserByEmail = function () {

                var usertype = 3;
                var characterArray = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                var pass = '';
                for (var i = 0; i < 6; i++) {
                    var num = Math.floor((Math.random() * 60) + 1);
                    pass += characterArray[num];
                }
                $scope.loader = 1;
                var reguserObj = $firebaseAuth();
                reguserObj.$createUserWithEmailAndPassword(vm.createUser.email, pass)
                    .then(function (firebaseUser) {
                        var reguserdbObj = firebase.database();
                        reguserdbObj.ref('users/' + firebaseUser.uid).set({
                            firstname: 'admin',
                            lastname: 'admin',
                            usertype: usertype,
                            email: vm.createUser.email,
                        });
                        firebase.auth().signInWithEmailAndPassword(vm.createUser.email, pass)
                            .then(function (firebaseUser) {
                                // Success 
                                firebaseUser.sendEmailVerification().then(function () {
                                    $scope.loader = 0;
                                    // Send Email
                                    vm.createUser.email = '';
                                    
                                    swal({
                                        title: 'Success',
                                        text: 'User created',
                                        type: 'success'
                                    });
                                    emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'A new user account has been added to your portal', 'Welcome', emailData);
        
                                    var emailData = '<p>Hello, </p><p>' + vm.createUser.email + ' ,has been added to on https://vcancy.com/ as admin.</p><p>Your password : <strong>' + pass + '</strong></p><p>If you have any questions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
        
                                    // Send Email
                                    emailSendingService.sendEmailViaNodeMailer(vm.createUser.email, 'A new user account has been added to your portal', 'Welcome', emailData);
                                });
                            });
                    });

            };
        }]);

'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
	.controller('adminrentalformCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'Upload', '$http', 'emailSendingService', 'config',
		function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, Upload, $http, emailSendingService, config) {

			var vm = this;
			$scope.active = 0;
			$scope.activateTab = function (tab) {
				$scope.active = tab;
			};
			var tenantID = $stateParams.tenantID;
			var scheduleID = $stateParams.scheduleId;
			var applicationID = $stateParams.applicationId;
			var tenantEmail = localStorage.getItem('userEmail');
			vm.submitemail = $rootScope.renterExternalEmail;
			console.log(vm.submitemail);
			$rootScope.renterExternalEmail = '';
			console.log($rootScope.renterExternalEmail);
			vm.draft = "false";
			vm.draftdata = "false";
			vm.rentownchange = function () {
				if (vm.rentaldata.rent_own == "rent") {
					vm.rentaldata.live_time = '';
					vm.rentaldata.rentamt = '';
					vm.rentaldata.vacantreason = '';
				} else {
					vm.rentaldata.live_time = ' ';
					vm.rentaldata.rentamt = '0.00';
					vm.rentaldata.vacantreason = ' ';
				}

			}

			vm.petschange = function () {
				if (vm.rentaldata.pets == "yes") {
					vm.rentaldata.petsdesc = '';
				} else {
					vm.rentaldata.petsdesc = ' ';
				}
			}

			vm.tenantdata = [];
			vm.rentaldata = [];
			vm.propdata = [];
			vm.scheduledata = [];


			vm.tenantdata.tenantID = '';
			vm.scheduledata.scheduleID = '';
			vm.propdata.propID = '';
			vm.propdata.landlordID = '';

			vm.propdata.address = '';
			vm.propdata.rent = '';
			vm.rentaldata.months = '';
			vm.rentaldata.startdate = '';
			vm.rentaldata.parking = '';
			vm.tenantdata.tenantName = '';
			vm.rentaldata.dob = '';
			vm.rentaldata.sinno = '';
			vm.rentaldata.telwork = '';
			vm.rentaldata.telhome = '';
			vm.tenantdata.tenantEmail = '';
			vm.rentaldata.appaddress = '';
			vm.rentaldata.appcity = '';
			vm.rentaldata.maritalstatus = '';
			vm.rentaldata.rent_own = '';
			vm.rentaldata.live_time = '';
			vm.rentaldata.rentamt = '';
			vm.rentaldata.vacantreason = '';
			vm.rentaldata.landlordname = '';
			vm.rentaldata.landlordphone = '';

			vm.rentaldata.otherappname = [];
			vm.rentaldata.otherappdob = [];
			vm.rentaldata.otherappsinno = [];

			vm.rentaldata.minorappname = [];
			vm.rentaldata.minorappdob = [];
			vm.rentaldata.minorappsinno = [];

			vm.rentaldata.pets = '';
			vm.rentaldata.petsdesc = '';
			vm.rentaldata.smoking = '';
			vm.rentaldata.appfiles = '';

			vm.rentaldata.appcurrentemployer = '';
			vm.rentaldata.appposition = '';
			vm.rentaldata.appemployerphone = '';
			vm.rentaldata.appworkingduration = '';
			vm.rentaldata.appgrossmonthlyincome = '';
			vm.rentaldata.appincometype = '';
			vm.rentaldata.appotherincome = '';

			vm.rentaldata.vehiclemake = '';
			vm.rentaldata.vehiclemodel = '';
			vm.rentaldata.vehicleyear = '';

			vm.rentaldata.vehiclemake2 = '';
			vm.rentaldata.vehiclemodel2 = '';
			vm.rentaldata.vehicleyear2 = '';

			vm.rentaldata.emergencyname = '';
			vm.rentaldata.emergencyphone = '';

			vm.rentaldata.refone_name = '';
			vm.rentaldata.refone_phone = '';
			vm.rentaldata.refone_relation = '';

			vm.rentaldata.reftwo_name = '';
			vm.rentaldata.reftwo_phone = '';
			vm.rentaldata.reftwo_relation = '';

			vm.rentaldata.otherappcurrentemployer = [];
			vm.rentaldata.otherappposition = [];
			vm.rentaldata.otherappemployerphone = [];
			vm.rentaldata.otherappworkingduration = [];
			vm.rentaldata.otherappgrossmonthlyincome = [];
			vm.rentaldata.otherappincometype = [];
			vm.rentaldata.otherappotherincome = [];

			vm.rentaldata.dated = '';
			vm.rentaldata.appsign = '';
			vm.rentaldata.otherappsign = [];

			vm.TCData = '';
			vm.customRentalApplicationCheck = null;
			// DATEPICKER
			vm.today = function () {
				vm.dt = new Date();
			};
			vm.today();

			vm.toggleMin = function () {
				vm.minDate = vm.minDate ? null : new Date();
			};
			vm.toggleMin();




			vm.dobopen = function ($event) {

				$event.preventDefault();
				$event.stopPropagation();
				vm.dobopened = true;
			};
			vm.dobopen1 = function ($event) {

				$event.preventDefault();
				$event.stopPropagation();
				vm.dobopened = false;
			};




			vm.dateopen = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();
				vm.dateopened = true;
			};
			vm.dateopen1 = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();
				vm.dateopened = false;
			};

			vm.minordobopened = [];
			vm.minordobopen = function ($event, minorindex) {
				console.log(minorindex);
				$event.preventDefault();
				$event.stopPropagation();
				angular.forEach(vm.minor, function (value, key) {
					vm.minordobopened[key] = false;
					console.log(vm.minordobopened[key]);
				});
				vm.minordobopened[minorindex] = true;
				console.log("here1" + vm.minordobopened[minorindex]);
			};
			vm.minordobopen1 = function ($event, minorindex) {
				console.log(minorindex);
				$event.preventDefault();
				$event.stopPropagation();
				angular.forEach(vm.minor, function (value, key) {
					vm.minordobopened[key] = false;
					console.log(vm.minordobopened[key]);
				});
				vm.minordobopened[minorindex] = false;
				console.log("here2" + vm.minordobopened[minorindex]);
			};


			vm.adultdobopened = [];
			vm.adultdobopen = function ($event, adultindex) {
				console.log(adultindex);
				$event.preventDefault();
				$event.stopPropagation();
				angular.forEach(vm.adult, function (value, key) {
					vm.adultdobopened[key] = false;
					console.log(vm.adultdobopened[key]);
				});
				vm.adultdobopened[adultindex] = true;
				console.log("here3" + vm.adultdobopened[adultindex]);
			};
			vm.adultdobopen1 = function ($event, adultindex) {
				console.log(adultindex);
				$event.preventDefault();
				$event.stopPropagation();
				angular.forEach(vm.adult, function (value, key) {
					vm.adultdobopened[key] = false;
					console.log(vm.adultdobopened[key]);
				});
				vm.adultdobopened[adultindex] = false;
				console.log("here4" + vm.adultdobopened[adultindex]);
			};

			vm.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};
			vm.maxDate = new Date();
			vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			vm.format = vm.formats[0];


			vm.adult = [];
			vm.minor = [];
			vm.addadult = function (adultlen) {
				vm.adult.push(adultlen);
			}
			vm.addminor = function (minorlen) {
				vm.minor.push(minorlen);
			}



			// to remove adult
			vm.removeadult = function (slotindex) {
				console.log(slotindex, vm.adult);
				vm.adult.splice(slotindex, 1);
				vm.rentaldata.otherappname.splice(slotindex, 1);
				vm.rentaldata.otherappdob.splice(slotindex, 1);
				vm.rentaldata.otherappsinno.splice(slotindex, 1);
				vm.rentaldata.otherappcurrentemployer.splice(slotindex, 1);
				vm.rentaldata.otherappposition.splice(slotindex, 1);
				vm.rentaldata.otherappemployerphone.splice(slotindex, 1);
				vm.rentaldata.otherappworkingduration.splice(slotindex, 1);
				vm.rentaldata.otherappgrossmonthlyincome.splice(slotindex, 1);
				vm.rentaldata.otherappincometype.splice(slotindex, 1);
				vm.rentaldata.otherappotherincome.splice(slotindex, 1);
				vm.rentaldata.otherappsign.splice(slotindex, 1);
			}

			// to remove minor
			vm.removeminor = function (slotindex) {
				console.log(slotindex, vm.adult);
				console.log(vm.rentaldata);
				vm.minor.splice(slotindex, 1);
				vm.rentaldata.minorappdob.splice(slotindex, 1);
				vm.rentaldata.minorappsinno.splice(slotindex, 1);
				vm.rentaldata.minorappname.splice(slotindex, 1);

				console.log(vm.minor, vm.rentaldata);
			}

			$scope.something = function (form) {


				if ($("#test_" + form).val() == '') {
					$("#index_" + form).addClass('has-error');
				} else {
					$("#index_" + form).removeClass('has-error');
				}
			}
			$scope.minorsomething = function (form) {


				if ($("#minortext_" + form).val() == '') {
					$("#minor_" + form).addClass('has-error');
				} else {
					$("#minor_" + form).removeClass('has-error');
				}
			}

			$scope.aacetext = function (form) {


				if ($("#aacetext_" + form).val() == '') {
					$("#aace_" + form).addClass('has-error');
				} else {
					$("#aace_" + form).removeClass('has-error');
				}
			}


			$scope.aapotext = function (form) {


				if ($("#aapotext_" + form).val() == '') {
					$("#aapo_" + form).addClass('has-error');
				} else {
					$("#aapo_" + form).removeClass('has-error');
				}
			}

			$scope.aaeptext = function (form) {


				if ($("#aaeptext_" + form).val() == '') {
					$("#aaep_" + form).addClass('has-error');
				} else {
					$("#aaep_" + form).removeClass('has-error');
				}
			}

			$scope.aahowtext = function (form) {


				if ($("#aahowtext_" + form).val() == '') {
					$("#aahow_" + form).addClass('has-error');
				} else {
					$("#aahow_" + form).removeClass('has-error');
				}
			}

			$scope.aagrstext = function (form) {


				if ($("#aagrstext_" + form).val() == '') {
					$("#aagrs_" + form).addClass('has-error');
				} else {
					$("#aagrs_" + form).removeClass('has-error');
				}
			}

			$scope.aaothrtext = function (form) {


				if ($("#aaothrtext_" + form).val() == '') {
					$("#aaothr_" + form).addClass('has-error');
				} else {
					$("#aaothr_" + form).removeClass('has-error');
				}
			}


			if (applicationID == 0) {
				console.log(tenantID)
				firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).limitToLast(1).once("value", function (snapshot) {
					$scope.$apply(function () {
						if (snapshot.val() !== null) {
							$.map(snapshot.val(), function (value, index) {
								var date = new Date();
								vm.draftdata = "false";
								vm.applicationval = index;
								vm.tenantdata.tenantID = value.tenantID;
								// vm.scheduledata.scheduleID = value.scheduleID;
								// vm.propdata.propID = value.propID;
								// vm.propdata.landlordID = value.landlordID;

								// vm.propdata.address = value.address;
								console.log(value.rent)
								vm.propdata.rent = value.rent;
								vm.rentaldata.months = value.months;
								vm.rentaldata.startdate = value.startdate;
								vm.rentaldata.parking = value.parking;
								vm.rentaldata.telwork = value.telwork;
								vm.rentaldata.telhome = value.telhome;
								vm.tenantdata.tenantEmail = value.applicantemail;
								vm.rentaldata.appaddress = value.appaddress;
								vm.rentaldata.appcity = value.applicantcity;
								vm.rentaldata.maritalstatus = value.maritalstatus;
								vm.rentaldata.rent_own = value.rent_own;
								vm.rentaldata.live_time = value.live_time_at_address;
								vm.rentaldata.rentamt = value.rentamt;
								vm.rentaldata.vacantreason = value.vacantreason;
								vm.rentaldata.landlordname = value.landlordname;
								vm.rentaldata.landlordphone = value.landlordphone;
								vm.rentaldata.pets = value.pets;
								vm.rentaldata.petsdesc = value.petsdesc;
								vm.rentaldata.smoking = value.smoking;
								vm.rentaldata.appfiles = value.appfiles;
								vm.rentaldata.vehiclemake = value.vehiclemake;
								vm.rentaldata.vehiclemodel = value.vehiclemodel;
								vm.rentaldata.vehicleyear = value.vehicleyear;
								vm.rentaldata.vehiclemake2 = value.vehiclemake2;
								vm.rentaldata.vehiclemodel2 = value.vehiclemodel2;
								vm.rentaldata.vehicleyear2 = value.vehicleyear2;
								vm.rentaldata.emergencyname = value.emergencyname;
								vm.rentaldata.emergencyphone = value.emergencyphone;
								vm.rentaldata.refone_name = value.refone_name;
								vm.rentaldata.refone_phone = value.refone_phone;
								vm.rentaldata.refone_relation = value.refone_relation;
								vm.rentaldata.reftwo_name = value.reftwo_name;
								vm.rentaldata.reftwo_phone = value.reftwo_phone;
								vm.rentaldata.reftwo_relation = value.reftwo_relation;
								vm.rentaldata.dated = value.dated != '' ? $filter('date')(new Date(value.dated), 'dd-MMMM-yyyy') : '';
								console.log(scheduleID)
								firebase.database().ref('applyprop/' + scheduleID).once("value", function (snapshot) {
									console.log(snapshot.val())
									$scope.$apply(function () {
										if (snapshot.val()) {
											// console.log('applyprop', snapshot.val())
											vm.scheduledata = snapshot.val();
											vm.scheduledata.scheduleID = snapshot.key;

											firebase.database().ref('properties/' + vm.scheduledata.propID).once("value", function (snap) {
												$scope.$apply(function () {
													if (snap.val()) {
														console.log('properties', snap.val())
														vm.propdata = snap.val();
														vm.propdata.propID = snap.key;
														// if (vm.propdata.units == ' ') {
														// 	var units = '';
														// } else {
														// 	var units = vm.propdata.units + " - ";
														// }
														var unit = vm.propdata.unitlists.find(function (unitObj) {
															if (unitObj.unit == vm.scheduledata.units) {
																return true;
															}
														});
														vm.propdata.rent = parseFloat(unit.rent);
														var leaseLength = ''
														switch (unit.leaseLength) {
															case 'month-to-month':
																leaseLength = 'Month to Month';
																break;
															case '6months':
																leaseLength = '6 Months';
																break;
															case '9months':
																leaseLength = '9 Months';
																break;
															case '12months':
																leaseLength = '12 Months';
																break;
														}
														vm.rentaldata.months = leaseLength;
														vm.propdata.address = vm.scheduledata.units + ' - ' + vm.propdata.address;
														vm.rentaldata.address = vm.propdata.address;
														vm.rentaldata.rent = parseFloat(unit.rent);
														firebase.database().ref('users/' + vm.propdata.landlordID).once("value", function (snap) {
															$scope.$apply(function () {
																vm.landlordData = snap.val();
																if (vm.landlordData && vm.landlordData.customRentalApplicationCheck && vm.landlordData.customRentalApplicationCheck.TCData) {
																	vm.TCData = vm.landlordData.customRentalApplicationCheck.TCData;
																}
																if (vm.landlordData && vm.landlordData.customRentalApplicationCheck) {
																	vm.customRentalApplicationCheck = vm.landlordData.customRentalApplicationCheck
																}
															});
															console.log('vm.landlordData', vm.landlordData);
														});
													}
												});
											});
										}
									});
								});
							});
							firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(vm.applicationval).once("value", function (snap) {
								$scope.$apply(function () {
									if (snap.val() != null) {
										$.map(snap.val(), function (v, k) {
											console.log(v);
											var date = new Date();
											vm.tenantdata.tenantName = v.mainapplicant.applicantname;
											vm.rentaldata.dob = v.mainapplicant.applicantdob != '' ? $filter('date')(new Date(v.mainapplicant.applicantdob), 'dd-MMMM-yyyy') : '';
											vm.rentaldata.sinno = v.mainapplicant.applicantsinno;
											vm.rentaldata.appcurrentemployer = v.mainapplicant.appcurrentemployer;
											vm.rentaldata.appposition = v.mainapplicant.appposition;
											vm.rentaldata.appemployerphone = v.mainapplicant.appemployerphone;
											vm.rentaldata.appworkingduration = v.mainapplicant.appworkingduration;
											vm.rentaldata.appgrossmonthlyincome = v.mainapplicant.appgrossmonthlyincome;
											vm.rentaldata.appincometype = v.mainapplicant.appincometype;
											vm.rentaldata.appotherincome = v.mainapplicant.appotherincome;
											vm.rentaldata.appsign = v.mainapplicant.appsign;


											angular.forEach(v.minors, function (value, key) {
												vm.minor.push(key);
												vm.rentaldata.minorappname.push(value.minorapplicantname);
												vm.rentaldata.minorappdob.push(value.minorapplicantdob != '' ? $filter('date')(new Date(value.minorapplicantdob), 'dd-MMMM-yyyy') : '');
												vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);
											});

											angular.forEach(v.otherapplicants, function (value, key) {
												vm.adult.push(key);
												vm.rentaldata.otherappname.push(value.adultapplicantname);
												vm.rentaldata.otherappdob.push(value.adultapplicantdob != '' ? $filter('date')(new Date(value.adultapplicantdob), 'dd-MMMM-yyyy') : '');
												vm.rentaldata.otherappsinno.push(value.adultapplicantsinno);
												vm.rentaldata.otherappcurrentemployer.push(value.otherappcurrentemployer);
												vm.rentaldata.otherappposition.push(value.otherappposition);
												vm.rentaldata.otherappemployerphone.push(value.otherappemployerphone);
												vm.rentaldata.otherappworkingduration.push(value.otherappworkingduration);
												vm.rentaldata.otherappgrossmonthlyincome.push(value.otherappgrossmonthlyincome);
												vm.rentaldata.otherappincometype.push(value.otherappincometype);
												vm.rentaldata.otherappotherincome.push(value.otherappotherincome);
												vm.rentaldata.otherappsign.push(value.otherappsign);
											});

										});
									}
								});
							});
						} else {
							vm.draftdata = "false";
							firebase.database().ref('applyprop/' + scheduleID).once("value", function (snapshot) {
								console.log(snapshot.val())
								$scope.$apply(function () {
									if (snapshot.val()) {
										// console.log('applyprop', snapshot.val())
										vm.scheduledata = snapshot.val();
										vm.scheduledata.scheduleID = snapshot.key;

										firebase.database().ref('properties/' + vm.scheduledata.propID).once("value", function (snap) {
											$scope.$apply(function () {
												if (snap.val()) {
													console.log('properties', snap.val())
													vm.propdata = snap.val();
													vm.propdata.propID = snap.key;
													// if (vm.propdata.units == ' ') {
													// 	var units = '';
													// } else {
													// 	var units = vm.propdata.units + " - ";
													// }
													var unit = vm.propdata.unitlists.find(function (unitObj) {
														if (unitObj.unit == vm.scheduledata.units) {
															return true;
														}
													});
													vm.propdata.rent = parseFloat(unit.rent);
													var leaseLength = ''
													switch (unit.leaseLength) {
														case 'month-to-month':
															leaseLength = 'Month to Month';
															break;
														case '6months':
															leaseLength = '6 Months';
															break;
														case '9months':
															leaseLength = '9 Months';
															break;
														case '12months':
															leaseLength = '12 Months';
															break;
													}
													vm.rentaldata.months = leaseLength;
													vm.propdata.address = vm.scheduledata.units + ' - ' + vm.propdata.address;
													vm.rentaldata.address = vm.propdata.address;
													vm.rentaldata.rent = parseFloat(unit.rent);
													firebase.database().ref('users/' + vm.propdata.landlordID).once("value", function (snap) {
														$scope.$apply(function () {
															vm.landlordData = snap.val();
															if (vm.landlordData && vm.landlordData.customRentalApplicationCheck && vm.landlordData.customRentalApplicationCheck.TCData) {
																vm.TCData = vm.landlordData.customRentalApplicationCheck.TCData;
															}
															if (vm.landlordData && vm.landlordData.customRentalApplicationCheck) {
																vm.customRentalApplicationCheck = vm.landlordData.customRentalApplicationCheck
															}
														});
														console.log('vm.landlordData', vm.landlordData);
													});
												}
											});
										});
									}
								});
							});


							firebase.database().ref('users/' + tenantID).once("value", function (snapval) {
								$scope.$apply(function () {
									if (snapval.val()) {
										vm.tenantdata = snapval.val();
										vm.tenantdata.tenantID = snapval.key;
										vm.tenantdata.tenantName = vm.tenantdata.firstname + " " + vm.tenantdata.lastname;
										vm.tenantdata.tenantEmail = tenantEmail;
									}
								});
							});
						}
						// console.log(vm.tenantdata);	
						// console.log(vm.rentaldata);	
						// console.log(vm.propdata);	
					});
				});
			} else {
				firebase.database().ref('submitapps/' + $stateParams.applicationId).once("value", function (snapshot) {
					console.log(snapshot.val());
					$scope.$apply(function () {
						if (snapshot.val() !== null) {
							var date = new Date();
							var value = snapshot.val();
							vm.applicationID = $stateParams.applicationId;
							vm.draftdata = "true";
							vm.tenantdata.tenantID = value.tenantID;
							vm.scheduledata.scheduleID = value.scheduleID;
							vm.propdata.propID = value.propID;
							vm.propdata.landlordID = value.landlordID;
							vm.propdata.address = value.address;
							vm.propdata.rent = value.rent;
							vm.rentaldata.months = value.months;
							vm.rentaldata.startdate = value.startdate;
							vm.rentaldata.parking = value.parking;
							vm.rentaldata.telwork = value.telwork;
							vm.rentaldata.telhome = value.telhome;
							vm.tenantdata.tenantEmail = value.applicantemail;
							vm.rentaldata.appaddress = value.appaddress;
							vm.rentaldata.appcity = value.applicantcity;
							vm.rentaldata.maritalstatus = value.maritalstatus;
							vm.rentaldata.rent_own = value.rent_own;
							vm.rentaldata.live_time = value.live_time_at_address;
							vm.rentaldata.rentamt = value.rentamt;
							vm.rentaldata.vacantreason = value.vacantreason;
							vm.rentaldata.landlordname = value.landlordname;
							vm.rentaldata.landlordphone = value.landlordphone;
							vm.rentaldata.pets = value.pets;
							vm.rentaldata.petsdesc = value.petsdesc;
							vm.rentaldata.smoking = value.smoking;
							vm.rentaldata.appfiles = value.appfiles;
							vm.rentaldata.vehiclemake = value.vehiclemake;
							vm.rentaldata.vehiclemodel = value.vehiclemodel;
							vm.rentaldata.vehicleyear = value.vehicleyear;
							vm.rentaldata.vehiclemake2 = value.vehiclemake2;
							vm.rentaldata.vehiclemodel2 = value.vehiclemodel2;
							vm.rentaldata.vehicleyear2 = value.vehicleyear2;
							vm.rentaldata.emergencyname = value.emergencyname;
							vm.rentaldata.emergencyphone = value.emergencyphone;
							vm.rentaldata.refone_name = value.refone_name;
							vm.rentaldata.refone_phone = value.refone_phone;
							vm.rentaldata.refone_relation = value.refone_relation;
							vm.rentaldata.reftwo_name = value.reftwo_name;
							vm.rentaldata.reftwo_phone = value.reftwo_phone;
							vm.rentaldata.reftwo_relation = value.reftwo_relation;
							vm.rentaldata.dated = value.dated;

							vm.TCData = value.TCData;
							vm.customRentalApplicationCheck = value.customRentalApplicationCheck;

							vm.submitemail = value.externalemail;
							firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(vm.applicationID).once("value", function (snap) {
								$scope.$apply(function () {
									if (snap.val() != null) {
										$.map(snap.val(), function (v, k) {
											console.log(v);
											vm.tenantdata.tenantName = v.mainapplicant.applicantname;
											vm.rentaldata.dob = new Date(v.mainapplicant.applicantdob);
											vm.rentaldata.sinno = v.mainapplicant.applicantsinno;
											vm.rentaldata.appcurrentemployer = v.mainapplicant.appcurrentemployer;
											vm.rentaldata.appposition = v.mainapplicant.appposition;
											vm.rentaldata.appemployerphone = v.mainapplicant.appemployerphone;
											vm.rentaldata.appworkingduration = v.mainapplicant.appworkingduration;
											vm.rentaldata.appgrossmonthlyincome = v.mainapplicant.appgrossmonthlyincome;
											vm.rentaldata.appincometype = v.mainapplicant.appincometype;
											vm.rentaldata.appotherincome = v.mainapplicant.appotherincome;
											vm.rentaldata.appsign = v.mainapplicant.appsign;


											angular.forEach(v.minors, function (value, key) {
												vm.minor.push(key);
												vm.rentaldata.minorappname.push(value.minorapplicantname);
												vm.rentaldata.minorappdob.push(new Date(value.minorapplicantdob));
												vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);
											});

											angular.forEach(v.otherapplicants, function (value, key) {
												vm.adult.push(key);
												vm.rentaldata.otherappname.push(value.adultapplicantname);
												vm.rentaldata.otherappdob.push(new Date(value.adultapplicantdob));
												vm.rentaldata.otherappsinno.push(value.adultapplicantsinno);
												vm.rentaldata.otherappcurrentemployer.push(value.otherappcurrentemployer);
												vm.rentaldata.otherappposition.push(value.otherappposition);
												vm.rentaldata.otherappemployerphone.push(value.otherappemployerphone);
												vm.rentaldata.otherappworkingduration.push(value.otherappworkingduration);
												vm.rentaldata.otherappgrossmonthlyincome.push(value.otherappgrossmonthlyincome);
												vm.rentaldata.otherappincometype.push(value.otherappincometype);
												vm.rentaldata.otherappotherincome.push(value.otherappotherincome);
												vm.rentaldata.otherappsign.push(value.otherappsign);
											});

										});
									}
								});
							});
						} else {
							vm.draftdata = "false";
							firebase.database().ref('users/' + tenantID).once("value", function (snapval) {
								$scope.$apply(function () {
									if (snapval.val()) {
										vm.tenantdata = snapval.val();
										vm.tenantdata.tenantID = snapval.key;
										vm.tenantdata.tenantName = vm.tenantdata.firstname + " " + vm.tenantdata.lastname;
										vm.tenantdata.tenantEmail = tenantEmail;
									}
								});
							});
						}
					});
				});
			}

			vm.rentalAppSubmit = function () {
				console.log(vm.rentaldata, vm.draft);
				// alert($('#appfiles').val().split('\\').pop().split('/').pop().split('.')[0]+new Date().getTime());
				var tenantID = vm.tenantdata.tenantID;

				if ($stateParams.scheduleId != 0) {
					var scheduleID = $stateParams.scheduleId;
					var propID = vm.propdata.propID;
					var landlordID = vm.propdata.landlordID;
					var externalappStatus = "submit";
				} else {
					var scheduleID = 0;
					var propID = 0;
					var landlordID = 0;
					var externalappStatus = "submit";
					if (vm.draft == "true") {
						var externalappStatus = "draft";
					} else {
						var externalappStatus = "submit";
					}
				}


				function checkFile() {
					if ($('#uploadfile')[0].files[0]) {
						var _fileName = $('#uploadfile')[0].files[0].name.toLowerCase();
						if ($('#uploadfile')[0].files[0].size > 3145728) {
							return 'File size should be 3 MB or less.'
						} else if (!(_fileName.endsWith('.png'))
							&& !(_fileName.endsWith('.jpg'))
							&& !(_fileName.endsWith('.pdf'))
							&& !(_fileName.endsWith('.jpeg'))) {
							return 'Invalid file type.'
						}
					}
				}
				var fileCheckMsg = checkFile();
				if (fileCheckMsg) {
					swal({
						title: "Error!",
						text: fileCheckMsg,
						type: "error",
					});
					return;
				}
				var externalemail = vm.submitemail == undefined ? '' : vm.submitemail;

				var address = vm.propdata.address == undefined ? '' : vm.propdata.address;
				var rent = vm.propdata.rent == undefined ? '' : vm.propdata.rent;
				var months = vm.rentaldata.months == undefined ? '' : vm.rentaldata.months;
				var startdate = vm.rentaldata.startdate == undefined ? '' : vm.rentaldata.startdate;
				var parking = vm.rentaldata.parking == undefined ? '' : vm.rentaldata.parking;

				var applicantname = vm.tenantdata.tenantName == undefined ? '' : vm.tenantdata.tenantName;
				var applicantdob = vm.rentaldata.dob == undefined ? '' : vm.rentaldata.dob.toString();
				var applicantsinno = vm.rentaldata.sinno == undefined ? '' : vm.rentaldata.sinno;
				var telwork = vm.rentaldata.telwork == undefined ? '' : vm.rentaldata.telwork;
				var telhome = vm.rentaldata.telhome == undefined ? '' : vm.rentaldata.telhome;
				var applicantemail = vm.tenantdata.tenantEmail == undefined ? '' : vm.tenantdata.tenantEmail;
				var appaddress = vm.rentaldata.appaddress == undefined ? '' : vm.rentaldata.appaddress;
				var applicantcity = vm.rentaldata.appcity == undefined ? '' : vm.rentaldata.appcity;
				var maritalstatus = vm.rentaldata.maritalstatus == undefined ? '' : vm.rentaldata.maritalstatus;
				var rent_own = vm.rentaldata.rent_own == undefined ? '' : vm.rentaldata.rent_own;
				var live_time_at_address = vm.rentaldata.live_time == undefined ? '' : vm.rentaldata.live_time;
				var rentamt = vm.rentaldata.rentamt == undefined ? '' : vm.rentaldata.rentamt;
				var vacantreason = vm.rentaldata.vacantreason == undefined ? '' : vm.rentaldata.vacantreason;
				var landlordname = vm.rentaldata.landlordname == undefined ? '' : vm.rentaldata.landlordname;
				var landlordphone = vm.rentaldata.landlordphone == undefined ? '' : vm.rentaldata.landlordphone;

				var adultapplicantname = vm.rentaldata.otherappname;
				var adultapplicantdob = vm.rentaldata.otherappdob;
				var adultapplicantsinno = vm.rentaldata.otherappsinno;

				var minorapplicantname = vm.rentaldata.minorappname;
				var minorapplicantdob = vm.rentaldata.minorappdob;
				var minorapplicantsinno = vm.rentaldata.minorappsinno;

				var pets = vm.rentaldata.pets == undefined ? '' : vm.rentaldata.pets;
				var petsdesc = vm.rentaldata.petsdesc == undefined ? '' : vm.rentaldata.petsdesc;
				var smoking = vm.rentaldata.smoking == undefined ? '' : vm.rentaldata.smoking;

				// var file = $('#appfiles').val().split('\\').pop().split('/').pop();
				// var filename = $('#appfiles').val().split('\\').pop().split('/').pop().split('.')[0]+new Date().getTime();
				// var fileext = $('#appfiles').val().split('\\').pop().split('/').pop().split('.').pop().toLowerCase();
				// var appfiles = "images/applicationuploads/"+filename+"."+fileext;

				var appfiles = $('#appfiles').val();
				var filename = $('#filename').val() === '' ? '' : Date.now() + '_' + $('#filename').val();
				// var filepath = filename != '' ? "https://vcancy.com/login/uploads/" + filename : appfiles;
				var filepath = filename != '' ? "https://vcancy-final.s3.ca-central-1.amazonaws.com/rental-form-files/" + filename : appfiles;
				console.log(filename, filepath, appfiles);

				var appcurrentemployer = vm.rentaldata.appcurrentemployer == undefined ? '' : vm.rentaldata.appcurrentemployer;
				var appposition = vm.rentaldata.appposition == undefined ? '' : vm.rentaldata.appposition;
				var appemployerphone = vm.rentaldata.appemployerphone == undefined ? '' : vm.rentaldata.appemployerphone;
				var appworkingduration = vm.rentaldata.appworkingduration == undefined ? '' : vm.rentaldata.appworkingduration;
				var appgrossmonthlyincome = vm.rentaldata.appgrossmonthlyincome == undefined ? '' : vm.rentaldata.appgrossmonthlyincome;
				var appincometype = vm.rentaldata.appincometype == undefined ? '' : vm.rentaldata.appincometype;
				var appotherincome = vm.rentaldata.appotherincome == undefined ? '' : vm.rentaldata.appotherincome;

				var vehiclemake = vm.rentaldata.vehiclemake == undefined ? '' : vm.rentaldata.vehiclemake;
				var vehiclemodel = vm.rentaldata.vehiclemodel == undefined ? '' : vm.rentaldata.vehiclemodel;
				var vehicleyear = vm.rentaldata.vehicleyear == undefined ? '' : vm.rentaldata.vehicleyear;

				var vehiclemake2 = vm.rentaldata.vehiclemake2 == undefined ? '' : vm.rentaldata.vehiclemake2;
				var vehiclemodel2 = vm.rentaldata.vehiclemodel2 == undefined ? '' : vm.rentaldata.vehiclemodel2;
				var vehicleyear2 = vm.rentaldata.vehicleyear2 == undefined ? '' : vm.rentaldata.vehicleyear2;

				var emergencyname = vm.rentaldata.emergencyname == undefined ? '' : vm.rentaldata.emergencyname;
				var emergencyphone = vm.rentaldata.emergencyphone == undefined ? '' : vm.rentaldata.emergencyphone;

				var refone_name = vm.rentaldata.refone_name == undefined ? '' : vm.rentaldata.refone_name;
				var refone_phone = vm.rentaldata.refone_phone == undefined ? '' : vm.rentaldata.refone_phone;
				var refone_relation = vm.rentaldata.refone_relation == undefined ? '' : vm.rentaldata.refone_relation;

				var reftwo_name = vm.rentaldata.reftwo_name == undefined ? '' : vm.rentaldata.reftwo_name;
				var reftwo_phone = vm.rentaldata.reftwo_phone == undefined ? '' : vm.rentaldata.reftwo_phone;
				var reftwo_relation = vm.rentaldata.reftwo_relation == undefined ? '' : vm.rentaldata.reftwo_relation;

				var otherappcurrentemployer = vm.rentaldata.otherappcurrentemployer;
				var otherappposition = vm.rentaldata.otherappposition;
				var otherappemployerphone = vm.rentaldata.otherappemployerphone;
				var otherappworkingduration = vm.rentaldata.otherappworkingduration;
				var otherappgrossmonthlyincome = vm.rentaldata.otherappgrossmonthlyincome;
				var otherappincometype = vm.rentaldata.otherappincometype;
				var otherappotherincome = vm.rentaldata.otherappotherincome;

				var dated = vm.rentaldata.dated == undefined ? '' : vm.rentaldata.dated.toString();
				var appsign = vm.rentaldata.appsign == undefined ? '' : vm.rentaldata.appsign;
				var otherappsign = vm.rentaldata.otherappsign;
				vm.adultapplicants = [];
				vm.minorapplicants = [];

				vm.adultapplicants = $.map(vm.adult, function (adult, index) {
					return [{
						adultapplicantname: adultapplicantname[index] == undefined ? '' : adultapplicantname[index],
						adultapplicantdob: adultapplicantdob[index] == undefined ? '' : adultapplicantdob[index].toString(),
						adultapplicantsinno: adultapplicantsinno[index] == undefined ? '' : adultapplicantsinno[index],
						otherappcurrentemployer: otherappcurrentemployer[index] == undefined ? '' : otherappcurrentemployer[index],
						otherappposition: otherappposition[index] == undefined ? '' : otherappposition[index],
						otherappemployerphone: otherappemployerphone[index] == undefined ? '' : otherappemployerphone[index],
						otherappworkingduration: otherappworkingduration[index] == undefined ? '' : otherappworkingduration[index],
						otherappgrossmonthlyincome: otherappgrossmonthlyincome[index] == undefined ? '' : otherappgrossmonthlyincome[index],
						otherappincometype: otherappincometype[index] == undefined ? '' : otherappincometype[index],
						otherappotherincome: otherappotherincome[index] == undefined ? '' : otherappotherincome[index],
						otherappsign: otherappsign[index] == undefined ? '' : otherappsign[index]
					}];
				});

				vm.minorapplicants = $.map(vm.minor, function (minor, index) {
					return [{
						minorapplicantname: minorapplicantname[index] == undefined ? '' : minorapplicantname[index],
						minorapplicantdob: minorapplicantdob[index] == undefined ? '' : minorapplicantdob[index].toString(),
						minorapplicantsinno: minorapplicantsinno[index] == undefined ? '' : minorapplicantsinno[index]
					}];
				});
				console.log(vm.adultapplicants);

				var TCData = vm.TCData || '';
				var customRentalApplicationCheck = vm.customRentalApplicationCheck || '';

				if (vm.draftdata == "false" && $stateParams.applicationId == 0) {
					firebase.database().ref('submitapps/').push().set({
						tenantID: tenantID,
						scheduleID: scheduleID,
						propID: propID,
						landlordID: landlordID,

						address: address,
						rent: rent,
						months: months,
						startdate: startdate,
						parking: parking,

						telwork: telwork,
						telhome: telhome,
						applicantemail: applicantemail,
						appaddress: appaddress,
						applicantcity: applicantcity,
						maritalstatus: maritalstatus,
						rent_own: rent_own,
						live_time_at_address: live_time_at_address,
						rentamt: rentamt,
						vacantreason: vacantreason,
						landlordname: landlordname,
						landlordphone: landlordphone,

						pets: pets,
						petsdesc: petsdesc,
						smoking: smoking,
						appfiles: filepath,

						vehiclemake: vehiclemake,
						vehiclemodel: vehiclemodel,
						vehicleyear: vehicleyear,

						vehiclemake2: vehiclemake2,
						vehiclemodel2: vehiclemodel2,
						vehicleyear2: vehicleyear2,

						emergencyname: emergencyname,
						emergencyphone: emergencyphone,

						refone_name: refone_name,
						refone_phone: refone_phone,
						refone_relation: refone_relation,

						reftwo_name: reftwo_name,
						reftwo_phone: reftwo_phone,
						reftwo_relation: reftwo_relation,

						applicantsno: (vm.adult.length) + 1,
						"minorapplicantsno": vm.minor.length || 0,
						externalappStatus: externalappStatus,
						externalemail: externalemail,
						appgrossmonthlyincome: appgrossmonthlyincome,
						dated: dated,

						rentalstatus: "pending",

						TCData: TCData,

						customRentalApplicationCheck: customRentalApplicationCheck
					}).then(function () {
						//Generate the applicant details of submitted app to new table
						firebase.database().ref('submitapps/').limitToLast(1).once("child_added", function (snapshot) {

							if (snapshot.key != "undefined") {
								vm.applicationID = snapshot.key;
								console.log(vm.applicationID);
								var applicantsdata = {
									"applicationID": snapshot.key,
									"mainapplicant": {
										"applicantname": applicantname,
										"applicantdob": applicantdob,
										"applicantsinno": applicantsinno,
										"appcurrentemployer": appcurrentemployer,
										"appposition": appposition,
										"appemployerphone": appemployerphone,
										"appworkingduration": appworkingduration,
										"appgrossmonthlyincome": appgrossmonthlyincome,
										"appincometype": appincometype,
										"appotherincome": appotherincome,
										"appsign": appsign,
									},
									"otherapplicants": vm.adultapplicants,
									"minors": vm.minorapplicants
								}

								console.log(applicantsdata);

								firebase.database().ref('submitappapplicants/').push().set(applicantsdata);

								if (vm.draft == "false") {
									// update the schedule to be aubmitted application
									firebase.database().ref('applyprop/' + scheduleID).update({
										schedulestatus: "submitted"
									})
								}

								if (filename != '') {
									vm.upload(appfiles, filename);
								}

								if (vm.draft == "false") {
									if (landlordID != 0) {
										firebase.database().ref('users/' + landlordID).once("value", function (snap) {
											console.log(snap.val());
											if (snap.val()) {
												var emailData = '<p>Hello ' + applicantname + ', </p><p>Your rental application has been submitted to ' + snap.val().email + '.</p><p>To make changes, please log in at <a href="https://www.vcancy.com/login/" target = "_blank"> vcancy.com </a>  and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

												emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Rental application', 'rentalapp', emailData);
											}
											//var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted a rental application for ' + address + '.</p><p>To view the application, please log in <a href="https://www.vcancy.com/login/" target = "_blank"> vcancy.com </a> and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

											//emailSendingService.sendEmailViaNodeMailer(snap.val().email, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
										});
									} else {
										//var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted an online rental application via vcancy.com. Please go to this link https://www.vcancy.com/login/#/viewexternalapp/' + vm.applicationID + ' to view the application.</p><p>Check out <a href="https://www.vcancy.com/login/" target = "_blank"> vcancy.com </a> to automate viewing appointments and compare rental applications	 online.</p><p>For any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

										//emailSendingService.sendEmailViaNodeMailer(vm.submitemail, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
									}
								}
								$state.go('tenantapplications');
							}
						})
					})
				} else {
					firebase.database().ref('submitapps/' + vm.applicationID).set({
						tenantID: tenantID,
						scheduleID: scheduleID,
						propID: propID,
						landlordID: landlordID,

						address: address,
						rent: rent,
						months: months,
						startdate: startdate,
						parking: parking,

						telwork: telwork,
						telhome: telhome,
						applicantemail: applicantemail,
						appaddress: appaddress,
						applicantcity: applicantcity,
						maritalstatus: maritalstatus,
						rent_own: rent_own,
						live_time_at_address: live_time_at_address,
						rentamt: rentamt,
						vacantreason: vacantreason,
						landlordname: landlordname,
						landlordphone: landlordphone,

						pets: pets,
						petsdesc: petsdesc,
						smoking: smoking,
						appfiles: filepath,

						vehiclemake: vehiclemake,
						vehiclemodel: vehiclemodel,
						vehicleyear: vehicleyear,

						vehiclemake2: vehiclemake2,
						vehiclemodel2: vehiclemodel2,
						vehicleyear2: vehicleyear2,

						emergencyname: emergencyname,
						emergencyphone: emergencyphone,

						refone_name: refone_name,
						refone_phone: refone_phone,
						refone_relation: refone_relation,

						reftwo_name: reftwo_name,
						reftwo_phone: reftwo_phone,
						reftwo_relation: reftwo_relation,

						applicantsno: (vm.adult.length) + 1,
						externalappStatus: externalappStatus,
						externalemail: externalemail,

						dated: dated,

						rentalstatus: "pending",

						TCData: TCData,
						customRentalApplicationCheck: customRentalApplicationCheck
					}).then(function () {
						//Generate the applicant details of submitted app to new table
						var applicantsdata = {
							"applicationID": vm.applicationID,
							"mainapplicant": {
								"applicantname": applicantname,
								"applicantdob": applicantdob,
								"applicantsinno": applicantsinno,
								"appcurrentemployer": appcurrentemployer,
								"appposition": appposition,
								"appemployerphone": appemployerphone,
								"appworkingduration": appworkingduration,
								"appgrossmonthlyincome": appgrossmonthlyincome,
								"appincometype": appincometype,
								"appotherincome": appotherincome,
								"appsign": appsign,
							},
							"otherapplicants": vm.adultapplicants,
							"minors": vm.minorapplicants
						}

						console.log(applicantsdata);
						firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(vm.applicationID).once("value", function (snap) {
							console.log(snap.val());
							if (snap.val() != null) {
								$.map(snap.val(), function (v, k) {
									console.log(k, applicantsdata);
									firebase.database().ref('submitappapplicants/' + k).set(applicantsdata);
								});
							}
						});


						if (vm.draft == "false") {
							// update the schedule to be aubmitted application
							firebase.database().ref('applyprop/' + scheduleID).update({
								schedulestatus: "submitted"
							})
						}
					})

					if (filename != '') {
						vm.upload(appfiles, filename);
					}

					if (vm.draft == "false") {
						if (landlordID != 0) {
							firebase.database().ref('users/' + landlordID).once("value", function (snap) {
								console.log(snap.val());
								if (snap.val()) {
									var emailData = '<p>Hello ' + applicantname + ', </p><p>Your rental application has been submitted to ' + snap.val().email + '.</p><p>To make changes, please log in <a href="http://www.vcancy.com/login/#/" target = "_blank"> vcancy.com </a>  and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

									emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Rental application', 'rentalapp', emailData);
								}
								//var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted a rental application for ' + address + '.</p><p>To view the application, please log in <a href="http://www.vcancy.com/login/#/" target = "_blank"> vcancy.com </a>  and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

								//emailSendingService.sendEmailViaNodeMailer(snap.val().email, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
							});
						} else {
							//var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted an online rental application via vcancy.com. Please go to this link http://www.vcancy.com/login/#/viewexternalapp/' + vm.applicationID + ' to view the application.</p><p>Check out <a href="http://www.vcancy.com/login/#/" target = "_blank"> vcancy.com </a> to automate viewing appointments and compare rental applications	 online.</p><p>For any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

							//emailSendingService.sendEmailViaNodeMailer(vm.submitemail, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
						}


					}
					$state.go('tenantapplications');
				}
			}

			vm.upload = function (file, filename) {
				file = file.replace("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,", "");
				file = file.replace("data:application/pdf;base64,", "");
				file = file.replace(/^data:image\/\w+;base64,/, "");
				file = file.replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", "");
				// console.log(file,filename);
				var _file = $('#uploadfile')[0].files[0];
				AWS.config.update({
					accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
					secretAccessKey: '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'
				});
				AWS.config.region = 'ca-central-1';
				var bucket = new AWS.S3({
					params: {
						Bucket: 'vcancy-final'
					}
				});
				filename = filename.replace(/\s/g, '');

				var params = {
					Key: 'rental-form-files/' + filename,
					ContentType: _file.type,
					Body: _file,
					StorageClass: "STANDARD_IA",
					ACL: 'authenticated-read'
				};

				bucket.upload(params).on('httpUploadProgress', function (evt) { })
					.send(function (err, data) {
						if (data && data.Location) {
							console.log('file uploaded success');
						} else {
							console.error('ERROR in file upload');
						}
					});
			};

			vm.viewFile = function (location) {
				if (!location) {
					return;
				}
				var _params = {
					Bucket: 'vcancy-final',
					Key: location.split(`https://vcancy-final.s3.ca-central-1.amazonaws.com/`)[1],
					Expires: 60 * 5
				}
				AWS.config.update({
					accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
					secretAccessKey: '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'
				});
				AWS.config.region = 'ca-central-1';
				var bucket = new AWS.S3({
					params: {
						Bucket: 'vcancy-final'
					}
				});

				bucket.getSignedUrl('getObject', _params, function (err, data) {
					if (err) return console.log(err, err.stack); // an error occurred

					// var type = 'application/pdf';
					var extension = location.substring(location.lastIndexOf('.'));
					// var file = new Blob([data], { type: 'application/pdf' });
					// saveAs(file, 'filename.pdf');
					// var url = URL.createObjectURL(new Blob([data]));
					var a = document.createElement('a');
					a.href = data;
					a.download = location.substr(location.lastIndexOf('/') + 1);
					a.target = '_blank';
					a.click();
				});
			}

			vm.savechanges = function () {
				vm.draft = "true";
				$rootScope.isFormOpenToSaveInDraft = false;
				// alert(vm.draft);
				vm.rentalAppSubmit();
			}

			vm.printApp = function () {
				var css = '@page { size: landscape; }',
					head = document.head || document.getElementsByTagName('head')[0],
					style = document.createElement('style');

				style.type = 'text/css';
				style.media = 'print';

				if (style.styleSheet) {
					style.styleSheet.cssText = css;
				} else {
					style.appendChild(document.createTextNode(css));
				}

				head.appendChild(style);
				$window.print();
			}

		}])
'use strict';

//=================================================
// View Tenant Application
//=================================================

vcancyApp
	.controller('adminviewappCtrl', ['$scope', '$timeout', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', function ($scope, $timeout, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {

		var vm = this;
		// var tenantID = localStorage.getItem('userID');
		var applicationID = $stateParams.appID;
		// var tenantEmail = localStorage.getItem('userEmail');

		vm.publicappview = $state.current.name == "viewexternalapplication" ? "1" : "0";
		vm.isLoggedIn = ($state.current.name != "viewexternalapplication") && localStorage.getItem('userEmail');

		vm.adult = [];
		vm.minor = [];
		vm.rentaldata = [];

		// DATEPICKER
		vm.today = function () {
			vm.dt = new Date();
		};
		vm.today();

		vm.toggleMin = function () {
			vm.minDate = vm.minDate ? null : new Date();
		};
		vm.toggleMin();

		vm.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
		vm.maxDate = new Date();
		vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		vm.format = vm.formats[0];


		firebase.database().ref('submitapps/' + applicationID).once("value", function (snapshot) {
			console.log(snapshot.val());
			$scope.$apply(function () {
				if (snapshot.val()) {
					var value = snapshot.val();
					console.log(value);
					vm.TCData = value.TCData;
					vm.customRentalApplicationCheck = value.customRentalApplicationCheck;
					vm.rentaldata.tenantID = value.tenantID;
					vm.rentaldata.scheduleID = value.scheduleID;
					vm.rentaldata.propID = value.propID;

					vm.rentaldata.landlordID = value.landlordID;

					vm.rentaldata.address = value.address;
					vm.rentaldata.rent = value.rent;
					vm.rentaldata.months = value.months;
					vm.rentaldata.startdate = value.startdate;
					vm.rentaldata.parking = value.parking;
					vm.rentaldata.telwork = value.telwork;
					vm.rentaldata.telhome = value.telhome;
					vm.rentaldata.tenantEmail = value.applicantemail;
					vm.rentaldata.appaddress = value.appaddress;
					vm.rentaldata.appcity = value.applicantcity;
					vm.rentaldata.maritalstatus = value.maritalstatus;
					vm.rentaldata.rent_own = value.rent_own;
					vm.rentaldata.live_time = value.live_time_at_address;
					vm.rentaldata.rentamt = value.rentamt;
					vm.rentaldata.vacantreason = value.vacantreason;
					vm.rentaldata.landlordname = value.landlordname;
					vm.rentaldata.landlordphone = value.landlordphone;
					vm.rentaldata.pets = value.pets;
					vm.rentaldata.petsdesc = value.petsdesc;
					vm.rentaldata.smoking = value.smoking;
					vm.rentaldata.appfiles = value.appfiles;
					vm.rentaldata.vehiclemake = value.vehiclemake;
					vm.rentaldata.vehiclemodel = value.vehiclemodel;
					vm.rentaldata.vehicleyear = value.vehicleyear;
					vm.rentaldata.emergencyname = value.emergencyname;
					vm.rentaldata.emergencyphone = value.emergencyphone;
					vm.rentaldata.refone_name = value.refone_name;
					vm.rentaldata.refone_phone = value.refone_phone;
					vm.rentaldata.refone_relation = value.refone_relation;
					vm.rentaldata.reftwo_name = value.reftwo_name;
					vm.rentaldata.reftwo_phone = value.reftwo_phone;
					vm.rentaldata.reftwo_relation = value.reftwo_relation;
					vm.rentaldata.dated = new Date(value.dated);
					
					console.log(vm.rentaldata);

					firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(applicationID).once("value", function (snap) {
						$scope.$apply(function () {
							if (snap.val()) {
								$.map(snap.val(), function (v, k) {
									console.log(v);
									vm.rentaldata.tenantName = v.mainapplicant.applicantname;
									vm.rentaldata.dob = new Date(v.mainapplicant.applicantdob);
									vm.rentaldata.sinno = v.mainapplicant.applicantsinno;
									vm.rentaldata.appcurrentemployer = v.mainapplicant.appcurrentemployer;
									vm.rentaldata.appposition = v.mainapplicant.appposition;
									vm.rentaldata.appemployerphone = v.mainapplicant.appemployerphone;
									vm.rentaldata.appworkingduration = v.mainapplicant.appworkingduration;
									vm.rentaldata.appgrossmonthlyincome = v.mainapplicant.appgrossmonthlyincome;
									vm.rentaldata.appincometype = v.mainapplicant.appincometype;
									vm.rentaldata.appotherincome = v.mainapplicant.appotherincome;
									vm.rentaldata.appsign = v.mainapplicant.appsign;

									vm.rentaldata.minorappname = [];
									vm.rentaldata.minorappdob = [];
									vm.rentaldata.minorappsinno = [];

									if (v.minors != undefined) {
										angular.forEach(v.minors, function (value, key) {
											vm.minor.push(key);
											vm.rentaldata.minorappname.push(value.minorapplicantname);
											vm.rentaldata.minorappdob.push(new Date(value.minorapplicantdob));
											vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);
										});
									}
									vm.rentaldata.otherappname = [];
									vm.rentaldata.otherappdob = [];
									vm.rentaldata.otherappsinno = [];
									vm.rentaldata.otherappcurrentemployer = [];
									vm.rentaldata.otherappposition = [];
									vm.rentaldata.otherappemployerphone = [];
									vm.rentaldata.otherappworkingduration = [];
									vm.rentaldata.otherappgrossmonthlyincome = [];
									vm.rentaldata.otherappincometype = [];
									vm.rentaldata.otherappotherincome = [];
									vm.rentaldata.otherappsign = [];

									if (v.otherapplicants != undefined) {
										angular.forEach(v.otherapplicants, function (value, key) {
											vm.adult.push(key);
											vm.rentaldata.otherappname.push(value.adultapplicantname);
											vm.rentaldata.otherappdob.push(new Date(value.adultapplicantdob));
											vm.rentaldata.otherappsinno.push(value.adultapplicantsinno);
											vm.rentaldata.otherappcurrentemployer.push(value.otherappcurrentemployer);
											vm.rentaldata.otherappposition.push(value.otherappposition);
											vm.rentaldata.otherappemployerphone.push(value.otherappemployerphone);
											vm.rentaldata.otherappworkingduration.push(value.otherappworkingduration);
											vm.rentaldata.otherappgrossmonthlyincome.push(value.otherappgrossmonthlyincome);
											vm.rentaldata.otherappincometype.push(value.otherappincometype);
											vm.rentaldata.otherappotherincome.push(value.otherappotherincome);
											vm.rentaldata.otherappsign.push(value.otherappsign);
										});
									}
								});
							}
						});
					});
					if (vm.rentaldata.landlordID) {
						firebase.database().ref('users/' + vm.rentaldata.landlordID).once("value", function (snap) {
							$scope.$apply(function() {
								vm.landlordData = snap.val();
							});
						});
					}
				}
			});
		});

		vm.viewFile = function (location) {
			if (!location) {
				return;
			}
			var _params = {
				Bucket: 'vcancy-final',
				Key: location.split(`https://vcancy-final.s3.ca-central-1.amazonaws.com/`)[1],
				Expires: 60 * 5
			}
			AWS.config.update({
				accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
				secretAccessKey: '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'
			});
			AWS.config.region = 'ca-central-1';
			var bucket = new AWS.S3({
				params: {
					Bucket: 'vcancy-final'
				}
			});

			bucket.getSignedUrl('getObject', _params, function (err, data) {
				if (err) return console.log(err, err.stack); // an error occurred

				// var type = 'application/pdf';
				var extension = location.substring(location.lastIndexOf('.'));
				// var file = new Blob([data], { type: 'application/pdf' });
				// saveAs(file, 'filename.pdf');
				// var url = URL.createObjectURL(new Blob([data]));
				var a = document.createElement('a');
				a.href = data;
				a.download = location.substr(location.lastIndexOf('/') + 1);
				a.target = '_blank';
				a.click();
			});
		}

		vm.printApp = function () {
			vm.printMode = true;
			$timeout(function(){
				$window.print();
			}, 1000);
			$timeout(function(){
				vm.printMode = false;
			}, 3000);
			// vm.printMode = false;
		}
	}])
'use strict';

vcancyApp
    // =========================================================================
    // Base controller for common functions
    // =========================================================================

    .controller('maCtrl', function($timeout, $state, $scope, $firebaseAuth, $rootScope){
      
	   this.usertype = localStorage.getItem('usertype');
	   
	           // Detact Mobile Browser
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
           angular.element('html').addClass('ismobile');
		   this.sidebarToggle = {
				left: false,
				right: false
			}
        } else {
			// By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
			this.sidebarToggle = {
				left: true,
				right: false
			}
		}
		
		//if($state.current.name == "rentalform"){
			this.sidebarToggle = {
				left: false,
				right: false
			}
		//}
		
		// For Mainmenu Active Class
        this.$state = $state;    
        
        // By default template has a boxed layout
        this.layoutType = localStorage.getItem('ma-layout-status');
        
        // For Mainmenu Active Class
        this.$state = $state;    
        
        //Close sidebar on click
        this.sidebarStat = function(event) {
			console.log('here');
            if (!angular.element(event.target).parent().hasClass('active')) {
                this.sidebarToggle.left = false;
            }
        }
        
        //Listview Search (Check listview pages)
        this.listviewSearchStat = false;
        
        this.lvSearch = function() {
            this.listviewSearchStat = true; 
        }
        
        //Listview menu toggle in small screens
        this.lvMenuStat = false;
        
        //Blog
        this.wallCommenting = [];
        
        this.wallImage = false;
        this.wallVideo = false;
        this.wallLink = false;

        //Skin Switch
        this.currentSkin = 'blue';

        this.skinList = [
            'lightblue',
            'bluegray',
            'cyan',
            'teal',
            'green',
            'orange',
            'blue',
            'purple'
        ]

        this.skinSwitch = function (color) {
            this.currentSkin = color;
        }
    
    })





    // =========================================================================
    // Best Selling Widget
    // =========================================================================

    .controller('bestsellingCtrl', function(bestsellingService){
        // Get Best Selling widget Data
        this.img = bestsellingService.img;
        this.name = bestsellingService.name;
        this.range = bestsellingService.range; 
        
        this.bsResult = bestsellingService.getBestselling(this.img, this.name, this.range);
    })

 
    // =========================================================================
    // Todo List Widget
    // =========================================================================

    .controller('todoCtrl', function(todoService){
        
        //Get Todo List Widget Data
        this.todo = todoService.todo;
        
        this.tdResult = todoService.getTodo(this.todo);
        
        //Add new Item (closed by default)
        this.addTodoStat = false;
    })


    // =========================================================================
    // Recent Items Widget
    // =========================================================================

    .controller('recentitemCtrl', function(recentitemService){
        
        //Get Recent Items Widget Data
        this.id = recentitemService.id;
        this.name = recentitemService.name;
        this.parseInt = recentitemService.price;
        
        this.riResult = recentitemService.getRecentitem(this.id, this.name, this.price);
    })


    // =========================================================================
    // Recent Posts Widget
    // =========================================================================
    
    .controller('recentpostCtrl', function(recentpostService){
        
        //Get Recent Posts Widget Items
        this.img = recentpostService.img;
        this.user = recentpostService.user;
        this.text = recentpostService.text;
        
        this.rpResult = recentpostService.getRecentpost(this.img, this.user, this.text);
    })


    //=================================================
    // Profile
    //=================================================

    .controller('profileCtrl', function(growlService){
        
        //Get Profile Information from profileService Service
        
        //User
        this.profileSummary = "Sed eu est vulputate, fringilla ligula ac, maximus arcu. Donec sed felis vel magna mattis ornare ut non turpis. Sed id arcu elit. Sed nec sagittis tortor. Mauris ante urna, ornare sit amet mollis eu, aliquet ac ligula. Nullam dolor metus, suscipit ac imperdiet nec, consectetur sed ex. Sed cursus porttitor leo.";
    
        this.fullName = "Mallinda Hollaway";
        this.gender = "female";
        this.birthDay = "23/06/1988";
        this.martialStatus = "Single";
        this.mobileNumber = "00971123456789";
        this.emailAddress = "malinda.h@gmail.com";
        this.twitter = "@malinda";
        this.twitterUrl = "twitter.com/malinda";
        this.skype = "malinda.hollaway";
        this.addressSuite = "44-46 Morningside Road";
        this.addressCity = "Edinburgh";
        this.addressCountry = "Scotland";

        //Edit
        this.editSummary = 0;
        this.editInfo = 0;
        this.editContact = 0;
    
        
        this.submit = function(item, message) {            
            if(item === 'profileSummary') {
                this.editSummary = 0;
            }
            
            if(item === 'profileInfo') {
                this.editInfo = 0;
            }
            
            if(item === 'profileContact') {
                this.editContact = 0;
            }
            
            growlService.growl(message+' has updated Successfully!', 'inverse'); 
        }

    })



    //=================================================
    // LOGIN
    //=================================================

    .controller('loginCtrl', function(){
        
        //Status
    
        this.login = 1;
        this.register = 0;
        this.forgot = 0;
    })


    //=================================================
    // CALENDAR
    //=================================================
    
    .controller('calendarCtrl', function($modal){
    
        //Create and add Action button with dropdown in Calendar header. 
        this.month = 'month';
    
        this.actionMenu = '<ul class="actions actions-alt" id="fc-actions">' +
                            '<li class="dropdown" dropdown>' +
                                '<a href="" dropdown-toggle><i class="zmdi zmdi-more-vert"></i></a>' +
                                '<ul class="dropdown-menu dropdown-menu-right">' +
                                    '<li class="active">' +
                                        '<a data-calendar-view="month" href="">Month View</a>' +
                                    '</li>' +
                                    '<li>' +
                                        '<a data-calendar-view="basicWeek" href="">Week View</a>' +
                                    '</li>' +
                                    '<li>' +
                                        '<a data-calendar-view="agendaWeek" href="">Agenda Week View</a>' +
                                    '</li>' +
                                    '<li>' +
                                        '<a data-calendar-view="basicDay" href="">Day View</a>' +
                                    '</li>' +
                                    '<li>' +
                                        '<a data-calendar-view="agendaDay" href="">Agenda Day View</a>' +
                                    '</li>' +
                                '</ul>' +
                            '</div>' +
                        '</li>';

            
        //Open new event modal on selecting a day
        this.onSelect = function(argStart, argEnd) {            
            var modalInstance  = $modal.open({
                templateUrl: 'addEvent.html',
                controller: 'addeventCtrl',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    calendarData: function() {
                        var x = [argStart, argEnd];
                        return x;
                    }
                }
            });
        }
    })

    //Add event Controller (Modal Instance)
    .controller('addeventCtrl', function($scope, $modalInstance, calendarData){
        
        //Calendar Event Data
        $scope.calendarData = {
            eventStartDate: calendarData[0],
            eventEndDate:  calendarData[1]
        };
    
        //Tags
        $scope.tags = [
            'bgm-teal',
            'bgm-red',
            'bgm-pink',
            'bgm-blue',
            'bgm-lime',
            'bgm-green',
            'bgm-cyan',
            'bgm-orange',
            'bgm-purple',
            'bgm-gray',
            'bgm-black',
        ]
        
        //Select Tag
        $scope.currentTag = '';
        
        $scope.onTagClick = function(tag, $index) {
            $scope.activeState = $index;
            $scope.activeTagColor = tag;
        } 
        
        //Add new event
        $scope.addEvent = function() {
            if ($scope.calendarData.eventName) {

                //Render Event
                $('#calendar').fullCalendar('renderEvent',{
                    title: $scope.calendarData.eventName,
                    start: $scope.calendarData.eventStartDate,
                    end:  $scope.calendarData.eventEndDate,
                    allDay: true,
                    className: $scope.activeTagColor

                },true ); //Stick the event

                $scope.activeState = -1;
                $scope.calendarData.eventName = '';     
                $modalInstance.close();
            }
        }
        
        //Dismiss 
        $scope.eventDismiss = function() {
            $modalInstance.dismiss();
        }
    })

    // =========================================================================
    // COMMON FORMS
    // =========================================================================

    .controller('formCtrl', function(){
    
        //Input Slider
        this.nouisliderValue = 4;
        this.nouisliderFrom = 25;
        this.nouisliderTo = 80;
        this.nouisliderRed = 35;
        this.nouisliderBlue = 90;
        this.nouisliderCyan = 20;
        this.nouisliderAmber = 60;
        this.nouisliderGreen = 75;
    
        //Color Picker
        this.color = '#03A9F4';
        this.color2 = '#8BC34A';
        this.color3 = '#F44336';
        this.color4 = '#FFC107';
    })


    // =========================================================================
    // PHOTO GALLERY
    // =========================================================================

    .controller('photoCtrl', function(){
        
        //Default grid size (2)
        this.photoColumn = 'col-md-2';
        this.photoColumnSize = 2;
    
        this.photoOptions = [
            { value: 2, column: 6 },
            { value: 3, column: 4 },
            { value: 4, column: 3 },
            { value: 1, column: 12 },
        ]
    
        //Change grid
        this.photoGrid = function(size) {
            this.photoColumn = 'col-md-'+size;
            this.photoColumnSize = size;
        }
    
    })


    // =========================================================================
    // ANIMATIONS DEMO
    // =========================================================================
    .controller('animCtrl', function($timeout){
        
        //Animation List
        this.attentionSeekers = [
            { animation: 'bounce', target: 'attentionSeeker' },
            { animation: 'flash', target: 'attentionSeeker' },
            { animation: 'pulse', target: 'attentionSeeker' },
            { animation: 'rubberBand', target: 'attentionSeeker' },
            { animation: 'shake', target: 'attentionSeeker' },
            { animation: 'swing', target: 'attentionSeeker' },
            { animation: 'tada', target: 'attentionSeeker' },
            { animation: 'wobble', target: 'attentionSeeker' }
        ]
        this.flippers = [
            { animation: 'flip', target: 'flippers' },
            { animation: 'flipInX', target: 'flippers' },
            { animation: 'flipInY', target: 'flippers' },
            { animation: 'flipOutX', target: 'flippers' },
            { animation: 'flipOutY', target: 'flippers'  }
        ]
         this.lightSpeed = [
            { animation: 'lightSpeedIn', target: 'lightSpeed' },
            { animation: 'lightSpeedOut', target: 'lightSpeed' }
        ]
        this.special = [
            { animation: 'hinge', target: 'special' },
            { animation: 'rollIn', target: 'special' },
            { animation: 'rollOut', target: 'special' }
        ]
        this.bouncingEntrance = [
            { animation: 'bounceIn', target: 'bouncingEntrance' },
            { animation: 'bounceInDown', target: 'bouncingEntrance' },
            { animation: 'bounceInLeft', target: 'bouncingEntrance' },
            { animation: 'bounceInRight', target: 'bouncingEntrance' },
            { animation: 'bounceInUp', target: 'bouncingEntrance'  }
        ]
        this.bouncingExits = [
            { animation: 'bounceOut', target: 'bouncingExits' },
            { animation: 'bounceOutDown', target: 'bouncingExits' },
            { animation: 'bounceOutLeft', target: 'bouncingExits' },
            { animation: 'bounceOutRight', target: 'bouncingExits' },
            { animation: 'bounceOutUp', target: 'bouncingExits'  }
        ]
        this.rotatingEntrances = [
            { animation: 'rotateIn', target: 'rotatingEntrances' },
            { animation: 'rotateInDownLeft', target: 'rotatingEntrances' },
            { animation: 'rotateInDownRight', target: 'rotatingEntrances' },
            { animation: 'rotateInUpLeft', target: 'rotatingEntrances' },
            { animation: 'rotateInUpRight', target: 'rotatingEntrances'  }
        ]
        this.rotatingExits = [
            { animation: 'rotateOut', target: 'rotatingExits' },
            { animation: 'rotateOutDownLeft', target: 'rotatingExits' },
            { animation: 'rotateOutDownRight', target: 'rotatingExits' },
            { animation: 'rotateOutUpLeft', target: 'rotatingExits' },
            { animation: 'rotateOutUpRight', target: 'rotatingExits'  }
        ]
        this.fadeingEntrances = [
            { animation: 'fadeIn', target: 'fadeingEntrances' },
            { animation: 'fadeInDown', target: 'fadeingEntrances' },
            { animation: 'fadeInDownBig', target: 'fadeingEntrances' },
            { animation: 'fadeInLeft', target: 'fadeingEntrances' },
            { animation: 'fadeInLeftBig', target: 'fadeingEntrances'  },
            { animation: 'fadeInRight', target: 'fadeingEntrances'  },
            { animation: 'fadeInRightBig', target: 'fadeingEntrances'  },
            { animation: 'fadeInUp', target: 'fadeingEntrances'  },
            { animation: 'fadeInBig', target: 'fadeingEntrances'  }
        ]
        this.fadeingExits = [
            { animation: 'fadeOut', target: 'fadeingExits' },
            { animation: 'fadeOutDown', target: 'fadeingExits' },
            { animation: 'fadeOutDownBig', target: 'fadeingExits' },
            { animation: 'fadeOutLeft', target: 'fadeingExits' },
            { animation: 'fadeOutLeftBig', target: 'fadeingExits'  },
            { animation: 'fadeOutRight', target: 'fadeingExits'  },
            { animation: 'fadeOutRightBig', target: 'fadeingExits'  },
            { animation: 'fadeOutUp', target: 'fadeingExits'  },
            { animation: 'fadeOutUpBig', target: 'fadeingExits'  }
        ]
        this.zoomEntrances = [
            { animation: 'zoomIn', target: 'zoomEntrances' },
            { animation: 'zoomInDown', target: 'zoomEntrances' },
            { animation: 'zoomInLeft', target: 'zoomEntrances' },
            { animation: 'zoomInRight', target: 'zoomEntrances' },
            { animation: 'zoomInUp', target: 'zoomEntrances'  }
        ]
        this.zoomExits = [
            { animation: 'zoomOut', target: 'zoomExits' },
            { animation: 'zoomOutDown', target: 'zoomExits' },
            { animation: 'zoomOutLeft', target: 'zoomExits' },
            { animation: 'zoomOutRight', target: 'zoomExits' },
            { animation: 'zoomOutUp', target: 'zoomExits'  }
        ]

        //Animate    
        this.ca = '';
    
        this.setAnimation = function(animation, target) {
            if (animation === "hinge") {
                animationDuration = 2100;
            }
            else {
                animationDuration = 1200;
            }
            
            angular.element('#'+target).addClass(animation);
            
            $timeout(function(){
                angular.element('#'+target).removeClass(animation);
            }, animationDuration);
        }
    
    })

	
vcancyApp
    // =========================================================================
    // Header
    // =========================================================================
    .controller('headerCtrl', function($timeout, $firebaseAuth, $rootScope, $state,$window){
		var authObj = $firebaseAuth();		
		
		this.userLogout = function(){
			authObj.$signOut();
			$rootScope.user = null;
			localStorage.clear();
			//$state.go('login', {}, {reload: true});
            $('body').hide();
            localStorage.setItem("justOnce", "true");
            window.location = '#/login';


		}
		
        

        // Top Search
        this.openSearch = function(){
            angular.element('#header').addClass('search-toggled');
            angular.element('#top-search-wrap').find('input').focus();
        }

        this.closeSearch = function(){
            angular.element('#header').removeClass('search-toggled');
        }

        //Clear Notification
        this.clearNotification = function($event) {
            $event.preventDefault();
            
            var x = angular.element($event.target).closest('.listview');
            var y = x.find('.lv-item');
            var z = y.size();
            
            angular.element($event.target).parent().fadeOut();
            
            x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
            x.find('.grid-loading').fadeIn(1500);
            var w = 0;
            
            y.each(function(){
                var z = $(this);
                $timeout(function(){
                    z.addClass('animated fadeOutRightBig').delay(1000).queue(function(){
                        z.remove();
                    });
                }, w+=150);
            })
            
            $timeout(function(){
                angular.element('#notifications').addClass('empty');
            }, (z*150)+200);
        }
        
        // Clear Local Storage
        this.clearLocalStorage = function() {
            
            //Get confirmation, if confirmed clear the localStorage
            swal({   
                title: "Are you sure?",   
                text: "All your saved localStorage values will be removed",   
                type: "warning",   
                showCancelButton: true,   
                confirmButtonColor: "#F44336",   
                confirmButtonText: "Yes, delete it!",   
                closeOnConfirm: false 
            }, function(){
                localStorage.clear();
                swal("Done!", "localStorage is cleared", "success"); 
            });
            
        }
        
        //Fullscreen View
        this.fullScreen = function() {
            //Launch
            function launchIntoFullscreen(element) {
                if(element.requestFullscreen) {
                    element.requestFullscreen();
                } else if(element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if(element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if(element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            }

            //Exit
            function exitFullscreen() {
                if(document.exitFullscreen) {
                    document.exitFullscreen();
                } else if(document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if(document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }

            if (exitFullscreen()) {
                launchIntoFullscreen(document.documentElement);
            }
            else {
                launchIntoFullscreen(document.documentElement);
            }
        }
    
    })
'use strict';

//=================================================
// LOGIN, REGISTER
//=================================================

vcancyApp.controller('loginCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$location', '$window', 'emailSendingService', function ($scope, $firebaseAuth, $state, $rootScope, $location, $window, emailSendingService) {

	var vm = this;
	//Status
	vm.login = 1;
	vm.register = 0;
	vm.forgot = 0;
	$rootScope.invalid = '';
	$rootScope.error = '';
	$rootScope.success = '';

	vm.loginUser = function ($user) {
		var email = $user.email;
		var password = $user.password;

		var authObj = $firebaseAuth();
		authObj.$signInWithEmailAndPassword(email, password).then(function (firebaseUser) {
			//alert(JSON.stringify(firebase.auth().currentUser));
			if (firebase.auth().currentUser != null) {
				localStorage.setItem('userID', firebase.auth().currentUser.uid);
				localStorage.setItem('userEmail', firebase.auth().currentUser.email);
				localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
				localStorage.setItem('password', password);

			}

			if (firebase.auth().currentUser != null) {
				$rootScope.uid = firebase.auth().currentUser.uid;
				$rootScope.userEmail = firebase.auth().currentUser.email;
				$rootScope.emailVerified = firebase.auth().currentUser.emailVerified;
				$rootScope.password = firebase.auth().currentUser.password;

			}

			if (!firebase.auth().currentUser.emailVerified) {
				localStorage.setItem('RegEmail', email);
				localStorage.setItem('RegPass', password);
				$rootScope.error = "We've sent you an account confirmation email. Please check your email and Log in.";
				$rootScope.invalid = 'mail';
				authObj.$signOut();
				$rootScope.user = null;
				localStorage.clear();
				$state.go('login');
			} else {
				firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function (userdata) {
					if (userdata.val().usertype === 0) {
						$rootScope.usertype = 0;
						localStorage.setItem('usertype', 0);
						console.log("Signed in as tenant:", firebaseUser.uid);
						localStorage.setItem('userData', JSON.stringify(userdata.val()));
						if (localStorage.getItem('applyhiturl') != undefined && localStorage.getItem('applyhiturl').indexOf("applyproperty") !== -1) {
							window.location.href = localStorage.getItem('applyhiturl');
							localStorage.setItem('applyhiturl', '');
						} else {
							$state.go("tenantdashboard");
						}
					} else if (userdata.val().usertype === 3) {
						$rootScope.usertype = 3;
						localStorage.setItem('usertype', 3);
						localStorage.setItem('userData', JSON.stringify(userdata.val()));
						console.log("Signed in as admin:", firebaseUser.uid);
						$state.go("admindashboard");
					} else {
						if (userdata.val().isDeleted) {
							$state.go('login');
							$rootScope.error = 'User is deleted.';
							return;
						}
						$rootScope.usertype = 1;
						localStorage.setItem('usertype', 1);
						localStorage.setItem('userData', JSON.stringify(userdata.val()));
						console.log("Signed in as landlord:", firebaseUser.uid);
						if (userdata.val().refId) {
							localStorage.setItem('refId', userdata.val().refId);
						}
						$state.go("landlorddashboard");
					}
				});
			}

		}).catch(function (error) {
			//console.log(error);
			if (error.message) {

				if (error.message == "The email address is badly formatted.") {
					$rootScope.error = "Invalid Email.";
				} else {
					$rootScope.error = error.message;
				}

			}

			if (error.code === "auth/invalid-email") {
				$rootScope.invalid = 'loginemail';

			} else if (error.code === "auth/wrong-password") {
				$rootScope.invalid = 'loginpwd';
			} else if (error.code === "auth/user-not-found") {
				$rootScope.invalid = 'all';
			} else {
				console.log('hre');
				$rootScope.invalid = '';
			}
		});

	}

	vm.google = function () {

		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('profile');
		provider.addScope('email');
		firebase.auth().signInWithPopup(provider).then(function (result) {
			// This gives you a Google Access Token.
			var token = result.credential.accessToken;
			console.log("token");
			console.log(token);
			// The signed-in user info.
			var user = result.user;
			console.log("User");
			console.log(user);
		});
	}

	vm.facebook = function () {

		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('user_birthday');

		firebase.auth().signInWithPopup(provider).then(function (result) {
			var token = result.credential.accessToken;
			console.log("token");
			console.log(token);
			// The signed-in user info.
			var user = result.user;
			console.log("User");
			console.log(user);
			// ...
		}).catch(function (error) {
			if (error.message) {
				IN.User.logout();
				if (error.message == "The email address is badly formatted.") {
					$rootScope.error = "Invalid Email.";
					$rootScope.success = '';
				} else {
					$rootScope.error = error.message;
					$rootScope.success = '';
				}
				//$rootScope.error = error.message;

			}

			if (error.code === "auth/invalid-email") {
				$rootScope.invalid = 'regemail';
			} else if (error.code === "auth/weak-password") {
				$rootScope.invalid = 'regpwd';
			} else if (error.code === "auth/email-already-in-use") {
				$rootScope.invalid = 'regpwd';
			} else {
				$rootScope.invalid = '';
			}
		});
	}
	$window.onload = function () {
		IN.Event.on(IN, "auth", vm.getProfileData);
	};

	vm.getProfileData = function () {
		IN.API.Profile("me").fields("id", "first-name", "last-name", "headline", "location", "picture-url", "public-profile-url", "email-address").result(vm.displayProfileData).error(vm.onError);
	}
	vm.displayProfileData = function (data) {
		var user = data.values[0];

		vm.saveUserData(user);
	}

	vm.saveUserData = function (userData) {

		var id = userData.id;
		var email = userData.emailAddress;
		var firstName = userData.firstName;
		var lastName = userData.lastName;
		var password = "secret@1234";
		var reguserObj = $firebaseAuth();

		reguserObj.$createUserWithEmailAndPassword(email, password).then(function (firebaseUser) {
			console.log(firebaseUser)
		}).catch(function (error) {
			console.log(error);
			if (error.message) {
				IN.User.logout();
				if (error.message == "The email address is badly formatted.") {
					$rootScope.error = "Invalid Email.";
					$rootScope.success = '';
				} else {
					$rootScope.error = error.message;
					$rootScope.success = '';
				}
				//$rootScope.error = error.message;

			}

			if (error.code === "auth/invalid-email") {
				$rootScope.invalid = 'regemail';
			} else if (error.code === "auth/weak-password") {
				$rootScope.invalid = 'regpwd';
			} else if (error.code === "auth/email-already-in-use") {
				$rootScope.invalid = 'regpwd';
			} else {
				$rootScope.invalid = '';
			}
		});

	}

	vm.onError = function (error) {
		console.log(error);
	}

	vm.logout = function () {
		IN.User.logout(vm.removeProfileData);
	}

	vm.removeProfileData = function () {

	}

	vm.registerUser = function (reguser) {
		var first = reguser.first;
		var last = reguser.last;
		var email = reguser.email;
		var pass = reguser.pass;
		var cpass = reguser.cpass;
		var usertype = reguser.usertype;
		$rootScope.invalid = '';
		$rootScope.success = '';
		$rootScope.error = '';

		var reguserObj = $firebaseAuth();

		if (cpass === pass) {
			reguserObj.$createUserWithEmailAndPassword(email, pass)
				.then(function (firebaseUser) {
					localStorage.setItem('RegEmail', email);
					localStorage.setItem('RegPass', pass);

					// $scope.$apply(function(){
					firebaseUser.sendEmailVerification().then(function () {
						// console.log("Email Sent");
					}).catch(function (error) {
						// console.log("Error in sending email"+error);
					});

					var reguserdbObj = firebase.database();
					var userData = {
						firstname: first,
						lastname: last,
						usertype: usertype,
						email: email,
						isadded: 1,
						iscancelshow: 1,
						iscreditcheck: 1,
						iscriminalreport: 1,
						isexpiresoon: 1,
						ispropertydelete: 1,
						isrentalsubmit: 1,
						isshowingtime: 1,
						profilepic: 1,
						companyname: ""
					}
					if (userData.usertype == 1) {
						userData.customRentalApplicationCheck = {
							'PAPPD': true,
							'CADDR': true,
							'PADDR': false,
							'AAPPD': false,
							'AAPP1': false,
							'AAPP2': false,
							'ESIV': true,
							'ESIV1': true,
							'VI': false,
							'EC': false,
							'EC1': false,
							'REF': true,
							'REF1': true,
							'REF2': false,
							'UD': true,
							'UDAAPP': false,
							'TC': true
						};
						userData.screeningQuestions = [
							{ id: 'WKRX6Q', label: 'What is your profession?', isChecked: true },
							{ id: 'MV5SML', label: 'Do you have Pets? Provide details', isChecked: true },
							{ id: 'N1F5MO', label: 'Are you able to provide references?', isChecked: false },
							{ id: 'OU489L', label: 'Why are you moving?', isChecked: false },
							{ id: 'U0G6V8', label: 'Tell me a bit about yourself', isChecked: true },
							{ id: 'A9OG32', label: 'No. of Applicants', isChecked: true },
							{ id: 'UH7JZS', label: 'Do you smoke?', isChecked: true },
							{ id: 'ZGJQ60', label: 'Move-in date', isChecked: true },
						]
					}
					reguserdbObj.ref('users/' + firebaseUser.uid).set(userData);

					if (usertype == 0) {
						var emailData = '<p>Hello ' + firstname + ', </p><p>Thanks for signing up for Vcancy!</p><p>We’ve built Vcancy from the heart to help renters find a place faster and standout from the crowd. You can schedule multiple same-day viewings and submit your rental applications online. </p><p>Our team is working hard to make the rental process seamless and automated. We would love to have your feedback on our the web-app. You can reach us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

						// Send Email
						emailSendingService.sendEmailViaNodeMailer(email, 'Welcome to Vcancy', 'Welcome', emailData);
					}
					if (usertype == 1) {
						var emailData = '<p>Hello, </p><p>Thanks for signing up!</p><p>We’ve built Vcancy from the heart to help busy landlords and property management companies find the best tenants faster by saving them time and labour costs. </p><p>We are always working hard make the tenant onboarding process seamless and automated. Please feel free to reach out to us if you have any suggestions about the web-app at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

						// Send Email
						emailSendingService.sendEmailViaNodeMailer(email, 'Welcome to Vcancy', 'Welcome', emailData);
					}

					$rootScope.success = "We've sent you an account confirmation email. Please check your email and Log in. ";
					$rootScope.error = '';
					reguser.first = '';
					reguser.last = '';
					reguser.email = '';
					reguser.pass = '';
					reguser.cpass = '';
					reguser.usertype = -1;
					vm.reguser = reguser;

					// When apply property url hit direct login and redirect to apply link url on signup successful
					if (localStorage.getItem('applyhiturl') != undefined && localStorage.getItem('applyhiturl').indexOf("applyproperty") !== -1 && usertype === 0) {
						var authObj = $firebaseAuth();
						authObj.$signInWithEmailAndPassword(email, pass).then(function (firebaseUser) {
							if (firebase.auth().currentUser != null) {
								localStorage.setItem('userID', firebase.auth().currentUser.uid);
								localStorage.setItem('userEmail', firebase.auth().currentUser.email);
								localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
							}

							if (firebase.auth().currentUser != null) {
								$rootScope.uid = firebase.auth().currentUser.uid;
								$rootScope.userEmail = firebase.auth().currentUser.email;
								$rootScope.emailVerified = firebase.auth().currentUser.emailVerified;
							}

							firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function (userdata) {
								if (userdata.val().usertype === 0) {
									$rootScope.usertype = 0;
									localStorage.setItem('usertype', 0);
									console.log("Signed in as tenant:", firebaseUser.uid);

									window.location.href = localStorage.getItem('applyhiturl');
									localStorage.setItem('applyhiturl', '');
								}
							});
						});
					}
					// Ends Here
					// });
				}).catch(function (error) {
					//console.log(error);
					if (error.message) {
						if (error.message == "The email address is badly formatted.") {
							$rootScope.error = "Invalid Email.";
							$rootScope.success = '';
						} else {
							$rootScope.error = error.message;
							$rootScope.success = '';
						}
						//$rootScope.error = error.message;

					}

					if (error.code === "auth/invalid-email") {
						$rootScope.invalid = 'regemail';
					} else if (error.code === "auth/weak-password") {
						$rootScope.invalid = 'regpwd';
					} else {
						$rootScope.invalid = '';
					}
				});
		} else {
			$rootScope.invalid = 'regcpwd';
			$rootScope.error = 'Passwords don’t match.';
			$rootScope.success = '';
		}

		vm.reguser = reguser;
	}

	vm.forgotpwdmail = function (forgot) {
		var email = forgot.email;
		$rootScope.invalid = '';
		$rootScope.success = '';
		$rootScope.error = '';

		var forgotuserObj = $firebaseAuth();
		forgotuserObj.$sendPasswordResetEmail(email).then(function () {
			$rootScope.success = 'Password reset email sent to your inbox. Please check your email.';
			$rootScope.error = '';
			vm.forgotuser.email = '';
		}).catch(function (error) {
			console.error("Error: ", error);
			if (error.message) {
				$rootScope.error = error.message;
				$rootScope.success = '';
			}
		});

	}

	vm.resendmail = function () {
		$rootScope.success = 'Confirmation email resent';
		var email = localStorage.getItem('RegEmail');
		var pass = localStorage.getItem('RegPass');
		if (email != null && pass != null) {
			firebase.auth().signInWithEmailAndPassword(email, pass)
				.then(function (firebaseUser) {
					// Success 
					firebaseUser.sendEmailVerification().then(function () {
						console.log("Email Sent");
						$rootScope.success = 'Confirmation email resent';
						//$rootScope.success = 'Sent mail in your mail box please check your Email';
						$rootScope.error = '';

					}).catch(function (error) {
						console.log("Error in sending email" + error);
					});
				})
				.catch(function (error) {
					console.log(error);
					// Error Handling
				});

		}
	}

}]);

'use strict';

//=================================================
// PROPERTY
//=================================================

vcancyApp.controller('propertyCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'slotsBuildService', 'emailSendingService', '$http', '$location', '$log', '$uibModal', '$q'
    , function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, slotsBuildService, emailSendingService, $http, $location, $log, $uibModal, $q) {
        $rootScope.invalid = '';
        $rootScope.success = '';
        $rootScope.error = '';
        $rootScope.message = '';

        var todaydate = new Date();
        var dateconfig = new Date(new Date().setMinutes(0));
        var url = $location.absUrl();
        var oldtimeSlotLen = 0;

        var swal = window.swal;

        var vm = this;
        vm.propsavail = 1;
        vm.timeslotmodified = "false";
        vm.isDisabled = false;
        vm.googleAddress = 0;
        vm.more = '';
        vm.city = '';
        vm.province = '';
        vm.postcode = '';
        vm.country = '';
        vm.noofunits = 0;
        vm.checkedRow = {};
        $scope.imageCount = 0;
        $scope.loader = 0;
        // $scope.unitVacant = [];

        vm.table = 1;
        vm.csv = 0;
        vm.localpropID = '';


        vm.testsweet = function () {
            // swal({
            //     title: "Success!",
            //     text: "Your Property Created successfully!",
            //     type: "success",
            //     confirmButtonColor: '#009999',
            //     confirmButtonText: "Add Units"
            // }, function (isConfirm) {
            //     if (isConfirm) {
            //         window.location.href = "http://google.com";
            //     }
            // });
            //swal("Your Property Created successfully!", "You clicked the button And add units!", "success")
        }
        var landlordID = ''
        if (localStorage.getItem('refId')) {
            landlordID = localStorage.getItem('refId')
        } else {
            landlordID = localStorage.getItem('userID');
        }

        firebase.database().ref('users/' + landlordID).once("value", function (snap) {
            vm.landlordname = snap.val().firstname + " " + snap.val().lastname;
        });

        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
            var address = vm.prop.address.getPlace();
            var arrAddress = address.address_components;
            vm.googleAddress = 1;
            vm.prop.address = address.formatted_address;

            var itemRoute = '';
            var itemLocality = '';
            var itemCountry = '';
            var itemPc = '';
            var itemSnumber = '';
            var street_number = '';

            $.each(arrAddress, function (i, address_component) {
                if (address_component.types[0] == "street_number") {
                    itemSnumber = address_component.long_name;
                    street_number += address_component.long_name + " ";
                }

                if (address_component.types[0] == "route") {
                    itemRoute = address_component.long_name;
                    var route = address_component.long_name;
                    vm.prop.address = street_number + address_component.long_name;
                }

                if (address_component.types[0] == "administrative_area_level_1") {
                    itemRoute = address_component.short_name;
                    vm.prop.province = address_component.short_name;
                }

                if (address_component.types[0] == "locality") {
                    itemLocality = address_component.long_name;
                    vm.prop.city = address_component.long_name;
                }

                if (address_component.types[0] == "country") {
                    itemCountry = address_component.long_name;
                    vm.prop.country = address_component.long_name;
                }

                if (address_component.types[0] == "postal_code_prefix") {
                    itemPc = address_component.long_name;
                }


                if (address_component.types[0] == "postal_code") {
                    itemSnumber = address_component.long_name;

                    vm.prop.postcode = address_component.long_name;
                }

                if (address_component.types[0] == "sublocality_level_1") {
                    itemRoute = address_component.long_name;
                    vm.prop.address = address_component.long_name;

                }

            });


            vm.addresschange();
            $scope.$apply();
        });

        vm.copy = "Copy Link";
        $scope.copySuccess = function (e) {
            vm.copy = "Copied";
            $scope.$apply();
        };

        vm.csvform = function () {
            vm.table = 0;
            vm.csv = 1;

        }

        vm.doSomething = function () {
            console.log("Form Edit changes something");
        }
        // timeSlot for Date and Timepicker
        vm.addTimeSlot = function (slotlen) {

            for (var i = 0; i < slotlen; i++) {
                vm.newTime = false;
            }

            vm.timeSlot.push({
                date: dateconfig
            });
            vm.prop.multiple[slotlen] = true;
            vm.newTime = true;

        }

        // to remove timeslots
        vm.removeTimeSlot = function (slotindex) {
            if (vm.timeSlot.length == 1) {

            } else {
                if ($state.current.name == 'editprop') {
                    if ($window.confirm("Are you sure you want to delete this viewing slot? ")) {
                        if (slotindex < oldtimeSlotLen) {
                            vm.timeslotmodified = "true";
                        }
                        vm.timeSlot.splice(slotindex, 1);
                        vm.prop.date.splice(slotindex, 1);
                        vm.prop.fromtime.splice(slotindex, 1);
                        vm.prop.to.splice(slotindex, 1);
                        vm.prop.limit.splice(slotindex, 1);
                        vm.prop.multiple.splice(slotindex, 1);
                    }
                } else {
                    vm.timeSlot.splice(slotindex, 1);
                    vm.prop.date.splice(slotindex, 1);
                    vm.prop.fromtime.splice(slotindex, 1);
                    vm.prop.to.splice(slotindex, 1);
                    vm.prop.limit.splice(slotindex, 1);
                    vm.prop.multiple.splice(slotindex, 1);
                }
            }

        }
        // DATEPICKER
        vm.today = function () {
            vm.dt = new Date();
        };
        vm.today();

        vm.toggleMin = function () {
            vm.minDate = vm.minDate ? null : new Date();
        };
        vm.toggleMin();

        vm.open = function ($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            angular.forEach(vm.timeSlot, function (value, key) {
                value.opened = false;
            });
            opened.opened = true;
        };

        vm.units = function (value) {

            if (value != '' && value != null) {
                $window.location.href = '#/addunits/' + value;
            }
        };

        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        vm.format = vm.formats[0];

        vm.timeopen = function ($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            angular.forEach(vm.timeSlot, function (value, key) {
                value.opened = false;
            });
            vm.opened = true;
        };

        //  TIMEPICKER
        vm.mytime = new Date();
        vm.ck = [];
        vm.getNumber = function (num) {
            vm.ck = new Array(num);
            console.log(vm.ck);
            return vm.ck;
        }

        vm.arraytest = function () {

            var listToDelete = ['abc', 'efg'];

            var arrayOfObjects = [{ id: 'abc', name: 'oh' }, // delete me
            { id: 'efg', name: 'em' }, // delete me
            { id: 'hij', name: 'ge' }] // all that should remain
            console.log(arrayOfObjects);
            //var animals = [{"status":"Available"},{"status":"Available"},{"status":"Available"},{"status":"Available"}];
            var test = [];
            for (var i = 0; i < arrayOfObjects.length; i++) {
                var obj = arrayOfObjects[i];

                if (i != 0) {
                    test.push(obj)
                }
                console.log(arrayOfObjects);
            }

            console.log(test);

        }

        vm.hstep = 1;
        vm.mstep = 5;

        vm.options = {
            hstep: [1, 2, 3],
            mstep: [1, 5, 10, 15, 25, 30]
        };

        vm.minDate = new Date();

        vm.newTime = false;

        vm.ismeridian = true;

        vm.toggleMode = function () {
            vm.ismeridian = !vm.ismeridian;
        };

        vm.update = function () {
            var d = new Date();
            d.setHours(14);
            d.setMinutes(0);
            vm.mytime = d;
        };


        vm.addresschange = function () {
            /*  console.log(vm.prop.address);*/
            if (vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)) {
                vm.isDisabled = false;
            } else {
                vm.isDisabled = true;
            }
        }

        vm.datetimeslotchanged = function (key) {
            if (key < oldtimeSlotLen) {
                vm.timeslotmodified = "true";
            }
            if (vm.prop.fromtime[key] === undefined) {
                var fromtime = dateconfig;
            } else {
                var fromtime = vm.prop.fromtime[key];
            }

            if (vm.prop.to[key] === undefined) {
                var to = dateconfig;
            } else {
                var to = vm.prop.to[key];
            }

            vm.overlap = 0;

            for (var i = 0; i < vm.prop.date.length; i++) {
                if (i != key) {
                    if (vm.prop.fromtime[i] === undefined) {
                        var ftime = dateconfig;
                    } else {
                        var ftime = vm.prop.fromtime[i];
                    }

                    if (vm.prop.to[i] === undefined) {
                        var totime = dateconfig;
                    } else {
                        var totime = vm.prop.to[i];
                    }

                    console.log(fromtime > ftime, to > ftime, fromtime > totime, to > totime);

                    if ((moment(fromtime).format('HH:mm') <= moment(ftime).format('HH:mm') && moment(to).format('HH:mm') <= moment(ftime).format('HH:mm') && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) || (moment(fromtime).format('HH:mm') >= moment(totime).format('HH:mm') && moment(to).format('HH:mm') >= moment(totime).format('HH:mm') && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) || moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isBefore(moment(vm.prop.date[i]).format('DD-MMMM-YYYY')) || moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isAfter(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) {

                    } else {
                        vm.overlap = 1;
                    }
                }
            }

            if (vm.overlap == 1) {
                vm.prop.timeoverlapinvalid[key] = 1;
                vm.isDisabled = true;
            } else {
                vm.prop.timeoverlapinvalid[key] = 0;
            }

            var temp = new Date(fromtime.getTime() + 30 * 60000)
            if (moment(to).format('HH:mm') < moment(temp).format('HH:mm') && vm.prop.timeoverlapinvalid[key] == 0) {
                vm.prop.timeinvalid[key] = 1;
                vm.isDisabled = true;
            } else {
                vm.prop.timeinvalid[key] = 0;
            }

            if ((vm.prop.multiple[key] === false || vm.prop.multiple[key] === undefined) && vm.prop.timeinvalid[key] == 0) {
                var minutestimediff = (to - fromtime) / 60000;
                var subslots = Math.floor(Math.ceil(minutestimediff) / 30);

                if (vm.prop.limit[key] > subslots) {
                    vm.prop.invalid[key] = 1;
                    vm.isDisabled = true;
                } else {
                    vm.prop.invalid[key] = 0;
                    if (vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)) {
                        vm.isDisabled = false;
                    } else {
                        vm.isDisabled = true;
                    }
                }
            } else if ((vm.prop.multiple[key] === true) && vm.prop.timeinvalid[key] == 0) {
                vm.prop.invalid[key] = 0;
                vm.isDisabled = false;
            }
        }

        vm.clear = function () {
            vm.mytime = null;
        };

        // Go Back To View Property
        vm.backtoviewprop = function (value = '') {
            if (value != '') {
                if (confirm('If you go back without updating values, your changes will be lost!')) {
                    $state.go('viewprop');
                } else {
                    return false;
                }
            } else {
                $state.go('viewprop');
            }

        }

        vm.selectCheckbox = function (value, index) {
            if (!vm.prop.unitlists[index].Aminities || !(vm.prop.unitlists[index].Aminities instanceof Array)) {
                vm.prop.unitlists[index].Aminities = [];
            }
            if (vm.prop.unitlists[index].Aminities.includes(value)) {
                vm.prop.unitlists[index].Aminities.splice(vm.prop.unitlists[index].Aminities.indexOf(value), 1);
            } else {
                vm.prop.unitlists[index].Aminities.push(value);
            }
        }

        // Add/Edit Property       
        vm.submitProp = function (property) {

            AWS.config.update({
                accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
                secretAccessKey: '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'
            });
            AWS.config.region = 'ca-central-1';

            var bucket = new AWS.S3({
                params: {
                    Bucket: 'vcancy-final'
                }
            });
            var fileChooser = document.getElementById('file');
            var file = fileChooser.files[0];
            var propimg = '';


            var propertyObj = $firebaseAuth();

            var propdbObj = firebase.database();

            var propID = property.propID;
            var propstatus = property.propstatus == '' ? false : property.propstatus;
            var proptype = property.proptype;
            var units = property.units;
            var multiple = property.noofunits;
            var shared = property.shared == '' ? false : property.shared;
            var address = property.address;
            var city = property.city;
            var province = property.province;
            var country = property.country;
            var postcode = property.postcode;
            var name = property.name;
            var landlordID = ''
            if (localStorage.getItem('refId')) {
                landlordID = localStorage.getItem('refId')
            } else {
                landlordID = localStorage.getItem('userID');
            }

            if (file != undefined) {
                var filename = moment().format('YYYYMMDDHHmmss') + file.name;
                filename = filename.replace(/\s/g, '');

                if (file.size > 3145728) {
                    swal({
                        title: "Error!",
                        text: 'File size should be 3 MB or less.',
                        type: "error",
                    });
                    return false;
                } else if (
                    file.type != 'image/png' &&
                    file.type != 'image/jpeg' &&
                    file.type != 'image/jpg') {
                    swal({
                        title: "Error!",
                        text: 'Invalid file type.',
                        type: "error",
                    });
                    return false;
                }



                var params = {
                    Key: 'property-images/' + filename,
                    ContentType: file.type,
                    Body: file,
                    StorageClass: "STANDARD_IA",
                    ACL: 'public-read'
                };

                bucket.upload(params).on('httpUploadProgress', function (evt) {
                    //  console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total)+'%');
                    $rootScope.$apply(function () {
                        $rootScope.success = "Please Wait.. !";
                    });
                }).send(function (err, data) {
                    if (data.Location != '') {
                        propimg = data.Location;
                        // Start Of property Add
                        var unitlists = vm.createNewPropertyWithUnits(property)
                        if (propID == '') {
                            propdbObj.ref('properties/').push().set({
                                landlordID: landlordID,
                                propimg: propimg,
                                propstatus: propstatus,
                                proptype: proptype,
                                unitlists: unitlists,
                                units: units,
                                shared: shared,
                                address: address,
                                city: city,
                                province: province,
                                noofunits: multiple,
                                country: country,
                                postcode: postcode,
                                date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                                multiple: multiple,
                                name: name
                            }).then(function (data) {
                                console.log(data)
                                console.log("Insert Data successfully!");

                                propdbObj.ref('properties/').limitToLast(1).once("child_added", function (snapshot) {
                                    //localStorage.setItem("propID", snapshot.key);
                                    vm.opensuccesssweet(snapshot.key);
                                    $state.go('editprop', { propId: snapshot.key }) //unitlist
                                    // $rootScope.$apply(function () {
                                    //     console.log(units);
                                    //     $rootScope.units = units;
                                    //     $rootScope.message = units;
                                    //     $rootScope.success = "Property added successfully!";
                                    //     $rootScope.propID = snapshot.key;
                                    // });


                                });

                            });
                        } else {

                            propdbObj.ref('properties/' + propID).update({
                                landlordID: landlordID,
                                propimg: propimg,
                                propstatus: propstatus,
                                proptype: proptype,
                                units: units,
                                shared: shared,
                                address: address,
                                city: city,
                                province: province,
                                country: country,
                                postcode: postcode,
                                noofunits: multiple,
                                date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                                multiple: multiple,
                                name: name

                            }).then(function () {
                                $rootScope.$apply(function () {
                                    console.log(units);
                                    $rootScope.units = units;
                                    $rootScope.message = units;
                                    $rootScope.success = "Property Updated!";
                                    $rootScope.propID = propID;


                                });
                            });
                        } // End OF property Add - Edit

                        /* localStorage.setItem('propertysuccessmsg','Property updated successfully.');
                                 angular.forEach(vm.scheduleIDs, function(value, key) {
                                     firebase.database().ref('applyprop/'+value).update({    
                                         schedulestatus: "cancelled"
                                     })
                                     // console.log(value);
                                 });     
    
                                 if(propstatus === false){
                                     var emailData = '<p>Hello, </p><p>'+address+' been successfully <strong>deactivated</strong>.</p><p>You will no longer receive viewing requests and rental applications.</p><p>To make changes or reactivate, please log in at http://vcancy.com/login/ and go to “My Properties”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                                         
                                     // Send Email
                                     emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), address+' has been deactivated', 'deactivateproperty', emailData);
                              
                                     angular.forEach(vm.tenants, function(tenantID, key) {
                                         firebase.database().ref('users/'+tenantID).once("value", function(snap) {
                                             var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has deactivated this property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                                         
                                             // Send Email
                                             emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'delproperty', emailData);
                                         });
                                     });
                                 } else {
                                     var emailData = '<p>Hello, </p><p>Your property <em>'+address+'</em>   has been successfully updated and all your property viewings affected by the updated time slots are cancelled. </p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                                             
                                     // Send Email
                                     emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Property Time Slots updated on Vcancy', 'updateproperty', emailData);
                              
                                     angular.forEach(vm.tenants, function(tenantID, key) {
                                         firebase.database().ref('users/'+tenantID).once("value", function(snap) {
                                             var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has made some changes in time slots for this property.</p><p>To reschedule the viewing and book some another available time, please log in at http://vcancy.com/login/ and use the link initially provided to schedule the viewing or follow the link http://www.vcancy.com/login/#/applyproperty/'+$stateParams.propId+'.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                                         
                                             // Send Email
                                             emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'updateproperty', emailData);
                                         });
                                     });
                                 } */
                    }
                });

            } else {

                // Start Of property Add
                if (propID == '') {
                    var unitlists = vm.createNewPropertyWithUnits(property)
                    propdbObj.ref('properties/').push().set({
                        landlordID: landlordID,
                        propimg: propimg,
                        unitlists: unitlists,
                        propstatus: propstatus,
                        proptype: proptype,
                        units: units,
                        shared: shared,
                        address: address,
                        city: city,
                        province: province,
                        country: country,
                        noofunits: multiple,
                        postcode: postcode,
                        date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                        multiple: multiple,
                        name: name
                    }).then(function (data) {
                        console.log(data)
                        console.log("Data added successfully!");
                        propdbObj.ref('properties/').limitToLast(1).once("child_added", function (snapshot) {
                            vm.opensuccesssweet(snapshot.key);
                            $state.go('editprop', { propId: snapshot.key })
                            // $rootScope.$apply(function () {
                            //     console.log(units);
                            //     $rootScope.units = units;
                            //     $rootScope.message = units;
                            //     $rootScope.success = "Property Added successfully!";
                            //     $rootScope.propID = snapshot.key;


                            //                        });
                        });

                    });
                } else {
                    if ($('#propimg').val() != '') {
                        propimg = $('#propimg').val();
                    }

                    propdbObj.ref('properties/' + propID).update({
                        landlordID: landlordID,
                        propstatus: propstatus,
                        proptype: proptype,
                        units: units,
                        propimg: propimg,
                        shared: shared,
                        address: address,
                        city: city,
                        province: province,
                        country: country,
                        noofunits: multiple,
                        postcode: postcode,
                        date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                        multiple: multiple,
                        name: name
                    }).then(function () {
                        $rootScope.$apply(function () {
                            console.log(units);
                            $rootScope.units = units;
                            $rootScope.message = units;
                            $rootScope.success = "Property Updated!";
                            $rootScope.propID = propID;


                        });

                    });
                } // End OF property Add-edit
            }
        }

        vm.createNewPropertyWithUnits = function (property) {
            var unitlists = [];
            for (var i = 0; i < property.noofunits; i++) {
                unitlists.push({
                    "Aminities": [],
                    "address": property.address,
                    "bathroom": "",
                    "bedroom": "",
                    "cats": "",
                    "city": property.city,
                    "description": "",
                    "dogs": "",
                    "epirydate": "",
                    "location": property.city,
                    "name": property.name,
                    "postalcode": property.postcode,
                    "rent": "",
                    "smoking": "",
                    "sqft": "",
                    "country": property.country,
                    "state": property.province,
                    "status": "",
                    "type": property.proptype,
                    "unit": '',
                    isIncomplete: true,
                });
            }
            return unitlists;
        }

        vm.csvsubmitdata = function (prop) {

            var propID = prop.propID;
            var unitlists = prop.unitlists;
            var totalunits = prop.totalunits;
            var noofunits = prop.noofunits;
            var name = prop.name;
            var address = prop.address;
            var city = prop.city;
            var country = prop.country;
            var proptype = prop.proptype;
            var postcode = prop.postcode;
            var province = prop.province;


            var fileUpload = document.getElementById("file123");
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
            if (regex.test(fileUpload.value.toLowerCase())) {
                if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var rows = e.target.result.split("\n");
                        var result = [];
                        var units = [];
                        var headers = rows[0].split(",");
                        var totalrowunits = 0;
                        for (var i = 1; i < parseInt(rows.length - 1); i++) {

                            var obj = {};
                            var currentline = rows[i].split(",");

                            for (var j = 0; j < headers.length; j++) {

                                var headerkey = headers[j];
                                headerkey = headerkey.replace(/[^a-zA-Z ]/g, "")

                                headerkey = headerkey.toLowerCase();
                                if (headerkey == 'unit') {
                                    units.push(currentline[j]);
                                }

                                if (headerkey == 'unit' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Unit number must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }
                                if (headerkey == 'rent' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Rent must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }
                                if (headerkey == 'sqft' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Sqft must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }

                                if (headerkey == 'status' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Status must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }
                                if (headerkey == 'amenities' && currentline[j] == '') {
                                    swal({
                                        title: "Error!",
                                        text: "Amenities must be a value. Please follow instructions in the spreadsheet",
                                        type: "error",
                                    });
                                    return false;
                                }


                                if (headerkey == 'amenities' && currentline[j] != '') {
                                    var amenities = currentline[j];
                                    var str_array = amenities.split('|');
                                    obj['Aminities'] = str_array;
                                } else {
                                    obj[headerkey] = currentline[j];
                                }

                                obj['name'] = name;
                                obj['type'] = proptype;
                                obj['address'] = address;
                                obj['location'] = address;
                                obj['city'] = city;
                                obj['state'] = province;
                                obj['postcode'] = postcode;
                            }
                            result.push(obj);
                            totalrowunits++;
                        }

                        for (var i = 0; i < totalrowunits; i++) {
                            var objres = result[i];
                            unitlists.push(objres);
                        }

                        /*console.log(totalrowunits);
                        console.log(unitlists);*/



                        if (vm.duplication(units) == true) {
                            swal({
                                title: "Error!",
                                text: "Duplicate unit numbers found in the file. Please check duplicate values.",
                                type: "error",
                            });
                            return false;
                        }

                        noofunits = parseInt(totalrowunits + noofunits);
                        firebase.database().ref('properties/' + propID).update({
                            unitlists: unitlists,
                            totalunits: noofunits, noofunits: noofunits
                        }).then(function () {

                            if (confirm("Units added successfully!")) {
                                $state.go('viewprop');
                            }
                            $rootScope.success = "Units added successfully!";
                            //setTimeout(function(){ $state.go('viewprop'); }, 2000);
                        }, function (error) {
                            $rootScope.error = "Please check your file. Multiple errors found with the data.";
                        });
                    }

                    reader.readAsText(fileUpload.files[0]);



                } else {
                    swal({
                        title: "Error!",
                        text: "This browser does not support HTML5.",
                        type: "error",
                    });
                }
            } else {
                swal({
                    title: "Error!",
                    text: "Please upload a valid CSV file.",
                    type: "error",
                });
            }

        }

        vm.csvadd = function () {
            var fileUpload = document.getElementById("file");
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
            if (regex.test(fileUpload.value.toLowerCase())) {
                if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var rows = e.target.result.split("\n");
                        var result = [];
                        var units = [];
                        var headers = rows[0].split(",");
                        var totalunits = 0;
                        for (var i = 1; i < parseInt(rows.length - 1); i++) {
                            totalunits = i;
                            var obj = {};
                            var currentline = rows[i].split(",");

                            for (var j = 0; j < headers.length; j++) {

                                var headerkey = headers[j];
                                headerkey = headerkey.replace(/[^a-zA-Z ]/g, "")
                                if (headerkey == 'unit') {
                                    units.push(currentline[j]);
                                }
                                obj[headerkey] = currentline[j];
                            }
                            result.push(obj);
                        }

                        if (vm.duplication(units) == true) {
                            swal({
                                title: "Error!",
                                text: "Duplicate unit numbers found in the file. Please check duplicate values.",
                                type: "error",
                            });
                            return false;
                        }

                        //   console.log(result);
                        firebase.database().ref('properties/' + vm.localpropID).update({
                            unitlists: result,
                            totalunits: totalunits
                        }).then(function () {
                            $rootScope.success = "Units added successfully!";
                            setTimeout(function () { $state.go('viewprop'); }, 2000);
                        }, function (error) {
                            $rootScope.error = "Please check your file. Multiple errors found with the data.";
                        });
                    }

                    reader.readAsText(fileUpload.files[0]);



                } else {
                    swal({
                        title: "Error!",
                        text: "This browser does not support HTML5.",
                        type: "error",
                    });
                }
            } else {
                swal({
                    title: "Error!",
                    text: "Please upload a valid CSV file.",
                    type: "error",
                });
            }

        }

        if ($state.current.name == 'addunits') {

            var ref = firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function (snapshot) {

                var propData = snapshot.val();

                vm.timeSlot = [];
                $scope.$apply(function () {
                    vm.prop = vm.units = {
                        propID: snapshot.key,
                        landlordID: propData.landlordID,
                        propimg: propData.propimg,
                        propstatus: propData.propstatus,
                        proptype: propData.proptype,
                        units: 'multiple',
                        rent: propData.rent,
                        shared: propData.shared,
                        address: propData.address,
                        noofunits: propData.noofunits,
                        totalunits: propData.totalunits,
                        city: propData.city,
                        province: propData.province,
                        postcode: propData.postcode,
                        country: propData.country,
                        propimage: propData.propimg,
                        unitlists: propData.unitlists,
                        name: propData.name,
                        noofunitsarray: vm.getarray(propData.noofunits),
                        multiple: [],
                        date: [],
                        fromtime: [],
                        to: [],
                        limit: [],
                        propertylink: propData.propertylink,
                        invalid: [0],
                        timeinvalid: [0],
                        timeoverlapinvalid: [0]
                    }
                });
            });
        }

        vm.getarray = function (num) {
            var data = [];
            for (var i = 0; i <= num - 1; i++) {
                data.push(i);
            }
            return data;
        }

        vm.duplication = function (data) {

            var sorted_arr = data.slice().sort(); // You can define the comparing function here. 
            // JS by default uses a crappy string compare.
            // (we use slice to clone the array so the
            // original array won't be modified)
            var results = [];
            for (var i = 0; i < sorted_arr.length - 1; i++) {
                if (sorted_arr[i + 1] == sorted_arr[i]) {
                    results.push(sorted_arr[i]);
                }
            }

            if (results.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        if ($state.current.name == 'viewunits') {

            var ref = firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function (snapshot) {
                var propertiesData = snapshot.val();
                $scope.$apply(function () {
                    vm.units = {
                        mode: 'View',
                        propID: snapshot.key,
                        address: propertiesData.address,
                        city: propertiesData.city,
                        country: propertiesData.country,
                        date: propertiesData.date,
                        landlordID: propertiesData.landlordID,
                        name: propertiesData.name,
                        postcode: propertiesData.postcode,
                        propimg: propertiesData.propimg,
                        propstatus: propertiesData.propstatus,
                        proptype: propertiesData.proptype,
                        province: propertiesData.province,
                        shared: propertiesData.shared,
                        totalunits: propertiesData.totalunits,
                        units: propertiesData.units,
                        unitlists: propertiesData.unitlists,
                    }
                });
            });

        }

        // View Property
        if ($state.current.name == 'viewprop') {
            $scope.loader = 1;
            var landlordID = ''
            if (localStorage.getItem('refId')) {
                landlordID = localStorage.getItem('refId')
            } else {
                landlordID = localStorage.getItem('userID');
            }
            var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
                $scope.$apply(function () {
                    vm.success = 0;
                    if (snapshot.val()) {
                        var props = angular.copy(snapshot.val());
                        var vacantSums = {};
                        _.forEach(props, function (prop, key) {
                            vacantSums[key] = _.sumBy(prop.unitlists, function (o) {
                                if (!o.status || o.status == 'available') {
                                    return 1;
                                }
                            });
                        })
                        vm.vacantSums = vacantSums;
                        vm.viewprops = snapshot.val();

                        vm.propsavail = 1;
                        vm.propsuccess = localStorage.getItem('propertysuccessmsg');
                    } else {
                        vm.propsavail = 0;
                        vm.propsuccess = localStorage.getItem('propertysuccessmsg');
                    }
                    $scope.loader = 0;
                    // console.log($rootScope.$previousState.name);
                    if (($rootScope.$previousState.name == "editprop" || $rootScope.$previousState.name == "addprop") && vm.propsuccess != '') {
                        vm.success = 1;
                    }
                    localStorage.setItem('propertysuccessmsg', '')
                });

            });

            vm.toggleSwitch = function (key) {
                var propstatus = !vm.viewprops[key].propstatus;

                firebase.database().ref('properties/' + key).once("value", function (snap) {
                    vm.property_address = snap.val().address;
                });

                // update the property status to property table
                firebase.database().ref('properties/' + key).update({
                    propstatus: propstatus
                })

                if (!vm.viewprops[key].propstatus == false) {
                    firebase.database().ref('applyprop/').orderByChild("propID").equalTo(key).once("value", function (snapshot) {
                        $scope.$apply(function () {
                            vm.scheduleIDs = [];
                            vm.tenants = [];

                            if (snapshot.val() != null) {
                                $.map(snapshot.val(), function (value, index) {
                                    if (value.schedulestatus !== "cancelled" && value.schedulestatus !== "submitted") {
                                        vm.scheduleIDs.push(index);
                                        vm.tenants.push(value.tenantID);
                                    }
                                });
                            }

                            angular.forEach(vm.scheduleIDs, function (value, key) {
                                firebase.database().ref('applyprop/' + value).update({
                                    schedulestatus: "cancelled"
                                })
                                // console.log(value);
                            });

                            var emailData = '<p>Hello, </p><p>' + vm.property_address + ' been successfully <strong>deactivated</strong>.</p><p>You will no longer receive viewing requests and rental applications.</p><p>To make changes or reactivate, please log in at http://vcancy.com/login/ and go to “My Properties”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                            // Send Email
                            emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address + ' has been deactivated', 'deactivateproperty', emailData);

                            angular.forEach(vm.tenants, function (tenantID, key) {
                                firebase.database().ref('users/' + tenantID).once("value", function (snap) {
                                    var emailData = '<p>Hello ' + snap.val().firstname + ' ' + snap.val().lastname + ', </p><p>Your viewing request on property <em>' + address + '</em> has been cancelled as landlord has deactivated this property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                                    // Send Email
                                    emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'delproperty', emailData);
                                });
                            });
                            $state.reload();
                        });
                    });
                } else {
                    $state.reload();
                }
            }
        }

        // Edit Property
        if ($state.current.name == 'editprop' || $state.current.name == 'editprop1') {
            vm.mode = 'Edit';
            vm.submitaction = "Update";
            vm.otheraction = "Delete";
            $scope.loader = 1;
            var ref = firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function (snapshot) {

                var propData = snapshot.val();
                console.log(propData);

                vm.timeSlot = [];
                $scope.$apply(function () {
                    vm.prop = vm.units = {
                        propID: snapshot.key,
                        landlordID: propData.landlordID,
                        propimg: propData.propimg,
                        propstatus: propData.propstatus,
                        proptype: propData.proptype,
                        units: propData.units,
                        rent: propData.rent,
                        shared: propData.shared,
                        address: propData.address,
                        noofunits: propData.totalunits,
                        city: propData.city,
                        province: propData.province,
                        postcode: propData.postcode,
                        country: propData.country,
                        propimage: propData.propimg,
                        unitlists: propData.unitlists,
                        noofunits: propData.noofunits,
                        name: propData.name,
                        multiple: [],
                        mode: 'Edit',
                        date: [],
                        fromtime: [],
                        to: [],
                        limit: [],
                        propertylink: propData.propertylink,
                        invalid: [0],
                        timeinvalid: [0],
                        timeoverlapinvalid: [0]
                    }
                    $scope.loader = 0;
                    /*   angular.forEach(propData.date, function(value, key) {
                           vm.timeSlot.push({
                               date: new Date(value)
                           });
                           vm.prop.date.push(new Date(value));
                           vm.prop.fromtime.push(new Date(propData.fromtime[key]));
                           vm.prop.to.push(new Date(propData.to[key]));
                           vm.prop.limit.push(propData.limit[key]);
                           vm.prop.multiple.push(propData.multiple[key]);
                       });*/
                    vm.addresschange();
                    oldtimeSlotLen = vm.timeSlot.length;
                    vm.unitsOptional();
                });
            });
        } else {
            vm.mode = 'Add';
            vm.submitaction = "Save";
            vm.otheraction = "Cancel";
            vm.timeSlot = [{
                date: dateconfig
            }];
            vm.prop = vm.units = {
                propID: '',
                landlordID: '',
                propimg: '',
                propstatus: true,
                proptype: '',
                units: '',
                multiple: [true],
                rent: '',
                shared: '',
                address: 'dgdfgdf',
                noofunits: 0,
                city: '',
                province: '',
                postcode: '',
                country: '',
                propimage: '',
                unitlists: [],
                noofunits: 0,
                name: name,
                noofunitsarray: vm.getarray(0),
                mode: 'Add',
                date: [],
                fromtime: [],
                to: [],
                limit: [],
                propertylink: '',
                invalid: [0],
                timeinvalid: [0],
                timeoverlapinvalid: [0]
            }
        }
        //noofunitsarray Return array value
        vm.noofunitsarray = function () {

            return vm.getarray(vm.prop.noofunits);

        }

        vm.onChangeCheckBox = function (index, value) {
            var isValueIncluded = vm.prop.unitlists[index].Aminities.includes(value);
            if (isValueIncluded) {
                vm.prop.unitlists[index].Aminities.splice(vm.prop.unitlists[index].Aminities.indexOf(value), 1);
            } else {
                vm.prop.unitlists[index].Aminities.push(value);
            }
            // $(event.target).toggleClass('selected');
        }
        vm.deleteproperty = function (propID, page) {
            var propID = propID;
            var propertyObj = $firebaseAuth();
            var propdbObj = firebase.database();
            firebase.database().ref('properties/' + propID).once("value", function (snap) {

                vm.property_address = snap.val().address;
                swal({
                    title: 'Warning!',
                    text: "Are you sure you want to delete this property? All details and units will be deleted!",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "Yes",
                    closeOnConfirm: false
                }, function () {
                    propdbObj.ref('properties/' + propID).remove();
                    firebase.database().ref('applyprop/').orderByChild("propID").equalTo(propID).once("value", function (snapshot) {
                        $scope.$apply(function () {
                            vm.scheduleIDs = [];
                            vm.tenants = [];

                            if (snapshot.val() != null) {
                                $.map(snapshot.val(), function (value, index) {
                                    vm.scheduleIDs.push(index);
                                    vm.tenants.push(value.tenantID);
                                });
                            }
                            angular.forEach(vm.scheduleIDs, function (value, key) {
                                firebase.database().ref('applyprop/' + value).update({
                                    schedulestatus: "removed"
                                })
                            });

                            var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + vm.landlordname + ',</h2><br> Your property <em>' + vm.property_address + '</em> has been successfully deleted and all viewings related to this property are also removed.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                            // Send Email
                            emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address + ' has been deleted', 'delproperty', emailData);

                            angular.forEach(vm.tenants, function (tenantID, key) {
                                firebase.database().ref('users/' + tenantID).once("value", function (snap) {
                                    var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + snap.val().firstname + ' ' + snap.val().lastname + ',</h2><br> Your viewing request on property <em>' + vm.property_address + '</em> has been removed as landlord has deleted his property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                                    // Send Email
                                    emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your viewing request has been removed from Vcancy', 'delproperty', emailData);
                                });
                            });
                        })

                        swal({
                            title: 'Success!',
                            text: 'Property deleted successfully',
                            type: 'success'
                        }, function () {
                            if (page === 'innerpage') {
                                $state.go('viewprop');
                            } else {
                                $state.reload();
                            }
                        });

                    });

                    if (page === 'innerpage') {
                        $state.go('viewprop');
                    } else {
                        $state.reload();
                    }
                });
            });
        }

        vm.stringModel = [];
        vm.stringData = ['David', 'Jhon', 'Danny',];
        vm.stringSettings = { template: '{{option}}', smartButtonTextConverter(skip, option) { return option; }, };

        // Delete Property Permanently
        this.delprop = function (propID) {
            var propertyObj = $firebaseAuth();
            var propdbObj = firebase.database();

            firebase.database().ref('properties/' + propID).once("value", function (snap) {
                vm.property_address = snap.val().address;

                if ($window.confirm("Do you want to continue?")) {
                    propdbObj.ref('properties/' + propID).remove();

                    firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function (snapshot) {
                        $scope.$apply(function () {
                            vm.scheduleIDs = [];
                            vm.tenants = [];

                            if (snapshot.val() != null) {
                                $.map(snapshot.val(), function (value, index) {
                                    vm.scheduleIDs.push(index);
                                    vm.tenants.push(value.tenantID);
                                });
                            }
                            angular.forEach(vm.scheduleIDs, function (value, key) {
                                firebase.database().ref('applyprop/' + value).update({
                                    schedulestatus: "removed"
                                })
                            });

                            var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + vm.landlordname + ',</h2><br> Your property <em>' + vm.property_address + '</em> has been successfully deleted and all viewings related to this property are also removed.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                            // Send Email
                            emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address + ' has been deleted', 'delproperty', emailData);

                            angular.forEach(vm.tenants, function (tenantID, key) {
                                firebase.database().ref('users/' + tenantID).once("value", function (snap) {
                                    var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + snap.val().firstname + ' ' + snap.val().lastname + ',</h2><br> Your viewing request on property <em>' + vm.property_address + '</em> has been removed as landlord has deleted his property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                                    // Send Email
                                    emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your viewing request is removed from Vcancy', 'delproperty', emailData);
                                });
                            });
                        })
                        $state.go('viewprop');
                    })
                }
            });
        }

        // Units to be optional when house is selected
        this.unitsOptional = function (proptype) {
            console.log(vm.prop.units);
            if (vm.prop.proptype == proptype && (vm.prop.units == '' || vm.prop.units == undefined)) {
                vm.prop.units = ' ';
            } else if (vm.prop.proptype != proptype && (vm.prop.units == '' || vm.prop.units == undefined)) {
                vm.prop.units = '';
            }
        }

        this.unitsClear = function (proptype) {
            console.log(vm.prop.units);
            if (vm.prop.proptype == proptype && (vm.prop.units == '' || vm.prop.units == undefined)) {
                vm.prop.units = ' ';
            }
        }

        vm.checkAll = function () {
            if (vm.selectedAll) {
                for (var i = 0; i < vm.prop.unitlists.length; i++) {
                    vm.checkedRow[i] = true;
                }
            } else {
                vm.checkedRow = {};
            }
            // var datalen = vm.noofunitsarray();

            // for (var i = 0; i <= datalen.length - 1; i++) {
            //     vm.prop.noofunitsarray[i] = $scope.selectedAll;
            // }
        }
        vm.moreaction = function (action) {

            if (Object.keys(vm.checkedRow).length > 0) {

                for (var index in vm.checkedRow) {
                    if (vm.checkedRow[index] && action) {
                        vm.prop.unitlists[index].status = action;
                    }
                }
                // $("#ts_checkbox:checked").each(function (index) {
                //     selectedvalue.push($(this).val());
                // });


                // var rowlength = selectedvalue.length;
                // //var tablerowlength = vm.prop.noofunitsarray;
                // var tablerowlength = vm.noofunitsarray();

                // if (val === 'DAll') {
                //     if (vm.units.unitlists !== undefined) {
                //         for (var i = 0; i < rowlength; i++) {
                //             delete vm.units.unitlists[parseInt(selectedvalue[i])];
                //         }
                //     }
                //     for (var i = 0; i < rowlength; i++) {
                //         vm.units.noofunits = parseInt(vm.units.noofunits - 1);
                //         vm.prop.noofunits = vm.units.noofunits
                //         //vm.prop.noofunitsarray = vm.getarray(vm.units.noofunits);
                //         // vm.units.noofunitsarray = vm.getarray(vm.units.noofunits);
                //     }
                //     var list = [];
                //     for (var i = 0; i < vm.units.unitlists.length; i++) {
                //         if (typeof vm.units.unitlists[i] !== 'undefined') {
                //             list.push(vm.units.unitlists[i]);
                //         }
                //     }

                //     vm.units.unitlists = list;
                //     $scope.selectedAll = false;
                //     var datalen = vm.noofunitsarray();

                //     for (var i = 0; i <= datalen.length - 1; i++) {
                //         vm.prop.noofunitsarray[i] = $scope.selectedAll;
                //     }
                // }

                // if (val === 'Mavailable') {

                //     if (vm.units.unitlists !== undefined && vm.prop.unitlists !== undefined) {
                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             console.log(vm.units.unitlists[index]);
                //             if (vm.units.unitlists[index] !== undefined) {
                //                 vm.units.unitlists[index]['status'] = 'Available';
                //             } else {
                //                 vm.units.unitlists.push({ status: 'Available' });
                //             }

                //         }
                //     } else {
                //         vm.units.unitlists = [];
                //         for (var i = 0; i < tablerowlength.length; i++) {

                //         }

                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             vm.units.unitlists[index]['status'] = 'Available';
                //         }

                //     }

                //     $scope.selectedAll = false;
                //     var datalen = vm.noofunitsarray();

                //     for (var i = 0; i <= datalen.length - 1; i++) {
                //         vm.prop.noofunitsarray[i] = $scope.selectedAll;
                //     }
                // }

                // if (val === 'Mranted') {
                //     if (vm.units.unitlists !== undefined && vm.prop.unitlists !== undefined) {
                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             if (vm.units.unitlists[index] !== undefined) {
                //                 vm.units.unitlists[index]['status'] = 'rented';
                //             } else {
                //                 vm.units.unitlists.push({ status: 'rented' });
                //             }
                //         }
                //     } else {
                //         vm.units.unitlists = [];
                //         for (var i = 0; i < tablerowlength.length; i++) {
                //             vm.units.unitlists.push({ status: '' });
                //         }

                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             vm.units.unitlists[index]['status'] = 'rented';
                //         }

                //     }

                //     $scope.selectedAll = false;
                //     var datalen = vm.noofunitsarray();

                //     for (var i = 0; i <= datalen.length - 1; i++) {
                //         vm.prop.noofunitsarray[i] = $scope.selectedAll;
                //     }
                // }


                // if (val === 'Msold') {
                //     if (vm.units.unitlists !== undefined && vm.prop.unitlists !== undefined) {

                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             if (vm.units.unitlists[index] !== undefined) {
                //                 vm.units.unitlists[index]['status'] = 'sold';
                //             } else {
                //                 vm.units.unitlists.push({ status: 'sold' });
                //             }
                //         }
                //     } else {
                //         vm.units.unitlists = [];
                //         for (var i = 0; i < tablerowlength.length; i++) {
                //             vm.units.unitlists.push({ status: '' });
                //         }

                //         for (var i = 0; i < rowlength; i++) {
                //             var index = parseInt(selectedvalue[i]);
                //             vm.units.unitlists[index]['status'] = 'sold';
                //         }

                //     }

                //     $scope.selectedAll = false;
                //     var datalen = vm.noofunitsarray();

                //     for (var i = 0; i <= datalen.length - 1; i++) {
                //         vm.prop.noofunitsarray[i] = $scope.selectedAll;
                //     }
                // }
            } else {
                swal({
                    title: "Error!",
                    text: "Please select row for apply your selected action",
                    type: "error",
                });
                vm.more = '';
            }
        }

        vm.addNewUnit = function () {
            var newUnit = {
                "Aminities": [],
                "address": vm.prop.address,
                "bathroom": "",
                "bedroom": "",
                "cats": "",
                "city": vm.prop.city,
                "description": "",
                "dogs": "",
                "epirydate": "",
                "location": vm.prop.address,
                "name": vm.prop.name,
                "postalcode": vm.prop.postcode,
                "country": vm.prop.country,
                "rent": "",
                "smoking": "",
                "sqft": "",
                "state": vm.prop.province || vm.prop.city,
                "status": "available",
                "type": "",
                "unit": '',
                isIncomplete: true,
            }
            if (!vm.prop.unitlists) vm.prop.unitlists = [];
            vm.prop.unitlists.push(newUnit);
        }

        vm.deleteSelected = function () {
            if (Object.keys(vm.checkedRow) && Object.keys(vm.checkedRow).length > 0) {

                vm.prop.unitlists = vm.prop.unitlists.filter(function (unit, key) {
                    if (!vm.checkedRow[key]) return true;
                })
                vm.submiteditunits(vm.prop.unitlists, vm.prop, true);
                vm.checkedRow = {};
            } else {
                swal({
                    title: "Alert!",
                    text: "Please select any unit from row",
                    type: "warning",
                });
            }
        }

        vm.addmorerow = function (val1) {
            var val = val1;
            if (isNaN(val)) {
                val = 0;
            }

            vm.units.noofunits = parseInt(val + 1);
            vm.prop.noofunits = parseInt(val + 1);
            $scope.selectedAll = false;
            //vm.prop.noofunitsarray = vm.getarray(vm.units.noofunits)
        }
        vm.filesArray = [];
        $scope.uploadDetailsImages = function (event) {
            var filesToUpload = event.target.files;
            var alreadyAddedImages = $scope.selectedUnitDetail.data.images ? $scope.selectedUnitDetail.data.images.length : 0
            if (filesToUpload.length + alreadyAddedImages > 24) {
                swal({
                    title: "Warning!",
                    text: "Images uploading is limited to 24 images only.",
                    type: "warning",
                });
                return
            }
            // swal({
            //     title: 'Alert',
            //     text: "Please wait photos are uploading",
            //     icon: "info",
            // });
            $scope.loader = 1;
            for (var i = 0; i < filesToUpload.length; i++) {
                var file = filesToUpload[i];
                vm.filesArray.push(vm.singleFileUpload(file));
            }

            $q
                .all(vm.filesArray)
                .then((data) => {
                    swal.close();
                    if (!$scope.selectedUnitDetail.data.images) $scope.selectedUnitDetail.data.images = [];
                    $scope.selectedUnitDetail.data.images = $scope.selectedUnitDetail.data.images.concat(data);
                    setTimeout(function () {
                        swal({
                            title: "Success!",
                            text: "Photos uploaded successfully!",
                            type: "success",
                        });
                    }, 100)
                    $scope.loader = 0;
                })
        }

        $scope.copyUnitDetails = function (from, to) {
            var prop = $scope.prop || vm.prop;
            var datatoCopy = prop.unitlists.find(function (unit) {
                return unit.unit == from;
            })
            for (var i in datatoCopy) {
                if (i != 'unit') {
                    $scope.selectedUnitDetail.data[i] = datatoCopy[i]
                }
            }
        }

        vm.singleFileUpload = function (file) {
            var fileUploadDefer = $q.defer();
            if (file) {
                AWS.config.update({
                    accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
                    secretAccessKey: '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'
                });
                AWS.config.region = 'ca-central-1';

                var bucket = new AWS.S3({
                    params: {
                        Bucket: 'vcancy-final'
                    }
                });
                var filename = moment().format('YYYYMMDDHHmmss') + file.name;
                filename = filename.replace(/\s/g, '');

                if (file.size > 3145728) {
                    swal({
                        title: "Error!",
                        text: 'File size should be 3 MB or less.',
                        type: "error",
                    });
                    return false;
                } else if (file.type.indexOf('image') === -1) {
                    swal({
                        title: "Error!",
                        text: 'Only files are accepted.',
                        type: "error",
                    });
                    return false;
                }



                var params = {
                    Key: 'property-images/' + filename,
                    ContentType: file.type,
                    Body: file,
                    StorageClass: "STANDARD_IA",
                    ACL: 'public-read'
                };

                bucket.upload(params).on('httpUploadProgress', function (evt) {

                })
                    .send(function (err, data) {
                        if (err) {
                            return fileUploadDefer.reject(data);
                        }
                        return fileUploadDefer.resolve(data);
                    });

                return fileUploadDefer.promise;
            }
        }

        vm.copyrowofunits = function () {

            var arr = [];
            var selectedvalue = new Array();
            var n = $("#ts_checkbox:checked").length;
            var tempArray = vm.prop.unitlists;
            var b = [];
            if (n > 0) {

                $("#ts_checkbox:checked").each(function (index) {
                    selectedvalue.push($(this).val());
                });

                for (var i = 0; i < selectedvalue.length; i++) {
                    //console.log(vm.prop.unitlists[i]);
                    units = parseInt(vm.prop.unitlists[i]['unit']) + parseInt(vm.prop.unitlists.length);

                    b.push({
                        unit: units,
                        name: vm.prop.unitlists[i]['name'],
                        type: vm.prop.unitlists[i]['type'],
                        address: vm.prop.unitlists[i]['address'],
                        city: vm.prop.unitlists[i]['city'],
                        state: vm.prop.unitlists[i]['state'],
                        postalcode: vm.prop.unitlists[i]['postalcode'],
                        location: vm.prop.unitlists[i]['location'],
                        sqft: vm.prop.unitlists[i]['sqft'],
                        bedroom: vm.prop.unitlists[i]['bedroom'],
                        bathroom: vm.prop.unitlists[i]['bathroom'],
                        rent: vm.prop.unitlists[i]['rent'],
                        description: vm.prop.unitlists[i]['description'],
                        status: vm.prop.unitlists[i]['status'],
                        epirydate: vm.prop.unitlists[i]['epirydate'],
                        Aminities: vm.prop.unitlists[i]['Aminities'],
                        cats: vm.prop.unitlists[i]['cats'],
                        dogs: vm.prop.unitlists[i]['dogs'],
                        smoking: vm.prop.unitlists[i]['smoking']

                    });
                    vm.prop.noofunits = parseInt(vm.prop.noofunits + 1);
                }


                for (var i = 0; i < b.length; i++) {
                    vm.prop.unitlists.push(b[i]);
                }
            } else {
                vm.prop.noofunits = parseInt(vm.prop.noofunits + vm.prop.unitlists.length);

                for (var i = 0; i < vm.prop.unitlists.length; i++) {
                    var units = parseInt(vm.prop.unitlists[i]['unit']) + parseInt(vm.prop.unitlists.length);
                    b.push({
                        unit: units,
                        name: vm.prop.unitlists[i]['name'],
                        type: vm.prop.unitlists[i]['type'],
                        address: vm.prop.unitlists[i]['address'],
                        city: vm.prop.unitlists[i]['city'],
                        state: vm.prop.unitlists[i]['state'],
                        postalcode: vm.prop.unitlists[i]['postalcode'],
                        location: vm.prop.unitlists[i]['location'],
                        sqft: vm.prop.unitlists[i]['sqft'],
                        bedroom: vm.prop.unitlists[i]['bedroom'],
                        bathroom: vm.prop.unitlists[i]['bathroom'],
                        rent: vm.prop.unitlists[i]['rent'],
                        description: vm.prop.unitlists[i]['description'],
                        status: vm.prop.unitlists[i]['status'],
                        epirydate: vm.prop.unitlists[i]['epirydate'],
                        Aminities: vm.prop.unitlists[i]['Aminities'],
                        cats: vm.prop.unitlists[i]['cats'],
                        dogs: vm.prop.unitlists[i]['dogs'],
                        smoking: vm.prop.unitlists[i]['smoking']

                    });
                }

                for (var i = 0; i < b.length; i++) {
                    console.log(b[i]);
                    vm.prop.unitlists.push(b[i]);
                }
            }
        }

        vm.addmorerowedit = function (val) {
            vm.prop.noofunits = parseInt(val + 1);
        }

        vm.submiteditunits = function (unitlists, prop, isDeleted, isFromSchedule) {
            let unitIds = [];
            unitlists.forEach((unit) => {
                unitIds.push(unit.unit);
                delete unit.$$hashKey;
            });
            var hasDuplicateIds = vm.duplication(unitIds);
            if (hasDuplicateIds) {
                swal({
                    title: "Error!",
                    text: "Duplicate unit number/s added, please check Unit # column",
                    type: "error",
                });
                return;
            }
            return firebase.database().ref('properties/' + prop.propID).update({
                unitlists: unitlists,
                totalunits: unitlists.length,
                noofunits: unitlists.length
            }).then(function () {
                if (isDeleted) {
                    swal({
                        title: "Success!",
                        text: "Unit deleted successfully.",
                        type: "success",
                    });
                } else {
                    vm.prop.noofunits = unitlists.length;
                    vm.prop.totalunits = unitlists.length;
                    swal({
                        title: "Success!",
                        text: "Unit/s saved successfully.",
                        type: "success",
                    }, function (value) {
                        if (isFromSchedule) {
                            window.location.reload();
                        }
                    })

                }
            }, function (error) {
                if (confirm("Units not added, please try again!") == true) {
                    return false;
                }
            });
        }

        vm.submitunits = function (units) {

            var num = units.number;
            var rent = units.rent;
            var sqft = units.sqft;
            var status = units.status;
            var bath = units.bath;
            var bed = units.bed;
            var aminities1 = units.Aminities;
            var fullformarary = [];


            var address = units.address;
            var name = units.name;
            var type = units.proptype;
            var city = units.city;
            var state = units.province;
            var postalcode = units.postcode;
            var location = units.address;
            var bedroom = [];
            var bathroom = [];
            var description = [];
            var status = units.status;
            var epirydate = [];
            var cats = [];
            var dogs = [];
            var smoking = [];
            var furnished = [];
            var wheelchair = [];


            var number = [];
            var rentarray = [];
            var sqftarray = [];
            var statusarray = [];
            var textarray = [];
            var batharray = [];
            var bedarray = [];
            var Aminitiesarray = [];



            for (var prop in num) {
                if (num.hasOwnProperty(prop)) {
                    number.push(num[prop]);
                }
            }

            if (vm.duplication(number) == true) {
                swal({
                    title: "Error!",
                    text: "Duplicate unit numbers found in the file. Please check duplicate values.",
                    type: "error",
                });
                /*$rootScope.$apply(function() {
                         $rootScope.error = "Please check your unit number are duplicate.. !";
                     });*/
                return false;
            }

            for (var prop in rent) {
                if (rent.hasOwnProperty(prop)) {
                    rentarray.push(rent[prop]);
                }
            }

            for (var prop in sqft) {
                if (sqft.hasOwnProperty(prop)) {
                    sqftarray.push(sqft[prop]);
                }
            }

            for (var prop in status) {
                if (status.hasOwnProperty(prop)) {
                    statusarray.push(status[prop]);
                }
            }

            for (var prop in bath) {
                if (bath.hasOwnProperty(prop)) {
                    batharray.push(bath[prop]);
                }
            }

            for (var prop in bed) {
                if (bed.hasOwnProperty(prop)) {
                    bedarray.push(bed[prop]);
                }
            }

            for (var prop in aminities1) {
                if (aminities1.hasOwnProperty(prop)) {
                    Aminitiesarray.push(aminities1[prop]);
                }
            }

            var totalunits = 0;
            for (var i = 0; i < number.length; i++) {

                fullformarary.push({
                    unit: number[i],
                    name: name,
                    type: type,
                    address: units.address,
                    city: city,
                    state: state,
                    postalcode: postalcode,
                    location: address,
                    sqft: sqftarray[i],
                    bedroom: bedarray[i],
                    bathroom: batharray[i],
                    rent: rentarray[i],
                    description: '',
                    status: statusarray[i],
                    epirydate: '',
                    Aminities: Aminitiesarray[i],
                    cats: '',
                    dogs: '',
                    smoking: '',
                    furnished: '',
                    wheelchair: ''
                });
                totalunits++;
            }



            firebase.database().ref('properties/' + units.propID).update({
                unitlists: fullformarary,
                totalunits: totalunits,
                noofunits: totalunits
            }).then(function () {
                if (confirm("Units added successfully!") == true) {
                    localStorage.removeItem('propID');
                    localStorage.removeItem('units');
                    localStorage.removeItem('propName');
                    $state.go('viewprop');
                } else {
                    return false;
                }
            }, function (error) {
                if (confirm("Units not added, please try again!") == true) {
                    return false;
                }
            });

        }


        $scope.items = [
            'The first choice!',
            'And another choice for you.',
            'but wait! A third!'
        ];

        $scope.status = {
            isopen: false
        };

        $scope.toggled = function (open) {
            $log.log('Dropdown is now: ', open);
        };

        $scope.toggleDropdown = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };

        $scope.appendToEl = angular.element(document.querySelector('#dropdown-long-content'));

        vm.opensuccesssweet = function (value) {
            swal({
                title: "Property added successfully, please add units",
                text: "Click on the Units tab",
                type: "success",
            });
            // alert('Property Created successfully!');
            //swal("Your Property Created successfully!", "You clicked the button And add units!", "success")
        }

        vm.openmodel = function (size) {
            $scope.items1 = [];
            var modalInstance = $uibModal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl1',
                backdrop: 'static',
                size: size,
                resolve: {
                    items1: function () {
                        return $scope.items1;
                    }
                }

            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openImageModal = function () {
            $scope.imageModal = $uibModal.open({
                templateUrl: 'viewimages.html',
                controller: 'propertyCtrl',
                backdrop: 'static',
                size: 'lg',
                windowClass: 'zIndex',
                scope: $scope
            });
        }

        $scope.closeImageModal = function () {
            $scope.imageModal.dismiss('cancel');
        }

        vm.openDetailModel = function (prop, index) {
            $scope.selectedUnitDetail = {};
            $scope.selectedUnitDetail.data = vm.prop.unitlists[index];
            $scope.selectedUnitDetail.data.email = localStorage.getItem('userEmail');
            $scope.selectedUnitDetail.index = index;
            $scope.items1 = prop;
            $scope.propUnitLists = {
                "list": angular.copy(vm.prop.unitlists)
            } 
            $scope.items1.indexofDetails = index;
            $scope.modalInstance = $uibModal.open({
                templateUrl: 'myModalDetailsContent.html',
                controller: 'propertyCtrl',
                backdrop: 'static',
                size: 'lg',
                windowClass: 'detailmodalcss',
                scope: $scope
            });
        };
        vm.duplication = function (data) {

            var sorted_arr = data.slice().sort(); // You can define the comparing function here. 
            // JS by default uses a crappy string compare.
            // (we use slice to clone the array so the
            // original array won't be modified)
            var results = [];
            for (var i = 0; i < sorted_arr.length - 1; i++) {
                if (sorted_arr[i + 1] == sorted_arr[i]) {
                    results.push(sorted_arr[i]);
                    break;
                }
            }

            if (results.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        vm.opencsvmodel = function (prop) {

            $scope.items1 = prop;
            var modalInstance = $uibModal.open({
                templateUrl: 'myModalContent1.html',
                controller: 'ModalInstanceCtrl1',
                backdrop: 'static',
                resolve: {
                    items1: function () {
                        return $scope.items1;
                    }
                }

            });

            modalInstance.result.then(function () {

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.cancel = function () {
            $scope.modalInstance.dismiss('cancel');
        };
        vm.checkIfDetailIsIncomplete = function (value) {

            var keyToCheck = [
                "address",
                "city",
                "postalcode",
                "country",
                "rent",
                "sqft",
                "status",
                "unit",
                "type",
                "title",
                "description"
            ]

            for (var i = 0; i < keyToCheck.length; i++) {
                if (!value[keyToCheck[i]]) {
                    return true;
                }
            }

            if (!value.images) {
                return true;
            }
            if (value.images.length <= 0) {
                return true;
            }
            return false;
        }
        $scope.submitDetails = function (isFromSchedule) {
            var index = $scope.selectedUnitDetail.index;
            if (!vm.prop.unitlists) {
                vm.prop.unitlists = [];
            }
            if (!vm.prop.unitlists[index]) {
                vm.prop = angular.copy($scope.prop);
            }
            vm.prop.unitlists[index] = angular.copy($scope.selectedUnitDetail.data);
            vm.prop.unitlists[index].isIncomplete = vm.checkIfDetailIsIncomplete(angular.copy($scope.selectedUnitDetail.data));
            vm.submiteditunits(vm.prop.unitlists, vm.prop, '', isFromSchedule)
                .then(function () {
                    $scope.cancel();
                });
        };

        $scope.deleteImageFromDetail = function (index) {
            $scope.selectedUnitDetail.data.images.splice(index, 1);
        }

        $scope.onChangeCheckbox = function (type) {
            if ($scope.selectedUnitDetail.data.Aminities && $scope.selectedUnitDetail.data.Aminities.includes(type)) {
                $scope.selectedUnitDetail.data.Aminities.splice($scope.selectedUnitDetail.data.Aminities.indexOf(type), 1);
            } else {
                if (!$scope.selectedUnitDetail.data.Aminities) $scope.selectedUnitDetail.data.Aminities = [];
                $scope.selectedUnitDetail.data.Aminities.push(type);
            }
        }

    }
]);

vcancyApp.controller('ModalInstanceCtrl1', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'Upload', 'config', '$http', '$uibModal', '$uibModalInstance', '$location', 'items1', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, Upload, config, $http, $uibModal, $uibModalInstance, $location, items1) {
    var vm = this;
    vm.prop = items1;
    $scope.items1 = items1;
    $scope.ok = function (value) {
        if (value === 'viewproperty') {
            $uibModalInstance.close();
            $state.go('viewprop');
        }
    };

    $scope.submit = function () {

        $scope.loader = 1;
        console.log('vm.prop', vm.prop)
        var propID = vm.prop.propID;
        var unitlists = vm.prop.unitlists;
        var totalunits = vm.prop.totalunits;
        var noofunits = vm.prop.noofunits;
        var name = vm.prop.name;
        var address = vm.prop.address;
        var city = vm.prop.city;
        var country = vm.prop.country;
        var proptype = vm.prop.proptype;
        var postcode = vm.prop.postcode;
        var province = vm.prop.province;


        var fileUpload = document.getElementById("file123");
        if (fileUpload.value.indexOf('.csv') > -1) {
            if (typeof (FileReader) != "undefined") {
                var unitsImported = [];
                var reader = new FileReader();

                reader.onload = function (e) {
                    var rows = e.target.result.split("\n");
                    var units = [];
                    var headers = rows[0].split(",");
                    var totalrowunits = 0;
                    for (var i = 1; i < rows.length; i++) {

                        var obj = {};
                        var currentline = rows[i].split(",");
                        if (currentline[0].indexOf('DELETE THE EXAMPLE') > -1) {
                            continue;
                        }
                        if (currentline.length < 2) {
                            continue;
                        }

                        for (var j = 0; j < headers.length; j++) {

                            var headerkey = headers[j];
                            headerkey = headerkey.replace(/[^a-zA-Z]/g, "")

                            headerkey = headerkey.toLowerCase();
                            if (headerkey == 'unit') {
                                units.push(currentline[j]);
                            }

                            if (headerkey == 'unit' && currentline[j] == '') {
                                swal({
                                    title: "Error!",
                                    text: "Unit must be a value. Please follow instructions in the spreadsheet",
                                    type: "error",
                                });
                                return false;
                            }
                            if (headerkey == 'rent' && currentline[j] == '') {
                                swal({
                                    title: "Error!",
                                    text: "Rent must be a value. Please follow instructions in the spreadsheet",
                                    type: "error",
                                });
                                return false;
                            }
                            if (headerkey == 'sqft' && currentline[j] == '') {
                                swal({
                                    title: "Error!",
                                    text: "Sqft must be a value. Please follow instructions in the spreadsheet",
                                    type: "error",
                                });
                                return false;
                            }

                            if (headerkey == 'status' && currentline[j] == '') {
                                swal({
                                    title: "Error!",
                                    text: "status must be a value. Please follow instructions in the spreadsheet",
                                    type: "error",
                                });
                                return false;
                            }

                            var actualHeaderKey = '';
                            var aminitiesHeaderKeys = [
                                'amenitiesfurnished',
                                'amenitieslaundry',
                                'amenitiesparking',
                                'amenitieswheelchairaccess'
                            ]
                            var ignorKeys = [
                                'propertyaddressoptional',
                            ]
                            if (ignorKeys.includes(headerkey)) {
                                continue;
                            }
                            if (aminitiesHeaderKeys.includes(headerkey)) {
                                actualHeaderKey = 'Aminities';
                            } else if (headerkey === 'catsok') {
                                actualHeaderKey = 'cats';
                            } else if (headerkey === 'dogsok') {
                                actualHeaderKey = 'dogs';
                            } else {
                                actualHeaderKey = headerkey.trim();
                            }

                            if (headerkey === 'amenitiesfurnished') {
                                if (currentline[j].toLowerCase().trim() === 'yes') {
                                    if (!obj[actualHeaderKey] || !(obj[actualHeaderKey] instanceof Array)) obj[actualHeaderKey] = [];
                                    obj[actualHeaderKey].push('furnished')
                                }
                            } else if (headerkey === 'amenitieslaundry') {
                                if (currentline[j].toLowerCase().trim() === 'yes') {
                                    if (!obj[actualHeaderKey] || !(obj[actualHeaderKey] instanceof Array)) obj[actualHeaderKey] = [];
                                    obj[actualHeaderKey].push('laundry')
                                }
                            } else if (headerkey === 'amenitiesparking') {
                                if (currentline[j].toLowerCase().trim() === 'yes') {
                                    if (!obj[actualHeaderKey] || !(obj[actualHeaderKey] instanceof Array)) obj[actualHeaderKey] = [];
                                    obj[actualHeaderKey].push('parking')
                                }
                            } else if (headerkey === "amenitieswheelchairaccess") {
                                if (currentline[j].toLowerCase().trim() === 'yes') {
                                    if (!obj[actualHeaderKey] || !(obj[actualHeaderKey] instanceof Array)) obj[actualHeaderKey] = [];
                                    obj[actualHeaderKey].push('wheelchair')
                                }
                            } else if (headerkey === 'catsok' || headerkey === 'dogsok' || headerkey === 'smoking') {
                                obj[actualHeaderKey] = currentline[j].toLowerCase() == 'yes' ? true : false
                            } else if (headerkey === 'status') {
                                if (currentline[j] && currentline[j].toLowerCase() === "available soon") {
                                    obj['status'] = 'availablesoon';
                                }
                                else {
                                    obj['status'] = currentline[j] ? currentline[j].toLowerCase() : 'status';
                                }
                            } else if (headerkey === 'descriptionoptional') {
                                obj['description'] = currentline[j];
                            } else if (headerkey === 'leaseexpiryoptional') {
                                obj['leaseExpiry'] = new Date(currentline[j]);
                            } else {
                                obj[actualHeaderKey] = currentline[j];
                            }
                        }

                        obj['name'] = name;
                        obj['type'] = proptype;
                        obj['address'] = address;
                        obj['location'] = address;
                        obj['city'] = city;
                        obj['state'] = province;
                        obj['country'] = province;
                        obj['postcode'] = postcode;
                        obj['postalcode'] = postcode;
                        
                        unitsImported.push(obj);
                        totalrowunits++;
                    }
                    var hasDuplicateId = vm.duplication(units);
                    if (hasDuplicateId) {
                        swal({
                            title: 'Error',
                            text: 'File has duplicate unit IDs.',
                            type: 'error'
                        })
                        return;
                    }
                    if (!vm.prop.unitlists) vm.prop.unitlists = [];
                    vm.prop.unitlists = vm.prop.unitlists.concat(unitsImported);
                    vm.prop.totalunits = vm.prop.unitlists.length;
                    vm.prop.noofunits = vm.prop.unitlists.length;
                    setTimeout(function () {
                        $uibModalInstance.close();
                        swal({
                            title: 'Alert',
                            text: 'File imported successfully. You need to SAVE units otherwise changes will be lost.',
                            type: 'success'
                        })
                        $scope.loader = 0;
                    }, 1000);
                }

                reader.readAsText(fileUpload.files[0]);



            } else {
                swal({
                    title: "Error!",
                    text: "This browser does not support HTML5.",
                    type: "error",
                });
            }
        } else {
            swal({
                title: "Error!",
                text: "Please upload a valid CSV file.",
                type: "error",
            });
        }

    }

    $scope.units = function (value) {
        if (value != '' && value != null) {
            //  $location.absUrl() = '#/addunits/'+value;
            $uibModalInstance.close();
            $window.location.href = '#/addunits/' + value;
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    vm.duplication = function (data) {

        var sorted_arr = data.slice().sort(); // You can define the comparing function here. 
        // JS by default uses a crappy string compare.
        // (we use slice to clone the array so the
        // original array won't be modified)
        var results = [];
        for (var i = 0; i < sorted_arr.length - 1; i++) {
            if (sorted_arr[i + 1] == sorted_arr[i]) {
                results.push(sorted_arr[i]);
            }
        }

        if (results.length > 0) {
            return true;
        } else {
            return false;
        }
    }

}]);
'use strict';

//=================================================
// Custom Email Handler
//=================================================

vcancyApp.controller('emailhandlerCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','emailSendingService', function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, emailSendingService) {
	
	var mode = $stateParams.mode;
	var oobCode = $stateParams.oobCode;
	// localStorage.setItem('emailHandled',"");
	$rootScope.emailhandler = '';
	$rootScope.success = '';
	$rootScope.error = '';
	this.mode = mode;
	
	console.log($stateParams);
	if(mode == 'verifyEmail') {
		firebase.auth().applyActionCode(oobCode).then(function(resp) {
			console.log(resp);
			localStorage.setItem('emailHandled', "Thanks for verifying your email.");
			localStorage.setItem('userEmailVerified', "true");
			$scope.$apply(function(){
				$rootScope.emailhandler = localStorage.getItem('emailHandled');	
			});		
			
			$state.go('login');
		}).catch(function(error) {
			localStorage.setItem('emailHandled', error.message);
			$scope.$apply(function(){
				$rootScope.emailhandler = localStorage.getItem('emailHandled');	
			});			
			console.log(error.message, error.reason);
        })	
				
		
		// $rootScope.emailhandler = localStorage.getItem('emailHandled');	
		
	} else if(mode == 'resetPassword'){
		  var accountEmail;
		  
		  firebase.auth().verifyPasswordResetCode(oobCode).then(function(email) {
			var accountEmail = email;
			console.log(accountEmail);
			
			$scope.$apply(function(){
				$rootScope.useremail = email;
			});
			
			// TODO: Show the reset screen with the user's email and ask the user for
			// the new password.
			// Save the new password.
						
			// firebase.auth().confirmPasswordReset(oobCode, newPassword).then(function(resp) {
			  // Password reset has been confirmed and new password updated.			  
			// }).catch(function(error) {
			  // Error occurred during confirmation. The code might have expired or the
			  // password is too weak.
			// });
		  }).catch(function(error) {
			  $state.go('login');
			  // $scope.$apply(function(){
				// $rootScope.error = "Invalid or expired action code. Ask user to try to reset the password again.";
			  // });
			  console.log("Invalid or expired action code. Ask user to try to reset the password again.");		
		  });
		  
		  
			this.resetpasswordsubmit = function(){
				// console.log(this.newpassword);
				if(this.cpassword == this.newpassword){
					firebase.auth().confirmPasswordReset(oobCode, this.newpassword).then(function(resp) {
					  console.log("Password reset has been confirmed and new password updated.");
						$scope.$apply(function(){
							$rootScope.success = "Password reset has been confirmed and new password updated.";	
							$rootScope.error = '';
						});				  
						
						var emailData = '<p>This is to confirm that your password has been changed!</p><p>Please ensure you keep this password safe and secure for your records.</p><p>Your email address: '+$rootScope.useremail+'.</p><p>If you have not requested a password change&nbsp;please contact Vcancy immediately.</p>';
										
						// Send Email
						emailSendingService.sendEmailViaNodeMailer($rootScope.useremail, 'Your new password on Vcancy', 'changepwd', emailData);
						
					}).catch(function(error) {
					  console.log("Error occurred during confirmation. The code might have expired or the password is too weak.");
					  $scope.$apply(function(){
						$rootScope.error = "Error occurred during confirmation. The code might have expired or the password is too weak.";
						$rootScope.success = '';
					  });
					});
				} else {
					console.log("Passwords don’t match.");
					$rootScope.error = "Passwords don’t match.";
					$rootScope.success = ''; 
				}				
			}
			
	}
	
	
}])
'use strict';

//=================================================
// Apply Property
//=================================================

vcancyApp.controller('applypropCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', 'slotsBuildService', 'emailSendingService', '$uibModal', '$location', '_'
	, function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, slotsBuildService, emailSendingService, $uibModal, $location, _) {

		var vm = this;
		vm.moment = moment;
		vm.emailVerifiedError = '';
		var tenantID = localStorage.getItem('userID');
		vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
		vm.propinactive = 0;
		vm.registerUser = {
			firstName: '',
			lastName: '',
			email: '',
			phone: ''
		};
		vm.proposeDiv = false;
		vm.preScreeningAns = {};
		vm.landlordData = {};

		vm.proposeNewTime = {};

		if (vm.userData) {
			vm.registerUser.firstName = vm.userData.firstname;
			vm.registerUser.lastName = vm.userData.lastname;
			vm.registerUser.email = vm.userData.email;
		}
		vm.signIn = {
			username: '',
			password: ''
		}
		var urlData = $location.search() || {};
		vm.unitId = urlData.unitId || null;

		vm.selectedUnit = {};
		if (vm.userData) {
			vm.userName = vm.firstname + ' ' + vm.lastname;
		}
		// console.log(localStorage.getItem('userEmailVerified'));
		if (localStorage.getItem('userEmailVerified') == "false" || !$rootScope.emailVerified) {
			vm.isEmailVerified = 1;
		} else {
			vm.isEmailVerified = 0;
		}
		// console.log(vm.isEmailVerified);

		vm.getLandlord = function () {
			firebase.database().ref('/users/' + vm.propData.landlordID).once('value').then(function (snap) {
				$scope.$apply(function () {
					vm.landlordData = snap.val();
					console.log('vm.landlordData', vm.landlordData);
					vm.landlordData.id = snap.key;
				})
			});
		}

		function generateSlots() {
			var listings = angular.copy(vm.listings);
			var slotsData = {};
			_.forEach(listings, (value, key) => {
				var fromDate = moment(value.fromDate);
				var toDate = moment(value.toDate);
				var days = toDate.diff(fromDate, 'days');
				for (var i = 0; i <= days; i++) {
					let _fromDate = angular.copy(fromDate)
					let formattedDate = _fromDate.add(i, 'days').format('MM/DD/YYYY');
					if (!slotsData[formattedDate]) {
						slotsData[formattedDate] = [];
					}
					var fromTime = moment(value.fromTime, 'hh:mm a');
					var toTime = moment(value.toTime, 'hh:mm a');
					var slotsCount = toTime.diff(fromTime, 'minutes') / 30;
					for (var j = 0; j <= slotsCount; j++) {
						let _fromTime = angular.copy(fromTime);
						let formattedTime = _fromTime.add(30 * j, 'minutes').format('hh:mm a');
						slotsData[formattedDate].push(formattedTime);
					}
					slotsData[formattedDate] = _.uniq(slotsData[formattedDate]);
				}
				console.log('slotsData', slotsData)
			});
			$scope.$apply(function () {
				vm.availableSlots = angular.copy(slotsData);
				let keys = _.keys(vm.availableSlots);
				vm.selectedDate = keys[0];
				vm.selectedTime = vm.availableSlots[vm.selectedDate][0];
			});
		}
		vm.openproposemodal = function () {
			vm.proposeDiv = !vm.proposeDiv;
		};

		vm.formatDay = function (key) {
			return moment(key, 'MM/DD/YYYY').format('ddd')
		}

		vm.formatDate = function (key) {
			return moment(key, 'MM/DD/YYYY').format('MMM DD')
		}

		vm.selectSlotDate = function (key) {
			vm.selectedDate = key;
		};

		vm.selectSlotTime = function (key) {
			vm.selectedTime = key;
		};

		function getScheduledProp() {
			firebase.database().ref('propertiesSchedule/').orderByChild("propertyId").equalTo($stateParams.propId).once("value", function (snap) {
				if (snap.val()) {
					console.log('scheduleProp', snap.val());
					var listings = snap.val();
					vm.listings = angular.copy(listings);
					vm.schudeledListing = 1;
					generateSlots();
					// getScheduledProp();
				} else {
					vm.schudeledListing = 0;
				}
			})
		}

		function getProperty() {
			firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function (snap) {
				if (snap.val()) {
					var propData = snap.val();
					vm.propData = angular.copy(propData);
					if (propData && propData.unitlists && propData.unitlists.length > 0) {
						vm.selectedUnit = propData.unitlists.find(function (unit) {
							if (unit.unit == vm.unitId) return true;
						});
						if (vm.selectedUnit.description) {

							vm.selectedUnit.description = vm.selectedUnit.description.replace(/(?:\r\n|\r|\n)/g, '<br />')
						}
						if (vm.selectedUnit.otherAminities) {
							vm.selectedUnit.otherAminities = vm.selectedUnit.otherAminities.replace(/(?:\r\n|\r|\n)/g, '<br />')
						}
					}
					if (!vm.selectedUnit.images) {
						vm.selectedUnit.images = [];
					}
					vm.selectedUnit.images.push({ Location: vm.propData ? vm.propData.propimg : null });
					getScheduledProp();
					vm.getLandlord();
				} else {
					$state.go('tenantdashboard');
				}
			})
		}

		function init() {
			getProperty();
		}

		init();

		vm.forgotpwdmail = function () {
			var email = vm.signIn.email;
			if (!email) {
				swal({
					type: 'error',
					title: 'Error',
					text: 'Please enter email'
				});
				return
			}
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';

			var forgotuserObj = $firebaseAuth();
			forgotuserObj.$sendPasswordResetEmail(email).then(function () {
				$rootScope.success = 'Password reset email sent to your inbox. Please check your email.';
				$rootScope.error = '';
				vm.signIn.email = '';
				vm.modalInstance.dismiss('cancel');
				swal({
					type: 'success',
					title: 'success',
					text: 'Email sent'
				});
			}).catch(function (error) {
				swal({
					type: 'error',
					title: 'Error',
					text: error.message
				});
			});

		};
		vm.forgetPwd = false;
		vm.toggleForgetPwd = function () {
			vm.forgetPwd = true;
		}

		// Property Application form - Data of tenant save		
		vm.tenantapply = function () {
			//if (localStorage.getItem('userEmailVerified') !== 'false') {
			var userInfo = vm.userInfo ? angular.copy(vm.userInfo) : null;
			var userDetails = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : userInfo;
			vm.emailVerifiedError = '';
			var tenantID = localStorage.getItem('userID') || vm.userInfo.id;
			var propID = $stateParams.propId;
			var address = vm.propData.address;
			var name = vm.registerUser.firstName + ' ' + vm.registerUser.lastName;
			var phone = vm.registerUser.phone;
			var landlordID = vm.landlordData.id;
			var unitID = vm.unitId;
			var dateSlot = vm.selectedDate;
			var fromTime = moment(vm.selectedTime, 'hh:mm a');
			var toTime = moment(fromTime).add(30, 'minutes');
			var timeRange = fromTime.format('hh:mm a') + '-' + toTime.format('hh:mm a');
			var fromTimeSlot = fromTime.format('hh:mm a');
			var toTimeSlot = toTime.format('hh:mm a');
			var preScreeningAns = angular.copy(vm.preScreeningAns)
			var proposeNewTime = {};
			if (Object.keys(vm.proposeNewTime).length > 0) {
				proposeNewTime = angular.copy(vm.proposeNewTime);
			}
			vm.proposeNewTime = {};

			var applypropObj = $firebaseAuth();
			var applypropdbObj = firebase.database();
			var _data = {
				tenantID: tenantID,
				propID: propID,
				address: address,
				schedulestatus: "scheduled",
				name: name,
				phone: phone,
				dateSlot: dateSlot,
				fromTimeSlot: fromTimeSlot,
				toTimeSlot: toTimeSlot,
				landlordID: landlordID,
				timeRange: timeRange,
				unitID: unitID,
				units: unitID,
				preScreeningAns: preScreeningAns,
				proposeNewTime: proposeNewTime
			}
			if (!_.isEmpty(_data.proposeNewTime)) {
				_data.schedulestatus = 'pending';
				if (_data.proposeNewTime.date1) {
					_data.proposeNewTime.date1 = moment(_data.proposeNewTime.date1).format('MM/DD/YYYY')
				}
				if (_data.proposeNewTime.date2) {
					_data.proposeNewTime.date2 = moment(_data.proposeNewTime.date2).format('MM/DD/YYYY')
				}
				if (_data.proposeNewTime.date3) {
					_data.proposeNewTime.date3 = moment(_data.proposeNewTime.date3).format('MM/DD/YYYY')
				}
			}
			applypropdbObj.ref('applyprop/').push().set(_data).then(function () {
				$state.go('applicationThanks');
				// $rootScope.success = 'Application for property successfully sent!';	
				console.log('Application for property successfully sent!');

				firebase.database().ref('users/' + landlordID).once("value", function (snapshot) {
					// Mail to Landlord
					var emailData = '<p>Hello, </p><p>' + name + ' has requested a viewing at ' + dateSlot + ', ' + timeRange + 'for ' + address + '.</p><p>To accept this invitation and view renter details, please log in at http://vcancy.com/login/  and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
					// Send Email
					emailSendingService.sendEmailViaNodeMailer(snapshot.val().email, name + ' has requested a viewing for ' + address, 'newviewingreq', emailData);
				});

				// Mail to Tenant
				var emailData = '<p>Hello ' + vm.registerUser.firstName + ', </p><p>Your viewing request for ' + address + ' at ' + dateSlot + ', ' + timeRange + ' has been sent.</p><p>To view your requests, please log in at http://vcancy.com/login/ and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
				// Send Email
				emailSendingService.sendEmailViaNodeMailer(vm.registerUser.email, 'Viewing request for ' + address, 'viewingreq', emailData);
			});
			// } else {
			// 	vm.emailVerifiedError = 'Email not verified yet. Please verify email to schedule a slot.'
			// }
		}

		vm.createUser = function (user) {
			if (vm.userData) {
				vm.tenantapply();
				return;
			}
			firebase.database().ref('/users').orderByChild("email").equalTo(vm.registerUser.email).once('value').then(function (snap) {
				if (snap.val()) {
					vm.userInfo = snap.val();
					vm.userInfo.id = snap.key;
					vm.foundUser = true;
					vm.tenantapply();
				} else {
					var reguserObj = $firebaseAuth();
					var random = parseInt(Math.random() * 10000);
					var characterArray = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
					var pass = '';
					for (var i = 0; i < 6; i++) {
						var num = Math.floor((Math.random() * 60) + 1);
						pass += characterArray[num];
					}
					reguserObj.$createUserWithEmailAndPassword(vm.registerUser.email, pass)
						.then(function (firebaseUser) {
							var reguserdbObj = firebase.database();
							reguserdbObj.ref('users/' + firebaseUser.uid).set({
								firstname: vm.registerUser.firstName,
								lastname: vm.registerUser.lastName,
								usertype: 0,
								email: vm.registerUser.email,
								phone:vm.registerUser.phone,
								isadded: 1,
								iscancelshow: 1,
								iscreditcheck: 1,
								iscriminalreport: 1,
								isexpiresoon: 1,
								ispropertydelete: 1,
								isrentalsubmit: 1,
								isshowingtime: 1,
								companyname: ""
							});
							vm.opensuccesssweet("User Added successfully!, A verification email has been sent to you. Please verify your account, log in and submit your rental application");

							firebase.auth().signInWithEmailAndPassword(vm.registerUser.email, pass)
								.then(function (firebaseUser) {
									localStorage.setItem('userID', firebase.auth().currentUser.uid);
									localStorage.setItem('userEmail', firebase.auth().currentUser.email);
									localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
									localStorage.setItem('password', pass);
									swal({
										title: "Success",
										text: 'User Added successfully!, A verification email has been sent to you. Please verify your account, log in and submit your rental application.',
										type: "success",
									});
									var emailData = '<p>Hello, </p><p>You account has been created. Please check your inbox for a verification email and log in using the credentials below.</p><p>Your email is ' + vm.registerUser.email + '.</p><p>Your password : <strong>' + pass + '</strong></p><p>Once you log in, please change your password from the profile page. If you have any questions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

									// Send Email
									emailSendingService.sendEmailViaNodeMailer(vm.registerUser.email, 'A new user account has been added to your portal', 'Welcome', emailData);
									// Success 
									firebaseUser.sendEmailVerification().then(function () {

										$rootScope.success = 'Confirmation email resent';
										$rootScope.error = '';
										setTimeout(function () { $rootScope.success = '' }, 1000);
										vm.tenantapply();
									}).catch(function (error) {
										console.log("Error sending email" + error);
									});
								})
						}).catch(function (error) {
							vm.openerrorsweet(error.code);
						});
				}
			});

		};
		vm.openSignInmodel = function (prop) {

			vm.modalInstance = $uibModal.open({
				templateUrl: 'signin.html',
				backdrop: 'static',
				scope: $scope,
				size: 'md'
			});
		};
		vm.signInFunction = function (userdetails) {
			firebase.auth().signInWithEmailAndPassword(userdetails.email, userdetails.password)
				.then(function (firebaseUser) {
					localStorage.setItem('userID', firebase.auth().currentUser.uid);
					localStorage.setItem('userEmail', firebase.auth().currentUser.email);
					localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
					localStorage.setItem('password', userdetails.password);
					firebase.database().ref('/users/' + firebase.auth().currentUser.uid).once('value').then(function (userdata) {
						$rootScope.usertype = 0;
						localStorage.setItem('usertype', 0);
						localStorage.setItem('userData', JSON.stringify(userdata.val()));
						vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
						if (vm.userData) {
							vm.registerUser.firstName = vm.userData.firstname;
							vm.registerUser.lastName = vm.userData.lastname;
							vm.registerUser.email = vm.userData.email;
						}
						vm.closeModal();
						$scope.$apply();
					});
				})
				.catch(function (error) {
					vm.openerrorsweet(error.code);
				});
		}
		vm.closeModal = function () {
			vm.modalInstance.dismiss('cancel');
		}
		vm.opensuccesssweet = function (value) {
			swal({
				title: "Success!",
				text: value,
				type: "success",
				confirmButtonColor: '#009999',
				confirmButtonText: "Ok"
			}, function (isConfirm) {
				if (isConfirm) {
					// $state.reload();
				}
			});
		};

		vm.openerrorsweet = function (value) {
			swal({
				title: "Error",
				text: value,
				type: "warning",
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Ok",
				closeOnConfirm: true
			},
				function () {
					return false;
				});

		};

	}])
'use strict';

//=================================================
// Landlord Schedule
//=================================================

vcancyApp
    .controller('scheduleCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams','emailSendingService',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce,NgTableParams,emailSendingService) {
		
		var vm = this;
		var landlordID = localStorage.getItem('userID');
		vm.loader = 1;
		
		vm.propcheck = [];
		vm.schedulepropaddress = [];
		
		vm.tablefilterdata = function(propID = '') {
			if(propID !=''){
				vm.propcheck[propID] = !vm.propcheck[propID];
			}
			
			vm.showCal = false;
			firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
				// console.log(snapshot.val())
				$scope.$apply(function(){
					if(snapshot.val()) {						
						
						$.map(snapshot.val(), function(value, index) {							
							 if(vm.schedulepropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus !== "removed"  ) {
							 		console.log(value);
								  vm.schedulepropaddress.push({propID: value.propID, address: value.address, units: value.units}); 
								  vm.propcheck[value.propID] = true;
							 } 	
						});
						
						
						vm.calendardata = $.map(snapshot.val(), function(value, index) {
							if(value.schedulestatus == "confirmed" && (vm.propcheck[value.propID] == true || propID == '')) {
								return [{scheduleID:index, className: 'bgm-cyan', title:value.units+" - "+value.address, start: new Date(value.dateslot)}];
							}
						});						
						
						// vm.calendardata = [{scheduleID:"-KvaDdFDac3A_apLY-ce",className:"bgm-cyan",title:"Active kl",start:"24-September-2017"}]
						$scope.calendardata = vm.calendardata;
						
						console.log($scope.calendardata);
						
						vm.schedulesavail = 0;
						//to map the object to array
						vm.tabledata = $.map(snapshot.val(), function(value, index) {
							if(vm.propcheck[value.propID] == true || propID == ''){
								if(value.schedulestatus !== "removed" ) {
									vm.schedulesavail = 1;
									return [{scheduleID:index, name:value.name, tenantlocation: value.tenantlocation, jobtitle: value.jobtitle, age: value.age, dateslot: value.dateslot, address:value.address, timerange: value.timerange, description: value.description.substr(0, 15),desctooltip: value.description, schedulestatus: value.schedulestatus}];
								} 
							} 
						});
			
						vm.cols = [
							  { field: "name", title: "Name", sortable: "name", show: true },
							  { field: "tenantlocation", title: "City", sortable: "tenantlocation", show: true },
							  { field: "jobtitle", title: "Profession", sortable: "jobtitle", show: true },
							  { field: "age", title: "Age", sortable: "age", show: true },
							  { field: "dateslot", title: "Date", sortable: "dateslot", show: true },						  
							  { field: "timerange", title: "Time", sortable: "timerange", show: true },
							  { field: "description", title: "About Me", sortable: "description", show: true }
							];

						
						
						vm.extracols = [
							{ field: "", title: "", show: true}
						];
						
						if(vm.schedulesavail == 1){
							//Sorting
							vm.tableSorting = new NgTableParams({
						      // initial sort order
						      sorting: { name: "asc" } 
						    }, {
						      dataset: vm.tabledata
						    });
						}
						
					} else {
						vm.tabledata = [{scheduleID:'', name:'', tenantlocation: '', jobtitle: '', age: '', dateslot: '', address:'', timerange: '', description: '', schedulestatus: ''}];						
						vm.calendardata = [{scheduleID:'', className: 'bgm-cyan', title:'', start: ''}]						
						$scope.calendardata = vm.calendardata;
						
						vm.schedulesavail = 0;
					}
					
					vm.loader = 0;
					vm.showCal = true;
				});
			});
		}
		vm.tablefilterdata();
		
		vm.confirmschedule = function(index){
			// console.log(index);
			firebase.database().ref('applyprop/'+index).update({	
				schedulestatus: "confirmed"
			})
			
			firebase.database().ref('applyprop/'+index).once("value", function(snapshot) {
				firebase.database().ref('users/'+snapshot.val().tenantID).once("value", function(snap) {
					var emailData = '<p>Hello '+snapshot.val().name+', </p><p>Your viewing request for '+snapshot.val().address+' at '+snapshot.val().dateslot+', '+snapshot.val().timerange+' has been accepted.</p><p>If you wish you complete your rental application beforehand, please log in at http://vcancy.com/login/ and go to “Applications”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
					
					emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Viewing request for '+snapshot.val().address, 'confirmstatus', emailData);
				});
			});
			$state.reload();
		}
		
		vm.cancelschedule = function(index){
			// console.log(index);
			if ($window.confirm("Are you sure you want to cancel this viewing appointment?"))  {
				firebase.database().ref('applyprop/'+index).update({	
					schedulestatus: "cancelled"
				})
				firebase.database().ref('applyprop/'+index).once("value", function(snapshot) {
					firebase.database().ref('users/'+snapshot.val().tenantID).once("value", function(snap) {
						var emailData = '<p>Hello '+snapshot.val().name+', </p><p>Your viewing time '+snapshot.val().dateslot+', '+snapshot.val().timerange+' has been been <strong>cancelled</strong> by the landlord of '+snapshot.val().address+'.</p><p>Please book another time using the link initially provided or contact the landlord directly.</p><p>To view details, please <a href="http://www.vcancy.com/login/#/"> log in </a>  and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
						
						emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your viewing has been cancelled for '+snapshot.val().address, 'cancelstatus', emailData);
					});
				});
				$state.reload();
			}
		}
}])
'use strict';

//=================================================
// Landlord Schedule
//================================================= 

vcancyApp
	.controller('newscheduleCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'emailSendingService', '$q', '$uibModal', '_', '$compile', 'uiCalendarConfig'
		, function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, emailSendingService, $q, $uibModal, _, $compile, uiCalendarConfig) {

			var vm = this;
			var userID = localStorage.getItem('userID');
			var landlordID = ''
			var userData = JSON.parse(localStorage.getItem('userData'));
			var userEmail = localStorage.getItem('userEmail');
			vm.userData = userData;
			var landlordID = userData.refId || userID;
			vm.landLordID = landlordID;
			vm.moment = moment;
			vm.todayDate = moment().format('YYYY-MM-DD');
			$scope.eventSources = [];
			var date = new Date();
			var d = date.getDate();
			var m = date.getMonth();
			var y = date.getFullYear();

			$scope.uiConfig = {
				calendar: {
					height: 500,
					editable: false,
					header: {
						left: 'title',
						center: '',
						right: 'today prev,next',

					},
					buttonText: {
						today: 'Today',
					},
				}
			};

			/* event source that pulls from google.com */
			$scope.eventSource = {
				className: 'gcal-event',           // an option!
				currentTimezone: 'America/Chicago' // an option!
			};

			$scope.events = [];

			$scope.eventsF = function (start, end, timezone, callback) {
				callback();
			}

			vm.propertySelected = '';
			vm.unitSelected = '';
			vm.selectedUnitId = '';
			vm.units = [];
			vm.fromDate = '';
			vm.toDate = '';
			vm.fromTime = '';
			vm.toTime = '';
			vm.properties = [];
			vm.listings = [];
			vm.mergeListing = {};
			vm.selectedListings = [];

			vm.isEventExist = function (id) {
				for (var i = 0; i < $scope.events.length; i++) {
					var event = $scope.events[i];
					if (event.id === id) {
						return true;
					}
				}
			};

			vm.removeDeletedKey = function (listing) {
				$scope.events.filter(function (event) {
					var eventExist = $.map(listing, function (list, key) {
						if (key == event.id) return true;
					});
					return eventExist;
				});
			};

			vm.getListings = function () {
				vm.loader = 1;
				var propdbObj = firebase.database().ref('propertiesSchedule/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					$scope.$apply(function () {
						vm.success = 0;
						if (snapshot.val()) {
							vm.listings = snapshot.val();
							vm.generateMergeListing();
							for (var i = 0; i < $scope.events.length; i++) {
								$scope.events.pop();
							}
							$.map(vm.listings, function (value, key) {
								value.parsedFromDate = parseInt(new moment(value.fromDate).format('x'))
								value.parsedToDate = parseInt(new moment(value.toDate).format('x'))
								var startDate = new Date(value.fromDate).setHours(parseFloat(value.fromTime));
								var endDate = new Date(value.toDate).setHours(parseFloat(value.toTime));
								if (!vm.isEventExist(key)) {
									$scope.events.push(
										{
											title: value.unitID + '-' + vm.properties[value.propertyId].address,
											start: new Date(startDate),
											end: new Date(endDate),
											id: key,
											className: 'bgm-teal'

										}
									)
								}
							});

							vm.removeDeletedKey(vm.listings);

							vm.listingsAvailable = 1;
						} else {
							vm.listingsAvailable = 0;
						}
						vm.loader = 0;
					});
				});
			}

			$scope.openImageModal = function () {
				$scope.imageModal = $uibModal.open({
					templateUrl: 'viewimages.html',
					controller: 'propertyCtrl',
					backdrop: 'static',
					size: 'lg',
					windowClass: 'zIndex',
					scope: $scope
				});
			}

			$scope.closeImageModal = function () {
				$scope.imageModal.dismiss('cancel');
			}

			function getProperties() {
				var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {

					$scope.$apply(function () {
						vm.success = 0;
						if (snapshot.val()) {
							vm.properties = snapshot.val();
							vm.propertiesAvailable = 1;
						} else {
							vm.propertiesAvailable = 0;
						}
						vm.loader = 0;
						vm.getListings();
					});
				});
			}

			function init() {
				vm.loader = 1;
				getProperties();
			}

			init();

			vm.generateMergeListing = function () {
				vm.mergeListing = {};
				_.forEach(vm.listings, function (list, key) {
					if (!vm.mergeListing[list.link]) {
						vm.mergeListing[list.link] = angular.copy(vm.listings[key]);
						vm.mergeListing[list.link].fromToDate = [];
						var date = '';
						if (moment(vm.listings[key].fromDate).format('DD MMM') == moment(vm.listings[key].toDate).format('DD MMM')) {
							date = moment(vm.listings[key].fromDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
						}
						else {
							date = moment(vm.listings[key].fromDate).format('DD') + ' to ' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
						}
						vm.mergeListing[list.link].fromToDate.push(date);
						vm.mergeListing[list.link].keys = [key];
					} else {
						var date = '';
						if (moment(vm.listings[key].fromDate).format('DD MMM') == moment(vm.listings[key].toDate).format('DD MMM')) {
							date = moment(vm.listings[key].fromDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
						}
						else {
							date = moment(vm.listings[key].fromDate).format('DD') + ' to ' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
						}
						vm.mergeListing[list.link].fromToDate.push(date);
						vm.mergeListing[list.link].keys.push(key);
					}
				});
			};

			vm.clearAll = function ($event) {
				vm.propertySelected = '';
				vm.unitSelected = '';
				vm.selectedUnitId = '';
				vm.units = [];
				vm.fromDate = '';
				vm.toDate = '';
				vm.fromTime = '';
				vm.toTime = '';
				$event.preventDefault();
			}

			vm.checkAllListing = function () {
				$.map(vm.listings, function (value, key) {
					value.inputCheck = vm.selectedAllListing;
				});
				vm.generateMergeListing();
			};

			vm.checkForDuplicate = function (currentUnit) {
				for (var i in vm.listings) {
					var value = vm.listings[i];
					if (value.propertyId == currentUnit.propertyId && value.unitID == currentUnit.unitID
						&& value.fromDate == currentUnit.fromDate && value.fromTime == currentUnit.fromTime
						&& value.toDate == currentUnit.toDate && value.toTime == currentUnit.toTime) {
						return true;
					}
				}
			};

			vm.addAvailability = function ($event) {
				$event.preventDefault();
				if (!vm.propertySelected || !vm.fromDate || !vm.toDate || !vm.fromTime || !vm.toTime) {
					return;
				}
				var availabilities = [];
				var url = 'https://vcancy.com/login/#/applyproperty/'
				// if (window.location.host.startsWith('localhost')) {
				// 	url = 'http://localhost:9000/#/applyproperty/'
				// }
				var host = window.location.origin;
				if (host.indexOf('localhost') > -1) {
					url = host + '/#/applyproperty/';
				} else {
					url = host + '/login/#/applyproperty/';
				}
				var availability = {
					propertyId: vm.propertySelected,
					fromDate: moment(vm.fromDate.toString()).toDate().toString(),
					fromTime: vm.fromTime,
					toDate: moment(vm.toDate.toString()).toDate().toString(),
					toTime: vm.toTime,
					landlordID: landlordID,
					userID: userID,
					link: url + vm.propertySelected,
					status: 'Not Listed',
					listOnCraigslist: false
				}
				vm.units = _.map(vm.selectedUnitId, 'unit');
				if (vm.units.length == 0) {
					return;
				}
				var errorText = ''
				if (vm.units.length > 0) {
					vm.units.forEach(function (unit) {
						var data = {
							unitID: unit
						};
						var _unitAvailability = Object.assign(data, availability);
						_unitAvailability.link = _unitAvailability.link + '?unitId=' + unit;
						var isDuplicateEntry = vm.checkForDuplicate(_unitAvailability);
						if (!isDuplicateEntry) {
							availabilities.push(_unitAvailability);
						} else {
							errorText += 'Duplicate entry found for ' + unit + ', ';
						}
					});
					if (errorText != '') {
						swal({
							title: 'Some units cannot be saved',
							text: errorText,
							type: 'error'
						});
					}
				} else {
					availabilities.push(availability);
				}
				var promises = [];
				var fbObj = firebase.database();
				availabilities.forEach(function (availability) {
					var promiseObj = fbObj.ref('propertiesSchedule/').push().set(availability)
					promises.push(promiseObj);
				});
				vm.loader = 1;
				$q.all(promises).then(function () {
					vm.loader = 0;
					vm.propertySelected = '';
					vm.units = [];
					vm.unitSelected = '';
					vm.selectedUnitId = '';
					vm.fromDate = '';
					vm.toDate = '';
					vm.fromTime = '';
					vm.toTime = '';
					vm.getListings();
				});
			};

			$scope.craigslistopen = function (isOpen) {
				if (isOpen) {
					userData = JSON.parse(localStorage.getItem('userData')) || {};
					$scope.craigslist = {
						username: userData.craigslistUserID || '',
						password: userData.craigslistpassword || '',
						renewAds: userData.craigslistRenewAds || false,
						removeAds: userData.craigslistRemoveAds || false
					}
					vm.Craigslistopenapp = $uibModal.open({
						templateUrl: 'craigslist.html',
						backdrop: 'static',
						size: 'lg',
						scope: $scope
					});
				}
				else {
					vm.Craigslistopenapp.close();
				}
			};

			$scope.saveCraigslistDetails = function () {
				var fbObj = firebase.database();
				var promiseObj = fbObj.ref('users/' + landlordID).update({
					craigslistUserID: $scope.craigslist.username,
					craigslistpassword: $scope.craigslist.password,
					craigslistRenewAds: $scope.craigslist.renewAds,
					craigslistRemoveAds: $scope.craigslist.removeAds
				}).then(function () {
					userData = JSON.parse(localStorage.getItem('userData')) || {};

					userData['craigslistUserID'] = $scope.craigslist.username,
						userData['craigslistpassword'] = $scope.craigslist.password,
						userData['craigslistRenewAds'] = $scope.craigslist.renewAds,
						userData['craigslistRemoveAds'] = $scope.craigslist.removeAds,
						localStorage.setItem('userData', JSON.stringify(userData));
				})
				vm.Craigslistopenapp.close();
			}

			vm.deleteListings = function ($event) {
				swal({
					title: "Are you sure?",
					text: 'This will Delete all the selected listings.',
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: 'Delete All!',
					closeOnConfirm: true
				}, function () {
					var selectedListings = [];
					$.map(vm.mergeListing, function (value, key) {
						if (value.inputCheck) {
							selectedListings = _.concat(selectedListings, value.keys);
						}
					});
					if (selectedListings.length == 0) {
						return;
					}
					var promises = [];
					vm.loader = 1;
					var fbObj = firebase.database();
					selectedListings.forEach(function (listing) {
						var promiseObj = fbObj.ref('propertiesSchedule/' + listing).remove();
						promises.push(promiseObj);
					});
					$q.all(promises).then(function () {
						vm.loader = 0;
						vm.selectedListings = [];
						vm.listings = [];
						vm.selectedAllListing = false;
						vm.mergeListing = {};
						vm.getListings();
					});
				});
			}

			vm.toggleCraigsList = function (listingId, value, $event) {
				vm.loader = 1;
				var fbObj = firebase.database();
				var promiseObj = fbObj.ref('propertiesSchedule/' + listingId).update({
					listOnCraigslist: value,
					status: value ? 'Pending' : 'Not Listed'
				})
				promiseObj
					.then(function () {
						vm.loader = 0;

						if (vm.userData) {
							var listingValue = vm.listings[listingId];
							var propertyAddr = vm.properties[listingValue.propertyId].address;
							var emailData = '<p>Hello, </p><p>' + vm.userData.email + ' has a request for craigslist display for property - ' + propertyAddr + ' </p><br/><p>Link - ' + listingValue.link + '</p>';
							// Send Email
							if (!value) {
								emailData = '<p>Hello, </p><p>' + vm.userData.email + ' has a request to remove from craigslist display for property - ' + propertyAddr + ' </p><br/><p>Link - ' + listingValue.link + '</p>';
							}
							emailSendingService.sendEmailViaNodeMailer('creditrequest@vcancy.com', 'Cragslist Toggle', 'craigslist display', emailData);
						}

						vm.getListings();
					})
					.catch(function () {
						vm.loader = 0;
					});
			}

			vm.openDetailModel = function (propId, unitId) {
				var index = _.findIndex(vm.properties[propId].unitlists, ['unit', unitId]);
				var prop = vm.properties[propId];
				$scope.selectedUnitDetail = {};
				$scope.selectedUnitDetail.data = vm.properties[propId].unitlists[index];
				$scope.selectedUnitDetail.data.email = localStorage.getItem('userEmail');
				$scope.selectedUnitDetail.index = index;
				$scope.selectedUnitDetail.otherUnits = vm.properties[propId].unitlists
				$scope.items1 = prop;
				$scope.items1.indexofDetails = index;
				$scope.prop = angular.copy(prop);
				$scope.prop.propID = propId;
				$scope.modalInstance = $uibModal.open({
					templateUrl: 'myModalDetailsContent.html',
					controller: 'propertyCtrl',
					backdrop: 'static',
					size: 'lg',
					windowClass: '',
					scope: $scope
				});
			};

			vm.toggleListOnCraglist = function (keys) {
				let toggle = false;
				keys.forEach(function (key) {
					if (vm.listings[key].listOnCraigslist) {
						vm.listings[key].listOnCraigslist = !vm.listings[key].listOnCraigslist;
					}
					else {
						vm.listings[key].listOnCraigslist = true;
					}
					if (vm.listings[key].listOnCraigslist) {
						toggle = true;
					}
					vm.toggleCraigsList(key, vm.listings[key].listOnCraigslist)
				});
				if (toggle) {
					swal({
						title: 'Success',
						text: 'Your unit will now be listed on Craigslist in 12-24 hours.You will get a notification email when your listing is active.',
						type: "success",
					});
				}
			};

			vm.checkIsIncomplete = function (propId, unitId) {
				if (!unitId) {
					return false;
				}
				if (!vm.properties[propId]) return;
				var unit = _.find(vm.properties[propId].unitlists, ['unit', unitId]);
				if (!unit) return;
				var prop = vm.properties[propId];
				return unit.isIncomplete == false ? false : true;
			}

			$scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF]

			function generateToken() {
				var result = '',
					length = 6,
					chars = 'ABCEDFGHIJKLMNOPQRSTUVWXYZ0123456789';

				for (var i = 0; i < length; i++)
					result += chars[Math.floor(Math.random() * chars.length)];

				return result;
			}

			vm.questionDropDown = [
				{ id: 'WKRX6Q', label: 'What is your profession?', isChecked: false },
				{ id: 'MV5SML', label: 'Do you have Pets? Provide details', isChecked: true },
				{ id: 'N1F5MO', label: 'Are you able to provide references?', isChecked: false },
				{ id: 'OU489L', label: 'Why are you moving?', isChecked: false },
				{ id: 'U0G6V8', label: 'Tell me a bit about yourself', isChecked: true },
				{ id: 'A9OG32', label: 'No. of Applicants', isChecked: true },
				{ id: 'UH7JZS', label: 'Do you smoke?', isChecked: true },
				{ id: 'ZGJQ60', label: 'Move-in date', isChecked: true },
			];

			vm.openPrescreeningQuestions = function () {
				refreshScreeningQuestions();
				vm.prescreeningQuestion = $uibModal.open({
					templateUrl: 'prescreeningquestions.html',
					backdrop: 'static',
					size: 'md',
					scope: $scope
				});
			};

			$scope.closePrescreeningModal = function () {
				vm.prescreeningQuestion.close();
			}
			vm.customQuestion = null;
			vm.addCustomQuestion = function () {
				if (!vm.customQuestion) {
					return;
				}
				var data = {
					label: vm.customQuestion,
					id: generateToken(),
					isChecked: false
				}

				vm.screeningQuestions.push(data);
				vm.customQuestion = null;
			}

			vm.saveScreeningQuestions = function () {
				vm.loader = 1;
				var ques = angular.copy(vm.screeningQuestions);
				_.omit(ques, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					screeningQuestions: ques
				}).then(function () {
					userData.screeningQuestions = ques;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshScreeningQuestions();
					vm.loader = 0;
					vm.prescreeningQuestion.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			vm.deleteQuestionById = function (id) {
				var index = vm.screeningQuestions.findIndex(function (ques) {
					if (ques.id == id) return true;
				});
				vm.screeningQuestions.splice(index, 1);
			};

			function refreshScreeningQuestions() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.screeningQuestions && userData.screeningQuestions.length !== 0) {
					vm.screeningQuestions = userData.screeningQuestions;
				} else {
					vm.screeningQuestions = angular.copy(vm.questionDropDown);
				}
			}
			refreshScreeningQuestions();

			// Custom Rental
			vm.companyDetail = function () {
				return vm.userData.companyname + ' ' + (',' + vm.userData.contact || '')
			}

			vm.customRentalApplicationCheck = {};
			vm.customRentalApplicationCheck.TCData = 'You are authorized to obtaining credit checks & verifying details contained in this Application.' +

				'This unit/s is strictly NON SMOKING. This offer is subject to acceptance by the landlord/property' +
				'management company that listed the property.This application is made on the understanding that no ' +
				'betterments will be provided to the Rental Unit except those which may be specifically requested in' +
				'this Application and agreed to in writing by the Landlord and specified in a tenancy agreement.' +

				'It is understood that this application will not be processed unless fully completed.' +

				'If the landlord/property management company accepts this Application, we will sign a Fixed ' +
				'Term Tenancy Agreement at the offices of the property management company or in person with' +
				'the landlord and pay the security deposit. The Rental Unit will not be considered rented' +
				'until the Fixed Term Tenancy Agreement is signed by the Tenant and the Landlord.' +

				'We will ensure that the collection, use, disclosure and retention of information will comply with ' +
				'the provisions of the Freedom of information and Protection of Privacy Act. ' +
				'Information will be collected and used only as necessary and for the intended purpose and will ' +
				'not be disclosed as required by law.' +

				'I hereby state that the information contained herein is true and I authorize my References' +
				'as listed above to release information regarding my employment and/or past/current tenancies.' +

				'Tenants are not chosen on a first come – first served basis. We choose the most suitable ' +
				'application for the unit at our sole discretion. This application form is to be used only' +
				'in the interested of the owner of the rental unit.';

			vm.defaultRentalApplicationCheck = {
				'PAPPD': true,
				'CADDR': true,
				'PADDR': false,
				'AAPPD': false,
				'AAPP1': false,
				'AAPP2': false,
				'ESIV': true,
				'ESIV1': true,
				'VI': false,
				'EC': false,
				'EC1': false,
				'REF': true,
				'REF1': true,
				'REF2': false,
				'UD': true,
				'UDAAPP': false,
				'TC': true,
				'TCData': vm.customRentalApplicationCheck.TCData,
				'companyLogo': userData ? userData.companylogo || 'https://s3.ca-central-1.amazonaws.com/vcancy-final/public/no_image_found.jpg' : 'https://s3.ca-central-1.amazonaws.com/vcancy-final/public/no_image_found.jpg',
				'companyDetails': vm.companyDetail()
			}

			function refreshCustomRentalApplicationCheck() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.customRentalApplicationCheck) {
					if (userData.customRentalApplicationCheck && !userData.customRentalApplicationCheck.TCData) {
						userData.customRentalApplicationCheck.TCData = vm.customRentalApplicationCheck.TCData;
					}
					if (!userData.customRentalApplicationCheck.companyLogo) {
						userData.customRentalApplicationCheck.companyLogo = userData.companylogo || vm.customRentalApplicationCheck.companyLogo || "https://s3.ca-central-1.amazonaws.com/vcancy-final/public/no_image_found.jpg";
					}
					if (!userData.customRentalApplicationCheck.companyDetails) {
						userData.customRentalApplicationCheck.companyDetails = vm.companyDetail();
					}
					vm.customRentalApplicationCheck = userData.customRentalApplicationCheck;
				} else {
					vm.customRentalApplicationCheck = angular.copy(vm.defaultRentalApplicationCheck);
				}
			}
			refreshCustomRentalApplicationCheck();

			vm.saveCustomRentalApplicationCheck = function () {
				vm.loader = 1;
				var customChecks = angular.copy(vm.customRentalApplicationCheck);
				_.omit(customChecks, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					customRentalApplicationCheck: customChecks
				}).then(function () {
					userData.customRentalApplicationCheck = customChecks;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshCustomRentalApplicationCheck();
					vm.loader = 0;
					vm.customrentalapp.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			$scope.uploadDetailsImages = function (event) {
				var file = event.target.files[0];
				AWS.config.update({
					accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
					secretAccessKey: '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'
				});
				AWS.config.region = 'ca-central-1';

				var bucket = new AWS.S3({
					params: {
						Bucket: 'vcancy-final'
					}
				});
				var filename = moment().format('YYYYMMDDHHmmss') + file.name;
				filename = filename.replace(/\s/g, '');

				if (file.size > 3145728) {
					swal({
						title: "Error!",
						text: 'File size should be 3 MB or less.',
						type: "error",
					});
					return false;
				} else if (file.type.indexOf('image') === -1) {
					swal({
						title: "Error!",
						text: 'Only files are accepted.',
						type: "error",
					});
					return false;
				}

				var params = {
					Key: 'company-logo/' + filename,
					ContentType: file.type,
					Body: file,
					StorageClass: "STANDARD_IA",
					ACL: 'public-read'
				};

				bucket.upload(params).on('httpUploadProgress', function (evt) { })
					.send(function (err, data) {
						if (data && data.Location) {
							$scope.$apply(function () {
								vm.customRentalApplicationCheck.companyLogo = data.Location;
							});
							// });
							// firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
							//   vm.opensuccesssweet("Profile Updated successfully!");
							// }, function (error) {

							//   vm.openerrorsweet("Profile Not Updated! Try again!");
							//   return false;
							// });
						}
					});
			}

			$scope.closecustomrentalappModal = function () {
				vm.customrentalapp.close();
			}

			vm.opencustomrentalapp = function () {
				vm.customrentalapp = $uibModal.open({
					templateUrl: 'customrentalapp.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};

		}])
'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
	.controller('tenantscheduleCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'emailSendingService', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, emailSendingService) {

		var vm = this;
		vm.showCal = false;
		var tenantID = localStorage.getItem('userID');
		vm.loader = 1;

		var propdbObj = firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function (snapshot) {
			// console.log(snapshot.val())
			$scope.$apply(function () {
				if (snapshot.val() !== null) {
					vm.calendardata = $.map(snapshot.val(), function (value, index) {
						if (value.schedulestatus == "confirmed") {
							var units = '';
							if (value.unitID === ' ' || !value.unitID) {
								units = '';
							} else {
								units = value.unitID + " - ";
							}
							return [{ scheduleID: index, className: 'bgm-cyan', title: units + value.address, start: new Date(value.dateslot) }];
						}
					});

					// vm.calendardata = [{scheduleID:"-KvaDdFDac3A_apLY-ce",className:"bgm-cyan",title:"Active kl",start:"24-September-2017"}]
					$scope.calendardata = vm.calendardata;

					console.log($scope.calendardata);
					vm.schedulesavail = 0;

					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function (value, index) {
						if (value.schedulestatus !== "removed" && value.schedulestatus !== "pending") {
							vm.schedulesavail = 1;
							var units = '';
							if (value.unitID === ' ' || !value.unitID) {
								units = '';
							} else {
								units = value.unitID + " - ";
							}
							var dateSlot = value.dateSlot;
							var timeRange = value.timeRange;
							if (value.schedulestatus == "pending" && value.proposeNewTime) {
								dateSlot = value.proposeNewTime.date1 || value.proposeNewTime.date2 || value.proposeNewTime.date3;
								timeRange = (value.proposeNewTime.fromTime1 + '-' + value.proposeNewTime.toTime1) || (value.proposeNewTime.fromTime2 + '-' + value.proposeNewTime.toTime2) || (value.proposeNewTime.fromTime3 + '-' + value.proposeNewTime.toTime3)
							}
							return [{ scheduleID: index, address: units + value.address, dateslot: moment(dateSlot, 'MM/DD/YYYY').format('DD MMMM YYYY'), timerange: timeRange, schedulestatus: value.schedulestatus }];
						}
					});

					vm.extracols = [
						{ field: "", title: "", show: true }
					];

				} else {
					vm.tabledata = [{ scheduleID: '', address: '', dateslot: '', timerange: '', schedulestatus: '' }];
					vm.calendardata = [{ scheduleID: '', className: 'bgm-cyan', title: '', start: '' }]
					$scope.calendardata = vm.calendardata;
					vm.schedulesavail = 0;
				}

				vm.cols = [
					{ field: "address", title: "Address", sortable: "address", show: true },
					{ field: "dateslot", title: "Date", show: true },
					{ field: "timerange", title: "Time", show: true },
					{ field: "schedulestatus", title: "Status", sortable: "schedulestatus", show: true }
				];


				vm.loader = 0;

				//Sorting
				vm.tableSorting = new NgTableParams({
					sorting: { address: 'asc' }
				},

					{
						dataset: vm.tabledata,
						counts: [],
						paginate: false

						/*, {
							total: vm.tabledata.length, // length of data
							getData: function($defer, params) {
								// console.log(params);
								// use build-in angular filter
								var orderedData = params.sorting() ? $filter('orderBy')(vm.tabledata, params.orderBy()) : vm.tabledata;
					
								$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
							}*/
						// dataset: vm.tabledata
					})

				vm.showCal = false;
			});
		});

		vm.cancelschedule = function (index) {
			// console.log(index);
			// if ($window.confirm("Are you sure you want to cancel this viewing appointment?")) {
			swal({
				title: "Are you sure?",
				text: 'This will Cancel this viewing appointment!',
				type: "warning",
				showCancelButton: true,
				confirmButtonClass: "btn-danger",
				confirmButtonText: 'Yes',
				closeOnConfirm: true
			}, function () {
				firebase.database().ref('applyprop/' + index).update({
					schedulestatus: "cancelled"
				})

				firebase.database().ref('applyprop/' + index).once("value", function (snapshot) {
					firebase.database().ref('users/' + snapshot.val().landlordID).once("value", function (snap) {
						var emailData = '<p>Hello, </p><p>' + snapshot.val().name + ' has <strong>cancelled</strong> their viewing at ' + snapshot.val().dateslot + ', ' + snapshot.val().timerange + ' for ' + snapshot.val().address + '.</p><p>The time slot is now open to other renters.</p><p>To view details, please <a href="http://www.vcancy.com/login/#/"> log in </a> and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

						emailSendingService.sendEmailViaNodeMailer(snap.val().email, snapshot.val().name + 'has cancelled viewing for ' + snapshot.val().address, 'cancelstatus', emailData);
					});

					var emailData = '<p>Hello ' + snapshot.val().name + ', </p><p>Your viewing time ' + snapshot.val().dateslot + ', ' + snapshot.val().timerange + ' has been been <strong>cancelled</strong> by the landlord of ' + snapshot.val().address + '.</p><p>Please book another time using the link initially provided or contact the landlord directly.</p><p>To view details, please <a href="http://www.vcancy.com/login/#/"> log in </a> and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

					emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Your viewing has been cancelled for ' + snapshot.val().address, 'cancelstatus', emailData);
				});
				$state.reload();
			});

			// }
		}

		vm.removeSchedule = function (key) {
			swal({
				title: "Are you sure?",
				text: 'This will delete the schedule from the system.',
				type: "warning",
				showCancelButton: true,
				confirmButtonClass: "btn-danger",
				confirmButtonText: 'Delete',
				closeOnConfirm: true
			}, function () {
				firebase.database().ref('applyprop/' + key).update({
					schedulestatus: 'removed'
				}).then(function () {
					$state.reload();
				})
					.catch(function (err) {
						console.error('ERROR', err);
						swal("", "There was error deleteing the schedule.", "error");
					});

			});
		}
	}])

'use strict';

//=================================================
// Landlord Dashboard
//=================================================

vcancyApp
	.controller('landlorddboardlCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _) {

		var vm = this;
		var landlordID = localStorage.getItem('userID');
		vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
		vm.proplive = 0;
		vm.unitsCount = 0;
		vm.vacantUnits = 0;
		vm.appliedProperties;
		vm.viewingschedule = 0;
		vm.viewed = 0;
		vm.submitapps = 0;

		vm.moment = moment;
		$scope.eventSources = [];
		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();

		$scope.uiConfig = {
			calendar: {
				height: 500,
				editable: false,
				header: {
					left: 'title',
					center: '',
					right: 'today prev,next'

				},
				buttonText: {
					today: 'Today',
				},

				//	eventClick: $scope.alertEventOnClick,
				//	eventDrop: $scope.alertOnDrop,
				//	eventResize: $scope.alertOnResize
			}
		};


		$scope.events = [];

		$scope.eventSources = [$scope.events]
		vm.propertySelected = '';
		vm.unitSelected = '';
		vm.selectedUnitId = '';
		vm.units = [];
		vm.fromDate = '';
		vm.toDate = '';
		vm.fromTime = '';
		vm.toTime = '';
		vm.properties = [];
		vm.listings = [];
		vm.mergeListing = {};
		vm.selectedListings = [];

		function getListings() {
			vm.loader = 1;
			var propdbObj = firebase.database().ref('propertiesSchedule/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {

				$scope.$apply(function () {
					vm.success = 0;
					if (snapshot.val()) {
						vm.listings = snapshot.val();
						vm.generateMergeListing();
						$.map(vm.listings, function (value, key) {
							value.parsedFromDate = parseInt(new moment(value.fromDate).format('x'))
							value.parsedToDate = parseInt(new moment(value.toDate).format('x'))
							var startDate = new Date(value.fromDate).setHours(parseFloat(value.fromTime));
							var endDate = new Date(value.toDate).setHours(parseFloat(value.toTime));
							$scope.events.push(
								{
									title: value.unitID + '-' + vm.properties[value.propertyId].address,
									start: new Date(startDate),
									end: new Date(endDate),
									className: 'bgm-teal'
								}
							)
						});
						vm.listingsAvailable = 1;
					} else {
						vm.listingsAvailable = 0;
					}
					vm.loader = 0;
				});
			});
		}

		function getProperties() {
			var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {

				$scope.$apply(function () {
					vm.success = 0;
					if (snapshot.val()) {
						vm.properties = snapshot.val();
						vm.propertiesAvailable = 1;
					} else {
						vm.propertiesAvailable = 0;
					}
					vm.loader = 0;
					getListings();
				});
			});
		}

		function getPendingProposedTime() {
			vm.loader = 1;
			vm.apppropaddress = {};
			var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
				if (snapshot.val()) {
					$scope.$apply(function () {
						var proposedTimeList = {};
						_.map(snapshot.val(), function (value, key) {
							if (value.schedulestatus == 'pending' && value.proposeNewTime) {
								proposedTimeList[key] = value;
							}
						});
						vm.apppropaddress = proposedTimeList;
					});
				}
				$scope.$apply(function () {
					vm.loader = 0;
				});
			});
		}

		function init() {
			vm.loader = 1;
			getProperties();
			getPendingProposedTime();
		}

		init();

		vm.updateCheck = function (key) {
			var updateData = {};
			updateData[key] = true
			firebase.database().ref('users/' + landlordID).update(updateData)
				.then(function () {
					firebase.database().ref('users/' + landlordID).once('value')
						.then(function (snap) {
							var updatedUser = snap.val();
							$scope.$apply(function () {
								localStorage.setItem('userData', JSON.stringify(updatedUser));
								vm.userData = JSON.parse(localStorage.getItem('userData'));
							});
						});
				}, function (error) {
					console.error('Error > ', error);
				})
		};

		vm.acceptProposeTime = function (key, index) {
			vm.loader = 1;
			var updatedData = {
				dateSlot: vm.apppropaddress[key].proposeNewTime['date' + index],
				fromTimeSlot: vm.apppropaddress[key].proposeNewTime['fromTime' + index],
				toTimeSlot: vm.apppropaddress[key].proposeNewTime['toTime' + index],
				timeRange: vm.apppropaddress[key].proposeNewTime['fromTime' + index] + '-' + vm.apppropaddress[key].proposeNewTime['toTime' + index],
				schedulestatus: "scheduled"
			}
			firebase.database().ref('applyprop/' + key).update(updatedData)
			.then(function() {
				getPendingProposedTime();
			});
		}

		vm.generateMergeListing = function () {
			vm.mergeListing = {};
			_.forEach(vm.listings, function (list, key) {
				if (!vm.mergeListing[list.link]) {
					vm.mergeListing[list.link] = angular.copy(vm.listings[key]);
					vm.mergeListing[list.link].fromToDate = [];
					var date = moment(vm.listings[key].fromDate).format('DD MMM') + '-' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
					vm.mergeListing[list.link].fromToDate.push(date);
					vm.mergeListing[list.link].keys = [key];
				} else {
					var date = moment(vm.listings[key].fromDate).format('DD MMM') + ' - ' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
					vm.mergeListing[list.link].fromToDate.push(date);
					vm.mergeListing[list.link].keys.push(key);
				}
			});
		};

		vm.clearAll = function ($event) {
			vm.propertySelected = '';
			vm.unitSelected = '';
			vm.selectedUnitId = '';
			vm.units = [];
			vm.fromDate = '';
			vm.toDate = '';
			vm.fromTime = '';
			vm.toTime = '';
			$event.preventDefault();
		}

		vm.checkAllListing = function () {
			$.map(vm.listings, function (value, key) {
				value.inputCheck = vm.selectedAllListing;
			});
		}

		vm.addAvailability = function ($event) {
			$event.preventDefault();
			if (!vm.propertySelected || !vm.fromDate || !vm.toDate || !vm.fromTime || !vm.toTime) {
				return;
			}
			var availabilities = [];

			let url = 'https://vcancy.com/login/#/applyproperty/'
			if (window.location.host.startsWith('localhost')) {
				url = 'http://localhost:9000/#/applyproperty/'
			}
			var availability = {
				propertyId: vm.propertySelected,
				fromDate: moment(vm.fromDate.toString()).toDate().toString(),
				fromTime: vm.fromTime,
				toDate: moment(vm.toDate.toString()).toDate().toString(),
				toTime: vm.toTime,
				landlordID: landlordID,
				userID: userID,
				link: url + vm.propertySelected,
				status: 'Not Listed',
				listOnCraigslist: false
			}
			if (vm.properties[vm.propertySelected].units == 'multiple') {
				vm.units = _.map(vm.selectedUnitId, 'unit');
				if (vm.units.length == 0) {
					return;
				}
			}
			if (vm.units.length > 0) {
				vm.units.forEach(function (unit) {
					var data = {
						unitID: unit
					}
					var _unitAvailability = Object.assign(data, availability);
					_unitAvailability.link = _unitAvailability.link + '?unitId=' + unit
					availabilities.push(_unitAvailability);
				});
			} else {
				availabilities.push(availability);
			}
			var promises = [];
			var fbObj = firebase.database();
			availabilities.forEach(function (availability) {
				var promiseObj = fbObj.ref('propertiesSchedule/').push().set(availability)
				promises.push(promiseObj);
			});
			vm.loader = 1;
			$q.all(promises).then(function () {
				vm.loader = 0;
				vm.propertySelected = '';
				vm.units = [];
				vm.unitSelected = '';
				vm.selectedUnitId = '';
				vm.fromDate = '';
				vm.toDate = '';
				vm.fromTime = '';
				vm.toTime = '';
				getListings();
			});
		};

		vm.deleteListings = function ($event) {
			var selectedListings = [];
			$.map(vm.mergeListing, function (value, key) {
				if (value.inputCheck) {
					selectedListings = _.concat(selectedListings, value.keys);
				}
			});
			if (selectedListings.length == 0) {
				return;
			}
			var promises = [];
			vm.loader = 1;
			var fbObj = firebase.database();
			selectedListings.forEach(function (listing) {
				var promiseObj = fbObj.ref('propertiesSchedule/' + listing).remove();
				promises.push(promiseObj);
			});
			$q.all(promises).then(function () {
				vm.loader = 0;
				vm.selectedListings = [];
				vm.listings = [];
				vm.selectedAllListing = false;
				getListings();
			});
		}

		vm.toggleCraigsList = function (listingId, value, $event) {
			vm.loader = 1;
			var fbObj = firebase.database();
			var promiseObj = fbObj.ref('propertiesSchedule/' + listingId).update({
				listOnCraigslist: value
			})
			promiseObj
				.then(function () {
					vm.loader = 0;
					getListings();
				})
				.catch(function () {
					vm.loader = 0;
				});
		}

		vm.loader = 1;

		var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
			// console.log(snapshot.val())
			var properties = snapshot.val() || {};
			$scope.$apply(function () {
				var liveProperties = 0;
				var unitsCount = 0;
				var vacantUnits = 0;
				_.forEach(properties, function (value, key) {
					if (value.unitlists) {
						unitsCount = unitsCount + value.unitlists.length;
						var _vacantUnits = _.sumBy(value.unitlists, function (unitObj) {
							if (unitObj.status == "" || unitObj.status == "available" || !unitObj.status) {
								return 1;
							}
							return 0;
						});
						vacantUnits = vacantUnits + _vacantUnits || 0;
					}
					liveProperties = liveProperties + 1;
				});
				vm.proplive = liveProperties;
				vm.unitsCount = unitsCount;
				vm.vacantUnits = vacantUnits;
				vm.loader = 0;
			});

		});

		var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
			console.log(snapshot.val())
			var appliedProperties = 0;
			$scope.$apply(function () {
				if (snapshot.val()) {
					$.map(snapshot.val(), function (value, index) {

						if (value.schedulestatus == "confirmed" && moment(value.dateslot).isBefore(new Date())) {
							vm.viewed += 1;
						}
						if (value.schedulestatus == "confirmed" && moment(value.dateslot).isAfter(new Date())) {
							vm.viewingschedule += 1;
						}
						if (value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date()) && moment(value.fromTimeSlot).format('hh:mm a') < moment(new Date()).format('HH:mm') && moment(value.toTimeSlot).format('HH:mm') < moment(new Date()).format('HH:mm')) {
							vm.viewed += 1;
						}
						if (value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date()) && moment(value.fromTimeSlot).format('hh:mm a') >= moment(new Date()).format('HH:mm') && moment(value.toTimeSlot).format('HH:mm') >= moment(new Date()).format('HH:mm')) {
							vm.viewingschedule += 1;
						}
						if (value.schedulestatus == "submitted") {
							vm.submitapps += 1;
						}

						appliedProperties = appliedProperties + 1;
					});
				}
				vm.appliedProperties = appliedProperties;
				vm.loader = 0;
			});

		});

	}])
'use strict';

//=================================================
// Tenant Dashboard
//=================================================

vcancyApp
    .controller('tenantdboardlCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		
		vm.viewingschedule = 0;
		vm.submitapps = 0;
		vm.propactive = 0;
		vm.applicationcomplete = 0;
		
		vm.loader = 1;
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val() != null){
					$.map(snapshot.val(), function(value, index) {
					
						if(value.schedulestatus == "confirmed" && moment(value.dateslot).isAfter(new Date())  ) {
							vm.viewingschedule += 1;
						}
						if(value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date()) &&   moment(value.fromtimeslot).format('HH:mm') >= moment(new Date()).format('HH:mm') &&  moment(value.toslot).format('HH:mm') >= moment(new Date()).format('HH:mm')) {
							vm.viewingschedule += 1;
						}
						
						if(value.schedulestatus == "submitted"){
							vm.submitapps += 1;
						}
						
					});	
				
					vm.loader = 0;
				} else {
					vm.loader = 0;
				}
			});
		   
		});
}])
'use strict';

//=================================================
// Tenant Applications
//=================================================

vcancyApp
	.controller('tenantappCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'emailSendingService', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, emailSendingService) {

		var vm = this;
		var tenantID = localStorage.getItem('userID');
		var userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {};
		var userEmail = localStorage.getItem('userEmail');
		vm.loader = 1;
		vm.submittedappsavail = 0;
		$scope.reverseSort = false;
		vm.submitappsdata = [];

		firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function (snapshot) {
			// console.log(snapshot.val())
			$scope.$apply(function () {
				if (snapshot.val() != null) {
					vm.pendingappsavail = 0;

					console.log($rootScope.$previousState.name);
					if ($rootScope.$previousState.name == "rentalform") {
						$state.reload();
					}
					//to map the object to array
					console.log(snapshot.val());
					vm.tabledata = $.map(snapshot.val(), function (value, index) {
						if (value.schedulestatus == "scheduled") { // && moment(value.dateslot).isBefore(new Date())
							vm.pendingappsavail = 1;
							var units = '';
							if (value.unitID === ' ' || !value.unitID) {
								units = '';
							} else {
								units = value.unitID + " - ";
							}
							return [{ applicationID: 0, scheduleID: index, address: units + value.address, dateslot: value.dateSlot, timerange: value.timeRange, schedulestatus: value.schedulestatus }];
						}
					});

					// console.log(vm.tabledata);
					angular.forEach(vm.tabledata, function (schedule, key) {
						firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function (snap) {
							// console.log(snap.val());
							$scope.$apply(function () {
								if (snap.val() != null) {
									$.map(snap.val(), function (val, k) {
										vm.tabledata[key].applicationID = k;
									});
								}
							});
						});
					});

					// console.log(vm.tabledata);

					vm.extracols = [
						{ field: "scheduleID", title: "", show: true }
					];


					vm.cols = [
						{ field: "address", title: "Address", sortable: "address", show: true },
						{ field: "dateslot", title: "Viewed On", sortable: "dateslot", show: true }
					];

					vm.loader = 0;

					//Sorting
					vm.tableSorting = new NgTableParams({
						sorting: { address: 'asc' }
					},

						{
							dataset: vm.tabledata

							/*, {
							total: vm.tabledata.length, // length of data
							getData: function($defer, params) {
								// console.log(params);
								// use build-in angular filter
								var orderedData = params.sorting() ? $filter('orderBy')(vm.tabledata, params.orderBy()) : vm.tabledata;
					
								$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
							}*/
							// dataset: vm.tabledata
						})
				}


				if (snapshot.val() != null) {
					$.map(snapshot.val(), function (val, key) {
						firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(key).once("value", function (snap) {
							$scope.$apply(function () {
								if (snap.val() !== null) {
									//to map the object to array
									$.map(snap.val(), function (value, index) {
										if (val.externalappStatus == "submit") {
											vm.submittedappsavail = 1;
											vm.submitappsdata.push({ appID: index, address: value.address, dated: moment(value.dated).format("DD-MMMM-YYYY"), rentalstatus: value.rentalstatus });
										}
									});
								}
							});
						});
					});

					vm.submitappsextracols = [
						{ field: "appID", title: "", show: true }
					];

					vm.submitappscols = [
						{ field: "address", title: "Address", sortable: "address", show: true },
						{ field: "dated", title: "Submitted On", sortable: "dated", show: true },
					];

					//Sorting
					vm.submitappsSorting = new NgTableParams({
						sorting: { address: 'asc' },
						count: vm.submitappsdata.length						
					},

						{
							dataset: vm.submitappsdata
						});
				}

			});
		});

		firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).once("value", function (snapshot) {
			$scope.$apply(function () {
				if (snapshot.val() != null) {
					$.map(snapshot.val(), function (value, key) {
						if (value.scheduleID != 0 && value.externalappStatus == "submit") {
							vm.submittedappsavail = 1;
							vm.submitappsdata.push({ appID: key, address: value.address, dated: moment(value.dated).format("DD-MMMM-YYYY"), rentalstatus: value.rentalstatus });
						}
					});
					vm.submitappsextracols = [
						{ field: "appID", title: "", show: true }
					];

					vm.submitappscols = [
						{ field: "address", title: "Address", sortable: "address", show: true },
						{ field: "dated", title: "Submitted On", sortable: "dated", show: true },
					];

					//Sorting
					vm.submitappsSorting = new NgTableParams({
						sorting: { address: 'asc' },
						count: vm.submitappsdata.length
					},

						{
							dataset: vm.submitappsdata
						})
				}

			});
		});

		if (vm.submittedappsavail == 0) {
			// vm.submitappsdata.push({scheduleID:'', name:'', age: '', profession: '',salary: '', pets: '', maritalstatus:'', appno:'',  schedulestatus: ''});
		} else {
			vm.loader = 0;
		}

		if (vm.pendingappsavail == 0) {
			// vm.tabledata.push({scheduleID:'', address:'', dateslot: '', timerange: '',  schedulestatus: ''});
		} else {
			vm.loader = 0;
		}


		console.log($rootScope.$previousState.name);
		if ($rootScope.$previousState.name == "rentalform") {
			$state.reload();
		}

		vm.email = '';
		vm.disablebutton = 1;
		vm.emailrequired = function (event) {
			if (vm.email == '' || !vm.email.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/)) {
				vm.disablebutton = 1;
			} else {
				vm.disablebutton = 0;
			}
		}

		vm.openRentalForm = function () {
			$rootScope.isFormOpenToSaveInDraft = true;
			window.location.href = "#/rentalform/0/0";
		}

		vm.requestCreditReport = function () {
			swal({
				title: "",
				text: "We will send you an email with instructions on how to get your credit report.\n Are you sure you want to submit this request?",
				type: "info",
				showCancelButton: true,
				confirmButtonClass: "bgm-teal",
				confirmButtonText: "Yes",
				closeOnConfirm: false
			}, function () {
				// swal("Deleted!", "Your imaginary file has been deleted.", "success");
				var userName = '';
				if (userData) {
					userName = userData.firstname + ' ' + (userData.lastname || '');
				}
				var emailData = '<p>Hello, </p><p>' + userName + '- ' + userEmail + ' has requested for credit report from the tenant portal';
				var toEmail = 'creditrequest@vcancy.com';
				emailSendingService.sendEmailViaNodeMailer(toEmail, 'Tenant Request for Credit Report', 'Request Credit Report', emailData);
				swal("", "Your request has been submitted successfully, you will soon receive an email.", "success");
			});

		}

		vm.gotoRental = function (event) {
			if (vm.disablebutton == 0) {
				$rootScope.renterExternalEmail = vm.email;
				window.location.href = "#/rentalform/0/0";
			}
		}


	}])
'use strict';

//=================================================
// Landlord Applications
//=================================================

vcancyApp
	.controller('landlordappCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', '$uibModal', '_', '$q', 'emailSendingService',
		function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, $uibModal, _, $q, emailSendingService) {
			$scope.oneAtATime = true;
			var vm = this;
			vm.moment = moment;
			vm.sortType = 'name';
			vm.sortReverse = false;
			var landlordID = ''
			if (localStorage.getItem('refId')) {
				landlordID = localStorage.getItem('refId')
			} else {
				landlordID = localStorage.getItem('userID');
			}
			vm.landLordID = landlordID;
			var userData = JSON.parse(localStorage.getItem('userData'));
			var userEmail = localStorage.getItem('userEmail');
			vm.userData = userData;
			vm.propcheck = [];
			vm.applyPropUsers = {};
			vm.applyPropSubmittedUsers = {};
			vm.apppropaddress = [];
			vm.apppropaddressAppl = {};
			vm.submittedAppl = [];
			vm.submittedApplUsers = [];

			vm.originalPropAddress = [];
			vm.loader = 1;
			vm.creditCheck = {
				reportType: "Both of the above $45/Report",
				forTenant: ''
			}
			vm.customRentalApplicationCheck = {};
			vm.customRentalApplicationCheck.TCData = 'You are authorized to obtaining credit checks & verifying details contained in this Application.' +

				'This unit/s is strictly NON SMOKING. This offer is subject to acceptance by the landlord/property' +
				'management company that listed the property.This application is made on the understanding that no ' +
				'betterments will be provided to the Rental Unit except those which may be specifically requested in' +
				'this Application and agreed to in writing by the Landlord and specified in a tenancy agreement.' +

				'It is understood that this application will not be processed unless fully completed.' +

				'If the landlord/property management company accepts this Application, we will sign a Fixed ' +
				'Term Tenancy Agreement at the offices of the property management company or in person with' +
				'the landlord and pay the security deposit. The Rental Unit will not be considered rented' +
				'until the Fixed Term Tenancy Agreement is signed by the Tenant and the Landlord.' +

				'We will ensure that the collection, use, disclosure and retention of information will comply with ' +
				'the provisions of the Freedom of information and Protection of Privacy Act. ' +
				'Information will be collected and used only as necessary and for the intended purpose and will ' +
				'not be disclosed as required by law.' +

				'I hereby state that the information contained herein is true and I authorize my References' +
				'as listed above to release information regarding my employment and/or past/current tenancies.' +

				'Tenants are not chosen on a first come – first served basis. We choose the most suitable ' +
				'application for the unit at our sole discretion. This application form is to be used only' +
				'in the interested of the owner of the rental unit.';
			// Function to generate Random Id
			function generateToken() {
				var result = '',
					length = 6,
					chars = 'ABCEDFGHIJKLMNOPQRSTUVWXYZ0123456789';

				for (var i = 0; i < length; i++)
					result += chars[Math.floor(Math.random() * chars.length)];

				return result;
			}

			vm.questionDropDown = [
				{ id: 'WKRX6Q', label: 'What is your profession?', isChecked: true },
				{ id: 'MV5SML', label: 'Do you have Pets? Provide details', isChecked: true },
				{ id: 'N1F5MO', label: 'Are you able to provide references?', isChecked: false },
				{ id: 'OU489L', label: 'Why are you moving?', isChecked: false },
				{ id: 'U0G6V8', label: 'Tell me a bit about yourself', isChecked: true },
				{ id: 'A9OG32', label: 'No. of Applicants', isChecked: true },
				{ id: 'UH7JZS', label: 'Do you smoke?', isChecked: true },
				{ id: 'ZGJQ60', label: 'Move-in date', isChecked: true },
			];

			vm.filters = {
				options: [],
			};

			vm.companyDetail = function () {
				return vm.userData.companyname + ' ' + (vm.userData.contact || '')
			}

			vm.defaultRentalApplicationCheck = {
				'PAPPD': true,
				'CADDR': true,
				'PADDR': false,
				'AAPPD': false,
				'AAPP1': false,
				'AAPP2': false,
				'ESIV': true,
				'ESIV1': true,
				'VI': false,
				'EC': false,
				'EC1': false,
				'REF': true,
				'REF1': true,
				'REF2': false,
				'UD': true,
				'UDAAPP': false,
				'TC': true,
				'TCData': vm.customRentalApplicationCheck.TCData,
				'companyLogo': userData ? userData.companylogo : '',
				'companyDetails': vm.companyDetail()
			}

			function refreshCustomRentalApplicationCheck() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.customRentalApplicationCheck) {
					if (userData.customRentalApplicationCheck && !userData.customRentalApplicationCheck.TCData) {
						userData.customRentalApplicationCheck.TCData = vm.customRentalApplicationCheck.TCData;
					}
					if (!userData.customRentalApplicationCheck.companyLogo) {
						userData.customRentalApplicationCheck.companyLogo = userData.companylogo || vm.customRentalApplicationCheck.companyLogo;
					}
					if (!userData.customRentalApplicationCheck.companyDetails) {
						userData.customRentalApplicationCheck.companyDetails = vm.companyDetail();
					}
					vm.customRentalApplicationCheck = userData.customRentalApplicationCheck;
				} else {
					vm.customRentalApplicationCheck = angular.copy(vm.defaultRentalApplicationCheck);
				}
			}
			refreshCustomRentalApplicationCheck();

			function refreshScreeningQuestions() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.screeningQuestions && userData.screeningQuestions.length !== 0) {
					vm.screeningQuestions = userData.screeningQuestions;
				} else {
					vm.screeningQuestions = angular.copy(vm.questionDropDown);
				}
			}
			refreshScreeningQuestions();

			vm.getUsers = function () {

				if (vm.apppropaddressList) {
					vm.loader = 1;
					var promises = [];
					_.map(vm.apppropaddressList, function (value, key) {
						var promiseObj = firebase.database().ref('users/' + value.tenantID).once("value");
						promises.push(promiseObj);
					});
					$q.all(promises).then(function (data) {
						var usersData = {};
						data.forEach(function (dataObj) {
							usersData[dataObj.key] = dataObj.val();
						});
						vm.applyPropUsers = usersData;
						_.forEach(vm.submittedApplUsers, function (value, index) {
							if (usersData[value]) {
								vm.applyPropSubmittedUsers[value] = usersData[value];
							}
						});
						vm.apppropaddress = vm.apppropaddressList;
						// console.log(vm.apppropaddressList)
						vm.loader = 0;
					});
				}
			}

			vm.getProperty = function () {
				vm.loader = 1;
				var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					if (snapshot.val()) {
						vm.properties = snapshot.val();
					}
					vm.loader = 0;
				});
			};

			vm.getApplyProp = function () {
				vm.loader = 1;
				vm.apppropaddress = {};
				var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					if (snapshot.val()) {
						$scope.$apply(function () {

							vm.apppropaddressList = snapshot.val();
							_.forEach(vm.apppropaddressList, function (value, key) {
								value.key = key;
							});
							// vm.getUsers();
							// console.log(vm.apppropaddressList)
							vm.originalPropAddress = angular.copy(snapshot.val());
							vm.loader = 1;
							var promises = [];
							_.map(vm.apppropaddressList, function (value, key) {
								if (value.schedulestatus == 'submitted') {
									vm.submittedApplUsers.push(value.tenantID);
									var promiseObj = firebase.database().ref('submitapps/').limitToLast(1).orderByChild("scheduleID").equalTo(key).once("value");
									promises.push(promiseObj);
								}
							});
							vm.submittedApplUsers = _.uniq(vm.submittedApplUsers);

							$q.all(promises).then(function (data) {
								var usersData = {};
								data.forEach(function (dataObj) {
									if (dataObj.val()) {
										_.forEach(dataObj.val(), function (_value, _key) {
											vm.apppropaddressAppl[_key] = _value;

											vm.submittedAppl.push(_value)
											_.forEach(vm.apppropaddressList, function (list, key) {
												if (key === _value.scheduleID) {
													list.applyedRentalForm = _value;
													vm.originalPropAddress[key].applyedRentalForm = _value;
												};
											});
										});
									}
									
									vm.getUsers();
								});
								vm.loader = 0;
							});
						});
					}
					$scope.$apply(function () {
						vm.loader = 0;
					});
				});
			};


			vm.getUserName = function (id, value, key) {
				if (!vm.applyPropUsers[id]) {
					return value.name || '-';
				}
				if (key === 'email') {
					return vm.applyPropUsers[id][key] || '-';
				}
				return ((vm.applyPropUsers[id].firstname || '') + ' ' + (vm.applyPropUsers[id].lastname || '')) || '-';
			}

			vm.changeSort = function (key) {
				// $scope.$apply(function() {
				// $timeout	
				vm.sortType = key;
				vm.sortReverse = !vm.sortReverse;
				// });
			}

			$scope.formatDay = function (key) {
				return moment(key, 'MM/DD/YYYY').format('ddd')
			};

			$scope.formatDate = function (key) {
				return moment(key, 'MM/DD/YYYY').format('MMM DD')
			};

			vm.init = function () {
				vm.getProperty();
				vm.getApplyProp();
			};

			vm.init();

			vm.openPrescremingQuestions = function () {
				refreshScreeningQuestions();
				vm.prescremingQuestion = $uibModal.open({
					templateUrl: 'prescremingquestions.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};
			vm.filterData = function (forProperty) {
				var properties = angular.copy(vm.originalPropAddress);
				vm.apppropaddress = properties;
				if (vm.filters.property) {
					var obj = {};
					_.filter(properties, function (value, key) {
						if (value.propID == vm.filters.property) {
							obj[key] = value;
						}
					});
					vm.apppropaddress = obj;
				}
				if (forProperty) {
					vm.filters.unit = [];
				}
				if (vm.filters.unit && vm.filters.unit.length > 0) {
					var unitItems = {};
					var unitIds = _.reduce(vm.filters.unit, function (previousValue, currentValue, key) {
						if (currentValue.unit) {
							previousValue.push(parseInt(currentValue.unit));
						}
						return previousValue;
					}, []);
					_.filter(properties, function (value, key) {
						if (value.propID == vm.filters.property && unitIds.includes(parseInt(value.unitID))) {
							unitItems[key] = value;
						}
					});
					vm.apppropaddress = unitItems;
					return
				}

				vm.apppropaddress = obj;
			}

			vm.selectAllQuestions = function () {
				vm.filters.options = angular.copy(vm.screeningQuestions);
			}

			vm.clearAllFilters = function () {
				vm.filters = {
					options: []
				}

				_.forEach(vm.originalPropAddress,function(value,key){
					value.key = key;
				});
				vm.apppropaddress = angular.copy(vm.originalPropAddress);
			}

			vm.getApplicationLink = function (key) {
				var data;
				_.forEach(vm.apppropaddressAppl, function (_value, _key) {
					if (_value.scheduleID == key) {
						data = _key;
						return false;
					}
				});
				if (data) {
					var host = window.location.origin;
					if (host.indexOf('localhost') > -1) {
						host = host + '/#/viewapplication/' + data;
					} else {
						host = host + '/login/#/viewapplication/' + data;
					}
					return host;
				}
				return false;
			}

			vm.getRentalField = function (key, field) {
				let data;
				_.forEach(vm.apppropaddressAppl, function (_value, _key) {
					if (_value.scheduleID == key) {
						data = _value;
						return false;
					}
				});
				if (data) {
					return data[field]
				} else {
					return '-'
				}
			}
			vm.customQuestion = null;
			vm.addCustomQuestion = function () {
				if (!vm.customQuestion) {
					return;
				}
				var data = {
					label: vm.customQuestion,
					id: generateToken(),
					isChecked: false
				}

				vm.screeningQuestions.push(data);
				vm.customQuestion = null;
			}

			vm.saveScreeningQuestions = function () {
				vm.loader = 1;
				var ques = angular.copy(vm.screeningQuestions);
				_.omit(ques, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					screeningQuestions: ques
				}).then(function () {
					userData.screeningQuestions = ques;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshScreeningQuestions();
					vm.loader = 0;
					vm.prescremingQuestion.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			vm.saveCustomRentalApplicationCheck = function () {
				vm.loader = 1;
				var customChecks = angular.copy(vm.customRentalApplicationCheck);
				console.log('customChecks', customChecks);
				_.omit(customChecks, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					customRentalApplicationCheck: customChecks
				}).then(function () {
					userData.customRentalApplicationCheck = customChecks;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshCustomRentalApplicationCheck();
					vm.loader = 0;
					vm.customrentalapp.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			$scope.uploadDetailsImages = function (event) {
				var file = event.target.files[0];
				AWS.config.update({
					accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
					secretAccessKey: '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'
				});
				AWS.config.region = 'ca-central-1';

				var bucket = new AWS.S3({
					params: {
						Bucket: 'vcancy-final'
					}
				});
				var filename = moment().format('YYYYMMDDHHmmss') + file.name;
				filename = filename.replace(/\s/g, '');

				if (file.size > 3145728) {
					swal({
						title: "Error!",
						text: 'File size should be 3 MB or less.',
						type: "error",
					});
					return false;
				} else if (file.type.indexOf('image') === -1) {
					swal({
						title: "Error!",
						text: 'Only files are accepted.',
						type: "error",
					});
					return false;
				}

				var params = {
					Key: 'company-logo/' + filename,
					ContentType: file.type,
					Body: file,
					StorageClass: "STANDARD_IA",
					ACL: 'public-read'
				};

				bucket.upload(params).on('httpUploadProgress', function (evt) { })
					.send(function (err, data) {
						if (data && data.Location) {
							$scope.$apply(function () {
								vm.customRentalApplicationCheck.companyLogo = data.Location;
							});
							// });
							// firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
							//   vm.opensuccesssweet("Profile Updated successfully!");
							// }, function (error) {

							//   vm.openerrorsweet("Profile Not Updated! Try again!");
							//   return false;
							// });
						}
					});
			}
			vm.sortBy = {};
			vm.opencustomrentalapp = function () {
				vm.customrentalapp = $uibModal.open({
					templateUrl: 'customrentalapp.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};

			vm.deleteQuestionById = function (id) {
				var index = vm.screeningQuestions.findIndex(function (ques) {
					if (ques.id == id) return true;
				});
				vm.screeningQuestions.splice(index, 1);
			};


			vm.openruncreditcriminalcheck = function () {
				vm.runcreditcriminalcheck = $uibModal.open({
					templateUrl: 'runcreditcriminalcheck.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};

			$scope.closePrescreeningModal = function () {
				vm.prescremingQuestion.close();
			}

			$scope.closecustomrentalappModal = function () {
				vm.customrentalapp.close();
			}

			$scope.closeruncreditcriminalcheckModal = function () {
				vm.runcreditcriminalcheck.close();
				vm.creditCheck = {
					reportType: "Both of the above $45/Report",
					forTenant: ''
				}
			}

			$scope.submitCreditCheck = function () {
				var tenantData = vm.applyPropUsers[vm.creditCheck.forTenant];
				if (!tenantData) {
					return;
				}
				swal({
					title: "Are you sure?",
					text: "Your account will be charged with the amount specified.",
					type: "info",
					showCancelButton: true,
					confirmButtonClass: "bgm-teal",
					confirmButtonText: "Yes",
					closeOnConfirm: false
				},
					function () {
						var userName = '';
						if (userData) {
							userName = userData.firstname + ' ' + (userData.lastname || '');
						}
						var tenantUserName = tenantData.firstname + ' ' + (tenantData.lastname || '');
						var emailData = '<p>Hello, </p><p>Landlord - ' + userName + ' (' + userEmail + ') has requested credit report of tenant - ' + tenantUserName + ' (' + tenantData.email + ') for type - ' + vm.creditCheck.reportType + '</p>';
						var toEmail = 'creditrequest@vcancy.com';
						emailSendingService.sendEmailViaNodeMailer(toEmail, 'Landlord request for Credit/Criminal Report', 'Request Credit?criminal Check Report', emailData);
						swal("", "Your request has been submitted successfully!", "success");
						var requestData = {
							tenantID: vm.creditCheck.forTenant,
							tenantEmail: tenantData.email,
							landlordID: landlordID,
							landlordEmail: userEmail,
							requestType: vm.creditCheck.reportType,
							requestedOn: moment().format('x'),
							status: 'PENDING'
						}
						firebase.database().ref('credit_report_request/').push().set(requestData);
						$scope.closeruncreditcriminalcheckModal();
					});

			}

			vm.orderBySalary = function (key) {
				if (vm.sortBy[key] == undefined) {
					vm.sortBy = {};
				}
				vm.sortBy[key] = !vm.sortBy[key];
				var unsortedArray = angular.copy(vm.apppropaddress);
				if (vm.sortBy[key]) {
					var sorted = _.sortBy(unsortedArray, [key]);
				} else {
					var sorted = _.reverse(unsortedArray, [key]);
				}

				vm.apppropaddress = sorted;
			}
			vm.tablefilterdata = function (propID = '') {
				if (propID != '') {
					vm.propcheck[propID] = !vm.propcheck[propID];
				}
				vm.loader = 1;
				firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					// console.log(snapshot.val())
					$scope.$apply(function () {
						if (snapshot.val() != null) {
							$.map(snapshot.val(), function (value, index) {
								if (vm.apppropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus == "submitted") {
									vm.apppropaddress.push({ propID: value.propID, address: value.address, units: value.units });
									vm.propcheck[value.propID] = true;
								}
							});
						}
						vm.submitappsdata = [];

						if (snapshot.val() != null) {
							vm.submittedappsavail = 0;
							//to map the object to array
							vm.submitappsdata = $.map(snapshot.val(), function (value, index) {
								if (vm.propcheck[value.propID] == true || propID == '') {
									if (value.schedulestatus == "submitted") {
										vm.submittedappsavail = 1;
										return [{ scheduleID: index, name: value.name, age: value.age, profession: value.jobtitle, schedulestatus: value.schedulestatus }];
									}
								}
							});

							angular.forEach(vm.submitappsdata, function (schedule, key) {
								firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function (snapshot) {
									$scope.$apply(function () {
										if (snapshot.val()) {
											$.map(snapshot.val(), function (value, index) {
												vm.submitappsdata[key].applicationID = index;
												vm.submitappsdata[key].pets = value.pets;
												vm.submitappsdata[key].maritalstatus = value.maritalstatus;
												vm.submitappsdata[key].appno = value.applicantsno;
												firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(index).once("value", function (snap) {
													$scope.$apply(function () {
														if (snap.val()) {
															$.map(snap.val(), function (v, k) {
																// console.log(v);
																vm.submitappsdata[key].salary = v.mainapplicant.appgrossmonthlyincome;
															});
														}
													});
												});
											});
										}
									});
								});
							});

							vm.submitappsextracols = [
								{ field: "applicationID", title: "Credit Score", show: true }
							];


						} else {
							vm.submitappsdata = [{ scheduleID: '', name: '', age: '', profession: '', salary: '', pets: '', maritalstatus: '', appno: '', schedulestatus: '' }];

							vm.submittedappsavail = 0;
						}

						
						vm.submitappscols = [
							{ field: "name", title: "Name", sortable: "name", show: true },
							{ field: "age", title: "Age", sortable: "age", show: true },
							{ field: "profession", title: "Job Title", sortable: "profession", show: true },
							{ field: "salary", title: "Salary", sortable: "salary", show: true },
							{ field: "pets", title: "Pets", sortable: "pets", show: true },
							{ field: "maritalstatus", title: "Marital Status", sortable: "maritalstatus", show: true },
							{ field: "appno", title: "No of Applicants", sortable: "appno", show: true },
						];

						vm.loader = 0;

						//Sorting
						vm.submitappsSorting = new NgTableParams({
							sorting: { name: 'asc' }
						},

							{
								dataset: vm.submitappsdata
								/*}, {
									total: vm.submitappsdata.length, // length of data
									getData: function($defer, params) {
										// console.log(params);
										// use build-in angular filter
										var orderedData = params.sorting() ? $filter('orderBy')(vm.submitappsdata, params.orderBy()) : vm.submitappsdata;
							
										$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
									}*/
								// dataset: vm.submitappsdata
							})
					});
				});

			}
			// vm.tablefilterdata();

			vm.deleteApplyProp = function (key, status) {
				var statusToChange = 'cancelled';
				var message = "This will cancel the schedule."
				var buttonText = "Yes";

				if (status === 'cancelled') {
					statusToChange = 'removed';
					message = "This will delete the schedule from the system.";
					buttonText = "Delete";
				}

				swal({
					title: "Are you sure?",
					text: message,
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: buttonText,
					closeOnConfirm: true
				}, function () {
					firebase.database().ref('applyprop/' + key).update({
						schedulestatus: statusToChange
					}).then(function () {
						vm.getApplyProp();
					})
						.catch(function (err) {
							console.error('ERROR', err);
							swal("", "There was error deleteing the schedule.", "error");
						});

				});
			}
		}])
'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
	.controller('rentalformCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'Upload', '$http', 'emailSendingService', 'config',
		function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, Upload, $http, emailSendingService, config) {

			var vm = this;
			$scope.active = 0;
			$scope.activateTab = function (tab) {
				$scope.active = tab;
			};
			var tenantID = localStorage.getItem('userID');
			var scheduleID = $stateParams.scheduleId;
			var applicationID = $stateParams.applicationId;
			var tenantEmail = localStorage.getItem('userEmail');
			vm.submitemail = $rootScope.renterExternalEmail;
			console.log(vm.submitemail);
			$rootScope.renterExternalEmail = '';
			console.log($rootScope.renterExternalEmail);
			vm.draft = "false";
			vm.draftdata = "false";
			vm.rentownchange = function () {
				if (vm.rentaldata.rent_own == "rent") {
					vm.rentaldata.live_time = '';
					vm.rentaldata.rentamt = '';
					vm.rentaldata.vacantreason = '';
				} else {
					vm.rentaldata.live_time = ' ';
					vm.rentaldata.rentamt = '0.00';
					vm.rentaldata.vacantreason = ' ';
				}

			}

			vm.petschange = function () {
				if (vm.rentaldata.pets == "yes") {
					vm.rentaldata.petsdesc = '';
				} else {
					vm.rentaldata.petsdesc = ' ';
				}
			}

			vm.tenantdata = [];
			vm.rentaldata = [];
			vm.propdata = [];
			vm.scheduledata = [];


			vm.tenantdata.tenantID = '';
			vm.scheduledata.scheduleID = '';
			vm.propdata.propID = '';
			vm.propdata.landlordID = '';

			vm.propdata.address = '';
			vm.propdata.rent = '';
			vm.rentaldata.months = '';
			vm.rentaldata.startdate = '';
			vm.rentaldata.parking = '';
			vm.tenantdata.tenantName = '';
			vm.rentaldata.dob = '';
			vm.rentaldata.sinno = '';
			vm.rentaldata.telwork = '';
			vm.rentaldata.telhome = '';
			vm.tenantdata.tenantEmail = '';
			vm.rentaldata.appaddress = '';
			vm.rentaldata.appcity = '';
			vm.rentaldata.maritalstatus = '';
			vm.rentaldata.rent_own = '';
			vm.rentaldata.live_time = '';
			vm.rentaldata.rentamt = '';
			vm.rentaldata.vacantreason = '';
			vm.rentaldata.landlordname = '';
			vm.rentaldata.landlordphone = '';

			vm.rentaldata.otherappname = [];
			vm.rentaldata.otherappdob = [];
			vm.rentaldata.otherappsinno = [];

			vm.rentaldata.minorappname = [];
			vm.rentaldata.minorappdob = [];
			vm.rentaldata.minorappsinno = [];

			vm.rentaldata.pets = '';
			vm.rentaldata.petsdesc = '';
			vm.rentaldata.smoking = '';
			vm.rentaldata.appfiles = '';

			vm.rentaldata.appcurrentemployer = '';
			vm.rentaldata.appposition = '';
			vm.rentaldata.appemployerphone = '';
			vm.rentaldata.appworkingduration = '';
			vm.rentaldata.appgrossmonthlyincome = '';
			vm.rentaldata.appincometype = '';
			vm.rentaldata.appotherincome = '';

			vm.rentaldata.vehiclemake = '';
			vm.rentaldata.vehiclemodel = '';
			vm.rentaldata.vehicleyear = '';

			vm.rentaldata.vehiclemake2 = '';
			vm.rentaldata.vehiclemodel2 = '';
			vm.rentaldata.vehicleyear2 = '';

			vm.rentaldata.emergencyname = '';
			vm.rentaldata.emergencyphone = '';

			vm.rentaldata.refone_name = '';
			vm.rentaldata.refone_phone = '';
			vm.rentaldata.refone_relation = '';

			vm.rentaldata.reftwo_name = '';
			vm.rentaldata.reftwo_phone = '';
			vm.rentaldata.reftwo_relation = '';

			vm.rentaldata.otherappcurrentemployer = [];
			vm.rentaldata.otherappposition = [];
			vm.rentaldata.otherappemployerphone = [];
			vm.rentaldata.otherappworkingduration = [];
			vm.rentaldata.otherappgrossmonthlyincome = [];
			vm.rentaldata.otherappincometype = [];
			vm.rentaldata.otherappotherincome = [];

			vm.rentaldata.dated = '';
			vm.rentaldata.appsign = '';
			vm.rentaldata.otherappsign = [];

			vm.TCData = '';
			vm.customRentalApplicationCheck = null;
			// DATEPICKER
			vm.today = function () {
				vm.dt = new Date();
			};
			vm.today();

			vm.toggleMin = function () {
				vm.minDate = vm.minDate ? null : new Date();
			};
			vm.toggleMin();




			vm.dobopen = function ($event) {

				$event.preventDefault();
				$event.stopPropagation();
				vm.dobopened = true;
			};
			vm.dobopen1 = function ($event) {

				$event.preventDefault();
				$event.stopPropagation();
				vm.dobopened = false;
			};




			vm.dateopen = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();
				vm.dateopened = true;
			};
			vm.dateopen1 = function ($event) {
				$event.preventDefault();
				$event.stopPropagation();
				vm.dateopened = false;
			};

			vm.minordobopened = [];
			vm.minordobopen = function ($event, minorindex) {
				console.log(minorindex);
				$event.preventDefault();
				$event.stopPropagation();
				angular.forEach(vm.minor, function (value, key) {
					vm.minordobopened[key] = false;
					console.log(vm.minordobopened[key]);
				});
				vm.minordobopened[minorindex] = true;
				console.log("here1" + vm.minordobopened[minorindex]);
			};
			vm.minordobopen1 = function ($event, minorindex) {
				console.log(minorindex);
				$event.preventDefault();
				$event.stopPropagation();
				angular.forEach(vm.minor, function (value, key) {
					vm.minordobopened[key] = false;
					console.log(vm.minordobopened[key]);
				});
				vm.minordobopened[minorindex] = false;
				console.log("here2" + vm.minordobopened[minorindex]);
			};


			vm.adultdobopened = [];
			vm.adultdobopen = function ($event, adultindex) {
				console.log(adultindex);
				$event.preventDefault();
				$event.stopPropagation();
				angular.forEach(vm.adult, function (value, key) {
					vm.adultdobopened[key] = false;
					console.log(vm.adultdobopened[key]);
				});
				vm.adultdobopened[adultindex] = true;
				console.log("here3" + vm.adultdobopened[adultindex]);
			};
			vm.adultdobopen1 = function ($event, adultindex) {
				console.log(adultindex);
				$event.preventDefault();
				$event.stopPropagation();
				angular.forEach(vm.adult, function (value, key) {
					vm.adultdobopened[key] = false;
					console.log(vm.adultdobopened[key]);
				});
				vm.adultdobopened[adultindex] = false;
				console.log("here4" + vm.adultdobopened[adultindex]);
			};

			vm.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};
			vm.maxDate = new Date();
			vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			vm.format = vm.formats[0];


			vm.adult = [];
			vm.minor = [];
			vm.addadult = function (adultlen) {
				vm.adult.push(adultlen);
			}
			vm.addminor = function (minorlen) {
				vm.minor.push(minorlen);
			}



			// to remove adult
			vm.removeadult = function (slotindex) {
				console.log(slotindex, vm.adult);
				vm.adult.splice(slotindex, 1);
				vm.rentaldata.otherappname.splice(slotindex, 1);
				vm.rentaldata.otherappdob.splice(slotindex, 1);
				vm.rentaldata.otherappsinno.splice(slotindex, 1);
				vm.rentaldata.otherappcurrentemployer.splice(slotindex, 1);
				vm.rentaldata.otherappposition.splice(slotindex, 1);
				vm.rentaldata.otherappemployerphone.splice(slotindex, 1);
				vm.rentaldata.otherappworkingduration.splice(slotindex, 1);
				vm.rentaldata.otherappgrossmonthlyincome.splice(slotindex, 1);
				vm.rentaldata.otherappincometype.splice(slotindex, 1);
				vm.rentaldata.otherappotherincome.splice(slotindex, 1);
				vm.rentaldata.otherappsign.splice(slotindex, 1);
			}

			// to remove minor
			vm.removeminor = function (slotindex) {
				console.log(slotindex, vm.adult);
				console.log(vm.rentaldata);
				vm.minor.splice(slotindex, 1);
				vm.rentaldata.minorappdob.splice(slotindex, 1);
				vm.rentaldata.minorappsinno.splice(slotindex, 1);
				vm.rentaldata.minorappname.splice(slotindex, 1);

				console.log(vm.minor, vm.rentaldata);
			}

			$scope.something = function (form) {


				if ($("#test_" + form).val() == '') {
					$("#index_" + form).addClass('has-error');
				} else {
					$("#index_" + form).removeClass('has-error');
				}
			}
			$scope.minorsomething = function (form) {


				if ($("#minortext_" + form).val() == '') {
					$("#minor_" + form).addClass('has-error');
				} else {
					$("#minor_" + form).removeClass('has-error');
				}
			}

			$scope.aacetext = function (form) {


				if ($("#aacetext_" + form).val() == '') {
					$("#aace_" + form).addClass('has-error');
				} else {
					$("#aace_" + form).removeClass('has-error');
				}
			}


			$scope.aapotext = function (form) {


				if ($("#aapotext_" + form).val() == '') {
					$("#aapo_" + form).addClass('has-error');
				} else {
					$("#aapo_" + form).removeClass('has-error');
				}
			}

			$scope.aaeptext = function (form) {


				if ($("#aaeptext_" + form).val() == '') {
					$("#aaep_" + form).addClass('has-error');
				} else {
					$("#aaep_" + form).removeClass('has-error');
				}
			}

			$scope.aahowtext = function (form) {


				if ($("#aahowtext_" + form).val() == '') {
					$("#aahow_" + form).addClass('has-error');
				} else {
					$("#aahow_" + form).removeClass('has-error');
				}
			}

			$scope.aagrstext = function (form) {


				if ($("#aagrstext_" + form).val() == '') {
					$("#aagrs_" + form).addClass('has-error');
				} else {
					$("#aagrs_" + form).removeClass('has-error');
				}
			}

			$scope.aaothrtext = function (form) {


				if ($("#aaothrtext_" + form).val() == '') {
					$("#aaothr_" + form).addClass('has-error');
				} else {
					$("#aaothr_" + form).removeClass('has-error');
				}
			}


			if (applicationID == 0) {
				console.log(tenantID)
				firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).limitToLast(1).once("value", function (snapshot) {
					$scope.$apply(function () {
						if (snapshot.val() !== null) {
							$.map(snapshot.val(), function (value, index) {
								var date = new Date();
								vm.draftdata = "false";
								vm.applicationval = index;
								vm.tenantdata.tenantID = value.tenantID;
								// vm.scheduledata.scheduleID = value.scheduleID;
								// vm.propdata.propID = value.propID;
								// vm.propdata.landlordID = value.landlordID;

								// vm.propdata.address = value.address;
								console.log(value.rent)
								vm.propdata.rent = value.rent;
								vm.rentaldata.months = value.months;
								vm.rentaldata.startdate = value.startdate;
								vm.rentaldata.parking = value.parking;
								vm.rentaldata.telwork = value.telwork;
								vm.rentaldata.telhome = value.telhome;
								vm.tenantdata.tenantEmail = value.applicantemail;
								vm.rentaldata.appaddress = value.appaddress;
								vm.rentaldata.appcity = value.applicantcity;
								vm.rentaldata.maritalstatus = value.maritalstatus;
								vm.rentaldata.rent_own = value.rent_own;
								vm.rentaldata.live_time = value.live_time_at_address;
								vm.rentaldata.rentamt = value.rentamt;
								vm.rentaldata.vacantreason = value.vacantreason;
								vm.rentaldata.landlordname = value.landlordname;
								vm.rentaldata.landlordphone = value.landlordphone;
								vm.rentaldata.pets = value.pets;
								vm.rentaldata.petsdesc = value.petsdesc;
								vm.rentaldata.smoking = value.smoking;
								vm.rentaldata.appfiles = value.appfiles;
								vm.rentaldata.vehiclemake = value.vehiclemake;
								vm.rentaldata.vehiclemodel = value.vehiclemodel;
								vm.rentaldata.vehicleyear = value.vehicleyear;
								vm.rentaldata.vehiclemake2 = value.vehiclemake2;
								vm.rentaldata.vehiclemodel2 = value.vehiclemodel2;
								vm.rentaldata.vehicleyear2 = value.vehicleyear2;
								vm.rentaldata.emergencyname = value.emergencyname;
								vm.rentaldata.emergencyphone = value.emergencyphone;
								vm.rentaldata.refone_name = value.refone_name;
								vm.rentaldata.refone_phone = value.refone_phone;
								vm.rentaldata.refone_relation = value.refone_relation;
								vm.rentaldata.reftwo_name = value.reftwo_name;
								vm.rentaldata.reftwo_phone = value.reftwo_phone;
								vm.rentaldata.reftwo_relation = value.reftwo_relation;
								vm.rentaldata.dated = value.dated != '' ? $filter('date')(new Date(value.dated), 'dd-MMMM-yyyy') : '';
								console.log(scheduleID)
								firebase.database().ref('applyprop/' + scheduleID).once("value", function (snapshot) {
									console.log(snapshot.val())
									$scope.$apply(function () {
										if (snapshot.val()) {
											// console.log('applyprop', snapshot.val())
											vm.scheduledata = snapshot.val();
											vm.scheduledata.scheduleID = snapshot.key;

											firebase.database().ref('properties/' + vm.scheduledata.propID).once("value", function (snap) {
												$scope.$apply(function () {
													if (snap.val()) {
														console.log('properties', snap.val())
														vm.propdata = snap.val();
														vm.propdata.propID = snap.key;
														// if (vm.propdata.units == ' ') {
														// 	var units = '';
														// } else {
														// 	var units = vm.propdata.units + " - ";
														// }
														var unit = vm.propdata.unitlists.find(function (unitObj) {
															if (unitObj.unit == vm.scheduledata.units) {
																return true;
															}
														});
														vm.propdata.rent = parseFloat(unit.rent);
														var leaseLength = ''
														switch (unit.leaseLength) {
															case 'month-to-month':
																leaseLength = 'Month to Month';
																break;
															case '6months':
																leaseLength = '6 Months';
																break;
															case '9months':
																leaseLength = '9 Months';
																break;
															case '12months':
																leaseLength = '12 Months';
																break;
														}
														vm.rentaldata.months = leaseLength;
														vm.propdata.address = vm.scheduledata.units + ' - ' + vm.propdata.address;
														vm.rentaldata.address = vm.propdata.address;
														vm.rentaldata.rent = parseFloat(unit.rent);
														firebase.database().ref('users/' + vm.propdata.landlordID).once("value", function (snap) {
															$scope.$apply(function () {
																vm.landlordData = snap.val();
																if (vm.landlordData && vm.landlordData.customRentalApplicationCheck && vm.landlordData.customRentalApplicationCheck.TCData) {
																	vm.TCData = vm.landlordData.customRentalApplicationCheck.TCData;
																}
																if (vm.landlordData && vm.landlordData.customRentalApplicationCheck) {
																	vm.customRentalApplicationCheck = vm.landlordData.customRentalApplicationCheck
																}
															});
															console.log('vm.landlordData', vm.landlordData);
														});
													}
												});
											});
										}
									});
								});
							});
							firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(vm.applicationval).once("value", function (snap) {
								$scope.$apply(function () {
									if (snap.val() != null) {
										$.map(snap.val(), function (v, k) {
											console.log(v);
											var date = new Date();
											vm.tenantdata.tenantName = v.mainapplicant.applicantname;
											vm.rentaldata.dob = v.mainapplicant.applicantdob != '' ? $filter('date')(new Date(v.mainapplicant.applicantdob), 'dd-MMMM-yyyy') : '';
											vm.rentaldata.sinno = v.mainapplicant.applicantsinno;
											vm.rentaldata.appcurrentemployer = v.mainapplicant.appcurrentemployer;
											vm.rentaldata.appposition = v.mainapplicant.appposition;
											vm.rentaldata.appemployerphone = v.mainapplicant.appemployerphone;
											vm.rentaldata.appworkingduration = v.mainapplicant.appworkingduration;
											vm.rentaldata.appgrossmonthlyincome = v.mainapplicant.appgrossmonthlyincome;
											vm.rentaldata.appincometype = v.mainapplicant.appincometype;
											vm.rentaldata.appotherincome = v.mainapplicant.appotherincome;
											vm.rentaldata.appsign = v.mainapplicant.appsign;


											angular.forEach(v.minors, function (value, key) {
												vm.minor.push(key);
												vm.rentaldata.minorappname.push(value.minorapplicantname);
												vm.rentaldata.minorappdob.push(value.minorapplicantdob != '' ? $filter('date')(new Date(value.minorapplicantdob), 'dd-MMMM-yyyy') : '');
												vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);
											});

											angular.forEach(v.otherapplicants, function (value, key) {
												vm.adult.push(key);
												vm.rentaldata.otherappname.push(value.adultapplicantname);
												vm.rentaldata.otherappdob.push(value.adultapplicantdob != '' ? $filter('date')(new Date(value.adultapplicantdob), 'dd-MMMM-yyyy') : '');
												vm.rentaldata.otherappsinno.push(value.adultapplicantsinno);
												vm.rentaldata.otherappcurrentemployer.push(value.otherappcurrentemployer);
												vm.rentaldata.otherappposition.push(value.otherappposition);
												vm.rentaldata.otherappemployerphone.push(value.otherappemployerphone);
												vm.rentaldata.otherappworkingduration.push(value.otherappworkingduration);
												vm.rentaldata.otherappgrossmonthlyincome.push(value.otherappgrossmonthlyincome);
												vm.rentaldata.otherappincometype.push(value.otherappincometype);
												vm.rentaldata.otherappotherincome.push(value.otherappotherincome);
												vm.rentaldata.otherappsign.push(value.otherappsign);
											});

										});
									}
								});
							});
						} else {
							vm.draftdata = "false";
							firebase.database().ref('applyprop/' + scheduleID).once("value", function (snapshot) {
								console.log(snapshot.val())
								$scope.$apply(function () {
									if (snapshot.val()) {
										// console.log('applyprop', snapshot.val())
										vm.scheduledata = snapshot.val();
										vm.scheduledata.scheduleID = snapshot.key;

										firebase.database().ref('properties/' + vm.scheduledata.propID).once("value", function (snap) {
											$scope.$apply(function () {
												if (snap.val()) {
													console.log('properties', snap.val())
													vm.propdata = snap.val();
													vm.propdata.propID = snap.key;
													// if (vm.propdata.units == ' ') {
													// 	var units = '';
													// } else {
													// 	var units = vm.propdata.units + " - ";
													// }
													var unit = vm.propdata.unitlists.find(function (unitObj) {
														if (unitObj.unit == vm.scheduledata.units) {
															return true;
														}
													});
													vm.propdata.rent = parseFloat(unit.rent);
													var leaseLength = ''
													switch (unit.leaseLength) {
														case 'month-to-month':
															leaseLength = 'Month to Month';
															break;
														case '6months':
															leaseLength = '6 Months';
															break;
														case '9months':
															leaseLength = '9 Months';
															break;
														case '12months':
															leaseLength = '12 Months';
															break;
													}
													vm.rentaldata.months = leaseLength;
													vm.propdata.address = vm.scheduledata.units + ' - ' + vm.propdata.address;
													vm.rentaldata.address = vm.propdata.address;
													vm.rentaldata.rent = parseFloat(unit.rent);
													firebase.database().ref('users/' + vm.propdata.landlordID).once("value", function (snap) {
														$scope.$apply(function () {
															vm.landlordData = snap.val();
															if (vm.landlordData && vm.landlordData.customRentalApplicationCheck && vm.landlordData.customRentalApplicationCheck.TCData) {
																vm.TCData = vm.landlordData.customRentalApplicationCheck.TCData;
															}
															if (vm.landlordData && vm.landlordData.customRentalApplicationCheck) {
																vm.customRentalApplicationCheck = vm.landlordData.customRentalApplicationCheck
															}
														});
														console.log('vm.landlordData', vm.landlordData);
													});
												}
											});
										});
									}
								});
							});


							firebase.database().ref('users/' + tenantID).once("value", function (snapval) {
								$scope.$apply(function () {
									if (snapval.val()) {
										vm.tenantdata = snapval.val();
										vm.tenantdata.tenantID = snapval.key;
										vm.tenantdata.tenantName = vm.tenantdata.firstname + " " + vm.tenantdata.lastname;
										vm.tenantdata.tenantEmail = tenantEmail;
									}
								});
							});
						}
						// console.log(vm.tenantdata);	
						// console.log(vm.rentaldata);	
						// console.log(vm.propdata);	
					});
				});
			} else {
				firebase.database().ref('submitapps/' + $stateParams.applicationId).once("value", function (snapshot) {
					console.log(snapshot.val());
					$scope.$apply(function () {
						if (snapshot.val() !== null) {
							var date = new Date();
							var value = snapshot.val();
							vm.applicationID = $stateParams.applicationId;
							vm.draftdata = "true";
							vm.tenantdata.tenantID = value.tenantID;
							vm.scheduledata.scheduleID = value.scheduleID;
							vm.propdata.propID = value.propID;
							vm.propdata.landlordID = value.landlordID;
							vm.propdata.address = value.address;
							vm.propdata.rent = value.rent;
							vm.rentaldata.months = value.months;
							vm.rentaldata.startdate = value.startdate;
							vm.rentaldata.parking = value.parking;
							vm.rentaldata.telwork = value.telwork;
							vm.rentaldata.telhome = value.telhome;
							vm.tenantdata.tenantEmail = value.applicantemail;
							vm.rentaldata.appaddress = value.appaddress;
							vm.rentaldata.appcity = value.applicantcity;
							vm.rentaldata.maritalstatus = value.maritalstatus;
							vm.rentaldata.rent_own = value.rent_own;
							vm.rentaldata.live_time = value.live_time_at_address;
							vm.rentaldata.rentamt = value.rentamt;
							vm.rentaldata.vacantreason = value.vacantreason;
							vm.rentaldata.landlordname = value.landlordname;
							vm.rentaldata.landlordphone = value.landlordphone;
							vm.rentaldata.pets = value.pets;
							vm.rentaldata.petsdesc = value.petsdesc;
							vm.rentaldata.smoking = value.smoking;
							vm.rentaldata.appfiles = value.appfiles;
							vm.rentaldata.vehiclemake = value.vehiclemake;
							vm.rentaldata.vehiclemodel = value.vehiclemodel;
							vm.rentaldata.vehicleyear = value.vehicleyear;
							vm.rentaldata.vehiclemake2 = value.vehiclemake2;
							vm.rentaldata.vehiclemodel2 = value.vehiclemodel2;
							vm.rentaldata.vehicleyear2 = value.vehicleyear2;
							vm.rentaldata.emergencyname = value.emergencyname;
							vm.rentaldata.emergencyphone = value.emergencyphone;
							vm.rentaldata.refone_name = value.refone_name;
							vm.rentaldata.refone_phone = value.refone_phone;
							vm.rentaldata.refone_relation = value.refone_relation;
							vm.rentaldata.reftwo_name = value.reftwo_name;
							vm.rentaldata.reftwo_phone = value.reftwo_phone;
							vm.rentaldata.reftwo_relation = value.reftwo_relation;
							vm.rentaldata.dated = value.dated;

							vm.TCData = value.TCData;
							vm.customRentalApplicationCheck = value.customRentalApplicationCheck;

							vm.submitemail = value.externalemail;
							firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(vm.applicationID).once("value", function (snap) {
								$scope.$apply(function () {
									if (snap.val() != null) {
										$.map(snap.val(), function (v, k) {
											console.log(v);
											vm.tenantdata.tenantName = v.mainapplicant.applicantname;
											vm.rentaldata.dob = new Date(v.mainapplicant.applicantdob);
											vm.rentaldata.sinno = v.mainapplicant.applicantsinno;
											vm.rentaldata.appcurrentemployer = v.mainapplicant.appcurrentemployer;
											vm.rentaldata.appposition = v.mainapplicant.appposition;
											vm.rentaldata.appemployerphone = v.mainapplicant.appemployerphone;
											vm.rentaldata.appworkingduration = v.mainapplicant.appworkingduration;
											vm.rentaldata.appgrossmonthlyincome = v.mainapplicant.appgrossmonthlyincome;
											vm.rentaldata.appincometype = v.mainapplicant.appincometype;
											vm.rentaldata.appotherincome = v.mainapplicant.appotherincome;
											vm.rentaldata.appsign = v.mainapplicant.appsign;


											angular.forEach(v.minors, function (value, key) {
												vm.minor.push(key);
												vm.rentaldata.minorappname.push(value.minorapplicantname);
												vm.rentaldata.minorappdob.push(new Date(value.minorapplicantdob));
												vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);
											});

											angular.forEach(v.otherapplicants, function (value, key) {
												vm.adult.push(key);
												vm.rentaldata.otherappname.push(value.adultapplicantname);
												vm.rentaldata.otherappdob.push(new Date(value.adultapplicantdob));
												vm.rentaldata.otherappsinno.push(value.adultapplicantsinno);
												vm.rentaldata.otherappcurrentemployer.push(value.otherappcurrentemployer);
												vm.rentaldata.otherappposition.push(value.otherappposition);
												vm.rentaldata.otherappemployerphone.push(value.otherappemployerphone);
												vm.rentaldata.otherappworkingduration.push(value.otherappworkingduration);
												vm.rentaldata.otherappgrossmonthlyincome.push(value.otherappgrossmonthlyincome);
												vm.rentaldata.otherappincometype.push(value.otherappincometype);
												vm.rentaldata.otherappotherincome.push(value.otherappotherincome);
												vm.rentaldata.otherappsign.push(value.otherappsign);
											});

										});
									}
								});
							});
						} else {
							vm.draftdata = "false";
							firebase.database().ref('users/' + tenantID).once("value", function (snapval) {
								$scope.$apply(function () {
									if (snapval.val()) {
										vm.tenantdata = snapval.val();
										vm.tenantdata.tenantID = snapval.key;
										vm.tenantdata.tenantName = vm.tenantdata.firstname + " " + vm.tenantdata.lastname;
										vm.tenantdata.tenantEmail = tenantEmail;
									}
								});
							});
						}
					});
				});
			}

			vm.rentalAppSubmit = function () {
				console.log(vm.rentaldata, vm.draft);
				// alert($('#appfiles').val().split('\\').pop().split('/').pop().split('.')[0]+new Date().getTime());
				var tenantID = vm.tenantdata.tenantID;

				if ($stateParams.scheduleId != 0) {
					var scheduleID = $stateParams.scheduleId;
					var propID = vm.propdata.propID;
					var landlordID = vm.propdata.landlordID;
					var externalappStatus = "submit";
				} else {
					var scheduleID = 0;
					var propID = 0;
					var landlordID = 0;
					var externalappStatus = "submit";
					if (vm.draft == "true") {
						var externalappStatus = "draft";
					} else {
						var externalappStatus = "submit";
					}
				}


				function checkFile() {
					if ($('#uploadfile')[0].files[0]) {
						var _fileName = $('#uploadfile')[0].files[0].name.toLowerCase();
						if ($('#uploadfile')[0].files[0].size > 3145728) {
							return 'File size should be 3 MB or less.'
						} else if (!(_fileName.endsWith('.png'))
							&& !(_fileName.endsWith('.jpg'))
							&& !(_fileName.endsWith('.pdf'))
							&& !(_fileName.endsWith('.jpeg'))) {
							return 'Invalid file type.'
						}
					}
				}
				var fileCheckMsg = checkFile();
				if (fileCheckMsg) {
					swal({
						title: "Error!",
						text: fileCheckMsg,
						type: "error",
					});
					return;
				}
				var externalemail = vm.submitemail == undefined ? '' : vm.submitemail;

				var address = vm.propdata.address == undefined ? '' : vm.propdata.address;
				var rent = vm.propdata.rent == undefined ? '' : vm.propdata.rent;
				var months = vm.rentaldata.months == undefined ? '' : vm.rentaldata.months;
				var startdate = vm.rentaldata.startdate == undefined ? '' : vm.rentaldata.startdate;
				var parking = vm.rentaldata.parking == undefined ? '' : vm.rentaldata.parking;

				var applicantname = vm.tenantdata.tenantName == undefined ? '' : vm.tenantdata.tenantName;
				var applicantdob = vm.rentaldata.dob == undefined ? '' : vm.rentaldata.dob.toString();
				var applicantsinno = vm.rentaldata.sinno == undefined ? '' : vm.rentaldata.sinno;
				var telwork = vm.rentaldata.telwork == undefined ? '' : vm.rentaldata.telwork;
				var telhome = vm.rentaldata.telhome == undefined ? '' : vm.rentaldata.telhome;
				var applicantemail = vm.tenantdata.tenantEmail == undefined ? '' : vm.tenantdata.tenantEmail;
				var appaddress = vm.rentaldata.appaddress == undefined ? '' : vm.rentaldata.appaddress;
				var applicantcity = vm.rentaldata.appcity == undefined ? '' : vm.rentaldata.appcity;
				var maritalstatus = vm.rentaldata.maritalstatus == undefined ? '' : vm.rentaldata.maritalstatus;
				var rent_own = vm.rentaldata.rent_own == undefined ? '' : vm.rentaldata.rent_own;
				var live_time_at_address = vm.rentaldata.live_time == undefined ? '' : vm.rentaldata.live_time;
				var rentamt = vm.rentaldata.rentamt == undefined ? '' : vm.rentaldata.rentamt;
				var vacantreason = vm.rentaldata.vacantreason == undefined ? '' : vm.rentaldata.vacantreason;
				var landlordname = vm.rentaldata.landlordname == undefined ? '' : vm.rentaldata.landlordname;
				var landlordphone = vm.rentaldata.landlordphone == undefined ? '' : vm.rentaldata.landlordphone;

				var adultapplicantname = vm.rentaldata.otherappname;
				var adultapplicantdob = vm.rentaldata.otherappdob;
				var adultapplicantsinno = vm.rentaldata.otherappsinno;

				var minorapplicantname = vm.rentaldata.minorappname;
				var minorapplicantdob = vm.rentaldata.minorappdob;
				var minorapplicantsinno = vm.rentaldata.minorappsinno;

				var pets = vm.rentaldata.pets == undefined ? '' : vm.rentaldata.pets;
				var petsdesc = vm.rentaldata.petsdesc == undefined ? '' : vm.rentaldata.petsdesc;
				var smoking = vm.rentaldata.smoking == undefined ? '' : vm.rentaldata.smoking;

				// var file = $('#appfiles').val().split('\\').pop().split('/').pop();
				// var filename = $('#appfiles').val().split('\\').pop().split('/').pop().split('.')[0]+new Date().getTime();
				// var fileext = $('#appfiles').val().split('\\').pop().split('/').pop().split('.').pop().toLowerCase();
				// var appfiles = "images/applicationuploads/"+filename+"."+fileext;

				var appfiles = $('#appfiles').val();
				var filename = $('#filename').val() === '' ? '' : Date.now() + '_' + $('#filename').val();
				// var filepath = filename != '' ? "https://vcancy.com/login/uploads/" + filename : appfiles;
				var filepath = filename != '' ? "https://vcancy-final.s3.ca-central-1.amazonaws.com/rental-form-files/" + filename : appfiles;
				console.log(filename, filepath, appfiles);

				var appcurrentemployer = vm.rentaldata.appcurrentemployer == undefined ? '' : vm.rentaldata.appcurrentemployer;
				var appposition = vm.rentaldata.appposition == undefined ? '' : vm.rentaldata.appposition;
				var appemployerphone = vm.rentaldata.appemployerphone == undefined ? '' : vm.rentaldata.appemployerphone;
				var appworkingduration = vm.rentaldata.appworkingduration == undefined ? '' : vm.rentaldata.appworkingduration;
				var appgrossmonthlyincome = vm.rentaldata.appgrossmonthlyincome == undefined ? '' : vm.rentaldata.appgrossmonthlyincome;
				var appincometype = vm.rentaldata.appincometype == undefined ? '' : vm.rentaldata.appincometype;
				var appotherincome = vm.rentaldata.appotherincome == undefined ? '' : vm.rentaldata.appotherincome;

				var vehiclemake = vm.rentaldata.vehiclemake == undefined ? '' : vm.rentaldata.vehiclemake;
				var vehiclemodel = vm.rentaldata.vehiclemodel == undefined ? '' : vm.rentaldata.vehiclemodel;
				var vehicleyear = vm.rentaldata.vehicleyear == undefined ? '' : vm.rentaldata.vehicleyear;

				var vehiclemake2 = vm.rentaldata.vehiclemake2 == undefined ? '' : vm.rentaldata.vehiclemake2;
				var vehiclemodel2 = vm.rentaldata.vehiclemodel2 == undefined ? '' : vm.rentaldata.vehiclemodel2;
				var vehicleyear2 = vm.rentaldata.vehicleyear2 == undefined ? '' : vm.rentaldata.vehicleyear2;

				var emergencyname = vm.rentaldata.emergencyname == undefined ? '' : vm.rentaldata.emergencyname;
				var emergencyphone = vm.rentaldata.emergencyphone == undefined ? '' : vm.rentaldata.emergencyphone;

				var refone_name = vm.rentaldata.refone_name == undefined ? '' : vm.rentaldata.refone_name;
				var refone_phone = vm.rentaldata.refone_phone == undefined ? '' : vm.rentaldata.refone_phone;
				var refone_relation = vm.rentaldata.refone_relation == undefined ? '' : vm.rentaldata.refone_relation;

				var reftwo_name = vm.rentaldata.reftwo_name == undefined ? '' : vm.rentaldata.reftwo_name;
				var reftwo_phone = vm.rentaldata.reftwo_phone == undefined ? '' : vm.rentaldata.reftwo_phone;
				var reftwo_relation = vm.rentaldata.reftwo_relation == undefined ? '' : vm.rentaldata.reftwo_relation;

				var otherappcurrentemployer = vm.rentaldata.otherappcurrentemployer;
				var otherappposition = vm.rentaldata.otherappposition;
				var otherappemployerphone = vm.rentaldata.otherappemployerphone;
				var otherappworkingduration = vm.rentaldata.otherappworkingduration;
				var otherappgrossmonthlyincome = vm.rentaldata.otherappgrossmonthlyincome;
				var otherappincometype = vm.rentaldata.otherappincometype;
				var otherappotherincome = vm.rentaldata.otherappotherincome;

				var dated = vm.rentaldata.dated == undefined ? '' : vm.rentaldata.dated.toString();
				var appsign = vm.rentaldata.appsign == undefined ? '' : vm.rentaldata.appsign;
				var otherappsign = vm.rentaldata.otherappsign;
				vm.adultapplicants = [];
				vm.minorapplicants = [];

				vm.adultapplicants = $.map(vm.adult, function (adult, index) {
					return [{
						adultapplicantname: adultapplicantname[index] == undefined ? '' : adultapplicantname[index],
						adultapplicantdob: adultapplicantdob[index] == undefined ? '' : adultapplicantdob[index].toString(),
						adultapplicantsinno: adultapplicantsinno[index] == undefined ? '' : adultapplicantsinno[index],
						otherappcurrentemployer: otherappcurrentemployer[index] == undefined ? '' : otherappcurrentemployer[index],
						otherappposition: otherappposition[index] == undefined ? '' : otherappposition[index],
						otherappemployerphone: otherappemployerphone[index] == undefined ? '' : otherappemployerphone[index],
						otherappworkingduration: otherappworkingduration[index] == undefined ? '' : otherappworkingduration[index],
						otherappgrossmonthlyincome: otherappgrossmonthlyincome[index] == undefined ? '' : otherappgrossmonthlyincome[index],
						otherappincometype: otherappincometype[index] == undefined ? '' : otherappincometype[index],
						otherappotherincome: otherappotherincome[index] == undefined ? '' : otherappotherincome[index],
						otherappsign: otherappsign[index] == undefined ? '' : otherappsign[index]
					}];
				});

				vm.minorapplicants = $.map(vm.minor, function (minor, index) {
					return [{
						minorapplicantname: minorapplicantname[index] == undefined ? '' : minorapplicantname[index],
						minorapplicantdob: minorapplicantdob[index] == undefined ? '' : minorapplicantdob[index].toString(),
						minorapplicantsinno: minorapplicantsinno[index] == undefined ? '' : minorapplicantsinno[index]
					}];
				});
				console.log(vm.adultapplicants);

				var TCData = vm.TCData || '';
				var customRentalApplicationCheck = vm.customRentalApplicationCheck || '';

				if (vm.draftdata == "false" && $stateParams.applicationId == 0) {
					firebase.database().ref('submitapps/').push().set({
						tenantID: tenantID,
						scheduleID: scheduleID,
						propID: propID,
						landlordID: landlordID,

						address: address,
						rent: rent,
						months: months,
						startdate: startdate,
						parking: parking,

						telwork: telwork,
						telhome: telhome,
						applicantemail: applicantemail,
						appaddress: appaddress,
						applicantcity: applicantcity,
						maritalstatus: maritalstatus,
						rent_own: rent_own,
						live_time_at_address: live_time_at_address,
						rentamt: rentamt,
						vacantreason: vacantreason,
						landlordname: landlordname,
						landlordphone: landlordphone,

						pets: pets,
						petsdesc: petsdesc,
						smoking: smoking,
						appfiles: filepath,

						vehiclemake: vehiclemake,
						vehiclemodel: vehiclemodel,
						vehicleyear: vehicleyear,

						vehiclemake2: vehiclemake2,
						vehiclemodel2: vehiclemodel2,
						vehicleyear2: vehicleyear2,

						emergencyname: emergencyname,
						emergencyphone: emergencyphone,

						refone_name: refone_name,
						refone_phone: refone_phone,
						refone_relation: refone_relation,

						reftwo_name: reftwo_name,
						reftwo_phone: reftwo_phone,
						reftwo_relation: reftwo_relation,

						applicantsno: (vm.adult.length) + 1,
						"minorapplicantsno": vm.minor.length || 0,
						externalappStatus: externalappStatus,
						externalemail: externalemail,
						appgrossmonthlyincome: appgrossmonthlyincome,
						dated: dated,

						rentalstatus: "pending",

						TCData: TCData,

						customRentalApplicationCheck: customRentalApplicationCheck
					}).then(function () {
						//Generate the applicant details of submitted app to new table
						firebase.database().ref('submitapps/').limitToLast(1).once("child_added", function (snapshot) {

							if (snapshot.key != "undefined") {
								vm.applicationID = snapshot.key;
								console.log(vm.applicationID);
								var applicantsdata = {
									"applicationID": snapshot.key,
									"mainapplicant": {
										"applicantname": applicantname,
										"applicantdob": applicantdob,
										"applicantsinno": applicantsinno,
										"appcurrentemployer": appcurrentemployer,
										"appposition": appposition,
										"appemployerphone": appemployerphone,
										"appworkingduration": appworkingduration,
										"appgrossmonthlyincome": appgrossmonthlyincome,
										"appincometype": appincometype,
										"appotherincome": appotherincome,
										"appsign": appsign,
									},
									"otherapplicants": vm.adultapplicants,
									"minors": vm.minorapplicants
								}

								console.log(applicantsdata);

								firebase.database().ref('submitappapplicants/').push().set(applicantsdata);

								if (vm.draft == "false") {
									// update the schedule to be aubmitted application
									firebase.database().ref('applyprop/' + scheduleID).update({
										schedulestatus: "submitted"
									})
								}

								if (filename != '') {
									vm.upload(appfiles, filename);
								}

								if (vm.draft == "false") {
									if (landlordID != 0) {
										firebase.database().ref('users/' + landlordID).once("value", function (snap) {
											console.log(snap.val());
											if (snap.val()) {
												var emailData = '<p>Hello ' + applicantname + ', </p><p>Your rental application has been submitted to ' + snap.val().email + '.</p><p>To make changes, please log in at <a href="https://www.vcancy.com/login/" target = "_blank"> vcancy.com </a>  and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

												emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Rental application', 'rentalapp', emailData);
											}
											//var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted a rental application for ' + address + '.</p><p>To view the application, please log in <a href="https://www.vcancy.com/login/" target = "_blank"> vcancy.com </a> and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

											//emailSendingService.sendEmailViaNodeMailer(snap.val().email, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
										});
									} else {
										//var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted an online rental application via vcancy.com. Please go to this link https://www.vcancy.com/login/#/viewexternalapp/' + vm.applicationID + ' to view the application.</p><p>Check out <a href="https://www.vcancy.com/login/" target = "_blank"> vcancy.com </a> to automate viewing appointments and compare rental applications	 online.</p><p>For any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

										//emailSendingService.sendEmailViaNodeMailer(vm.submitemail, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
									}
								}
								$state.go('tenantapplications');
							}
						})
					})
				} else {
					firebase.database().ref('submitapps/' + vm.applicationID).set({
						tenantID: tenantID,
						scheduleID: scheduleID,
						propID: propID,
						landlordID: landlordID,

						address: address,
						rent: rent,
						months: months,
						startdate: startdate,
						parking: parking,

						telwork: telwork,
						telhome: telhome,
						applicantemail: applicantemail,
						appaddress: appaddress,
						applicantcity: applicantcity,
						maritalstatus: maritalstatus,
						rent_own: rent_own,
						live_time_at_address: live_time_at_address,
						rentamt: rentamt,
						vacantreason: vacantreason,
						landlordname: landlordname,
						landlordphone: landlordphone,

						pets: pets,
						petsdesc: petsdesc,
						smoking: smoking,
						appfiles: filepath,

						vehiclemake: vehiclemake,
						vehiclemodel: vehiclemodel,
						vehicleyear: vehicleyear,

						vehiclemake2: vehiclemake2,
						vehiclemodel2: vehiclemodel2,
						vehicleyear2: vehicleyear2,

						emergencyname: emergencyname,
						emergencyphone: emergencyphone,

						refone_name: refone_name,
						refone_phone: refone_phone,
						refone_relation: refone_relation,

						reftwo_name: reftwo_name,
						reftwo_phone: reftwo_phone,
						reftwo_relation: reftwo_relation,

						applicantsno: (vm.adult.length) + 1,
						externalappStatus: externalappStatus,
						externalemail: externalemail,

						dated: dated,

						rentalstatus: "pending",

						TCData: TCData,
						customRentalApplicationCheck: customRentalApplicationCheck
					}).then(function () {
						//Generate the applicant details of submitted app to new table
						var applicantsdata = {
							"applicationID": vm.applicationID,
							"mainapplicant": {
								"applicantname": applicantname,
								"applicantdob": applicantdob,
								"applicantsinno": applicantsinno,
								"appcurrentemployer": appcurrentemployer,
								"appposition": appposition,
								"appemployerphone": appemployerphone,
								"appworkingduration": appworkingduration,
								"appgrossmonthlyincome": appgrossmonthlyincome,
								"appincometype": appincometype,
								"appotherincome": appotherincome,
								"appsign": appsign,
							},
							"otherapplicants": vm.adultapplicants,
							"minors": vm.minorapplicants
						}

						console.log(applicantsdata);
						firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(vm.applicationID).once("value", function (snap) {
							console.log(snap.val());
							if (snap.val() != null) {
								$.map(snap.val(), function (v, k) {
									console.log(k, applicantsdata);
									firebase.database().ref('submitappapplicants/' + k).set(applicantsdata);
								});
							}
						});


						if (vm.draft == "false") {
							// update the schedule to be aubmitted application
							firebase.database().ref('applyprop/' + scheduleID).update({
								schedulestatus: "submitted"
							})
						}
					})

					if (filename != '') {
						vm.upload(appfiles, filename);
					}

					if (vm.draft == "false") {
						if (landlordID != 0) {
							firebase.database().ref('users/' + landlordID).once("value", function (snap) {
								console.log(snap.val());
								if (snap.val()) {
									var emailData = '<p>Hello ' + applicantname + ', </p><p>Your rental application has been submitted to ' + snap.val().email + '.</p><p>To make changes, please log in <a href="http://www.vcancy.com/login/#/" target = "_blank"> vcancy.com </a>  and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

									emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Rental application', 'rentalapp', emailData);
								}
								//var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted a rental application for ' + address + '.</p><p>To view the application, please log in <a href="http://www.vcancy.com/login/#/" target = "_blank"> vcancy.com </a>  and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

								//emailSendingService.sendEmailViaNodeMailer(snap.val().email, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
							});
						} else {
							//var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted an online rental application via vcancy.com. Please go to this link http://www.vcancy.com/login/#/viewexternalapp/' + vm.applicationID + ' to view the application.</p><p>Check out <a href="http://www.vcancy.com/login/#/" target = "_blank"> vcancy.com </a> to automate viewing appointments and compare rental applications	 online.</p><p>For any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

							//emailSendingService.sendEmailViaNodeMailer(vm.submitemail, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
						}


					}
					$state.go('tenantapplications');
				}
			}

			vm.upload = function (file, filename) {
				file = file.replace("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,", "");
				file = file.replace("data:application/pdf;base64,", "");
				file = file.replace(/^data:image\/\w+;base64,/, "");
				file = file.replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", "");
				// console.log(file,filename);
				var _file = $('#uploadfile')[0].files[0];
				AWS.config.update({
					accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
					secretAccessKey: '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'
				});
				AWS.config.region = 'ca-central-1';
				var bucket = new AWS.S3({
					params: {
						Bucket: 'vcancy-final'
					}
				});
				filename = filename.replace(/\s/g, '');

				var params = {
					Key: 'rental-form-files/' + filename,
					ContentType: _file.type,
					Body: _file,
					StorageClass: "STANDARD_IA",
					ACL: 'authenticated-read'
				};

				bucket.upload(params).on('httpUploadProgress', function (evt) { })
					.send(function (err, data) {
						if (data && data.Location) {
							console.log('file uploaded success');
						} else {
							console.error('ERROR in file upload');
						}
					});
			};

			vm.viewFile = function (location) {
				if (!location) {
					return;
				}
				var _params = {
					Bucket: 'vcancy-final',
					Key: location.split(`https://vcancy-final.s3.ca-central-1.amazonaws.com/`)[1],
					Expires: 60 * 5
				}
				AWS.config.update({
					accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
					secretAccessKey: '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'
				});
				AWS.config.region = 'ca-central-1';
				var bucket = new AWS.S3({
					params: {
						Bucket: 'vcancy-final'
					}
				});

				bucket.getSignedUrl('getObject', _params, function (err, data) {
					if (err) return console.log(err, err.stack); // an error occurred

					// var type = 'application/pdf';
					var extension = location.substring(location.lastIndexOf('.'));
					// var file = new Blob([data], { type: 'application/pdf' });
					// saveAs(file, 'filename.pdf');
					// var url = URL.createObjectURL(new Blob([data]));
					var a = document.createElement('a');
					a.href = data;
					a.download = location.substr(location.lastIndexOf('/') + 1);
					a.target = '_blank';
					a.click();
				});
			}

			vm.savechanges = function () {
				vm.draft = "true";
				$rootScope.isFormOpenToSaveInDraft = false;
				// alert(vm.draft);
				vm.rentalAppSubmit();
			}

			vm.printApp = function () {
				var css = '@page { size: landscape; }',
					head = document.head || document.getElementsByTagName('head')[0],
					style = document.createElement('style');

				style.type = 'text/css';
				style.media = 'print';

				if (style.styleSheet) {
					style.styleSheet.cssText = css;
				} else {
					style.appendChild(document.createTextNode(css));
				}

				head.appendChild(style);
				$window.print();
			}

		}])
'use strict';

//=================================================
// View Tenant Application
//=================================================

vcancyApp
	.controller('viewappCtrl', ['$scope', '$timeout', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', function ($scope, $timeout, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {

		var vm = this;
		// var tenantID = localStorage.getItem('userID');
		var applicationID = $stateParams.appID;
		// var tenantEmail = localStorage.getItem('userEmail');

		vm.publicappview = $state.current.name == "viewexternalapplication" ? "1" : "0";
		vm.isLoggedIn = ($state.current.name != "viewexternalapplication") && localStorage.getItem('userEmail');

		vm.adult = [];
		vm.minor = [];
		vm.rentaldata = [];

		// DATEPICKER
		vm.today = function () {
			vm.dt = new Date();
		};
		vm.today();

		vm.toggleMin = function () {
			vm.minDate = vm.minDate ? null : new Date();
		};
		vm.toggleMin();

		vm.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
		vm.maxDate = new Date();
		vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		vm.format = vm.formats[0];


		firebase.database().ref('submitapps/' + applicationID).once("value", function (snapshot) {
			console.log(snapshot.val());
			$scope.$apply(function () {
				if (snapshot.val()) {
					var value = snapshot.val();
					console.log(value);
					vm.TCData = value.TCData;
					vm.customRentalApplicationCheck = value.customRentalApplicationCheck;
					vm.rentaldata.tenantID = value.tenantID;
					vm.rentaldata.scheduleID = value.scheduleID;
					vm.rentaldata.propID = value.propID;

					vm.rentaldata.landlordID = value.landlordID;

					vm.rentaldata.address = value.address;
					vm.rentaldata.rent = value.rent;
					vm.rentaldata.months = value.months;
					vm.rentaldata.startdate = value.startdate;
					vm.rentaldata.parking = value.parking;
					vm.rentaldata.telwork = value.telwork;
					vm.rentaldata.telhome = value.telhome;
					vm.rentaldata.tenantEmail = value.applicantemail;
					vm.rentaldata.appaddress = value.appaddress;
					vm.rentaldata.appcity = value.applicantcity;
					vm.rentaldata.maritalstatus = value.maritalstatus;
					vm.rentaldata.rent_own = value.rent_own;
					vm.rentaldata.live_time = value.live_time_at_address;
					vm.rentaldata.rentamt = value.rentamt;
					vm.rentaldata.vacantreason = value.vacantreason;
					vm.rentaldata.landlordname = value.landlordname;
					vm.rentaldata.landlordphone = value.landlordphone;
					vm.rentaldata.pets = value.pets;
					vm.rentaldata.petsdesc = value.petsdesc;
					vm.rentaldata.smoking = value.smoking;
					vm.rentaldata.appfiles = value.appfiles;
					vm.rentaldata.vehiclemake = value.vehiclemake;
					vm.rentaldata.vehiclemodel = value.vehiclemodel;
					vm.rentaldata.vehicleyear = value.vehicleyear;
					vm.rentaldata.emergencyname = value.emergencyname;
					vm.rentaldata.emergencyphone = value.emergencyphone;
					vm.rentaldata.refone_name = value.refone_name;
					vm.rentaldata.refone_phone = value.refone_phone;
					vm.rentaldata.refone_relation = value.refone_relation;
					vm.rentaldata.reftwo_name = value.reftwo_name;
					vm.rentaldata.reftwo_phone = value.reftwo_phone;
					vm.rentaldata.reftwo_relation = value.reftwo_relation;
					vm.rentaldata.dated = new Date(value.dated);
					
					console.log(vm.rentaldata);

					firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(applicationID).once("value", function (snap) {
						$scope.$apply(function () {
							if (snap.val()) {
								$.map(snap.val(), function (v, k) {
									console.log(v);
									vm.rentaldata.tenantName = v.mainapplicant.applicantname;
									vm.rentaldata.dob = new Date(v.mainapplicant.applicantdob);
									vm.rentaldata.sinno = v.mainapplicant.applicantsinno;
									vm.rentaldata.appcurrentemployer = v.mainapplicant.appcurrentemployer;
									vm.rentaldata.appposition = v.mainapplicant.appposition;
									vm.rentaldata.appemployerphone = v.mainapplicant.appemployerphone;
									vm.rentaldata.appworkingduration = v.mainapplicant.appworkingduration;
									vm.rentaldata.appgrossmonthlyincome = v.mainapplicant.appgrossmonthlyincome;
									vm.rentaldata.appincometype = v.mainapplicant.appincometype;
									vm.rentaldata.appotherincome = v.mainapplicant.appotherincome;
									vm.rentaldata.appsign = v.mainapplicant.appsign;

									vm.rentaldata.minorappname = [];
									vm.rentaldata.minorappdob = [];
									vm.rentaldata.minorappsinno = [];

									if (v.minors != undefined) {
										angular.forEach(v.minors, function (value, key) {
											vm.minor.push(key);
											vm.rentaldata.minorappname.push(value.minorapplicantname);
											vm.rentaldata.minorappdob.push(new Date(value.minorapplicantdob));
											vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);
										});
									}
									vm.rentaldata.otherappname = [];
									vm.rentaldata.otherappdob = [];
									vm.rentaldata.otherappsinno = [];
									vm.rentaldata.otherappcurrentemployer = [];
									vm.rentaldata.otherappposition = [];
									vm.rentaldata.otherappemployerphone = [];
									vm.rentaldata.otherappworkingduration = [];
									vm.rentaldata.otherappgrossmonthlyincome = [];
									vm.rentaldata.otherappincometype = [];
									vm.rentaldata.otherappotherincome = [];
									vm.rentaldata.otherappsign = [];

									if (v.otherapplicants != undefined) {
										angular.forEach(v.otherapplicants, function (value, key) {
											vm.adult.push(key);
											vm.rentaldata.otherappname.push(value.adultapplicantname);
											vm.rentaldata.otherappdob.push(new Date(value.adultapplicantdob));
											vm.rentaldata.otherappsinno.push(value.adultapplicantsinno);
											vm.rentaldata.otherappcurrentemployer.push(value.otherappcurrentemployer);
											vm.rentaldata.otherappposition.push(value.otherappposition);
											vm.rentaldata.otherappemployerphone.push(value.otherappemployerphone);
											vm.rentaldata.otherappworkingduration.push(value.otherappworkingduration);
											vm.rentaldata.otherappgrossmonthlyincome.push(value.otherappgrossmonthlyincome);
											vm.rentaldata.otherappincometype.push(value.otherappincometype);
											vm.rentaldata.otherappotherincome.push(value.otherappotherincome);
											vm.rentaldata.otherappsign.push(value.otherappsign);
										});
									}
								});
							}
						});
					});
					if (vm.rentaldata.landlordID) {
						firebase.database().ref('users/' + vm.rentaldata.landlordID).once("value", function (snap) {
							$scope.$apply(function() {
								vm.landlordData = snap.val();
							});
						});
					}
				}
			});
		});

		vm.viewFile = function (location) {
			if (!location) {
				return;
			}
			var _params = {
				Bucket: 'vcancy-final',
				Key: location.split(`https://vcancy-final.s3.ca-central-1.amazonaws.com/`)[1],
				Expires: 60 * 5
			}
			AWS.config.update({
				accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
				secretAccessKey: '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'
			});
			AWS.config.region = 'ca-central-1';
			var bucket = new AWS.S3({
				params: {
					Bucket: 'vcancy-final'
				}
			});

			bucket.getSignedUrl('getObject', _params, function (err, data) {
				if (err) return console.log(err, err.stack); // an error occurred

				// var type = 'application/pdf';
				var extension = location.substring(location.lastIndexOf('.'));
				// var file = new Blob([data], { type: 'application/pdf' });
				// saveAs(file, 'filename.pdf');
				// var url = URL.createObjectURL(new Blob([data]));
				var a = document.createElement('a');
				a.href = data;
				a.download = location.substr(location.lastIndexOf('/') + 1);
				a.target = '_blank';
				a.click();
			});
		}

		vm.printApp = function () {
			vm.printMode = true;
			$timeout(function(){
				$window.print();
			}, 1000);
			$timeout(function(){
				vm.printMode = false;
			}, 3000);
			// vm.printMode = false;
		}
	}])
'use strict';

//=================================================
// Tenant Profile
//=================================================

vcancyApp
  .controller('tenantProfilelCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'emailSendingService',
    function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, emailSendingService) {
      var vm = this;
      var tenantID = localStorage.getItem('userID');
      var password = localStorage.getItem('password');


      vm.email = '';
      vm.firstname = '';
      vm.lastname = '';
      vm.contact = '';
      vm.address = '';
      vm.password = password;
      vm.loader = 1;
      vm.userdata = {};

      vm.invalid = '';
      vm.success = '';
      vm.error = '';

      firebase.database().ref('/users/' + tenantID).once('value').then(function (userdata) {

        $scope.$apply(function () {
          vm.userData = userdata.val();
          console.log(vm.userData)

        });
      });

      vm.opensuccesssweet = function (value) {
        swal({
          title: "Success!",
          text: value,
          type: "success",
          confirmButtonColor: '#009999',
          confirmButtonText: "Ok"
        }, function (isConfirm) {
          if (isConfirm) {
            // $state.reload();
          }
        });



      }

      vm.openerrorsweet = function (value) {
        swal({
          title: "Error",
          text: value,
          type: "warning",
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Ok",
          closeOnConfirm: true
        },
          function () {
            return false;
          });

      }

      // firebase.database().ref('/users/' + tenantID).once('value').then(function (userdata) {
      //     $scope.$apply(function () {
      //         if (userdata.val() !== null) {
      //             vm.email = userdata.val().email;
      //             vm.firstname = userdata.val().firstname;
      //             vm.lastname = userdata.val().lastname;
      //              vm.address = userdata.val().address;
      //             vm.contact = userdata.val().contact;
      //             vm.loader = 0;
      //         }
      //     });
      // });
      vm.profileSubmit = function (tdProfilectrl) {
        var tenantID = localStorage.getItem('userID');
        //alert($scope.tdProfilectrl.contact); return false;

        // var updatedata = {};



        // if($scope.tdProfilectrl.contact === undefined || $scope.tdProfilectrl.contact === ""){
        //   vm.contact = '';
        //   updatedata['contact'] = '';
        // }else{
        //   updatedata['contact'] = $scope.tdProfilectrl.contact;
        // }
        //  if($scope.tdProfilectrl.address === undefined || $scope.tdProfilectrl.address === ""){
        //   vm.address = '';
        //   updatedata['address'] = '';
        // }else{
        //   updatedata['address'] = $scope.tdProfilectrl.address;
        // }
        // if($scope.tdProfilectrl.email === undefined || $scope.tdProfilectrl.email === ""){
        //   vm.email = '';
        //   updatedata['email'] = '';
        // }else{
        //    updatedata['email'] = $scope.tdProfilectrl.email;
        // }

        // // alert(JSON.stringify(updatedata)); return false;
        // firebase.database().ref('users/' + tenantID).update(updatedata).then(function(){
        //   confirm("Your Information updated!");
        // });
        firebase.database().ref('users/' + tenantID).update(vm.userData).then(function () {
          vm.opensuccesssweet("Profile Updated successfully!");
        }, function (error) {

          vm.openerrorsweet("Profile Not Updated! Try again!");
          return false;
        });
      };

      vm.changepasswordSubmit = function (passworduser) {

        $rootScope.invalid = '';
        $rootScope.success = '';
        $rootScope.error = '';
        var oldpassword = localStorage.getItem('password');
        var userEmail = localStorage.getItem('userEmail');
        var ncpassword = passworduser.ncpassword;
        var password = passworduser.password;
        var npassword = passworduser.npassword;
        var landLordID = localStorage.getItem('userID');

        if (password === oldpassword) {

          if (password === ncpassword) {
            vm.openerrorsweet("Your old password and new password must be different");
            return false;
          }

          if (ncpassword === npassword) {

            var user = firebase.auth().currentUser;
            var newPassword = ncpassword;
            user.updatePassword(newPassword).then(function () {
              localStorage.setItem('password', newPassword);
              vm.opensuccesssweet("Your password has been updated!");
              var emailData = '<p>Hello, </p><p>Your password has been changed. If you didn’t change the password then please contact  support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
              // Send Email
              passworduser.npassword = '';
              passworduser.password = '';
              passworduser.ncpassword = '';
              emailSendingService.sendEmailViaNodeMailer(userEmail, 'Password changed', 'changepassword', emailData);



            }).catch(function (error) {
              console.log(error);
              vm.openerrorsweet("your Passwords not updated please try again.");
              return false;
            });


          } else {
            vm.openerrorsweet("Passwords don't match.");
            return false;
          }


        } else {
          vm.openerrorsweet("Passwords don't match with your current password.");
          return false;
        }
      }
      vm.notificationSubmit = function () {

      }
      //  vm.changepasswordSubmit = function(passworduser){

      //      $rootScope.invalid = '';
      //     $rootScope.success = '';
      //     $rootScope.error = '';
      //      var oldpassword = localStorage.getItem('password');
      //      var userEmail = localStorage.getItem('userEmail');
      //      var ncpassword = passworduser.ncpassword ;
      //      var password = passworduser.password ;
      //      var npassword = passworduser.npassword ;
      //       var landLordID = localStorage.getItem('userID');

      //     if(password === oldpassword){

      //             if(ncpassword === npassword){

      //                   //  alert(JSON.stringify(firebase.auth().currentUser));
      //                     var user = firebase.auth().currentUser;
      //                     var newPassword = ncpassword;
      //                     user.updatePassword(newPassword).then(function() {

      //                        var emailData = '<p>Hello, </p><p>Your password has been changed. If you didn’t change the password then please contact  support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

      //                             // Send Email
      //                               emailSendingService.sendEmailViaNodeMailer(userEmail, 'Password changed', 'changepassword', emailData);


      //                         console.log("success");
      //                          confirm("Your password has been updated!");
      //                          localStorage.setItem('password', newPassword);
      //                      $rootScope.success = 'Your password has been updated';
      //                      $rootScope.error = '';  
      //                      $rootScope.invalid = '';
      //                     }).catch(function(error) {
      //                       // An error happened.
      //                         $rootScope.invalid = 'regcpwd';         
      //                         $rootScope.error = 'your Passwords not updated please try again.';
      //                         $rootScope.success = '';
      //                     });


      //             } else {
      //                 $rootScope.invalid = 'regcpwd';         
      //                 $rootScope.error = 'your Passwords don’t match with confirm password.';
      //                 $rootScope.success = '';
      //             }


      //     } else {
      //         $rootScope.invalid = 'regcpwd';         
      //         $rootScope.error = 'your Passwords don’t match with old password.';
      //         $rootScope.success = '';
      //     }
      // }


    }]);

'use strict';

//=================================================
// Tenant Dashboard
//=================================================

vcancyApp
  .controller('landlordProfilelCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'Upload', 'config', '$http', '$uibModal', 'emailSendingService',
    function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, Upload, config, $http, $uibModal, emailSendingService) {
      var vm = this;
      var landLordID = localStorage.getItem('userID');
      vm.refId = localStorage.getItem('refId');

      var password = localStorage.getItem('password');
      var swal = window.swal;
      vm.userData = {};
      vm.email = '';
      vm.firstname = '';
      vm.lastname = '';
      vm.loader = 1;
      vm.contact = '';
      vm.address = '';
      vm.notification = 'Enable';
      vm.success = 0;
      vm.error = 0;
      vm.totaluser = 0;
      vm.companyUsers = [];

      // vm.companylogo = '../assets/pages/img/no_image_found.jpg';
      $rootScope.invalid = '';
      $rootScope.success = '';
      $rootScope.error = '';
      firebase.database().ref('/users/' + landLordID).once('value').then(function (userdata) {

        $scope.$apply(function () {
          console.log(userdata.val());
          vm.userData = userdata.val();
          // if (userdata.val() !== null) {

          //   if(userdata.val().email != ''){
          //     vm.email = userdata.val().email;
          //   }else{
          //     vm.email = localStorage.getItem('userEmail');
          //   }

          //     vm.firstname = userdata.val().firstname;
          //     vm.lastname = userdata.val().lastname;
          //     vm.address = userdata.val().address;
          //     vm.contact = userdata.val().contact;
          //     vm.loader = 1;
          //     vm.isadded = userdata.val().isadded;
          //     vm.iscancelshow = userdata.val().iscancelshow;
          //     vm.iscreditcheck = userdata.val().iscreditcheck;
          //     vm.iscriminalreport = userdata.val().iscriminalreport;
          //     vm.isexpiresoon = userdata.val().isexpiresoon;
          //     vm.ispropertydelete = userdata.val().ispropertydelete;
          //     vm.isrentalsubmit = userdata.val().isrentalsubmit ;
          //     vm.isshowingtime = userdata.val().isshowingtime;
          //     if(userdata.val().profilepic != '' && userdata.val().profilepic != null){
          //       vm.profilepic = userdata.val().profilepic;
          //     }
          //     if(userdata.val().companylogo != '' && userdata.val().companylogo != null){
          //       vm.companylogo = userdata.val().companylogo;
          //     }
          //     vm.companyname = userdata.val().companyname;




          //   }
        });
      });


      var ref = firebase.database().ref("users");
      ref.orderByChild("refId").equalTo(landLordID).on("child_added", function (snapshot) {
        var companyUser = snapshot.val();
        companyUser.key = snapshot.key;
        vm.companyUsers.push(companyUser);
      });


      vm.profileSubmit = function () {
        var landLordID = localStorage.getItem('userID');

        // var updatedata = {};
        // //var tenantID = localStorage.getItem('userID');
        // if ($scope.ldProfilectrl.contact === undefined || $scope.ldProfilectrl.contact === "") {
        //   vm.contact = '';
        //   updatedata['contact'] = '';
        // } else {
        //   updatedata['contact'] = $scope.ldProfilectrl.contact;
        // }
        // if ($scope.ldProfilectrl.address === undefined || $scope.ldProfilectrl.address === "") {
        //   vm.address = '';
        //   updatedata['address'] = '';
        // } else {
        //   updatedata['address'] = $scope.ldProfilectrl.address;
        // }
        // if ($scope.ldProfilectrl.email === undefined || $scope.ldProfilectrl.email === "") {
        //   vm.email = '';
        //   updatedata['email'] = '';
        // } else {
        //   updatedata['email'] = $scope.ldProfilectrl.email;
        // }
        // if ($scope.ldProfilectrl.companyname === undefined || $scope.ldProfilectrl.companyname === "") {
        //   vm.companyname = '';
        //   updatedata['companyname'] = '';
        // } else {
        //   updatedata['companyname'] = $scope.ldProfilectrl.companyname;
        // }
        //alert(JSON.stringify(updatedata)); return false;

        firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
          localStorage.setItem('userData', JSON.stringify(vm.userData));
          vm.opensuccesssweet("Profile Updated successfully!");
        }, function (error) {

          vm.openerrorsweet("Profile Not Updated! Try again!");
          return false;
        });
      };

      //update company image
      $scope.uploadDetailsImages = function (event) {
        var file = event.target.files[0];
        AWS.config.update({
          accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
          secretAccessKey: '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'
        });
        AWS.config.region = 'ca-central-1';

        var bucket = new AWS.S3({
          params: {
            Bucket: 'vcancy-final'
          }
        });
        var filename = moment().format('YYYYMMDDHHmmss') + file.name;
        filename = filename.replace(/\s/g, '');

        if (file.size > 3145728) {
          swal({
            title: "Error!",
            text: 'File size should be 3 MB or less.',
            type: "error",
          });
          return false;
        } else if (file.type.indexOf('image') === -1) {
          swal({
            title: "Error!",
            text: 'Only files are accepted.',
            type: "error",
          });
          return false;
        }

        var params = {
          Key: 'company-logo/' + filename,
          ContentType: file.type,
          Body: file,
          StorageClass: "STANDARD_IA",
          ACL: 'public-read'
        };

        bucket.upload(params).on('httpUploadProgress', function (evt) { })
          .send(function (err, data) {
            if (data && data.Location) {
              $scope.$apply(function () {
                vm.userData.companylogo = data.Location;
              });
              firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
                vm.opensuccesssweet("Profile Updated successfully!");
              }, function (error) {

                vm.openerrorsweet("Profile Not Updated! Try again!");
                return false;
              });
            }
          });
      }



      vm.changepasswordSubmit = function (passworduser) {

        $rootScope.invalid = '';
        $rootScope.success = '';
        $rootScope.error = '';
        var oldpassword = localStorage.getItem('password');
        var userEmail = localStorage.getItem('userEmail');
        var ncpassword = passworduser.ncpassword;
        var password = passworduser.password;
        var npassword = passworduser.npassword;
        var landLordID = localStorage.getItem('userID');

        if (password === oldpassword) {

          if (password === ncpassword) {
            vm.openerrorsweet("Your old password and new password must be different");
            return false;
          }

          if (ncpassword === npassword) {

            var user = firebase.auth().currentUser;
            var newPassword = ncpassword;
            user.updatePassword(newPassword).then(function () {
              localStorage.setItem('password', newPassword);
              vm.opensuccesssweet("Your password has been updated!");
              var emailData = '<p>Hello, </p><p>Your password has been changed. If you didn’t change the password then please contact  support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
              // Send Email
              passworduser.npassword = '';
              passworduser.password = '';
              passworduser.ncpassword = '';
              emailSendingService.sendEmailViaNodeMailer(userEmail, 'Password changed', 'changepassword', emailData);



            }).catch(function (error) {
              console.log(error);
              vm.openerrorsweet("your Passwords not updated please try again.");
              return false;
            });


          } else {
            vm.openerrorsweet("Passwords don't match.");
            return false;
          }


        } else {
          vm.openerrorsweet("Passwords don't match with your current password.");
          return false;
        }
      }

      vm.profilestore = function () {
        AWS.config.update({
          accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
          secretAccessKey: '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'
        });
        AWS.config.region = 'ca-central-1';

        var bucket = new AWS.S3({ params: { Bucket: 'vcancy-final' } });
        var fileChooser = document.getElementById('file');
        var file = fileChooser.files[0];
        var filename = moment().format('YYYYMMDDHHmmss') + file.name;
        filename = filename.replace(/\s/g, '');

        if (file.size > 3145728) {
          swal({
            title: "Error!",
            text: 'File size should be 3 MB or less.',
            type: "error",
          });
          return false;
        } else if (!(filename.endsWith('.png'))
          && !(filename.endsWith('.jpg'))
          && !(filename.endsWith('.jpeg'))) {
          swal({
            title: "Error!",
            text: 'Invalid file type.',
            type: "error",
          });
          return false;
        }


        if (file) {
          var params = { Key: 'company-logo/' + filename, ContentType: file.type, Body: file, StorageClass: "STANDARD_IA", ACL: 'public-read' };
          bucket.upload(params).on('httpUploadProgress', function (evt) {
            console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total) + '%');
          }).send(function (err, data) {
            //console.log(data.Location); return false;
            if (data.Location != '') {
              var landLordID = localStorage.getItem('userID');
              var user = firebase.auth().currentUser;
              if (user) {
                firebase.database().ref('users/' + landLordID).update({ 'companylogo': data.Location }).then(function () {


                  vm.opensuccesssweet("Your Company Logo Picture updated successfully.");
                }, function (error) {
                  vm.openerrorsweet("Company Logo Not Added! Try again!");
                  return false;
                });
              }
            }

          });
        } else {
          swal({
            title: "Error!",
            text: "File Type is Invalid.",
            type: "error",
          });
          return false;
        }
      }


      vm.newuserSubmit = function (newuser) {
        var landLordID = localStorage.getItem('userID');
        var firstname = newuser.firstname;
        var lastname = newuser.lastname;
        var email = newuser.email;
        // var custome = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        var reguserdbObj = firebase.database();
        var random = parseInt(Math.random() * 10000);
        var characterArray = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var pass = '';
        for (var i = 0; i < 6; i++) {
          var num = Math.floor((Math.random() * 60) + 1);
          pass += characterArray[num];
        }
        //console.log(pass);
        var usertype = 2;

        // var userarray = {
        //   firstname: firstname,
        //   lastname: lastname,
        //   refId: refId,
        //   email: email
        // };
        var reguserObj = $firebaseAuth();
        reguserObj.$createUserWithEmailAndPassword(email, pass)
          .then(function (firebaseUser) {
            var reguserdbObj = firebase.database();
            reguserdbObj.ref('users/' + firebaseUser.uid).set({
              firstname: firstname,
              lastname: lastname,
              usertype: usertype,
              refId: landLordID,
              email: email,
              isadded: 1,
              iscancelshow: 1,
              iscreditcheck: 1,
              iscriminalreport: 1,
              isexpiresoon: 1,
              ispropertydelete: 1,
              isrentalsubmit: 1,
              isshowingtime: 1,
              companyname: ""
            });
            vm.opensuccesssweet("User Added successfully!");

            firebase.auth().signInWithEmailAndPassword(email, pass)
              .then(function (firebaseUser) {

                var emailData = '<p>Hello, </p><p>A new user,' + firstname + ' ,has been added to on https://vcancy.com/ .</p><p>Your email is ' + email + '.</p><p>Your password : <strong>' + pass + '</strong></p><p>If you have any questions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                // Send Email
                emailSendingService.sendEmailViaNodeMailer(email, 'A new user account has been added to your portal', 'Welcome', emailData);
                // Success 
                firebaseUser.sendEmailVerification().then(function () {

                  var emailData = '<p>Hello, </p><p>A new user,' + firstname + ' ,has been added to your portal.</p><p>An account confirmation email has been sent to the user at ' + email + '.</p><p>To view/edit user details, please log in https://vcancy.com/ and go to “Profile” and click on “Users”</p><p>If you have any questions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

                  // Send Email
                  emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'A new user account has been added to your portal', 'Welcome', emailData);

                  console.log("Email Sent");
                  $rootScope.success = 'Confirmation email resent';
                  $rootScope.error = '';
                  setTimeout(function () { $rootScope.success = '' }, 1000);
                }).catch(function (error) {
                  console.log("Error in sending email" + error);
                });
              })
          }).catch(function (error) {
            //console.log(error);
            if (error.message) {
              if (error.message == "The email address is badly formatted.") {
                $rootScope.error = "Invalid Email.";
                $rootScope.success = '';
              } else {
                $rootScope.error = error.message;
                setTimeout(function () { $rootScope.error = '' }, 1000);
                $rootScope.success = '';
              }
              //$rootScope.error = error.message;

            }

            if (error.code === "auth/invalid-email") {
              $rootScope.invalid = 'regemail';
            } else if (error.code === "auth/weak-password") {
              $rootScope.invalid = 'regpwd';
            } else {
              $rootScope.invalid = '';
            }
          });

        // reguserdbObj.ref('employee/' + custome).set(userarray, function (error) {
        //   if (error != null) {

        //     vm.openerrorsweet("User Not added Please Try again.");
        //     return false;
        //   } else {
        //     vm.opensuccesssweet("User Added successfully!");
        //   }
        // });


      }

      vm.deleteCompanyUsers = function (val) {
        swal({
          title: "Are you sure?",
          text: "Your will not be able to recover this user again!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
        },
          function (isConfirm) {
            if (isConfirm) {
              var propertyObj = $firebaseAuth();
              var propdbObj = firebase.database();
              propdbObj.ref('users/' + val).set({
                isDeleted: true,
              })
                .then(function () {
                  var indexOfDeletedUser = vm.companyUsers.find(function (user) {
                    if (user.key === val) return true;
                  });
                  vm.companyUsers.splice(indexOfDeletedUser, 1);
                  swal({
                    title: "Success!",
                    text: "User has been deleted.",
                    type: "success",
                    confirmButtonColor: '#009999',
                    confirmButtonText: "Ok"
                  });
                  $state.reload();
                });
            }
          });
      }

      vm.upload = function (file, filename) {
        file = file.replace("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,", "");
        file = file.replace("data:application/pdf;base64,", "");
        file = file.replace(/^data:image\/\w+;base64,/, "");
        file = file.replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", "");
        //console.log(file,filename);

        var req = {
          method: 'POST',
          url: config.sailsBaseUrl + 'fileupload/upload',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
          },
          data: {
            file: file,
            filename: filename
          }
        }

        $http(req).then(function successCallback(response) {
          console.log(response);
          console.log("Done");
          return true;
        }, function errorCallback(response) {
          console.log("Fail");
          return false;
        });
      };

      vm.notificationSubmit = function (notificationuser) {
        //    console.log(notificationuser);
        // if (notificationuser != undefined) {
        //     var notification = {};

        //     if( notificationuser.isadded != undefined){
        //       notification['isadded'] = notificationuser.isadded;
        //     }else{
        //       notification['isadded'] = 0;
        //     }


        //     if(notificationuser.isshowingtime != undefined){
        //       notification['isshowingtime'] = notificationuser.isshowingtime;
        //     }else{
        //       notification['isshowingtime'] = 0;
        //     }


        //     if(notificationuser.isrentalsubmit != undefined){
        //       notification['isrentalsubmit'] = notificationuser.isrentalsubmit;
        //     }else{
        //       notification['isrentalsubmit'] = 0;
        //     }



        //     if(notificationuser.iscancelshow != undefined){
        //       notification['iscancelshow'] = notificationuser.iscancelshow;
        //     }else{
        //       notification['iscancelshow'] = 0;
        //     }


        //     if(notificationuser.iscreditcheck != undefined){
        //       notification['iscreditcheck'] = notificationuser.iscreditcheck;
        //     }else{
        //       notification['iscreditcheck'] = 0;
        //     }



        //     if(notificationuser.iscriminalreport != undefined){
        //       notification['iscriminalreport'] = notificationuser.iscriminalreport;
        //     }else{
        //       notification['iscriminalreport'] = 0;
        //     }


        //     if(notificationuser.isexpiresoon != undefined){
        //       notification['isexpiresoon'] = notificationuser.isexpiresoon;
        //     }else{
        //       notification['isexpiresoon'] = 0;
        //     }



        //     if(notificationuser.ispropertydelete != undefined){
        //       notification['ispropertydelete'] = notificationuser.ispropertydelete;
        //     }else{
        //       notification['ispropertydelete'] = 0;
        //     }

        // if (notification != null) {
        //   var user = firebase.auth().currentUser;
        //   if (user) {
        //     firebase.database().ref('users/' + landLordID).update(notification).then(function () {
        //       vm.opensuccesssweet("Your notification updated successfully!");
        //     }, function (error) {
        //       vm.openerrorsweet("May Be your session is expire please login again.");
        //       return false;
        //     });
        //   } else {
        //     vm.openerrorsweet("May Be your session is expire please login again.");
        //     return false;
        //   }
        // } else {

        //   vm.openerrorsweet("Please Select Atleast one option.");
        //   return false;
        // }

        // } else {
        //   vm.openerrorsweet("Please Select Atleast one option.");
        //   return false;
        // }
        var landLordID = localStorage.getItem('userID');
        var user = firebase.auth().currentUser;
        if (user) {
          firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
            vm.opensuccesssweet("Your notification updated successfully!");
          }, function (error) {
            vm.openerrorsweet("May Be your session is expire please login again.");
            return false;
          });
        } else {
          vm.openerrorsweet("May Be your session is expire please login again.");
          return false;
        }

      }

      $scope.items = ['item1', 'item2', 'item3'];

      $scope.open = function (size) {

        var modalInstance = $uibModal.open({
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          size: size,

        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
        });
      };

      vm.opensuccesssweet = function (value) {
        swal({
          title: "Success!",
          text: value,
          type: "success",
          confirmButtonColor: '#009999',
          confirmButtonText: "Ok"
        }, function (isConfirm) {
          if (isConfirm) {
            // $state.reload();
          }
        });
      };

      vm.openerrorsweet = function (value) {
        swal({
          title: "Error",
          text: value,
          type: "warning",
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Ok",
          closeOnConfirm: true
        },
          function () {
            return false;
          });

      };

    }]);

vcancyApp.controller('ModalInstanceCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'Upload', 'config', '$http', '$modal', '$uibModalInstance', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, Upload, config, $http, $modal, $uibModalInstance) {
  var swal = window.swal;
  var vm = this;
  AWS.config.update({
    accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
    secretAccessKey: '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'
  });
  AWS.config.region = 'ca-central-1';

  $scope.ok = function () {

    var bucket = new AWS.S3({ params: { Bucket: 'vacancy-final' } });
    var fileChooser = document.getElementById('file321');
    var file = fileChooser.files[0];
    var filename = moment().format('YYYYMMDDHHmmss') + file.name;
    filename = filename.replace(/\s/g, '');

    if (file.size > 3145728) {
      // alert('File size should be 3 MB or less.');
      vm.openerrorsweet('File size should be 3 MB or less.');
      return false;
    } else if (!(filename.endsWith('.png'))
      && !(filename.endsWith('.jpg'))
      && !(filename.endsWith('.jpeg'))) {
      // alert('Invalid file type.');
      vm.openerrorsweet("Invalid file type.");
      return false;
    }


    if (file) {
      var params = { Key: 'profile-images/' + filename, ContentType: file.type, Body: file, StorageClass: "STANDARD_IA", ACL: 'public-read' };
      bucket.upload(params).on('httpUploadProgress', function (evt) {
        console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total) + '%');
      }).send(function (err, data) {
        //console.log(data.Location); return false;
        if (data.Location != '') {
          var landLordID = localStorage.getItem('userID');
          var user = firebase.auth().currentUser;
          if (user) {
            firebase.database().ref('users/' + landLordID).update({ 'profilepic': data.Location }).then(function () {
              vm.opensuccesssweet("Your profile Picture updated successfully.");
              //$state.reload();
            }, function (error) {

            });
          }
        }

      });
    } else {
      vm.openerrorsweet("File Type is Invalid.");
      return false;

    }
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };


  vm.opensuccesssweet = function (value) {
    swal({
      title: "Success!",
      text: value,
      type: "success",
      confirmButtonColor: '#009999',
      confirmButtonText: "Ok"
    }, function (isConfirm) {
      if (isConfirm) {
        $uibModalInstance.close();
        $state.reload();
      }
    });
  }

  vm.openerrorsweet = function (value) {
    swal({
      title: "Error",
      text: value,
      type: "warning",
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Ok",
      closeOnConfirm: true
    },
      function () {
        return false;
      });
  }

}]);

vcancyApp.directive('uiTour', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        link: function ($scope, $element, $attributes) {
            $timeout(function(){
                var model = $parse($attributes.uiTour);

                // Watch model and change steps
                $scope.$watch($attributes.uiTour, function (newVal, oldVal) {
                    if (angular.isNumber(newVal)) {
                        showStep(newVal)
                    } else {
                        if (angular.isString(newVal)) {
                            var stepNumber = 0,
                              children = $element.children()
                            angular.forEach(children, function (step, index) {
                                if (angular.element(step).attr('name') === newVal)
                                    stepNumber = index + 1;
                            });
                            model.assign($scope, stepNumber);
                        } else {
                            model.assign($scope, newVal && 1 || 0);
                        }
                    }
                });

                // Show step
                function showStep(stepNumber) {
                    var elm, at, children = $element.children().removeClass('active');
                    elm = children.eq(stepNumber - 1);
                    if (stepNumber && elm.length) {
                        at = elm.attr('at');
                        $timeout(function () {
                            var target = angular.element(elm.attr('target'))[0];


                            if (elm.attr('overlay') !== undefined) {
                                $('.tour-overlay').addClass('active').css({
                                    marginLeft: target.offsetLeft + target.offsetWidth / 2 - 150,
                                    marginTop: target.offsetTop + target.offsetHeight / 2 - 150
                                }).addClass('in');
                            } else {
                                $('.tour-overlay').removeClass('in');
                                setTimeout(function () {
                                    $('.tour-overlay').removeClass('active');
                                }, 1000);
                            }
                            offset = $(target).offset();

                            //offset.top = target.top;
                            //offset.left = target.left;

                            elm.addClass('active');

                            if (at.indexOf('bottom') > -1) {
                               // offset.top += target.offsetHeight;
                            } else if (at.indexOf('top') > -1) {
                               // offset.top -= elm[0].offsetHeight;
                            } else {
                                //offset.top += target.offsetHeight / 2 - elm[0].offsetHeight / 2;
                            }
                            if (at.indexOf('left') > -1) {
                              //  offset.left -= elm[0].offsetWidth;
                            } else if (at.indexOf('right') > -1) {
                              //  offset.left += target.offsetWidth;
                            } else {
                               // offset.left += target.offsetWidth / 2 - elm[0].offsetWidth / 2;
                            }

                            elm.css(offset);
                        });
                    } else {
                        $('.tour-overlay').removeClass('in');
                        setTimeout(function () {
                            $('.tour-overlay').removeClass('active');
                        }, 1000);
                    }
                }
            },0)
        }
    };
}]);
vcancyApp.directive('fileUpload', function () {
    return {
        link: function (scope,element) {
            element.on('change', scope.uploadDetailsImages);
        },
        restrict:'A',
    };
});
vcancyApp.filter('availableunit', function () {
    return function (units, filterBy) {
        return units.filter(function (unit) {
            if (unit.status === 'status' || unit.status === 'available' || unit.status === 'availablesoon') {
                return true;
            }
        });
    };
});
 var materialAdmin = angular.module('vcancyApp');

    // =========================================================================
    // INPUT FEILDS MODIFICATION
    // =========================================================================

    //Add blue animated border and remove with condition when focus and blur

materialAdmin.directive('fgLine', function () {
        return {
            restrict: 'C',
            link: function(scope, element) {
                if($('.fg-line')[0]) {
                    $('body').on('focus', '.form-control', function(){
                        $(this).closest('.fg-line').addClass('fg-toggled');
                    })

                    $('body').on('blur', '.form-control', function(){
                        var p = $(this).closest('.form-group');
                        var i = p.find('.form-control').val();

                        if (p.hasClass('fg-float')) {
                            if (i.length == 0) {
                                $(this).closest('.fg-line').removeClass('fg-toggled');
                            }
                        }
                        else {
                            $(this).closest('.fg-line').removeClass('fg-toggled');
                        }
                    });
                }
    
            }
        }
        
    })

    

    // =========================================================================
    // AUTO SIZE TEXTAREA
    // =========================================================================
    
    .directive('autoSize', function(){
        return {
            restrict: 'A',
            link: function(scope, element){
                if (element[0]) {
                   autosize(element);
                }
            }
        }
    })
    

    // =========================================================================
    // BOOTSTRAP SELECT
    // =========================================================================

    .directive('selectPicker', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                //if (element[0]) {
                    element.selectpicker();
                //}
            }
        }
    })
    

    // =========================================================================
    // INPUT MASK
    // =========================================================================

    .directive('inputMask', function(){
        return {
            restrict: 'A',
            scope: {
              inputMask: '='
            },
            link: function(scope, element){
                element.mask(scope.inputMask.mask);
            }
        }
    })

    
    // =========================================================================
    // COLOR PICKER
    // =========================================================================

    .directive('colordPicker', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).each(function(){
                    var colorOutput = $(this).closest('.cp-container').find('.cp-value');
                    $(this).farbtastic(colorOutput);
                });
                
            }
        }
    })



    // =========================================================================
    // PLACEHOLDER FOR IE 9 (on .form-control class)
    // =========================================================================

    .directive('formControl', function(){
        return {
            restrict: 'C',
            link: function(scope, element, attrs) {
                if(angular.element('html').hasClass('ie9')) {
                    $('input, textarea').placeholder({
                        customClass: 'ie9-placeholder'
                    });
                }
            }
            
        }
    })


/*
*  AngularJs Fullcalendar Wrapper for the JQuery FullCalendar
*  API @ http://arshaw.com/fullcalendar/
*
*  Angular Calendar Directive that takes in the [eventSources] nested array object as the ng-model and watches it deeply changes.
*       Can also take in multiple event urls as a source object(s) and feed the events per view.
*       The calendar will watch any eventSource array and update itself when a change is made.
*
*/

angular.module('ui.calendar', [])

    .constant('uiCalendarConfig', {
        calendars : {}
    })
    .controller('uiCalendarCtrl', ['$scope', '$locale',
        function ($scope, $locale) {

            var sources = $scope.eventSources;
            var extraEventSignature = $scope.calendarWatchEvent ? $scope.calendarWatchEvent : angular.noop;

            var wrapFunctionWithScopeApply = function (functionToWrap) {
                return function () {
                    // This may happen outside of angular context, so create one if outside.
                    if ($scope.$root.$$phase) {
                        return functionToWrap.apply(this, arguments);
                    }

                    var args = arguments;
                    var that = this;
                    return $scope.$root.$apply(
                        function () {
                            return functionToWrap.apply(that, args);
                        }
                    );
                };
            };

            var eventSerialId = 1;
            // @return {String} fingerprint of the event object and its properties
            this.eventFingerprint = function (e) {
                if (!e._id) {
                    e._id = eventSerialId++;
                }

                var extraSignature = extraEventSignature({
                    event : e
                }) || '';
                var start = moment.isMoment(e.start) ? e.start.unix() : (e.start ? moment(e.start).unix() : '');
                var end = moment.isMoment(e.end) ? e.end.unix() : (e.end ? moment(e.end).unix() : '');

                // This extracts all the information we need from the event. http://jsperf.com/angular-calendar-events-fingerprint/3
                return [e._id, e.id || '', e.title || '', e.url || '', start, end, e.allDay || '', e.className || '', extraSignature].join('');
            };

            var sourceSerialId = 1;
            var sourceEventsSerialId = 1;
            // @return {String} fingerprint of the source object and its events array
            this.sourceFingerprint = function (source) {
                var fp = '' + (source.__id || (source.__id = sourceSerialId++));
                var events = angular.isObject(source) && source.events;

                if (events) {
                    fp = fp + '-' + (events.__id || (events.__id = sourceEventsSerialId++));
                }
                return fp;
            };

            // @return {Array} all events from all sources
            this.allEvents = function () {
                return Array.prototype.concat.apply(
                    [],
                    (sources || []).reduce(
                        function (previous, source) {
                            if (angular.isArray(source)) {
                                previous.push(source);
                            } else if (angular.isObject(source) && angular.isArray(source.events)) {
                                var extEvent = Object.keys(source).filter(
                                    function (key) {
                                        return (key !== '_id' && key !== 'events');
                                    }
                                );

                                source.events.forEach(
                                    function (event) {
                                        angular.extend(event, extEvent);
                                    }
                                );

                                previous.push(source.events);
                            }
                            return previous;
                        },
                        []
                    )
                );
            };

            // Track changes in array of objects by assigning id tokens to each element and watching the scope for changes in the tokens
            // @param {Array|Function} arraySource array of objects to watch
            // @param tokenFn {Function} that returns the token for a given object
            // @return {Object}
            //  subscribe: function(scope, function(newTokens, oldTokens))
            //    called when source has changed. return false to prevent individual callbacks from firing
            //  onAdded/Removed/Changed:
            //    when set to a callback, called each item where a respective change is detected
            this.changeWatcher = function (arraySource, tokenFn) {
                var self;

                var getTokens = function () {
                    return ((angular.isFunction(arraySource) ? arraySource() : arraySource) || []).reduce(
                        function (rslt, el) {
                            var token = tokenFn(el);
                            map[token] = el;
                            rslt.push(token);
                            return rslt;
                        },
                        []
                    );
                };

                // @param {Array} a
                // @param {Array} b
                // @return {Array} elements in that are in a but not in b
                // @example
                //  subtractAsSets([6, 100, 4, 5], [4, 5, 7]) // [6, 100]
                var subtractAsSets = function (a, b) {
                    var obj = (b || []).reduce(
                        function (rslt, val) {
                            rslt[val] = true;
                            return rslt;
                        },
                        Object.create(null)
                    );
                    return (a || []).filter(
                        function (val) {
                            return !obj[val];
                        }
                    );
                };

                // Map objects to tokens and vice-versa
                var map = {};

                // Compare newTokens to oldTokens and call onAdded, onRemoved, and onChanged handlers for each affected event respectively.
                var applyChanges = function (newTokens, oldTokens) {
                    var i;
                    var token;
                    var replacedTokens = {};
                    var removedTokens = subtractAsSets(oldTokens, newTokens);
                    for (i = 0; i < removedTokens.length; i++) {
                        var removedToken = removedTokens[i];
                        var el = map[removedToken];
                        delete map[removedToken];
                        var newToken = tokenFn(el);
                        // if the element wasn't removed but simply got a new token, its old token will be different from the current one
                        if (newToken === removedToken) {
                            self.onRemoved(el);
                        } else {
                            replacedTokens[newToken] = removedToken;
                            self.onChanged(el);
                        }
                    }

                    var addedTokens = subtractAsSets(newTokens, oldTokens);
                    for (i = 0; i < addedTokens.length; i++) {
                        token = addedTokens[i];
                        if (!replacedTokens[token]) {
                            self.onAdded(map[token]);
                        }
                    }
                };

                self = {
                    subscribe : function (scope, onArrayChanged) {
                        scope.$watch(getTokens, function (newTokens, oldTokens) {
                            var notify = !(onArrayChanged && onArrayChanged(newTokens, oldTokens) === false);
                            if (notify) {
                                applyChanges(newTokens, oldTokens);
                            }
                        }, true);
                    },
                    onAdded : angular.noop,
                    onChanged : angular.noop,
                    onRemoved : angular.noop
                };
                return self;
            };

            this.getFullCalendarConfig = function (calendarSettings, uiCalendarConfig) {
                var config = {};

                angular.extend(config, uiCalendarConfig);
                angular.extend(config, calendarSettings);

                angular.forEach(config, function (value, key) {
                    if (typeof value === 'function') {
                        config[key] = wrapFunctionWithScopeApply(config[key]);
                    }
                });

                return config;
            };

            this.getLocaleConfig = function (fullCalendarConfig) {
                if (!fullCalendarConfig.lang || fullCalendarConfig.useNgLocale) {
                    // Configure to use locale names by default
                    var tValues = function (data) {
                        // convert {0: "Jan", 1: "Feb", ...} to ["Jan", "Feb", ...]
                        return (Object.keys(data) || []).reduce(
                            function (rslt, el) {
                                rslt.push(data[el]);
                                return rslt;
                            },
                            []
                        );
                    };

                    var dtf = $locale.DATETIME_FORMATS;
                    return {
                        monthNames : tValues(dtf.MONTH),
                        monthNamesShort : tValues(dtf.SHORTMONTH),
                        dayNames : tValues(dtf.DAY),
                        dayNamesShort : tValues(dtf.SHORTDAY)
                    };
                }

                return {};
            };
        }
    ])
    .directive('uiCalendar', ['uiCalendarConfig',
        function (uiCalendarConfig) {

            return {
                restrict : 'A',
                scope : {
                    eventSources : '=ngModel',
                    calendarWatchEvent : '&'
                },
                controller : 'uiCalendarCtrl',
                link : function (scope, elm, attrs, controller) {
                    var sources = scope.eventSources;
                    var sourcesChanged = false;
                    var calendar;
                    var eventSourcesWatcher = controller.changeWatcher(sources, controller.sourceFingerprint);
                    var eventsWatcher = controller.changeWatcher(controller.allEvents, controller.eventFingerprint);
                    var options = null;

                    function getOptions () {
                        var calendarSettings = attrs.uiCalendar ? scope.$parent.$eval(attrs.uiCalendar) : {};
                        var fullCalendarConfig = controller.getFullCalendarConfig(calendarSettings, uiCalendarConfig);
                        var localeFullCalendarConfig = controller.getLocaleConfig(fullCalendarConfig);
                        angular.extend(localeFullCalendarConfig, fullCalendarConfig);
                        options = {
                            eventSources : sources
                        };
                        angular.extend(options, localeFullCalendarConfig);
                        //remove calendars from options
                        options.calendars = null;

                        var options2 = {};
                        for (var o in options) {
                            if (o !== 'eventSources') {
                                options2[o] = options[o];
                            }
                        }
                        return JSON.stringify(options2);
                    }

                    scope.destroyCalendar = function () {
                        if (calendar && calendar.fullCalendar) {
                            calendar.fullCalendar('destroy');
                        }
                        if (attrs.calendar) {
                            calendar = uiCalendarConfig.calendars[attrs.calendar] = angular.element(elm).html('');
                        } else {
                            calendar = angular.element(elm).html('');
                        }
                    };

                    scope.initCalendar = function () {
                        if (!calendar) {
                            calendar = angular.element(elm).html('');
                        }
                        calendar.fullCalendar(options);
                        if (attrs.calendar) {
                            uiCalendarConfig.calendars[attrs.calendar] = calendar;
                        }
                    };

                    scope.$on('$destroy', function () {
                        scope.destroyCalendar();
                    });

                    eventSourcesWatcher.onAdded = function (source) {
                        if (calendar && calendar.fullCalendar) {
                            calendar.fullCalendar(options);
                            if (attrs.calendar) {
                                uiCalendarConfig.calendars[attrs.calendar] = calendar;
                            }
                            calendar.fullCalendar('addEventSource', source);
                            sourcesChanged = true;
                           
                        }
                    };

                    eventSourcesWatcher.onRemoved = function (source) {
                        if (calendar && calendar.fullCalendar) {
                            calendar.fullCalendar('removeEventSource', source);
                            sourcesChanged = true;
                        }
                    };

                    eventSourcesWatcher.onChanged = function () {
                        if (calendar && calendar.fullCalendar) {
                            calendar.fullCalendar('refetchEvents');
                            sourcesChanged = true;
                        }
                    };

                    eventsWatcher.onAdded = function (event) {
                        calendar.fullCalendar('renderEvent', event, true);
                    };

                    eventsWatcher.onRemoved = function (event) {
                        if (calendar && calendar.fullCalendar) {
                            calendar.fullCalendar('removeEvents', event._id);
                        }
                    };

                    eventsWatcher.onChanged = function (event) {
                        if (calendar && calendar.fullCalendar) {
                            var clientEvents = calendar.fullCalendar('clientEvents', event._id);
                            for (var i = 0; i < clientEvents.length; i++) {
                                var clientEvent = clientEvents[i];
                                clientEvent = angular.extend(clientEvent, event);
                                calendar.fullCalendar('updateEvent', clientEvent);
                            }
                        }
                    };

                    eventSourcesWatcher.subscribe(scope);
                    eventsWatcher.subscribe(scope, function () {
                        // if (sourcesChanged === true) {
                        //     sourcesChanged = false;
                        //     // return false to prevent onAdded/Removed/Changed handlers from firing in this case
                        //     return false;
                        // }
                        return true
                    });

                    scope.$watch(getOptions, function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            scope.destroyCalendar();
                            scope.initCalendar();
                        } else if ((newValue && angular.isUndefined(calendar))) {
                            scope.initCalendar();
                        }
                    });
                }
            };
        }
    ]
);
