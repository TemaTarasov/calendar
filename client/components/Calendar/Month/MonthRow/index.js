import React from 'react';
import './styles.scss';

import * as moment from 'moment';
import { getBlock, isEmpty } from '../../../../helpers';

function isHighlight(item, props) {
  const { view } = props;

  return item.year === view.year &&
    item.month === view.month
}

function isMonthStart(item) {
  return item.date === 1;
}

function getMonth({ month }) {
  return (
    <div className="calendar-month-row-item-month">
      {
        moment.monthsShort()[month]
      }
    </div>
  );
}

function getHighlight(flag) {
  return (
    <div className="calendar-month-row-highlight" data-show={flag}>
      {moment.months()[this.month]}

      <span>{this.year}</span>
    </div>
  );
}

export function MonthRow(props) {
  const { data, view, scrolling } = props;
  const currentRow = data.some(item => item.year === view.year && item.month === view.month && item.date === 1);
  const start = data.find(item => item.date === 1);

  return (
    <div className="calendar-month-row" data-current={currentRow}>
      {
        getBlock(
          !isEmpty(start),
          getHighlight.bind(start, scrolling)
        )
      }

      {
        data.map((col, key) => (
          <div className="calendar-month-row-item"
               key={key}
               data-start={isMonthStart(col)}
               data-highlight={isHighlight(col, props)}
          >
            <div className="calendar-month-row-item-date">
              {
                getBlock(
                  isMonthStart(col),
                  getMonth.bind(props, col)
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
