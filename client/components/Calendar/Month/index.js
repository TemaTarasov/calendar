import React, { PureComponent } from 'react';
import './styles.scss';

import * as moment from 'moment';

import Scroll from 'react-custom-scroll';
import 'react-custom-scroll/dist/customScroll.css';

import { bind, debounce, scrollToY } from '../../../helpers';
import Mixin from '../Mixin';
import { MonthRow } from './MonthRow';

export class Month extends Mixin(PureComponent) {
  constructor(props) {
    super(props);

    this.ROWS = 6;
    this.COLS = 7;

    this.state = {
      current: props.current,
      view: props.view,
      scrolling: false
    };

    this.ready = false;
    this.busy = true;

    this.start = React.createRef();

    this.debounce = debounce();
    this.scrolling = debounce();
    this.busyBound = debounce();

    bind(this, [
      'handleScroll',
      'handleScrollFunction',
      'handleView',
      'scrollToCenter'
    ]);
  }

  componentDidMount() {
    this.scrollToCenter();

    setTimeout(() => {
      this.ready = true;
    });
  }

  get current() {
    return document.querySelector('.calendar-month-row[data-current="true"]');
  }

  get last() {
    const { offsetTop } = this.content;
    const current = this.current;
    const items = [].slice
      .call(document.querySelectorAll('.calendar-month-row-item[data-start="true"]'))
      .map(item => item.parentElement);
    const target = items[items.indexOf(current) + 1];

    return target.offsetTop - offsetTop;
  }

  scrollToCenter() {
    const { content, offsetTop } = this.content;

    if (content) {
      const current = this.current;

      if (current) {
        const value = current.offsetTop - offsetTop;

        content.scrollTo(0, value);
        this.clearBusy();
      }
    }
  }

  handleView(state, type) {
    if (['increment', 'decrement'].includes(type)) {
      const { view: { year, month } } = state;
      const amount = type === 'increment' ? -1 : 1;

      this.setState({
        view: this._date(moment(`${year} ${+month + 1}`, 'YYYY M').subtract(amount, 'month'))
      }, () => {
        this.forceUpdate();

        this.scrollToCenter();
      });
    }
  }

  handleScroll() {
    this.setState({
      scrolling: true
    }, () => {
      if (!this.busy) {
        this.debounce(this.handleScrollFunction, 300);
      }

      this.scrolling(() => {
        this.setState({
          scrolling: false
        });
      }, 150);
    });
  }

  handleScrollFunction() {
    this.busy = true;

    const { content, height, scrollTop } = this.content;
    const item = height / this.ROWS;
    const half = item / 2;

    const position = scrollTop;
    const diff = position % item;

    let result;

    if (diff < half) {
      result = position - diff;
    } else {
      result = position + (item - diff);
    }

    scrollToY(content, result, () => {
      const { scrollTop } = this.content;
      const last = this.last;

      if (scrollTop === 0 || scrollTop === last || scrollTop > last) {
        this.handleView(this.state, scrollTop === 0 ? 'decrement' : 'increment');
      } else {
        this.clearBusy();
      }
    });
  }

  clearBusy() {
    this.busyBound(() => {
      this.busy = false;
    }, 150);
  }

  _generate(year, month, days) {
    const result = [];

    for (let i = 1; i <= days; i++) {
      result.push({
        year,
        month,
        date: i
      });
    }

    return result;
  }

  /**
   * @param  {number} months
   * @param  {string} type
   * @return {array}
   */
  generate(data, months, type) {
    let result = [];

    if (type === 'decrement') {
      const prev = moment(data).subtract(months, 'month');
      const prevDay = prev.day();

      if (prevDay > 0) {
        const _prev = moment(prev).subtract(1, 'month');
        const prevYear = _prev.year();
        const prevMonth = _prev.month();
        const prevDays = _prev.daysInMonth();

        for (let i = 1; i <= prevDay; i++) {
          result.push({
            year: prevYear,
            month: prevMonth,
            date: prevDays - (prevDay - i)
          });
        }
      }

      const _ = moment(data).subtract(months, 'month');
      const year = _.year();
      const month = _.month();
      const days = _.daysInMonth();

      result.push.apply(result, this._generate(year, month, days));

      return result;
    }

    if (type === 'increment') {
      const _ = moment(data).subtract(months * -1, 'month');
      const year = _.year();
      const month = _.month();
      const days = _.daysInMonth();
      const day = _.day();

      result.push.apply(result, this._generate(year, month, days));

      const length = new Array(day).fill().concat(result).length;
      const items = this.ROWS * this.COLS;

      if (length < items) {
        const next = moment(data).subtract((months + 1) * -1, 'month');
        const nextYear = next.year();
        const nextMonth = next.month();

        const state = items - result.length;
        for (let i = 1; i <= state; i++) {
          result.push({
            year: nextYear,
            month: nextMonth,
            date: i
          })
        }
      }

      return result;
    }

    return result;
  }

  get data() {
    const cols = this.COLS;

    const { year, month } = this.state.view;
    const current = moment(`${year} ${+month + 1}`);
    const result = [];

    const items = [];
    items.push.apply(items, this.generate(current, 1, 'decrement'));
    items.push.apply(items, this._generate(year, month, current.daysInMonth()));
    items.push.apply(items, this.generate(current, 1, 'increment'));

    const state = Math.floor(items.length / cols);
    for (let i = 0; i < state; i++) {
      result.push(items.slice(i * cols, cols * (i + 1)));
    }

    return result;
  }

  render() {
    const { current, view, scrolling } = this.state;

    return (
      <div className="calendar-month">
        <div className="calendar-month-display"/>

        <div className="calendar-month-days">
          {
            moment.weekdaysShort().map((item, key) => (
              <div className="calendar-month-days-item" key={key}>{item}</div>
            ))
          }
        </div>

        <Scroll allowOuterScroll={true}
                heightRelativeToParent="100%"
                flex="1"
                onScroll={this.handleScroll}
        >
          {
            this.data.map((item, key) => (
              <MonthRow data={item}
                        current={current}
                        view={view}
                        scrolling={this.ready ? scrolling : false}
                        key={key}
              />
            ))
          }
        </Scroll>
      </div>
    );
  }
}