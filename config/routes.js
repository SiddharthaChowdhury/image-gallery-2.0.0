var Datastore = require('nedb');
var _path = require('path');
var Images = new Datastore({ filename: './em-data/images.db', autoload: true }); 
var Users = new Datastore({ filename: './em-data/users.db', autoload: true }); 
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
		
		var vew = '';
		vew += '<h2>Image gallery (prototype)</h2>'
		vew += '<p>This application specifically targets image asset management. It is user based application, ie. user must create an account to manage (upload, delete, edit) images. </p>';
		vew += '<p>There are APIs to create users, get images, search images, upload images, etc.</p>';
		vew += '<p>Following are 2 dummy users for testing purposes:</p>';
		vew += '<ol><li>"user_id":"175l7568bf298d002d","token":"tk_1502207116078"</li>'
		vew += '<li>"user_id":"175l7568bf298002d","token":"tk_1502203470214"</li></ol>'
		vew += '<p><h3>To see how it works - you have to access through either of the users\'s dashboard. Try the one below.</h3></p>'
		vew += '<p><a href="http://localhost:1333/images/175l7568bf298d002d/tk_1502207116078" target="_blank">Try image-gallery dashboard</a> </p>'

		res.send(vew);
	})

	// ============= A P I (All images)
	$.get('/images/:uid/:token', function(req, res){
      	Users.findOne({user_id: req.params.uid, token: req.params.token}, function(err, usr){
      		if(err){
      			res.status(400);
				return res.json({err})
      		}
      		if(!usr){
      			res.status(400);
				return res.json({msg: "Error! User authentication failed."})
      		}else{
      			Images.find({user_id: req.params.uid}).sort({ title: 1 }).skip(0).limit(20).exec(function (err, imgs) {
				  	if(err) return res.send("Error! Request failed due to to some unknown error.")
					res.render("index", {host: req.protocol+'://'+req.headers.host || req.get('host'), section: "library", imgs, usr});
				});
      		}
      	})
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

	// ============= A P I (Register image user)
	$.post('/register/image-user', function(req, res){
		if(!req.body.uid){
			res.status(400);
			return res.json({msg:"Error! A user-ID is required to register a user."})
		}
		Users.findOne({user_id: req.body.uid}, function(err, usr){
			if(err){
				res.status(400);
				return res.json({err})
			}
			if(usr){
				res.status(200);
				return res.json({usr})
			}else{
				var token = "tk_"+Date.now();
				Users.insert({user_id: req.body.uid, token}, function(err, usr){
					if(err){
						res.status(400);
						return res.json({err})
					}
					res.status(200);
					return res.json({usr})
				});
			}
		})
	})	

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

	// Upload image
	// ============= A P I (upload image)
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
		var token = req.body.img_token;
		Users.findOne({user_id: req.body.ownerId, token}, function(err, usr){
			if(err){
				res.status(400);
				return res.json({err})
			}
			if(usr){
				var file = req.files.incoming;
				var fileType = file.mimetype.split('/');
				var filename = Date.now();
				var sizeOf = require('image-size');
				const fs = require('fs-extra');

				var extension = file.name.split('.').pop();
			    filename = filename+'.'+extension;
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
				var correctPath = _path.normalize(path);
				fs.ensureDir(correctPath, function(err) {
					if(err){
						res.status(400);
						return res.json({msg: 'Failed to created appropriate directories.'})
					}
					// Use the mv() method to place the file somewhere on your server 
					file.mv(correctPath+'/'+filename, function(err) {
					    if (err)  return res.status(500).send(err);
					    var imageData = {
					    	filename,
					    	gallery: raw.gallery || 'untitled',
					    	user_id: raw.ownerId,
					    	filetype: "image",
					    	extension,
					    	title: raw["imageName"],
					    	alt: raw["altText"] || null,
					    	tags,
					    	desc: raw.description || null,
					    	dated: new Date(),
					    	lastUpdate: null,
					    	link: "/asset/"+raw.ownerId+'/images/'+filename,
					    	width: null,
					    	height: null,
					    	size: null
					    }
					    Images.insert(imageData, function(err, doc) {  
						    if(err) return res.status(500).send(err);
						    else{
						    	var dimensions = sizeOf(correctPath+'/'+filename);
								const stats = fs.statSync(correctPath+'/'+filename);
								const fileSizeInBytes = stats.size;
								const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;

								var updt = { 
									width: dimensions.width,
							    	height: dimensions.height,
							    	size: fileSizeInMegabytes
								};
								Images.update({_id: doc._id}, { $set: updt }, { }, function (err, update) {
									if(err) return res.status(500).send(err);
									return res.json({msg:"File is uploaded! "+correctPath+"/"+filename, data: doc})
								});
						    }
						});
					});
				})
			}else{
				res.status(400);
				return res.json({msg: "User identification failed."})
			}
		});
	});

	// Update Image
	$.post('/update-image', function(req, res){
		var raw = req.body;
		if(!raw._id){ // Update with image 
			res.status(400);
			return res.json({msg:"Update failed. (No identity) "})
		}
		// console.log("title:"+ raw["title"])
		Images.findOne({_id: raw._id}, function(err, img){
	    	if(err || !img) {
	    		res.status(400)
	    		return res.send(err || "Error! Identity failed.")
	    	}
			if (req.files){
				var file = req.files.incoming;
				var fileType = file.mimetype.split('/');
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
				var path = _root;
				if(fileType[0] == 'image'){
					path += '/uploads/'+raw.ownerId+'/images';
				}
				var correctPath = _path.normalize(path+'/'+filename);
				// console.log("path:"+ correctPath)
		    	fs.unlink(correctPath, function(err){
		    		if(err) {
		    			res.status(400);
		    			return res.send("Error! Image update failed. (replace of image failed)")
		    		}
		    		// Use the mv() method to place the file somewhere on your server 

					file.mv(correctPath, function(err) {
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
					    	// link: "/image/"+filename,
					    	// link: "/asset/"+raw.ownerId+'/images/'+filename,
					    	width: null,
					    	height: null,
					    	size: null
					    }
					    Images.update({_id: raw._id}, { $set: imageData }, { }, function(err, doc) {  
						    if(err) return res.status(500).send(err);
						    else{
						    	var dimensions = sizeOf(correctPath);
								const stats = fs.statSync(correctPath);
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

	$.post('/get/user-images', function(req, res){
		if(!req.body.uid){
			res.status(400);
			return res.json({msg:"Error! A user-ID and access token is required. "})
		}
		var query = { user_id: req.body.uid };
		if(req.body.fileType){
			query["filetype"] = req.body.fileType || 'image';
		}
		if(req.body.gallery)
			query["gallery"] = req.body.gallery || 'untitled';

		Images.find(query, function(err, imgs){
			if(err) return res.status(500).send(err)
			res.status(200);
		    res.json(imgs)
		})
	});

	// ============= A P I (Search image)
	$.post('/search/asset', function(req, res){
		if(!req.body.search){
			res.status(400);
			return res.json({msg:"Error! Search string is missing."})
		}
		var searchStr = req.body.search;
		var patt = new RegExp(searchStr);
		Images.find({ $or: [{ tags: searchStr }, { title: patt }] }, function (err, docs) {
		  	if(err){
		  		res.status(400);
				return res.json({err})
		  	}
		  	res.status(200);
		  	return res.json(docs)
		});
	})
// =====================================================================
return $;}