const Net = require('net');
const Fix = require('./fix.js');
const tls = require('tls');
const tx2 = require('tx2');


function Config() {
	this.configType = 'ClientConfig'	
	
}	

Config.prototype.setParams=function(host, port, apiKey, privateKey, sslEnabled){
	this.host = host
	this.port = port
	this.apiKey = apiKey
	this.privateKey = privateKey
	this.sslEnabled = sslEnabled
	if (sslEnabled)
		this.tlsOption='TLSv1_2_method'
	else
		this.tlsOption='none'
	this.connectionOptions = {
		secureProtocol: this.tlsOption
	}	
		
};	

Config.prototype.getHost=function(){
	return this.host;
};	

Config.prototype.getPort=function(){
	return this.port;
};	

Config.prototype.getApiKey=function(){
	return this.apiKey;
};	

Config.prototype.getPrivateKey=function(){
	return this.privateKey;
};	

Config.prototype.getSslEnabled=function(){
	return this.sslEnabled;
};	

Config.prototype.getTlsOption=function(){
	return this.tlsOption;
}	

Config.prototype.connect=function(msg, logger){
	if (this.sslEnabled){
		var connection = tls.connect(this.port, this.host,
		this.connectionOptions, function() {
			connection.write(msg);
			logger.write("Outbound",Fix.read(msg))
		});
		return connection;
		
	} else {
		var connection = new Net.Socket();
        connection.connect(this.port, this.host,
		 function() {
			connection.write(msg);
			logger.write("Outbound",Fix.read(msg))
		});
        return connection;
    }		
	
}	

module.exports=Config