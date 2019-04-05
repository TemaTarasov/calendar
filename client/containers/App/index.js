import React from 'react';
import './styles.scss';

import { Calendar } from '../../components/Calendar';

function onRender({ year, month, date }) {}

export default function () {
  return (
    <div style={{ height: '100vh' }}>
      <Calendar
        onRender={onRender}
      />
    </div>
  );
}
