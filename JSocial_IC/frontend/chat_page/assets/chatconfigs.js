
function addMessage(text,addons){
    let messageHTML = `<div class="message-patern"><div  style="${(addons ? addons : '')}" class="span-patern"><div class="message">${text}</span></div></div>`
    id('allmsgs').insertAdjacentHTML('beforeend',messageHTML)
}

function setMessages(callback){
    
        id('send-parent').addEventListener('click', function(){
            let message = id('sentinput').value
            if(message){
                addMessage(message)
                callback(message)
                id('sentinput').value = ''
            }
        })
        id('sentinput').addEventListener('keydown',function(e){
            if(e.keyCode == 13){
                if(e.target.value){
                    addMessage(e.target.value)
                    callback(e.target.value)
                    e.target.value = ''
                }
            }
        }) 
}
function setChatEvents(callback){
    var friends = document.querySelectorAll('#friends > div > div > .pcontainer')
    if(friends.length) {

        var chathtml = `<div id="chat">
                            <div id="superior"></div>
                            <div id="area">
                                <div id="mensagens">
                                    <div id="allmsgs"></div>
                                </div>
                                <div id="inputsarea">
                                    <div id="input-patern">
                                        <input placeholder="Digite uma mensagem" type="text" id="sentinput"/>
                                    </div>
                                    <div id="send-parent">
                                        <img src="./send.png"/>
                                    </div>
                                </div>
                            </div>
                        </div>`
        
        function makeChat(property){
            id('chat_area').insertAdjacentHTML('beforeend', chathtml)

            let clickedHtml = property['cloneNode'](true)
            clickedHtml.className = 'chatcontainer'

            id('superior').appendChild(clickedHtml)
        }

        doSomething(friends, function(friendnode){
            friendnode.addEventListener('click', async function(){

                let userid = id('gid').getAttribute('idnumber')
                let fromid = friendnode.getAttribute('i')

                if(id('intro_area').style.display != 'none'){
                    id('intro_area').style.display = 'none'
                    makeChat(friendnode)
                    setMessages(function(m){
                        callback(m,fromid)
                    })

                }else {
                    id('chat').remove()
                    makeChat(friendnode)
                    setMessages(function(m){
                        callback(m,fromid)
                    })
                }
                var getMessages = await JsonPostRequest('/messages', JSON.stringify({to: fromid, user: userid}))
                
                Object.keys(getMessages).forEach(m => {
                    let arr = getMessages[m]
                    if(!arr[1]) {
                        addMessage(arr[0])
                    }else {
                        addMessage(arr[0], 'background-color: white;')
                    }
                })
            })
        })
    }
}
function getCurrentMessages(){
    
}