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
                $('#uploadModal').modal('show');
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
                formdata.append("imageName", _self.find('input[name="image_name"]').val())
                formdata.append("altText", _self.find('input[name="image_caption"]').val())
                formdata.append("tags", _self.find('input[name="tags"]').val())
                formdata.append("description", _self.find('textarea[name="description"]').val())
                formdata.append("ownerId", _self.find('input[name="ownerId"]').val())
                formdata.append("img_token", _self.find('input[name="img_token"]').val())
                formdata.append("gallery", _self.find('input[name="gallery"]').val())
                $.ajax({
                    url: '/upload-image',
                    type: 'POST',
                    data: formdata,
                    cache: false,
                    dataType: 'json',
                    processData: false, // Don't process the files
                    contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                    success: function(data, textStatus, jqXHR){
                        mike.html('<font color="green"><b>Success! </b>Image saved successfully.</font>')
                        setTimeout(function(){ 
                            
                            location.reload(); 
                        }, 1500);
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                         mike.html('<font color="red"><b>Error! </b>Upload failed. Please reload and try again.</font>')
                        setTimeout(function(){ 
                            // location.reload(); 
                        }, 3000);
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
        $('.image-meta-edit').hide();
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
                    $('.chosen-title').text(img.title);
                    $('.chosen-name').text(img.filename);
                    $('.chosen-size').text(img.size);
                    $('.chosen-diam').text(img.width+" x "+img.height);
                    $('.chosen-date').text(img.dated);
                    $('.chosen-image').attr("src", $("#host").val()+img.link);
                    $('.chosen-image').attr("title", img.title);
                    $('.chosen-image').attr("alt", img.alt);
                    $('.chosen-url').attr("href", $("#host").val()+img.link);
                    $('.chosen-url').text($("#host").val()+img.link);
                    // console.log()
                    // $('.bootstrap-tagsinput').find('input').val("")
                    // $('.bootstrap-tagsinput').find('input').val(img.tags != null ? img.tags.join(",") : "")
                    $('#chosen-tags').val(img.tags != null ? img.tags.join(",") : "");
                    $('#chosen-title').val(img.title);
                    $('#chosen-alt').val(img.alt);
                    $('#chosen-desc').text(img.desc);
                    $('#chosen-id').val(img._id);
                    $('#chosen-file').val(img.filename);

                },
                error: function(jqXHR, textStatus, errorThrown){
                    // textStatus = error
                    console.log(errorThrown)
                }
            });
        }
    })

    // Editable image
    var image = document.getElementById('editable-image');
    var flips = { h: 1, v: 1 };
    var lastImgSrc = [];
    var cropper;
    $('.rotate-right').click(function(e){
        e.preventDefault();
        cropper.rotate(45);
    });
    $('.rotate-left').click(function(e){
        e.preventDefault();
        cropper.rotate(-45);
    });
    $('.flip-h').click(function(e){
        e.preventDefault();
        if(flips.h == 1){
            flips.h = 0;
            cropper.scale(-1, 1); // Flip horizontal
        }
        else{
            flips.h = 1;
            cropper.scale(1, 1); // Flip horizontal
        }
    });
    $('.flip-v').click(function(e){
        e.preventDefault();
        if(flips.v == 1){
            flips.v = 0;
            cropper.scale(1, -1); // Flip vertical
        }
        else{
            flips.v = 1;
            cropper.scale(1, 1); // Flip vertical
        }
    });

    $('._undoCrop').click(function(e){
        e.preventDefault()
        if(lastImgSrc.length > 0){
            var image = new Image()
            image.style = "width:100%;"
            image.onload = function() {
                cropper = new Cropper(this, {
                });
            }
            image.src = lastImgSrc.pop()
            $('#cropCanvas').html(image)
        }
    });

    $('.drag-image').click(function(e){
        e.preventDefault();
        cropper.setDragMode("move")
    });
    $('.start-crop').click(function(e){
        e.preventDefault();
        cropper.setDragMode("crop")
    });

    $('.zoom-in').click(function(e){
        e.preventDefault();
        cropper.zoom(0.1)
    });
    $('.zoom-out').click(function(e){
        e.preventDefault();
        cropper.zoom(-0.1)
    });

    // When edit/Settings button is pressed
    $('.edit-chosen').click(function(e){
        e.preventDefault()
        $('#cropCanvas').html("<i class='fa fa-cog fa-spin fa-fw'></i> Please wait ...")
        $('#editImgModal').modal('show');
        $("#editImgModal").on("shown.bs.modal", function() {
            var image = new Image()
            image.style = "width:100%;"
            // $(image).attr("src", $('.chosen-image').attr("src"));
            image.onload = function() {
                cropper = new Cropper(this, {
                });
                $('.si_modalWrapper').show()
            }
            image.src = $('.chosen-image').attr("src");
            lastImgSrc = [];
            $('#cropCanvas').html(image)
        })
        $('.image-meta-edit').show();
    });

    // When crop button is clicked
    $('._croppedImage').click(function(e){
        e.preventDefault();
        $('#editImgModal').find(".si_mike").html("Please wait..")
        lastImgSrc.push( $('.cropper-hidden').attr("src") )
        var image = new Image()
        image.style = "width:100%;"
        image.onload = function() {
            cropper = new Cropper(this, {
            });
            $('#editImgModal').find(".si_mike").html("")
        }
        image.src = cropper.getCroppedCanvas().toDataURL()
        $('#cropCanvas').html(image)
    });

    // Update image
    $('.jq_updateImgMeta').click(function(e){
        var self = $(this);
        if(lastImgSrc.length > 0){
            // Update with cropped image
            cropper.getCroppedCanvas().toBlob(function (blob) {
                var formData = new FormData();

                formData.append('incoming', blob);
                formData.append('fileName', $('#chosen-file').val())
                formData.append('_id',$('#chosen-id').val())
                formData.append('title',$('#chosen-title').val())
                formData.append('tags',$('#chosen-tags').val())
                formData.append('alt',$('#chosen-alt').val())
                formData.append('ownerId',$('#owner-id').val())
                formData.append('desc',$('#chosen-desc').val() || $('#chosen-desc').text())

                $.ajax('/update-image', {
                    method: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function () {
                        location.reload();
                    },
                    error: function () {
                        console.log('Upload error');
                        self.closest('.modal-dialog').find("._mike").html('<font color="red">Error! Failed to update the image.</font>')
                    }
                });
            });
        }else{
            // Update only details
            var formData = new FormData();
            formData.append('fileName', $('#chosen-file').val())
            formData.append('_id',$('#chosen-id').val())
            formData.append('title',$('#chosen-title').val())
            formData.append('tags',$('#chosen-tags').val())
            formData.append('alt',$('#chosen-alt').val())
            formData.append('desc',$('#chosen-desc').val() || $('#chosen-desc').text())
            $.ajax('/update-image', {
                method: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function () {
                    location.reload();
                },
                error: function () {
                    console.log('Upload error');
                    self.closest('.modal-dialog').find("._mike").html('<font color="red">Error! Failed to update the image.</font>')
                }
            });
        }
    });

    // On image preview button is pressed
    $('.preview-chosen').click(function(e){
        e.preventDefault();
        $("#img-in-viewer").attr("src", $('.chosen-image').attr("src"));
        $("#viewer-caption").text($('.chosen-image').attr('title'))
        $("#image-viewer").show();
    })
    // // Get the modal
    //     var modal = document.getElementById('image-viewer');

    //     // Get the image and insert it inside the modal - use its "alt" text as a caption
    //     var img = document.getElementById('viewable');
    //     var modalImg = document.getElementById("img-in-viewer");
    //     var captionText = document.getElementById("viewer-caption");
    //     img.onclick = function(){
    //         modal.style.display = "block";
    //         modalImg.src = this.src;
    //         captionText.innerHTML = this.alt;
    //     }

    //     // Get the <span> element that viewer-closes the modal
    //     var span = document.getElementsByClassName("viewer-close")[0];

    //     // When the user clicks on <span> (x), viewer-close the modal
    //     span.onclick = function() { 
    //         modal.style.display = "none";
    //     }
});
