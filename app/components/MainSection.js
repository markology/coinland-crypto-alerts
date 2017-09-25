import React, {Component} from 'react';
import {getMarketSummaries, buildMarketSummaries} from '../utils/getMarketSummaries';
import {updateChromeStorage, removeChromeStorageAlarm} from '../utils/chrome-storage';
import styles from './MainSection.css';

export default class MainSection extends Component {
  state = {
    marketSummaries: {},
    filteredSummaries: {},
    filter: '',
    hasFiltered: false,
    debounce: false,
    timeout: null,
    targetCoin: '',
    showCoinAlarms: false,
    showMyAlarms: false,
    myAlarms: null,
    tempAlarm: null
  }

  componentWillMount = () => {
    getMarketSummaries().then((msRes) => {
      const data = buildMarketSummaries.call(this, msRes.data.result);
      this.setState({marketSummaries: data});
    });

    chrome.storage.sync.get(
      'myAlarms',
      ({myAlarms}) => {
        this.setState({myAlarms: myAlarms || {}});
        return null;
      });
  }

  createAlarm = () => {
    chrome.storage.sync.get('myAlarms', ({myAlarms}) => {
      /*eslint-disable no-param-reassign*/
      myAlarms = myAlarms || {};

      let coinAlarms;
      if (myAlarms[this.state.targetCoin]) {
        coinAlarms = [
          ...myAlarms[this.state.targetCoin],
          ...[this.state.tempAlarm]
        ];
      } else {
        coinAlarms = [...[this.state.tempAlarm], ...[]];
      }

      const myAlarm = {
        [this.state.targetCoin]: coinAlarms
      };

      const tempAlarms = {...myAlarms, ...myAlarm};

      this.setState({myAlarms: tempAlarms}, () => {
        updateChromeStorage('myAlarms', tempAlarms);
        this.setState({showCoinAlarms: false, targetCoin: ''});
      });
    });
  }

  filter = (obj, filter) => {
    const result = {};
    let key;
    /*eslint-disable no-restricted-syntax*/
    /*eslint-disable no-prototype-builtins*/
    for (key in obj) {
      if (obj.hasOwnProperty(key) && key.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
        result[key] = obj[key];
      }
    }

    return result;
  }

  handleChange = (evt) => {
    if (this.state.debounce) {
      clearTimeout(this.timeout);
    }
    const y = evt.target.value;

    this.setState({debounce: true, hasFiltered: true}); // say in the middle of debounce
    this.timeout = setTimeout(() => { // in .4s trigger filter
      this.setState({debounce: false});
      const filteredSummaries = this.filter(this.state.marketSummaries, y);
      this.setState({filter: y, filteredSummaries});
    }, 400);
  };

  showCoinAlarms = (ico) => {
    this.setState({tempAlarm: {operator: '=', btcValue: this.state.marketSummaries[ico].Last}, targetCoin: ico, showCoinAlarms: true});
  }

  render() {
    const toDisplay = this.state.hasFiltered ? 'filteredSummaries' : 'marketSummaries';

    if (this.state.showMyAlarms) {
      return (
        <div>
          <div id="wonderpush-subscription-switch" data-sentence="Receive our latest news by web push: " data-on="YES" data-off="NO" />
          <div
            onClick={() => {
              this.setState({showMyAlarms: false});
            }}
            className={styles.x}
          >
            x
          </div>
          <h2 className={styles['my-alarms-header']}>My Alarms</h2>
          {
            Object.keys(this.state.myAlarms).map((ico) => {
              const myCoinAlarms = this.state.myAlarms[ico];

              console.warn({myCoinAlarms});

              return (
                <div className={styles['my-alarms-coin']}>
                  <h3 className={styles['my-alarms-coin-header']}>{ico}</h3>
                  {
                    myCoinAlarms.map((myCoinAlarm, idx) => (
                      <div className={styles['my-alarms-alarm']}>
                        <div className={styles['my-alarms-operator']}>{myCoinAlarm.operator}</div>
                        <div className={styles['my-alarms-btcValue']}>{myCoinAlarm.btcValue}</div>
                        <button className={styles['my-alarms-remove']} onClick={() => removeChromeStorageAlarm.call(this, 'myAlarms', ico, idx)} >remove</button>
                      </div>
                    ))
                  }
                </div>
              );
            })
          }
        </div>
      );
    }
    return (
      <div>
        {
          !this.state.showCoinAlarms || !this.state.targetCoin ?
            <header>
              <div>
                <input
                  className={styles.filter}
                  type="text"
                  placeholder="filter by name..."
                  autoFocus="true"
                  onChange={this.handleChange}
                />
                <div className={styles['my-alarms-button']} onClick={() => { this.setState({targetCoin: '', showCoinAlarms: false, showMyAlarms: true}); }}>My Alarms</div>
              </div>
              <div className={styles['icos-header']}>
                <div className={styles['ico-name']}>ICO</div>
                <div className={styles['ico-last']}>LAST</div>
                <button className={styles['ico-button']}>ACTIONS</button>
              </div>
              <div className={styles.icos}>
                {
                 Object.keys(this.state[toDisplay]).map((ico) => {
                   const summary = this.state[toDisplay][ico];

                   return (
                     <div className={styles.ico}>
                       <div className={styles['ico-name']}>{ico}</div>
                       <div className={styles['ico-last']}>{summary.Last}</div>
                       <button onClick={() => this.showCoinAlarms(ico)} className={styles['ico-button']}>Set Alarm</button>
                     </div>
                   );
                 })
               }
              </div>
            </header> :
            <div>
              <div
                onClick={() => {
                  this.setState({showCoinAlarms: false, targetCoin: ''});
                }}
                className={styles.x}
              >
                x
              </div>
              <div className={styles['set-alarm-preline']}>I want to be notified when <strong>{this.state.targetCoin}</strong></div>
              <div className={styles['temp-alarm']} >
                <select
                  onChange={
                    e => this.setState({
                      tempAlarm: {
                        ...this.state.tempAlarm,
                        ...{operator: e.target.value}
                      }})}
                  value={this.state.tempAlarm.operator}
                  className={styles.operator}
                >
                  <option>{'<'}</option>
                  <option>{'='}</option>
                  <option>{'>'}</option>
                </select>
                <input
                  type="number"
                  placeholder={this.state.marketSummaries[this.state.targetCoin].Last}
                  value={this.state.tempAlarm.btcValue}
                  onChange={e => this.setState({
                    tempAlarm: {
                      ...this.state.tempAlarm,
                      ...{btcValue: e.target.value}
                    }})}
                  className={styles['bitcoin-value-input']}
                />
              </div>
              <button className={styles['set-alarm']} onClick={() => this.createAlarm()}>Set Alarm</button>
            </div>
            }
      </div>
    );
  }
}
