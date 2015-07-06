var routes = require('routes')()
var fs = require('fs')
var db = require('monk')('localhost/movies') //syncs our app w mongo db
var movies = db.get('movies') //a reference to the db collection
var Qs = require('qs')
var view = require('mustache')
var mime = require('mime')

routes.addRoute('/', function (req, res, url) {
  if(req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    var file = fs.readFileSync('templates/movies/home.html')
    res.end(file)
  }
})


routes.addRoute('/movies', function (req, res, url) {
  console.log(req.url)
  if(req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    var template = ''
    movies.find({}, function (err, docs) {
      var file = fs.readFileSync('templates/movies/index.html')
      var template = view.render(file.toString(), {movies: docs})
      res.end(template)
    })
  }
  if(req.method === 'POST') {
    console.log(req.method)
    var data = '' //asyncronous acc pattern because of the chunks
    req.on('data', function (chunk) {
      data += chunk
      console.log('Whoa! Async!')
      console.log('Thanks for the info!')
    })
    req.on('end', function () {
      var movie = Qs.parse(data)
      movies.insert(movie, function (err, doc) {
        if (err) res.end('oops')
        res.writeHead(302, {'Location': '/movies'})
        res.end()
      })
    })
  }
})


routes.addRoute('/movies/new', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html')
  if(req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    var file = fs.readFileSync('templates/movies/new.html')
    var template = view.render(file.toString(), {})
    res.end(template)
  }
})

routes.addRoute('/movies/:id', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html')
    if (req.method === 'GET'){
    movies.findOne({_id: url.params.id}, function (err, doc) {
      if (err) throw err
      var file = fs.readFileSync('templates/movies/show.html')
      var template = view.render(file.toString(), {movies: doc})
      res.end(template)
    })
  }
  if (req.method === 'POST') {

  }

})

routes.addRoute('/movies/:id/delete', function (req, res, url) {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'POST') {
    movies.remove({_id: url.params.id}, function (err, docs) {
      if (err) throw error
      res.writeHead(302, {'Location': '/movies'})
      res.end()
    })
  }
})
routes.addRoute('/movies/:id/edit', function (req, res, url) {
    res.setHeader('Content-Type', 'text/html')
    if (req.method === 'GET'){
    movies.findOne({_id: url.params.id}, function (err, doc) {
      if (err) throw err
      var file = fs.readFileSync('templates/movies/edit.html')
      var template = view.render(file.toString(), doc)
      res.end(template)
    })
  }
})

  routes.addRoute('/movies/:id/update', function (req, res, url) {
  if(req.method === 'POST') {
    console.log(req.method)
    var data = '' //asyncronous acc pattern because of the chunks
    req.on('data', function (chunk) {
      data += chunk
    })
    req.on('end', function () {
      var movie = Qs.parse(data)
      movies.update({_id: url.params.id}, movie, function (err, doc) {
        if (err) console.log('oops')
        res.writeHead(302, {'Location': '/movies'})
        res.end()
      })
    })
  }
})






routes.addRoute('/public/*', function (req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('.' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404')
    }
      res.end(file)
  })
})

// routes.addRoute('/public/style.css'), function (req, res, url) {
//   res.setHeader('Content-Type', 'text/html')
//   fs.readFile('/public/style.css', function (err, file) {
//     res.end(file)
//   })
// }
//
//
//
module.exports = routes
