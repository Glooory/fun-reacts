export const RESERVED_KEY = Object.freeze({
  key: true,
  ref: true,
})

let REACT_ELEMENT_TYPE = 'react.element';
if (typeof Symbol === 'function' && Symbol.for) {
  REACT_ELEMENT_TYPE = Symbol.for('react-element');
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

function ReactElement(type, key, props) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    props,
  }
}

export function createElement(type, config, ...children) {
  const props = {};

  let key = null;
  if (config && config.key !== undefined) {
    key = config.key;
  }

  for (let propName in config) {
    if (hasOwnProperty.call(config, propName) && !hasOwnProperty.call(RESERVED_KEY, propName)) {
      props[propName] = config[propName];
    }
  }

  if (children.length === 1) {
    props.children = children[0];
  } if (children.length > 1) {
    props.children = children;
  } else {
    props.children = null;
  }

  return ReactElement(type, key, props)
}



