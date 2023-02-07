import '../index.html';
import './components/_add_favicon';
import ControllerMain from './components/controller/_ControllerMain';
import './_global.scss';

const APP = new ControllerMain();
APP.init();
