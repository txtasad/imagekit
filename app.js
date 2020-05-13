const express=require('express')
const path=require('path')
const app=express();
const exec = require('child_process').exec;
const moment = require('moment');
require("./db/mongoose")
const fileupload=require("./model/fileupload")
const getall=require("./imagesCRUD")
var fs = require('fs');
const util = require("util");
const multer = require('multer');
const bodyParser = require('body-parser')

const port=process.env.PORT || 3000;

var storage = multer.diskStorage({
	destination: (req, file, callback) => {
		console.log("csk->",JSON.stringify(req.body),"file->",file)

		var paths=path.join(`${__dirname}/public/uploads/imagekits/${req.body.username}`);
		if (!fs.existsSync(paths)){
    	fs.mkdirSync(paths, { recursive: true });
		}
	  callback(null, paths);
	},
	filename: (req, file, callback) => {
	  const match = ["image/png", "image/jpeg", "image/jpg"];
  
	  if (match.indexOf(file.mimetype) === -1) {
		var message = `${file.originalname} is invalid. \n Accepted file types are only png/jpeg.`;
		return callback(message, null);
	  }
  
	  var filename = "imagekit-"+Date.now()+"-"+file.originalname;
	  callback(null, filename);
	}
  });
  
  var uploadFiles = multer({ storage: storage }).array("images", 3);
  var upload = util.promisify(uploadFiles);

app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded());
app.use(bodyParser.json())

app.get('',(request,response)=>{
	response.send({
		title:"Assignment Imagekit.io",
		Author:"~asad~"
	})
})


app.get('/test',(request,response)=>{


	fileupload.find({}).then((res)=>{
	response.render('testpage1',{
		name:"Mohammad Asad",
		bike:"Kawasaki Ninja 300",
		insta:"https://instagram.com/txtasad",
		linkedin:"https://www.linkedin.com/in/txtasad/",
		github:"https://github.com/txtasad",
		playstore:"https://play.google.com/store/apps/dev?id=5337694947399003909",
		link:"https://www.hindustantimes.com/tech/use-app-to-avoid-landslide-blocked-roads-in-sikkim-darjeeling/story-mMClbb9cuN0a5zip1mUTmK.html",
		bikeimage:"kawasaki_ninja_300.jpg",
		image:"mohammadasad.jpg",
		files:res
	})
}).catch(function(e){
	response.send({error:e})
})


})

app.post('/getAll', async (req, res) => {
	fileupload.find({}).then((res)=>{
		response.send(res)
		}).catch((e)=>{
			response.send({error:e})
		})
})

app.post('/delete_images', async (req, res) => {
	console.log("delete",req.body)
	let resDelete;
	if(req.body.isFolder)
	{
	var paths=path.join(`${__dirname}/public/uploads/imagekits/${req.body.folder}`);
	resDelete= await deleteFolderMongo(req.body.folder)
	if(resDelete){
	resDelete = await deleteFolder(paths,req.body.folder)
	}
	}

	else
	{
	var paths=path.join(`${__dirname}/public/uploads/imagekits/${req.body.folder}/${req.body.file}`);
	resDelete= await deleteFileMongo(req.body.id)
	if(resDelete)
	resDelete = await deleteFile(paths)
	}
	
	console.log(resDelete)
	let msg=req.body.isFolder?"Folder Deleted":"File Deleted"
	msg=!resDelete?"Error Deleting!":msg;
	res.send({success:resDelete,msg})
})

app.post('/upload_images', async (req, res) => {
	
	try {


		await upload(req, res);
		console.log(req.files);
  
	  if (req.files.length <= 0) {
		 res.send({msg:"You must select at least 1 file."})
	  }


	  var toSave=req.files
	  toSave.forEach(i=>{
		  i.username=req.body.username
		  i.date= moment(new Date()).format("Do MMM YY h:mm a")
		})
	  console.log("csk",toSave)

	  const mod=new fileupload()
    	fileupload.insertMany(toSave).then((res)=>{
        console.log("mongodg,success",res)
    	}).catch((er)=>{
			console.log("mongodg,failed",er)
    	})
  
	   res.send({
		   msg:"Files have been uploaded!",
		   server_msg:req.files})
	} catch (error) {
	  console.log(error);
  
	  if (error.code === "LIMIT_UNEXPECTED_FILE") {
		 res.send({msg:"Too many files to upload!",
		error:true});
	  }
	   res.send({msg: "Error trying to upload files: "+error,
	error:true});
	}
  }
  
);


app.get("/images",(request,response)=>{
    fileupload.find({}).then((res)=>{
        response.send(res)
    }).catch((er)=>{
        response.status(400).send(er)
    })
})

 app.get('*',(request,response)=>{
        response.send({
            Error: "404 Page!!",
            Message:"Are you lost?!"
        })
	})
	
	deleteFolderMongo=async (folder)=>{
		let res;
		await fileupload.deleteMany({ username: folder }, function (err) {
			if(err)
			res= false;
			else
			res= true;
		  });
		  return res;
	}
	deleteFileMongo=async (id)=>{
		let res;
		await fileupload.findByIdAndDelete(id, function (err) {
			if(err)
			res= false;
			else
			res= true;
		  });

		return res;
	}
	deleteFile=async (file)=>{
		let res=true;
		if (fs.existsSync(file))
			return fs.unlinkSync(file);
		return res;
	}
	deleteFolder=(folder,fname)=>{
		let res=true;
		if( fs.existsSync(folder) ) {
			fs.readdirSync(folder).forEach(function(file,index){
			  var curPath = path.join(folder,file);
			  console.log(file)
			  if(fs.lstatSync(curPath).isDirectory()) { // recursive
				deleteFolderMongo(fname+"/"+file)
				deleteFolder(curPath,fname+"/"+file)
			  } else { // delete file
				fs.unlinkSync(curPath);
			  }
			});
			if( fs.existsSync(folder) )
			fs.rmdirSync(folder);
		  }
		return res;
	}

	

app.listen(port,()=>{
	console.log("Server up and running! {Port: "+port+"}")
})