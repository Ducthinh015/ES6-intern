// B8: Zustand Store Pattern & Persistence Simulator

class SimpleZustandStore {
  constructor(initialState) {
    this.state = initialState;
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(partialOrFn) {
    const nextState = typeof partialOrFn === 'function' ? partialOrFn(this.state) : partialOrFn;
    this.state = { ...this.state, ...nextState };
    this.listeners.forEach(listener => listener(this.state));
    console.log('[Zustand Store Updated]:', this.state);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// Instantiate Global User Store
export const userZustandStore = new SimpleZustandStore({
  user: { name: 'Intern Dev', role: 'STUDENT' },
  theme: 'dark',
  cart: []
});

export function addToCartAction(product) {
  userZustandStore.setState(state => ({
    cart: [...state.cart, product]
  }));
}

export function toggleThemeAction() {
  userZustandStore.setState(state => ({
    theme: state.theme === 'dark' ? 'light' : 'dark'
  }));
}
