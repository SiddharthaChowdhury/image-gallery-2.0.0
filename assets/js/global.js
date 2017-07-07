$(document).ready(function(){
	// tooltip
	$('[data-toggle="tooltip"]').tooltip();

	$('.trigger-file-upload').click(function(e){
		e.preventDefault();
		$("#file-select").click();
	})

    // Disable form submit on ENTER pressed
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

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
                mike.html('<font><b>Please wait ... </b></font>')
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
                    success: function(data, textStatus, jqXHR){
                        setTimeout(function(){ 
                            mike.html('<font color="green"><b>Success! </b>Image saved successfully.</font>')
                            location.reload(); 
                        }, 1500);
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        mike.html('<font color="red"><b>Error! </b>Upload failed.</font>')
                        location.reload();
                    }
                });
            }else{
                mike.html('<font color="red"><b>Error! </b> File is not an image. </font>')
            }
        }
    })


    // Thumbnail click from gallery
    $('.jq_thumbnail').click(function(e){
        e.preventDefault();

        if( $('#chosen-id').val().trim() != $(this).attr('data-id').trim() ){
            var formdata = new FormData();
            formdata.append("id", $(this).attr('data-id'));
            $.ajax({
                url: '/get-image',
                type: 'POST',
                data: formdata,
                cache: false,
                dataType: 'json',
                processData: false, // Don't process the files
                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                success: function(data, textStatus, jqXHR){
                    // textStatus = success
                    var img = data.img
                    $('.chosen-name').text(img.filename);
                    $('.chosen-size').text(img.size);
                    $('.chosen-diam').text(img.width+" x "+img.height);
                    $('.chosen-date').text(img.dated);
                    $('.chosen-image').attr("src", $("#host").val()+img.link);
                    $('.chosen-image').attr("title", img.title);
                    $('.chosen-image').attr("alt", img.alt);
                    // console.log()
                    // $('.bootstrap-tagsinput').find('input').val("")
                    // $('.bootstrap-tagsinput').find('input').val(img.tags != null ? img.tags.join(",") : "")
                    $('#chosen-tags').val(img.tags != null ? img.tags.join(",") : "");
                    $('#chosen-title').val(img.title);
                    $('#chosen-alt').val(img.alt);
                    $('#chosen-desc').text(img.desc);
                    $('#chosen-id').val(img._id);
                },
                error: function(jqXHR, textStatus, errorThrown){
                    // textStatus = error
                    console.log(errorThrown)
                }
            });
        }
            
    })

});
