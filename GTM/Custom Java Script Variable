function() {
  return function(model) {
    var endpoint = {{Cloud Function URL}}; //url of your cloud fucntion
    var globalSendTaskName = '_' + model.get('trackingId') + '_sendHitTask';
    var originalSendHitTask = window[globalSendTaskName] || model.get('sendHitTask');

    model.set('sendHitTask', function(sendModel) {
      var payload = sendModel.get('hitPayload'); 
      originalSendHitTask(sendModel);

      $.post(endpoint, {
    	payload: JSON.stringify(payload)
      });
    });

	}
}
