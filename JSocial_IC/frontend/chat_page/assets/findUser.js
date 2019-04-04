(function(){
    var clicks = 1
    getFromName('btopts',0).addEventListener('click', function(){
       
           getFromClass('children_options',0).onclick = function(){
                id('user_pic').click()

                const doc = setPerfilChanges(function(){
                    id('pic_area').remove()
                    id('name_area').style.height = (id('name_area').offsetHeight-80)+'px'
                    getFromSelector('#name_area > div:nth-child(3)').remove()
                    id('pencil').src = './correct.png'
                    id('confirmChanges').remove()
                
                    id('nameipt').value = ''
                    id('nameipt').setAttribute('autofocus','')
                    id('nameipt').removeAttribute('readonly')
                    id('nameipt').placeholder = 'Nome ou id do usuario' 
                    getFromSelector('#row > span').textContent = 'Adicionar amigo'
                    getFromSelector('#name_area > div > span').textContent = 'Digite no campo abaixo'
                })
                
                id('icback').addEventListener('click', function(){toNormal(doc,events)})
              
                /* fim */

                /*Criando o HTML dos usuários encontrados*/
                let searchedContainer = `<div id="searched" search>
                                            <div id="spcontainer" searchedusers></div>
                                         </div>`
                
                id('user_infos').insertAdjacentHTML('beforeend',searchedContainer)
            }
            /* enviando o input para o servidor */
            id('pencil').removeEventListener('click',events[0])
        
            id('pencil').onclick = function(){
                
               function setUsers(){
                    let str = id('nameipt').value
        
                    JsonPostRequest('/searchuser',JSON.stringify( {infos: str} ))
                    .then( result => {
            
                        Object.keys(result).forEach( (e,i) => {
                           
                            let container = `<div class="pcontainer">
                                        <div class="user_pic_container">
                                            <img class="user-pic-min" src="${result[e].pic}"/>
                                        </div>
                                        <span class="searchedname">${result[e].name}</span>
                                        <img class="adduser" src="./add-min.png"/>
                                    </div>`

                            getFromSelector('[searchedusers]').insertAdjacentHTML('beforeend',container)
                            
                            getFromClass('adduser',i).addEventListener('click',function(){
                                
                            if(id('gid').getAttribute('idnumber') != result[e].id){
                                //code to add user
                                const data = {}
                                data[`${Date.now()}`] = {
                                    to: result[e].id,
                                    from: id('gid').getAttribute('idnumber'),
                                    accepted: false
                                }
                                JsonPostRequest('/adduser',JSON.stringify(data)).then(res => {
                                    
                                    if(res.error) {
                                          jqueryAnimate('danger','Usuário já registrado','ou solicitado')    
                                    }else if(res.success){
                                          jqueryAnimate('success','Parabéns!','Seu pedido de amizade foi enviado com sucesso!')
                                    }
                                })}
                            else jqueryAnimate('warning','Really?','Tentando enviar um pedido de amizade para sí mesmo?')
                            })
                        
                        })

                        
                    })
                }
                if(getFromSelector('[searchedusers]').childNodes.length != 0){
                   getFromSelector('[searchedusers]').remove()
                   getFromSelector('[search]').insertAdjacentHTML('beforeend','<div id="spcontainer" searchedusers></div>')
                   setUsers()
                }else setUsers()
            } 
    })  
})()