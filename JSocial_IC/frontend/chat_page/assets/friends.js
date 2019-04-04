(function(){
    getFromName('btopts',0).addEventListener('click',function(){
        getFromClass('children_options',1).onclick = async function(){
            //post request
            let iduser = id('gid').getAttribute('idnumber')
            //variavel que contém os pedidos de amizade
            let requests = await JsonPostRequest('/friends',JSON.stringify({requestedId: iduser}))
            //changes
            const doc = setPerfilChanges(function(){
                id('pic_area').remove()
                id('name_area').style.height = (id('name_area').offsetHeight-80)+'px'
                getFromSelector('#name_area').remove()
               
                new friendList(id('user_infos'),requests,'searches')

                getFromSelector('#row > span').textContent = 'Pedidos de amizade'
               

                function setAddFunctions(){
                    doSomething(getArray(document.getElementsByClassName('adduser')),function(e,i){
                        e.addEventListener('click', async function(){
                            let index = (nth_child(getFromSelector('[searches]'),e.parentNode))
                            const acceptedRequests = await JsonPostRequest('/acceptrequest', JSON.stringify( {from: requests[index].id, to: id('gid').getAttribute('idnumber')} ))
                            requests.splice(index,1)
                            
                            let selected = getFromSelector(`[i="${acceptedRequests.fromid}"]`).cloneNode(true)
                            selected.children[2].remove()
                            
                            id('friends').appendChild(selected)

                            $(`#spcontainer > div[i="${acceptedRequests.fromid}"]`).animate({opacity: 0}).delay(1000, function(){
                                this.remove()
                            })
                            
                           
                        })
                    })
                }
                setAddFunctions()
            })
            //opening
            id('user_pic').click()
            //return to normal
            id('icback').addEventListener('click', function(){toNormal(doc,events)})
        }
      
    })
})()
