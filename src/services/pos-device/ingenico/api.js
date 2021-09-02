
function ingenicoWebService(serviceUrl,username,password,endPoint,reqOptions,cb){
	var url=serviceUrl + endPoint
	var headers = {
	    'Content-Type':'application/json', 
	    'Operator':'tr216',
	    'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
	}
	
	var options = {
	    url: url,
	    method: 'POST',
	    headers: headers,
	    rejectUnauthorized: false,
	    json:reqOptions
	}
	var request=require('request')
	request(options, (error, response, body)=>{

		if(error){
			return cb(error)
		}
		if(response){
			if(response.statusCode!=200){
				console.log(`body:`,body)
				return cb({code:'INGENICO_API_ERROR',message:`${body}`})
			}
		}
		
		if(body){
			if(body.ErrCode!='0' && body.ErrCode!=''){
				return cb({code:body.ErrCode,message:body.ErrDesc})
			}else{
				cb(null,body)
			}
		}else{
			cb({code:'EMPTY',message:'Empty result'})
		}
	    
	})
}


exports.getZReport=(serviceOptions,reqOptions,cb)=>{
	
	ingenicoWebService(serviceOptions.url,serviceOptions.username,serviceOptions.password,'/GetZReport',reqOptions,(err,resp)=>{
		if(!err){
			cb(err,resp)
			
		}else{
			errorLog('getZReport.ingenicoWebService',err)
			cb(err,resp)
		}
		
	})
}

exports.getZReportSubParts=(serviceOptions,reqOptions,zNo,ekuNo,cb)=>{
	
	reqOptions['ExternalField']=zNo + ';' + ekuNo
	ingenicoWebService(serviceOptions.url,serviceOptions.username,serviceOptions.password,'/GetZReportSubParts',reqOptions,(err,resultSubParts)=>{
		cb(err,resultSubParts)
	});
}