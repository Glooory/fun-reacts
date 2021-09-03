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
  readonly length: number;
  readonly action: Action;
  readonly location: Location;
  createHref(to: To): string;
  push(to: To, state?: S): void;
  replace(to: To, state?: S): void;
  go(delta: number): void;
  goForward(): void;
  goBack(): void;
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

export function parsePath(path: string): PartialPath {
  let pathname = '';
  let search = '';
  let hash = '';

  if (path.indexOf('?') !== -1 && path.indexOf('#') !== -1) {
    const searchIndex = path.indexOf('?');
    const hashIndex = path.indexOf('#');
    if (searchIndex < hashIndex) {
      pathname = path.substring(0, searchIndex);
      search = path.substring(searchIndex, hashIndex);
      hash = path.substring(hashIndex, path.length - 1);
    } else {
      pathname = path.substring(0, hashIndex);
      search = path.substring(searchIndex, path.length - 1);
      hash = path.substring(hashIndex, searchIndex);
    }

    return { pathname, search, hash };
  }

  if (path.indexOf('?') !== -1) {
    [pathname, search] = path.split('?');

    return {
      pathname,
      search: `?${search}`,
      hash,
    }
  }

  if (path.indexOf('#') !== -1) {
    [pathname, hash] = path.split('#');

    return {
      pathname,
      search,
      hash: `#${hash}`,
    }
  }

  return { pathname: path, search, hash };
}

function getPathAndUrlFromTo(to: To): [PartialPath, string] {
  let path: PartialPath;
  let url: string;
  if (typeof to === 'string') {
    path = parsePath(to);
    url = to;
  } else {
    path = to;
    url = createPath(to);
  }
  return [path, url];
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

  let action = Action.Pop;
  let [index, location] = getIndexAndLocation();

  const blockers: EventListeners<Blocker> = createEventListeners<Blocker>();
  const listeners: EventListeners<Listener<Location>> = createEventListeners<Listener<Location>>();

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
      const [currIndex, currLocation] = getIndexAndLocation();
      if (currLocation.key) {
        const entryStepPopped = index - currIndex;
        if (allowTransition()) {
          index = currIndex;
          location = currLocation;
          action = Action.Pop;
          listeners.call(location);
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
      } else {
        console.log('history entry is not created by history library...');
      }
    }
  }

  window.addEventListener(popStateEvent, handlePopStateEvent);

  if (typeof index === 'undefined') {
    const { pathname, search, hash } = window.location;
    index = 0;
    replace({ pathname, search, hash }, globalHistory.state);
  }

  function generateKey(): string {
    return Math.random().toString(32).replace('0.', '');
  }

  function getNextIndexAndLocation(path: PartialPath, state: State, index: number): [number, Location] {
    const { pathname = '/', search = '', hash = '' } = path;
    return [
      index,
      {
        pathname,
        search,
        hash,
        key: generateKey(),
        state: state,
      }
    ]
  }

  function push(to: To, state: State) {
    const [toPath, toUrl] = getPathAndUrlFromTo(to);
    const [nextIndex, location] = getNextIndexAndLocation(toPath, state, index + 1);

    if (allowTransition()) {
      const update: Update = {
        action: Action.Push,
        location,
      }

      applyTransition(update, nextIndex);
    } {
      const blockedTx: Transition = {
        action: Action.Push,
        location,
        retry() {
          push(to, state);
        }
      }
      blockers.call(blockedTx);
    }
  }

  function replace(to: To, state: State) {
    const [toPath, toUrl] = getPathAndUrlFromTo(to);
    const [nextIndex, location] = getNextIndexAndLocation(toPath, state, index + 1);
    if (allowTransition()) {
      const update: Update = {
        action: Action.Replace,
        location,
      }

      applyTransition(update, index, true);
    } {
      const blockedTx: Transition = {
        action: Action.Replace,
        location,
        retry() {
          push(to, state);
        }
      }
      blockers.call(blockedTx);
    }
  }

  function allowTransition() {
    return blockers.length <= 0;
  }

  function applyTransition(update: Update, nextIndex: number, isReplace = false) {
    const url = createPath(update.location);
    const historyState: HistoryState = {
      index: nextIndex,
      key: update.location.key,
      state: update.location.state,
    }

    if (isReplace) {
      globalHistory.replaceState(historyState, '', url);
    } else {
      globalHistory.pushState(historyState, '', url);
    }

    index = nextIndex;
    location = update.location;
    action = update.action;

    listeners.call(location);
  }

  function go(delta: number) {
    globalHistory.go(delta);
  }

  function goForward() {
    globalHistory.forward();
  }

  function goBack() {
    globalHistory.back();
  }

  function createHref(to: To) {
    if (typeof to === 'string') {
      return to;
    }

    return createPath(to);
  }

  function listen(listener: Listener) {
    return listeners.add(listener);
  }

  function block(blocker: Blocker) {
    return blockers.add(blocker);
  }

  return {
    get length() {
      return globalHistory.length;
    },
    action,
    location,
    createHref,
    go,
    goForward,
    goBack,
    push,
    replace,
    listen,
    block,
  }
}
