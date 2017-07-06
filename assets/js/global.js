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
                $('input[name="image_name"]').val(file.name)
                $('#myModal').modal('show');
            }
            img.src = _URL.createObjectURL(file);
        }
    }
    
    // When input file is selected
    var __FILE;
    $("#file-select").change(function(e){
        readURL(this);
        __FILE = e.target.files[0];
    });

    // When Image is uploaded with its details
    $('#image-upload-form').submit(function(e){
        e.preventDefault();
        var _self   = $(this);
        var mike    = _self.find('.si_mike');
        var file    = __FILE;
        console.log(file)
        if(_self.find('input[name="image_name"]').val() == ""){
            mike.html('<font color="red"><b>Error! </b> Image TITLE is mandetory. </font>')
        }else{
            if(file.type.match('image')){
                var formdata = new FormData();
                formdata.append("incoming", file);
                formdata.append("image-name", _self.find('input[name="image_name"]').val())
                formdata.append("alt-text", _self.find('input[name="image_caption"]').val())
                formdata.append("tags", _self.find('input[name="tags"]').val())
                formdata.append("description", _self.find('textarea[name="description"]').val())
                $.ajax({
                    url: '/upload-image',
                    type: 'POST',
                    data: formdata,
                    cache: false,
                    dataType: 'json',
                    processData: false, // Don't process the files
                    contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                    success: function(data, textStatus, jqXHR)
                    {
                        mike.html('<font color="green"><b>Success! </b>Image saved successfully.</font>')
                        setTimeout(function(){ location.reload(); }, 1500);
                        
                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                        // Handle errors here
                        mike.html('<font color="red"><b>Error! </b>Upload failed.</font>')
                        location.reload();
                        // STOP LOADING SPINNER
                    }
                });
            }else{
                mike.html('<font color="red"><b>Error! </b> File is not an image. </font>')
            }
        }
    })

});
