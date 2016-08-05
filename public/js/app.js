/*global $ */
app = {

	catalog: {

		item: {

			showInfo: function(data) {
				if (app.params.deptID == 3) {
					app.catalog.item.music.preview.stop();
				}
				$('.modal-container .item-info .image').css('background-image', 'url(/data/' + data.cover + '-details.jpg)');
				$('.modal .si').css('background-image', '');
				$('.modal-container .modal .title').text(data.name);
				if (app.params.deptID == 3) {
					$('.modal-container .modal .author span').text(data.author);
				}
				$('.modal-container .item-info .description').html(data.description);
				if ($(this).parent().find('.features').text() != '') {
					$('.modal-container .modal .features').html("<h3>Features</h3>" + data.features);
				} else {
					$('.modal-container .modal .features').text('');
				}
				//$('.modal-container .modal .params .value.c a').attr('data-cid', data.categoryID);
				//$('.modal-container .modal .params .value.c a').text(data.categoryName);
				if (data.options.length > 0) {
					var string = '';
					var options = data.options.split(';');
					$.each(options, function(index, data) {
						var parts = data.split(',');
						string += "<a data-oid='" + parts[0] + "' href='javascript:void(0)'>" + parts[1] + '</a><br />';
					});
					$('.modal-container .modal .params .value.f').html(string);
					$('.modal-container .modal .params .f').css('display', 'block');
				} else {
					$('.modal-container .modal .params .f').css('display', 'none');
				}
				$('.modal-container .modal .price span').text(data.price);
				$('.modal-container .buy').attr('href', data.href);
				$('.backdrop, .modal-container').css('display', 'block');
				$('.modal-container .fbs').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=http://feelgeekish.com/id' + data.id);
				$('body').addClass('modal-open');
				if (app.params.deptID == 3) {
					$('#jquery_jplayer_1').jPlayer('setMedia', {m4a: data.previewHref});
					return;
				}
				$.post('/controller/load/similar/', {'itemID': data.id}, function(r) {
					//alert(r);
					try {
						var rawItems = JSON.parse(r);
						var items = rawItems.data;
						var siCount = 0;
						$.each(items, function(index, item) {
							siCount++;
							$('.modal .si' + siCount).css('background-image', 'url(/data/' + item.cover + '-cover.jpg)');
							$('.modal .si' + siCount).attr('data-id', item.id);
						});
					} catch (e) {
						alert("ERROR");
					}
				});
			},

			closeInfo: function() {
				$('.backdrop, .modal-container').css('display', 'none');
				$('body').removeClass('modal-open');
				app.params.itemID = 0;
				if (app.params.deptID == 3) {
					app.catalog.item.music.preview.stop();
				}
				app.hash.generate();
			},

			loadAndShowInfo: function(itemID) {
				app.params.itemID = itemID;
				$.post('/controller/load/item/', {'itemID': app.params.itemID}, function(response) {
					try {
						var value = JSON.parse(response);
						app.catalog.item.showInfo(value);
						app.catalog.item.incViews(app.params.itemID);
						app.hash.generate();
					} catch (e) {

					}
				});
			},

			incViews: function(itemID) {
				$.post('/controller/item/inc-views/', {'itemID': itemID})
			},

			favourite: function(itemID) {
				$.post('/controller/item/favourite/', {'itemID' : itemID}, function(response) {
					switch (response) {
						case '1':
							$('.card' + itemID + ' .fav a').addClass('active');
							break;
						case '-1':
							$('.card' + itemID + ' .fav a').removeClass('active');
							break;
					}
				});
			},

			music: {

				preview: {
					play: function() {
						if (!app.params.isPlaying) {
							$('#jquery_jplayer_1').jPlayer('play');
							$('.modal .player .play i').removeClass('icon-play').addClass('icon-stop');
							app.params.isPlaying = true;
						} else {
							app.catalog.item.music.preview.stop();
						}
					},

					stop: function() {
						$('#jquery_jplayer_1').jPlayer('stop');
						$('.modal .player .play i').addClass('icon-play').removeClass('icon-stop');
						app.params.isPlaying = false;
					}
				}
			}
		},

		toggle: {

			tagged:  function(categoryID, options, reload) {
				$('.controls').css('display', 'none');
				$('.controls.tagged').css('display', 'block');
				if (reload) {
					if (app.params.mode != 'tagged') {
						$('.header .tools .switch').removeClass('active');
						$('.header .tools .tagged').addClass('active');
					}
					app.params.categoryID = categoryID;
					app.params.options = options;
					if (app.params.tour) {
						$('.header .tools .taketour').addClass('active');
					}
					app.params.page = 0;
				}
				//$('.filter.fuzzy, .filter.resemblance').removeClass('open');
				app.params.mode = 'tagged';
				app.hash.generate();
				app.catalog.showLoading(reload);
				$.post('/controller/load/tagged/', {'categoryID': 0, 'options': app.params.options.join(','), 'page': app.params.page, 'query': '', 'discount': '0'}, function(response) {
					//alert(response);
					try {
						app.content.buildCards(response, reload);
						$('.content-container > .content').off('click', '.loader').on('click', '.loader', function() {
							app.catalog.toggle.tagged(app.params.categoryID, app.params.options, false);
						});
					} catch(e) {
						app.catalog.showError();
					}
				});
			},

			fuzzy: function(reload) {
				$('.controls').css('display', 'none');
				$('.controls.fuzzy').css('display', 'block');

				if (app.params.filter != '') {
					app.ui.filters.toggle(app.params.filter);
				}

				app.catalog.options.add([], true, false);
				$('.header .cats li').removeClass('active');
				//app.ui.filters.hide();
				$('.filter.resemblance').removeClass('open');
				$('.header .tools .switch').removeClass('active');
				$('.header .tools .fuzzy').addClass('active');
				$('.filters-container, .filters-container .filter.fuzzy').addClass('open');
				app.params.mode = 'fuzzy';
				app.hash.generate();

				var params = [];
				if (reload) {
					app.params.page = 0;
				}
				$('.trackbar').each(function() {
					params.push($(this).attr('data-name') + '=' + $(this).find('.handler').attr('data-position'));
				});
				params.push('page=' + app.params.page);
				var paramString = params.join('&');
				app.catalog.showLoading(reload);

				$.post('/controller/load/fuzzy/', paramString, function(response) {
					//alert(response);
					try {
						app.content.buildCards(response, reload);
						$('.content-container > .content').off('click', '.loader').on('click', '.loader', function() {
							app.catalog.toggle.fuzzy(false);
						});
					} catch(e) {
						app.catalog.showError();
					}
				});
			},

			resemblance: function(itemID, actionType) {
				$('.controls').css('display', 'none');
				$('.controls.resemblance').css('display', 'block');

				if (app.params.filter != '') {
					app.ui.filters.toggle(app.params.filter);
				}

				app.catalog.options.add([], true, false);
				$('.header .cats li').removeClass('active');
				//app.ui.filters.hide();
				$('.filter.fuzzy').removeClass('open');
				$('.header .tools .switch').removeClass('active');
				$('.header .tools .resemblance').addClass('active');
				$('.filters-container, .filters-container .filter.resemblance').addClass('open');
				app.params.mode = 'resemblance';
				app.hash.generate();

				app.params.page = 0;
				app.catalog.showLoading(true);

				$.post('/controller/load/resemblance/', {'itemID': itemID, 'actionType': actionType}, function(response) {
					//alert(response);
					try {
						app.content.buildCards(response, true);
					} catch(e) {
						app.catalog.showError();
					}
				});
			},

			sintaxis: function() {

			}

		},

		options: {

			add: function(options, reset, reload) {
				var totalApplied = 0;
				if (reset) {
					app.params.options = [];
					$('.controls.tagged .selected .content a').remove();
					$('.controls.tagged .selected').css('display', 'none');
					$('.filter.tagged .option').removeClass('active');
				}
				$.each(options, function(index, option) {
					option = parseInt(option, 10);
					if (app.params.options.indexOf(option) == -1) {
						totalApplied++;
						app.params.options.push(option);
						$('.option' + option).addClass('active');
						$('.controls.tagged .selected .content').append("<a class='option option" + option + "' data-id='" + option + "' href='javascript:void(0)'>" + $('.filter .option' + option).text() + "<span>x</span></a>");
						$('.controls.tagged .selected').css('display', 'block');
					}
				});
				if (totalApplied > 0 && reload) {
					app.hash.generate();
					app.catalog.toggle.tagged(app.params.categoryID, app.params.options, true);
				}
			},

			remove: function(options) {
				$.each(options, function(index, option) {
					$('.filter.tagged .option' + option).removeClass('active');
					app.params.options.remove(app.params.options.indexOf(parseInt(option)));
					$('.controls.tagged .selected .option' + option).remove();
				});
				if (app.params.options.length == 0) {
					$('.controls.tagged .selected').css('display', 'none');
				}
				app.hash.generate();
				app.catalog.toggle.tagged(app.params.categoryID, app.params.options, true);
			}

		},

		showError: function() {
			app.catalog.item.closeInfo();
			$('.content-container > .content').html("<div class='empty'>Sorry, something went wrong :(<br />Please try another search.</div>");
		},

		showLoading: function(reload) {
			if (reload) {
				$('.content-container > .content').html("<div class='empty'>" + data.strings.catalogLoading + "</div>");
			} else {
				$('.content-container > .content .loader').html("<i class='icon-spin icon-spinner icon-4x'></i>");
				//$('.content-container > .content').append("<div class='empty'>" + data.strings.catalogLoading + "</div>");
			}
		}

	},

	pages: {

		load: function(pageName) {
			app.params.mode = 'page';
			app.ui.filters.hide();
			$('.header .cats li').removeClass('active');
			$('.tools .switch').removeClass('active');
			$('.controls-container .controls').css('display', 'none');
			app.tour.stop();
			app.catalog.options.add([], true, false);
			$('.tools .switch').removeClass('active').removeClass('active-hidden');
			app.catalog.showLoading(true);
			$('.content-container .content').load('/controller/pages/' + pageName);
			window.location.hash = 'page:' + pageName;
			app.ui.departments.toggle('close');
		}

	},

	tour: {

		start: function() {
			$('.header-container > .header .tour').remove();
			var n = 0;
			$.each(data.tour, function(index, step) {
				var bp = step.bp != '' ? "<a class='next' href='javascript:void(0)'>" + step.bp + "</a>" : '';
				var bn = step.bn != '' ? "<a class='close' href='javascript:void(0)'>" + step.bn + "</a>" : '';
				var node = "<div class='tour step s" + n + "' data-step='" + n + "' style='display:none'>" +
						   "<div class='inner'>" +
						   "<p class='c'>" + step.c + "</p>" +
						   "<p class='d'>" + step.d + "</p>" +
						   bp +
						   bn +
						   "<div class='clearfix'></div>" +
						   "<div class='t i'></div>" +
						   "<div class='t o'></div>" +
						   "</div>" +
						   "</div>";
				$('.header-container > .header').append(node);
				$('.header-container > .header .tour.step.s' + n).css('top', step.t + 'px');
				switch (step.p) {
					case 'r':
						$('.header-container > .header .tour.step.s' + n).css('right', step.h + 'px');
						break;
					case 'l':
						$('.header-container > .header .tour.step.s' + n).css('left', step.h + 'px');
						break;
				}
				$('.header-container > .header .tour.step.s' + n + ' .t.i').css('top', '-23px').css('left', step.i + 'px');
				$('.header-container > .header .tour.step.s' + n + ' .t.o').css('top', '-26px').css('left', step.o + 'px');;
				n++;
			});
			$('.tour.step .next').on('click', function() {
				var s = parseInt($(this).parent().parent().attr('data-step'), 10);
				$(this).parent().parent().fadeOut(200, function() {
					data.tour[s].a();
					$('.tour.step.s' + (s + 1)).fadeIn(200);
				});
			});
			$('.tour.step .close').on('click', function() {
				app.tour.stop($(this));
			});
			$('.tour.step.s0').fadeIn(200);
		},

		stop: function(handler) {
			app.params.tour = false;
			$('.tour.step').css('display', 'none');
			if (undefined !== handler && $(handler).parent().parent().attr('data-step') != '0') {
				app.catalog.toggle.tagged(0, [], true);
			}
			app.ui.tools.tour.off();
		}

	},



	params: {
		deptID: 0,
		categoryID: 0,
		options: [],
		filter: '',
		mode: '',
		searchString: '',
		itemID: 0,
		page: 0,
		tour: false,
		loading: false,
		isPlaying: false
	},

	mobilecheck: function() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	},

	dragAndDropOperation: {
		active: false,
		handler: null,
		labels: [],
		startPoint: {
			x: 0,
			y: 0
		},
		startPosition: {
			x: 0,
			y: 0
		},

		start: function (handler) {
			app.dragAndDropOperation.active = true;
			app.dragAndDropOperation.handler = $(handler);
			app.dragAndDropOperation.startPosition.x = parseInt($(handler).css('left'), 10);
			//alert($(handler).attr('data-texts'));
			app.dragAndDropOperation.labels = $(handler).attr('data-texts').split(',');
		}
	},

	ui: {

		tools: {

			tour: {
				on: function() {
					$('.taketour').addClass('active');
				},
				off: function() {
					$('.taketour').removeClass('active');
				}
			}

		},

		filters: {


			hide: function() {
				//$('.controls.tagged').css('display', 'none');
				return;
				if ($('.header .filters').css('display') != 'none') {
					$('.header .filters').fadeOut(300);
				}
				$('.filters li').removeClass('active');
				$('.filters-container, .filters-container .filter').removeClass('open');
			},

			show: function() {
				//$('.controls.tagged').css('display', 'block');
				return;
				if ($('.header .filters').css('display') == 'none') {
					$('.header .filters').fadeIn(300);
				}
			},

			toggle: function(filterID) {
				if (filterID == app.params.filter) {
					app.params.filter = 0;
					$('.filters-container, .filters-container .filter').removeClass('open');
					$('.controls.tagged li').removeClass('active');
				} else {
					app.params.filter = filterID;
					$('.filters-container .filter').removeClass('open');
					$('.controls.tagged li').removeClass('active');
					$('.filters-container, .filters-container .filter' + filterID).addClass('open');
					$('.controls.tagged li.filter' + filterID).addClass('active');
				}
			}

		},

		departments: {

			toggle: function (action) {
				if (undefined === action) {
					if (parseInt($('body').css('margin-left'), 10) < 0) {
						$('body').removeClass('menu-open');
						$('.tools .menu, .to-top .tt-menu').removeClass('active');
						$('.tools .switch.active-hidden').removeClass('active-hidden').addClass('active');
					} else {
						$('body').addClass('menu-open');
						$('.tools .menu, .to-top .tt-menu').addClass('active');
						$('.tools .switch.active').removeClass('active').addClass('active-hidden');
					}
				} else {
					if (action == 'close') {
						$('body').removeClass('menu-open');
						$('.tools .menu, .to-top .tt-menu').removeClass('active');
						$('.tools .switch.active-hidden').removeClass('active-hidden').addClass('active');
					}
					if (action == 'open') {
						$('body').addClass('menu-open');
						$('.tools .menu, .to-top .tt-menu').addClass('active');
						$('.tools .switch.active').removeClass('active').addClass('active-hidden');
					}
				}
			}

		}

	},

	init: function() {

		var matches = window.location.hostname.match(/([\w]*)\.[\w-]+\.[\w]{2,}/);
		app.params.deptID = function(matches) {
			if (null !== matches) {
				switch (matches[1]) {
					default:
						return 1;
				}
			} else {
				return 1
			}
		}(matches);

		$.when(
			$.get('/templates/filterHandler.html'),
			$.get('/templates/filterItem.html'),
			$.get('/templates/filterItemContainer.html')
		).then(function(templateHandler, templateItem, templateItemContainer) {
			$.post('/filters', function(response) {
				var filterGroups = JSON.parse(response);
				for (filterGroupIndex in filterGroups) {
					if (filterGroups.hasOwnProperty(filterGroupIndex)) {
						var filterGroup = filterGroups[filterGroupIndex];
						var filterHandler = templateHandler[0]
							.replace('{id}', filterGroup.id)
							.replace('{name}', filterGroup.name)
							.replace('{caption}', filterGroup.caption);
						$('.controls.tagged .filters').append(filterHandler);
						var filterItemContainer = templateItemContainer
							.replace('{id}', filterGroup.id);
						$('.controls.tagged .filters-container').append(filterHandler);
						for (filterIndex in filterGroup.content) {
							if (filterGroup.content.hasOwnProperty(filterIndex)) {
								var item = filterGroup.content[filterIndex];
								var filterItem = templateItem[0]
									.replace('{id}', item.id)
									.replace('{name}', item.name)
								$('.controls.tagged .filters-container .filter' + filterGroup.id + ' .content').append(filterItem);
							}
						}

					}
				}
			});
		});

		// ASSIGN TOOLS
		$('.tools .tagged').on('click', function() {
			app.catalog.toggle.tagged(0, [], true);
		});
		$('.tools .fuzzy').on('click', function() {
			app.catalog.toggle.fuzzy(true);
		});
		$('.tools .resemblance').on('click', function() {
			app.catalog.toggle.resemblance(0, 0);
		});
		$('.tools .about').on('click', function() {
			app.pages.load('about');
		});
		$('.tools .menu, .to-top .tt-menu').on('click', function(event) {
			event.stopPropagation();
			app.ui.departments.toggle();
		});
		$('.wrapper').on('click', function() {
			app.ui.departments.toggle('close');
		})



		//ASSIGN FILTERS
		$('.controls.tagged .filters a').on('click', function() {
			app.ui.filters.toggle($(this).attr('data-filter'));
		})

		// ASSIGN OPTIONS
		$('.filter.tagged').on('click', '.option', function(event) {
			//return;
			event.stopPropagation();
			app.catalog.options.add([$(this).attr('data-id')], false, true);
		});
		$('.controls.tagged .selected').on('click', '.option', function() {
			app.catalog.options.remove([$(this).attr('data-id')]);
		});

		// UI
		$(window).resize(function() {
			app.rebuildModal();
		});
		$(window).scroll(function() {
			if ($('.loader').length > 0 && !app.params.loading && $(window).scrollTop() + $(window).height() - 150 > $('.loader').offset().top) {
				app.params.loading = true;
				$('.loader').trigger('click');
			}
			if ($(window).scrollTop() > 500) {
				$('.to-top').fadeIn(500);
			} else {
				$('.to-top').fadeOut(500);
			}
		});
		$('.to-top .tt-top').on('click', function() {
			$('html, body').animate({scrollTop: '0px'});
		});

		// DEPTS LINKS

		$('.depts .ftr a').on('click', function() {
			app.ui.departments.toggle();
		});




		// TRACKBARS OPERATIONS
		$('.trackbar .handler').on('mousedown', function() {
			$(document).attr('unselectable', 'on')
					   .css('user-select', 'none')
					   .on('selectstart', false);
		});

		$(document).on('mousedown', function(e) {
			app.dragAndDropOperation.startPoint.x = e.pageX;
		});
		$(document).on('mousemove', function(e) {
			if (!app.dragAndDropOperation.active) {
				return;
			}
			var leftOffset = app.dragAndDropOperation.startPosition.x + e.pageX - app.dragAndDropOperation.startPoint.x;
			leftOffset = Math.max(-3, leftOffset);
			leftOffset = Math.min(leftOffset, parseInt($(app.dragAndDropOperation.handler).parent().css('width'), 10) - 12);
			$(app.dragAndDropOperation.handler).css('left', leftOffset + 'px');

			var p = Math.floor(100 * (parseInt($(app.dragAndDropOperation.handler).css('left'), 10) + 3) / (parseInt($(app.dragAndDropOperation.handler).parent().css('width'), 10) - 12));
			$(app.dragAndDropOperation.handler).attr('data-position', p);
			var zoneLength = 100 / app.dragAndDropOperation.labels.length;
			var currentZone = Math.floor(p / zoneLength);
			$(app.dragAndDropOperation.handler).find('.tooltip').text(app.dragAndDropOperation.labels[currentZone]);
		});
		$(document).on('mouseup', function(e) {
			if (app.dragAndDropOperation.active) {
				$('.trackbar .handler').removeClass('active');
				$(document).attr('unselectable', 'off')
						   .css('user-select', '')
						   .unbind('selectstart');
				//var p = Math.floor(100 * (parseInt($(app.dragAndDropOperation.handler).css('left'), 10) + 3) / (parseInt($(app.dragAndDropOperation.handler).parent().css('width'), 10) - 12));
				//$(app.dragAndDropOperation.handler).attr('data-position', p);
				//$(app.dragAndDropOperation.handler).find('.tooltip').text(p);
				app.dragAndDropOperation.active = false;
				app.dragAndDropOperation.handler = null;
				app.catalog.toggle.fuzzy(true);
			}
		});

		$('.trackbar .handler').on('mousedown', function() {
			app.dragAndDropOperation.start($(this));
			$(this).addClass('active');
		});




		// TOP STRIP BAR
		if (data.topStrip[app.params.deptID].active) {
			$('body .wrapper').prepend("<div class='strip'><div class='strip-container'></div></div>");
			$('.strip-container').html(data.topStrip[app.params.deptID].text);
			$('.strip').on('click', function() {
				data.topStrip[app.params.deptID].a();
				$('.strip').css('display', 'none');
			}).on('mouseover', function() {
				$(this).addClass('hovered');
			}).on('mouseout', function() {
				$(this).removeClass('hovered');
			});
		}




		$('.header .logo').on('click', function() {
			app.pages.load('about');
		});

		$('.header .cats a').on('click', function() {
			app.catalog.toggle.tagged($(this).attr('data-id'), app.params.options, true);
		});




		$('.filters-container .filter .closer').on('click', function() {
			app.ui.filters.toggle(app.params.filter);
		});


		$('.content-container').on('mouseover', '.card', function() {
			$(this).addClass('hover');
		}).on('mouseout', '.card', function() {
			$(this).removeClass('hover');
		});

		$('.content-container').on('click', '.card .zoomer', function() {
			var e = $(this).parent().parent();
			var views = parseInt($(e).parent().find('.views span').text(), 10);
			app.catalog.item.showInfo(JSON.parse($(e).parent().find('.os').text()));
			app.params.itemID = $(e).parent().attr('data-id');
			app.hash.generate();
			app.catalog.item.incViews($(e).parent().attr('data-id'));
			$(e).parent().find('.views span.value').text(views + 1);
		});

		$('.content-container').on('click', '.card .fav a', function() {
			app.catalog.item.favourite($(this).parent().parent().parent().attr('data-id'));
		});

		app.rebuildModal();
		$('.backdrop, .modal-container .close').on('click', function() {
			app.catalog.item.closeInfo();
		});
		$('.modal-container').on('click', function(event) {
			event.stopPropagation();
		})




		var hash = window.location.hash || '';
		hash = hash.substring(1);
		var pagePattern = /page:(about|policy|promo)/gi;
		var modePattern = /mode:(resemblance|fuzzy|tagged)/gi;
		var itemIDPattern = /id:([0-9]+)/gi;
		var categoryPattern = /category:([0-9]+)/gi;
		var optionsPattern = /options:([0-9,]+)/gi;

		var mode = modePattern.exec(hash);
		var itemID = itemIDPattern.exec(hash);
		var page = pagePattern.exec(hash);
		app.params.itemID = null !== itemID ? itemID[1] : 0;
		if (null !== mode) {
			switch (mode[1]) {
				case 'resemblance':
					app.catalog.toggle.resemblance(0,0);
					break;
				case 'fuzzy':
					app.catalog.toggle.fuzzy(true);
					break;
				case 'tagged':
					var categoryID = categoryPattern.exec(hash);
					var optionsID = optionsPattern.exec(hash);
					app.params.categoryID = 0;
					if (null !== optionsID) {
						app.catalog.options.add(optionsID[1].split(','), true, true);
					}
				default:
					app.catalog.toggle.tagged(app.params.categoryID, app.params.options, true);
			}
		} else {
			if (null !== page) {
				app.pages.load(page[1]);
			} else {
				app.catalog.toggle.tagged(0, [], true);
			}
		}

		if (0 != app.params.itemID) {
			app.catalog.item.loadAndShowInfo(app.params.itemID);
		}

		$('.modal-container .modal .params .f').on('click', 'a', function() {
			app.catalog.options.add([$(this).attr('data-oid')], true, true);
			app.catalog.item.closeInfo();
		});




		$('.controls.resemblance .reset').on('click', function() {
			app.catalog.toggle.resemblance(0, 0);
		});

		//app.tour.start();


		$('.taketour').on('click', function() {
			app.tour.start();
		});


		$(document).on('mouseover', '.overlay .inner.rs a.td', function() {
			$(this).css('color', '#b44');
		});
		$(document).on('mouseover', '.overlay .inner.rs a.tu', function() {
			$(this).css('color', '#095');
		});
		$(document).on('mouseover', '.overlay .inner a.zoomer', function() {
			$(this).css('color', '#000');
		});
		$(document).on('mouseout', '.overlay .inner a', function() {
			$(this).css('color', '#666');
		});

		$('.content').on('click', '.overlay .tu, .overlay .td', function(e) {
			e.stopPropagation();
			var type = $(this).hasClass('tu') ? 1 : -1;
			var itemID = $(this).parent().parent().parent().attr('data-id');
			app.catalog.toggle.resemblance(itemID, type);
		});

		$('.strip .closer').on('click', function(e) {
			e.stopPropagation();
			$('.strip').css('display', 'none');
		});
	},

	rebuildModal: function() {
		$('.backdrop').css('width', $(window).width());
		$('.backdrop').css('height', $(window).height());
		$('.modal-container').css('left', (Math.floor(($(window).width() - $('.modal-container').width()) / 2) + 'px'));
		//$('.modal-container').css('max-height', ($(window).height() - 2 * parseInt($('.modal-container').css('top'))) + 'px');
		$('.subscription-container').css('left', (Math.floor(($(window).width() - $('.subscription-container').width()) / 2) + 'px'));

		if ($(window).width() < 1220) {
			$('body').addClass('s').removeClass('m');
		} else {
			$('body').removeClass('s').addClass('m');
		}

		//$('.toggle-depts').css('left', '-' + (($(window).width() -  parseInt($('.content-container .content').css('width'), 10)) / 4 + 18) + 'px');
		//$('body > .depts').css('height', parseInt($(window).height(), 10) + 'px');
	},

	hash: {

		generate: function() {
			var hashComponents = [];
			hashComponents.push('mode:' + app.params.mode);
			switch (app.params.mode) {
				case 'tagged':
					if (app.params.categoryID != 0) {
						hashComponents.push('category:' + app.params.categoryID);
					}
					if (app.params.options.length > 0) {
						hashComponents.push('options:' + app.params.options.join(','))
					}
					break;
			}
			if (app.params.itemID != 0) {
				hashComponents.push('id:' + app.params.itemID);
			}
			window.location.hash = hashComponents.length == 0 ? '!/' : hashComponents.join(';');
		}

	},

	content: {

		buildCards: function(response, forceReload) {
			var columnNumber = 4;
			if ($('body').hasClass('s')) {
				columnNumber = 3;
			}
			var d = eval('(' + response + ')');
			if (forceReload) {
				$('.content-container > .content').html('');
			} else {
				$('.content-container > .content .loader, .content-container > .content .empty').remove();
			}
			var totalCards = 0;
			var promo = app.params.categoryID == 0 && app.params.options.length == 0 && app.params.mode == 'tagged' && app.params.page == 0 && d.promo == '1';

			$.each(d.data, function(index, value) {
				var objString = JSON.stringify(value);
				totalCards++;
				var classNamePromo = '';
				if (totalCards == 1 && promo) {
					classNamePromo = ' promo';
					totalCards = 3;
				}
				if (totalCards == 5 && promo && app.params.deptID != 2) {
					totalCards = 8;
				}
				if (totalCards == 6 && promo && app.params.deptID == 2) {
					totalCards = 9;
				}
				var className3 = totalCards % 3 == 0 ? ' c3' : '';
				var className4 = totalCards % 4 == 0 ? ' c4' : '';
				var className5 = totalCards % 5 == 0 ? ' c5' : '';

				var discounted = value.discounted == '1' ? "<div class='discounted'></div>" : '';
				var discountedClass = value.discounted == '1' ? ' discounted' : '';
				var favourite = value.fav == '1' ? " class='active'" : '';
				var rs = app.params.mode == 'resemblance' ? ' rs' : '';
				var caption = app.params.deptID == 3 ? "<div class='title'><span class='caption'>" + value.name + "</span>by <span class='author'>" + value.author + "</span></div>" : '';
				var rst = app.params.mode == 'resemblance' ? "<a class='tu'><i class='icon-thumbs-up'></i>like</a><a class='td'><i class='icon-thumbs-down'></i>dislike</a>" : "";
				$('.content-container > .content').append(
					"<div class='card card" + value.id + classNamePromo + discountedClass + className3 + className4 + className5 + "' data-id='" + value.id + "'>" +
						"<div class='image'>" +
							"<div data-url='" + value.cover + "' style='background-image:url(/data/" + value.cover + "-details.jpg)'></div>" +
						"</div>" + discounted + caption +
						"<span class='os'>" + objString + "</span>" +
						"<span class='buy'>" + value.href + "</span>" +
						"<ul class='info'>" +
						"<li class='price'><span class='value'>$" + value.price + "</span><span class='key'>price</span></li>" +
						"<li class='views'><span class='value'>" + value.views + "</span><span class='key'>views</span></li>" +
						"<li class='fav'><a" + favourite + " href='javascript:void(0)'><i class='icon-star'></i></a></li>" +
						"</ul>" +
						"<span class='overlay' href='javascript:void(0)'><div class='inner" + rs + "'><a class='zoomer'><i class='icon-zoom-in'></i>details</a>" +
						rst +
						"<div class='caption'>" + value.name + "</div></div>" +
						"</span>" +
					"</div>"
				);
				if (app.params.deptID == 3) {
					$('.card' + value.id + ' .title').css('margin-top', (Math.floor((66 - $('.card' + value.id + ' .title').height()) / 3)) + 'px');
				}
			});

			if (totalCards == 0 && forceReload) {
				$('.content-container > .content').append("<div class='empty'>" + data.strings.catalogNoResults + "</div>");
			}
			$('.content-container > .content').append("<div class='clearfix'></div>");
			if (d.complete == 0) {
				$('.content-container > .content').append("<a class='loader' href='javascript:void(0)'><i class='icon-arrow-down icon-4x'></i></a>");
			} else {
				$('.content-container > .content .loader').remove();
			}
			app.params.page++;
			app.params.loading = false;
		}

	},

	users: {

		card: {

			createFromPromo: function() {
				var email = $('#email').val();
				var username = $('#username').val();
				var text = $('#text').val();
				$.post('/controller/card/get-promo-data/', {'email': email, 'username': username, 'text': text}, function(response) {
					alert(response);
				})
			}

		}

	}

}

Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) { return i; }
		}
		return -1;
	}
}
