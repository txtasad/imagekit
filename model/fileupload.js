const mongoose=require("mongoose")

const fileupload= mongoose.model('Files',{
    username:{
        type:String,
        required:true,
        trim:true,
    },
    filename:{
        type:String,
        required:true,
        trim:true,
    },
    mimetype:{
        type:String,
        trim:true,
        required:true,
    },
    date:{
        type:String,
        trim:true,
        required:true,
    },
    size:{
        type:Number,
        default:0,
        validate:(val)=>{
           if(val<0)
           throw new Error("Size must be Positive!")
       }
    }
})

module.exports=fileupload