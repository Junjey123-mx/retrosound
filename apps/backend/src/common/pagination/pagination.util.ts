export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function normalizePagination(
  rawPage?: number,
  rawLimit?: number,
  defaultLimit = 20,
): PaginationParams {
  const page = Math.max(1, Math.floor(Number(rawPage) || 1));
  const limit = Math.min(
    100,
    Math.max(1, Math.floor(Number(rawLimit) || defaultLimit)),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
