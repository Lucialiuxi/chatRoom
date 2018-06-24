let http = require('http');
let fs = require('fs');
let path = require('path');
let mime = require('mime');
let cache = {};


//提供静态HTTP文件服务
function send404(response){
    //在所请求的文件不存在时发送404错误
    response.writeHead(404,{'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

//提供文件数据服务
function sendFile(response , filePath , fileContents){
    response.writeHead(
        200,
        {'Content-Type': mime.lookup(path.basename(filePath))}
    );
    response.end(response);
}

/*
把静态文件缓存到内存中，只有第一次访问的时候才会从文件系统中读取。写一个辅助函数会确定文件是否缓存了，如果是，就返回它。
如果文件还没被缓存，他会从硬盘读取并返回它。
如果文件不存在，就返回一个HTTP 404错误作为响应
 */
function serverStatic(response , cache , absPath){
    if(cache[absPath]){//检查文件是否缓存在内存中
        sendFile(response , absPath , cache[absPath])//从内存中返回文件
    }else{
        fs.exists(absPath , function(exists){//检查文件是否存在
            if(exists){
                fs.readFile(absPath , function(err , data){//从硬盘中读取文件
                    if(err){
                        send404(response);
                    }else{//从硬盘中读取文件并返回
                        chache[absPath] = data;
                        sendFile(response , absPath , data);
                    }
                })
            }else{
                send404(response); //发送HTTP 404响应
            }
        })
    }
}

//创建HTTP服务器
let server = http.createServer(function(request,response){
    let filePath = false;
    if(request.url==='/'){
        filePath = 'public/index.html';

    }else{
        filePath = 'public'+request.url;
    }
    let absPath = './' + filePath;
    serverStatic(response , cache , absPath);
})

//启动HTTP服务器
server.listen(3000,function(){
    console.log('server listening on port 3000')
})