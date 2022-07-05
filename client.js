var crypto = require('crypto');
var Fix = require('./fix.js');
var	moment = require('moment');
var Config = require('./config.js');
var LogWriter = require('./logging.js');
var Order = require('./order.js');
var OrderStatus = require('./orderstatus.js');
var Cancel = require('./cancel.js');
var Sequence = require('./sequence.js');

const apiKey = "add API key here";
const privateKey = "add API secret key here";
const host = 'fix.btcmarkets.net';

var config = new Config
config.setParams(host, 443, apiKey, privateKey, true);

var logger = new LogWriter()
var sendingTime = moment().utc()
var sendingTimeForMsg = sendingTime.format("YYYYMMDD-HH:mm:ss.SSS")
var beginSeq = Fix.seqNum()

let connection;
let order;
let orderStatus;
let cancel;
let sequence;
init();

function runTest() {
	order.sendLimitOrderWithClOrdId("1","BTC-AUD", "BUY", "GTC", 0.1,0.3);
	//order.sendMarketOrderWithClOrdId("test-id-102", "BTC-AUD", "SELL", "IOC", 100);
	//cancel.sendCancelWithOrderId("1");

	//orderStatus.sendOrderStatusWithOrderId("test-id-1011", "10211814");
	//orderStatus.sendOrderStatusWithOrderId("10219320");
}

function init() {
	var signature = signMessage(beginSeq,config.getApiKey(), sendingTime, config.getPrivateKey())
	var loginMessage = {
		BeginString: 'FIX.4.4',
		BodyLength: '%l',
		MsgType: 'A',
		MsgSeqNum: beginSeq,
		SenderCompID: config.getApiKey(),
		SendingTime: sendingTimeForMsg,
		TargetCompID: 'BTCM',
		EncryptMethod: 0,
		HeartBtInt: 30,
		ResetSeqNumFlag: 'Y',
		RawDataLength: signature.length,
		RawData: signature,
		CancelOnDisconnect: 2
	};
	var logoutMessage = {
		BeginString: 'FIX.4.4',
		BodyLength: '%l',
		MsgType: '5',
		MsgSeqNum: beginSeq,
		SenderCompID: config.getApiKey(),
		TargetCompID: 'BTCM',
		SendingTime: sendingTimeForMsg
	};

	var heartbeatMsg = {
		BeginString: 'FIX.4.4',
		BodyLength: '%l',
		MsgType: 0,
		MsgSeqNum: 0,
		SenderCompID: config.getApiKey(),
		SendingTime: moment().utc().format("YYYYMMDD-HH:mm:ss.SSS"),
		TargetCompID: 'BTCM',
	};

	var testResponseMsg = {
		BeginString: 'FIX.4.4',
		BodyLength: '%l',
		MsgType: 0,
		MsgSeqNum: 0,
		SenderCompID: config.getApiKey(),
		SendingTime: moment().utc().format("YYYYMMDD-HH:mm:ss.SSS"),
		TargetCompID: 'BTCM',
		TestReqID: ''
	};

	var resendRequestMsg = {
		BeginString: 'FIX.4.4',
		BodyLength: '%l',
		MsgType: 2,
		MsgSeqNum: 0,
		SenderCompID: config.getApiKey(),
		SendingTime: moment().utc().format("YYYYMMDD-HH:mm:ss.SSS"),
		TargetCompID: 'BTCM',
	};

	connection = config.connect(Fix.message(loginMessage,true), logger);
	connection.setEncoding('utf8');

	order = new Order(config.getApiKey(), connection, logger)
	orderStatus = new OrderStatus(config.getApiKey(), connection, logger)
	cancel = new Cancel(config.getApiKey(), connection, logger)
	sequence = new Sequence(config.getApiKey(), connection, logger)

	connection.on('data', function(data) {
		var msgs = Fix.internalsplit(data)
		msgs.forEach(function(value) {

			var msg = Fix.read(value);
			logger.write('Inbound',msg)

			if (msg.MsgType == 'A') {
				runTest();
			}

			if (msg.MsgType === '0') {
				handleHeartbeat();
			}

			if (msg.MsgType == '1') {
				handleTestRequest(data);
			}
		});
	});

	connection.on('end', function() {
		console.log('FIX connection closed');
		process.exit(0);
	});

	connection.on('error', function(reason) {
		console.log('FIX connection error: ' + reason);
	});

	function doSequenceReset(){
		sequence.sendSequenceReset(Fix.lastSeqNum()*2 + 1);
	}

	function doLogOut(){
		logoutMessage.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
		logout = Fix.message(logoutMessage, true);
		connection.write(logout);
		logger.write("Outbound",Fix.read(logout))
	}

}




function signMessage(seqNum, apiKey, timestamp, secret) {
	var msg = seqNum+'A'+apiKey+timestamp
	var key = Buffer.from(secret, 'base64');
	var hmac = crypto.createHmac('SHA512', key);
	var signature = hmac.update(msg).digest('base64');
	return signature;
}

function handleTestRequest(data){
	testResponseMsg.TestReqID=data.TestReqID
	testResponseMsg.MsgSeqNum=Fix.seqNum()
	testResponseMsg.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
	response = Fix.message(testResponseMsg, true);
	connection.write(response);
	logger.write('Outbound',Fix.read(response));
}

function handleHeartbeat(){
	heartbeatMsg.MsgSeqNum=Fix.seqNum()
	heartbeatMsg.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
	response = Fix.message(heartbeatMsg, true);
	connection.write(response);
	logger.write('Outbound',Fix.read(response));
}

function handleResendRequest(){
	resendRequestMsg.MsgSeqNum=Fix.seqNum()
	resendRequestMsg.SendingTime=moment().utc().format("YYYYMMDD-HH:mm:ss.SSS")
	resendRequestMsg.BeginSeqNo=4
	resendRequestMsg.EndSeqNo=Fix.lastSeqNum()-1
	response = Fix.message(resendRequestMsg, true);
	connection.write(response);
	logger.write('Outbound',Fix.read(response));
}