const moment = require('moment');
var Fix = require('./fix.js');

var sequenceReset = {
	BeginString: 'FIX.4.4',
	BodyLength: '%l',
	MsgType: '4',
	MsgSeqNum: 0,
	SenderCompID: '',
	SendingTime: moment().utc().format("YYYYMMDD-HH:mm:ss.SSS"),
	TargetCompID: 'BTCM',
	GapFillFlag: 'N',
	NewSeqNo: ''
};

var apiKey
var connection
var logger
var Fix

function Sequence(apiKey, connection, logger) {
	this.apiKey = apiKey
	this.connection = connection
	this.logger = logger
}

Sequence.prototype.sendSequenceReset=function(newSeqNum){
	sequenceReset.SenderCompID = this.apiKey;
	sequenceReset.NewSeqNo = newSeqNum
	sequenceReset.MsgSeqNum = Fix.seqNum();
	sequenceResetMsg = Fix.message(sequenceReset, true);
	this.connection.write(sequenceResetMsg);
	this.logger.write('Outbound', Fix.read(sequenceResetMsg));
	
	Fix.resetSeq(newSeqNum);
	
	return 
}	

module.exports=Sequence
