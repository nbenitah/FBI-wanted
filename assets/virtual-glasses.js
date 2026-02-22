// --- Simple PNG Glasses Overlay with face-api.js ---
// 2D overlay only
let selectedGlassesUrl = document.querySelector('.selected-glasses img').src;
let glassesImg = new window.Image();
glassesImg.src = selectedGlassesUrl;
glassesImg.onerror = function() {
    alert('Failed to load glasses image: ' + glassesImg.src);
    console.error('Failed to load glasses image:', glassesImg.src);
};

async function setupFaceApi() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('models');
}

function startWebcam() {
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => { video.srcObject = stream; });
}

function getMidpoint(p1, p2) {
    return [
        (p1[0] + p2[0]) / 2,
        (p1[1] + p2[1]) / 2
    ];
}

function drawGlasses(canvas, landmarks, glassesImg) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Get left and right eye positions
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    console.log('drawGlasses leftEye:', leftEye);
    console.log('drawGlasses rightEye:', rightEye);
    console.log('drawGlasses glassesImg loaded:', glassesImg.complete, 'naturalWidth:', glassesImg.naturalWidth);
    if (!leftEye || !rightEye || leftEye.length < 1 || rightEye.length < 4) {
        console.warn('drawGlasses: Invalid eye landmarks, skipping draw.');
        return;
    }
    const mid = getMidpoint(leftEye[0], rightEye[3]);
    // Calculate angle and size
    const dx = rightEye[3][0] - leftEye[0][0];
    const dy = rightEye[3][1] - leftEye[0][1];
    const angle = Math.atan2(dy, dx);
    const glassesWidth = Math.sqrt(dx*dx + dy*dy) * 2.2;
    const glassesHeight = glassesWidth * (glassesImg.height / glassesImg.width);
    ctx.save();
    ctx.translate(mid[0], mid[1]);
    ctx.rotate(angle);
    ctx.drawImage(glassesImg, -glassesWidth/2, -glassesHeight/2, glassesWidth, glassesHeight);
    ctx.restore();
}

