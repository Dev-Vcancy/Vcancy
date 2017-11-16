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
	'unsavedChanges',
	'AngularPrint',
	'ngFileUpload',
	'ui.jq',
	'ui.bootstrap'
  ]); 
 
	
vcancyApp.constant('config', {
   "sailsBaseUrl": 'https://www.vcancy.ca/nodeapi/api/v1/',
});

vcancyApp.service('emailSendingService',function($http,config){
	this.sendEmailViaNodeMailer = function(to,subject,mode,emailData){
		var req = {
			 method: 'POST',
			// url: 'http://localhost:1337/email/sendemail',
			 url: config.sailsBaseUrl+'email/sendemail',
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
.service('slotsBuildService', function(){
   this.maketimeslots = function(date,ftime,totime,limit,multiple) {
	   	   
		var slots = [];
	   
		angular.forEach(date, function(value, key) { 
			var fromtime = new Date(ftime[key]);
			var to = new Date(totime[key]);
			
			var minutestimediff = (to - fromtime)/ 60000;
			var subslots = Math.floor(Math.ceil(minutestimediff)/30);
			
		    var temp = 0;
			for(var i=0; i<subslots; i++){
			   if(temp == 0){
				   temp = fromtime;
			   } 		   
			   var f = temp;
			   var t = new Date(f.getTime() + (30 * 60 * 1000)); // 30 minutes add to from time 
			   var temp = t;
			   slots.push({date:value, fromtime:f, to:t, person: limit[key], multiple: multiple[key], dateslotindex: key});
			   
			   // temp = new Date(t.getTime() + (1 * 60 * 1000)); // 1 minute add to TO time
			}  
		});
	   
	  // console.log(slots);
      return slots;
   }	
});
  
  
vcancyApp  
 .directive('loginHeader', function() {
  return {
    controller: 'headerCtrl',
	controllerAs: 'hctrl',
	templateUrl: 'views/template/header-top.html',
  };
}); 

vcancyApp  
 .directive('loginSidebar', function() {
  return {
    controller: 'maCtrl',
	controllerAs: 'mactrl',
	templateUrl: 'views/template/sidebar-left.html',
  };
}); 

vcancyApp 
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
 // vcancyApp
 // .directive('fullCalendar', function(){
        // return {
            // restrict: 'A',
            // link: function(scope, element) {
                // element.fullCalendar({
                    // contentHeight: 'auto',
                    // theme: true,
                    // header: {
                        // right: '',
                        // center: 'prev, title, next',
                        // left: ''
                    // },
                    // defaultDate: '2014-06-12',
                    // editable: true,
                    // events: [
                        // {
                            // title: 'All Day',
                            // start: '2014-06-01',
                            // className: 'bgm-cyan'
                        // },
                        // {
                            // title: 'Long Event',
                            // start: '2014-06-07',
                            // end: '2014-06-10',
                            // className: 'bgm-orange'
                        // },
                        // {
                            // id: 999,
                            // title: 'Repeat',
                            // start: '2014-06-09',
                            // className: 'bgm-lightgreen'
                        // },
                        // {
                            // id: 999,
                            // title: 'Repeat',
                            // start: '2014-06-16',
                            // className: 'bgm-blue'
                        // },
                        // {
                            // title: 'Meet',
                            // start: '2014-06-12',
                            // end: '2014-06-12',
                            // className: 'bgm-teal'
                        // },
                        // {
                            // title: 'Lunch',
                            // start: '2014-06-12',
                            // className: 'bgm-gray'
                        // },
                        // {
                            // title: 'Birthday',
                            // start: '2014-06-13',
                            // className: 'bgm-pink'
                        // },
                        // {
                            // title: 'Google',
                            // url: 'http://google.com/',
                            // start: '2014-06-28',
                            // className: 'bgm-bluegray'
                        // }
                    // ]
                // });
            // }
        // }
    // }) 
	

 vcancyApp
 .directive('fullCalendar', function(){
        return {
            restrict: 'A',
			scope: {
				calendardata: '=' //Two-way data binding
			},
            link: function(scope, element) {
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
 .config(function ($stateProvider, $urlRouterProvider){	
	  // Initialize Firebase
	  var config = {
		apiKey: "AIzaSyDO18QznZ7mvAezkQ1M80nUz1OhaHjuwSA",
		authDomain: "vcancy-5e3b4.firebaseapp.com",
		databaseURL: "https://vcancy-5e3b4.firebaseio.com",
		projectId: "vcancy-5e3b4",
		storageBucket: "vcancy-5e3b4.appspot.com",
		messagingSenderId: "330892868858"
	  };
	  var app = firebase.initializeApp(config);	 
	  
	  // var sailsBaseUrl = 'http://www.vcancy.ca/api/v1/';
	
	$urlRouterProvider.otherwise("/");
	$stateProvider	
		// Public Routes
	   .state ('login', {
			url: '/',
			controller: 'loginCtrl',
			controllerAs: 'lctrl',
			templateUrl: 'views/login.html',	
		}) 
		
		.state ('termsofuse', {
			url: '/termsofuse',
			templateUrl: 'views/termspublic.html',	
		}) 
		
		.state ('viewexternalapplication', {
			url: '/viewexternalapp/{appID}',
			controller: 'viewappCtrl',
			controllerAs: 'vappctrl',
			templateUrl: 'views/view_rental_app_form.html',
		})
		
		// Landlord Routes
		.state ('landlorddashboard', {
			url: '/landlorddboard',
			controller: 'landlorddboardlCtrl',
			controllerAs: 'ldboardctrl',
			templateUrl: 'views/landlord.html',
			resolve: { authenticate: authenticate }
		}) 
		.state('landordprofile', {
		    url: '/landordprofile',
		    controller: 'landlordProfilelCtrl',
		    controllerAs: 'ldProfilectrl',
		    templateUrl: 'views/landloardProfile.html',
		    resolve: { authenticate: authenticate }
		})
		.state ('viewprop', {
			url: '/myprop',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/viewproperties.html',
			resolve: { authenticate: authenticate }
		}) 
		
		.state ('editprop', {
			url: '/editprop/{propId}',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/addproperties.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('customemailhandler', {
			url: '/auth?{mode}&{oobCode}&{apiKey}',
			controller: 'emailhandlerCtrl',
			controllerAs: 'ehandlectrl',
			templateUrl: 'views/customhandler.html',
		})
		
		 .state ('addprop', {
			url: '/addprop',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/addproperties.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('schedule', {
			url: '/schedule',
			controller: 'scheduleCtrl',
			controllerAs: 'schedulectrl',
			templateUrl: 'views/schedule.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('app', {
			url: '/app',
			controller: 'landlordappCtrl',
			controllerAs: 'lappctrl',
			templateUrl: 'views/app.html',
			resolve: { authenticate: authenticate }
		})  
		
		.state ('faq', {
			url: '/faq',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/faq.html',
			resolve: { authenticate: authenticate }
		}) 
		
		.state ('contact', {
			url: '/contact',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/contact.html',
			resolve: { authenticate: authenticate }
		}) 
		
		.state ('security', {
			url: '/security',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/security.html',
			resolve: { authenticate: authenticate }
		}) 
		
		.state ('terms', {
			url: '/terms',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/terms.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('viewtenantapplication', {
			url: '/viewapplication/{appID}',
			controller: 'viewappCtrl',
			controllerAs: 'vappctrl',
			templateUrl: 'views/view_rental_app_form.html',
			resolve: { authenticate: authenticate }
		})
		 
		// Tenant Routes
		.state ('tenantdashboard', {
			url: '/tenantdashboard',
			controller: 'tenantdboardlCtrl',
			controllerAs: 'tdboardctrl',
			templateUrl: 'views/tenant.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		.state('tenantprofile', {
		    url: '/tenantprofile',
		    controller: 'tenantProfilelCtrl',
		    controllerAs: 'tdProfilectrl',
		    templateUrl: 'views/tenantProfile.html',
		    resolve: { tenantauthenticate: tenantauthenticate }
		})
		.state ('tenantapply', {
			url: '/applyproperty/{propId}',
			controller: 'applypropCtrl',
			controllerAs: 'applyctrl',
			templateUrl: 'views/applyproperty.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		.state ('applicationThanks', {
			url: '/applicationThanks',
			templateUrl: 'views/applypropsuccess.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		.state ('tenantschedule', {
			url: '/tenantschedule',
			controller: 'tenantscheduleCtrl',
			controllerAs: 'tschedulectrl',
			templateUrl: 'views/tenant_schedule.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		.state ('tenantapplications', {
			url: '/tenantapplications',
			controller: 'tenantappCtrl',
			controllerAs: 'tappctrl',
			templateUrl: 'views/tenant_app.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		
		.state ('rentalform', {
			url: '/rentalform/{scheduleId}/{applicationId}',
			controller: 'rentalformCtrl',
			controllerAs: 'rctrl',
			templateUrl: 'views/rental_app_form.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
				
		.state ('viewapplication1', {
			url: '/viewapp/{appID}',
			controller: 'viewappCtrl',
			controllerAs: 'vappctrl',
			templateUrl: 'views/view_rental_app_form.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		
		function authenticate($q,$state, $timeout, $rootScope) {
			// console.log($rootScope.user.emailVerified);
			
			if(localStorage.getItem('userID') !== "null" && localStorage.getItem('userEmailVerified')!== "null" && localStorage.getItem('usertype') != "null" ){
				 $rootScope.uid  = localStorage.getItem('userID');
				 $rootScope.emailVerified  = localStorage.getItem('userEmailVerified');
				 $rootScope.usertype = localStorage.getItem('usertype');
			 } 
			  
			if ($rootScope.uid && $rootScope.emailVerified && $rootScope.usertype == "1" ) {				
				// Resolve the promise successfully
				return $q.when()			
				
			} else {
				  // The next bit of code is asynchronously tricky.

				  $timeout(function() {
				  // This code runs after the authentication promise has been rejected.
				  // Go to the log-in page
				  $state.go('login')
				})

				// Reject the authentication promise to prevent the state from loading
				return $q.reject()
			}
		}
		
		function tenantauthenticate($q,$state, $timeout, $rootScope) {
			// console.log($rootScope.user.emailVerified);
			
			if(localStorage.getItem('userID') !== "null" && localStorage.getItem('userEmailVerified')!== "null" && localStorage.getItem('usertype') != "null"){
				 $rootScope.uid  = localStorage.getItem('userID');
				 $rootScope.emailVerified  = localStorage.getItem('userEmailVerified');
				 $rootScope.usertype = localStorage.getItem('usertype');
			 } 
			  
			if ($rootScope.uid && $rootScope.emailVerified && $rootScope.usertype == "0" ) {			
				// Resolve the promise successfully
				return $q.when()			
				
			} else {
				  // The next bit of code is asynchronously tricky.

				 console.log(window.location);
				 // $rootScope.applyhiturl = window.location.href;
				 localStorage.setItem('applyhiturl',window.location.href) 
				 
				 
				 $timeout(function() {
				  // This code runs after the authentication promise has been rejected.
				  // Go to the log-in page
				  $state.go('login')
				})

				 
				// Reject the authentication promise to prevent the state from loading
				return $q.reject()
			}
		}
		
		
  })
  .run( [ '$rootScope', function ($rootScope) {
        $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
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
    .controller('headerCtrl', function($timeout, $firebaseAuth, $rootScope, $state){
		var authObj = $firebaseAuth();		
		
		this.userLogout = function(){
			authObj.$signOut();
			$rootScope.user = null;
			localStorage.clear();
			$state.go('login', {}, {reload: true});
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

vcancyApp.controller('loginCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$location',function($scope,$firebaseAuth,$state,$rootScope,$location) {
		var vm = this;
        //Status
        vm.login = 1;
        vm.register = 0;
        vm.forgot = 0;
		$rootScope.invalid = '';
		$rootScope.error = '';
		$rootScope.success = '';
		
		vm.loginUser = function($user){
			var email = $user.email;
			var password = $user.password;
			
			var authObj = $firebaseAuth();
			authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {			 
				 //alert(JSON.stringify(firebase.auth().currentUser));
				 if(firebase.auth().currentUser != null){
					 localStorage.setItem('userID', firebase.auth().currentUser.uid);
					 localStorage.setItem('userEmail', firebase.auth().currentUser.email);
					 localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
					 localStorage.setItem('password', password);
					 
				 } 

				 if(firebase.auth().currentUser != null){
					 $rootScope.uid = firebase.auth().currentUser.uid;
					 $rootScope.userEmail = firebase.auth().currentUser.email;
					 $rootScope.emailVerified = firebase.auth().currentUser.emailVerified;
					 $rootScope.password = firebase.auth().currentUser.password;

				 } 
				 
				 if(!firebase.auth().currentUser.emailVerified){
					$rootScope.error = 'Your new email is not verified. Please try again after verifying your email.';
					$rootScope.invalid = '';
					authObj.$signOut();
					$rootScope.user = null;
					localStorage.clear();
					$state.go('login');
				 } else {			 
					 firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function(userdata) {
					   if(userdata.val().usertype === 0){
							$rootScope.usertype = 0;
							localStorage.setItem('usertype', 0);
							console.log("Signed in as tenant:", firebaseUser.uid);
                                                
							if(localStorage.getItem('applyhiturl') != undefined && localStorage.getItem('applyhiturl').indexOf("applyproperty") !== -1){
								window.location.href = localStorage.getItem('applyhiturl');
								localStorage.setItem('applyhiturl','');
							} else {
								$state.go("tenantdashboard");  
							} 
					   } else {    
							$rootScope.usertype = 1;
							localStorage.setItem('usertype', 1);
							console.log("Signed in as landlord:", firebaseUser.uid);
							$state.go("landlorddashboard");
					   }
					 });
				 }
				 
			}).catch(function(error) {
				if(error.message){
					$rootScope.error = error.message;
				} 
								
				if(error.code === "auth/invalid-email"){
					$rootScope.invalid = 'loginemail';
				} else if(error.code === "auth/wrong-password"){
					$rootScope.invalid = 'loginpwd';				
				} else if(error.code === "auth/user-not-found"){
					$rootScope.invalid = 'all';					
				} else {
					console.log('hre');
					$rootScope.invalid = '';
				}
			});
			 
		}
		
		vm.registerUser = function(reguser){
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
			
			if(cpass === pass){
				reguserObj.$createUserWithEmailAndPassword(email, pass)
					.then(function(firebaseUser) {
					// $scope.$apply(function(){
						firebaseUser.sendEmailVerification().then(function() {
							// console.log("Email Sent");
						}).catch(function(error) {
							// console.log("Error in sending email"+error);
						});
												
						var reguserdbObj = firebase.database();
						reguserdbObj.ref('users/' + firebaseUser.uid).set({
						firstname: first,
						lastname: last,
						usertype : usertype,
						email : email
					  });				  
					$rootScope.success = 'Your account has been created and an email has been sent. Please verify your email to Log In!';
					$rootScope.error = '';			
					reguser.first = '';
					reguser.last = '';
					reguser.email = '';
					reguser.pass = ''; 
					reguser.cpass = ''; 
					reguser.usertype = -1;
					vm.reguser = reguser;
					
					// When apply property url hit direct login and redirect to apply link url on signup successful
					if(localStorage.getItem('applyhiturl') != undefined && localStorage.getItem('applyhiturl').indexOf("applyproperty") !== -1 && usertype === 0 ){
						var authObj = $firebaseAuth();
						authObj.$signInWithEmailAndPassword(email, pass).then(function(firebaseUser) {
							 if(firebase.auth().currentUser != null){
								 localStorage.setItem('userID', firebase.auth().currentUser.uid);
								 localStorage.setItem('userEmail', firebase.auth().currentUser.email);
								 localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
							 } 

							 if(firebase.auth().currentUser != null){
								 $rootScope.uid = firebase.auth().currentUser.uid;
								 $rootScope.userEmail = firebase.auth().currentUser.email;
								 $rootScope.emailVerified = firebase.auth().currentUser.emailVerified;
							 } 
							
							firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function(userdata) {
							   if(userdata.val().usertype === 0){
									$rootScope.usertype = 0;
									localStorage.setItem('usertype', 0);
									console.log("Signed in as tenant:", firebaseUser.uid);
									
									window.location.href = localStorage.getItem('applyhiturl');
									localStorage.setItem('applyhiturl','');
							   } 
							 });
						});
					}		
					// Ends Here
					// });
				  }).catch(function(error) {
					if(error.message){
						$rootScope.error = error.message;
						$rootScope.success = '';
					} 		
					
					if(error.code === "auth/invalid-email"){
						$rootScope.invalid = 'regemail';
					} else if(error.code === "auth/weak-password"){
						$rootScope.invalid = 'regpwd';					
					}  else {
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
		
		vm.forgotpwdmail = function(forgot){
			var email = forgot.email;
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';
			
			var forgotuserObj = $firebaseAuth();
			forgotuserObj.$sendPasswordResetEmail(email).then(function() {
				$rootScope.success = 'Password reset email sent in your inbox. Please check your email.';
				$rootScope.error = '';
				vm.forgotuser.email = '';		
			}).catch(function(error) {
				console.error("Error: ", error);
				if(error.message){
					$rootScope.error = error.message;
					$rootScope.success = '';
				} 
			});
				
		}
		
}]);

'use strict';

//=================================================
// PROPERTY
//=================================================

vcancyApp.controller('propertyCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','slotsBuildService','emailSendingService','$http', function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, slotsBuildService, emailSendingService, $http) {
	$rootScope.invalid = '';
	$rootScope.success = '';
	$rootScope.error = '';	
	
	var todaydate = new Date();	
	var dateconfig = new Date(new Date().setMinutes( 0 ));
	console.log(dateconfig,todaydate);
	
	var vm = this;
	vm.propsavail = 1;
	vm.timeslotmodified = "false";
	vm.isDisabled = false;
	vm.googleAddress = 0;
	var oldtimeSlotLen = 0;
	// console.log(vm.isDisabled);	
	
	firebase.database().ref('users/'+localStorage.getItem('userID')).once("value", function(snap) {
		vm.landlordname = snap.val().firstname+" "+snap.val().lastname;			
	});
	
	$scope.$on('gmPlacesAutocomplete::placeChanged', function(){
      var address = vm.prop.address.getPlace();
	  vm.googleAddress = 1;
	  vm.prop.address = address.formatted_address;
	  vm.addresschange();
	  $scope.$apply();
	});
	
	vm.copy = "Copy Link";		
	$scope.copySuccess = function(e) {
		console.info('Action:', e.action);
		console.info('Text:', e.text);
		console.info('Trigger:', e.trigger);
		vm.copy = "Copied";	
		$scope.$apply();
	};
		
	// timeSlot for Date and Timepicker
	vm.addTimeSlot = function(slotlen){
		// console.log(slotlen);
		for(var i=0; i<slotlen; i++){
			vm.newTime = false;		
		}
		
		vm.timeSlot.push({date:dateconfig});
		vm.prop.multiple[slotlen] = true;
		vm.newTime = true;
		console.log(vm.newTime);
	}
	
	// to remove timeslots
	vm.removeTimeSlot = function(slotindex){
		if(vm.timeSlot.length == 1){
			
		} else {
			if($state.current.name == 'editprop') {
				if ($window.confirm("Are you sure you want to delete this viewing slot? "))  {	
					if(slotindex < oldtimeSlotLen){
						vm.timeslotmodified = "true";
					} 
					vm.timeSlot.splice(slotindex,1);
					vm.prop.date.splice(slotindex,1);
					vm.prop.fromtime.splice(slotindex,1);
					vm.prop.to.splice(slotindex,1);
					vm.prop.limit.splice(slotindex,1);	
					vm.prop.multiple.splice(slotindex,1);
				}			
			} else {
				vm.timeSlot.splice(slotindex,1);
				vm.prop.date.splice(slotindex,1);
				vm.prop.fromtime.splice(slotindex,1);
				vm.prop.to.splice(slotindex,1);
				vm.prop.limit.splice(slotindex,1);	
				vm.prop.multiple.splice(slotindex,1);
			}
		}		
				
	}
	
	// DATEPICKER
	vm.today = function() {
		vm.dt = new Date();
	};
	vm.today();

	vm.toggleMin = function() {
		vm.minDate = vm.minDate ? null : new Date();
	};
	vm.toggleMin();

	vm.open = function($event, opened) {
		$event.preventDefault();
		$event.stopPropagation();
		angular.forEach(vm.timeSlot, function(value, key) {
		  value.opened = false;
		});
		opened.opened = true;
	};
	
	vm.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	vm.format = vm.formats[0];
		
	vm.timeopen = function($event,opened) {
		$event.preventDefault();
		$event.stopPropagation();
		angular.forEach(vm.timeSlot, function(value, key) {
		  value.opened = false;
		});
		vm.opened = true;
	  }; 
	
	//  TIMEPICKER
	vm.mytime = new Date();
	
	vm.hstep = 1;
	vm.mstep = 5;
	
	vm.options = {
		hstep: [1, 2, 3],
		mstep: [1, 5, 10, 15, 25, 30]
	};

	vm.minDate = new Date();
	
	vm.newTime = false;
	
	vm.ismeridian = true;
	
	vm.toggleMode = function() {
		vm.ismeridian = ! vm.ismeridian;
	};

	vm.update = function() {
		var d = new Date();
		d.setHours( 14 );
		d.setMinutes( 0 );
		vm.mytime = d;
	};
	
	
	vm.addresschange = function(){
		console.log(vm.prop.address);
		if(vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)){
			vm.isDisabled = false;
		} else {
			vm.isDisabled = true;
		}
		
		vm.datetimeslotchanged(0);
	}
	
	vm.datetimeslotchanged = function (key) {		
		if(key < oldtimeSlotLen){
			vm.timeslotmodified = "true";
		} 
		if(vm.prop.fromtime[key] === undefined){
			var fromtime  =  dateconfig;			
		} else {
			var fromtime= vm.prop.fromtime[key];	
		}
		
		if(vm.prop.to[key] === undefined){
			var to = dateconfig;	
		} else {
			var to = vm.prop.to[key];	
		}		
		
		vm.overlap = 0;			
		
		for (var i = 0; i < vm.prop.date.length ; i++) {
			// console.log(i,key);
			if(i != key){
				if(vm.prop.fromtime[i] === undefined){
					var ftime  =  dateconfig;			
				} else {
					var ftime= vm.prop.fromtime[i];	
				}
				
				if(vm.prop.to[i] === undefined){
					var totime = dateconfig;	
				} else {
					var totime = vm.prop.to[i];	
				}
				
				console.log(fromtime > ftime , to > ftime,fromtime > totime , to > totime)	;			
				
				if ((moment(fromtime).format('HH:mm') <= moment(ftime).format('HH:mm') && moment(to).format('HH:mm') <= moment(ftime).format('HH:mm') && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) || (moment(fromtime).format('HH:mm') >= moment(totime).format('HH:mm') && moment(to).format('HH:mm') >= moment(totime).format('HH:mm') && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) || moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isBefore(moment(vm.prop.date[i]).format('DD-MMMM-YYYY')) || moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isAfter(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) {
					
				} else { 
					vm.overlap = 1;
				}
			}
		}
		console.log(vm.overlap);
	
		if(vm.overlap == 1) {
			vm.prop.timeoverlapinvalid[key] = 1;
			vm.isDisabled = true;
		} else {
			vm.prop.timeoverlapinvalid[key] = 0;
		}
		
		var temp = new Date(fromtime.getTime() + 30 * 60000)
		// console.log(moment(to).format('HH:mm'),moment(temp).format('HH:mm'));
		if (moment(to).format('HH:mm') < moment(temp).format('HH:mm') && vm.prop.timeoverlapinvalid[key] == 0) {
			vm.prop.timeinvalid[key] = 1;
			vm.isDisabled = true;
		} else {
			vm.prop.timeinvalid[key] = 0;
		}
				
		// console.log(vm.prop.multiple[key],fromtime,to);
		
		if((vm.prop.multiple[key] === false || vm.prop.multiple[key] === undefined) && vm.prop.timeinvalid[key] == 0){
			var minutestimediff = (to - fromtime)/ 60000;
			var subslots = Math.floor(Math.ceil(minutestimediff)/30);				
			// console.log(minutestimediff,subslots);
			
			if(vm.prop.limit[key] > subslots ){
				vm.prop.invalid[key] = 1;
				vm.isDisabled = true;
			} else {
				vm.prop.invalid[key] = 0;
				if(vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)){
					vm.isDisabled = false;
				} else {
					vm.isDisabled = true;
				}
			}
		} else if((vm.prop.multiple[key] === true) && vm.prop.timeinvalid[key] == 0){
			vm.prop.invalid[key] = 0;
			vm.isDisabled = false;
		}
	}

	vm.clear = function() {
		vm.mytime = null;
	};
		
	// Go Back To View Property
	vm.backtoviewprop = function(){
		$state.go('viewprop');
	}	
	
	// Add/Edit Property		
	vm.submitProp = function(property){		
		var r = confirm("Your unique property link is generated, please click on edit property and copy the link at the bottom");
		if (r == true) {
		    
		
			vm.loader = 1;
			var propID = property.propID;
			var propimg = $('#propimg').val();	
			var propstatus = property.propstatus  == '' ? false : property.propstatus ; 
			var proptype = property.proptype;
			var units = property.units;
			var shared = property.shared  == '' ? false : property.shared ; 
			var address = property.address; 
			var rent = property.rent; 
			var landlordID = localStorage.getItem('userID');
			var date = [];
			var fromtime = [];
			var to = [];
			var limit = [];	
			var multiple = [];		
			angular.forEach(property.limit, function(lval, key) {
				date[key] = property.date[key].toString();
				if(property.fromtime[key] === undefined){
					fromtime[key]  =  dateconfig.toString();				
				} else {
					fromtime[key] = property.fromtime[key].toString();					
				}
				
				if(property.to[key] === undefined){
					to[key] = dateconfig.toString();	
				} else {
					to[key] = property.to[key].toString();	
				}			
				multiple[key] = property.multiple[key]   == '' ? false : property.multiple[key];
				limit[key] = lval;
			});
						
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';
			
			var propertyObj = $firebaseAuth();
			
			var propdbObj = firebase.database();
		if(propID == ''){	
			propdbObj.ref('properties/').push().set({	
				landlordID: landlordID,
				propimg: propimg,
				propstatus: propstatus,
				proptype: proptype,
				units: units,
				rent: rent,
				shared: shared, 
				address: address, 
				date: date,
				fromtime: fromtime,
				to: to,
				multiple: multiple,
				limit: limit
			}).then(function(){
			  //Generate the property link
			  propdbObj.ref('properties/').limitToLast(1).once("child_added", function (snapshot) {
				
				if(snapshot.key != "undefined"){
					var propertylink = "http://www.vcancy.ca/login/#/applyproperty/"+snapshot.key;
					vm.prop.propertylink = propertylink;	
					
					// link generated and property added message
					localStorage.setItem('propertysuccessmsg','Property added successfully. Property Link is also generated.');
					$window.scrollTo(0, 0);
					
					vm.prop.propertylink = propertylink;				
					$('#propertylink').val(propertylink);	
					
					// update the property link to property table
					propdbObj.ref('properties/'+snapshot.key).update({	
						propertylink: propertylink
					})
					
					var emailData = '<p>Hello, </p><p>Thanks for adding your rental property '+address+',</p><p> Here’s your dedicated property link:</p><p>'+propertylink+'</p><p>Share this link on your online listing, social media, email and with any perspective tenant.</p><p>Please don’t delete this email for future use.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
					
					// Send Email
					emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Your rental property link', 'addproperty', emailData);
					
					$state.go('viewprop');
					
				// reset the add property form
				vm.timeSlot = [{date:dateconfig}];
				$scope.$apply(function(){
					vm.prop = {
						propID: '',
						landlordID: '',
						propimg : ' ',
						propstatus : '',
						proptype : '',
						units : '',
						multiple: [],
						rent: '',
						shared : '',	
						address : '',
						date : [],
						fromtime : [],
						to : [],
						limit : [],
						propertylink: ''
					}
					$('#propertylink').val('');
				});
				}				
			  })
			});
		} else {
			if(vm.timeslotmodified == "true"){
				 var confirmAns = $window.confirm("Are you sure you want to change timeslots? Any changes will result in time slots being canceled at the renters’ end.");
			} else {				
				var confirmAns = true;
			}
			if(confirmAns == true){
				propdbObj.ref('properties/'+propID).update({
						propimg: propimg,
						propstatus: propstatus,
						proptype: proptype,
						units: units,
						rent: rent,
						shared: shared, 
						multiple: multiple,
						address: address, 
						date: date,
						fromtime: fromtime,
						to: to,
						limit: limit
				}).then(function(){
					firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snap) {
						if(snap.val() != null) {								
							$.map(snap.val(), function(v, k) {
								firebase.database().ref('applyprop/'+k).update({
									address: address,
									units: units
								});
							});
						}
					});
					
					vm.slots = slotsBuildService.maketimeslots(date,fromtime,to,limit,multiple);
					
					firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
						$scope.$apply(function(){
							vm.appliedslots = [];
							vm.scheduleIDs = [];
							vm.tenants = [];
							
							if(snapshot.val() != null){
								vm.appliedslots = $.map(snapshot.val(), function(value, index) {							
									if(value.schedulestatus !== "cancelled" && value.schedulestatus !== "submitted"){	
										vm.scheduleIDs.push(index);
										vm.tenants.push(index);
										return [{date:value.dateslot, fromtime:moment(value.fromtimeslot).format('HH:mm'), to:moment(value.toslot).format('HH:mm'),scheduleID:index}];				
									}
								});
							}
							
							console.log(vm.scheduleIDs);
							// console.log(vm.appliedslots);	
							
							if(propstatus != false)	{
								for (var i = 0; i < vm.slots.length; i++) {
									for (var j = 0; j < vm.appliedslots.length; j++) {
										if (moment(vm.slots[i].date).format('DD-MMMM-YYYY') == vm.appliedslots[j].date &&  moment(vm.slots[i].fromtime).format('HH:mm') == vm.appliedslots[j].fromtime && moment(vm.slots[i].to).format('HH:mm') == vm.appliedslots[j].to) {					
											var index = vm.scheduleIDs.indexOf(vm.appliedslots[j].scheduleID);
											if (index > -1) {
											   vm.scheduleIDs.splice(index, 1);
											   vm.tenants.splice(index, 1);
											}
										} 
									}
								}	
							} 				
							
							// link generated and property added message
							localStorage.setItem('propertysuccessmsg','Property updated successfully.');
							angular.forEach(vm.scheduleIDs, function(value, key) {
								firebase.database().ref('applyprop/'+value).update({	
									schedulestatus: "cancelled"
								})
								// console.log(value);
							});		

							if(propstatus === false){
								var emailData = '<p>Hello, </p><p>'+address+' been successfully <strong>deactivated</strong>.</p><p>You will no longer receive viewing requests and rental applications.</p><p>To make changes or reactivate, please log in http://www.vcancy.ca/login/#/ and go to “My Properties”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
									
								// Send Email
								emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), address+' has been deactivated', 'deactivateproperty', emailData);
						 
								angular.forEach(vm.tenants, function(tenantID, key) {
									firebase.database().ref('users/'+tenantID).once("value", function(snap) {
										var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has deactivated this property.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
									
										// Send Email
										emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'delproperty', emailData);
									});
								});
							} else {
								var emailData = '<p>Hello, </p><p>Your property <em>'+address+'</em>   has been successfully updated and all your property viewings affected by the updated time slots are cancelled. </p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
										
								// Send Email
								emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Property Time Slots updated on Vcancy', 'updateproperty', emailData);
						 
								angular.forEach(vm.tenants, function(tenantID, key) {
									firebase.database().ref('users/'+tenantID).once("value", function(snap) {
										var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has made some changes in time slots for this property.</p><p>To reschedule the viewing and book some another available time, please log in http://www.vcancy.ca/login/#/ and use the link initially provided to schedule the viewing or follow the link http://www.vcancy.ca/login/#/applyproperty/'+$stateParams.propId+'.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
									
										// Send Email
										emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'updateproperty', emailData);
									});
								});
							}

								
							$state.go('viewprop');
						});	
					});	
					
					$window.scrollTo(0, 0);
				})
			} else {
				vm.loader = 0;				
				$state.reload();
			}
		}

		} else {
		    return false;
		}
	}
	
	
	// View Property
	if($state.current.name == 'viewprop') {
		vm.loader = 1;
		var landlordID = localStorage.getItem('userID');
		var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			$scope.$apply(function(){
				vm.success = 0;
				if(snapshot.val()) {
			 		vm.viewprops = snapshot.val();
			 		vm.propsavail = 1;
					vm.propsuccess = localStorage.getItem('propertysuccessmsg');
				}
			 	else {
			 		vm.propsavail = 0;
					vm.propsuccess = localStorage.getItem('propertysuccessmsg');
			 	}
				vm.loader = 0;
				// console.log($rootScope.$previousState.name);
				if(($rootScope.$previousState.name == "editprop" || $rootScope.$previousState.name == "addprop") && vm.propsuccess != ''){
					vm.success = 1;
				}
				localStorage.setItem('propertysuccessmsg','')
			});
		   
		});
	
		vm.toggleSwitch = function(key){
			// console.log(key);
			console.log(vm.viewprops[key].propstatus);	
			var propstatus = !vm.viewprops[key].propstatus;
			console.log(!vm.viewprops[key].propstatus);	
			
			firebase.database().ref('properties/'+key).once("value", function(snap) {
				vm.property_address = snap.val().address;
			});
			
			// update the property status to property table
			firebase.database().ref('properties/'+key).update({	
				propstatus: propstatus
			})
			
			if(!vm.viewprops[key].propstatus == false) {
				firebase.database().ref('applyprop/').orderByChild("propID").equalTo(key).once("value", function(snapshot) {	
					$scope.$apply(function(){
						vm.scheduleIDs = [];
						vm.tenants = [];
						
						if(snapshot.val() != null){
							$.map(snapshot.val(), function(value, index) {							
								if(value.schedulestatus !== "cancelled" && value.schedulestatus !== "submitted"){	
									vm.scheduleIDs.push(index);	
									vm.tenants.push(value.tenantID);
								}
							});
						}
						
						angular.forEach(vm.scheduleIDs, function(value, key) {
							firebase.database().ref('applyprop/'+value).update({	
								schedulestatus: "cancelled"
							})
							// console.log(value);
						});	

						var emailData = '<p>Hello, </p><p>'+vm.property_address+' been successfully <strong>deactivated</strong>.</p><p>You will no longer receive viewing requests and rental applications.</p><p>To make changes or reactivate, please log in http://www.vcancy.ca/login/#/ and go to “My Properties”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
									
						// Send Email
						emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address+' has been deactivated', 'deactivateproperty', emailData);
				 
						angular.forEach(vm.tenants, function(tenantID, key) {
							firebase.database().ref('users/'+tenantID).once("value", function(snap) {
								var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has deactivated this property.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
							
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
	if($state.current.name == 'editprop') {
		vm.mode = 'Edit';
		vm.submitaction = "Update";
		vm.otheraction = "Delete";
		var ref = firebase.database().ref("/properties/"+$stateParams.propId).once('value').then(function(snapshot) {
		  var propData = snapshot.val();
		  vm.timeSlot = [];
		  $scope.$apply(function(){
				vm.prop = {
					propID: snapshot.key,
					landlordID: propData.landlordID,
					propimg : propData.propimg,
					propstatus : propData.propstatus,
					proptype : propData.proptype,
					units : propData.units,
					rent: propData.rent,
					shared : propData.shared,
					address : propData.address,
					multiple: [],
					date : [],
					fromtime : [],
					to : [],
					limit : [],
					propertylink: propData.propertylink,
					invalid: [0],
					timeinvalid: [0],
					timeoverlapinvalid: [0]
				}
				angular.forEach(propData.date, function(value, key) {
				  vm.timeSlot.push({date: new Date(value)});
				  vm.prop.date.push(new Date(value));
				  vm.prop.fromtime.push(new Date(propData.fromtime[key]));
				  vm.prop.to.push(new Date(propData.to[key]));
				  vm.prop.limit.push(propData.limit[key]);
				  vm.prop.multiple.push(propData.multiple[key]);				  
				});
				vm.addresschange();		
				oldtimeSlotLen = vm.timeSlot.length;
				vm.unitsOptional();
			});
		});
	} else {
		vm.mode = 'Add';
		vm.submitaction = "Save";		
		vm.otheraction = "Cancel";
		vm.timeSlot = [{date:dateconfig}];
		vm.prop = {
			propID: '',
			landlordID: '',
			propimg : '',
			propstatus : true,
			proptype : '',
			units : '',
			multiple: [true],
			rent: '',
			shared : '',
			address : '',
			date : [],
			fromtime : [],
			to : [],
			limit : [],
			propertylink: '',
			invalid: [0],
			timeinvalid: [0],
			timeoverlapinvalid: [0]
		}

	}
	
	
	
	// Delete Property Permanently
	this.delprop = function(propID){
		var propertyObj = $firebaseAuth();
		var propdbObj = firebase.database();
		
		firebase.database().ref('properties/'+propID).once("value", function(snap) {
			vm.property_address = snap.val().address;
			
			if ($window.confirm("Do you want to continue?"))  {
				propdbObj.ref('properties/'+propID).remove();
				
				firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
					$scope.$apply(function(){
						vm.scheduleIDs = [];
						vm.tenants = [];
						
						if(snapshot.val() != null){
							$.map(snapshot.val(), function(value, index) {	
								vm.scheduleIDs.push(index);	
								vm.tenants.push(value.tenantID);
							});
						}
						angular.forEach(vm.scheduleIDs, function(value, key) {
							firebase.database().ref('applyprop/'+value).update({	
								schedulestatus: "removed"
							})
						});	
						
						var emailData = '<p style="margin: 10px auto;"><h2>Hi '+vm.landlordname+',</h2><br> Your property <em>'+vm.property_address+'</em> has been successfully deleted and all viewings related to this property are also removed.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
									
						// Send Email
						emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address+' has been deleted', 'delproperty', emailData);
				 
						angular.forEach(vm.tenants, function(tenantID, key) {
							firebase.database().ref('users/'+tenantID).once("value", function(snap) {
								var emailData = '<p style="margin: 10px auto;"><h2>Hi '+snap.val().firstname+' '+snap.val().lastname+',</h2><br> Your viewing request on property <em>'+vm.property_address+'</em> has been removed as landlord has deleted his property.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
							
								// Send Email
								emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request removed from Vcancy', 'delproperty', emailData);
							});
						});
					})
					$state.go('viewprop');
				})
			}
		});
	}
	
	// Units to be optional when house is selected
	this.unitsOptional = function(proptype){
		console.log(vm.prop.units);
		if(vm.prop.proptype == proptype && (vm.prop.units == '' || vm.prop.units == undefined)){
			vm.prop.units = ' ';
		} else if(vm.prop.proptype != proptype && (vm.prop.units == '' || vm.prop.units == undefined)){
			vm.prop.units = '';
		}
	}
	
	this.unitsClear = function(proptype){
		console.log(vm.prop.units);
		if(vm.prop.proptype == proptype && (vm.prop.units == '' || vm.prop.units == undefined)){
			vm.prop.units = ' ';
		} 
	}
}])
	
	
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

vcancyApp.controller('applypropCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','slotsBuildService','emailSendingService',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window,$filter,slotsBuildService,emailSendingService) {
	
	var vm = this;
	vm.emailVerifiedError = '';
	var tenantID = localStorage.getItem('userID');
	vm.propinactive = 0;
	
	firebase.database().ref('users/'+localStorage.getItem('userID')).once("value", function(snapval) {	
		var userData = snapval.val();
	  	$scope.$apply(function(){
	  		// console.log(userData);
	  		vm.userName = userData.firstname + ' ' +userData.lastname;
	  	});
	 });
	// console.log(localStorage.getItem('userEmailVerified'));
	if(localStorage.getItem('userEmailVerified') == "false" || !$rootScope.emailVerified ){
		vm.isEmailVerified = 1;
	} else {
		vm.isEmailVerified = 0;
	}
	// console.log(vm.isEmailVerified);
	
	// Fetching property Data
	var ref = firebase.database().ref("/properties/"+$stateParams.propId).once('value').then(function(snap) {
		var propData = snap.val();
		if(propData == null){
			$state.go('tenantdashboard');
		} else {
			vm.timeSlot = [];
			vm.slots = [];
			$scope.$apply(function(){
				vm.applyprop = {
					propID: snap.key,
					landlordID: propData.landlordID,
					propimg : propData.propimg,
					propstatus : propData.propstatus,
					proptype : propData.proptype,
					units : propData.units,
					shared : propData.shared,
					address : propData.address,
					date : [],
					fromtime : [],
					to : [],
					limit : [],
					multiple: [],
					propertylink: propData.propertylink,
					name : vm.userName
				}
				angular.forEach(propData.date, function(value, key) {
					console.log(propData);
				  vm.applyprop.date.push(value);
				  vm.applyprop.fromtime.push(propData.fromtime[key]);
				  vm.applyprop.to.push(propData.to[key]);
				  vm.applyprop.limit.push(propData.limit[key]);
				  
				  if(propData.multiple) {
					vm.applyprop.multiple.push(propData.multiple[key]);
				  }
				  
				});
			
				vm.applyprop.slots = slotsBuildService.maketimeslots(vm.applyprop.date,vm.applyprop.fromtime,vm.applyprop.to,vm.applyprop.limit,vm.applyprop.multiple);
				
				// If property is inactive tenant can't apply for the application
				if(vm.applyprop.propstatus == false){
					// $state.go('tenantdashboard');
					vm.propinactive = 1;
				}
			});
		}
		
		
		
		firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
			$scope.$apply(function(){
				console.log(snapshot.val());
					
				vm.alreadyBookedSlot = 0;
				vm.appliedslots = [];
				vm.applyprop.availableslots = [];
				vm.timeslotavail = 0;
				
				
				if(snapshot.val() != null){
					$.map(snapshot.val(), function(value, index) {
						if(value.tenantID == localStorage.getItem('userID') && value.schedulestatus !== "cancelled"){
							vm.alreadyBookedSlot = 1;
						}
					 });
				
					vm.appliedslots = $.map(snapshot.val(), function(value, index) {			
						if(value.schedulestatus !== "cancelled"){
							return [{date:value.dateslot, fromtime:moment(value.fromtimeslot).format('HH:mm'), to:moment(value.toslot).format('HH:mm'), person:1}];
						}						
					});
					 
					console.log(vm.applyprop.slots);
					console.log(vm.appliedslots);	
					// console.log(vm.appliedslots.length);
						
					for (var i = 0; i < vm.applyprop.slots.length; i++) {
						for (var j = 0; j < vm.appliedslots.length; j++) {
							if (moment(vm.applyprop.slots[i].date).format('DD-MMMM-YYYY') == vm.appliedslots[j].date &&  moment(vm.applyprop.slots[i].fromtime).format('HH:mm') == vm.appliedslots[j].fromtime && moment(vm.applyprop.slots[i].to).format('HH:mm') == vm.appliedslots[j].to && vm.applyprop.slots[i].multiple == false) {
								vm.applyprop.slots[i].person = 0;
								
								for (var l = 0; l < vm.applyprop.slots.length; l++) {
									if(vm.applyprop.slots[l].dateslotindex == vm.applyprop.slots[i].dateslotindex && l != i){
										vm.applyprop.slots[l].person -=1;
									}
								}
								
							}
							
							if (moment(vm.applyprop.slots[i].date).format('DD-MMMM-YYYY') == vm.appliedslots[j].date &&  moment(vm.applyprop.slots[i].fromtime).format('HH:mm') == vm.appliedslots[j].fromtime && moment(vm.applyprop.slots[i].to).format('HH:mm') == vm.appliedslots[j].to && vm.applyprop.slots[i].multiple == true ) {
								for (var l = 0; l < vm.applyprop.slots.length; l++) {
									if(vm.applyprop.slots[l].dateslotindex ==  vm.applyprop.slots[i].dateslotindex){
										vm.applyprop.slots[l].person -= 1;
									}
								}
								// break;
							}
						console.log(vm.applyprop.slots);
						}
					}
					
					
					for (var i = 0; i< vm.applyprop.slots.length; i++) {					
						if (vm.applyprop.slots[i].person > 0) {
							vm.applyprop.availableslots.push(vm.applyprop.slots[i]);
						}
						vm.timeslotavail = 1;
					}
				} else {
					vm.applyprop.availableslots = vm.applyprop.slots;
					vm.timeslotavail = 1;
				}
				console.log(vm.applyprop.availableslots, vm.applyprop.availableslots.length);
				
				for (var j = 0; j < vm.applyprop.availableslots.length; j++) {
					if (moment(moment(vm.applyprop.availableslots[j].date).format('DD-MMMM-YYYY')).isBefore(moment(new Date()).format('DD-MMMM-YYYY')) ) {
						vm.applyprop.availableslots.splice(vm.applyprop.availableslots[j]);
					}
				}
				console.log(vm.applyprop.availableslots, vm.applyprop.availableslots.length);
				
			});	
		});	
		
		firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).limitToLast(1).once("value", function(snapshot) {	
			$scope.$apply(function(){
				console.log(snapshot.val());
				if(snapshot.val() != null){
					$.map(snapshot.val(), function(value, index) {
						vm.applyprop.tenantlocation = value.tenantlocation;
						vm.applyprop.phone = value.phone;
						vm.applyprop.age = value.age; 
						vm.applyprop.jobtitle = value.jobtitle; 
						vm.applyprop.description = value.description; 
					});
				} else {
					vm.applyprop.tenantlocation = '';
					vm.applyprop.phone = '';
					vm.applyprop.age = ''; 
					vm.applyprop.jobtitle = ''; 
					vm.applyprop.description = ''; 
				}
			});
		});
		
		
		
	});
	
	
	// Property Application form - Data of tenant save		
	vm.tenantapply = function(applyprop){
		if(localStorage.getItem('userEmailVerified') !== 'false') {
			vm.emailVerifiedError = '';
			var tenantID = localStorage.getItem('userID');
			var propID = vm.applyprop.propID;
			var address = vm.applyprop.address;
			var name = vm.applyprop.name;
			var tenantlocation = vm.applyprop.tenantlocation;
			var phone = vm.applyprop.phone;
			var age = vm.applyprop.age; 
			var jobtitle = vm.applyprop.jobtitle; 
			var landlordID =  vm.applyprop.landlordID;
			var description = vm.applyprop.description; 
			var datetimeslot = vm.applyprop.datetimeslot;
			var units = vm.applyprop.units;
			var dateslot = moment(vm.applyprop.availableslots[datetimeslot].date).format('DD-MMMM-YYYY');
			var fslot = vm.applyprop.availableslots[datetimeslot].fromtime.toString();
			var tslot = vm.applyprop.availableslots[datetimeslot].to.toString();
			var timerange = moment(vm.applyprop.availableslots[datetimeslot].fromtime).format('hh:mm A')+" - "+moment(vm.applyprop.availableslots[datetimeslot].to).format('hh:mm A');
			
			// console.log(dateslot,fslot,tslot);
			
			
			var applypropObj = $firebaseAuth();			
			var applypropdbObj = firebase.database();
			
			applypropdbObj.ref('applyprop/').push().set({
				tenantID: tenantID,
				propID : propID,
				address: address,
				schedulestatus: "pending",
				name : name,
				tenantlocation : tenantlocation,
				phone: phone,
				age : age, 
				datetimeslot : datetimeslot,
				dateslot : dateslot,
				fromtimeslot : fslot,
				toslot : tslot,
				jobtitle : jobtitle, 
				landlordID :  landlordID,
				description : description, 
				timerange: timerange,
				units: units
			}).then(function(){
				$state.go('applicationThanks');
				// $rootScope.success = 'Application for property successfully sent!';	
				console.log('Application for property successfully sent!');
				
				firebase.database().ref('users/'+landlordID).once("value", function(snapshot) {
					// Mail to Landlord
					var emailData = '<p>Hello, </p><p>'+name+' has requested a viewing at '+dateslot+', '+timerange+'for '+address+'.</p><p>To accept this invitation and view renter details, please log in http://www.vcancy.ca/login/#/ and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
					// Send Email
					emailSendingService.sendEmailViaNodeMailer(snapshot.val().email, name+' has requested a viewing for '+address, 'newviewingreq', emailData);
				});
				
				// Mail to Tenant
				var emailData = '<p>Hello '+name+', </p><p>Your viewing request for '+address+' at '+dateslot+', '+timerange+' has been sent.</p><p>To view your requests, please log in http://www.vcancy.ca/login/#/ and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
				// Send Email
				emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Viewing request for '+address, 'viewingreq', emailData);
			})	
		} else {
			vm.emailVerifiedError = 'Email not verified yet. Please verify email to schedule a slot.'
		}
	}

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
					var emailData = '<p>Hello '+snapshot.val().name+', </p><p>Your viewing request for '+snapshot.val().address+' at '+snapshot.val().dateslot+', '+snapshot.val().timerange+' has been accepted.</p><p>If you wish you complete your rental application beforehand, please log in  http://www.vcancy.ca/login/#/ and go to “Applications”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
					
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
						var emailData = '<p>Hello '+snapshot.val().name+', </p><p>Your viewing time '+snapshot.val().dateslot+', '+snapshot.val().timerange+' has been been <strong>cancelled</strong> by the landlord of '+snapshot.val().address+'.</p><p>Please book another time using the link initially provided or contact the landlord directly.</p><p>To view details, please <a href="http://www.vcancy.ca/login/#/"> log in </a>  and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
						
						emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your viewing has been cancelled for '+snapshot.val().address, 'cancelstatus', emailData);
					});
				});
				$state.reload();
			}
		}
}])
'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
    .controller('tenantscheduleCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams','emailSendingService',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams,emailSendingService) {
		
		var vm = this;
		vm.showCal = false;
		var tenantID = localStorage.getItem('userID');
		vm.loader = 1;
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val() !== null) {
					vm.calendardata = $.map(snapshot.val(), function(value, index) {
						if(value.schedulestatus == "confirmed") {
							if(value.units === ' '){
								var units = '';
							} else {
								var units = value.units+" - ";								
							}
							return [{scheduleID:index, className: 'bgm-cyan', title: units+value.address, start: new Date(value.dateslot)}];
						}
					});						
					
					// vm.calendardata = [{scheduleID:"-KvaDdFDac3A_apLY-ce",className:"bgm-cyan",title:"Active kl",start:"24-September-2017"}]
					$scope.calendardata = vm.calendardata;
					
					console.log($scope.calendardata);
					vm.schedulesavail = 0;
					
					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function(value, index) {
						if(value.schedulestatus !== "removed") {
							vm.schedulesavail = 1;
							if(value.units === ' '){
								var units = '';
							} else {
								var units = value.units+" - ";								
							}
							return [{scheduleID:index, address:units+value.address, dateslot: value.dateslot, timerange: value.timerange,  schedulestatus: value.schedulestatus}];
						} 
					});	
					
					vm.extracols = [
							{ field: "", title: "", show: true}
						];	
					
				} else {
					vm.tabledata = [{scheduleID:'', address:'', dateslot: '', timerange: '',  schedulestatus: ''}];						
					vm.calendardata = [{scheduleID:'', className: 'bgm-cyan', title:'', start: ''}]						
					$scope.calendardata = vm.calendardata;					
					vm.schedulesavail = 0;
				}
					
				vm.cols = [
					  { field: "address", title: "Address", sortable: "address", show: true },
					  { field: "dateslot", title: "Date", sortable: "dateslot", show: true },					  
					  { field: "timerange", title: "Time", sortable: "timerange", show: true },
					  { field: "schedulestatus", title: "Status", sortable: "schedulestatus", show: true }
					];
					
				
				vm.loader = 0;
				
				//Sorting
				vm.tableSorting = new NgTableParams({
					sorting: {address: 'asc'}}, 
					
					{dataset: vm.tabledata
				      
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
				
				vm.showCal = true;
			});
		});
		
		vm.cancelschedule = function(index){
			// console.log(index);
			if ($window.confirm("Are you sure you want to cancel this viewing appointment?"))  {
				firebase.database().ref('applyprop/'+index).update({	
					schedulestatus: "cancelled"
				})
				
				firebase.database().ref('applyprop/'+index).once("value", function(snapshot) {
					firebase.database().ref('users/'+snapshot.val().landlordID).once("value", function(snap) {
						var emailData = '<p>Hello, </p><p>'+snapshot.val().name+' has <strong>cancelled</strong> their viewing at '+snapshot.val().dateslot+', '+snapshot.val().timerange+' for '+snapshot.val().address+'.</p><p>The time slot is now open to other renters.</p><p>To view details, please <a href="http://www.vcancy.ca/login/#/"> log in </a> and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
						
						emailSendingService.sendEmailViaNodeMailer(snap.val().email, snapshot.val().name+'has cancelled viewing for '+snapshot.val().address, 'cancelstatus', emailData);
					});
						
					var emailData = '<p>Hello '+snapshot.val().name+', </p><p>Your viewing time '+snapshot.val().dateslot+', '+snapshot.val().timerange+' has been been <strong>cancelled</strong> by the landlord of '+snapshot.val().address+'.</p><p>Please book another time using the link initially provided or contact the landlord directly.</p><p>To view details, please <a href="http://www.vcancy.ca/login/#/"> log in </a> and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
						
					emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Your viewing has been cancelled for '+snapshot.val().address, 'cancelstatus', emailData);
				});
				
				
				$state.reload();
			}
		}
}])

'use strict';

//=================================================
// Landlord Dashboard
//=================================================

vcancyApp
    .controller('landlorddboardlCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window) {
		
		var vm = this;
		var landlordID = localStorage.getItem('userID');
		vm.proplive = 0;
		vm.viewingschedule = 0;
		vm.viewed = 0;
		vm.submitapps = 0;
		
		vm.loader = 1;
		
		var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				snapshot.forEach(function(childSnapshot) {
					// console.log(childSnapshot.val().propstatus);
					
					if(childSnapshot.val().propstatus == true){
						vm.proplive += 1;
					}
					
				});
				vm.loader = 0;
			});
		   
		});
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			console.log(snapshot.val())
			$scope.$apply(function(){
				$.map(snapshot.val(), function(value, index) {
					
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isBefore(new Date()) ) {
						vm.viewed += 1;
					} 
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isAfter(new Date())) {
						vm.viewingschedule += 1;
					}
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date())  &&   moment(value.fromtimeslot).format('HH:mm') < moment(new Date()).format('HH:mm') &&  moment(value.toslot).format('HH:mm') < moment(new Date()).format('HH:mm')) {
						vm.viewed += 1;
					}
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date())  &&   moment(value.fromtimeslot).format('HH:mm') >= moment(new Date()).format('HH:mm') &&  moment(value.toslot).format('HH:mm') >= moment(new Date()).format('HH:mm')) {
						vm.viewingschedule += 1;
					}
					if(value.schedulestatus == "submitted"){
						vm.submitapps += 1;
					}
					
					
				});	
				
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
    .controller('tenantappCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		vm.loader = 1;
		vm.submittedappsavail = 0;
		vm.submitappsdata = [];	
		
		firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val() != null) {					
					vm.pendingappsavail = 0;
					
					console.log($rootScope.$previousState.name);
					if($rootScope.$previousState.name == "rentalform"){		
						$state.reload();
					}
					
					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function(value, index) {						
						if(value.schedulestatus == "confirmed" ) { // && moment(value.dateslot).isBefore(new Date())
							vm.pendingappsavail = 1;
							if(value.units === ' '){
								var units = '';
							} else {
								var units = value.units+" - ";								
							}
							return [{applicationID: 0, scheduleID:index, address: units+value.address, dateslot: value.dateslot, timerange: value.timerange,  schedulestatus: value.schedulestatus}];			
						} 
					});	
					
					// console.log(vm.tabledata);
					angular.forEach(vm.tabledata, function(schedule, key) {	
						firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function(snap) {	
							// console.log(snap.val());
							$scope.$apply(function(){
								if(snap.val() != null) {		
									$.map(snap.val(),function(val,k){
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
						sorting: {address: 'asc'}}, 
						
						{dataset: vm.tabledata

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
				
				
				if(snapshot.val() != null){
					$.map(snapshot.val(), function(val, key) {		
						firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(key).once("value", function(snap) {	
							$scope.$apply(function() {
								if(snap.val() !== null) {					
									//to map the object to array
									$.map(snap.val(), function(value, index) {	
										if(val.schedulestatus == "submitted" ){
											vm.submittedappsavail = 1;
											vm.submitappsdata.push({appID:index, address:value.address, dated: moment(value.dated).format("DD-MMMM-YYYY"), rentalstatus: value.rentalstatus});
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
					  // { field: "rentalstatus", title: "Status", sortable: "rentalstatus", show: true }
					];
					
					//Sorting
					vm.submitappsSorting = new NgTableParams({
						sorting: {address: 'asc'}}, 
					
					{dataset: vm.submitappsdata
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
				}
				
			});		
		});	
		
		firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			$scope.$apply(function(){
				if(snapshot.val() != null){
					$.map(snapshot.val(), function(value, key) {		
						if(value.scheduleID == 0 && value.externalappStatus == "draft" ){
							vm.pendingappsavail = 1;
														
							console.log($rootScope.$previousState.name);
							if($rootScope.$previousState.name == "rentalform"){		
								$state.reload();
							}
					
							if(value.address == ''){
								value.address = 'No Address Entered';
							} else {
								value.address = value.address;
							}
							
							
							vm.tabledata.push({applicationID: key,scheduleID:0, address:value.address, dateslot: value.dateslot, timerange: value.timerange,  schedulestatus: value.schedulestatus});
						}
					});
					
					vm.cols = [
					  { field: "address", title: "Address", sortable: "address", show: true },
					  { field: "dated", title: "Submitted On", sortable: "dated", show: true },
					  // { field: "rentalstatus", title: "Status", sortable: "rentalstatus", show: true }
					];
					
					// console.log(vm.tabledata);
					vm.extracols = [
						  { field: "scheduleID", title: "", show: true }
						];
						

					//Sorting
					vm.tableSorting = new NgTableParams({
						sorting: {address: 'asc'}}, 
					
					{dataset: vm.tabledata
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
					
			});
		});
		
		
		firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			$scope.$apply(function(){
				if(snapshot.val() != null){
					$.map(snapshot.val(), function(value, key) {		
						if(value.scheduleID == 0 && value.externalappStatus == "submit" ){
							vm.submittedappsavail = 1;
							vm.submitappsdata.push({appID:key, address:value.address, dated: moment(value.dated).format("DD-MMMM-YYYY"), rentalstatus: value.rentalstatus});
						}
					});
					vm.submitappsextracols = [
					  { field: "appID", title: "", show: true }
					];
					
					vm.submitappscols = [
					  { field: "address", title: "Address", sortable: "address", show: true },
					  { field: "dated", title: "Submitted On", sortable: "dated", show: true },
					  // { field: "rentalstatus", title: "Status", sortable: "rentalstatus", show: true }
					];

					//Sorting
					vm.submitappsSorting = new NgTableParams({
						sorting: {address: 'asc'}}, 
					
					{dataset: vm.submitappsdata
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
				}			
					
			});
		});
		
		if(vm.submittedappsavail == 0) {
			// vm.submitappsdata.push({scheduleID:'', name:'', age: '', profession: '',salary: '', pets: '', maritalstatus:'', appno:'',  schedulestatus: ''});
		} else {			
			vm.loader = 0;				
		}
		
		if(vm.pendingappsavail == 0) {
			// vm.tabledata.push({scheduleID:'', address:'', dateslot: '', timerange: '',  schedulestatus: ''});
		} else {			
			vm.loader = 0;				
		}
		
									
		console.log($rootScope.$previousState.name);
		if($rootScope.$previousState.name == "rentalform"){		
			$state.reload();
		}
		
		vm.email = '';
		vm.disablebutton = 1;
		vm.emailrequired = function(event){
			if(vm.email == '' || !vm.email.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/)){
				vm.disablebutton = 1;
			} else {
				vm.disablebutton = 0;
			}
		}
		
		
		vm.gotoRental = function(event){
			if(vm.disablebutton == 0){
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
    .controller('landlordappCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var landlordID = localStorage.getItem('userID');
		vm.propcheck = [];
		vm.apppropaddress = [];
		vm.loader = 1;
		
		vm.tablefilterdata = function(propID = '') {
			if(propID !=''){
				vm.propcheck[propID] = !vm.propcheck[propID];
			}
			
			firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val() != null) {										
					$.map(snapshot.val(), function(value, index) {							
						 if(vm.apppropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus == "submitted") {
							  vm.apppropaddress.push({propID: value.propID, address: value.address, units: value.units}); 
							  vm.propcheck[value.propID] = true;
						 } 	
					});
				}
					vm.submitappsdata = [];
				
				if(snapshot.val() != null) {	
					vm.submittedappsavail = 0;
					//to map the object to array
					vm.submitappsdata = $.map(snapshot.val(), function(value, index) {
						if(vm.propcheck[value.propID] == true || propID == ''){					
							if(value.schedulestatus == "submitted" ){
								vm.submittedappsavail = 1;
								return [{scheduleID:index, name:value.name, age: value.age, profession: value.jobtitle,  schedulestatus: value.schedulestatus}];
							} 
						}
					});	
					
					angular.forEach(vm.submitappsdata, function(schedule, key) {		
						firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function(snapshot) {	
							$scope.$apply(function(){
								if(snapshot.val()) {
									$.map(snapshot.val(), function(value, index) {	
										vm.submitappsdata[key].applicationID = index;
										vm.submitappsdata[key].pets = value.pets;
										vm.submitappsdata[key].maritalstatus = value.maritalstatus;
										vm.submitappsdata[key].appno = value.applicantsno ;
										firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(index).once("value", function(snap) {	
											$scope.$apply(function(){
												if(snap.val()) {
													$.map(snap.val(), function(v, k) {
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
					vm.submitappsdata = [{scheduleID:'', name:'', age: '', profession: '',salary: '', pets: '', maritalstatus:'', appno:'',  schedulestatus: ''}];
					
					vm.submittedappsavail = 0;
				}
	
						console.log(vm.submittedappsavail);
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
					sorting: {name: 'asc'}}, 
					
					{dataset: vm.submitappsdata
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
		vm.tablefilterdata();
		
		
		
}])
'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
	.controller('rentalformCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'Upload', '$http', 'emailSendingService', 'config',
		function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, Upload, $http, emailSendingService, config) {

			var vm = this;
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

			$scope.something = function(form) {
				
		       
		       if($("#test_"+form).val() == ''){
		       	$("#index_"+form).addClass('has-error');
		       }else{
		       		$("#index_"+form).removeClass('has-error');
		       }
		    }
			$scope.minorsomething = function(form) {
				
		       
		       if($("#minortext_"+form).val() == ''){
		       	$("#minor_"+form).addClass('has-error');
		       }else{
		       		$("#minor_"+form).removeClass('has-error');
		       }
		    }

		    $scope.aacetext = function(form) {
				
		       
		       if($("#aacetext_"+form).val() == ''){
		       	$("#aace_"+form).addClass('has-error');
		       }else{
		       		$("#aace_"+form).removeClass('has-error');
		       }
		    }


		    $scope.aapotext = function(form) {
				
		       
		       if($("#aapotext_"+form).val() == ''){
		       	$("#aapo_"+form).addClass('has-error');
		       }else{
		       		$("#aapo_"+form).removeClass('has-error');
		       }
		    }

		     $scope.aaeptext = function(form) {
				
		       
		       if($("#aaeptext_"+form).val() == ''){
		       	$("#aaep_"+form).addClass('has-error');
		       }else{
		       		$("#aaep_"+form).removeClass('has-error');
		       }
		    }

		    $scope.aahowtext = function(form) {
				
		       
		       if($("#aahowtext_"+form).val() == ''){
		       	$("#aahow_"+form).addClass('has-error');
		       }else{
		       		$("#aahow_"+form).removeClass('has-error');
		       }
		    }

		    $scope.aagrstext = function(form) {
				
		       
		       if($("#aagrstext_"+form).val() == ''){
		       	$("#aagrs_"+form).addClass('has-error');
		       }else{
		       		$("#aagrs_"+form).removeClass('has-error');
		       }
		    } 

		    $scope.aaothrtext = function(form) {
				
		       
		       if($("#aaothrtext_"+form).val() == ''){
		       	$("#aaothr_"+form).addClass('has-error');
		       }else{
		       		$("#aaothr_"+form).removeClass('has-error');
		       }
		    }


			if (applicationID == 0) {
				firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).limitToLast(1).once("value", function (snapshot) {
					console.log(snapshot.val());
					$scope.$apply(function () {
						if (snapshot.val() !== null) {
							$.map(snapshot.val(), function (value, index) {
								vm.draftdata = "false";
								vm.applicationval = index;
								vm.tenantdata.tenantID = value.tenantID;
								// vm.scheduledata.scheduleID = value.scheduleID;
								// vm.propdata.propID = value.propID;
								// vm.propdata.landlordID = value.landlordID;

								// vm.propdata.address = value.address;
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
								vm.rentaldata.emergencyname = value.emergencyname;
								vm.rentaldata.emergencyphone = value.emergencyphone;
								vm.rentaldata.refone_name = value.refone_name;
								vm.rentaldata.refone_phone = value.refone_phone;
								vm.rentaldata.refone_relation = value.refone_relation;
								vm.rentaldata.reftwo_name = value.reftwo_name;
								vm.rentaldata.reftwo_phone = value.reftwo_phone;
								vm.rentaldata.reftwo_relation = value.reftwo_relation;
								vm.rentaldata.dated = value.dated != '' ? new Date(value.dated) : '';

								firebase.database().ref('applyprop/' + scheduleID).once("value", function (snapshot) {
									// console.log(snapshot.val())
									$scope.$apply(function () {
										if (snapshot.val()) {
											vm.scheduledata = snapshot.val();
											vm.scheduledata.scheduleID = snapshot.key;

											firebase.database().ref('properties/' + vm.scheduledata.propID).once("value", function (snap) {
												$scope.$apply(function () {
													if (snap.val()) {
														vm.propdata = snap.val();
														vm.propdata.propID = snap.key;
														if (vm.propdata.units == ' ') {
															var units = '';
														} else {
															var units = vm.propdata.units + " - ";
														}
														vm.propdata.address = units + vm.propdata.address;
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
											vm.tenantdata.tenantName = v.mainapplicant.applicantname;
											vm.rentaldata.dob = v.mainapplicant.applicantdob != '' ? new Date(v.mainapplicant.applicantdob) : '';
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
												vm.rentaldata.minorappdob.push(value.minorapplicantdob != '' ? new Date(value.minorapplicantdob) : '');
												vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);
											});

											angular.forEach(v.otherapplicants, function (value, key) {
												vm.adult.push(key);
												vm.rentaldata.otherappname.push(value.adultapplicantname);
												vm.rentaldata.otherappdob.push(value.adultapplicantdob != '' ? new Date(value.adultapplicantdob) : '');
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
								// console.log(snapshot.val())
								$scope.$apply(function () {
									if (snapshot.val()) {
										vm.scheduledata = snapshot.val();
										vm.scheduledata.scheduleID = snapshot.key;

										firebase.database().ref('properties/' + vm.scheduledata.propID).once("value", function (snap) {
											$scope.$apply(function () {
												if (snap.val()) {
													vm.propdata = snap.val();
													vm.propdata.propID = snap.key;
													vm.propdata.address = vm.propdata.units + " - " + vm.propdata.address;
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
							vm.rentaldata.emergencyname = value.emergencyname;
							vm.rentaldata.emergencyphone = value.emergencyphone;
							vm.rentaldata.refone_name = value.refone_name;
							vm.rentaldata.refone_phone = value.refone_phone;
							vm.rentaldata.refone_relation = value.refone_relation;
							vm.rentaldata.reftwo_name = value.reftwo_name;
							vm.rentaldata.reftwo_phone = value.reftwo_phone;
							vm.rentaldata.reftwo_relation = value.reftwo_relation;
							vm.rentaldata.dated = new Date(value.dated);

							vm.submitemail = value.externalemail;
							console.log(vm.submitemail);
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
				if($('#uploadfile')[0].files[0]) {
					var _fileName = $('#uploadfile')[0].files[0].name.toLowerCase();				
					if($('#uploadfile')[0].files[0].size > 3145728) {
						return 'File size should be 3 MB or less.'
					} else if(!(_fileName.endsWith('.png')) 
						|| !(_fileName.endsWith('.jpg'))
						|| !(_fileName.endsWith('.pdf'))
						|| !(_fileName.endsWith('.jpeg')))  {
							return 'Invalid file type.'
					}
				}
			}
			var fileCheckMsg = checkFile();
			if(fileCheckMsg) {
				return window.alert(fileCheckMsg);
			}
			var externalemail = vm.submitemail  == undefined ? '': vm.submitemail;
			console.log(externalappStatus);

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
				var filename = $('#filename').val() === '' ? '' : $('#filename').val();
				var filepath = filename != '' ? "http://vcancy.ca/login/images/" + filename : appfiles;

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

						rentalstatus: "pending"
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
											var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted a rental application for ' + address + '.</p><p>To view the application, please log in <a href="http://www.vcancy.ca/login/#/" target = "_blank"> vcancy.ca </a> and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

											emailSendingService.sendEmailViaNodeMailer(snap.val().email, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
										});
									} else {
										var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted an online rental application via vcancy.ca. Please go to this link http://www.vcancy.ca/login/#/viewexternalapp/' + vm.applicationID + ' to view the application.</p><p>Check out <a href="http://www.vcancy.ca/login/#/" target = "_blank"> vcancy.ca </a> to automate viewing appointments and compare rental applications	 online.</p><p>For any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

										emailSendingService.sendEmailViaNodeMailer(vm.submitemail, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
									}

									var emailData = '<p>Hello ' + applicantname + ', </p><p>Your rental application has been submitted to ' + applicantemail + '.</p><p>To make changes, please log in <a href="http://www.vcancy.ca/login/#/" target = "_blank"> vcancy.ca </a>  and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

									emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Rental application', 'rentalapp', emailData);
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

						rentalstatus: "pending"
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
								var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted a rental application for ' + address + '.</p><p>To view the application, please log in <a href="http://www.vcancy.ca/login/#/" target = "_blank"> vcancy.ca </a>  and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

								emailSendingService.sendEmailViaNodeMailer(snap.val().email, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
							});
						} else {
							var emailData = '<p>Hello, </p><p>' + applicantname + ' has submitted an online rental application via vcancy.ca. Please go to this link http://www.vcancy.ca/login/#/viewexternalapp/' + vm.applicationID + ' to view the application.</p><p>Check out <a href="http://www.vcancy.ca/login/#/" target = "_blank"> vcancy.ca </a> to automate viewing appointments and compare rental applications	 online.</p><p>For any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

							emailSendingService.sendEmailViaNodeMailer(vm.submitemail, applicantname + ' has submitting a rental application', 'rentalreceive', emailData);
						}

						var emailData = '<p>Hello ' + applicantname + ', </p><p>Your rental application has been submitted to ' + applicantemail + '.</p><p>To make changes, please log in <a href="http://www.vcancy.ca/login/#/" target = "_blank"> vcancy.ca </a>  and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

						emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Rental application', 'rentalapp', emailData);
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
				}, function errorCallback(response) {
					console.log("Fail");
				});
			};


			vm.savechanges = function () {
				vm.draft = "true";
				// alert(vm.draft);
				vm.rentalAppSubmit();
			}

			vm.printApp = function () {
				var css = '@page { size: landscape; }',
				    head = document.head || document.getElementsByTagName('head')[0],
				    style = document.createElement('style');

					style.type = 'text/css';
					style.media = 'print';

					if (style.styleSheet){
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
    .controller('viewappCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		// var tenantID = localStorage.getItem('userID');
		var applicationID = $stateParams.appID;
		// var tenantEmail = localStorage.getItem('userEmail');
		
		vm.publicappview = $state.current.name == "viewexternalapplication" ? "1" : "0";
		
		
		vm.adult = [];
		vm.minor = [];
		vm.rentaldata = [];		
		
		// DATEPICKER
		vm.today = function() {
			vm.dt = new Date();
		};
		vm.today();

		vm.toggleMin = function() {
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
		
		
		firebase.database().ref('submitapps/'+applicationID).once("value", function(snapshot) {	
			console.log(snapshot.val());
			$scope.$apply(function(){
				if(snapshot.val()) {
						var value = snapshot.val();
						console.log(value);
						vm.rentaldata.tenantID = value.tenantID;
						vm.rentaldata.scheduleID = value.scheduleID;
						vm.rentaldata.propID = value.propID;
						
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
						
						firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(applicationID).once("value", function(snap) {	
							$scope.$apply(function(){
								if(snap.val()) {
									$.map(snap.val(), function(v, k) {
										console.log(v);
										vm.rentaldata.tenantName = v.mainapplicant.applicantname;
										vm.rentaldata.dob =  new Date(v.mainapplicant.applicantdob);
										vm.rentaldata.sinno = v.mainapplicant.applicantsinno;
										vm.rentaldata.appcurrentemployer =  v.mainapplicant.appcurrentemployer;
										vm.rentaldata.appposition =  v.mainapplicant.appposition;
										vm.rentaldata.appemployerphone =  v.mainapplicant.appemployerphone;
										vm.rentaldata.appworkingduration =  v.mainapplicant.appworkingduration;
										vm.rentaldata.appgrossmonthlyincome =  v.mainapplicant.appgrossmonthlyincome;
										vm.rentaldata.appincometype =  v.mainapplicant.appincometype;
										vm.rentaldata.appotherincome =  v.mainapplicant.appotherincome;												
										vm.rentaldata.appsign =  v.mainapplicant.appsign;
										
										vm.rentaldata.minorappname= [];
										vm.rentaldata.minorappdob= [];
										vm.rentaldata.minorappsinno = [];
										
										if(v.minors != undefined){
											angular.forEach(v.minors, function(value, key) {
											  vm.minor.push(key);
											  vm.rentaldata.minorappname.push(value.minorapplicantname);
											  vm.rentaldata.minorappdob.push(new Date(value.minorapplicantdob));
											  vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);					  
											});
										}
										vm.rentaldata.otherappname= [];
										vm.rentaldata.otherappdob= [];
										vm.rentaldata.otherappsinno = [];
										vm.rentaldata.otherappcurrentemployer= [];
										vm.rentaldata.otherappposition= [];
										vm.rentaldata.otherappemployerphone= [];
										vm.rentaldata.otherappworkingduration= [];
										vm.rentaldata.otherappgrossmonthlyincome= [];
										vm.rentaldata.otherappincometype= [];
										vm.rentaldata.otherappotherincome= [];
										vm.rentaldata.otherappsign= [];
										
										if(v.otherapplicants != undefined){
											angular.forEach(v.otherapplicants, function(value, key) {
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
				}
			});
		});
		vm.printApp = function(){

		   $window.print();
		  }
}])
'use strict';

//=================================================
// Tenant Profile
//=================================================

vcancyApp
    .controller('tenantProfilelCtrl', ['$scope' , '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window) {
        var vm = this;
        var tenantID = localStorage.getItem('userID');
        var password = localStorage.getItem('password');


        vm.email = '';
        vm.firstname = '';
        vm.lastname = '';
         vm.contact = '';
        vm.address  = '';
        vm.password  = password;
        vm.loader = 1;
        
        $rootScope.invalid = '';
        $rootScope.success = '';
        $rootScope.error = '';

        firebase.database().ref('/users/' + tenantID).once('value').then(function (userdata) {
            $scope.$apply(function () {
                if (userdata.val() !== null) {
                    vm.email = userdata.val().email;
                    vm.firstname = userdata.val().firstname;
                    vm.lastname = userdata.val().lastname;
                     vm.address = userdata.val().address;
                    vm.contact = userdata.val().contact;
                    vm.loader = 0;
                }
            });
        });
        vm.profileSubmit = function (tdProfilectrl) {
          //alert($scope.tdProfilectrl.contact); return false;
 
            var updatedata = {};
            var tenantID = localStorage.getItem('userID');
          

            if($scope.tdProfilectrl.contact === undefined || $scope.tdProfilectrl.contact === ""){
              vm.contact = '';
              updatedata['contact'] = '';
            }else{
              updatedata['contact'] = $scope.tdProfilectrl.contact;
            }
             if($scope.tdProfilectrl.address === undefined || $scope.tdProfilectrl.address === ""){
              vm.address = '';
              updatedata['address'] = '';
            }else{
              updatedata['address'] = $scope.tdProfilectrl.address;
            }
            if($scope.tdProfilectrl.email === undefined || $scope.tdProfilectrl.email === ""){
              vm.email = '';
              updatedata['email'] = '';
            }else{
               updatedata['email'] = $scope.tdProfilectrl.email;
            }

            // alert(JSON.stringify(updatedata)); return false;
            firebase.database().ref('users/' + tenantID).update(updatedata).then(function(){
              confirm("Your Information updated!");
            });
        }

         vm.changepasswordSubmit = function(passworduser){

             $rootScope.invalid = '';
            $rootScope.success = '';
            $rootScope.error = '';
             var oldpassword = localStorage.getItem('password');
             var userEmail = localStorage.getItem('userEmail');
             var ncpassword = passworduser.ncpassword ;
             var password = passworduser.password ;
             var npassword = passworduser.npassword ;
              var landLordID = localStorage.getItem('userID');

            if(password === oldpassword){

                    if(ncpassword === npassword){
                        
                          //  alert(JSON.stringify(firebase.auth().currentUser));
                            var user = firebase.auth().currentUser;
                            var newPassword = ncpassword;
                            user.updatePassword(newPassword).then(function() {
                                console.log("success");
                                 confirm("Your password has been updated!");
                                 localStorage.setItem('password', newPassword);
                             $rootScope.success = 'Your password has been updated';
                             $rootScope.error = '';  
                             $rootScope.invalid = '';
                            }).catch(function(error) {
                              // An error happened.
                                $rootScope.invalid = 'regcpwd';         
                                $rootScope.error = 'your Passwords not updated please try again.';
                                $rootScope.success = '';
                            });


                    } else {
                        $rootScope.invalid = 'regcpwd';         
                        $rootScope.error = 'your Passwords don’t match with confirm password.';
                        $rootScope.success = '';
                    }


            } else {
                $rootScope.invalid = 'regcpwd';         
                $rootScope.error = 'your Passwords don’t match with old password.';
                $rootScope.success = '';
            }
        }
            
        
    }]);

'use strict';

//=================================================
// Tenant Dashboard
//=================================================

vcancyApp
    .controller('landlordProfilelCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window) {
        var vm = this;
        var landLordID = localStorage.getItem('userID');
        var password = localStorage.getItem('password');
        
        vm.email = '';
        vm.firstname = '';
        vm.lastname = '';
        vm.loader = 1;
        vm.contact = '';
        vm.address  = '';

		 $rootScope.invalid = '';
            $rootScope.success = '';
            $rootScope.error = '';
        //alert(landLordID);
       /* var commentsRef = firebase.database().ref('users/' + landLordID);
		      commentsRef.once('value', function(snapshot) {
		      	 snapshot.forEach(function(childSnapshot) {
		      	 	alert(childSnapshot.key);
		      	 	 });
		      });*/
        

        firebase.database().ref('/users/' + landLordID).once('value').then(function (userdata) {
            $scope.$apply(function () {
                if (userdata.val() !== null) {

                    vm.email = userdata.val().email;
                    vm.firstname = userdata.val().firstname;
                    vm.lastname = userdata.val().lastname;
                    vm.address = userdata.val().address;
                    vm.contact = userdata.val().contact;
                    vm.loader = 1;
                }
            });
        }); 
        
        vm.profileSubmit = function (ldProfilectrl) {
        	 var landLordID = localStorage.getItem('userID');


             var updatedata = {};
            //var tenantID = localStorage.getItem('userID');
            if($scope.ldProfilectrl.contact === undefined || $scope.ldProfilectrl.contact === ""){
              vm.contact = '';
              updatedata['contact'] = '';
            }else{
              updatedata['contact'] = $scope.ldProfilectrl.contact;
            }
             if($scope.ldProfilectrl.address === undefined || $scope.ldProfilectrl.address === ""){
              vm.address = '';
              updatedata['address'] = '';
            }else{
              updatedata['address'] = $scope.ldProfilectrl.address;
            }
            if($scope.ldProfilectrl.email === undefined || $scope.ldProfilectrl.email === ""){
              vm.email = '';
              updatedata['email'] = '';
            }else{
               updatedata['email'] = $scope.ldProfilectrl.email;
            }
            //alert(JSON.stringify(updatedata)); return false;

            firebase.database().ref('users/' + landLordID).update(updatedata).then(function(){
              confirm("Your Information updated!");
            });
        }

        vm.changepasswordSubmit = function(passworduser){

            //alert(JSON.stringify(passworduser));
            $rootScope.invalid = '';
            $rootScope.success = '';
            $rootScope.error = '';
             var oldpassword = localStorage.getItem('password');
             var userEmail = localStorage.getItem('userEmail');
             var ncpassword = passworduser.ncpassword ;
             var password = passworduser.password ;
             var npassword = passworduser.npassword ;
              var landLordID = localStorage.getItem('userID');

            if(password === oldpassword){

                    if(ncpassword === npassword){
                        
                          //  alert(JSON.stringify(firebase.auth().currentUser));
                            var user = firebase.auth().currentUser;
                            var newPassword = ncpassword;
                            user.updatePassword(newPassword).then(function() {
                                console.log("success");
                                confirm("Your password has been updated!");
                                 localStorage.setItem('password', newPassword);
                             $rootScope.success = 'Your password has been updated';
                             $rootScope.error = '';  
                             $rootScope.invalid = '';
                            }).catch(function(error) {
                              // An error happened.
                                $rootScope.invalid = 'regcpwd';         
                                $rootScope.error = 'your Passwords not updated please try again.';
                                $rootScope.success = '';
                            });


                    } else {
                        $rootScope.invalid = 'regcpwd';         
                        $rootScope.error = 'your Passwords don’t match with confirm password.';
                        $rootScope.success = '';
                    }


        	} else {
                $rootScope.invalid = 'regcpwd';         
                $rootScope.error = 'your Passwords don’t match with old password.';
                $rootScope.success = '';
            }
        }
}])
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
