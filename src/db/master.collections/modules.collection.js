module.exports=function(conn){
	var schema = mongoose.Schema({
    program:{type: String, default:'default'},
    pos_device:{
        allow:false,
        pos_device:{canRead:false,canWrite:false,canDelete:false},
        pos_device_service:{canRead:false,canWrite:false,canDelete:false},
        pos_device_zreports:{canRead:false,canWrite:false,canDelete:false}
    },
    e_invoice:{
        allow:false,
        inbox:{canRead:false,canWrite:false,canDelete:false},
        outbox:{canRead:false,canWrite:false,canDelete:false}
    },
    e_archive:{
        allow:false,
        inbox:{canRead:false,canWrite:false,canDelete:false},
        outbox:{canRead:false,canWrite:false,canDelete:false}
    },
    e_ledger:{
        allow:false,
        e_ledger:{canRead:false,canWrite:false,canDelete:false}
    },
    inventory:{
        allow:false,
        dispatch:{canRead:false,canWrite:false,canDelete:false},
        order:{canRead:false,canWrite:false,canDelete:false},
        transfer:{canRead:false,canWrite:false,canDelete:false},
        locations:{canRead:false,canWrite:false,canDelete:false},
        items:{canRead:false,canWrite:false,canDelete:false}
    },
    sales:{
        allow:false,
        dispatch:{canRead:false,canWrite:false,canDelete:false},
        order:{canRead:false,canWrite:false,canDelete:false},
        invoice:{canRead:false,canWrite:false,canDelete:false},
        customers:{canRead:false,canWrite:false,canDelete:false}
    },
    purchase:{
        allow:false,
        dispatch:{canRead:false,canWrite:false,canDelete:false},
        order:{canRead:false,canWrite:false,canDelete:false},
        invoice:{canRead:false,canWrite:false,canDelete:false},
        vendors:{canRead:false,canWrite:false,canDelete:false}
    },
    finance:{
        allow:false,
        cash:{canRead:false,canWrite:false,canDelete:false},
        cheque:{canRead:false,canWrite:false,canDelete:false},
        bank:{canRead:false,canWrite:false,canDelete:false},
        customers:{canRead:false,canWrite:false,canDelete:false},
        vendors:{canRead:false,canWrite:false,canDelete:false}
    }
	})

	schema.pre('save', function(next) {
		next()
	})
	schema.pre('remove', function(next) {
		next()
	})

	schema.pre('remove', true, function(next, done) {
		next()
	})

	schema.on('init', function(model) {

	})

	schema.plugin(mongoosePaginate)


	var collectionName='modules'
	var model=conn.model(collectionName, schema)

	model.removeOne=(member, filter,cb)=>{ sendToTrash(conn,collectionName,member,filter,cb) }
	return model
}
