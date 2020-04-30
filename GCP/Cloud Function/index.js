const {BigQuery} = require('@google-cloud/bigquery');
const {Storage} = require('@google-cloud/storage');

const projectId = 'someProjectID';   
const dataset = 'someDataset';
const tableName = 'someTableNane';
const bucketName = 'someBucketNAme';

//Initialize bigquery object
const bigQuery = new BigQuery({
    projectId: projectId
});

//Initialize cloud storage object
const storage = new Storage({
      projectId: projectId
}).bucket(bucketName);


exports.GA_Raw_Hits = (req, res) => {
  try {
    // allow access controll for the domain
   res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  }
  
  //check if body is not null of response
  if(req.body!==null){
    //storing body as hit variable.
    var hit = req.body;
    
    //adding the hit timestampe so that we can get data and time of the hit in our data set
    hit['hit_timestamp'] = new Date().getTime();
    
    hit.payload=decodeURIComponent(hit.payload)

    //send the raw hit recieved from GTM to Bigquery
    bigQuery
        .dataset(dataset)
        .table(tableName)
        .insert(hit)
        .then((data) => console.log("data inserted to big query ", data))
        .catch(err => {
          
          //in case of an error we will store the hit received in cloud storage.
              console.log("Error: can't insert ",err);
              createFile(err, hit);
                    })
     }
    }
  catch (e) {
    console.log('inside catch with error: ',e)
    createFile(e, req.body);
  } 
    //res.status(204).send('');
    res.status(200).send('acknowledged');
  };
  
  //funciton to store hit to cloud bucket.
function createFile(error,entities) {
    var isotime = new Date().toISOString()+"__"+Math.round(Math.random()*10000); 
    var filename = 'ga_raw_hits_errors/'+error+'/'+error+'_'+isotime+'.ndjson';
    
    // also adding filename in the raw hit will help to backtrack.
    entities['filename'] = filename;

    var gcsStream = storage.file(filename).createWriteStream();
   // Object.values( entities ).forEach( (json) => {
      var str = JSON.stringify( entities );
      gcsStream.write( str + '\n' );
   // });
    gcsStream.on('error', (err) => {
      console.error(`${ this.archive }: Error storage file write.`);
      console.error(`${ this.archive }: ${JSON.stringify(err)}`);
    });
    gcsStream.end();
}
