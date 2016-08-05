data = {
		
	tour: [
		{'c': 'Take a tour',
		 'd': 'This tour will show you the basic functionality of Feel Geekish',
		 'bp': 'Next',
		 'bn': 'Close',
		 't': 90,
		 'p': 'r',
		 'h': 0,
		 'i': 168,
		 'o': 167,
		 'a': function() {
			app.catalog.toggle.tagged(0, [], true);
			app.ui.tools.tour.on();
			app.params.tour = true;
		 }
		},
		{'c': 'Filters',
		 'd': 'You can apply a lot of tags from drop-down menus and thus narrow you search criteria',
		 'bp': 'Next',
		 'bn': 'Close',
		 't': 195,
		 'p': 'l',
		 'h': 74,
		 'i': 15,
		 'o': 14,
		 'a': function() {
			$('.filters .filter100 a').trigger('click');
		 }
		},
		{'c': 'Filters',
		 'd': 'Click on as much options here as you like',
		 'bp': 'Next',
		 'bn': 'Close',
		 't': 255,
		 'p': 'l',
		 'h': 690,
		 'i': 15,
		 'o': 14,
		 'a': function() {
			app.catalog.options.add([106], false, true);
		 }
		},
		{'c': 'Fuzzy search',
		 'd': 'Click here to open Fuzzy Search tool',
		 'bp': 'Next',
		 'bn': 'Close',
		 't': 98,
		 'p': 'l',
		 'h': 619,
		 'i': 15,
		 'o': 14,
		 'a': function() {
			app.catalog.toggle.fuzzy(true);
		 }
		},
		{'c': 'Adjust parameters',
		 'd': 'Drag sliders left or right to fine-tune your search criteria. Fuzzy search ensures that at least a dozen of result will be shown',
		 'bp': 'Next',
		 'bn': 'Close',
		 't': 288,
		 'p': 'l',
		 'h': 496,
		 'i': 15,
		 'o': 14,
		 'a': function() {
			$('.trackbar:last-child .handler').trigger('mousedown');
			$('.trackbar:last-child .handler').animate({'left': '-=200px'}, 200, function() {
				$(document).trigger('mouseup');
			});
		 }
		},
		{'c': 'Tour is over',
		 'd': 'Thank you for taking this tour. Enjoy exploring Feel Geekish!',
		 'bp': '',
		 'bn': 'Close',
		 't': 90,
		 'p': 'r',
		 'h': 0,
		 'i': 168,
		 'o': 167,
		 'a': function() {}
		}
	],
	
	topStrip: 
		[
			{'active': false},
			{'active': false,
			 'text': "Halloween party supplies are one click away <i class='icon-hand-right'></i>",
			 'a': function() {
					  app.catalog.options.add([645], true, false);
					  app.catalog.toggle.tagged(0, app.params.options, true);
				  }
			},
			{'active': false},
			{'active': false}
		],
	
	strings: {
		
		catalogError: 'Sorry, something went wrong :(<br />Please try another search.',
		catalogLoading: 'Loading...',
		catalogNoResults: 'Sorry, nothing found :(<br />Please try another search.'
		
	},
	
	options: {
		
	}
	
}
