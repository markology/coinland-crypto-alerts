import React, {Component, PropTypes} from 'react';
import MainSection from '../components/MainSection';
import style from './App.css';

export default class App extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className={style.normal}>
        <MainSection />
      </div>
    );
  }
}
