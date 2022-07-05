const moment = require('moment');
var Fix = require('./fix.js');

var clOrdIdtoOrdId = new Map();

var clientOrder = {
	BeginString: 'FIX.4.4',
	BodyLength: '%l',
	MsgType: 'D',
	MsgSeqNum: 0,
	SenderCompID: '',
	SendingTime: moment().utc().format("YYYYMMDD-HH:mm:ss.SSS"),
	TargetCompID: 'BTCM',
	ClOrdID:''
};

var apiKey
var connection
var logger
var Fix

var clOrdIdtoOrdId;

function Order(apiKey, connection, logger) {
	this.apiKey = apiKey
	this.connection = connection
	this.logger = logger
	
	this.clOrdIdtoOrdId = new Map();

}

function limitOrder(symbol, side, tif, price, volume){
	ord = Object.assign({},clientOrder );
	ord.Side = side=="BUY"?1:2;
	ord.Price = price;
	ord.Symbol = symbol;
	ord.OrderQty = volume;
	ord.TimeInForce = getTif(tif);
	ord.OrdType = 2;

	return ord;
}	

function marketOrder(symbol, side, tif, volume){
	ord = Object.assign({},clientOrder );
	ord.Side = side=="BUY"?1:2;
	ord.Symbol = symbol;
	ord.OrderQty = volume;
	ord.TimeInForce = getTif(tif);
	ord.OrdType = 1;
	ord.SelfTradePrevention = 'P';

	return ord;
}

function stopLimitOrder(symbol, side, tif, price, volume, stopPrice){
	ord = Object.assign({},clientOrder );
	ord.Side = side=="BUY"?1:2;
	ord.Price = price;
	ord.Symbol = symbol;
	ord.OrderQty = volume;
	ord.TimeInForce = getTif(tif);
	ord.OrdType = 4;
	ord.StopPx = stopPrice;

	return ord;
}

function stopOrder(symbol, side, tif, volume, stopPrice){
	ord = Object.assign({},clientOrder );
	ord.Side = side=="BUY"?1:2;
	ord.Symbol = symbol;
	ord.OrderQty = volume;
	ord.TimeInForce = getTif(tif);
	ord.OrdType = 3;
	ord.StopPx = stopPrice;

	return ord;	
}		

function getTif(tif){
	if (tif=="GTC")
		return 1;
	else if (tif=="IOC")
		return 3;
	else return 4;	
}	

Order.prototype.sendLimitOrder=function(symbol, side, tif, price, volume){
	ord = limitOrder(symbol, side, tif, price, volume)
	ord.SenderCompID = this.apiKey;
	ord.MsgSeqNum = Fix.seqNum();
	ord.ClOrdID = Fix.clOrdId();
	ord.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
	orderMsg = Fix.message(ord, true);
	this.connection.write(orderMsg);
	this.logger.write('Outbound', Fix.read(orderMsg));
	
	return ord
}	

Order.prototype.sendMarketOrder=function(symbol, side, tif, volume){
	ord = marketOrder(symbol, side, tif, volume)
	ord.SenderCompID = this.apiKey;
	ord.MsgSeqNum = Fix.seqNum();
	ord.ClOrdID = Fix.clOrdId();
	ord.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
	orderMsg = Fix.message(ord, true);
	this.connection.write(orderMsg);
	this.logger.write('Outbound', Fix.read(orderMsg));
	
	return ord
}

Order.prototype.sendLimitOrderWithClOrdId=function(clOrdId, symbol, side, tif, price, volume){
	ord = limitOrder(symbol, side, tif, price, volume)
	ord.SenderCompID = this.apiKey;
	ord.MsgSeqNum = Fix.seqNum();
	ord.ClOrdID = clOrdId;
	ord.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
	orderMsg = Fix.message(ord, true);
	this.connection.write(orderMsg);
	this.logger.write('Outbound', Fix.read(orderMsg));
	
	return ord
}	

Order.prototype.sendMarketOrderWithClOrdId=function(clOrdId, symbol, side, tif, volume){
	ord = marketOrder(symbol, side, tif, volume)
	ord.SenderCompID = this.apiKey;
	ord.MsgSeqNum = Fix.seqNum();
	ord.ClOrdID = clOrdId;
	ord.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
	orderMsg = Fix.message(ord, true);
	this.connection.write(orderMsg);
	this.logger.write('Outbound', Fix.read(orderMsg));
	
	return ord
}

Order.prototype.sendStopOrder=function(symbol, side, tif, volume, stopPrice){
	ord = stopOrder(symbol, side, tif, volume, stopPrice)
	ord.SenderCompID = this.apiKey;
	ord.MsgSeqNum = Fix.seqNum();
	ord.ClOrdID = Fix.clOrdId();
	ord.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
	orderMsg = Fix.message(ord, true);
	this.connection.write(orderMsg);
	this.logger.write('Outbound', Fix.read(orderMsg));

	return ord
}

Order.prototype.sendStopLimitOrder=function(symbol, side, tif, price, volume, stopPrice){
	ord = stopLimitOrder(symbol, side, tif, price, volume, stopPrice)
	ord.SenderCompID = this.apiKey;
	ord.MsgSeqNum = Fix.seqNum();
	ord.ClOrdID = Fix.clOrdId();
	ord.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
	orderMsg = Fix.message(ord, true);
	this.connection.write(orderMsg);
	this.logger.write('Outbound', Fix.read(orderMsg));

	return ord
}

Order.prototype.setClOrdIdOrderId=function(clOrdId, ordId){
	this.clOrdIdtoOrdId.set(clOrdId, ordId);
}

Order.prototype.getOrderId=function(clOrdId){
	return this.clOrdIdtoOrdId.get(clOrdId);
}	

module.exports=Order