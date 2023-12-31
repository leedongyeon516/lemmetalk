const socket = io('/')
const myPeer = new Peer(undefined, { host: '/', port: '3001' })
const peers = {}

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then(stream => addVideoStream(myVideo, stream))

myPeer.on('call', call => {
  const peerVideo = document.createElement('video')

  call.answer(stream)
  call.on('stream', peerStream => addVideoStream(peerVideo, peerStream))
})

socket.on('user-connected', userId => connectToNewUser(userId, stream))
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => socket.emit('join-room', ROOM_ID, id))

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')

  call.on('stream', peerStream => addVideoStream(video, peerStream))
  call.on('close', () => video.remove())

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => video.play())
  videoGrid.append(video)
}
