var policyv = {
  policyName: 'Generic' /* required */
};
iot.listPolicyVersions(policyv, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

var oldv= policyv.policyVersion.0.versionId

var doc = {
  policyName: 'Generic' /* required */
};
iot.getPolicy(doc, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

doc.Statement.0.Resource.push("arn:aws:iot:eu-west-1:774482297846:client/xxxxxxxxxxxx");

var params = {
  policyDocument: doc, /* required */
  policyName: 'Generic', /* required */
  setAsDefault: true
};
iot.createPolicyVersion(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

var params = {
  policyName: 'Generic', /* required */
  policyVersionId: oldv /* required */
};
iot.deletePolicyVersion(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
