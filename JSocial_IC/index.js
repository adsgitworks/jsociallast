const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const search = require('./searchMethods')
const path = require('path')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const server = require('http').createServer(app)
const socket_io = require('socket.io')(server)


//configurando o disk Storage
var storage;

function setStorage(dir){
    return multer.diskStorage({
        filename: function(req, file, callback){
            callback(null,`${Date.now()}_${file.originalname}`)
        },
        destination: function(req, file, callback){
            callback(null,dir)
        }
    })
}
//servindo todos os usuários
function serveAllUsers(){
    if(search.findFolder('./backend/users/user_0')){
        let id = 0
        var dir;
        search.getCurrentID('backend/database/data.txt').then(currentid => {
            while(id < currentid){
                dir = `./backend/users/user_${id}/uploads`
                app.use('/',express.static(dir))
                id ++
            }
        })
    }
}
serveAllUsers()
//configurando dependencias da app
app.use(express.static(path.join(__dirname,'frontend/chat_page/assets')))
app.use('/send',bodyParser.urlencoded( {extended: true} ))
app.use('/verifying', bodyParser.urlencoded( {extended: true} ))
app.use('/getname',bodyParser.json( {extended: true} ))
app.use('/searchuser',bodyParser.json( {extended: true} ))
app.use('/adduser',bodyParser.json( {extended: true} ))
app.use('/friends',bodyParser.json( {extended: true} ))
app.use('/acceptrequest',bodyParser.json( {extended: true} ))
app.use('/messages',bodyParser.json( {extended: true} ))
//setando as views como html
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
//pagina de login
app.get('/', (req,res) => {
    res.render(path.join(__dirname+'/frontend/login_page/public/index.html'))
})
//página de registro
app.get('/register', (req,res) => {
    res.render(path.join(__dirname,'frontend/login_page/public/register.html'))
})
//tratando requisição de login
app.post('/verifying', (req,res) => {
    let user = req.body.user
    let pass = req.body.pass
   
    search.readFile('backend/database/db.json')
          .then( response => {
              if(response){
                let parse = JSON.parse(response)
                let cf = search.correctInfos(parse,user,pass)
                let exists = cf[0]

                if(exists){
                    let id = cf[1]
                    var token = jwt.sign({id: id},'supersecret', {expiresIn:3600})
                    res.send(token)
                }
            }
        })
})

var id;


app.get('/main', (req,res,next) => {
    
    var token = req.query.token

    jwt.verify(token,'supersecret', (error,decoded) => {
        if(!error){
            id = decoded.id.split('_')[1]
            //setting user storage
            storage = setStorage(`./backend/users/user_${id}/uploads`)
            if(search.findFolder(`./backend/users/user_${id}`)) res.render(path.join(__dirname,'frontend/chat_page/public/chatpage.html'))           
            //sending data to user 
        }
    })
}).post('/main', async (req,res) => {
    var userinfos = await search.userInfosById(id,true)
    var infos = {
        userid: id,
        username: userinfos.username,
        userpic: userinfos.picturelink,
        friends: userinfos.fid
    }
    var c = 0;
    if(infos.friends.length > 0 ){
        infos.friends.forEach(async (fid,i) => {
            infos.friends[i] = await search.userInfosById(fid,false)
            c++
            if(c == infos.friends.length) res.send(infos)
        })
    } else {
        res.send(infos)
    }
})

app.post('/getname', (req,res) => {

    var token = req.body.token
    let userid = jwt.verify(token,'supersecret', (err,decoded) => {
        return decoded.id.split('_')[1]
    })
    search.writeInFile(`./backend/users/user_${userid}/infos.json`,`{"name":"${req.body.name}"}`)
})

//tratando requisição de registro
app.post('/send', (req,res) => {

    let email = req.body.Email
    let user = req.body.Usuario
    let pass = req.body.Senha
    
    search.getCurrentID('backend/database/data.txt')
    .then(currentid => {
        
        search.mkdir(`./backend/users/user_${currentid}`)
        search.mkdir(`./backend/users/user_${currentid}/uploads`)
        //servindo usuario novo
        app.use('/',express.static(`./backend/users/user_${currentid}/uploads`))
        search.writeInFile(`./backend/users/user_${currentid}/infos.json`,'{"name":"indefinido"}')
        search.writeInFile(`./backend/users/user_${currentid}/solicitacoes.json`,'')
        search.writeInFile(`./backend/users/user_${currentid}/messages.json`,'{}')

        search.exists('backend/database/data.txt',email,user)
        .then(exist => {
            if(!exist){
                let infos = `${(currentid ? ',' : '')}"id_${currentid}": {
                    "email":"${email}",
                    "usuario":"${user}",
                    "senha":"${pass}"
                }`
                search.appendInFile('backend/database/data.txt','\n'+infos)
                search.readFile('backend/database/data.txt','json')
                  .then( response => {
                      search.writeInFile('backend/database/db.json',response)
                  })
                res.send('1')
            }else res.send('0')
        })
    })
})
//configurando rota de upload de imagens
app.post('/upload', (req,res) => {
    upload = multer({ storage }).single('fileupload')
    upload( req,res,err => {
    if(err) res.end('error founded')
        res.end('uploaded')
    })
})

