
function id(id){
    return document.getElementById(id)
}
function createElement(element){
    return document.createElement(element)
}
function setID(element,id){
    element.id = id
}
function setClass(element,classname){
    element.className = classname
}
function appendin(dad,children){
    dad.appendChild(children)
}
function setCssAttribute(element,attribute,props){
    element.style[attribute] = props
}
function getPropertie(elem,propertie){
    return elem[propertie]
}
function getFromClass(classname,i){
    return document.getElementsByClassName(classname)[i]
}
function getFromName(name,i){
    return document.getElementsByName(name)[i]
}
function getFromSelector(selector){
    return document.querySelector(selector)
}
function getArray(obj){
    return Array.from(obj)
}
function doSomething(array,callback){
    array.forEach( (e,i) => {
        callback(e,i)
    })
}
function setPerfilChanges(changes){

    const innerHTML = id('main_container').innerHTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(innerHTML,'text/html')

    changes()

    return doc
}
function toNormal(document,events) {
    setTimeout(() => {
        id('user_infos').remove()
        document.getElementById('user_infos').style.left = '-100%'
        /* adicionando os eventos novamente aos respectivos elementos */                
        id('main_container').appendChild(document.getElementById('user_infos'))
        id('pencil').onclick = events[0]
        getFromSelector('[sobrepor]').onclick = events[1]
     },500)
}

function JsonPostRequest(url,data){
    return new Promise((resolve,reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST',url,true)

        xhr.onreadystatechange = function(){
            if(xhr.status == 200 && xhr.readyState == 4){
                resolve(JSON.parse(xhr.responseText))
            }
        }

        xhr.setRequestHeader('Content-Type','application/json')
        xhr.send(data)

    })
}
function jqueryAnimate(color,message1,message2){
    var message = `<div id="alert" style="top:-70px;position: absolute; margin-left: auto; margin-right: auto; left:0; right: 0; z-index:1000"class="alert alert-${color}" role="alert">
      <strong>${message1}</strong> ${message2}
    </div>`
    id('main_container').insertAdjacentHTML('beforeend',message)
    $('#alert').animate({top: '0px'}).delay(2000).animate({top:'-100px'},function(){this.remove()})                    
}


function friendList(toadd,requests,localeAttribute){
    console.log(toadd)

    let searchedContainer = `<div id="searched">
                            <div id="spcontainer" ${localeAttribute}></div>
                         </div>`

    toadd['insertAdjacentHTML']('beforeend',searchedContainer)

    requests.forEach((e,i) => {

        let container = `<div class="pcontainer" i="${e.id}">
                        <div class="user_pic_container">
                            <img class="user-pic-min" src="${e.picturelink}"/>
                        </div>
                        <span class="searchedname">${e.username}</span>
                        ${(localeAttribute != 'friends' ? '<img class="adduser" src="./add-min.png"/>' : '')}
                    </div>`
        getFromSelector(`[${localeAttribute}]`).insertAdjacentHTML('beforeend',container)
    })
}

function nth_child(parent,child){
    let index = 0
    getArray(parent.children).forEach((e,i) => {
        if(e == child) index = i
    })
    return index
}
