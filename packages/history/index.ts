export enum Action {
  Pop = 'POP',
  Push = 'PUSH',
  Replace = 'REPLACE',
}

export type State = object | null;
export type Pathname = string;
export type Search = string;
export type Hash = string;

export interface Path {
  pathname: Pathname;
  search: Search;
  hash: Hash;
}

export type PartialPath = Partial<Path>;

export type To = string | PartialPath;

export interface Location<S extends State = State> extends Path {
  state: S;
  key: string;
}

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

export interface HistoryState {
  idx: number;
  usr: State;
  key: string;
}

interface EventListener<L> {
  readonly length: number;
  add(listener: L): () => void;
  call(args?: any): void;
}

export interface History<S extends State = State> {
  readonly action: Action;
  readonly location: Location<S>;
  createHref(to: To): string;
  go(delta: number): void;
  goForward(): void;
  goBack(): void;
  push(to: To, state?: S): void;
  replace(to: To, state?: S): void;
  listen(listener: Listener<S>): () => void;
  block(blocker: Blocker<S>): () => void;
}

export interface BrowserHistory<S extends State = State> extends History<S> {
}

export function createBrowserHistory(option: { window?: Window } = {}): BrowserHistory {
  const popStateEventName = 'popstate';
  const { window = document.defaultView! } = option;
  const globalHistory = window.history;

  let action = Action.Pop;
  let [index, location] = getIndexAndLocation();

  const listeners = createEventListener<Listener>();
  const blockers = createEventListener<Blocker>();
  let blockedTx: Transition | null;

  function getIndexAndLocation(): [number, Location] {
    const { pathname, search, hash } = window.location;
    const state = globalHistory.state || {};

    return [
      state.idx,
      {
        pathname,
        hash,
        search,
        state: state.state || null,
        key: state.key || 'default',
      }
    ]
  }

  function handlePopStateEvent() {
    if (blockedTx) {
      blockers.call(blockedTx);
      blockedTx = null;
    } else {
      const nextAction = Action.Pop;
      const [nextIndex, nextLocation] = getIndexAndLocation();

      if (blockers.length) {
        if (nextIndex != null) {
          const delta = index - nextIndex;

          if (delta) {
            blockedTx = {
              action: nextAction,
              location: nextLocation,
              retry() {
                go(delta * -1);
              }
            };

            go(delta);
          }
        } else {
          console.log('This entry is not been created by history...');
        }
      } else {
        applyTransition(nextAction);
      }
    }
  }

  window.addEventListener(popStateEventName, handlePopStateEvent);

  if (index == null) {
    index = 0;
    globalHistory.replaceState({ ...(globalHistory.state || {}), idx: index}, '');
  }

  function push(to: To, state: State) {
    const nextAction = Action.Push;
    const nextLocation = getNextLocation(to, state);
    function retry() {
      push(to, state);
    }

    if (allowTransition(nextAction, nextLocation, retry)) {
      const [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1);
      globalHistory.pushState(historyState, '', url);
      applyTransition(nextAction);
    }
  }

  function replace(to: To, state: State) {
    const nextAction = Action.Replace;
    const nextLocation = getNextLocation(to, state);
    function retry() {
      replace(to, state);
    }

    if (allowTransition(nextAction, nextLocation, retry)) {
      const [historyState, url] = getHistoryStateAndUrl(nextLocation, index);
      globalHistory.replaceState(historyState, '', url);
      applyTransition(Action.Replace);
    }
  }

  function getNextLocation(to: To, state: State = null): Location {
    return {
      ...location,
      ...(typeof to === 'string' ? parsePath(to) : to),
      state,
      key: createKey(),
    }
  }

  function getHistoryStateAndUrl(location: Location, index: number): [HistoryState, string] {
    return [
      {
        idx: index,
        key: location.key,
        usr: location.state
      },
      createHref(location),
    ]
  }

  function allowTransition(action: Action, location: Location, retry: () => void) {
    if (blockers.length <= 0) return true;
    blockers.call({ action, location, retry });
    return false;
  }

  function applyTransition(nextAction: Action) {
    action = nextAction;
    [index, location] = getIndexAndLocation();
    listeners.call({ action, location });
    // listeners.call(location);
  }

  function createHref(to: To): string {
    return typeof to === 'string' ? to : createPath(to);
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

  function listen(listener: Listener) {
    return listeners.add(listener);
  }

  function block(blocker: Blocker) {
    return blockers.add(blocker);
  }

  return {
    get action() {
      return action;
    },
    get location() {
      return location;
    },
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

function createPath(path: PartialPath): string {
  const { pathname = '/', hash = '', search = '' } = path;
  return `${pathname}${hash}${search}`;
}

function parsePath(path: string): Path {
  let pathname = '';
  let hash = '';
  let search = '';

  if (path) {
    const hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
      hash = path.substring(hashIndex);
      path = path.substring(0, hashIndex);
    }

    const searchIndex = path.indexOf('?');
    if (searchIndex >= 0) {
      search = path.substring(searchIndex);
      path = path.substring(0, searchIndex);
    }

    if (path) {
      pathname = path;
    }
  }

  return { pathname, hash, search };
}

function createEventListener<L extends Function>(): EventListener<L> {
  let listeners: L[] = [];

  function add(fn: L) {
    listeners.push(fn);

    return () => {
      listeners = listeners.filter(f => f !== fn);
    }
  }

  function call(args?: any) {
    listeners.forEach(fn => fn && fn(args));
  }

  return {
    get length() {
      return listeners.length;
    },
    add,
    call,
  }
}

function createKey() {
  return Math.random().toString(16).substring(2, 10);
}
