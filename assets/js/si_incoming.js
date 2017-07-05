/*
    Classes used:
    1. Drop area:           '.si_droparea'
    2. Choose file button:  '.si_chooseFiles'
    3. Close button:        '.si_closeUpload'

    How to initialize?
    Example: 
    var x = new $Incoming({
        dropAreaID : "#wrapper",        // this element should have fixed height
        uploadURL : "/upload-image",    // URL which saves the files
        uploadSuccess: function(data){  // When each file is successfully uploaded
            console.log(data)
        }
    });
*/
function $Incoming(conf){
    this.drop_cont = document.querySelector(conf.dropAreaID);
    this.uploadSuccess = conf.uploadSuccess || function(data){console.log("default response", data)};
    // this.maxUploadSize = conf.maxUploadSize || '5 MB'
    this.uploadURL = conf.uploadURL;
    this.fileTypes = conf.fileTypes; // array
    this.dropZone = null;
    this.progCont = null;
    this.filelist = [];
    this.handlerName = conf.handlerName || 'incoming';
    this.method = conf.method || 'POST';
    this._init();
}

$Incoming.prototype._init = function(){
    /*
    *   Creating the structure:
        |-- dropzone(Overlay)
        |-- --  top nav
        |-- -- --  hidden input file
        |-- -- --  choose files button
        |-- --  close button
    */
    this.drop_cont.setAttribute('style', 'position: relative;');
    var self = this;
    var overlay = document.createElement('div');
    overlay.setAttribute('class', 'si_droparea');
    overlay.setAttribute('style', 'position: absolute;');
    overlay.addEventListener('dragover', function(e){
        e.preventDefault();
    });
    overlay.addEventListener('drop', function(e){
        e.preventDefault();
        var files = e.dataTransfer.files; //returns a FileList object
        self._processFiles(files);
    })

    var overlayTopNav = document.createElement('div');
    overlayTopNav.setAttribute('style', 'padding:15px; font-size:0.9em; margin-bottom:15px;')
    overlayTopNav.innerHTML = 'Drag and Drop your images below or simply '

    var preUploadCont = document.createElement('div');
    preUploadCont.setAttribute('style', 'padding:10px 20px;');

    var inputFile = document.createElement('input');
    inputFile.setAttribute('type', 'file');
    inputFile.setAttribute('id', 'chooseFiles');
    inputFile.setAttribute('multiple', true);
    inputFile.setAttribute('style', 'display: none;');
    inputFile.addEventListener('change', function(e){
        var files = e.target.files //returns a FileList object
        self._processFiles(files);
    })

    var chooseButton = document.createElement('a');
    chooseButton.innerHTML = 'Choose Files!'
    chooseButton.setAttribute('class', 'si_chooseFiles')
    chooseButton.addEventListener('click', function(){
        inputFile.click()
    })

    overlayTopNav.appendChild(chooseButton);
    overlayTopNav.appendChild(inputFile);

    var closeOverlay = document.createElement('a');
    closeOverlay.innerHTML = '&#10006;';
    closeOverlay.setAttribute('class', 'si_closeUpload');
    closeOverlay.setAttribute('style', 'position: absolute; cursor:pointer; right: 10px; top: 10px; font-size: 17px; text-decoration: none; color: #fff; border-radius: 50%; border: 2px solid #fff; padding: 5px 10px;')
    closeOverlay.addEventListener('click', function(e){
        overlay.style.display = 'none';
    })
    overlay.appendChild(overlayTopNav);
    overlay.appendChild(closeOverlay);
    overlay.appendChild(preUploadCont);
        
    self.drop_cont.appendChild(overlay);
    self.dropZone = overlay;
    self.progCont = preUploadCont;
}

