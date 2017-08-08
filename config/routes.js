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
      	Images.find({}).sort({ title: 1 }).skip(0).limit(20).exec(function (err, imgs) {
		  	if(err) return res.send("Error! Request failed due to to some unknown error.")
			res.render("index", {host: req.protocol+'://'+req.headers.host || req.get('host'), section: "library", imgs});
		});
	})

	$.get('/last-uploads', function(req, res){
      	Images.find({}).sort({ dated: 1 }).skip(0).limit(20).exec(function (err, imgs) {
		  	if(err) return res.send("Error! Request failed due to to some unknown error.")
			res.render("index", {host: req.protocol+'://'+req.get('host'), section: "library", imgs});
		});
	});

	$.get('/last-modifications', function(req, res){
		Images.find({}).sort({ lastUpdate: 1 }).skip(0).limit(20).exec(function (err, imgs) {
		  	if(err) return res.send("Error! Request failed due to to some unknown error.")
			res.render("index", {host: req.protocol+'://'+req.get('host'), section: "library", imgs});
		});
	});

	$.get('/upload', function(req, res){
		res.render("index", {host: req.protocol+'://'+req.get('host'), section: "upload"});
	})	

	// Upload image
	$.post('/upload-image',function(req, res){
		if (!req.files){
		    res.status(400)
		    return res.json({msg: 'No files were uploaded.'});
		}

		var raw = req.body;
		if(!raw.ownerId){
			res.status(400);
			return res.json({msg: 'Owner/User identification is missing.'})
		}
		var file = req.files.incoming;
		var fileType = file.mimetype.split('/');
		var filename = Date.now();
		var sizeOf = require('image-size');
		// var fs = require("fs");
		const fs = require('fs-extra');

		var extension = file.name.split('.').pop();
	    filename = filename+'.'+extension;
	    // console.log(file);
	    // res.status(400);
	    // return;
	    var tags = null;
	    if( raw.tags ){
	    	tags = raw["tags"].split(",");
		    for(var i = 0; i < tags.length; i++){
		    	tags[i] = tags[i].trim();
		    }
	    } 
	    var path = _root;
		if(fileType[0] == 'image'){
			path += '/uploads/'+raw.ownerId+'/images';
		}
		

		fs.ensureDir(path, function(err) {
			if(err){
				res.status(400);
				return res.json({msg: 'Failed to created appropriate directories.'})
			}
			// Use the mv() method to place the file somewhere on your server 
			file.mv(path+'/'+filename, function(err) {
			    if (err)  return res.status(500).send(err);
			    var imageData = {
			    	filename,
			    	filetype: "image",
			    	extension,
			    	title: raw["imagName"],
			    	alt: raw["altText"] || null,
			    	tags,
			    	desc: raw.description || null,
			    	dated: new Date(),
			    	lastUpdate: null,
			    	link: "/image/"+filename,
			    	width: null,
			    	height: null,
			    	size: null
			    }
			    Images.insert(imageData, function(err, doc) {  
				    if(err) return res.status(500).send(err);
				    else{
				    	var dimensions = sizeOf(path+'/'+filename);
						const stats = fs.statSync(path+'/'+filename);
						const fileSizeInBytes = stats.size;
						const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;

						var updt = { 
							width: dimensions.width,
					    	height: dimensions.height,
					    	size: fileSizeInMegabytes
						};
						Images.update({_id: doc._id}, { $set: updt }, { }, function (err, update) {
							if(err) return res.status(500).send(err);
							return res.json({msg:"File is uploaded! "+path+"/"+filename, data: doc})
						});
				    }
				});
			});
		})
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
		var raw = req.body;
		if(!raw._id){ // Update with image 
			res.status(400);
			return res.json({msg:"Update failed. (No identity) "})
		}
		Images.findOne({_id: raw._id}, function(err, img){
	    	if(err || !img) {
	    		res.status(400)
	    		return res.send(err || "Error! Identity failed.")
	    	}
			if (req.files){
				var file = req.files.incoming;
				var filename;
				var sizeOf = require('image-size');
				var fs = require("fs");

				var extension = file.name.split('.').pop();
			    // filename = filename+'.'+extension;
			    
			    var tags = null;
			    if( raw.tags ){
			    	tags = raw["tags"].split(",");
				    for(var i = 0; i < tags.length; i++){
				    	tags[i] = tags[i].trim();
				    }
			    }
		    	filename = img.filename;
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
					    	dated: img.dated,
					    	lastUpdate: new Date(),
					    	link: "/image/"+filename,
					    	width: null,
					    	height: null,
					    	size: null
					    }
					    Images.update({_id: raw["_id"]}, imageData, function(err, doc) {  
						    if(err) return res.status(500).send(err);
						    else{
						    	var dimensions = sizeOf('./public/'+filename);
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
			}else{ // Update only meta [no image update]
				var tags = null;
			    if( raw.tags ){
			    	tags = raw["tags"].split(",");
				    for(var i = 0; i < tags.length; i++){
				    	tags[i] = tags[i].trim();
				    }
			    }
				var updt = {
			    	title: raw["title"],
			    	alt: raw["alt"] || null,
			    	tags,
			    	desc: raw["desc"] || null,
			    	dated: img.dated,
			    	lastUpdate: new Date(),
			    }
			    Images.update({_id: raw["_id"]}, { $set: updt }, { }, function(err, doc) {  
				    if(err) return res.status(500).send(err);
				    else{
				    	return res.json({msg:"File is updated!", data: doc})
				    }
				});
			}
		}) 
	});

// =====================================================================
return $;}