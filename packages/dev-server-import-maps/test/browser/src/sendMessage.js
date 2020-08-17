import { postData } from './postData.js';

export function sendMessage(message) {
  return postData('message', { message });
}