$Incoming.prototype._processFiles = function(files){
    var self = this;
    // if(self.filelist.length < 10){
        for(var i = 0; i < files.length; i++){
            var file = files[i];
            // if file is image and size is proper
            if(file.type.match('image')){ 
                var FR = new FileReader();
                FR.onload = (function(file){
                    return function(evt){
                        __ajxUpload(evt, file);
                    }
                })(file)
                FR.readAsDataURL(file)
                self.filelist.push(file) 
            }
        }
    // }
    // else{
    //     alert("Maximum 10 files can be uploaded at a time.")
    // }

    function __ajxUpload(evt, file){
        var formdata = new FormData();
        formdata.append(self.handlerName, file);
        var progressDOM = __cookProgressBars( file );
        var ajax = new XMLHttpRequest();
        ajax.open(self.method, self.uploadURL);
        ajax.setRequestHeader("encType", "multipart/form-data");
        ajax.upload.addEventListener("progress", (function(progressDOM){
            return function(event) {
                ___updateProgressStatus(event, progressDOM);
            };
        })(progressDOM), false);
        ajax.addEventListener("load", (function(progressDOM){
            return function(event){
                if(ajax.status != 404)
                    ___completeUpload(event, progressDOM);
            }
        })(progressDOM), false);
        ajax.addEventListener("error", (function(progressDOM){
            return function(event){
                ___uploadError(event, progressDOM);
            }
        })(progressDOM), false);
        ajax.addEventListener("abort", (function(progressDOM){
            return function(event){
                ___uploadAbort(event, progressDOM);
            }
        })(progressDOM), false);
        ajax.addEventListener("loadend", (function(progressDOM){
            return function(event){
                if(ajax.status == 404) {
                    ___uploadError(event, progressDOM);
                }
            }
        })(progressDOM), false);

        ajax.onreadystatechange = function() {//Call a function when the state changes.
            if(ajax.readyState == XMLHttpRequest.DONE && ajax.status == 200) {
                
            }
        }
        // ajax.send("foo=bar&lorem=ipsum"); 
        ajax.send(formdata);
    }

    function __cookProgressBars( file ){
        /*
        *   Creating the structure of progress:
            |-- each(Progress box)
            |-- -- image name [size:]
            |-- -- progress bar
            |-- -- Status + Percent %
        */
        var _size = file.size;
        var fSExt = new Array('Bytes', 'KB', 'MB', 'GB'),
        i=0;while(_size>900){_size/=1024;i++;}
        var exactSize = (Math.round(_size*100)/100)+' '+fSExt[i];

        var each = document.createElement('div');
        each.setAttribute('style', 'position:relative; padding:10px; width:200px; font-size:0.7em; display:inline-block; margin:10px 10px 0px 0px;');

        var frst = document.createElement('div');
            var nm = document.createElement('a');
            nm.setAttribute('style', 'text-decoration:none; ')
            nm.innerHTML = file.name.length > 20 ? file.name.substring(0,20)+'...'+' ('+exactSize+')' : file.name+' ('+exactSize+')';
        
            var clsBx = document.createElement('a');
            clsBx.setAttribute('style', 'cursor:pointer; color:silver; text-decoration:none; margin-left 10px; position:absolute; top:5px; right:5px;')
            clsBx.innerHTML = '&#10006;';
            clsBx.addEventListener('click', function(e){
                e.preventDefault();
                self.progCont.removeChild(each);
            })
        frst.appendChild(nm); frst.appendChild(clsBx);

        var progress = document.createElement('div');
        progress.setAttribute('style', 'height:2px; width:90%; background-color:yellow; margin:5px 0px;')

        var last = document.createElement('div')
            var status = document.createElement('a');
            status.setAttribute('style', 'text-decoration:none; margin-left 10px;')
            status.innerHTML = 'uploading..';

            var percent = document.createElement('a');
            percent.setAttribute('style', 'text-decoration:none; margin-left 10px;')
            percent.innerHTML = '0%';
        last.appendChild(status); last.appendChild(percent);

        each.appendChild(frst)
        each.appendChild(progress)
        each.appendChild(last)

        var retrn = {};
        retrn['thisUplod'] = each;
        retrn['progHndlr'] = progress;
        retrn['percentHndlr'] = percent;
        retrn['statusHndlr'] = status;

        self.progCont.appendChild(each);
        return retrn;
    }

    function ___updateProgressStatus(event, progressDOM){
        // _("loaded_n_total").innerHTML = "Uploaded "+event.loaded+" bytes of "+event.total;
        var percent = (event.loaded / event.total) * 100;
        progressDOM.percentHndlr.innerHTML = Math.round(percent)+'%';
        progressDOM.progHndlr.style["width"] = Math.round(percent)+'%'; 
        // console.log("Uploaded "+event.loaded+" bytes of "+event.total+" Percent:"+Math.round(percent)+"% uploaded... please wait")
    }
    function ___completeUpload(event, progressDOM){
        progressDOM.progHndlr.style['background-color'] = '#40FF00';
        progressDOM.statusHndlr.innerHTML = '<font color="#40FF00">Upload complete. </font>';
        self.uploadSuccess(event.target.response)
        // setTimeout(function(){
        //     progressDOM.thisUplod.parentNode.removeChild( progressDOM.thisUplod );
        // },7000);
    }
    function ___uploadError(event, progressDOM){
      progressDOM.progHndlr.style['background-color'] = 'red';
        progressDOM.statusHndlr.innerHTML = '<font color="red">Failed! </font>';
        // setTimeout(function(){
        //     progressDOM.thisUplod.parentNode.removeChild( progressDOM.thisUplod );
        // },9000);
    }
    function ___uploadAbort(event, progressDOM){
        progressDOM.progHndlr.style['background-color'] = 'red';
        progressDOM.statusHndlr.innerHTML = '<font color="red">Aborted! </font>';
        // setTimeout(function(){
        //     progressDOM.thisUplod.parentNode.removeChild( progressDOM.thisUplod );
        // },9000);
    }
}