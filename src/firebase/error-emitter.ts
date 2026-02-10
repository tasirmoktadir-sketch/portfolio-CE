import { EventEmitter } from 'events';

// This is a simple event emitter that can be used to broadcast errors
// from anywhere in the app. This is especially useful for handling
// errors in a centralized way.
export const errorEmitter = new EventEmitter();
