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
		// console.log(req.files);
		if (!req.files)
		    return res.status(400).send('No files were uploaded. (Response from server)');
		let file = req.files.incoming;
		let filename = Date.now() 

		var extension = file.name.split('.').pop();
	    filename = filename+'.'+extension;


		  // Use the mv() method to place the file somewhere on your server 
		file.mv('./public/'+filename, function(err) {
		    if (err)
			    return res.status(500).send(err);
		    res.send('File uploaded!');
		});
	})

// =====================================================================
return $;}