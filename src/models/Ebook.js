import mongoose from 'mongoose'

const EbookSchema = new mongoose.Schema({
  parser: String,
  name: String,
  size: String,
  time: Date
})

export default mongoose.model('Ebook', EbookSchema);
