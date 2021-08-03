export enum Action {
  Pop = 'POP',
  Push = 'PUSH',
  Replace = 'REPLACE',
}

export type Pathname = string;
export type Search = string;
export type Hash = string;
export type State = object | null;
export type Key = string;

export interface Path {
  pathname: Pathname;
  search: Search;
  hash: Hash;
}

export interface PartialPath extends Partial<Path> {}

export interface Location<S extends State = State> extends Path {
  state: S;
  key: Key;
}

export interface PartialLocation<S extends State = State> extends Partial<Location<S>> {}

export interface Update<S extends State = State> {
  action: Action;
  location: Location<S>;
}

export interface Listener<S extends State = State> {
  (update: Update<S>): void;
}

export interface Transition<S extends State = State> extends Update<S> {
  retry(): void;
}

export interface Blocker<S extends State = State> {
  (tx: Transition<S>): void;
}

export type To = string | PartialPath;

export interface BrowserHistory<S extends State = State> {
  readonly action: Action;
  readonly location: Location;
  createHref(to: To): string;
  push(to: To, state?: S): void;
  replace(to: To, state?: S): void;
  go(delta: number): void;
  forward(): void;
  back(): void;
  listen(listener: Listener): () => void;
  block(blocker: Blocker): () => void;
}
