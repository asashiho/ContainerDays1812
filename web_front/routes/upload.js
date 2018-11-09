if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}
// Kubernetes backend service name
const SERVICE_NAME =  'food-recognition'

const
      express = require('express')
    , router = express.Router()

    , multer = require('multer')
    , inMemoryStorage = multer.memoryStorage()
    , uploadStrategy = multer({ storage: inMemoryStorage }).single('image')

    , azureStorage = require('azure-storage')
    , blobService = azureStorage.createBlobService()

    , getStream = require('into-stream')
    , containerName = 'images'
    , config = require('../config')
;

const handleError = (err, res) => {
    res.status(500);
    res.render('error', { error: err });
};

const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};


router.post('/', uploadStrategy, (req, res) => {

    // upload Blob Storage
    const
        blobName = getBlobName(req.file.originalname)
        , stream = getStream(req.file.buffer)
        , streamLength = req.file.buffer.length
    ;

    blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {

        if(err) {
            handleError(err);
            return;
        }

        // image recognition
        var rp = require('request-promise');

        const backend_service = 'http://'+ SERVICE_NAME +'/url'
        const imageUrl = 'https://' + config.getStorageAccountName()  + '.blob.core.windows.net/' + containerName + '/'+ blobName ;

        var options = {
            method: 'POST',
            uri: backend_service,
            body: '{"url": ' + '"' + imageUrl + '"}',
            headers: {'Content-Type': 'application/json'},
            transform2xxOnly: true, 
            transform: function (body) {
                return JSON.parse(body);
            },
        };
        
        rp(options)
            .then(function (json) {
                // POST succeeded...
                let result = json.predictions;
                console.log(result);
                for (var i=0; i < result.length; i++){
                    result[i].probability = Math.round( result[i].probability * 100 );
                }

                res.render('success', { 
                    message: 'File uploaded to Azure Blob storage.' ,
                    containerName: containerName, 
                    blobName: blobName,
                    predict: result,
                    accountName: config.getStorageAccountName() 
                });
            })
            .catch(function (err) {
                // POST failed...
                console.log(err)
            });
    });
});

module.exports = router;