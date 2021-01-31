const { Storage } = require('@google-cloud/storage');

const gc = new Storage({
    key: 'AIzaSyCCTtnwqSWuXu5LVro_R9O08nafjrRm0cw',
    id: 'jaguar-bot-302622'
});

gc.getBuckets().then(x => console.log(x));