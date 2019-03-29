import React from 'react';
import { render } from 'react-dom';

import App from './containers/App';

document.title = 'Calendar';

render(<App/>, document.getElementById('app'));
