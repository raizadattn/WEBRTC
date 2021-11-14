const webSocket = new WebSocket("ws://127.0.0.1:3000");

webSocket.onmessage = (event)=>{
  handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data){
  console.log('senders handleSignallingData',data.type)
  switch(data.type){
    case 'answer':
      peerConn.setRemoteDescription(data.answer)
      break
    case "candidate":
      peerConn.addIceCandidate(data.candidate)
  }
}

let username;

function sendUsername() {
  username = document.getElementById("username-input").value;
  sendData({
    type: "store_user",
  });
}

function sendData(data) {
  data.username = username;
  webSocket.send(JSON.stringify(data));
}

let localStream;
let peerConn;

async function startCall() {
  console.log("start call");
  document.getElementById("video-call-div").style.display = "inline";
  try {

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
    console.log('sender.js adding stream')
  
    peerConn.onaddstream = (e)=>{
      console.log('adding remote0video')
      document.getElementById("remote-video").srcObject = e.stream
    }
  
    peerConn.onicecandidate = ((e) =>{
      if(e.candidate == null){
        return
      }
      sendData({
        type: "store_candidate",
        candidate: e.candidate
      })
    })
    createAndSendOffer()
    
  } catch (error) {
    console.log('error occuered! -> ',error)
  }
}

function createAndSendOffer(){
  peerConn.createOffer((offer)=>{
    console.log('createAndSendOffer',offer)
    sendData({
      type:'store_offer',
      offer:offer
    })
    peerConn.setLocalDescription(offer)
  },(error)=>{
    console.log('error1: ',error)
  })
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
  console.log('video Muted',isVideo)
}