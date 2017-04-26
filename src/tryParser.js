import createEbook from './news-parser/index'

const parser = process.env.PARSER
console.log("Parsing ", parser);
if (parser) {
  createEbook(parser)
} else {
  console.log("You must define the env variable PARSER to the name of the parser you want to try!")
}