async function runOverlay() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('overlay');
    setInterval(async () => {
        if (video.paused || video.ended) return;
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        console.log('Detection:', detection);
        if (detection && detection.landmarks && glassesImg.complete && glassesImg.naturalWidth > 0) {
            drawGlasses(canvas, detection.landmarks, glassesImg);
        } else {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, 100);
}

// Handle glasses selection
document.querySelectorAll('#glasses-list ul li img').forEach(img => {
    img.addEventListener('click', function() {
        document.querySelectorAll('#glasses-list ul li').forEach(li => li.classList.remove('selected-glasses'));
        this.parentElement.classList.add('selected-glasses');
        selectedGlassesUrl = this.src;
        glassesImg.src = selectedGlassesUrl;
    });
});

// Show loading spinner initially
document.querySelectorAll('.loading').forEach(el => el.classList.remove('d-none'));

(async function() {
    await setupFaceApi();
    startWebcam();
    document.getElementById('video').addEventListener('play', () => {
        runOverlay();
        // Hide loading spinner after overlay starts
        setTimeout(() => {
            document.querySelectorAll('.loading').forEach(el => el.classList.add('d-none'));
        }, 500);
    });
})();

// Ensure margin-left is initialized for slider
if (window.jQuery && $("#glasses-list ul").css("margin-left") === "auto") {
    $("#glasses-list ul").css("margin-left", "0px");
}

if (window.jQuery) {
    $("#arrowLeft").click(function () {
        let itemWidth = parseInt($("#glasses-list ul li").css("width")) 
                        + parseInt($("#glasses-list ul li").css("margin-left")) 
                        + parseInt($("#glasses-list ul li").css("margin-right"));
        let marginLeft = parseInt($("#glasses-list ul").css("margin-left"));
        $("#glasses-list ul").css({"margin-left": (marginLeft+itemWidth) +"px", "transition": "0.3s"});
    });

    $("#arrowRight").click(function () {
        let itemWidth = parseInt($("#glasses-list ul li").css("width")) 
        + parseInt($("#glasses-list ul li").css("margin-left")) 
        + parseInt($("#glasses-list ul li").css("margin-right"));
        let marginLeft = parseInt($("#glasses-list ul").css("margin-left"));
        $("#glasses-list ul").css({"margin-left": (marginLeft-itemWidth) +"px", "transition": "0.3s"});
    });
}


async function detectFaces() {
    let inputElement = webcamElement;
    let flipHorizontal = !isVideo;
    
    await model.estimateFaces
    ({
        input: inputElement,
        returnTensors: false,
        flipHorizontal: flipHorizontal,
        predictIrises: false
    }).then(faces => {
        //console.log(faces);
        drawglasses(faces).then(() => {
            if(clearglasses){
                clearCanvas();
                clearglasses = false;
            }
            if(detectFace){
                cameraFrame = requestAnimFrame(detectFaces);
            }
        });
    });
}

async function drawglasses(faces){
    if(isVideo && (glassesArray.length != faces.length) ){
        clearCanvas();
        for (let j = 0; j < faces.length; j++) {
            await setup3dGlasses();
        }
    }   

    for (let i = 0; i < faces.length; i++) {
        let glasses = glassesArray[i];
        let face = faces[i];
        if(typeof glasses !== "undefined" && typeof face !== "undefined")
        {
            let pointMidEye = face.scaledMesh[ glassesKeyPoints.midEye ];
            let pointleftEye = face.scaledMesh[ glassesKeyPoints.leftEye ];
            let pointNoseBottom = face.scaledMesh[ glassesKeyPoints.noseBottom ];
            let pointrightEye = face.scaledMesh[ glassesKeyPoints.rightEye ];

            glasses.position.x = pointMidEye[ 0 ];
            glasses.position.y = -pointMidEye[ 1 ] + parseFloat(selectedglasses.attr("data-3d-up"));
            glasses.position.z = -camera.position.z + pointMidEye[ 2 ];

            glasses.up.x = pointMidEye[ 0 ] - pointNoseBottom[ 0 ];
            glasses.up.y = -( pointMidEye[ 1 ] - pointNoseBottom[ 1 ] );
            glasses.up.z = pointMidEye[ 2 ] - pointNoseBottom[ 2 ];
            const length = Math.sqrt( glasses.up.x ** 2 + glasses.up.y ** 2 + glasses.up.z ** 2 );
            glasses.up.x /= length;
            glasses.up.y /= length;
            glasses.up.z /= length;

            const eyeDist = Math.sqrt(
                ( pointleftEye[ 0 ] - pointrightEye[ 0 ] ) ** 2 +
                ( pointleftEye[ 1 ] - pointrightEye[ 1 ] ) ** 2 +
                ( pointleftEye[ 2 ] - pointrightEye[ 2 ] ) ** 2
            );
            glasses.scale.x = eyeDist * parseFloat(selectedglasses.attr("data-3d-scale")) ;
            glasses.scale.y = eyeDist * parseFloat(selectedglasses.attr("data-3d-scale")) ;
            glasses.scale.z = eyeDist * parseFloat(selectedglasses.attr("data-3d-scale")) ;

            glasses.rotation.y = Math.PI;
            glasses.rotation.z = Math.PI / 2 - Math.acos( glasses.up.x );
            
            renderer.render(scene, camera);
        }
    }
}


function clearCanvas(){
    for( var i = scene.children.length - 1; i >= 0; i--) { 
        var obj = scene.children[i];
        if(obj.type=='Group'){
            scene.remove(obj);
        }
    }
    renderer.render(scene, camera);
    glassesArray = [];
}

function switchSource(){
    clearCanvas();
    let containerElement
    if(isVideo){
        containerElement = $("#webcam-container");
    }else{
        containerElement = $("#image-container");
        setup3dGlasses();
    }
    setup3dCamera();
    $("#canvas").appendTo(containerElement);
    $(".loading").appendTo(containerElement);
    $("#glasses-slider").appendTo(containerElement);
}

function setup3dScene(){
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        alpha: true
    });
    //light
    var frontLight = new THREE.SpotLight( 0xffffff, 0.3 );
    frontLight.position.set( 10, 10, 10 );
    scene.add( frontLight );
    var backLight = new THREE.SpotLight( 0xffffff, 0.3  );
    backLight.position.set( 10, 10, -10)
    scene.add(backLight);
}
    

function setup3dCamera(){  
    if(isVideo){
        camera = new THREE.PerspectiveCamera( 45, 1, 0.1, 2000 );
        let videoWidth = webcamElement.width;
        let videoHeight = webcamElement.height;
        camera.position.x = videoWidth / 2;
        camera.position.y = -videoHeight / 2;
        camera.position.z = -( videoHeight / 2 ) / Math.tan( 45 / 2 ); 
        camera.lookAt( { x: videoWidth / 2, y: -videoHeight / 2, z: 0, isVector3: true } );
        renderer.setSize(videoWidth, videoHeight);
        renderer.setClearColor(0x000000, 0);
    }
    else{  
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        camera.position.set(0, 0, 1.5);
        camera.lookAt(scene.position);
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( 0x3399cc, 1 ); 
        obControls = new OrbitControls(camera, renderer.domElement);  
    }
    let cameraExists = false;
    scene.children.forEach(function(child){
        if(child.type=='PerspectiveCamera'){
            cameraExists = true;
        }
    });
    if(!cameraExists){
        camera.add( new THREE.PointLight( 0xffffff, 0.8 ) );
        scene.add( camera );
    }
    setup3dAnimate();
}

