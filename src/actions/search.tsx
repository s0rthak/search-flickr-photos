import api, { constructSearchURL } from '../utils/axiosInstance';
import { Dispatch } from 'redux';
import { SearchActions } from '../constants/ActionTypes';
// import { CrashReporter } from '../libs/crashReporter';

function updateSearchQueries (searchArray: any, newQuery: string) {
    // Bug in TS to not allow normal spread on Set
    const newSavedSearches = [...Array.from(searchArray), newQuery];
    localStorage.setItem('previousSearches', JSON.stringify(newSavedSearches));
}

// Optimize already fetched queries
export const fetchSearchResults = (searchQuery: string) => (dispatch: Dispatch, getState: any) => {
    const previousSearches = getState().search.previousSearches;
    updateSearchQueries(previousSearches, searchQuery);
    dispatch({
        type: SearchActions.FETCH_RESULTS,
        searchQuery,
        pageNumber: 1
    });
    const searchURL = constructSearchURL({searchQuery, pageNumber: 1});
    api.get(searchURL)
    .then((res: any) => {
        const data = res.data;
        dispatch({
            type: SearchActions.FETCHED_RESULTS,
            searchResults: data.photos.photo,
            pages: data.photos.pages
        });
    })
    .catch((err: any) => {
        console.log(err.response);
    });
};

export const fetchMoreSearchResults = () => (dispatch: Dispatch, getState: any) => {
    const searchQuery = getState().search.searchQuery;
    const pageNumber = getState().search.pageNumber + 1;
    const searchURL = constructSearchURL({searchQuery, pageNumber});
    dispatch({
        type: SearchActions.FETCH_MORE_RESULTS,
        pageNumber
    });
    api.get(searchURL)
    .then((res: any) => {
        const data = res.data;
        dispatch({
            type: SearchActions.FETCHED_MORE_RESULTS,
            searchResults: data.photos.photo
        });
    })
    .catch((err: any) => {
        console.log(err.response);
    });
};

export const lookupPreviousSearches = () => (dispatch: Dispatch) => {
    const previousSearches = localStorage.getItem('previousSearches');
    // Add checks to see if the parsed JSON is an array
    if (previousSearches) {
        dispatch({
            type: SearchActions.POPULATE_PREVIOUS_SEARCHES,
            previousSearches: JSON.parse(previousSearches)
        });
    }
};

export const clearPreviousSearches = () => (dispatch: Dispatch) => {
    // Explore if deleteItem will be better
    localStorage.setItem('previousSearches', JSON.stringify([]));
    dispatch({
        type: SearchActions.CLEAR_PREVIOUS_SEARCHES
    });
};