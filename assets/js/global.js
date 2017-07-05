$(document).ready(function(){
	// tooltip
	if($('#upload-section').length != 0){
		$('[data-tooltip="true"]').tooltip(); 
	    var x = new $Incoming({
			dropAreaID : "#upload-section", // this element should have fixed height,
			uploadURL : "/upload-image",
			method: "POST", // 'GET' or 'POST'
			handlerName: "incoming",
			uploadSuccess: function(data){
				console.log(data)
			}
		});
	}
});