import React, { PureComponent } from 'react';
import './styles.scss';

import * as moment from 'moment';

import Mixin from '../../Mixin';
import { bind, getBlock, isEmpty, stringify, stopPropagation } from '../../../../helpers';

export class MonthRow extends Mixin(PureComponent) {
  constructor(props) {
    super(props);

    this.state = {
      month: {
        className: ''
      }
    };

    this.row = React.createRef();
    this.highlight = React.createRef();

    this.stash = {
      data: null,
      items: null
    };

    bind(this, [
      'handleScroll',
      'getHighlight'
    ]);
  }

  componentDidMount() {
    const { content } = this.content;

    content.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    const { content } = this.content;

    content.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    if (!this.start) {
      return false;
    }

    let month = {};

    const { height, scrollTop, offsetTop } = this.content;
    const items = [].slice
      .call(document.querySelectorAll('.calendar-month-row-item[data-start="true"]'))
      .map(item => item.parentElement);
    const offset = this.row.current.offsetTop - offsetTop;
    const next = items[items.indexOf(this.row.current) + 1];

    if (offset === scrollTop) {
      month = {
        className: 'calendar-month-row-highlight--fixed',
        style: {
          top: 0
        }
      };
    } else if (offset > scrollTop) {
      const value = (offset - scrollTop) * 1.35;

      const row = this.highlight.current.getBoundingClientRect().height;
      const target = +((height / 6) + offsetTop - (+(row / 2).toFixed() + 2)).toFixed();

      if (value < target) {
        month = {
          className: 'calendar-month-row-highlight--fixed',
          style: {
            top: `${value}px`
          }
        };
      }
    } else if (scrollTop > offset && scrollTop < next.offsetTop) {
      const __VALUE = (offsetTop * 2) - 20;
      const value = next.offsetTop - scrollTop;

      if (value <= __VALUE) {
        month = {
          className: 'calendar-month-row-highlight--fixed',
          style: {
            top: `${-__VALUE + value}px`
          }
        }
      } else {
        month = {
          className: 'calendar-month-row-highlight--fixed',
          style: {
            top: 0
          }
        };
      }
    }

    this.setState({ month });
  }

  isHighlight(item) {
    const { view } = this.props;

    return item.year === view.year &&
      item.month === view.month;
  }

  isMonthStart(item) {
    return item.date === 1;
  }

  getMonth({ month }) {
    return (
      <div className="calendar-month-row-item-month">
        {
          moment.monthsShort()[month]
        }
      </div>
    );
  }

  getHighlight() {
    const start = this.start;
    const { scrolling } = this.props;
    const { month: { className, style } } = this.state;

    return (
      <div ref={this.highlight} className={`calendar-month-row-highlight ${className}`} style={style} data-show={scrolling}>
        {moment.months()[start.month]}

        <span>{start.year}</span>
      </div>
    );
  }

  get isCurrentRow() {
    const { data, view } = this.props;

    return data.some(item => item.year === view.year && item.month === view.month && item.date === 1);
  }

  get start() {
    const { data } = this.props;

    return data.find(item => item.date === 1);
  }

  get data() {
    const _data = this.stash.data;
    const { items } = this.stash;

    if (!isEmpty(_data) && !isEmpty(items) && stringify(_data) === stringify(this.props.data)) {
      return items;
    }

    const {
      data,
      onRender = () => null
    } = this.props;

    const result = data.map((col, key) => (
      <div ref={this.month}
           className="calendar-month-row-item"
           key={key}
           data-start={this.isMonthStart(col)}
           data-highlight={this.isHighlight(col)}
      >
        <div className="calendar-month-row-item-date">
          {
            getBlock(
              this.isMonthStart(col),
              this.getMonth.bind(this, col)
            )
          }

          {col.date}
        </div>

        <div className="calendar-month-row-item-content" onScroll={stopPropagation}>
          {onRender(col)}
        </div>
      </div>
    ));

    this.stash = {
      data: this.props.data,
      items: result
    };

    return result;
  }

  render() {
    const start = this.start;

    return (
      <div ref={this.row} className="calendar-month-row" data-current={this.isCurrentRow}>
        {getBlock(!isEmpty(start), this.getHighlight)}

        {this.data}
      </div>
    );
  }
}
