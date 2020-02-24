var http = require("http");
var url=require("url");
var fs = require('fs');
 var path = require('path');

var server = http.createServer(function(request, response) {
     //var pagepath = url.parse(request.url).pathname;
     var pagePath = '.' + request.url;
     console.log('request ', request.url, pagePath);
     if (pagePath == './') {
         var pagePath = './html/TAHome.html';
     }
     var extname = String(path.extname(pagePath)).toLowerCase();
     console.log('#####pagePath#####', pagePath);
     console.log('request.url.indexOf', request.url.indexOf('.html'));
     console.log('request-extname of html', extname );
     var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg'};
    var contentType = mimeTypes[extname] || 'application/octet-stream';
    console.log( 'contentType from MimeTypes_extname', contentType );

      fs.readFile(pagePath, function(err, data) {
        console.log('readfile ', pagePath);

            if(pagePath.indexOf('.html') != -1){ //req.url has the pathname, check if it conatins '.html'
            console.log('pagePath.indexOf', pagePath.indexOf('.html'));

              fs.readFile('./html/TAHome.html', function (err, data) {
                console.log('Reading Home page');
                if (err) console.log(err);
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write(data);
                response.end();
              });
            }

            if(request.url.indexOf('.css') != -1){ //req.url has the pathname, check if it conatins '.css'

              fs.readFile('./css/TAHome.css', function (err, data) {
                if (err) console.log(err);
                response.writeHead(200, {'Content-Type': 'text/css'});
                response.write(data);
                response.end();
            });
            }

            if(request.url.indexOf('.png') != -1){ //req.url has the pathname, check if it conatins '.css'

              fs.readFile('./images/UHCL_Logo_1.png', function (err, data) {
                if (err) console.log(err);
                response.writeHead(200, {'Content-Type': 'image/png'});
                response.write(data);
                response.end();
            });
            }


    //
    //       if(req.url.indexOf('.js') != -1){ //req.url has the pathname, check if it conatins '.js'
    //
    //         fs.readFile(__dirname + '/public/js/script.js', function (err, data) {
    //           if (err) console.log(err);
    //           response.writeHead(200, {'Content-Type': 'text/javascript'});
    //           response.write(data);
    //           response.end();
    //         });
    //

    //

    //
    //   /*response.writeHead(200, {'Content-Type': 'text/html'});
    //   response.write(data);
    //   return response.end();*/

  });
});
server.listen(8081);
