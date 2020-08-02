export function executeServerCommand<P, R>(command: string, payload?: P): Promise<R>;

export interface Viewport {
  width: number;
  height: number;
}

export function setViewport(viewport: Viewport): Promise<void>;