async function setup3dGlasses(){
    return new Promise(resolve => {
        var threeType = selectedglasses.attr("data-3d-type");
        if(threeType == 'gltf'){
            var gltfLoader = new GLTFLoader();
            gltfLoader.setPath(selectedglasses.attr("data-3d-model-path"));
            gltfLoader.load( selectedglasses.attr("data-3d-model"), function ( object ) {
                object.scene.position.set(selectedglasses.attr("data-3d-x"), selectedglasses.attr("data-3d-y"), selectedglasses.attr("data-3d-z"));
                var scale = selectedglasses.attr("data-3d-scale");
                if(window.innerWidth < 480){
                    scale = scale * 0.5;
                }
                object.scene.scale.set(scale, scale,scale);
                scene.add( object.scene );
                glassesArray.push(object.scene);
                resolve('loaded');        
            });
        }
    });
}

var setup3dAnimate = function () {
    if(!isVideo){
        requestAnimationFrame( setup3dAnimate );
        obControls.update();
    }
    renderer.render(scene, camera);
};

// Fetch and display glasses purchases in the UI
async function fetchGlassesPurchases() {
  const response = await fetch('https://699620147d1786436573918c.mockapi.io/api/v1/glasses-purchases');
  const data = await response.json();
  const recordsDiv = document.getElementById('purchase-records');
  if (!recordsDiv) return;
  // Use Bootstrap row and columns for layout
  recordsDiv.innerHTML = '<div class="row" id="purchase-records-row"></div>';
  const rowDiv = document.getElementById('purchase-records-row');
  data.forEach(purchase => {
    const name = purchase.name;
    // Format prescription as '-1.25-050@180' if possible
    let prescription = purchase.prescription;
    if (Array.isArray(prescription)) {
      prescription = prescription.join('-');
    }
    // Try to reformat if prescription is in CSV or space-separated
    if (typeof prescription === 'string') {
      // If already in correct format, leave as is
      if (!/^[-+]?\d+(\.\d+)?-\d{3}@\d{3}$/.test(prescription)) {
        // Try to parse and reformat
        // Example: "-1.25, -0.50, 180" or "-1.25 -0.50 180"
        let parts = prescription.split(/,|\s+/).map(s => s.trim()).filter(Boolean);
        if (parts.length === 3) {
          // Format: sphere-cylinder-axis
          let [sphere, cylinder, axis] = parts;
          // Remove leading zeros from axis, pad to 3 digits
          axis = axis.replace(/^0+/, '');
          axis = axis.padStart(3, '0');
          // Remove leading zeros from cylinder, pad to 3 digits
          cylinder = cylinder.replace(/^0+/, '');
          cylinder = cylinder.padStart(3, '0');
          prescription = `${sphere}-${cylinder}@${axis}`;
        }
      }
    }
    // Check for alternate purchase date field names
    let purchaseDate = purchase.purchaseDate || purchase.purchase_date || purchase.date || '';
    if (purchaseDate && purchaseDate.length > 10) {
      purchaseDate = purchaseDate.slice(0, 10);
    }
    if (!purchaseDate) {
      purchaseDate = 'N/A';
    }
    const frame = purchase.frame;
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    col.innerHTML =
      `<div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
          <p class="card-text"><strong>Prescription:</strong> ${prescription}<br>
          <strong>Frame:</strong> ${frame}<br>
          <strong>Purchase Date:</strong> ${purchaseDate}</p>
        </div>
      </div>`;
    rowDiv.appendChild(col);
  });
}

fetchGlassesPurchases();

// Fetch and display users from JSONPlaceholder
async function fetchUsers() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  const users = await response.json();
  const usersDiv = document.getElementById('users-records');
  if (!usersDiv) return;
  usersDiv.innerHTML = '<div class="row" id="users-records-row"></div>';
  const rowDiv = document.getElementById('users-records-row');
  users.forEach(user => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    col.innerHTML =
      `<div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${user.name}</h5>
          <p class="card-text"><strong>Email:</strong> ${user.email}<br>
          <strong>Username:</strong> ${user.username}<br>
          <strong>Phone:</strong> ${user.phone}<br>
          <strong>Website:</strong> ${user.website}</p>
        </div>
      </div>`;
    rowDiv.appendChild(col);
  });
}

// Fetch and display posts from JSONPlaceholder
async function fetchPosts() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const posts = await response.json();
  const postsDiv = document.getElementById('posts-records');
  if (!postsDiv) return;
  postsDiv.innerHTML = '<div class="row" id="posts-records-row"></div>';
  const rowDiv = document.getElementById('posts-records-row');
  posts.slice(0, 12).forEach(post => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    col.innerHTML =
      `<div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${post.title}</h5>
          <p class="card-text">${post.body}</p>
        </div>
      </div>`;
    rowDiv.appendChild(col);
  });
}

fetchUsers();
fetchPosts();

