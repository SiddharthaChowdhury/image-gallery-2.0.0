$(document).ready(function(){
	// tooltip
	// if($('#upload-section').length != 0){
	// 	$('[data-tooltip="true"]').tooltip(); 
	//     var x = new $Incoming({
	// 		dropAreaID : "#upload-section", // this element should have fixed height,
	// 		uploadURL : "/upload-image",
	// 		method: "POST", // 'GET' or 'POST'
	// 		handlerName: "incoming",
	// 		uploadSuccess: function(data){
	// 			console.log(data)
	// 		}
	// 	});
	// }
	$('.trigger-file-upload').click(function(e){
		e.preventDefault();
		$("#file-select").click();
	})

	// function readURL(input) {
 //        if (input.files && input.files[0]) {
 //            var reader = new FileReader();
 //            var file = input.files[0];
 //            var sizeKB = file.size / 1024;
 //            reader.onload = function (e) {
 //                $('#preview-on-trigger').attr('src', e.target.result);
 //                // $('#myModal').show()
 //                alert("Size: " + sizeKB + "KB\nWidth: " + reader.width + "\nHeight: " + reader.height);
 //                $('#myModal').modal('show');
 //            }
            
 //            reader.readAsDataURL(input.files[0]);
 //        }
 //    }
	var _URL = window.URL || window.webkitURL;
    function readURL(input) {
        if (input.files && input.files[0]) {
            var img = new Image();
            var file = input.files[0];
            var sizeKB = file.size / 1024;
            img.setAttribute("class","col-md-12");
            img.onload = function (e) {
                // $('#preview-on-trigger').attr('src', e.target.result);
                $('#prev-container').html(img)
                // alert("Size: " + sizeKB + "KB\nWidth: " + img.width + "\nHeight: " + img.height);
                $('.prev_size').text(Math.round(sizeKB * 100) / 100);
                $('.prev_diamention').text(img.height +" x "+ img.width);
                $('#myModal').modal('show');
            }
            
            img.src = _URL.createObjectURL(file);
        }
    }
    $("#file-select").change(function(){
        readURL(this);
    });

});
