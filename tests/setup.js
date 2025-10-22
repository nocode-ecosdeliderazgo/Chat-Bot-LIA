// ===== JEST SETUP PARA CHAT-ONLINE =====
// Configuración global de mocks y setup para tests

// ===== MOCKS DE CONSOLE =====
// Silenciar console.log en tests para output más limpio
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// ===== MOCKS DE WINDOW OBJECTS =====
// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock de sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
})();
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// ===== MOCKS DE SUPABASE =====
// Mock de window.supabase
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    signIn: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null }))
  },
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(() => ({ unsubscribe: jest.fn() }))
    }))
  }))
};

// Asignar mock a window.supabase
Object.defineProperty(window, 'supabase', {
  value: mockSupabaseClient,
  writable: true
});

// Mock de window.waitForSupabase()
window.waitForSupabase = jest.fn(() => Promise.resolve(mockSupabaseClient));

// ===== MOCKS DE DOM APIs =====
// Mock de alert, confirm, prompt
window.alert = jest.fn();
window.confirm = jest.fn(() => true);
window.prompt = jest.fn(() => 'test');

// ===== MOCKS DE YOUTUBE API =====
// Mock básico de YouTube Player API
window.YT = {
  Player: jest.fn(() => ({
    playVideo: jest.fn(),
    pauseVideo: jest.fn(),
    stopVideo: jest.fn(),
    getCurrentTime: jest.fn(() => 0),
    getDuration: jest.fn(() => 100),
    getPlayerState: jest.fn(() => 1),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),
  PlayerState: {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5
  }
};

// ===== MOCKS DE FETCH =====
// Mock global de fetch para requests HTTP
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  })
);

// ===== MOCKS DE TIMERS =====
// Mock de setTimeout, setInterval para control de tiempo en tests
jest.useFakeTimers();

// ===== MOCKS DE RESIZE OBSERVER =====
// Mock de ResizeObserver para tests de responsive
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// ===== MOCKS DE INTERSECTION OBSERVER =====
// Mock de IntersectionObserver para tests de scroll
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// ===== CLEANUP DESPUÉS DE CADA TEST =====
afterEach(() => {
  // Limpiar todos los mocks después de cada test
  jest.clearAllMocks();
  
  // Limpiar localStorage y sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Limpiar DOM
  document.body.innerHTML = '';
  
  // Limpiar timers
  jest.clearAllTimers();
});

// ===== SETUP INICIAL =====
beforeAll(() => {
  // Configurar DOM básico para tests
  document.body.innerHTML = `
    <div id="app">
      <div id="chat-container"></div>
      <div id="video-container"></div>
      <div id="questionModal" style="display: none;"></div>
      <div id="answerModal" style="display: none;"></div>
      <div id="commentModal" style="display: none;"></div>
    </div>
  `;
});

console.log('✅ Jest setup configurado para Chat-Online');
