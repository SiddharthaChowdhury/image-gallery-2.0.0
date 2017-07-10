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
      	Images.find({}).sort({ dated: 1 }).skip(0).limit(20).exec(function (err, imgs) {
		  	if(err) return res.send("Error! Request failed due to to some unknown error.")
			res.render("index", {host: req.protocol+'://'+req.get('host'), section: "library", imgs});
		});
		
	})

	$.get('/upload', function(req, res){
		res.render("index", {host: req.protocol+'://'+req.get('host'), section: "upload"});
	})	

	// Upload image
	$.post('/upload-image',function(req, res){
		if (!req.files){
		    res.status(400)
		    return res.json({mag: 'No files were uploaded.'});
		}
		var raw = req.body;
		let file = req.files.incoming;
		let filename = Date.now();
		let sizeOf = require('image-size');
		let fs = require("fs");

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
		    	desc: raw.description || null,
		    	dated: new Date().toLocaleString(),
		    	link: "/image/"+filename,
		    	width: null,
		    	height: null,
		    	size: null
		    }
		    Images.insert(imageData, function(err, doc) {  
			    if(err) return res.status(500).send(err);
			    else{
			    	let dimensions = sizeOf('./public/'+filename);
					const stats = fs.statSync('./public/'+filename);
					const fileSizeInBytes = stats.size;
					const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;

					var updt = { 
						width: dimensions.width,
				    	height: dimensions.height,
				    	size: fileSizeInMegabytes
					};
					Images.update({_id: doc._id}, { $set: updt }, { }, function (err, update) {
						if(err) return res.status(500).send(err);
						return res.json({msg:"File is uploaded!", data: doc})
					});
			    }
			});
		});
	});

	// GET image details
	$.post('/get-image', function(req, res){
		var raw = req.body;
		if(!raw.id){
			res.status(400);
			return res.json({msg: "Error! image identification was not found!"})
		}else{
			Images.findOne({_id: raw.id}, function(err, img){
				if(err) return res.status(400).send(err);
				res.status(200);
				return res.json({msg:"Request was successful!", img});
			});
		}
	})

	// Update Image
	$.post('/update-image', function(req, res){
		// if (!req.files){
		//     res.status(400)
		//     return res.json({mag: 'No files were uploaded.'});
		// }
		var raw = req.body;
		if(!raw._id){
			res.status(400);
			return res.json({msg:"Update failed. (No identity) "})
		}
		if (req.files){
			let file = req.files.incoming;
			let filename;
			let sizeOf = require('image-size');
			let fs = require("fs");

			var extension = file.name.split('.').pop();
		    // filename = filename+'.'+extension;
		    
		    var tags = null;
		    if( raw.tags ){
		    	tags = raw["tags"].split(",");
			    for(var i = 0; i < tags.length; i++){
			    	tags[i] = tags[i].trim();
			    }
		    }
		    Images.findOne({_id: raw._id}, function(err, img){
		    	if(err || !img) {
		    		res.status(400)
		    		return res.send(err || "Error! Identity failed.")
		    	}
		    	var filename = img.filename;
		    	fs.unlink('./public/'+filename, function(err){
		    		if(err) {
		    			res.status(400);
		    			return res.send("Error! Image update failed. (replace of image failed)")
		    		}
		    		// Use the mv() method to place the file somewhere on your server 
					file.mv('./public/'+filename, function(err) {
					    if (err)  return res.status(500).send(err);
					    var imageData = {
					    	filename,
					    	filetype: "image",
					    	extension,
					    	title: raw["title"],
					    	alt: raw["alt"] || null,
					    	tags,
					    	desc: raw["desc"] || null,
					    	dated: new Date().toLocaleString(),
					    	link: "/image/"+filename,
					    	width: null,
					    	height: null,
					    	size: null
					    }
					    Images.update({_id: raw["_id"]}, imageData, function(err, doc) {  
						    if(err) return res.status(500).send(err);
						    else{
						    	let dimensions = sizeOf('./public/'+filename);
								const stats = fs.statSync('./public/'+filename);
								const fileSizeInBytes = stats.size;
								const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;

								var updt = { 
									width: dimensions.width,
							    	height: dimensions.height,
							    	size: fileSizeInMegabytes
								};
								Images.update({_id: raw._id}, { $set: updt }, { }, function (err, update) {
									if(err) return res.status(500).send(err);
									return res.json({msg:"File is updated!", data: doc})
								});
						    }
						});
					});
				})  
		    }) 
		}
	})

// =====================================================================
return $;}