var app = {
	eventBind: function () {
		this.$title = $('.mdl-layout-title');
		this.$body = $('.mdl-layout__content');
		this.$homeTabs = $('.mdl-layout__tab-bar-container');
		this.$tab1 = $('#fixed-tab-1');
		this.$tab2 = $('#fixed-tab-2');
		this.$tab3 = $('#fixed-tab-3');
		this.$tab4 = $('#fixed-tab-4');

		this.$singleSelectOptionsTrigger = $('.single-select-options-trigger');
		this.$singleSelectOptionsTrigger.on('click', this.toggleSingleSelectOptionsTrigger.bind(this));
		
		this.$filter = $('input[name="filter"]');
		this.$filter.on('change', this.filterList.bind(this));

		this.$href = $('[data-href]');
		this.$href.on('click', this.requestPage);

		this.$settings = $('.settings-list');
		this.$settings.on('change', '#settings-user-join, #settings-user-name, #settings-user-phone, #settings-user-email, #settings-user-location', this.updateUserSettings);
	},

	init: function () {
		this.eventBind();
		this.initFileUploadDialog();
		this.$title.text('Weekenders');

		if (storage.get('userId') == null || storage.get('userId') == '') {
		
			//socket.emit('request.user', {type : 'new'});

		}
		else {

			this.$settings.find('#settings-user-join').prop('checked', true).each(function() {
				$(this).closest('.mdl-switch').removeClass('is-disabled').addClass('is-checked');
			});

			this.enableSettingsInput();

			socket.emit('request.user', {type : 'get', id : storage.get('userId')});

		}
	},

	render : function (data) {

		$('body').html(data.content);
		componentHandler.upgradeDom();
		this.init();

	},

	requestPage : function () {

		socket.emit('request.page', {page : $(this).data('href')});

	},

	toggleSnackbar : function (data = {}) {

		if(jQuery.isEmptyObject(data)) {

			data = {
				message: 'Default',
				actionHandler: function(event) {},
				actionText: ' ',
				timeout: 2000
			};

		}

		document.querySelector('.mdl-js-snackbar').MaterialSnackbar.showSnackbar(data);

	},

	toggleSingleSelectOptionsTrigger: function (e) {

		var options = $(e.target).closest('tr').find('.single-select-options');

		if (options.css('left') == '0px') {
			options.css('left', '100%');
		}
		else {
			options.css('left', '0px');
		}
	},

	filterList: function (e) {
		var filter = $(e.target).val();
		console.log(filter);
	},

	initFileUploadDialog: function () {
		var dialog = document.querySelector('.mdl-dialog');
		var showDialogButton = document.querySelector('#upload-schedule');
		if (!dialog.showModal) {
			dialogPolyfill.registerDialog(dialog);
		}
		showDialogButton.addEventListener('click', function () {
			$('.mdl-layout__obfuscator').click();
			dialog.showModal();
		});
		dialog.querySelector('.dialog-close').addEventListener('click', function () {
			dialog.close();
		});
	},

	updateUserSettings : function (e) {

		var input = e.target.id;
		input = input.split('-');
		input = input[input.length - 1];

		var data = {};

		switch(input) {
			case 'join':

				var msg = '';

				if($(e.target).is(":checked")) {
					msg = 'Welcome to the team!';

					app.enableSettingsInput();

					socket.emit('request.user', {type : 'new'});
				}
				else {
					msg = 'See you next time...';

					if (storage.get('userId') != null || storage.get('userId') != '') {
						socket.emit('request.user', {type : 'del', id : storage.get('userId')});
					}
				}

				app.toggleSnackbar({
					message: msg,
					actionHandler: function(event) {},
					actionText: ' ',
					timeout: 2000
				});

				break;

			case 'name':
			case 'phone':
			case 'email':

				data[input] = $(this).val();

				socket.emit(
					'request.user',
					{
						type : 'set',
						id : storage.get('userId'),
						data : data
					}
				);

			break;

			case 'location':

				data.location_service = $(this).is(':checked') ? 1 : 0;

				socket.emit(
					'request.user',
					{
						type : 'set',
						id : storage.get('userId'),
						data : data
					}
				);

			break;
		}

	},

	enableSettingsInput : function () {

		this.$settings.find('#settings-user-name, #settings-user-phone, #settings-user-email').prop('disabled', false).each(function() {

			$(this).closest('.mdl-textfield').removeClass('is-disabled');

		});

		this.$settings.find('#settings-user-location').prop('disabled', false).each(function() {

			$(this).closest('.mdl-switch').removeClass('is-disabled');

		});

	},

	disableSettingsInput : function () {

		this.$settings.find('#settings-user-name, #settings-user-phone, #settings-user-email').prop('disabled', true).each(function() {

			$(this).closest('.mdl-textfield').addClass('is-disabled').removeClass('is-dirty is-focused');
			$(this).val('');

		});

		this.$settings.find('#settings-user-location').prop('disabled', true).prop('checked', false).each(function() {

			$(this).closest('.mdl-switch').addClass('is-disabled').removeClass('is-checked');

		});

	}
}

// #####################################################################
// GOOGLE MAPS API
// #####################################################################

var initMap = function() {
	navigator.geolocation.getCurrentPosition(

		function (pos) {
			var latlng = {
				lat: pos.coords.latitude,
				lng: pos.coords.longitude
			};
			var map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: latlng
			});
			var marker = new google.maps.Marker({
				position: latlng,
				map: map
			});
		},

		function (err) {
			console.warn('ERROR(' + err.code + '): ' + err.message);
		},

		{
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		}
	);
}

// #####################################################################
// SOCKET.IO
// #####################################################################

var socket = io.connect('http://localhost:3000');

/*
//SEND
socket.emit('topic', { key: 'value' });

//RECEIVE
socket.on('topic', function (data) {
	console.log(data);
});
*/

socket.on('respose.page', function (data) {
	app.render(data);
});

socket.on('respose.user', function (data) {

	switch(data.type) {

		case 'new':

			storage.set('userId', data.user.id);

			break;

		case 'get':
			
			var inputs = ['name', 'phone', 'email', 'location'];
			var user = data.user;

			for (var i in inputs) {

				if (user[inputs[i]] == null || user[inputs[i]] == undefined || user[inputs[i]] == '') return;

				var input = app.$settings.find('#settings-user-' + inputs[i]);

				if(inputs[i] == 'location') {

					if (user['location_service'] == 1) {

						input.prop('checked', true).each(function() {
							$(this).closest('.mdl-switch').addClass('is-checked');
						});

					}

				} else {

					input.val(user[inputs[i]]);
					input.closest('.mdl-textfield').addClass('is-dirty');

				}

			}

			break;

		case 'set':

			var settings = {
				message: 'Default',
				actionHandler: function(event) {},
				actionText: ' ',
				timeout: 2000
			};

			settings.message = data.saved ? 'Saved!' : 'Error, Please try again!'

			app.toggleSnackbar(settings);

			break;

		case 'del':

			if(data.isDeleted) {
				storage.del('userId');
				app.disableSettingsInput();
			}

			break;
	}

});

// #####################################################################
// Local Storage
// #####################################################################

var storage = {
	set: function(key = '', val = '') {
		window.localStorage.setItem(key, val);
	},
	get: function(key = '') {
		return key == '*' ? window.localStorage : window.localStorage.getItem(key);
	},
	del: function(key = '') {
		key == '*' ? window.localStorage.clear() : window.localStorage.removeItem(key);
	}
};

// #####################################################################
// DEV
// #####################################################################

function log (a) {
	console.log(a);
}

window.addEventListener('hashchange', function() {

	var hash = window.location.hash;
	
});