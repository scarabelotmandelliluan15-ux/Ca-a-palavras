// Base de dados com palavras válidas de 5 letras em português (com acentos e sem)
const WORDS = [
  "AGTIR",
  "AMIGO",
  "BARCO",
  "CARRO",
  "DANCA",
  "FESTA",
  "LIVRO",
  "MUNDO",
  "NOITE",
  "PRAIA",
  "PEDRA",
  "PORTA",
  "RADIO",
  "SABIA",
  "TERRA",
  "UVAIS",
  "VENTO",
  "XICAR",
  "ZOMBA",
  "AGAPE",
  "AJuda",
  "ALUNO",
  "BANCO",
  "CAMPO",
  "DEDOS",
  "FERRO",
  "FOGO",
  "GATO",
  "HORA",
  "JANELA",
  "LEITE",
  "MESA",
  "NAVIO",
  "OLHO",
  "PEIXE",
  "QUEIJO",
  "RUA",
  "SAPATO",
  "TIGRE",
  "URSO",
  "VIDA",
  "XADREZ",
  "ZONAS",
  "BOLSO",
  "CHAVE",
  "DENTE",
  "ESCOLA",
  "FILHO",
  "GELO",
  "HIENA",
  "JANTA",
  "LAPIS",
  "MALA",
  "NAVAI",
  "PADRE",
  "QUEBR",
  "RODA",
  "SALTO",
  "TREM",
  "UNIDO",
  "VERDE",
  "ACIDS",
  "AGORA",
  "BAIXO",
  "CESTA",
  "DIREI",
  "FORTE",
  "GRUPO",
  "HOTEL",
  "IDADE",
  "JOGAR",
  "LIMPO",
  "MEDIR",
  "NADAR",
  "ORDEM",
  "PARAR",
  "QUASE",
  "RIRAM",
  "SAIR",
  "TOMAR",
  "USAR",
  "VALOR",
  "ZELAR",
  "ATIVO",
  "BAILE",
  "CIVIL",
  "DOCES",
  "ETAPA",
  "FALHA",
  "GERAL",
  "HEROI",
  "IDEIA",
  "JOVEM",
  "LOCAL",
  "MEDAL",
  "NORTE",
  "PAPEL",
  "QUOTA",
  "REGRA",
  "SERIE",
].map((w) => w.toUpperCase());

// Seleciona uma palavra secreta garantida do array
let secretWord = WORDS[Math.floor(Math.random() * WORDS.length)];

let currentGuess = "";
let currentRow = 0;
let isGameOver = false;
let gameMode = "daily"; // 'daily' ou 'practice'

// Elementos da UI
const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const messageContainer = document.getElementById("message-container");

// Inicialização do Tabuleiro (6 linhas x 5 colunas)
function initBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < 6; r++) {
    const row = document.createElement("div");
    row.classList.add("board-row");
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.setAttribute("id", `tile-${r}-${c}`);
      row.appendChild(tile);
    }
    boardEl.appendChild(row);
  }
}

// Inicialização do Teclado Virtual
const keysLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

function initKeyboard() {
  keyboardEl.innerHTML = "";
  keysLayout.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.classList.add("keyboard-row");
    row.forEach((key) => {
      const button = document.createElement("button");
      button.classList.add("key");
      if (key === "ENTER" || key === "BACK") button.classList.add("wide");
      button.textContent = key === "BACK" ? "⌫" : key;
      button.setAttribute("id", `key-${key}`);
      button.addEventListener("click", () => handleKeyPress(key));
      rowEl.appendChild(button);
    });
    keyboardEl.appendChild(rowEl);
  });
}

// Manipulador de Entrada (Teclado físico e virtual)
function handleKeyPress(key) {
  if (isGameOver) return;

  if (key === "ENTER") {
    submitGuess();
  } else if (key === "BACK" || key === "BACKSPACE") {
    if (currentGuess.length > 0) {
      currentGuess = currentGuess.slice(0, -1);
      updateBoard();
    }
  } else {
    if (currentGuess.length < 5 && /^[A-ZÀ-Ú]$/.test(key)) {
      currentGuess += key;
      updateBoard();
    }
  }
}

// Atualiza o estado visual das letras digitadas na linha atual
function updateBoard() {
  for (let c = 0; c < 5; c++) {
    const tile = document.getElementById(`tile-${currentRow}-${c}`);
    if (c < currentGuess.length) {
      tile.textContent = currentGuess[c];
      tile.classList.add("filled");
    } else {
      tile.textContent = "";
      tile.classList.remove("filled");
    }
  }
}

