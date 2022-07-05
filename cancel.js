const moment = require('moment');
var Fix = require('./fix.js');

var cancelWithClOrdId = {
	BeginString: 'FIX.4.4',
	BodyLength: '%l',
	MsgType: 'F',
	MsgSeqNum: 0,
	SenderCompID: '',
	SendingTime: moment().utc().format("YYYYMMDD-HH:mm:ss.SSS"),
	TargetCompID: 'BTCM',
	OrigClOrdID: '',
	ClOrdID:'',
}

var cancelWithOrdId = {
	BeginString: 'FIX.4.4',
	BodyLength: '%l',
	MsgType: 'F',
	MsgSeqNum: 0,
	SenderCompID: '',
	SendingTime: moment().utc().format("YYYYMMDD-HH:mm:ss.SSS"),
	TargetCompID: 'BTCM',
	ClOrdID:'',
	OrderID:''
}

var apiKey
var connection
var logger
var Fix

function Cancel(apiKey, connection, logger) {
	this.apiKey = apiKey
	this.connection = connection
	this.logger = logger
}

Cancel.prototype.sendCancelWithClOrdId=function(clOrdId){
	cancel = Object.assign({}, cancelWithClOrdId );
	cancel.ClOrdID = Fix.clOrdId();
	cancel.OrigClOrdID = clOrdId;
	sendCancel(this.connection, this.apiKey, this.logger, cancel);	
}	

Cancel.prototype.sendCancelWithOrderId=function(orderId){
	cancel = Object.assign({}, cancelWithOrdId );
	cancel.ClOrdID = Fix.clOrdId();
	cancel.OrderID = orderId;
	sendCancel(this.connection, this.apiKey, this.logger, cancel);	
}	

function sendCancel (connection, apiKey, logger, cancel){
	cancel.SenderCompID = apiKey;
	cancel.MsgSeqNum = Fix.seqNum();
	cancelMsg = Fix.message(cancel, true);
	connection.write(cancelMsg);
	logger.write('Outbound', Fix.read(cancelMsg));
}	

module.exports=Cancel