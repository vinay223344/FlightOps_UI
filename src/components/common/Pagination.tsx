import { Pagination as BsPagination } from 'react-bootstrap';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Server-side page navigator, themed to match the app's status/button palette. */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <BsPagination className="fo-pagination justify-content-center mt-3 mb-0">
      <BsPagination.First
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      />
      <BsPagination.Prev
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
      {pages.map((p) => (
        <BsPagination.Item
          key={p}
          active={p === currentPage}
          onClick={() => onPageChange(p)}
        >
          {p}
        </BsPagination.Item>
      ))}
      <BsPagination.Next
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
      <BsPagination.Last
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
      />
    </BsPagination>
  );
}
