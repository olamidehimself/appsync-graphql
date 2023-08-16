const AWS = require('aws-sdk')
const appsync = require('aws-appsync')
const gql = require('graphql-tag')

const graphqlClient = new appsync.AWSAppSyncClient({
  url: process.env.APP_SYNC_API_URL,
  region: process.env.AWS_REGION,
  auth: {
    type: 'AWS_IAM',
    credentials: AWS.config.credentials
  },
  disableOffline: true
})

const mutation = gql`mutation UpdateUserScore($id: ID!, $score: Int!, $name: String) {
  updateUserScore(id: $id, score: $score, name: $name) {
    id
    score
    name
  }
}`

exports.handler = (event) => {
  event.Records.forEach((record) => {
    if (record.eventName !== 'MODIFY') return

    const item = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)
    graphqlClient.mutate({
      mutation,
      variables: {
        id: item.id,
        score: item.score,
        name: String(new Date().getTime())
      }
    })
  })
}