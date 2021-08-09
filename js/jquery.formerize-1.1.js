
(function(jQuery) {
	
	jQuery.fn.disableSelection_formerize = function() { return jQuery(this).css('user-select', 'none').css('-khtml-user-select', 'none').css('-moz-user-select', 'none').css('-o-user-select', 'none').css('-webkit-user-select', 'none'); }
	
	jQuery.fn.formerize = function(options) {
		
			var settings = jQuery.extend({
				usePlaceholders:		true,
				baseZIndex:				1000,
				themeClass:				null
			}, options);

			var _form = jQuery(this), _document = jQuery(document), _window = jQuery(window), _fakes = new Array();
			var _isTouch = !!('ontouchstart' in window), _eventType = (_isTouch ? 'click' : 'click');
			var _isDegraded = (navigator.userAgent.match(/MSIE ([0-9]+)\./) && RegExp.$1 < 9);
			
				if (settings.usePlaceholders
				&&	'placeholder' in (document.createElement('input')))
					settings.usePlaceholders = false;

			if (settings.usePlaceholders)
			{
					_form
						.find('input[type=text],textarea')
							.each(function() {
								var e = jQuery(this);
								if (e.val() == '' || e.val() == e.attr('placeholder')) {
									e.addClass('formerize-placeholder');
									e.val(e.attr('placeholder'));
								}
							})
							.blur(function() {
								var e = jQuery(this);
								if (e.attr('name').match(/_fakeformerizefield$/))
									return;
								if (e.val() == '') {
									e.addClass('formerize-placeholder');
									e.val(e.attr('placeholder'));
								}
							})
							.focus(function() {
								var e = jQuery(this);
								if (e.attr('name').match(/_fakeformerizefield$/))
									return;
								if (e.val() == e.attr('placeholder')) {
									e.removeClass('formerize-placeholder');
									e.val('');
								}
							});

					_form
						.find('input[type=password]')
							.each(function() {
								var e = jQuery(this);
								var x = jQuery(jQuery('<div>').append(e.clone()).remove().html().replace(/type="password"/i, 'type="text"').replace(/type=password/i, 'type=text'));
								if (e.attr('id') != '')
									x.attr('id', e.attr('id') + '_fakeformerizefield');
								if (e.attr('name') != '')
									x.attr('name', e.attr('name') + '_fakeformerizefield');
								x.addClass('formerize-placeholder').val(x.attr('placeholder')).insertAfter(e);
								if (e.val() == '')
									e.hide();
								else
									x.hide();
								e.blur(function(event) {
									event.preventDefault();
									var e = jQuery(this);
									var x = e.parent().find('input[name=' + e.attr('name') + '_fakeformerizefield]');
									if (e.val() == '') {
										e.hide();
										x.show();
									}
								});
								x.focus(function(event) {
									event.preventDefault();
									var x = jQuery(this);
									var e = x.parent().find('input[name=' + x.attr('name').replace('_fakeformerizefield', '') + ']');
									x.hide();
									e.show().focus();
								});
								x.keypress(function(event) {
									event.preventDefault();
									x.val('');
								});
							});

					_form
							.submit(function() {
								jQuery(this)
									.find('input[type=text],input[type=password],textarea')
										.each(function(event) {
											var e = jQuery(this);
											if (e.attr('name').match(/_fakeformerizefield$/))
												e.attr('name', '');
											if (e.val() == e.attr('placeholder')) {
												e.removeClass('formerize-placeholder');
												e.val('');
											}
										});
							})
							.bind("reset", function(event) {
								event.preventDefault();
								jQuery(this)
									.find('select')
										.val(jQuery('option:first').val());
								jQuery(this)
									.find('input,textarea')
										.each(function() {
											var e = jQuery(this);
											var x;
											e.removeClass('formerize-placeholder');
											switch (this.type) {
												case 'submit':
												case 'reset':
													break;
												case 'password':
													e.val(e.attr('defaultValue'));
													x = e.parent().find('input[name=' + e.attr('name') + '_fakeformerizefield]');
													if (e.val() == '') {
														e.hide();
														x.show();
													}
													else {
														e.show();
														x.hide();
													}
													break;
												case 'checkbox':
												case 'radio':
													e.attr('checked', e.attr('defaultValue'));
													break;
												case 'text':
												case 'textarea':
													e.val(e.attr('defaultValue'));
													if (e.val() == '') {
														e.addClass('formerize-placeholder');
														e.val(e.attr('placeholder'));
													}
													break;
												default:
													e.val(e.attr('defaultValue'));
													break;
											}
										});
								window.setTimeout(function() {
									for (x in _fakes)
										_fakes[x].trigger('formerize_sync');
								}, 10);
							});
			}
			
			if (settings.themeClass)
			{
					_form.addClass(settings.themeClass);
				
				if (!_isDegraded)
				{
						if (!settings.usePlaceholders)
							_form
								.bind('reset', function(e) {
									window.setTimeout(function() {
										for (x in _fakes)
											_fakes[x].trigger('formerize_sync');
									}, 10);
								});
					
						_form.find('select').each(function() {
							var real = jQuery(this), id = real.attr('id');
							
							//  ID
								if (!id)
									return;

							
								if (real.attr('height') && real.attr('height') > 1)
									return;

							
								var	a = new Array(), 
									fake = jQuery('<div class="select" id="' + id + '-formerize">&nbsp;</div>'),
									realOptions = real.find('option'), 
									fakeOptions = jQuery('<ul class="select-options"></ul>'),
									fakeOptionsContainer = jQuery('<div class="' + settings.themeClass + '"></div>');

							
								real.hide();
						
								realOptions.each(function() {
									var t = jQuery(this);
									a.push('<li value="' + t.attr('value') + '">' + t.text() + '</li>');
								});

								fakeOptions
									.html(a.join(''))
									.css('position', 'absolute')
									.css('cursor', 'pointer')
									.css('z-index', settings.baseZIndex)
									.disableSelection_formerize()
									.hide()
									.appendTo(fakeOptionsContainer)
									.bind('formerize_close', function() {
										fakeOptions.fadeOut('fast');
										fake.removeClass('select-focus');
									})
									.bind('formerize_open', function() {
										fakeOptions
											.css('min-width', fake.outerWidth());
										fakeOptions.fadeIn('fast');
										fake.addClass('select-focus');
									})
									.bind(_eventType, function(e) {
										e.preventDefault();
										e.stopPropagation();
									});
								
								fakeOptions.find('li').each(function() {
									var t = jQuery(this);
									t.bind(_eventType, function() {
										real.val(t.attr('value'));
										fakeOptions.trigger('formerize_close');
										fake.trigger('formerize_sync');
										real.trigger('change');
									});
								});
								
								_document
									.bind(_eventType, function(e) {
										fakeOptions.trigger('formerize_close');
									});
								
								fakeOptionsContainer
									.appendTo(jQuery('body'));

								fake
									.css('cursor', 'pointer')
									.disableSelection_formerize()
									.insertAfter(real)
									.bind('formerize_sync', function() {
										fake.text(realOptions.filter(':selected').first().text());
									})
									.bind(_eventType, function(e) {
										e.preventDefault();
										e.stopPropagation();
										if (fakeOptions.is(':visible'))
											fakeOptions.trigger('formerize_close');
										else
										{
											var p = fake.offset();
											
											fakeOptions
												.css('left', p.left + 'px')
												.css('top', p.top + fake.outerHeight() + 'px')
												.trigger('formerize_open');
										}
									})
									.trigger('formerize_sync');
									
							_fakes.push(fake);
						});
					
						_form.find('input[type=checkbox]').each(function() {
							var real = jQuery(this), id = real.attr('id')
							
								if (!id)
									return;
							
								var fake = jQuery('<div class="checkbox" id="' + id + '-formerize">&nbsp;</div>');
							
								real.hide();
							
								fake
									.css('cursor', 'pointer')
									.disableSelection_formerize()
									.insertAfter(real)
									.bind('formerize_sync', function() {
										if (real.prop('checked'))
											fake.addClass('checkbox-checked');
										else
											fake.removeClass('checkbox-checked');
									})
									.bind(_eventType, function(e) {
										e.preventDefault();
										if (real.prop('checked'))
											real.prop('checked', false);
										else
											real.prop('checked', true);
										
										fake.trigger('formerize_sync');
										real.trigger('change');
									})
									.trigger('formerize_sync');
									
								_form.find('label[for=' + real.attr('id') + ']')
									.css('cursor', 'pointer')
									.disableSelection_formerize()
									.bind(_eventType, function(e) {
										e.preventDefault();
										fake.trigger(_eventType);
									});

							_fakes.push(fake);
						});
					
						_form.find('input[type=radio]').each(function() {
							var real = jQuery(this), id = real.attr('id');
							
								if (!id)
									return;
							
								var fake = jQuery('<div class="radio" id="' + id + '-formerize">&nbsp;</div>');
							
								real.hide();
							
								fake
									.css('cursor', 'pointer')
									.disableSelection_formerize()
									.insertAfter(real)
									.bind('formerize_sync', function() {
										if (real.prop('checked'))
											fake.addClass('radio-checked');
									})
									.bind(_eventType, function(e) {
										e.preventDefault();
										_form.find('input[name=' + real.attr('name') + ']').each(function() {
											var t = jQuery(this);
											t.prop('checked', false);
											_form.find('#' + t.attr('id') + '-formerize').removeClass('radio-checked');
										});
										real.prop('checked', true);
										fake.trigger('formerize_sync');
										real.trigger('change');
									})
									.trigger('formerize_sync');

								_form.find('label[for=' + real.attr('id') + ']')
									.css('cursor', 'pointer')
									.disableSelection_formerize()
									.bind(_eventType, function(e) {
										e.preventDefault();
										fake.trigger(_eventType);
									});

							_fakes.push(fake);
						});
				}
			}

		return _form;
	};
})(jQuery);