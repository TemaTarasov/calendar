import React, { PureComponent } from 'react';
import './styles.scss';

import Mixin from './Mixin';
import { get } from '../../helpers';

import { Month } from './Month';

export class Calendar extends Mixin(PureComponent) {
  constructor(props) {
    super(props);

    this.state = {
      current: this._date(),
      view: this._date(props.date),
      mode: get(props, 'mode', 'month')
    };
  }

  render() {
    const {
      onRender = function () {}
    } = this.props;
    const { current, view, mode } = this.state;

    if (mode === 'month') {
      return (
        <Month current={current}
               view={view}
               onRender={onRender}
        />
      );
    }

    return null;
  }
}
