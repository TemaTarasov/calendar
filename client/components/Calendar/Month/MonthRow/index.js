import React, { PureComponent } from 'react';
import './styles.scss';

import * as moment from 'moment';

import Mixin from '../../Mixin';
import { set, bind, getBlock, isEmpty } from '../../../../helpers';

export class MonthRow extends Mixin(PureComponent) {
  constructor(props) {
    super(props);

    this.state = {
      month: {
        className: ''
      }
    };

    this.row = React.createRef();

    bind(this, [
      'handleScroll'
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
    const { height, scrollTop, offsetTop } = this.content;
    const offset = this.row.current.offsetTop - offsetTop;
    const item = height / 6;

    if (this.start) {
      if (scrollTop > offset - item && scrollTop < (offset + (height - item))) {
        if (offset > scrollTop) {
          let value = (offset - scrollTop) * 2;

          if (value < 106) {
            this.setState({
              month: {
                className: 'calendar-month-row-highlight--fixed',
                style: {
                  top: `${value}px`
                }
              }
            });
          } else {
            this.setState({
              month: {
                className: '',
                style: {}
              }
            });
          }
        } else {
          this.setState({
            month: {
              className: 'calendar-month-row-highlight--fixed',
              style: {
                top: 0
              }
            }
          });
        }
      } else {
        this.setState({
          month: {
            className: '',
            style: {}
          }
        });
      }
    }
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

  getHighlight(start, flag) {
    const { month: { className, style } } = this.state;

    return (
      <div className={`calendar-month-row-highlight ${className}`} style={style} data-show={flag}>
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

  render() {
    const { data, scrolling } = this.props;
    const start = this.start;

    return (
      <div ref={this.row} className="calendar-month-row" data-current={this.isCurrentRow}>
        {
          getBlock(
            !isEmpty(start),
            this.getHighlight.bind(this, start, scrolling)
          )
        }

        {
          data.map((col, key) => (
            <div className="calendar-month-row-item"
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

              <div className="calendar-month-row-item-content">

              </div>
            </div>

          ))
        }
      </div>
    );
  }
}
