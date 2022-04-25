import { createServer } from 'http';
import { parse } from 'url';
import { readFileSync } from 'fs';
// import querystring from 'querystring';
const data = readFileSync('./data.json');
let projects = JSON.parse(data);

// server helpers
function DoResponse(res, data){
    res.writeHead(data.success ? 200 : 400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));

    return res;
}

async function GetBody(req){
    const buffers = [];

    for await (const chunk of req) {
        buffers.push(chunk);
    } 

    const data = Buffer.concat(buffers).toString();
    return data.length > 0 ? JSON.parse(data) : undefined;
}

// server rouring
const server = createServer(async (req, res) => {
    const urlparse = parse(req.url, true);
    req.query = urlparse.query;
    req.body = await GetBody(req);

    if (urlparse.pathname == '/projects/getall' && req.method == 'GET') await GetAllProjects(req, res);
    else if (urlparse.pathname == '/projects/getbyid' && req.method == 'GET') await GetProjectById(req, res);
    else if (urlparse.pathname == '/projects/newproject' && req.method == 'POST') await newproject(req, res);
    else return DoResponse(res, {error: "Route not found"}, false);
});

// controllers
async function GetAllProjects(req, res){
    return DoResponse(res, {data: projects, success: true});
}

async function GetProjectById(req, res){
    if(!req.query?.id)
        return DoResponse(res, {error: {code: "0001", message: "Id param was not found."}, success: false});   
        
    var response = projects.find(x=> x.id == req.query.id) ?? null;
    return DoResponse(res, {data: response, success: true});
}

async function newproject(req, res){
    if(!req.body?.id || !req.body?.document)
        return DoResponse(res, {error: {code: "0001", message: "Request incorrect."}, success: false});    
        
    projects.push(req.body);
    return DoResponse(res, {success: true});
}

server.listen(5000, function () {
    console.log('Server started at port ' + 5000);
});