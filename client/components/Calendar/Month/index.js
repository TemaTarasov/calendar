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

    this.settings = {
      range: 1
    };

    this.state = {
      current: props.current,
      view: props.current,
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
      const amount = (this.settings.range) * (type === 'increment' ? -1 : 1);

      this.setState({
        view: this._date(moment(`${year} ${+month + 1}`).subtract(amount, 'month'))
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
    return new Array(days)
      .fill()
      .map((_, key) => ({
        year,
        month,
        date: key + 1
      }))
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
        const prevYear = prev.year();
        const prevMonth = prev.month();
        const prevDays = prev.daysInMonth();

        result = result.concat(
          new Array(prevDay)
            .fill()
            .map((_, key) => ({
              year: prevYear,
              month: prevMonth,
              date: prevDays - (prevDay - (key + 1))
            }))
        );
      }

      for (let i = months; i >= 1; i--) {
        const _ = moment(data).subtract(i, 'month');
        const year = _.year();
        const month = _.month();
        const days = _.daysInMonth();

        result = result.concat(this._generate(year, month, days));
      }

      return result;
    }

    if (type === 'increment') {
      for (let i = 1; i <= months; i++) {
        const _ = moment(data).subtract(i * -1, 'month');
        const year = _.year();
        const month = _.month();
        const days = _.daysInMonth();

        result = result.concat(this._generate(year, month, days));
      }

      let next = moment(data).subtract((months + 1) * -1, 'month');

      const items = this.ROWS * this.COLS;
      if (result.length < items) {
        const nextYear = next.year();
        const nextMonth = next.month();

        result = result.concat(
          new Array(items - result.length)
            .fill()
            .map((_, key) => ({
              year: nextYear,
              month: nextMonth,
              date: key + 1
            }))
        );
      }

      return result;
    }

    return result;
  }

  get data() {
    const cols = this.COLS;

    const { year, month } = this.state.view;

    const current = moment(`${year} ${+month + 1}`);

    const result = []
      .concat(this.generate(current, this.settings.range, 'decrement'))
      .concat(this._generate(year, month, current.daysInMonth()))
      .concat(this.generate(current, this.settings.range, 'increment'));

    return new Array(Math.round(result.length / cols))
      .fill()
      .map((_, key) =>
        result.slice(key * cols, cols * (key + 1))
      );
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