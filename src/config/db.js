import mongoose from 'mongoose'
import Promise from 'bluebird'

mongoose.Promise = Promise

const { MONGO_HOST, MONGO_PORT, MONGO_DB_NAME, MONGO_USER, MONGO_PASSWORD} = process.env
let mongoUri = `${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}`
if (MONGO_HOST != 'localhost'){
  mongoUri = `${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}`
}

mongoose.connect(mongoUri, { server: { socketOptions: { keepAlive: 1 } } })
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`)
})
