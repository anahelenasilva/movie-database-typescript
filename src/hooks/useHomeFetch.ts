import { useState, useEffect } from 'react';

import API, { Movie } from '../API';
import { isPersistedState } from '../helpers';

const inititalState = {
  page: 0,
  results: [] as Movie[],
  total_pages: 0,
  total_results: 0
}

export const useHomeFetch = () => {
  const [state, setState] = useState(inititalState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchMovies = async (page: number, searchTerm = '') => {
    try {
      setError(false)
      setLoading(true)

      const movies = await API.fetchMovies(searchTerm, page)

      setState(prev => ({
        ...movies,
        results: page > 1 ? [...prev.results, ...movies.results] : [...movies.results]
      }))

    } catch (error) {
      setError(true)
      setLoading(false)
    }

    setLoading(false)
  }

  useEffect(() => {

    if (!searchTerm) {
      const sessionState = isPersistedState('homeState')
      if (sessionState) {
        setState(sessionState)
        return
      }
    }

    setState(inititalState)
    fetchMovies(1, searchTerm)

  }, [searchTerm]) // it will run only when searchTerm changes and on first render

  useEffect(() => {
    if (!isLoadingMore) return

    fetchMovies(state.page + 1, searchTerm)
    setIsLoadingMore(false) // to avoid multiple calls  when user scrolls down
  }, [isLoadingMore, state.page, searchTerm])

  useEffect(() => {

    if (!searchTerm) {
      sessionStorage.setItem('homeState', JSON.stringify(state))
    }

  }, [searchTerm, state])

  return { state, loading, error, setSearchTerm, searchTerm, setIsLoadingMore }
}
