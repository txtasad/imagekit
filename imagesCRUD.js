
const fileupload=require("./model/fileupload")

getAll=()=>{
    fileupload.find({}).then((res)=>{
        return({success:true,res})
    }).catch((er)=>{
        return({success:false,error:er})
    })
}


module.exports=getAll