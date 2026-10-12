import { render } from 'preact';
import { App } from './app';

const app = document.createElement('div');
document.body.append(app);
render(<App />, app);
