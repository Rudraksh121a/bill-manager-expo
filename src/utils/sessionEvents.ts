// Simple event emitter for session changes
type SessionChangeListener = () => void;

class SessionEventEmitter {
  private listeners: SessionChangeListener[] = [];
  private debounceTimeout: NodeJS.Timeout | null = null;

  subscribe(listener: SessionChangeListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit(): void {
    // Debounce events to prevent rapid-fire updates
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.debounceTimeout = setTimeout(() => {
      this.listeners.forEach(listener => {
        try {
          listener();
        } catch (error) {
        }
      });
      this.debounceTimeout = null;
    }, 100); // 100ms debounce
  }
}

export const sessionEvents = new SessionEventEmitter();
