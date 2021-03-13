var api=require('./api.js')


exports.download=(dbModel,serviceDoc,posDeviceDocs,callback)=>{
	if(posDeviceDocs.length>0){
		var index=0

		function zRaporIndir(cb){
			
			if(index>=posDeviceDocs.length)
				return cb(null)
			eventLog(`${dbModel.nameLog} Srvc:${serviceDoc.name.cyan}, ${'zRaporIndir()'.yellow} ${posDeviceDocs[index].deviceSerialNo.green} ${(index+1).toString().green}/${posDeviceDocs.length.toString().yellow}`)
			
			if(posDeviceDocs[index].deviceSerialNo!=''){
				generateReqOption(dbModel,posDeviceDocs[index],(err,reqOpt)=>{
					if(!err){
						api.getZReport(serviceDoc,reqOpt,(err,resp)=>{
							if(!err){
								// eventLog(`${dbModel.dbName.yellow} resp.ZReportItems.length:`,resp.ZReportItems.length.toString())
								
								insertZReports(dbModel,posDeviceDocs[index],resp.ZReportItems,(err)=>{
									if(!err){
										index++
										
										setTimeout(zRaporIndir,1000,cb)
									}else{
										
										//errorLog(`${dbModel.dbName.yellow} insertZReports Error:` ,err)
										index++
										setTimeout(zRaporIndir,1000,cb)
									}
								})
							}else{
								
								errorLog(`${dbModel.dbName.yellow} download getZReport Error:` , err)
								if(err.errno!=undefined){
									if(err.errno=='ETIMEDOUT'){
										
										eventLog(`${dbModel.nameLog} Srvc:${serviceDoc.name.cyan}, TIMEOUT ${posDeviceDocs[index].deviceSerialNo.yellow} 30sn sonra yeniden.`)
										setTimeout(zRaporIndir,30000,cb)
									}else{
										index++
										errorLog(`${dbModel.nameLog} Srvc:${serviceDoc.name.cyan}, api.getZReport ERROR: ${posDeviceDocs[index].deviceSerialNo.yellow}\r\n`,err)
										setTimeout(zRaporIndir,1000,cb)
									}
								}else{
									index++
									errorLog(`${dbModel.nameLog} Srvc:${serviceDoc.name.cyan}, api.getZReport ERROR: ${posDeviceDocs[index].deviceSerialNo.yellow}\r\n`,err)
									setTimeout(zRaporIndir,1000,cb)
								}
								
							}
						})
					}else{
						index++
						errorLog(`${dbModel.nameLog} Srvc:${serviceDoc.name.cyan}, generateReqOption() ERROR: ${posDeviceDocs[index].deviceSerialNo.yellow}\r\n`,err)
						setTimeout(zRaporIndir,1000,cb)
					}
				})
			}else{
				index++
				setTimeout(zRaporIndir,1000,cb)
			}
		}

		zRaporIndir((err)=>{
			if(err){
				errorLog(`${dbModel.nameLog} Srvc:${serviceDoc.name.cyan}, download ERROR:\r\n`,err)
			}
			callback(err)
		})
	}else{
		callback(null)
	}
}

function insertZReports(dbModel,posDeviceDoc,ZReportItems,callback){
	if(ZReportItems.length==0) return callback(null)

		var index=0
	function dahaOncedenKaydedilmisMi(cb){
		if(index>=ZReportItems.length){
			return cb(null)
		}
		dbModel.pos_device_zreports.countDocuments({posDevice:posDeviceDoc._id,zNo:ZReportItems[index].ZNo},(err,c)=>{
			if(!err){
				
				if(c==0){
					index++
					setTimeout(dahaOncedenKaydedilmisMi,0,cb)
				}else{
					ZReportItems.splice(index,1)
					setTimeout(dahaOncedenKaydedilmisMi,0,cb)
				}
			}else{
				errorLog(`${dbModel.nameLog} insertZReports deviceSerialNo: ${posDeviceDoc.deviceSerialNo.yellow} ERROR:\r\n`,err)
				cb(err)
			}
		})
	}
	
	dahaOncedenKaydedilmisMi((err)=>{
		if(!err){
			// eventLog(`${dbModel.dbName.yellow} insertZReports ZReportItems.length:`,ZReportItems.length.toString())
			if(ZReportItems.length==0) return callback(null)
				var data=[]
			ZReportItems.forEach((e)=>{
				var d=(new Date(e.ZDate))
				d.setMinutes(d.getMinutes()+(new Date()).getTimezoneOffset()*-1)

				data.push({posDevice:posDeviceDoc._id,data:e,zNo:e.ZNo,zDate:d,zTotal:e.GunlukToplamTutar})

			})
			// eventLog('insertZReports beforeSort  data.length:',data.length.toString())
			data.sort(function(a,b){
				if(a.zDate>b.zDate) 
					return 1
				if(a.zDate<b.zDate) 
					return -1
				return 0
			})

			// eventLog('insertZReports  data.length:',data.length.toString())

			dbModel.pos_device_zreports.insertMany(data,{ordered:true},(err,docs)=>{
				if(err){
					errorLog(`${dbModel.nameLog} dahaOncedenKaydedilmisMi deviceSerialNo: ${posDeviceDoc.deviceSerialNo.yellow} ERROR:\r\n`,err)
				}
				callback(err)
			})
		}else{
			errorLog(`${dbModel.nameLog} dahaOncedenKaydedilmisMi deviceSerialNo: ${posDeviceDoc.deviceSerialNo.yellow} ERROR:\r\n`,err)
			callback(err)
		}
	})
}


function generateReqOption(dbModel,posDeviceDoc,cb){
	dbModel.pos_device_zreports.find({posDevice:posDeviceDoc._id}).sort({zDate:-1}).limit(1).exec((err,docs)=>{
		if(!err){
			var reqOptions={
				"ReportId": 0, 
				"SerialList": [ posDeviceDoc.deviceSerialNo ], 
				"StartDate": defaultStartDate(), 
				"EndDate": endDate(), 
				"ExternalField": "", 
				"ReceiptNo": 0, 
				"ZNo": 0, 
				"GetSummary":false, 
				"SaleFlags": 0 
			}
			if(docs.length>0){
				var maxZDate=docs[0]['zDate']
				reqOptions.StartDate=maxZDate.toISOString()
			}

			cb(null,reqOptions)
		}else{
			cb(err)
		}
	})
}

function defaultStartDate(){

	return (new Date((new Date()).getFullYear(),0,1,0,(new Date()).getTimezoneOffset()*-1,0)).toISOString()
}



function endDate(){
	var a=new Date()
	a.setMinutes(a.getMinutes()+(new Date()).getTimezoneOffset()*-1)
	return a.toISOString()
}


exports.zreportDataToString=(data)=>{
	return 'ZNo:' + data.ZNo + ', Tarih:' + data.ZDate.substr(0,10) + ' ' + data.ZTime + ', Toplam:' + data.GunlukToplamTutar.formatMoney(2,',','.') + ', T.Kdv:' + data.GunlukToplamKDV.formatMoney(2,',','.')
}