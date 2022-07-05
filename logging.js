const fs = require('fs');
const moment = require('moment')
const os = require('os')

function LogWriter() {
	const logDir = 'log';
	if (!fs.existsSync(logDir)){
		fs.mkdirSync(logDir);
	}
	this.filename = logDir + '/log'+'-'+moment().format("YYYYMMDD-HHmmss")
	fs.open(this.filename, 'w+', err => {
		if (err) {
			console.error(err);
		}
	})
}

LogWriter.prototype.write=function(direction, content){
	msg = '------------------'+direction+'---------------------'+os.EOL+JSON.stringify(content)+os.EOL
	fs.writeFile(this.filename, msg, { flag: "a" }, err => {
		if (err) {
			console.error(err);
		}
	})
	console.log(msg)
}

module.exports=LogWriter