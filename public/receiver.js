const webSocket = new WebSocket("ws://127.0.0.1:3000");
// const webSocket = new WebSocket("ws://127.0.0.1:5500");

webSocket.onmessage = (event)=>{
    console.log('receiver socker on msj')
  handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data){
    console.log('receiver handleSignallingData',data)
    console.log('receiver data,type',data.type)
  switch(data.type){
    case 'offer':
      peerConn.setRemoteDescription(data.offer)
      createAndSendAnswer(peerConn) 
      break
    case "candidate":
      peerConn.addIceCandidate(data.candidate)
  }
}

function createAndSendAnswer(peerConn){
    console.log('receiver creatinga nd sending answer')
    // peerConn.createAnswer((answer)=>{
    //     console.log('creating anwswer',answer)
    //     peerConn.setLocalDescription(answer)
    //     sendData({
    //         type:'send_answer',
    //         answer:answer
    //     })
    // })
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer)
        sendData({
            type: "send_answer",
            answer: answer
        })
    }, error => {
        console.log('err in sendin answer error')
    })
    // peerConn.createAnswer().then(function(answer) {
    //     return peerConn.setLocalDescription(answer);
    //   })
    //   .then(function() {
    //               sendData({
    //         type:'send_answer',
    //         answer:answer
    //     })
    //     // Send the answer to the remote peer through the signaling server.
    //   })
    //   .catch(function(){
    //       console.log('error in sending answer')
    //   });
}


function sendData(data) {
    console.log('receiver sendData',data)
  data.username = username;
  webSocket.send(JSON.stringify(data));
}

let localStream;
let peerConn;
let username;

async function joinCall() {
    username = document.getElementById('username-input').value
    console.log('jc -username',username)
  console.log("join call");
  document.getElementById("video-call-div").style.display = "inline";
//   try {

    let stream = await navigator.mediaDevices.getUserMedia(
      {
        //  video:{
        //      frameRate:24,
        //      width:{
        //          min:480, ideal:720,  max:1280
        //      },
        //      aspectRatio:1.3333
        //  },
        video: true,
        audio: true,
      }
    );
    console.log('stream',stream)
    document.getElementById("local-video").srcObject = stream;
      
    //STUN/TURN server
    let configuration = {
      iceServers: [{
        'urls':['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
      }]
    }
    peerConn = new RTCPeerConnection(configuration)
   
    // peerConn.addStream(localStream)
    localStream = stream
    stream.getTracks().forEach(function(track) {
        peerConn.addTrack(track, stream);
      });
    
    // peerConn.onaddstream = (e)=>{
    peerConn.onaddstream = (e)=>{
      console.log('receiver adding remote video')
      document.getElementById("remote-video").srcObject = e.stream
    }
  
    peerConn.onicecandidate = ((e) =>{
      if(e.candidate == null){
        return
      }
      sendData({
        type: "send_candidate",
        candidate: e.candidate
      })
    })

    sendData({
        type:'join_call'
    })
    
//   } catch (error) {
//     console.log('error occuered! -> ',error)
//   }
}

let isAudio = true
function muteAudio(){
  isAudio = !isAudio
  localStream.getAudioTracks()[0].enabled = isAudio 
  console.log('audio Muted',isAudio)
}

let isVideo = true
function muteVideo(){
  isVideo = !isVideo
  localStream.getVideoTracks()[0].enabled = isVideo
  console.log('vidoe muted',isVideo)
}