global.__root=__dirname

require('./bin/initialize-app')

var start=require('./posDeviceApp')

appInfo()

start()


