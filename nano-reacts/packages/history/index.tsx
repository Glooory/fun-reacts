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

type HistoryState = {
  state: State;
  key?: string;
  index: number;
}

const popStateEvent = 'popstate';

export function createPath({
  pathname = '/',
  search = '',
  hash = '',
}: PartialPath): string {
  return `${pathname}${search}${hash}`;
}

interface EventListeners<EventListener> {
  length: number
  call(args: any): void;
  add(listener: EventListener): () => void;
}

function createEventListeners<EventListener extends Function>(): EventListeners<EventListener> {
  let listeners: EventListener[] = [];

  function call(args: any): void {
    listeners.forEach(fn => fn && fn(args));
  }

  function add(listener: EventListener): () => void {
    listeners.push(listener);
    return function () {
      remove(listener);
    }
  }

  function remove(listener: EventListener): void {
    listeners = listeners.filter(fn => fn !== listener);
  }

  return {
    get length() {
      return listeners.length;
    },
    call,
    add,
  }
}

export function createBrowserHistory(options: { window?: Window } = {}): BrowserHistory {
  let { window = document.defaultView! } = options;
  let globalHistory: History = window.history;

  let index: number;
  let action = Action.Pop;
  let location: Location;

  const blockers: EventListeners<Blocker> = createEventListeners<Blocker>();
  const listeners: EventListeners<Listener> = createEventListeners<Listener>();

  function getIndexAndLocation(): [number, Location] {
    const { pathname, search, hash } = window.location;
    let state = globalHistory.state || {};

    return [
      state.index,
      {
        pathname,
        search,
        hash,
        state: state.state || null,
        key: state.key || 'default',
      }
    ]
  }

  let blockedPopTx: Transition | null = null;
  function handlePopStateEvent() {
    if (blockedPopTx) {
      blockers.call(blockedPopTx);
      blockedPopTx = null;
    } else {
      // TODO
      const [currIndex, currLocation] = getIndexAndLocation();
      const entryStepPopped = index - currIndex;
      if (checkIsTransitionAllowed()) {
        const update: Update = {
          location: currLocation,
          action: Action.Pop,
        }
        index = currIndex;
        listeners.call(update);
      } else {
        go(entryStepPopped);
        const [reversedIndex, reversedLocation] = getIndexAndLocation();
        blockedPopTx = {
          action: Action.Pop,
          location: reversedLocation,
          retry() {
            go(-entryStepPopped);
          }
        }
      }
    }
  }

  window.addEventListener(popStateEvent, handlePopStateEvent);

  function checkIsTransitionAllowed() {
    return blockers.length <= 0;
  }

  function go(delta: number) {
    globalHistory.go(delta);
  }

  function forward() {
    globalHistory.forward();
  }

  function back() {
    globalHistory.back();
  }

  function createHref(to: To) {
    if (typeof to === 'string') {
      return to;
    }

    return createPath(to);
  }

  return {
    action,
    location,
    createHref,
    go,
    forward,
    back,
  }
}
