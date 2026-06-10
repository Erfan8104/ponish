import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    isSearchModalOpen: false,
    searchQuery: '',
  }),

  actions: {
    openSearchModal() {
      this.isSearchModalOpen = true
    },
    closeSearchModal() {
      this.isSearchModalOpen = false
    },
    setSearchQuery(query: string) {
      this.searchQuery = query
    },
    resetSearch() {
      this.searchQuery = ''
    },
  },
})