//configurando rota de pesquisa de usuário
async function getAllUsers(){
    let users = {}
    var currentid = await search.getCurrentID('./backend/database/data.txt')
    let initial = 0
    while(initial < currentid){
        let piclink = await search.readdir(`./backend/users/user_${initial}/uploads`)
        piclink = (piclink ? piclink : 'unknowuser.png')
        users[`user_${initial}`] = {name: require(`./backend/users/user_${initial}/infos.json`).name, id: initial,piclink}
        initial ++
    }
    return users
}

//rota para procurar usuários

app.post('/searchuser', async (req,res) => {
   //verificando se o usuário com tal ID ou nome está em nossa DB
    getAllUsers().then(users => {
     if(isNaN(req.body.infos)) res.send(search.searchUser('name',users,req.body.infos))
     else res.send(search.searchUser('id',users,req.body.infos))
    })
})

//rota para adicionar usuários

app.post('/adduser', async(req,res) => {
    search.readFile(`./backend/users/user_${req.body[Object.keys(req.body)[0]].to}/solicitacoes.json`)
    .then(data => {
        if(data){
            //verificando se a solicitação foi enviada pela mesma pessoa mais de uma vez; 
            let c = 0
        
            search.objectKeys(JSON.parse(data),async function(obj){
                if(obj.from == req.body[Object.keys(req.body)[0]].from) {
                    c++
                }
            })
            //concatenando as solicitações no arquivo json
            if(!c) {
                search.writeInFile(`./backend/users/user_${req.body[Object.keys(req.body)[0]].to}/solicitacoes.json`,JSON.stringify({...JSON.parse(data), ...req.body }))   
                res.send({success: 'success'})
            }
            else{
                res.send({error: 'failed'})
            }
        
        }else{
            search.writeInFile(`./backend/users/user_${req.body[Object.keys(req.body)[0]].to}/solicitacoes.json`, JSON.stringify({...req.body}))
            res.send({success: 'success'})
        }
    })
})

app.post('/friends', async (req,res,next) => {
    if(req.body.requestedId){
        let requests = []
        let id = req.body.requestedId
        let data = await search.readFile(`./backend/users/user_${id}/solicitacoes.json`)
        search.objectKeys(JSON.parse(data),async function(obj){
            if(!obj.accepted) {
               var infos = await search.userInfosById(obj.from, false)
               requests[requests.length] = infos
            }
        }, function(){
            res.send(requests)
        })
       
        
    }
})

app.post('/acceptrequest', async (req,res,next) => {
    var from = []
    if(req.body){
        let data = JSON.parse(await search.readFile(`./backend/users/user_${req.body.to}/solicitacoes.json`))
        
        search.objectKeys(data,async function(obj){
            if(req.body.from == obj.from) {
                obj.accepted = true
                from[from.length] = {to: obj.from, from: obj.to, accepted: true}
                data[search.getKeyByValue(data,obj)] = obj
            }
        },async function(){ 
            search.writeInFile(`./backend/users/user_${req.body.to}/solicitacoes.json`,JSON.stringify(data))
            
            let from_infos = JSON.parse(await search.readFile(`./backend/users/user_${req.body.from}/solicitacoes.json`))
            from_infos[Date.now()] = from[0]
            search.writeInFile(`./backend/users/user_${req.body.from}/solicitacoes.json`,JSON.stringify(from_infos))

            res.send({fromid: req.body.from, accepted: true})
        })
       
    }
})

/* utilizando web sockets para o chat  */
var clients = []

socket_io.on('connection', function(socket) {

    socket.on('clientconnect', function(userid){

        clients.push([socket.id,userid.id])

        socket.on('sendedMessage', function(data){
            console.log('carloous')
            clients.forEach((client,index) => {
                if(data.to == client[1]) {
                    if(socket_io.sockets.connected[client[0]]) socket_io.sockets.connected[client[0]].emit('clientReceivedMessage', { from: userid.id, msg: data.message })
                }
            })
        })

        socket.on('sendReceivedToServer', function (messages) {
            //guardando as mensagens no arquivo messages.json especifico
            
            function storageMessages(iduser,reverse){
                search.readFile(`./backend/users/user_${iduser}/messages.json`).then(data => {
                    let allmsgs = JSON.parse(data)
                    if(allmsgs) {
                        var ver; 
                        if(!reverse) ver = (messages['from'] ?  messages['from'] : messages.to)
                        else ver = userid.id
                        if( allmsgs[`${ver}`] ) {
                            allmsgs[`${ver}`][(allmsgs[`${ver}`]).length] = ( reverse ? [messages.sended,1]: ( (ver == messages['from'] ? [messages.received,1] : [messages.sended,0] )))
                        }
                        else {
                            allmsgs[`${ver}`] = [( (reverse ? [messages.sended,1] : (ver == messages['from'] ? [messages.received,1] : [messages.sended,0] )))]
                        }
                        search.writeInFile(`./backend/users/user_${iduser}/messages.json`,JSON.stringify(allmsgs))
                    }
                })
            }
            storageMessages(userid.id,false)
            if(messages['to']) storageMessages(messages.to,true)
        })
    })
    
})

app.post('/messages', async (req,res) => {
    let allmsgs = await search.readFile(`./backend/users/user_${req.body.user}/messages.json`)
    res.send(JSON.stringify({...JSON.parse(allmsgs)[`${req.body.to}`]}))
})


server.listen(3000, () => console.log('executando server...'))