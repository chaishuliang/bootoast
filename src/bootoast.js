/**
 * AMD adapter!
 *
 * @see https://github.com/umdjs/umd
 *
 * @author Luiz Machado <https://github.com/odahcam>
 */

(function (root, factory) {

	if (typeof define === 'function' && define.amd) {

		// AMD. Register as an anonymous module.
		define(['exports', 'jquery'], function (exports, jquery) {
			factory((root.bootoast = exports), jquery);
		});

	} else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {

		// CommonJS
		factory(exports, require('jquery'));

	} else {

		// Browser globals
		factory((root.bootoast = {}), root.jQuery);

	}

}(this, function (exports, $) {
	// Use bootoast, bootbox in some fashion.

	'use strict';

	if (!$) {
		console.error('jQuery not found, your jQuery plugin will not work.');
		return false;
	}

	/**
	 * Store the plugin name in a variable. It helps you if later decide to change the plugin's name
	 * @var {string} pluginName
	 */
	var pluginName = 'bootoast';

	/**
	 * The plugin constructor.
	 */
	function Bootoast(options) {

		if (typeof options === 'string') {
			options = {
				message: options
			};
		}

		if (typeof options !== 'object') return;

		// define the interpreted options
		this.settings = $.extend({}, this.defaults, options);
		// define the title
		this.title = this.settings.title;
		// define the content
		this.content = this.settings.content || this.settings.text || this.settings.message;
		// define o elemento de progress como nulo
		this.timeoutProgress = null;
		// define uma posição aceitável pro elemento
		this.position = this.positionFor(this.settings.position).split('-');
		// Define o .glyphicon com base no .alert-<type>
		this.settings.icon = this.settings.icon || this.icons[this.settings.type];

		var containerClass = pluginName + '-container';

		this.containerSelector = '.' + containerClass + '.' + this.position.join('.');

		// See if you have a container, if you don't create one.
		if ($('body > ' + this.containerSelector).length === 0) {
			$('<div>', {
				class: containerClass + ' ' + this.position.join(' ')
			}).appendTo('body');
		}

		this.title = this.htmlEncode(this.title);
		var el_title = this.title ? '<div class="bootoast-alert-title bootoast-ellipsis" title=' + this.title + '>' + this.title + '</div>' : '';
		var el_content = '<div class="bootoast-alert-content">' + this.content + '</div>';

		// Add the.alert to.container according to its positioning.
		this.$el = $('<div class="' + pluginName + ' alert alert-' + this.typeFor(this.settings.type) + '"><span class="glyphicon glyphicon-' + this.settings.icon + '"></span><div class="bootoast-alert-container">' + el_title + el_content + '</div></div>');

		this.init();
	}

	$.extend(Bootoast.prototype, {
		/**
		 * Default options
		 *
		 * @var {Object} defaults
		 */
		defaults: {
			/**
			 * @var {string}
			 */
			title: '',
			/**
			 * Any HTML string.
			 * @var {string}
			 */
			message: 'Bootoast!',
			/**
			 * ['warning', 'success', 'danger', 'info']
			 * @var {string}
			 */
			type: 'info',
			/**
			 * ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']
			 * @var {string}
			 */
			position: 'top-center',
			/**
			 * @var {string}
			 */
			icon: null,
			/**
			 * [false, int]
			 *
			 * Seconds, use null to disable timeout hiding.
			 * @var {int|bool}
			 */
			timeout: 3,
			/**
			 * [false, 'top', 'bottom', 'background']
			 *
			 * @var {string|bool}
			 */
			timeoutProgress: false,
			/**
			 * Animation duration in miliseconds.
			 *
			 * @var {int}
			 */
			animationDuration: 300,
			/**
			 * @var {bool}
			 */
			dismissible: true
		},
		/**
		 * Default icons
		 *
		 * @var {Object} icons
		 */
		icons: {
			warning: 'exclamation-sign',
			success: 'ok-sign',
			danger: 'remove-sign',
			info: 'info-sign'
		},
		/**
		 * Types
		 *
		 * @var {Object} types
		 */
		types: [
			'primary',
			'secondary',
			'info',
			'success',
			'warning',
			'danger'
		],
		/**
		 * Type Sinonymus
		 *
		 * @var {Object} typeSinonym
		 */
		typeSinonym: {
			warn: 'warning',
			error: 'danger',
		},
		/**
		 * Position Supported
		 *
		 * @var {array} positions
		 */
		positions: [
			'top-left',
			'top-center',
			'top-right',
			'bottom-left',
			'bottom-center',
			'bottom-right'
		],
		/**
		 * Position Sinonymus
		 *
		 * @var {Object} positionSinonym
		 */
		positionSinonym: {
			bottom: 'bottom-center',
			leftBottom: 'bottom-left',
			rightBottom: 'bottom-right',
			top: 'top-center',
			rightTop: 'top-right',
			leftTop: 'top-left'
		},
		/**
		 * Initializes the plugin functionality
		 */
		init: function () {

			// Sets whether the new.alert should be entered by first or last in the container.
			this.$el[(this.position[0] === 'bottom' ? 'append' : 'prepend') + 'To'](this.containerSelector);

			var plugin = this;

			if (this.settings.dismissible === true) {
				this.$el
					.addClass('alert-dismissible')
					.prepend('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
					.on('click', 'button.close', function (e) {
						e.preventDefault();
						plugin.hide();
					});
			}

			//解决pc端弹层外的内容滚动
			this.$el.on('mousewheel DOMMouseScroll', this.addScrollHidden);
			this.$el.on('mouseleave', this.removeScrollHidden);

			/**
			 * 解决移动端弹层外的内容滚动
			 */
			var scrollTop = 0;
			this.$el.on('touchstart', function(e){
				scrollTop = $(document).scrollTop();
				$('body').css({"position":"fixed", "top":"-"+ scrollTop +"px", "width":"100%"});
			})
			this.$el.on('touchend', function(e){
				$('body').css({"position":"unset", "top": "unset", "width":"unset"});
				$(document).scrollTop(scrollTop);
				plugin.removeScrollHidden();
			})

			// Show.alert
			this.$el.animate({
				opacity: 1
			}, this.settings.animationDuration);

			//timeout change data type
			this.settings.timeout = this.settings.timeout === "false" ? false : parseInt(this.settings.timeout);

			// If.alert has expiration time
			if (this.settings.timeout) {

				var secondsTimeout = parseInt(this.settings.timeout * 1000);

				this.hide(secondsTimeout);
			}
		},
		/**
		 * @method hide
		 *
		 * @param {int} timeout
		 *
		 * @return {int} The setTimeout ID.
		 */
		hide: function (timeout) {
			var plugin = this;

			//setTimeoutProgress
			if (this.settings.timeoutProgress && timeout && timeout > 0) {
				this.setTimeoutProgress(this.settings.timeoutProgress);
				plugin.processBarTimerId = this.moveProgressbar(plugin.$el, timeout);
			}

			var timerId = setTimeout(function () {
				plugin.$el.animate({
					opacity: 0
				}, plugin.settings.animationDuration, function () {
					plugin.$el.remove();
				});
				plugin.removeScrollHidden();
			}, timeout || 0);

			//取消绑定的hover事件
			this.$el.unbind('mouseenter').unbind('mouseleave');

			// Pauses the hover-based timeout, 鼠标悬停和离开事件
			this.$el.hover(function() {
					clearTimeout(timerId);
					clearInterval(plugin.processBarTimerId);
				}, function () {
					timerId = plugin.hide(timeout);
					plugin.removeScrollHidden();
				}
			);
			return timerId;
		},
		/**
		 * @param {string} progressPosition
		 *
		 * @return {number}
		 */
		setTimeoutProgress: function (progressPosition) {

			if (this.timeoutProgress !== null) {
				this.timeoutProgress.remove();
			}

			var positionOptions = {
				top: 'prepend',
				bottom: 'append',
				background: 'prepend'
			};

			var $progress = $('<div>', {
				class: 'progress',
				html: $('<div>', {
					class: 'progress-bar progress-bar-striped active',
					style: 'width:100%',
					role: 'progressbar',
					'aria-valuemin': 0,
					'aria-valuenow': 0,
					'aria-valuemax': 100,
				})
			});

			var putMethod = positionOptions[progressPosition] || 'append';
			var position = typeof positionOptions[progressPosition] === 'string' ? progressPosition : 'background';

			this.timeoutProgress = $progress.addClass('progress-' + position)[putMethod + 'To'](this.$el);

			return this.timeoutProgress;
		},
		/**
		 * @param {string} type
		 *
		 * @return {string} Gets the correct type-name for the given value or null.
		 */
		typeFor: function (type) {

			// if this type is default
			if (this.types[type]) {
				return type;
			}

			if (!type) {
				return 'default';
			}

			var sinonym = this.typeSinonym[type];

			return sinonym || type;
		},
		/**
		 * @param {string} position
		 *
		 * @return {string} The correct position-name for the given value or ''.
		 */
		positionFor: function (position) {

			// looks for a registered default position, if this is a known position
			if ($.inArray(position, this.positions) > -1) return position;

			// alias are in camelCase.
			var positionCamel = $.camelCase(position);

			// tries to find some position-name alias.
			return this.positionSinonym[positionCamel] || 'bottom-center';
		},

		/**
		 *
		 * @param {HTMLElement} elem
		 * @param {int} qty
		 *
		 * @return {int} The interval ID, so you can cancel the movement bro.
		 */
		moveProgressbar: function(elem, qty) {
			var that = this;
			var width = 100;

			var id = setInterval(function () {
				if (width <= 0) {
					clearInterval(id);
				} else {
					width--;
					elem.find("div.progress-bar.progress-bar-striped.active").css("width", width + '%')
				}
			}, qty / 100);
			return id;
		},
		/**
		 * addScrollHidden
		 */
		addScrollHidden: function() {
			$('body').addClass("scrollHidden");
		},
		/**
		 * removeScrollHidden
		 */
		removeScrollHidden: function() {
			$('body').removeClass("scrollHidden");
		},
		/**
		 * htmlEncode
		 * @param str
		 * @returns {string}
		 */
		htmlEncode: function (str)
		{
			var s = "";
			if (str.length == 0) return "";
			s = str.replace(/&/g,"&amp;");
			s = s.replace(/</g,"&lt;");
			s = s.replace(/>/g,"&gt;");
			s = s.replace(/\s/g,"&nbsp;");
			s = s.replace(/\'/g,"&#39;");
			s = s.replace(/\"/g,"&quot;");
			s = s.replace(/\n/g, "<br>");
			return s;
		},
		/**
		 * htmlDecode
		 * @param str
		 * @returns {string}
		 */
		htmlDecode: function (str)
		{
			var s = "";
			if (str.length == 0) return "";
			s = str.replace(/&amp;/g,"&");
			s = s.replace(/&lt;/g,"<");
			s = s.replace(/&gt;/g,">");
			s = s.replace(/&nbsp;/g," ");
			s = s.replace(/&#39;/g,"\'");
			s = s.replace(/&quot;/g,"\"");
			s = s.replace(/<br>/g, "\n");
			return s;
		}
	});

	// attach properties to the exports object to define
	// the exported module properties.
	exports.toast = function (options) {
		return new Bootoast(options);
	};
}));