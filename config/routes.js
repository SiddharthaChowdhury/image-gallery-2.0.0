var Datastore = require('nedb');
var Images = new Datastore({ filename: './em-data/images.db', autoload: true }); 
module.exports = function($){
/* =====================================================================
*						Routes comes here.		
*	Please note:
*		`$` is an instance of `express.Router` class
*		to know more visit : 
*		https://expressjs.com/en/guide/routing.html#express-router
*  ---------------------------------------------------------------------
*/

	$.get('/', function(req, res){
		res.render("index", {host: req.protocol+'://'+req.get('host'), section: "library"});
	})

	$.get('/upload', function(req, res){
		res.render("index", {host: req.protocol+'://'+req.get('host'), section: "upload"});
	})	

	$.post('/upload-image',function(req, res){
		if (!req.files){
		    res.status(400)
		    return res.json({mag: 'No files were uploaded.'});
		}
		var raw = req.body;
		let file = req.files.incoming;
		let filename = Date.now() 

		var extension = file.name.split('.').pop();
	    filename = filename+'.'+extension;
	    
	    var tags = null;
	    if( raw.tags ){
	    	tags = raw["tags"].split(",");
		    for(var i = 0; i < tags.length; i++){
		    	tags[i] = tags[i].trim();
		    }
	    } 
		    
		  // Use the mv() method to place the file somewhere on your server 
		file.mv('./public/'+filename, function(err) {
		    if (err)  return res.status(500).send(err);
		    var imageData = {
		    	filename,
		    	filetype: "image",
		    	extension,
		    	title: raw["image-name"],
		    	alt: raw["alt-text"] || null,
		    	tags,
		    	dated: new Date().toLocaleString()
		    }
		    Images.insert(imageData, function(err, doc) {  
			    if(err) return res.status(500).send(err);
			    return res.json({msg:"File is uploaded!", data: doc})
			});
		});
	});


// =====================================================================
return $;}