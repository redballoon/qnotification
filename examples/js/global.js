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
		})();
	}
});