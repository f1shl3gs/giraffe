// Libraries
import {FunctionComponent, useContext} from 'react'

// Components
import {Pagination} from './PaginationNav'
import {PaginationContext} from './pagination'

const PageControl: FunctionComponent = () => {
  const {
    paginationOffset,
    numberOfRowsOnCurrentPage,
    totalNumberOfRows,
    totalPages,
    setCurrentPage,
  } = useContext(PaginationContext)
  return (
    <div className={'visualization--simple-table--paging'}>
      {totalNumberOfRows && numberOfRowsOnCurrentPage > 0 && (
        <Pagination
          totalPages={totalPages}
          currentPage={Math.min(
            Math.floor(paginationOffset / numberOfRowsOnCurrentPage) + 1,
            totalPages,
          )}
          pageRangeOffset={1}
          onChange={setCurrentPage}
        />
      )}
    </div>
  )
}

export default PageControl
