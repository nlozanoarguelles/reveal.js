module.exports = function(credentialPath, spreadSheetId) {
    var _self = this;
    var creds = require(credentialPath);
    var datastore = require('@google-cloud/datastore')({
        projectId: 'dsd-collector',
        keyFilename: credentialPath
    });

    _self.addUserValue = function(uuid, questionId, value, callback) {
        try {
            var dataStoreKey = datastore.key(['barometro-quiz', uuid]);
            datastore.get(dataStoreKey, function(err, dataStoreObject) {
                if (err) {
                    console.log(err);
                    callback(err, dataStoreObject);
                } else {
                    if (dataStoreObject) {
                        console.log(dataStoreObject);
                        dataStoreObject[questionId] = value;
                        var entity = {
                            key: dataStoreKey,
                            data: dataStoreObject
                        }
                    } else {
                        var message = {};
                        message[questionId] = value;
                        var entity = {
                            key: dataStoreKey,
                            data: message
                        }
                    }
                    datastore.save(entity, callback);
                }
            });

        } catch (e) {
            console.log("error using datastore: ", e);
            callback(e);
        }
    };

    _self.getUserProfile = function(uuid, callback) {
        try {
            var dataStoreKey = datastore.key(['barometro-quiz', uuid]);
            datastore.get(dataStoreKey,callback);

        } catch (e) {
            console.log("error using datastore: ", e);
            callback(e);
        }
    };
}