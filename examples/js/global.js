$(function () {
	
	var $window = $(window),
		$example;
	
	$example = $('#example-basic');
	if ($example.length) {
		(function () {
			// dom
			var $notification = $example.find('#notification-main');
			// init plugin
			$notification.Qnotification({ debug : true });
			
			window.message = function (m) {
				$notification.Qnotification('add', m);
			};
			
			$notification.on('click', function () {
				if (debug) console.log('Event: notification: close');
			
				var $this = $(this);
				var $target = $this.find('.active');
				if (!$target.length) {
					if (debug) console.log('Event: notification: target not found');
					return;
				}
				$target.find('.close_btn').click();
			});
		})();
	}
});