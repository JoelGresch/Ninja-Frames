
const cameraPreview = document.getElementById("camera-preview")
const frameCaptureCanvas = document.getElementById("frame-capture-canvas")
const captureBtn = document.getElementById("capture-btn")
const timeline = document.getElementById("timeline")
const playBtn = document.getElementById("play-btn")
const frameRateInput = document.getElementById("frame-rate-input")

let frames = []
let currentAnimationFrame = 0

let playing = false
let animationLoop = null

navigator.mediaDevices.getUserMedia({video: true})
	.then((stream) => {
		cameraPreview.srcObject = stream
		cameraPreview.autoplay = true
		cameraPreview.playsinline = true
	})
	.then(() => {
	})
	.catch((error) => {
		console.log(error)
	})

cameraPreview.onloadedmetadata = () => {
		frameCaptureCanvas.width = cameraPreview.videoWidth
		console.log("Video Width: " + cameraPreview.videoWidth)
		frameCaptureCanvas.height = cameraPreview.videoHeight
		console.log("Video Height: " + cameraPreview.videoHeight)
}

function captureFrame() {
	
	if (playing) {
		return
	}
	
	let ctx = frameCaptureCanvas.getContext("2d")
	ctx.drawImage(cameraPreview, 0, 0)
	// console.log("Frame Captured")
	
	let frameContainer = document.createElement("div")
	frameContainer.className = "frame-container"
	frameContainer.id = frames.length + "-frame"
	
	let framePreview = document.createElement("img")
	framePreview.className = "frame-preview"
	framePreview.src = frameCaptureCanvas.toDataURL()
	
	let frameDeleteBtn = document.createElement("button")
	frameDeleteBtn.className = "frame-delete-btn"
	frameDeleteBtn.innerText = "╳"
	frameDeleteBtn.onclick = () => deleteFrame(frameContainer)
	
	frameContainer.appendChild(framePreview)
	frameContainer.appendChild(frameDeleteBtn)
	timeline.appendChild(frameContainer)
	
	frames.push(framePreview)
}

function playBtnClicked() {
	if (playing) {
		pause()
	} else if (frames.length > 0) {
		play()
	}
}

function play() {
	playBtn.innerText = "⏸"
	playing = true
	frameCaptureCanvas.style.display = "block"
	cameraPreview.style.display = "none"
	animationLoop = setInterval(animate, 1000/frameRateInput.value)
	frameRateInput.disabled = true
}

function pause() {
	playBtn.innerText = "▶"
	playing = false
	frameCaptureCanvas.style.display = "none"
	cameraPreview.style.display = "block"
	clearInterval(animationLoop)
	currentAnimationFrame = 0
	frameRateInput.disabled = false
}

function animate() {
	let ctx = frameCaptureCanvas.getContext("2d")
	ctx.drawImage(frames[currentAnimationFrame], 0, 0)
	
	currentAnimationFrame++
	if (currentAnimationFrame >= frames.length) {
		currentAnimationFrame = 0
	}
}

function deleteFrame(frame) {
	if (!playing) {
		frames.splice(parseInt(frame.id), 1)
		frame.remove()
		indexFrameIds()
	}
}

function indexFrameIds() {
	let i = 0
	for (let frame of frames) {
		frame.parentElement.id = i + "-frame"
		i++
	}
}

function save() {
	let gif = new GIF({
		repeat: 0,
		quality: 1,
		workers: 2,
		workerScript: 'vendor/gif.worker.js',
		background: '#000',
		width: frameCaptureCanvas.width,
		height: frameCaptureCanvas.height,
		transparent: null,
		dither: "FloydSteinberg",
		debug: false
	})
	
	for (let frame of frames) {
		gif.addFrame(frame, {delay: 1000/frameRateInput.value})
	}
	
	gif.on('finished', (blob) => {
		let downloadLink = document.createElement("a")
		downloadLink.href = URL.createObjectURL(blob)
		downloadLink.download = "animation"
		document.body.appendChild(downloadLink)
		downloadLink.click()
		document.body.removeChild(downloadLink)
	})
	
	gif.render()
}