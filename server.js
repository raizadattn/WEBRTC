const Socket = require('websocket').server
const http = require('http')

const server = http.createServer((req,res)=>{
})

server.listen(3000, ()=>{
    console.log(`Listening on port 3000`)
})


const webSocket = new Socket({httpServer: server})

let users = []

webSocket.on('request',(req)=>{
    const connection = req.accept()

    connection.on('message',(message)=>{
        // console.log('msg received', message)
        const data = JSON.parse(message.utf8Data)
        // console.log('parsed msg',data)
        console.log(' on  message   finding user')
        const user = findUser(data.username)
        // console.log('ALL USERS',users.forEach(el=>console.log(el)) )
        if(user){
            console.log('user found')
        }else{
            console.log('user not found')
        }

        console.log('data.type',data.type)
        switch(data.type){
            case 'store_user':
                if(user != null){
                    console.log('already present, hence not storing')
                    return
                }
                const newUser = {
                    conn: connection,
                    username: data.username
                }

                users.push(newUser)
                console.log('new user connected',newUser.username)
                console.log('ALL USERS',users.map(el=>el.username) )


                break
            case 'store_offer':
                console.log('-------------STORING OFFER-------------')
                if(user == null){
                    return
                }
                user.offer = data.offer

                break
            case 'store_candidate':
                if(user == null){
                    return
                }
                
                if(user.candidates == null){
                console.log('user.candidates is null')
                    user.candidates = []
                }
                console.log('user.candidates not null')
                user.candidates.push(data.candidate)
                console.log('new candidatss',user.candidates)
                break
            case 'send_answer':
                if(user == null){
                    return 
                }

                sendData({
                    type:'answer',
                    answer:data.answer
                }, user.conn)
                break
            case 'send_candidate':
                if(user == null){
                    return 
                }

                sendData({
                    type:'candidate',
                    answer:data.candidate
                }, user.conn)
                break
            case 'join_call':
                if(user == null){
                    return
                }

                sendData({
                    type:'offer',
                    offer: user.offer
                },connection)

                user.candidates.forEach(candidate=>{
                    sendData({
                        type:'candidate',
                        candidate: candidate
                    },connection)
                })
                break

        }
    })
    connection.on('close',(reason, description)=>{
        users.forEach(user=> {
            if(user.conn == connection){
                users.splice(users.indexOf(user),1)
                return
            }
        })
    })
})

function sendData(data, conn){
    console.log('sendind data from server',data.type)
    conn.send(JSON.stringify(data))
}

function findUser(username){
    for(let i=0; i< users.length; i++){
        if(users[i].username == username){
            return users[i]
        }
    }
}