// Envio e validação da tentativa
function submitGuess() {
  if (currentGuess.length < 5) {
    showMessage("Palavra muito curta!");
    return;
  }

  // Cores das letras
  const letterCount = {};
  for (let char of secretWord) {
    letterCount[char] = (letterCount[char] || 0) + 1;
  }

  const rowResults = Array(5).fill("absent");

  // 1ª passada: Verificar letras corretas (Verde)
  for (let c = 0; c < 5; c++) {
    if (currentGuess[c] === secretWord[c]) {
      rowResults[c] = "correct";
      letterCount[currentGuess[c]]--;
    }
  }

  // 2ª passada: Verificar letras presentes na posição errada (Amarelo)
  for (let c = 0; c < 5; c++) {
    if (rowResults[c] !== "correct") {
      const char = currentGuess[c];
      if (letterCount[char] && letterCount[char] > 0) {
        rowResults[c] = "present";
        letterCount[char]--;
      }
    }
  }

  // Aplicar cores no tabuleiro e atualizar o teclado
  for (let c = 0; c < 5; c++) {
    const tile = document.getElementById(`tile-${currentRow}-${c}`);
    const status = rowResults[c];
    tile.classList.add(status);

    // Atualizar cor da tecla
    const keyEl = document.getElementById(`key-${currentGuess[c]}`);
    if (keyEl) {
      if (status === "correct") {
        keyEl.className = "key correct";
      } else if (status === "present" && !keyEl.classList.contains("correct")) {
        keyEl.className = "key present";
      } else if (
        status === "absent" &&
        !keyEl.classList.contains("correct") &&
        !keyEl.classList.contains("present")
      ) {
        keyEl.className = "key absent";
      }
    }
  }

  // Condição de Vitória
  if (currentGuess === secretWord) {
    showMessage("Parabéns! Você acertou! 🎉", 4000);
    isGameOver = true;
    updateStats(true);
    showStatsModalAfterDelay();
    return;
  }

  // Avançar de linha ou Derrota
  currentRow++;
  currentGuess = "";

  if (currentRow === 6) {
    showMessage(`Fim de jogo! A palavra era: ${secretWord}`, 5000);
    isGameOver = true;
    updateStats(false);
    showStatsModalAfterDelay();
  }
}

// Exibir mensagem temporária na tela
function showMessage(text, duration = 2000) {
  messageContainer.textContent = text;
  messageContainer.classList.add("show");
  setTimeout(() => {
    messageContainer.classList.remove("show");
  }, duration);
}

// Ouvinte de teclado físico do PC
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleKeyPress("ENTER");
  else if (e.key === "Backspace") handleKeyPress("BACK");
  else {
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) handleKeyPress(letter);
  }
});

// Sistema de Estatísticas & LocalStorage
function getStats() {
  const stats = localStorage.getItem("palavreado_stats");
  return stats
    ? JSON.parse(stats)
    : { played: 0, wins: 0, currentStreak: 0, maxStreak: 0 };
}

function updateStats(won) {
  let stats = getStats();
  stats.played++;
  if (won) {
    stats.wins++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }
  localStorage.setItem("palavreado_stats", JSON.stringify(stats));
}

function renderStatsModal() {
  const stats = getStats();
  document.getElementById("stat-played").textContent = stats.played;
  document.getElementById("stat-win").textContent =
    stats.played > 0
      ? Math.round((stats.wins / stats.played) * 100) + "%"
      : "0%";
  document.getElementById("stat-streak").textContent = stats.currentStreak;
  document.getElementById("stat-max-streak").textContent = stats.maxStreak;

  if (isGameOver) {
    document.getElementById("share-section").style.display = "block";
  }
}

function showStatsModalAfterDelay() {
  setTimeout(() => {
    renderStatsModal();
    document.getElementById("stats-modal").style.display = "flex";
  }, 1500);
}

// Modais e Botões de Controle
const helpModal = document.getElementById("help-modal");
const statsModal = document.getElementById("stats-modal");

document.getElementById("help-btn").onclick = () =>
  (helpModal.style.display = "flex");
document.getElementById("close-help").onclick = () =>
  (helpModal.style.display = "none");
document.getElementById("stats-btn").onclick = () => {
  renderStatsModal();
  document.getElementById("share-section").style.display = "none";
  statsModal.style.display = "flex";
};
document.getElementById("close-stats").onclick = () =>
  (statsModal.style.display = "none");

// Alternador de Modo de Jogo
document.getElementById("mode-daily").onclick = (e) => {
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  gameMode = "daily";
  resetGame();
};

document.getElementById("mode-practice").onclick = (e) => {
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  gameMode = "practice";
  resetGame();
};

function resetGame() {
  secretWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentGuess = "";
  currentRow = 0;
  isGameOver = false;
  initBoard();
  initKeyboard();
}

// Alternador de Tema (Claro/Escuro)
const themeBtn = document.getElementById("theme-btn");
themeBtn.onclick = () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  themeBtn.textContent = document.body.classList.contains("dark-mode")
    ? "☀️"
    : "🌙";
};

// Inicializar Jogo ao carregar a página
initBoard();
initKeyboard();
