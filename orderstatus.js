const moment = require('moment');
var Fix = require('./fix.js');

var orderStatusWithClOrdId = {
	BeginString: 'FIX.4.4',
	BodyLength: '%l',
	MsgType: 'H',
	MsgSeqNum: 0,
	SenderCompID: '',
	SendingTime: moment().utc().format("YYYYMMDD-HH:mm:ss.SSS"),
	TargetCompID: 'BTCM',
	ClOrdID:'',
}

var orderStatusWithOrderId = {
	BeginString: 'FIX.4.4',
	BodyLength: '%l',
	MsgType: 'H',
	MsgSeqNum: 0,
	SenderCompID: '',
	SendingTime: moment().utc().format("YYYYMMDD-HH:mm:ss.SSS"),
	TargetCompID: 'BTCM',
	OrderID: ''
}

var apiKey
var connection
var logger
var Fix

function OrderStatus(apiKey, connection, logger) {
	this.apiKey = apiKey
	this.connection = connection
	this.logger = logger
}

OrderStatus.prototype.sendOrderStatusWithClOrdId=function(clOrdId){
	ordStatus = Object.assign({}, orderStatusWithClOrdId );
	ordStatus.ClOrdID = clOrdId;
	sendOrderStatus(this.connection, this.apiKey, this.logger, ordStatus);	
}	

OrderStatus.prototype.sendOrderStatusWithOrderId=function(orderId){
	ordStatus = Object.assign({}, orderStatusWithOrderId );
	ordStatus.OrderID = orderId;
	sendOrderStatus(this.connection, this.apiKey, this.logger, ordStatus);	
}	

function sendOrderStatus (connection, apiKey, logger, ordStatus){
	ordStatus.SenderCompID = apiKey;
	ordStatus.MsgSeqNum = Fix.seqNum();
	orderStatusMsg = Fix.message(ordStatus, true);
	connection.write(orderStatusMsg);
	logger.write('Outbound', Fix.read(orderStatusMsg));
}	

module.exports=OrderStatus