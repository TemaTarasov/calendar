import * as moment from 'moment';

export function isEmpty(value) {
  return value === null ||
    value === undefined ||
    value === '' ||
    (isArray(value) && !value.length) ||
    (isObject(value) && !Object.keys(value).length)
}

export function isObject(object) {
  return object && !isArray(object) && typeof object === 'object'
}

export function isArray(array) {
  return array && typeof array === 'object' && Array.isArray(array);
}

export function get(source, path, defaultValue) {
  if (typeof path !== 'string') {
    path = String(path);
  }

  if (path && source) {
    const parts = path.split('.');
    const length = parts.length;
    let result = source;

    for (let i = 0; i < length; i++) {
      const item = result[parts[i]];

      if (item === null || item === undefined) {
        return item || defaultValue;
      }

      result = item;
    }

    return result || defaultValue;
  }

  return defaultValue;
}

export function set(source, path, value) {
  if (typeof path !== 'string') {
    path = String(path);
  }

  if (source && path) {
    const parts = path.split('.');
    const length = parts.length - 1;
    let target = source;

    for (let i = 0; i < length; i++) {
      const part = parts[i];

      if (target[part] === undefined || target[part] === null) {
        target[part] = Number.isNaN(Number(parts[i + 1])) ? {} : [];
      }

      target = target[part];
    }

    target[parts[parts.length - 1]] = value;
  }

  return source;
}

export function bind(context, methonds) {
  if (context && !isEmpty(methonds)) {
    methonds.forEach(function (method) {
      context[method] = context[method].bind(context);
    });
  }
}

export function trim(value, force) {
  if (value && typeof value === 'string') {
    return value.trim().replace(/ +/g, Boolean(force) ? '' : ' ');
  }

  return value;
}

export function _moment({ year, month, date }) {
  return moment(`${+month + 1} ${date} ${year}`);
}

export function debounce() {
  let timeout;

  return function (callback, time = 0) {
    clearTimeout(timeout);

    timeout = setTimeout(callback, time);
  }
}

export function scrollToY(target, scrollTargetY, finish = function () {}) {
  let currentTime = 0;
  const timeout = debounce();
  const scrollY = target.scrollTop;
  const speed = 1000;
  const ease = pos => Math.sin(pos * (Math.PI / 2));

  const time = Math.max(.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, .8));

  (function tick() {
    currentTime += 1 / 60;

    const p = currentTime / time;
    const t = ease(p);

    if (p < 1) {
      window.requestAnimationFrame(tick.bind(this));

      target.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t));
    } else {
      target.scrollTo(0, scrollTargetY);

      timeout(finish);
    }
  })();
}

export function getBlock(condition, Component) {
  if (condition) {
    if (typeof Component === 'function') {
      return Component();
    }

    return Component;
  }

  return null;
}
