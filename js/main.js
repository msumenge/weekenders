var app = {
		jqueryElm: function () {
			this.$title = $('.mdl-layout-title');
			this.$tab1 = $('#fixed-tab-1');
			this.$tab2 = $('#fixed-tab-2');
			this.$tab3 = $('#fixed-tab-3');
			this.$tab4 = $('#fixed-tab-4');
			this.$singleSelectOptionsTrigger = $('.single-select-options-trigger');
			this.$filter = $('input[name="filter"]');
		}
		, jqueryElmBind: function () {
			this.$singleSelectOptionsTrigger.on('click', this.toggleSingleSelectOptionsTrigger.bind(this));
			this.$filter.on('change', this.filterList.bind(this));
		}
		, init: function () {
			this.jqueryElm();
			this.jqueryElmBind();
			this.initFileUploadDialog();
			this.$title.text('Weekenders');
		}
		, toggleSingleSelectOptionsTrigger: function (e) {
			var options = $(e.target).closest('tr').find('.single-select-options');
			if (options.css('left') == '0px') {
				options.css('left', '100%');
			}
			else {
				options.css('left', '0px');
			}
		}
		, filterList: function (e) {
			var filter = $(e.target).val();
			console.log(filter);
		}
		, initFileUploadDialog: function () {
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
		}
	}
	// GOOGLE MAPS API
function initMap() {
	var options = {
		enableHighAccuracy: true
		, timeout: 5000
		, maximumAge: 0
	};
	navigator.geolocation.getCurrentPosition(function (pos) {
		var latlng = {
			lat: pos.coords.latitude
			, lng: pos.coords.longitude
		};
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 16
			, center: latlng
		});
		var marker = new google.maps.Marker({
			position: latlng
			, map: map
		});
	}, function (err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
	}, options);
}