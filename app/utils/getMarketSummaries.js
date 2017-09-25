import axios from 'axios';

export const buildMarketSummaries = function (summaries) {
  const marketSummaries = {};

  summaries.forEach((summary) => {
    const summaryConversion = summary.MarketName.split('-');
    const ico = summaryConversion[1];
    marketSummaries[ico] = {Last: summary.Last};
  });

  return marketSummaries;
};

export const getMarketSummaries = function () {
  return axios.get('http://18.221.164.218:3000/api/bittrex/getmarketsummaries');
};
