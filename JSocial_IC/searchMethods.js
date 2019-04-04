const fs = require('fs')
const path = require('path')

//retorna uma promise que possui um objeto com todos os dados do arquivo.

function readFile(rpath,addons = 0){
    return new Promise((resolve,reject) => {
        fs.readFile(path.join(__dirname,rpath),'utf-8',(error,data) => {
            if(addons == 'json') resolve(`{${data}}`)
            else if(addons == 'object') resolve(JSON.parse(`{${data}}`))
            else if(!addons) {
                if(data) resolve(data) 
                else resolve(0)
            }
        })
    })
}
//verifica se as informações de login foram digitadas corretamente.
function correctInfos(jsondata,user,pass){
    let id;
    let keys = Object.keys(jsondata)
    let exists = false;
    keys.forEach( e => {
        if(jsondata[e].usuario == user && jsondata[e].senha == pass) {
            exists = true;
            id = e;
        }
    })
    return [exists,id]
}
//retorna o id do ultimo usuario cadastrado

function getCurrentID(rpath){
    return new Promise((resolve,reject) => {
        readFile(rpath,'object')
            .then(response => {
                let id = Object.keys(response).length
                resolve(id)
            })
    })
}
//verifica se existe determinado dado na database. retorna true ou false.

async function exists(rpath,email,user){
    
        return new Promise((resolve,reject) => {
            readFile(rpath,'object').then( response => {
                let keys = Object.keys(response)
                let verifying = false;
                keys.forEach(e => {
                    if(response[e].email == email || response[e].usuario == user){
                        verifying = true
                    }
                })
                resolve(verifying)
            })
        })  
}
function searchUser(type,obj,info){
    let finded = {}
    let count = 0
    console.log(type)
    Object.keys(obj).forEach(e => {
        if(type == 'name') if(obj[e]['name'].toLowerCase() == info.toLowerCase()) {
            finded[count] = {name: obj[e].name, id: obj[e].id, pic: obj[e].piclink}
            count ++
        }
        if(type == 'id') if(obj[e]['id'] == info){
            finded[count] = {name: obj[e].name, id: obj[e].id, pic: obj[e].piclink}
            count ++
        }
    })
    return finded
}


//escreve algo em determinado arquivo

function writeInFile(rpath,infos){
    fs.writeFile(path.join(__dirname,rpath),infos, function(err){
        if(err) console.log('a error')
    })
}
// escrever algo em determinado arquivo sem recriar o arquivo.

function appendInFile(rpath,infos){
    fs.appendFileSync(path.join(__dirname,rpath),infos)
}

// criando diretorio do usuário
function mkdir(dir){
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir)
    }
}
//finding folder 
function findFolder(dir){
    if(fs.existsSync(dir)){
        return true
    }
}
//lendo diretório
function readdir(dir){
    return new Promise((resolve,reject) => {
        fs.readdir(dir, (err,files) => {
            if(!err) resolve(files[files.length-1])
        })
    })
   
}

function objectKeys(obj,callback,execut){
    let c = 0
    if(obj){
        Object.keys(obj).forEach(element => {
            callback(obj[element]).then(r => {
                c++
                if(c == Object.keys(obj).length) {if(execut) execut()}
            })
        })
    }else execut()
    
}
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

async function userInfosById(id,extern){
    
    
        var users = JSON.parse(await readFile(`./backend/users/user_${id}/infos.json`))
        var username = users.name;
        var picturelink = await readdir(`./backend/users/user_${id}/uploads`)
        picturelink = picturelink ? `${picturelink}` : './unknowuser.png'

        var friends = JSON.parse(await readFile(`./backend/users/user_${id}/solicitacoes.json`))
        var flist = []

        if(extern){
            Object.keys(friends).forEach(key => {
                if(friends[key].accepted) {
                    flist[flist.length] = friends[key].from
                }
            })
        }
            

        return {
            username,
            picturelink,
            id,
            fid: flist
        }
}



module.exports = {
    readFile,
    exists,
    writeInFile,
    appendInFile,
    getCurrentID,
    correctInfos,
    mkdir,
    findFolder,
    readdir,
    searchUser,
    objectKeys,
    userInfosById,
    getKeyByValue
}
