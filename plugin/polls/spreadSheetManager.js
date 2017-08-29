module.exports = function(credentialPath, spreadSheetId) {
    var _self = this;
    var GoogleSpreadsheet = require('google-spreadsheet');
    var async = require('async');
    _self.status = false;

    // spreadsheet key is the long id in the sheets URL 
    var doc = new GoogleSpreadsheet(spreadSheetId);
    var sheet;
    var creds = require(credentialPath);
    doc.useServiceAccountAuth(creds,function(){
        _self.status = true;
    });

    _self.addUserValue = function(uuid, questionId, value, callback) {
        async.series([
            function checkStatus(step){
                var waitingLoop = setInterval(function(){
                    if(_self.status){
                        clearInterval(waitingLoop);
                        step();
                    }
                }, 100);
            },

                function getInfoAndWorksheets(step) {
                    doc.getInfo(function(err, info) {
                        console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
                        sheet = info.worksheets[0];
                        console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
                        step();
                    });
                },
                function workingWithRows(step) {
                    // google provides some query options 
                    sheet.getRows(function(err, rows) {
                        console.log(arguments);
                        var userRow = rows.filter(function(obj) { return obj.uuid === uuid; })[0];
                        if (userRow) {
                            userRow[questionId] = value;
                            userRow.save();
                            step();
                        } else {
                            var rowToAdd = {};
                            rowToAdd.uuid = uuid;
                            rowToAdd[questionId] = value;
                            sheet.addRow(rowToAdd,step);
                        }

                        
                    });
                },
                function lastItem(step) {
                    if (callback) {
                        callback();
                    }
                    step();
                }
            ],
            function(err) {
                if (err) {
                    console.log('Error: ' + err);
                }
            });
    }
}