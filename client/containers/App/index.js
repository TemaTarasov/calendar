import React from 'react';
import './styles.scss';

import { Calendar } from '../../components/Calendar';

function onRender({ year, month, date }) {
  return (
    <div>
      <h2>{year}</h2>
      <h1>{month}</h1>
      <p>{date}</p>
    </div>
  );
}

export default function () {
  return (
    <div style={{ height: '100vh' }}>
      <Calendar
        onRender={onRender}
      />
    </div>
  );
}
