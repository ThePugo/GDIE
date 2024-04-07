let totalQuestionsGlobal = 0;
let userScore = 0;
let answered = 0;
let answeredQuestions = {};

// Escucha cuando el contenido del DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function () {
  //FUNCIÓN PARA BOTÓN DEL LOGO:
  var homeLink = document.getElementById('principal');
  homeLink.addEventListener('click', function () {
    location.reload();
  });

  document.querySelector('.page-description').classList.add('animated');

  document.querySelectorAll('.album').forEach(function (album) {
    album.classList.add('album-animated');
  });

  const scoreDisplay = document.getElementById('userScore');

  // Se cuentan todas las preguntas de todos los vídeos
  const videos = document.querySelectorAll('.video-item');

  // Inicializa un array para almacenar las rutas de los archivos VTT de preguntas
  const vttPaths = [];

  // Recorre cada elemento de video
  videos.forEach(video => {
    // Dentro de cada video, encuentra los elementos track con el label "questions"
    const questionTracks = video.querySelectorAll('track[label="questions"]');

    // Recorre cada elemento track encontrado
    questionTracks.forEach(track => {
      // Obtiene el valor del atributo src y lo agrega al array vttPaths
      const src = track.getAttribute('src');
      if (src) {
        vttPaths.push(src);
      }
    });
  });
  countAllQuestions(vttPaths).then(totalQuestions => {
    totalQuestionsGlobal = totalQuestions;
    scoreDisplay.textContent = `0 / ${totalQuestionsGlobal}`;
    document.getElementById('check').textContent = `Respondidas= ${answered}, Sin responder= ${totalQuestionsGlobal - answered}`
  });
  //FUNCIÓN PARA TODOS LOS BOTONES DEL CONTROLADOR CUSTOMIZADO
  const playPauseBtn = document.getElementById('playPauseBtn');
  const muteBtn = document.getElementById('muteBtn');
  const volumeControl = document.getElementById('volumeControl');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const speedControl = document.getElementById('speedControl');
  const subtitlesSelect = document.getElementById('subtitlesSelect');
  const qualitySelect = document.getElementById('qualitySelect');
  const settingsButton = document.getElementById('settingsBtn');
  const settingsMenu = document.getElementById('settingsMenu');
  const speedControlBtn = document.getElementById('speedControlBtn');
  const subtitlesBtn = document.getElementById('subtitlesBtn');
  const qualityBtn = document.getElementById('qualityBtn');
  const forwardBtn = document.getElementById('forwardBtn');
  const backwardBtn = document.getElementById('backwardBtn');

  //FUNCIÓN PARA PLAY/PAUSE
  function togglePlayPause(event) {
    if (event) {
      video = event.target;
    }
    else {

    }
    if (video) {
      if (video.paused || video.ended) {
        video.play();
        playPauseBtn.firstChild.src = 'images/pause.png';
      } else {
        video.pause();
        playPauseBtn.firstChild.src = 'images/play.png';
      }
    }
  }

  // Asignación del evento de clic al botón de play/pause
  playPauseBtn.addEventListener('click', function (event) {
    // Detener la propagación para evitar que se active el evento de clic del video-container
    event.stopPropagation();
    togglePlayPause();
  });

  // Asignación del evento de clic a cada video-item
  document.querySelectorAll('.video-item').forEach(video => {
    video.addEventListener('click', function (event) {
      // Detener la propagación para evitar que se active el evento de clic del contenedor de video
      event.stopPropagation();
      togglePlayPause(event);
    });
  });

  // Asignación del evento de clic al botón de forwards
  forwardBtn.addEventListener('click', () => {
    video.currentTime = video.currentTime + 5;
  });

  // Asignación del evento de clic al botón de backwards
  backwardBtn.addEventListener('click', () => {
    video.currentTime = video.currentTime - 5;
  });

  // Asignación del evento de clic al botón de mute
  muteBtn.addEventListener('click', () => {
    if (video) {
      video.muted = !video.muted;
      muteBtn.firstChild.src = video.muted ? 'images/unmute.png' : 'images/mute.png';

      // Actualiza el slider de volumen
      volumeControl.value = video.muted ? 0 : 1;

      // Si se ha silenciado el video, guarda el valor actual del volumen para poder restaurarlo más tarde
      if (video.muted) {
        video.dataset.previousVolume = video.volume;
        video.volume = 0;

      } else {
        // Si se está activando el sonido, restaura el volumen al valor guardado
        video.volume = video.dataset.previousVolume || 1;
        volumeControl.value = video.dataset.previousVolume || 1;
      }
      /* Para Chrome y Edge */
      volumeControl.style.setProperty('--slider-value', `${volumeControl.value * 100}%`);
    }
  });

  // Asignación de evento de input al slider de volumen
  volumeControl.addEventListener('input', () => {
    video.volume = volumeControl.value;
    const sliderValue = volumeControl.value * 100;
    /* Para Chrome y Edge */
    volumeControl.style.setProperty('--slider-value', `${sliderValue}%`);
    if (sliderValue === 0) {
      muteBtn.firstChild.src = 'images/unmute.png';
    }
    else {
      muteBtn.firstChild.src = 'images/mute.png';
    }
  });

  // Asignación del evento de clic al botón de fullscreen
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(err => {
        alert(`Error al intentar pantalla completa: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  // Asignación del evento de clic a los subtítulos
  subtitlesSelect.addEventListener('change', (event) => {
    const selectedOption = subtitlesSelect.value; // Valor seleccionado en el selector

    Array.from(video.textTracks).forEach((track) => {
      if (track.kind === "captions") {
        track.mode = 'disabled';
        if (track.language === selectedOption) {
          track.mode = 'showing';
        }
      }
    });
  });

  // Asignación del evento de clic a la velocidad
  speedControl.addEventListener('change', (event) => {
    const currentRate = speedControl.value;
    if (video.style.display !== 'none') { // Verifica que el video esté siendo mostrado
      video.playbackRate = currentRate;
    }
  });

  qualitySelect.addEventListener('change', (event) => {
    const currentQuality = qualitySelect.value;
    const currentTime = video.currentTime;
    const currentRate = video.playbackRate;
    const videoId = video.id;

    let baseName = videoId;

    // Construimos el nuevo src basándonos en la calidad seleccionada
    let newSrc;
    switch (currentQuality) {
      case '720':
        newSrc = `videos/${baseName}720.mp4`;
        break;
      case '1080':
        newSrc = `videos/${baseName}.mp4`;
        break;
      case '480':
        newSrc = `videos/${baseName}480.mp4`;
        break;
    }

    video.src = newSrc;
    video.load();
    video.currentTime = currentTime;
    video.playbackRate = currentRate;
    video.play();
  });

  // Asignación del evento de clic al botón de config
  settingsButton.addEventListener('click', function () {
    // Verificar si el menú ya está visible
    const isMenuVisible = settingsMenu.style.display === 'block';

    // Toggle la visibilidad del menú de configuración
    settingsMenu.style.display = isMenuVisible ? 'none' : 'block';

  });

  // Asignación del evento de clic al botón de velocidad
  speedControlBtn.addEventListener('click', () => {
    // Muestra u oculta el control de velocidad
    if (subtitlesSelect.style.display === 'inline-block' || qualitySelect.style.display === 'inline-block') {
      subtitlesSelect.style.display = 'none';
      qualitySelect.style.display = 'none';
      speedControl.style.display = 'inline-block';
    }
    else if (speedControl.style.display === 'inline-block') {
      speedControl.style.display = 'none';
    }
    else {
      speedControl.style.display = 'inline-block';
    }
  });

  // Asignación del evento de clic al botón de subtítulos
  subtitlesBtn.addEventListener('click', () => {
    // Muestra u oculta el control de subtítulos
    if (speedControl.style.display === 'inline-block' || qualitySelect.style.display === 'inline-block') {
      speedControl.style.display = 'none';
      qualitySelect.style.display = 'none';
      subtitlesSelect.style.display = 'inline-block';
    }
    else if (subtitlesSelect.style.display === 'inline-block') {
      subtitlesSelect.style.display = 'none';
    }
    else {
      subtitlesSelect.style.display = 'inline-block';
    }
  });

  // Asignación del evento de clic al botón de calidad
  qualityBtn.addEventListener('click', () => {
    //Muestra u oculta el control de calidad
    if (speedControl.style.display === 'inline-block' || subtitlesSelect.style.display === 'inline-block') {
      speedControl.style.display = 'none';
      qualitySelect.style.display = 'inline-block';
      subtitlesSelect.style.display = 'none';
    }
    else if (qualitySelect.style.display === 'inline-block') {
      qualitySelect.style.display = 'none';
    }
    else {
      qualitySelect.style.display = 'inline-block';
    }
  });
});

var video = document.querySelector('.video-item');

// Función para añadir animación de giro a los elementos de álbum
function animateAlbum(element) {
  element.classList.toggle('flip');
}

// Función para reproducir un video
function playVideo(videoId) {
  // Obtiene todos los elementos de video.
  var videos = document.querySelectorAll('.video-item');

  // Detiene y oculta cada video.
  videos.forEach(function (video) {
    video.pause();
    video.currentTime = 0;
    video.style.display = 'none';
    disableMetadataTracks(video);
    resetVideoSettings(video);
  });

  // Encuentra el video específico y lo muestra.
  var videoToPlay = document.getElementById(videoId);
  if (videoToPlay) {
    video = videoToPlay;
    initializeProgressBarForVideo(videoId);
    var timeDisplay = document.getElementById('timeDisplay');
    updateTimeDisplay(videoToPlay, timeDisplay);
    updateMetadata(videoId);
    loadMetadataTrack(videoToPlay);
    if (videoId !== 'iamclancy') {
      loadQuestionsTrack(videoToPlay);
    }
    videoToPlay.style.display = 'block'; // Muestra el video.

    // Muestra el contenedor de metadatos.
    var metadataContainer = document.querySelector('.video-metadata');
    metadataContainer.style.display = 'block';

    //desplaza la página hasta el video.
    videoToPlay.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    videoToPlay.play();
  }
}

// Función para restaurar los valores por defecto del vídeo pasado por parámetro
function resetVideoSettings(video) {
  const defaultVolume = 1;
  const volumeControl = document.getElementById('volumeControl');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const muteBtn = document.getElementById('muteBtn');
  const progressBar = document.getElementById('progressBar');
  const timeDisplay = document.getElementById('timeDisplay');
  const settingsMenu = document.getElementById('settingsMenu');
  const qualitySelect = document.getElementById('qualitySelect');
  //caso de que se pulse otro vídeo mientras se muestra una pregunta
  if (document.getElementById('questionContainer').style.display === 'inline-block') {
    // Oculta el contenedor de la pregunta
    questionContainer.style.display = 'none';

    // Reactiva los controles del video
    document.getElementById('video-container').classList.remove('no-interaction');
  }

  qualitySelect.style.display = 'none';

  qualitySelect.value = 1080;
  const videoId = video.id;

  const newSrc = `videos/${videoId}.mp4`;

  video.src = newSrc;

  settingsMenu.style.display = 'none';

  document.getElementById('metadataText').textContent = '';

  timeDisplay.textContent = '';
  progressBar.value = 0;
  muteBtn.firstChild.src = 'images/mute.png';
  playPauseBtn.firstChild.src = 'images/pause.png';
  volumeControl.value = defaultVolume;

  const speedControl = document.getElementById('speedControl');
  speedControl.value = '1';
  speedControl.style.display = 'none';

  const subtitlesSelect = document.getElementById('subtitlesSelect');
  subtitlesSelect.value = 'none';
  subtitlesSelect.style.display = 'none';


  if (video) {
    video.volume = defaultVolume;
    video.playbackRate = 1;
    Array.from(video.textTracks).forEach((track) => {
      if (track.kind === 'captions') {
        track.mode = 'disabled';
      }
    });
  }
}

// Función para actualizar la barra de progreso del video actualmente activo
function updateProgressBar(video, progressBar) {
  // Verifica si el video y la progressBar existen
  if (video && progressBar) {
    video.addEventListener('timeupdate', () => {
      const percentage = (video.currentTime / video.duration) * 100;
      progressBar.style.background = `linear-gradient(to right, red ${percentage}%, white ${percentage}%, white 100%)`;
      progressBar.value = percentage;
    });

    progressBar.addEventListener('click', (e) => {
      // Calcula el nuevo tiempo del video basado en la posición del clic
      const newTime = e.offsetX / progressBar.offsetWidth * video.duration;
      video.currentTime = newTime;
    });
  }
}

// Función para inicializar la barra de progreso cuando se selecciona un nuevo video
function initializeProgressBarForVideo(videoId) {
  const video = document.getElementById(videoId);
  const progressBar = document.getElementById('progressBar');
  updateProgressBar(video, progressBar);
}

// Variable global para mantener el event listener actual de timeupdate
var currentTimeUpdateListener = null;

// Actualización de la función updateTimeDisplay para incluir una verificación
function updateTimeDisplay(video, display) {
  const formatTime = (seconds) => {
    const format = val => `0${Math.floor(val)}`.slice(-2);
    const hours = seconds / 3600;
    const minutes = (seconds % 3600) / 60;

    return [hours, minutes, seconds % 60].map(format).join(':').replace(/^00:/, '');
  };

  // Se quita el event listener anterior para no tener duplicados
  if (currentTimeUpdateListener) {
    video.removeEventListener('timeupdate', currentTimeUpdateListener);
  }

  currentTimeUpdateListener = (event) => {
    // Verifica si el video que desencadena el evento es el actualmente visible
    if (video.style.display !== 'none') {
      const currentTime = formatTime(video.currentTime);
      const duration = formatTime(video.duration);
      display.textContent = `${currentTime} / ${duration}`;
    }
  };

  // Añade el event listener al video actual
  video.addEventListener('timeupdate', currentTimeUpdateListener);
}

// Función para actualizar la info básica del vídeo
function updateMetadata(videoId) {
  const vidtitle = document.getElementById("vidtitle");
  const vidalbum = document.getElementById("vidalbum");

  if (videoId === "iamclancy") {
    vidtitle.textContent = "I am Clancy (2024)";
    vidalbum.textContent = "Narrado por Tyler Joseph (Clancy)";
  }
  else if (videoId === "heavydirtysoul") {
    vidtitle.textContent = "Heavydirtysoul (2015)";
    vidalbum.textContent = "Album: Blurryface (Track 1)";
  }
  else if (videoId === "jumpsuit") {
    vidtitle.textContent = "Jumpsuit (2018)";
    vidalbum.textContent = "Album: Trench (Track 1)";
  }
  else if (videoId === "natn") {
    vidtitle.textContent = "Nico and the Niners (2018)";
    vidalbum.textContent = "Album: Trench (Track 9)";
  }
  else if (videoId === "levitate") {
    vidtitle.textContent = "Levitate (2018)";
    vidalbum.textContent = "Album: Trench (Track 2)";
  }
  else if (videoId === "shyaway") {
    vidtitle.textContent = "Shy Away (2021)";
    vidalbum.textContent = "Album: Scaled and Icy (Track 3)";
  }
  else if (videoId === "saturday") {
    vidtitle.textContent = "Saturday (2021)";
    vidalbum.textContent = "Album: Scaled and Icy (Track 5)";
  }
  else if (videoId === "theoutside") {
    vidtitle.textContent = "The Outside (2021)";
    vidalbum.textContent = "Album: Scaled and Icy (Track 4)";
  }
}

// Función que desactiva las pistas de metadatos del vídeo
function disableMetadataTracks(videoElement) {
  const tracks = videoElement.textTracks;
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].kind === 'metadata') {
      tracks[i].mode = 'disabled';
      tracks[i].oncuechange = null;
    }
  }
}

// Función que carga y escucha los cambios de las pistas de metadatos
function loadMetadataTrack(videoElement) {
  const tracks = videoElement.textTracks;
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].kind === 'metadata') {
      tracks[i].mode = 'hidden';
      tracks[i].oncuechange = function (e) {
        const track = e.target;
        const activeCue = track.activeCues[0];
        if (activeCue) {
          document.getElementById('metadataText').innerHTML = activeCue.text;
        }
      };
    }
  }
}

// Función para cargar el track de preguntas del vídeo
function loadQuestionsTrack(video) {
  let questionsTrack = Array.from(video.textTracks).find(track => track.kind === 'metadata' && track.label === 'questions');
  if (questionsTrack) {
    questionsTrack.mode = 'hidden';
    questionsTrack.oncuechange = function (e) {
      const track = e.target;
      const activeCue = track.activeCues[0];
      if (activeCue) {
        let questionObj = JSON.parse(activeCue.text);
        // Usamos el texto de la pregunta como clave
        if (!answeredQuestions[questionObj.question]) {
          video.pause();
          displayQuestion(questionObj);
        }
      }
    };
  }
}

// Función para mostrar las preguntas a partir del .vtt de preguntas
function displayQuestion(question) {
  const optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = ''; // Limpia las opciones anteriores

  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.innerText = option;
    button.classList.add('question-option');
    // pasamos la pregunta entera y el índice seleccionado a handleAnswer
    button.onclick = function () {
      handleAnswer(index, question.correct, question);
    };
    optionsContainer.appendChild(button);
  });

  // Muestra el contenedor de la pregunta
  const questionContainer = document.getElementById('questionContainer');
  const questionText = document.getElementById('questionText');
  questionText.innerText = question.question;
  questionContainer.style.display = 'inline-block';

  // Desactiva los controles del video cuando la pregunta está presente
  document.getElementById('video-container').classList.add('no-interaction');
}

function handleAnswer(selectedIndex, correctIndex, question) {
  const questionContainer = document.getElementById('questionContainer');

  if (selectedIndex === correctIndex) {
    alert('¡Correcto!');
    handleScore(true);
  } else {
    alert('Incorrecto. La respuesta correcta era: ' + question.options[correctIndex]);
    handleScore(false);
  }

  //Marca la pregunta como respondida
  answeredQuestions[question.question] = true;

  // Oculta el contenedor de la pregunta
  questionContainer.style.display = 'none';

  // Reactiva los controles del video
  document.getElementById('video-container').classList.remove('no-interaction');

  // Continúa la reproducción del video
  video.play();
}

function handleScore(correct) {
  if (correct) {
    userScore++;
    answered++;
    document.getElementById('userScore').textContent = `${userScore} / ${totalQuestionsGlobal}`;
  }
  else {
    answered++;
  }
  if (answered === totalQuestionsGlobal) {
    var userScorePercentage = (userScore / totalQuestionsGlobal) * 100;
    if (userScorePercentage === 100) {
      document.getElementById('check').textContent = "¡Enhorabuena! Eres un fan loco de Twenty One Pilots";
    } else if (userScorePercentage > 75) {
      document.getElementById('check').textContent = "¡Muy bien hecho! Realmente conoces bien a Twenty One Pilots";
    } else if (userScorePercentage > 50) {
      document.getElementById('check').textContent = "No está mal, pero quizás quieras conocer más sobre Twenty One Pilots";
    } else if (userScorePercentage > 25) {
      document.getElementById('check').textContent = "Podrías mejorar. ¿Por qué no intentas escuchar más de su música?";
    } else {
      document.getElementById('check').textContent = "Parece que necesitas pasar más tiempo con la música de Twenty One Pilots";
    }
    document.getElementById('scoreDisplay').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
  else {
    document.getElementById('check').textContent = `Respondidas= ${answered}, Sin responder= ${totalQuestionsGlobal - answered}`
  }
}

// Función para contar el número de preguntas de los VTT
function countQuestionsInVTT(vttPath) {
  return fetch(vttPath)
    .then(response => response.text())
    .then(text => {
      const lines = text.split("\n");
      const questionLines = lines.filter(line => line.includes('question'));
      return questionLines.length;
    });
}

// Función que devuelve el número de preguntas de todos los vtts que se pasan por parámetro
function countAllQuestions(vttPaths) {
  const countsPromises = vttPaths.map(path => countQuestionsInVTT(path));
  return Promise.all(countsPromises).then(counts => counts.reduce((acc, count) => acc + count, 0));
}