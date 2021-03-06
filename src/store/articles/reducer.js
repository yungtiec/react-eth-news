import _ from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import * as types from './actionTypes';
import * as sourcesSelectors from '../sources/reducer';
import * as sourceTypesSelectors from '../sourceTypes/reducer';
import * as datesSelectors from '../dates/reducer';
import * as paginationSelectors from '../pagination/reducer';
const moment = extendMoment(Moment);

const initialState = {
  articlesById: undefined,
}

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.ARTICLES_FETCHED:
      return { ...state, articlesById: action.articlesById }
    default:
      return state;
  }
}

export function getArticles(state) {
  const currentSourceType = sourceTypesSelectors.getCurrentSourceType(state);
  const currentSources = sourcesSelectors.getCurrentSources(state);
  const [offset, limit] = paginationSelectors.getCurrentPage(state);
  const articlesById = _.sortBy(state.articles.articlesById, [function(o) { return -o.date }]);
  const filterBySourceTypeBound = filterBySourceType.bind(null, currentSourceType, articlesById);
  const filterBySourcesBound = filterBySources.bind(null, currentSources, articlesById);
  const filterByPageBound = filterByPage.bind(null, offset, limit, articlesById);
  const filters = _.flow([filterBySourceTypeBound, filterBySourcesBound, filterByPageBound]);
  const articlesIdArray = filters(_.keys(articlesById))
  return [articlesById, articlesIdArray];
}

export function getArticlesCountAfterFilter(state) {
  const currentSourceType = sourceTypesSelectors.getCurrentSourceType(state);
  const currentSources = sourcesSelectors.getCurrentSources(state);
  const articlesById = _.sortBy(state.articles.articlesById, [function(o) { return -o.date }]);
  const filterBySourceTypeBound = filterBySourceType.bind(null, currentSourceType, articlesById);
  const filterBySourcesBound = filterBySources.bind(null, currentSources, articlesById);
  const filters = _.flow([filterBySourceTypeBound, filterBySourcesBound]);
  const articlesIdArray = filters(_.keys(articlesById))
  return articlesIdArray.length;
}

export function getArticlesGroupByDate(state) {
  var articlesById, articlesIdArray, articlesByDate, dateKeys;
  articlesById = state.articles.articlesById;
  articlesIdArray = _.keys(articlesById);
  articlesByDate = _.groupBy(_.values(articlesById), o => moment.unix(o.date).format('YYYYMM'));
  return _.values(articlesByDate).map(articles => {
    return {
      date: moment.unix(articles[0].date).format('YYYY-MM'),
      msm: articles.filter(a => a.type === 'msm').length,
      crypto: articles.filter(a => a.type === 'crypto').length,
      all: articles.length
    }
  }).filter(articles => articles.date !== 'Invalid date')
}

function filterBySourceType(currentSourceType, articlesById, articlesIdArray) {
  return currentSourceType === 'all' ?
    articlesIdArray :
    _.filter(articlesIdArray, articleId => articlesById[articleId].type === currentSourceType);
}

function filterBySources(currentSources, articlesById, articlesIdArray) {
  if (!currentSources || !currentSources.length) return articlesIdArray;
  return _.filter(articlesIdArray, articleId => {
    return currentSources.indexOf(articlesById[articleId].source) !== -1;
  });
}

function filterByDate(currentDateRange, articlesById, articlesIdArray) {
  if (!(currentDateRange.startDate || currentDateRange.endDate)) {
    return articlesIdArray
  } else {
    const endDate = currentDateRange.endDate ?
      currentDateRange.endDate : null;
    const startDate = currentDateRange.startDate ?
      currentDateRange.startDate : null;
    const range = moment.range(startDate, endDate);
    return _.filter(articlesIdArray, articleId => {
      return range.contains(
        moment.unix(articlesById[articleId].date), { exclusive: false })
    })
  }

}

function filterByPage(offset, limit, articlesById, articlesIdArray) {
  return articlesIdArray.slice(offset * limit, offset * limit + limit);
}
